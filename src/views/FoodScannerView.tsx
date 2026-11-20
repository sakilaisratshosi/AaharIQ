import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  aggregateItemNutrients,
  buildConsistencyChecks,
  buildHealthAnalysisForItems,
  evaluateFoodSafetyReport,
  FOOD_SCANNER_DATABASE,
  LAB_VERIFICATION_DISCLAIMER,
  LAB_VERIFICATION_DISCLAIMER_BN,
  matchReferenceFood,
  scaleNutrientProfile,
} from '../data/foodScannerDatabase';
import {
  FoodScanMode,
  FoodScanReport,
  PackagedFoodDetails,
  SafetyStatusCode,
  ScannedFoodItem,
} from '../types';
import {
  Camera,
  Upload,
  ScanLine,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Barcode,
  SwitchCamera,
  X,
  Plus,
  Trash2,
  HeartPulse,
  Microscope,
  Download,
  History,
  GitCompare,
  Info,
  Edit3,
  FileJson,
  FileText,
  BookmarkCheck,
  PackageCheck,
  Eye,
} from 'lucide-react';

async function compressImageDataUrl(
  sourceDataUrl: string,
  maxDim = 1280,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('Invalid or unreadable image file.'));
    img.src = sourceDataUrl;
  });
}

export const FoodScannerView: React.FC = () => {
  const { language, scanHistory, saveScanReport, deleteScanReport, clearScanHistory, showNotification } = useApp();
  const isBn = language === 'bn';

  // Scanner capture & input state
  const [scanMode, setScanMode] = useState<FoodScanMode>('auto');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [thumbnailImage, setThumbnailImage] = useState<string | null>(null);
  const [foodHint, setFoodHint] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [barcodeStatus, setBarcodeStatus] = useState<string | null>(null);

  // Camera state
  const [cameraOpen, setCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Active report & UI tabs
  const [activeReport, setActiveReport] = useState<FoodScanReport | null>(null);
  const [activeTab, setActiveTab] = useState<'scanner' | 'history' | 'compare'>('scanner');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [newItemQuery, setNewItemQuery] = useState('');

  // Stop camera cleanly on unmount or close
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    setCameraError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        isBn
          ? 'এই ব্রাউজারে সরাসরি ক্যামেরা সমর্থিত নয়। অনুগ্রহ করে গ্যালারি থেকে ছবি আপলোড করুন।'
          : 'Live camera access is unavailable in this browser. Please upload a photo from gallery.'
      );
      return;
    }

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 60);
    } catch (err: any) {
      setCameraOpen(false);
      setCameraError(
        isBn
          ? 'ক্যামেরার অনুমতি পাওয়া যায়নি বা ক্যামেরা চালু হয়নি। ছবি আপলোড ব্যবহার করুন।'
          : err?.name === 'NotAllowedError'
          ? 'Camera permission denied. Allow camera access or upload a photo from your device.'
          : 'Could not start camera. Please upload a food photo instead.'
      );
    }
  };

  const captureFromCamera = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, width, height);
    const rawDataUrl = canvas.toDataURL('image/jpeg', 0.9);

    // Try browser native BarcodeDetector if available
    await tryDetectBarcodeFromSource(canvas);

    stopCamera();
    await applyCompressedPhoto(rawDataUrl);
  };

  const tryDetectBarcodeFromSource = async (source: ImageBitmapSource) => {
    try {
      const BD = (window as any).BarcodeDetector;
      if (typeof BD !== 'function') return;
      const detector = new BD({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'] });
      const codes = await detector.detect(source);
      if (Array.isArray(codes) && codes[0]?.rawValue) {
        const clean = String(codes[0].rawValue).replace(/[^0-9]/g, '');
        if (clean.length >= 8) {
          setBarcodeInput(clean);
          setScanMode('packaged');
          setBarcodeStatus(
            isBn ? `বারকোড শনাক্ত হয়েছে: ${clean}` : `Barcode detected in frame: ${clean}`
          );
        }
      }
    } catch {
      // ignore if BarcodeDetector unsupported for source
    }
  };

  const applyCompressedPhoto = async (rawDataUrl: string) => {
    setScanError(null);
    const full = await compressImageDataUrl(rawDataUrl, 1280, 0.85);
    const thumb = await compressImageDataUrl(rawDataUrl, 360, 0.72);
    setCapturedImage(full);
    setThumbnailImage(thumb);
  };

  const handleFileSelected = async (file: File | undefined) => {
    if (!file) return;
    setScanError(null);
    if (!file.type.startsWith('image/')) {
      setScanError(
        isBn
          ? 'অনুগ্রহ করে একটি বৈধ ছবি (JPG, PNG, WebP) নির্বাচন করুন।'
          : 'Please choose a valid image file (JPG, PNG, or WebP).'
      );
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setScanError(
        isBn ? 'ছবির আকার ১৫ মেগাবাইটের বেশি।' : 'Selected image exceeds 15MB limit.'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const result = String(reader.result || '');
        await applyCompressedPhoto(result);
        const img = new Image();
        img.onload = () => {
          void tryDetectBarcodeFromSource(img);
        };
        img.src = result;
      } catch {
        setScanError(
          isBn ? 'ছবিটি প্রসেস করা যায়নি। অন্য একটি ছবি দিন।' : 'Could not read image file. Try another photo.'
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeFood = async (overrideHint?: string, overrideBarcode?: string) => {
    const effectiveHint = overrideHint !== undefined ? overrideHint : foodHint.trim();
    const effectiveBarcode = overrideBarcode !== undefined ? overrideBarcode : barcodeInput.trim();

    if (!capturedImage && !effectiveHint && !effectiveBarcode) {
      setScanError(
        isBn
          ? 'বিশ্লেষণের জন্য খাবারের ছবি তুলুন/আপলোড করুন, অথবা বারকোড বা খাবারের নাম দিন।'
          : 'Capture or upload a food photo, or enter a barcode or food name to scan.'
      );
      return;
    }

    setIsScanning(true);
    setScanError(null);

    try {
      const response = await fetch('/api/food-scanner/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: capturedImage || undefined,
          scanMode,
          barcode: effectiveBarcode || undefined,
          foodHint: effectiveHint || undefined,
          language,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(isBn && data.errorBn ? data.errorBn : data.error || 'Analysis failed.');
      }

      const report: FoodScanReport = {
        ...data.report,
        imageDataUrl: thumbnailImage || undefined,
      };
      setActiveReport(report);
      setActiveTab('scanner');
    } catch (err: any) {
      setScanError(
        err?.message ||
          (isBn ? 'বিশ্লেষণ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।' : 'Failed to analyze food. Please try again.')
      );
    } finally {
      setIsScanning(false);
    }
  };

  const handleBarcodeLookupOnly = async () => {
    const clean = barcodeInput.replace(/[^0-9]/g, '');
    if (clean.length < 8) {
      setBarcodeStatus(
        isBn ? '৮–১৪ সংখ্যার বারকোড দিন।' : 'Enter an 8–14 digit barcode number.'
      );
      return;
    }
    setScanMode('packaged');
    setBarcodeStatus(isBn ? 'বারকোড খোঁজা হচ্ছে...' : 'Looking up barcode...');
    await handleAnalyzeFood(foodHint, clean);
    setBarcodeStatus(null);
  };

  // Recalculate entire activeReport cleanly whenever user edits items, portion grams, packaged fields, or visual cues
  const recalculateReport = (
    nextItems: ScannedFoodItem[],
    nextPackaged?: PackagedFoodDetails,
    nextVisual = activeReport?.visualInspection
  ) => {
    if (!activeReport || !nextVisual) return;
    const totals = aggregateItemNutrients(nextItems);
    const packagedWithChecks = nextPackaged
      ? { ...nextPackaged, consistencyChecks: buildConsistencyChecks(nextPackaged) }
      : undefined;
    const healthAnalysis = buildHealthAnalysisForItems(nextItems, totals, packagedWithChecks);
    const safetyReport = evaluateFoodSafetyReport({
      scanMode: activeReport.scanMode,
      visualInspection: nextVisual,
      packagedDetails: packagedWithChecks,
      items: nextItems,
    });

    setActiveReport({
      ...activeReport,
      detectedTitle: nextItems.map((i) => i.name).join(' + ') || activeReport.detectedTitle,
      detectedTitleBn: nextItems.map((i) => i.nameBn).join(' + ') || activeReport.detectedTitleBn,
      items: nextItems,
      totals,
      healthAnalysis,
      visualInspection: nextVisual,
      packagedDetails: packagedWithChecks,
      safetyReport,
    });
  };

  const handleItemPortionChange = (itemId: string, newGrams: number) => {
    if (!activeReport) return;
    const safeGrams = Math.max(5, Math.min(5000, Math.round(newGrams || 0)));
    const nextItems = activeReport.items.map((item) => {
      if (item.id !== itemId) return item;
      const scaled = scaleNutrientProfile(item.nutritionPer100g, safeGrams);
      return {
        ...item,
        portionGrams: safeGrams,
        servingLabel: `${safeGrams}g (User Adjusted)`,
        servingLabelBn: `${safeGrams} গ্রাম (সংশোধিত)`,
        nutrition: scaled,
        measuredVsEstimatedNote:
          safeGrams !== item.estimatedPortionGrams
            ? `User-adjusted portion (${safeGrams}g vs AI estimate ${item.estimatedPortionGrams}g).`
            : item.measuredVsEstimatedNote,
        measuredVsEstimatedNoteBn:
          safeGrams !== item.estimatedPortionGrams
            ? `ব্যবহারকারীর সংশোধিত ওজন (${safeGrams} গ্রাম বনাম এআই অনুমান ${item.estimatedPortionGrams} গ্রাম)।`
            : item.measuredVsEstimatedNoteBn,
      };
    });
    recalculateReport(nextItems, activeReport.packagedDetails);
  };

  const handleSwapFoodItem = (itemId: string, refId: string) => {
    if (!activeReport) return;
    const ref = FOOD_SCANNER_DATABASE.find((r) => r.id === refId);
    if (!ref) return;
    const nextItems = activeReport.items.map((item) => {
      if (item.id !== itemId) return item;
      const grams = item.portionGrams || ref.defaultPortionGrams;
      return {
        ...item,
        name: ref.name,
        nameBn: ref.nameBn,
        category: ref.category,
        categoryBn: ref.categoryBn,
        referenceMatchId: ref.id,
        dataSource: 'verified_reference' as const,
        sourceLabel: ref.sourceLabel,
        sourceLabelBn: ref.sourceLabelBn,
        confidence: 95,
        nutritionPer100g: ref.per100g,
        nutrition: scaleNutrientProfile(ref.per100g, grams),
        measuredVsEstimatedNote: 'Matched to user-confirmed INFS/USDA reference item.',
        measuredVsEstimatedNoteBn: 'ব্যবহারকারী নিশ্চিতকৃত INFS/USDA ডেটাবেজ অনুযায়ী হিসাব।',
      };
    });
    setEditingItemId(null);
    recalculateReport(nextItems, activeReport.packagedDetails);
  };

  const handleRenameFoodItem = (itemId: string, customName: string) => {
    if (!activeReport || !customName.trim()) return;
    const matched = matchReferenceFood(customName);
    const nextItems = activeReport.items.map((item) => {
      if (item.id !== itemId) return item;
      if (matched) {
        return {
          ...item,
          name: matched.name,
          nameBn: matched.nameBn,
          category: matched.category,
          categoryBn: matched.categoryBn,
          referenceMatchId: matched.id,
          dataSource: 'verified_reference' as const,
          sourceLabel: matched.sourceLabel,
          sourceLabelBn: matched.sourceLabelBn,
          nutritionPer100g: matched.per100g,
          nutrition: scaleNutrientProfile(matched.per100g, item.portionGrams),
        };
      }
      return { ...item, name: customName.trim(), nameBn: customName.trim() };
    });
    setEditingItemId(null);
    recalculateReport(nextItems, activeReport.packagedDetails);
  };

  const handleAddItemToPlate = () => {
    if (!activeReport || !newItemQuery.trim()) return;
    const matched = matchReferenceFood(newItemQuery.trim());
    if (!matched) {
      showNotification(
        isBn
          ? 'ডেটাবেজে মেলেনি — তালিকা থেকে একটি খাদ্য বেছে নিন।'
          : 'Not matched in reference DB — try a staple like Rice, Dal, Fish, Shak, Egg, Milk.'
      );
      return;
    }
    const newItem: ScannedFoodItem = {
      id: `item_${Date.now()}_add`,
      name: matched.name,
      nameBn: matched.nameBn,
      category: matched.category,
      categoryBn: matched.categoryBn,
      portionGrams: matched.defaultPortionGrams,
      estimatedPortionGrams: matched.defaultPortionGrams,
      servingLabel: matched.servingLabel,
      servingLabelBn: matched.servingLabelBn,
      confidence: 95,
      dataSource: 'verified_reference',
      sourceLabel: matched.sourceLabel,
      sourceLabelBn: matched.sourceLabelBn,
      referenceMatchId: matched.id,
      nutritionPer100g: matched.per100g,
      nutrition: scaleNutrientProfile(matched.per100g, matched.defaultPortionGrams),
      measuredVsEstimatedNote: 'Added manually using verified reference nutrition.',
      measuredVsEstimatedNoteBn: 'যাচাইকৃত রেফারেন্স ডেটা দিয়ে ম্যানুয়ালি যোগ করা হয়েছে।',
    };
    setNewItemQuery('');
    recalculateReport([...activeReport.items, newItem], activeReport.packagedDetails);
  };

  const handleRemoveItem = (itemId: string) => {
    if (!activeReport || activeReport.items.length <= 1) return;
    const nextItems = activeReport.items.filter((i) => i.id !== itemId);
    recalculateReport(nextItems, activeReport.packagedDetails);
  };

  const handlePackagedFieldChange = (field: keyof PackagedFoodDetails, value: string) => {
    if (!activeReport) return;
    const current: PackagedFoodDetails = activeReport.packagedDetails || {
      additives: [],
      allergens: [],
      consistencyChecks: [],
    };
    const updated: PackagedFoodDetails = {
      ...current,
      [field]: value || undefined,
    };
    recalculateReport(activeReport.items, updated);
  };

  const handleToggleVisualDefect = (
    field: 'moldOrSpoilageDetected' | 'unusualAppearanceDetected' | 'packagingDamageDetected'
  ) => {
    if (!activeReport) return;
    const v = activeReport.visualInspection;
    const nextVal = !v[field];
    const updatedVisual = {
      ...v,
      [field]: nextVal,
      moldOrSpoilageNote:
        field === 'moldOrSpoilageDetected' && nextVal
          ? 'User flagged visible mold or spoilage concern.'
          : v.moldOrSpoilageNote,
      moldOrSpoilageNoteBn:
        field === 'moldOrSpoilageDetected' && nextVal
          ? 'ব্যবহারকারী ছত্রাক বা পচনের সন্দেহ চিহ্নিত করেছেন।'
          : v.moldOrSpoilageNoteBn,
      unusualAppearanceNote:
        field === 'unusualAppearanceDetected' && nextVal
          ? 'User flagged unusual discoloration or odor/texture cue.'
          : v.unusualAppearanceNote,
      unusualAppearanceNoteBn:
        field === 'unusualAppearanceDetected' && nextVal
          ? 'ব্যবহারকারী অস্বাভাবিক রঙ বা গঠন চিহ্নিত করেছেন।'
          : v.unusualAppearanceNoteBn,
      packagingDamageNote:
        field === 'packagingDamageDetected' && nextVal
          ? 'User flagged damaged, swollen, or unsealed packaging.'
          : v.packagingDamageNote,
      packagingDamageNoteBn:
        field === 'packagingDamageDetected' && nextVal
          ? 'ব্যবহারকারী প্যাকেজিং ক্ষতিগ্রস্ত বা খোলা সিল চিহ্নিত করেছেন।'
          : v.packagingDamageNoteBn,
    };
    recalculateReport(activeReport.items, activeReport.packagedDetails, updatedVisual);
  };

  // Export JSON & TXT reports
  const handleExportReport = (format: 'json' | 'txt') => {
    if (!activeReport) return;
    const safeSlug = activeReport.detectedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 32) || 'food-scan';
    let content = '';
    let mime = 'application/json';
    let ext = 'json';

    if (format === 'json') {
      const exportObj = { ...activeReport, imageDataUrl: undefined };
      content = JSON.stringify(exportObj, null, 2);
    } else {
      mime = 'text/plain;charset=utf-8';
      ext = 'txt';
      const t = activeReport.totals;
      content = [
        '============================================================',
        'NUTRISMART AI — FOOD SCANNER, NUTRITION & SAFETY REPORT',
        '============================================================',
        `Scan ID: ${activeReport.id}`,
        `Date & Time: ${activeReport.displayDate}`,
        `Identified Dish: ${activeReport.detectedTitle} (${activeReport.detectedTitleBn})`,
        `Overall Confidence: ${activeReport.overallConfidence}%`,
        '',
        '--- NUTRITION SUMMARY (CURRENT PORTION) ---',
        `Estimated Calories: ${t.calories} kcal`,
        `Protein: ${t.proteinG} g | Carbohydrates: ${t.carbsG} g`,
        `Total Fat: ${t.totalFatG} g (Saturated Fat: ${t.saturatedFatG} g)`,
        `Dietary Fiber: ${t.fiberG} g | Sugar: ${t.sugarG} g | Sodium: ${t.sodiumMg} mg`,
        '',
        '--- IDENTIFIED ITEMS ---',
        ...activeReport.items.map(
          (it, i) =>
            `${i + 1}. ${it.name} (${it.nameBn}) — ${it.portionGrams}g | ${it.nutrition.calories} kcal | Source: ${it.sourceLabel}`
        ),
        '',
        '--- FOOD SAFETY & AUTHENTICITY REPORT ---',
        `Status: ${activeReport.safetyReport.statusText}`,
        `Reasons: ${activeReport.safetyReport.reasons.join(' | ')}`,
        `Missing Fields: ${
          activeReport.safetyReport.missingVerificationFields.length > 0
            ? activeReport.safetyReport.missingVerificationFields.join(', ')
            : 'None flagged'
        }`,
        `Lab Recommendation: ${activeReport.safetyReport.labTestingRecommendation}`,
        '',
        `MANDATORY NOTICE: ${LAB_VERIFICATION_DISCLAIMER}`,
      ].join('\n');
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aahariq-scan-${safeSlug}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification(
      isBn ? `রিপোর্ট (${ext.toUpperCase()}) ডাউনলোড হয়েছে` : `Exported ${ext.toUpperCase()} report`
    );
  };

  // Macro chart computations
  const macroChart = useMemo(() => {
    if (!activeReport) return { proteinPct: 0, carbsPct: 0, fatPct: 0 };
    const pKcal = activeReport.totals.proteinG * 4;
    const cKcal = activeReport.totals.carbsG * 4;
    const fKcal = activeReport.totals.totalFatG * 9;
    const total = pKcal + cKcal + fKcal || 1;
    const proteinPct = Math.round((pKcal / total) * 100);
    const carbsPct = Math.round((cKcal / total) * 100);
    const fatPct = Math.max(0, 100 - proteinPct - carbsPct);
    return { proteinPct, carbsPct, fatPct };
  }, [activeReport]);

  const safetyBadgeStyle = (status: SafetyStatusCode) => {
    if (status === 'consistent') {
      return {
        container: 'bg-emerald-50 border-emerald-200 text-emerald-950',
        badge: 'bg-emerald-700 text-white',
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />,
      };
    }
    if (status === 'needs_checking') {
      return {
        container: 'bg-amber-50 border-amber-300 text-amber-950',
        badge: 'bg-amber-600 text-white',
        icon: <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />,
      };
    }
    return {
      container: 'bg-rose-50 border-rose-300 text-rose-950',
      badge: 'bg-rose-700 text-white',
      icon: <ShieldAlert className="w-5 h-5 text-rose-700 shrink-0" />,
    };
  };

  const toggleCompareSelection = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const comparedReports = compareIds
    .map((id) => scanHistory.find((r) => r.id === id))
    .filter((r): r is FoodScanReport => Boolean(r));

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-[#16382C] via-[#1E4A3B] to-[#122E24] text-white p-6 sm:p-8 rounded-2xl border border-emerald-800/40 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-300 uppercase tracking-wider">
              <ScanLine className="w-4 h-4 text-amber-300" />
              <span>
                {isBn
                  ? 'জেমিনাই ভিশন · OpenFoodFacts · INFS বাংলাদেশ ডেটাবেজ'
                  : 'Gemini Vision · OpenFoodFacts · INFS Bangladesh Tables'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {isBn ? 'এআই ফুড স্ক্যানার ও পুষ্টি বিশ্লেষক' : 'Food Scanner & Nutrition Analyzer'}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              {isBn
                ? 'খাবারের ছবি তুলুন বা আপলোড করুন, বারকোড স্ক্যান করুন এবং ম্যাক্রো-মাইক্রো পুষ্টিমান, স্বাস্থ্য উপকারিতা ও খাদ্য নিরাপত্তার প্রাথমিক মূল্যায়ন দেখুন।'
                : 'Scan cooked meals, fruits, vegetables, or packaged food labels with camera or gallery upload for multi-item nutrition estimation, barcode verification, and food safety checks.'}
            </p>
          </div>

          {/* Sub-view Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('scanner')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
                activeTab === 'scanner'
                  ? 'bg-white text-emerald-950'
                  : 'bg-emerald-900/60 text-emerald-100 hover:bg-emerald-800'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{isBn ? 'স্ক্যানার' : 'Scanner'}</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
                activeTab === 'history'
                  ? 'bg-white text-emerald-950'
                  : 'bg-emerald-900/60 text-emerald-100 hover:bg-emerald-800'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>
                {isBn ? 'ইতিহাস' : 'History'} ({scanHistory.length})
              </span>
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
                activeTab === 'compare'
                  ? 'bg-white text-emerald-950'
                  : 'bg-emerald-900/60 text-emerald-100 hover:bg-emerald-800'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>
                {isBn ? 'তুলনা করুন' : 'Compare'} ({comparedReports.length}/2)
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* TAB 1: MAIN SCANNER & REPORT WORKSPACE */}
      {activeTab === 'scanner' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Capture, Preview & Barcode (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-extrabold text-stone-900 text-sm flex items-center space-x-2">
                  <Camera className="w-4 h-4 text-emerald-700" />
                  <span>{isBn ? 'খাদ্য স্ক্যান ও ছবি আপলোড' : 'Capture or Upload Food Image'}</span>
                </h2>
                {capturedImage && (
                  <button
                    onClick={() => {
                      setCapturedImage(null);
                      setThumbnailImage(null);
                      setScanError(null);
                    }}
                    className="text-xs font-semibold text-stone-500 hover:text-rose-600 flex items-center space-x-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>{isBn ? 'মুছুন' : 'Clear'}</span>
                  </button>
                )}
              </div>

              {/* Scan Mode Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                {(
                  [
                    { id: 'auto', en: 'Auto Detect', bn: 'অটো শনাক্ত' },
                    { id: 'cooked_meal', en: 'Cooked Meal', bn: 'রান্না খাবার' },
                    { id: 'produce', en: 'Produce', bn: 'ফল ও সবজি' },
                    { id: 'packaged', en: 'Packaged', bn: 'প্যাকেটজাত' },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setScanMode(m.id)}
                    className={`py-1.5 px-2 rounded-lg font-bold border transition-colors ${
                      scanMode === m.id
                        ? 'bg-[#1B4332] text-white border-[#1B4332]'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {isBn ? m.bn : m.en}
                  </button>
                ))}
              </div>

              {/* Live Camera Viewport OR Food Image Preview OR Dropzone */}
              {cameraOpen ? (
                <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3] border border-stone-300">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Framing corners */}
                  <div className="absolute inset-4 border-2 border-dashed border-emerald-400/70 rounded-lg pointer-events-none" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const nextMode = facingMode === 'environment' ? 'user' : 'environment';
                        setFacingMode(nextMode);
                        void startCamera(nextMode);
                      }}
                      className="p-2 rounded-lg bg-black/70 text-white hover:bg-black"
                      title={isBn ? 'ক্যামেরা পরিবর্তন' : 'Switch Camera'}
                    >
                      <SwitchCamera className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={captureFromCamera}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow"
                    >
                      {isBn ? 'ছবি তুলুন' : 'Capture Photo'}
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="p-2 rounded-lg bg-black/70 text-white hover:bg-rose-700"
                      title={isBn ? 'বন্ধ করুন' : 'Close Camera'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : capturedImage ? (
                <div className="relative rounded-xl overflow-hidden bg-stone-100 aspect-[4/3] border border-stone-200">
                  <img
                    src={capturedImage}
                    alt="Food scan preview"
                    className="w-full h-full object-cover"
                  />
                  {isScanning && (
                    <div className="absolute inset-0 bg-emerald-950/45 flex flex-col items-center justify-center text-white">
                      <div className="absolute inset-x-0 top-0 h-1 bg-emerald-400 shadow-[0_0_16px_4px_rgba(52,211,153,0.9)] animate-pulse" />
                      <RefreshCw className="w-7 h-7 animate-spin text-emerald-300 mb-2" />
                      <span className="text-xs font-bold tracking-wide">
                        {isBn ? 'জেমিনাই ভিশন দিয়ে স্ক্যান হচ্ছে...' : 'Scanning with Gemini Vision...'}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    void handleFileSelected(e.dataTransfer.files?.[0]);
                  }}
                  className="rounded-xl border-2 border-dashed border-stone-300 bg-stone-50/70 p-6 text-center space-y-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                    <ScanLine className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-stone-800">
                      {isBn
                        ? 'খাবারের ছবি তুলুন বা ডিভাইস থেকে আপলোড করুন'
                        : 'Take a photo or upload an image from your gallery'}
                    </p>
                    <p className="text-[11px] text-stone-500">
                      {isBn
                        ? 'রান্না করা খাবার · ফল ও সবজি · প্যাকেটজাত লেবেল (JPG, PNG, WebP)'
                        : 'Cooked meals · Fruits & vegetables · Packaged nutrition labels'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => void startCamera()}
                      className="px-3.5 py-2 rounded-xl bg-[#1B4332] hover:bg-[#255C45] text-white text-xs font-bold flex items-center space-x-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{isBn ? 'ক্যামেরা খুলুন' : 'Open Camera'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 text-xs font-bold flex items-center space-x-1.5"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{isBn ? 'গ্যালারি থেকে আপলোড' : 'Upload Photo'}</span>
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  void handleFileSelected(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />

              {cameraError && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Optional Food Description / Manual Hint + Quick Bangladesh Food Presets */}
              <div className="space-y-2 pt-1 border-t border-stone-100">
                <label className="text-[11px] font-bold text-stone-700 block">
                  {isBn
                    ? 'খাবারের নাম / অতিরিক্ত তথ্য (ঐচ্ছিক, নির্ভুলতার জন্য)'
                    : 'Food Name or Dish Hint (Optional — improves accuracy)'}
                </label>
                <input
                  type="text"
                  value={foodHint}
                  onChange={(e) => setFoodHint(e.target.value)}
                  placeholder={
                    isBn
                      ? 'যেমন: ভাত, ইলিশ মাছ ও শাক ভাজি বা মিষ্টি দই'
                      : 'e.g., Steamed Rice, Fish Curry & Shak or Bhuna Khichuri'
                  }
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-stone-500 self-center">
                    {isBn ? 'দেশি খাবার দ্রুত পরীক্ষা:' : 'Quick BD Foods:'}
                  </span>
                  {[
                    { en: 'Steamed Rice', bn: 'ভাত' },
                    { en: 'Lentil Dal', bn: 'ডাল' },
                    { en: 'Fish Curry', bn: 'মাছ' },
                    { en: 'Shak Bhaji', bn: 'শাকসবজি' },
                    { en: 'Bhorta', bn: 'ভর্তা' },
                    { en: 'Khichuri', bn: 'খিচুড়ি' },
                    { en: 'Pitha', bn: 'পিঠা' },
                    { en: 'Milk & Doi', bn: 'দুধ ও দই' },
                  ].map((chip) => (
                    <button
                      key={chip.en}
                      type="button"
                      onClick={() => {
                        const val = isBn ? chip.bn : chip.en;
                        setFoodHint(val);
                        void handleAnalyzeFood(val, '');
                      }}
                      className="px-2 py-1 rounded-md bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 border border-stone-200 text-[10px] font-semibold transition-colors"
                    >
                      {isBn ? chip.bn : chip.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Packaged Barcode Lookup Section */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <label className="text-[11px] font-bold text-stone-700 flex items-center space-x-1.5">
                  <Barcode className="w-3.5 h-3.5 text-emerald-700" />
                  <span>
                    {isBn
                      ? 'প্যাকেটজাত পণ্যের বারকোড যাচাই (EAN / UPC)'
                      : 'Packaged Food Barcode Lookup (OpenFoodFacts)'}
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="e.g. 3017620422003"
                    className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                  <button
                    type="button"
                    disabled={isScanning}
                    onClick={() => void handleBarcodeLookupOnly()}
                    className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold shrink-0 disabled:opacity-50"
                  >
                    {isBn ? 'যাচাই' : 'Verify'}
                  </button>
                </div>
                {barcodeStatus && (
                  <p className="text-[11px] text-emerald-800 font-medium">{barcodeStatus}</p>
                )}
              </div>

              {/* Primary Scan CTA */}
              <button
                type="button"
                disabled={isScanning}
                onClick={() => void handleAnalyzeFood()}
                className="w-full py-3 rounded-xl bg-[#E76F51] hover:bg-[#d85c3f] text-white text-xs sm:text-sm font-bold shadow-sm transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{isBn ? 'বিশ্লেষণ করা হচ্ছে...' : 'Analyzing Image & Nutrition...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{isBn ? 'খাবার স্ক্যান ও বিশ্লেষণ করুন' : 'Analyze Food & Safety'}</span>
                  </>
                )}
              </button>

              {scanError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-700" />
                  <span>{scanError}</span>
                </div>
              )}
            </div>

            {/* Mandatory Lab Disclaimer Always Visible */}
            <div className="bg-amber-50/90 rounded-2xl p-4 border border-amber-200 text-amber-950 text-xs flex items-start space-x-2.5">
              <Microscope className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-extrabold block">
                  {isBn ? 'গুরুত্বপূর্ণ বৈজ্ঞানিক সতর্কবার্তা' : 'Scientific & Laboratory Boundary'}
                </span>
                <p className="leading-relaxed">
                  {isBn ? LAB_VERIFICATION_DISCLAIMER_BN : LAB_VERIFICATION_DISCLAIMER}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Analysis Report Dashboard (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            {!activeReport ? (
              <div className="bg-white rounded-2xl p-8 border border-stone-200 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">
                  <ScanLine className="w-7 h-7" />
                </div>
                <div className="max-w-md mx-auto space-y-1.5">
                  <h3 className="font-extrabold text-stone-900 text-base">
                    {isBn
                      ? 'বিশ্লেষণ রিপোর্ট দেখার জন্য প্রস্তুত'
                      : 'Ready to Scan Food, Labels & Nutrition'}
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {isBn
                      ? 'বামপাশ থেকে খাবারের ছবি তুলুন বা আপলোড করুন, পণ্যের বারকোড দিন অথবা একটি দেশি খাবারের নাম নির্বাচন করে তাৎক্ষণিক রিপোর্ট পান।'
                      : 'Upload or capture a meal photo, enter a packaged barcode, or select a Bangladeshi staple dish on the left to inspect calories, macros, health insights, and food safety status.'}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Report Top Bar + Actions */}
                <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-stone-100 pb-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-500 font-mono">
                        <span>{activeReport.displayDate}</span>
                        <span>·</span>
                        <span>
                          {isBn ? 'নিশ্চিততা:' : 'Confidence:'}{' '}
                          <strong className="text-stone-900">{activeReport.overallConfidence}%</strong>
                        </span>
                        <span>·</span>
                        <span>{activeReport.items.length} {isBn ? 'আইটেম' : 'item(s)'}</span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-black text-stone-900">
                        {isBn ? activeReport.detectedTitleBn : activeReport.detectedTitle}
                      </h2>
                      <p className="text-xs text-stone-600 flex items-start space-x-1.5">
                        <Info className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                        <span>{isBn ? activeReport.estimationNoteBn : activeReport.estimationNote}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => saveScanReport(activeReport)}
                        className="px-3 py-1.5 rounded-lg bg-[#1B4332] hover:bg-[#255C45] text-white text-xs font-bold flex items-center space-x-1"
                      >
                        <BookmarkCheck className="w-3.5 h-3.5" />
                        <span>{isBn ? 'সংরক্ষণ' : 'Save Scan'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExportReport('json')}
                        className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center space-x-1"
                        title="Export JSON"
                      >
                        <FileJson className="w-3.5 h-3.5 text-emerald-700" />
                        <span>JSON</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExportReport('txt')}
                        className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center space-x-1"
                        title="Export Report"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-700" />
                        <span>{isBn ? 'রিপোর্ট' : 'Report'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Identified Food Items + Interactive Portion & Correction Editor */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-600">
                        {isBn ? 'শনাক্তকৃত খাবার ও পরিমাণ সংশোধন' : 'Identified Foods & Portion Editor'}
                      </h3>
                      <span className="text-[11px] text-stone-500">
                        {isBn
                          ? 'নাম বা গ্রাম পরিবর্তন করলে পুষ্টিমান আপডেট হবে'
                          : 'Edit name or grams to recalculate nutrition'}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {activeReport.items.map((item) => (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5 text-xs"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="space-y-0.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-extrabold text-stone-900 text-sm">
                                  {isBn ? item.nameBn : item.name}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    item.dataSource === 'ai_estimate'
                                      ? 'bg-amber-100 text-amber-900'
                                      : 'bg-emerald-100 text-emerald-900'
                                  }`}
                                >
                                  {item.dataSource === 'openfoodfacts'
                                    ? 'OpenFoodFacts'
                                    : item.dataSource === 'verified_reference'
                                    ? isBn
                                      ? 'যাচাইকৃত রেফারেন্স'
                                      : 'Verified Reference'
                                    : isBn
                                    ? 'এআই অনুমান'
                                    : 'AI Photo Estimate'}
                                </span>
                                <span className="text-[11px] text-stone-500 font-mono tabular-nums">
                                  {item.confidence}% {isBn ? 'নিশ্চিত' : 'conf'}
                                </span>
                              </div>
                              <p className="text-[11px] text-stone-500">
                                {isBn ? item.measuredVsEstimatedNoteBn : item.measuredVsEstimatedNote}
                              </p>
                            </div>

                            <div className="flex items-center space-x-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingItemId(editingItemId === item.id ? null : item.id)
                                }
                                className="px-2 py-1 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 text-[11px] font-semibold flex items-center space-x-1"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>{isBn ? 'সংশোধন' : 'Correct'}</span>
                              </button>
                              {activeReport.items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="p-1 rounded-lg text-stone-400 hover:text-rose-600"
                                  title="Remove item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Portion Grams Controls */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-200/70">
                            <div className="flex items-center space-x-2">
                              <label className="text-[11px] font-bold text-stone-700">
                                {isBn ? 'পরিমাণ (গ্রাম):' : 'Portion (g):'}
                              </label>
                              <button
                                type="button"
                                onClick={() =>
                                  handleItemPortionChange(item.id, item.portionGrams - 25)
                                }
                                className="px-2 py-0.5 rounded bg-white border border-stone-300 font-bold hover:bg-stone-100"
                              >
                                -25g
                              </button>
                              <input
                                type="number"
                                min={5}
                                max={5000}
                                value={item.portionGrams}
                                onChange={(e) =>
                                  handleItemPortionChange(
                                    item.id,
                                    parseFloat(e.target.value) || 50
                                  )
                                }
                                className="w-20 px-2 py-1 bg-white border border-stone-300 rounded text-center font-bold font-mono tabular-nums text-stone-900"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  handleItemPortionChange(item.id, item.portionGrams + 25)
                                }
                                className="px-2 py-0.5 rounded bg-white border border-stone-300 font-bold hover:bg-stone-100"
                              >
                                +25g
                              </button>
                            </div>

                            <div className="flex items-center space-x-3 font-mono tabular-nums text-[11px] font-bold text-stone-700">
                              <span className="text-orange-700">{item.nutrition.calories} kcal</span>
                              <span>P: {item.nutrition.proteinG}g</span>
                              <span>C: {item.nutrition.carbsG}g</span>
                              <span>F: {item.nutrition.totalFatG}g</span>
                            </div>
                          </div>

                          {/* Inline Food Correction Dropdown / Rename */}
                          {editingItemId === item.id && (
                            <div className="pt-2 border-t border-stone-200 space-y-2">
                              <div className="flex flex-col sm:flex-row gap-2">
                                <select
                                  value={item.referenceMatchId || ''}
                                  onChange={(e) => {
                                    if (e.target.value) handleSwapFoodItem(item.id, e.target.value);
                                  }}
                                  className="flex-1 px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs text-stone-900"
                                >
                                  <option value="">
                                    {isBn
                                      ? '-- যাচাইকৃত খাবার নির্বাচন করুন --'
                                      : '-- Select verified reference food --'}
                                  </option>
                                  {FOOD_SCANNER_DATABASE.map((ref) => (
                                    <option key={ref.id} value={ref.id}>
                                      {isBn ? `${ref.nameBn} (${ref.name})` : `${ref.name} (${ref.nameBn})`}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  defaultValue={item.name}
                                  placeholder={isBn ? 'কাস্টম খাবারের নাম লিখে Enter চাপুন' : 'Or type custom name + Enter'}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleRenameFoodItem(item.id, (e.target as HTMLInputElement).value);
                                    }
                                  }}
                                  className="flex-1 px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs text-stone-900"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add Missing Dish to Plate */}
                    <div className="flex items-center gap-2 pt-1">
                      <select
                        value={newItemQuery}
                        onChange={(e) => setNewItemQuery(e.target.value)}
                        className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800"
                      >
                        <option value="">
                          {isBn
                            ? '+ প্লেটে বাদ পড়া খাবার যোগ করুন (ভাত, ডাল, মাছ, শাক...)'
                            : '+ Add another item spotted on plate (Rice, Dal, Fish, Shak...)'}
                        </option>
                        {FOOD_SCANNER_DATABASE.map((ref) => (
                          <option key={ref.id} value={ref.name}>
                            {isBn ? `${ref.nameBn} (${ref.defaultPortionGrams}g)` : `${ref.name} (${ref.defaultPortionGrams}g)`}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAddItemToPlate}
                        disabled={!newItemQuery}
                        className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold flex items-center space-x-1 disabled:opacity-40"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isBn ? 'যোগ' : 'Add'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* NUTRITION BREAKDOWN & CHARTS */}
                <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <h3 className="font-extrabold text-stone-900 text-sm">
                      {isBn ? 'বিস্তারিত পুষ্টি বিশ্লেষণ (প্রতি পরিবেশন)' : 'Nutrition Breakdown (Estimated Serving)'}
                    </h3>
                    <span className="text-xs font-mono tabular-nums font-bold text-stone-600">
                      Total ~{activeReport.items.reduce((a, b) => a + b.portionGrams, 0)}g
                    </span>
                  </div>

                  {/* Primary 8-Metric Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-emerald-950 text-white">
                      <span className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold block">
                        {isBn ? 'ক্যালোরি' : 'Calories'}
                      </span>
                      <span className="text-2xl font-black font-mono tabular-nums">
                        {activeReport.totals.calories}
                      </span>
                      <span className="text-[11px] text-emerald-200 ml-1">kcal</span>
                    </div>
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="text-[10px] uppercase tracking-wider text-emerald-800 font-bold block">
                        {isBn ? 'প্রোটিন' : 'Protein'}
                      </span>
                      <span className="text-xl font-black font-mono tabular-nums text-stone-900">
                        {activeReport.totals.proteinG}g
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="text-[10px] uppercase tracking-wider text-amber-800 font-bold block">
                        {isBn ? 'শর্করা (Carbs)' : 'Carbohydrates'}
                      </span>
                      <span className="text-xl font-black font-mono tabular-nums text-stone-900">
                        {activeReport.totals.carbsG}g
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="text-[10px] uppercase tracking-wider text-orange-800 font-bold block">
                        {isBn ? 'মোট ফ্যাট' : 'Total Fat'}
                      </span>
                      <span className="text-xl font-black font-mono tabular-nums text-stone-900">
                        {activeReport.totals.totalFatG}g
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="text-[10px] uppercase tracking-wider text-stone-600 font-bold block">
                        {isBn ? 'স্যাচুরেটেড ফ্যাট' : 'Saturated Fat'}
                      </span>
                      <span className="text-base font-extrabold font-mono tabular-nums text-stone-900">
                        {activeReport.totals.saturatedFatG}g
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="text-[10px] uppercase tracking-wider text-teal-800 font-bold block">
                        {isBn ? 'খাদ্য আঁশ (Fiber)' : 'Fiber'}
                      </span>
                      <span className="text-base font-extrabold font-mono tabular-nums text-stone-900">
                        {activeReport.totals.fiberG}g
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="text-[10px] uppercase tracking-wider text-rose-800 font-bold block">
                        {isBn ? 'চিনি (Sugar)' : 'Sugar'}
                      </span>
                      <span className="text-base font-extrabold font-mono tabular-nums text-stone-900">
                        {activeReport.totals.sugarG}g
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="text-[10px] uppercase tracking-wider text-stone-700 font-bold block">
                        {isBn ? 'সোডিয়াম (Sodium)' : 'Sodium'}
                      </span>
                      <span className="text-base font-extrabold font-mono tabular-nums text-stone-900">
                        {activeReport.totals.sodiumMg}mg
                      </span>
                    </div>
                  </div>

                  {/* Macro Calorie Distribution Chart */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold text-stone-700">
                      <span>{isBn ? 'ম্যাক্রো ক্যালোরি অনুপাত' : 'Calorie Macro Distribution'}</span>
                      <span className="font-mono tabular-nums text-stone-600">
                        P {macroChart.proteinPct}% · C {macroChart.carbsPct}% · F {macroChart.fatPct}%
                      </span>
                    </div>
                    <div className="h-3.5 w-full rounded-full bg-stone-100 overflow-hidden flex">
                      <div
                        style={{ width: `${macroChart.proteinPct}%` }}
                        className="bg-emerald-600 transition-all"
                        title={`Protein ${macroChart.proteinPct}%`}
                      />
                      <div
                        style={{ width: `${macroChart.carbsPct}%` }}
                        className="bg-amber-400 transition-all"
                        title={`Carbs ${macroChart.carbsPct}%`}
                      />
                      <div
                        style={{ width: `${macroChart.fatPct}%` }}
                        className="bg-orange-500 transition-all"
                        title={`Fat ${macroChart.fatPct}%`}
                      />
                    </div>
                  </div>

                  {/* Vitamins & Minerals Cards */}
                  {(activeReport.totals.vitamins.length > 0 || activeReport.totals.minerals.length > 0) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-100 text-xs">
                      <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
                        <span className="font-extrabold text-stone-800 block">
                          {isBn ? 'গুরুত্বপূর্ণ ভিটামিনসমূহ' : 'Important Vitamins'}
                        </span>
                        {activeReport.totals.vitamins.length === 0 ? (
                          <span className="text-stone-500 text-[11px]">
                            {isBn ? 'সীমিত তথ্য' : 'Trace amounts / not listed'}
                          </span>
                        ) : (
                          activeReport.totals.vitamins.map((v, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[11px]">
                              <span className="text-stone-700">{isBn ? v.nameBn : v.name}</span>
                              <span className="font-mono tabular-nums font-bold text-emerald-800">
                                {v.amount}
                                {v.dailyValuePct ? ` (${v.dailyValuePct}% DV)` : ''}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
                        <span className="font-extrabold text-stone-800 block">
                          {isBn ? 'গুরুত্বপূর্ণ খনিজ উপাদান' : 'Important Minerals'}
                        </span>
                        {activeReport.totals.minerals.length === 0 ? (
                          <span className="text-stone-500 text-[11px]">
                            {isBn ? 'সীমিত তথ্য' : 'Trace amounts / not listed'}
                          </span>
                        ) : (
                          activeReport.totals.minerals.map((m, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[11px]">
                              <span className="text-stone-700">{isBn ? m.nameBn : m.name}</span>
                              <span className="font-mono tabular-nums font-bold text-stone-900">
                                {m.amount}
                                {m.dailyValuePct ? ` (${m.dailyValuePct}% DV)` : ''}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* HEALTH BENEFIT ANALYSIS */}
                <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
                  <div className="flex items-center space-x-2 border-b border-stone-100 pb-3">
                    <HeartPulse className="w-4 h-4 text-emerald-700" />
                    <h3 className="font-extrabold text-stone-900 text-sm">
                      {isBn ? 'স্বাস্থ্য উপকারিতা ও পুষ্টি সতর্কতা' : 'Health Benefit Analysis & Dietary Alerts'}
                    </h3>
                  </div>

                  {/* Excess Sugar / Salt / Fat Alerts */}
                  {activeReport.healthAnalysis.excessAlerts.length > 0 && (
                    <div className="space-y-2">
                      {activeReport.healthAnalysis.excessAlerts.map((al, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-xl border text-xs flex items-start space-x-2 ${
                            al.severity === 'high'
                              ? 'bg-rose-50 border-rose-200 text-rose-900'
                              : 'bg-amber-50 border-amber-200 text-amber-900'
                          }`}
                        >
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{isBn ? al.messageBn : al.message}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <span className="font-bold text-stone-800 block">
                        {isBn ? 'পুষ্টিগত উপকারিতা:' : 'Nutritional Benefits:'}
                      </span>
                      <ul className="list-disc pl-4 space-y-1 text-stone-600">
                        {(isBn
                          ? activeReport.healthAnalysis.benefitsBn
                          : activeReport.healthAnalysis.benefits
                        ).map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <span className="font-bold text-stone-800 block">
                        {isBn ? 'শরীরের স্বাভাবিক কার্যকারিতায় ভূমিকা:' : 'How Nutrients Support Normal Body Functions:'}
                      </span>
                      <ul className="list-disc pl-4 space-y-1 text-stone-600">
                        {(isBn
                          ? activeReport.healthAnalysis.bodyFunctionsBn
                          : activeReport.healthAnalysis.bodyFunctions
                        ).map((fn, i) => (
                          <li key={i}>{fn}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="font-bold text-stone-800 block mb-1">
                        {isBn ? 'সম্ভাব্য অ্যালার্জেন:' : 'Potential Allergens:'}
                      </span>
                      <span className="text-stone-700">
                        {(isBn
                          ? activeReport.healthAnalysis.allergensBn.length > 0
                            ? activeReport.healthAnalysis.allergensBn
                            : activeReport.healthAnalysis.allergens
                          : activeReport.healthAnalysis.allergens
                        ).join(', ') || (isBn ? 'প্রধান অ্যালার্জেন শনাক্ত হয়নি (উপাদান যাচাই করুন)' : 'No major allergen flagged (verify full ingredients)')}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                      <span className="font-bold text-emerald-950 block mb-1">
                        {isBn ? 'সুষম খাবারের পরামর্শ:' : 'Balanced Meal Suggestion:'}
                      </span>
                      <span className="text-emerald-900">
                        {(isBn
                          ? activeReport.healthAnalysis.mealSuggestionsBn
                          : activeReport.healthAnalysis.mealSuggestions
                        ).join(' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* FOOD QUALITY, AUTHENTICITY & 3-STATUS SAFETY REPORT */}
                <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <h3 className="font-extrabold text-stone-900 text-sm flex items-center space-x-2">
                      <Microscope className="w-4 h-4 text-emerald-700" />
                      <span>
                        {isBn ? 'খাদ্য নিরাপত্তা ও মান যাচাই রিপোর্ট' : 'Food Safety & Authenticity Check'}
                      </span>
                    </h3>
                  </div>

                  {/* Primary 3-Status Safety Banner */}
                  {(() => {
                    const style = safetyBadgeStyle(activeReport.safetyReport.status);
                    return (
                      <div className={`p-4 rounded-xl border space-y-2 ${style.container}`}>
                        <div className="flex items-start space-x-2.5">
                          {style.icon}
                          <div className="space-y-1">
                            <span className={`inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${style.badge}`}>
                              {activeReport.safetyReport.status === 'consistent'
                                ? isBn
                                  ? 'সামঞ্জস্যপূর্ণ তথ্য'
                                  : 'Status 1 · Consistent'
                                : activeReport.safetyReport.status === 'needs_checking'
                                ? isBn
                                  ? 'আরও যাচাই প্রয়োজন'
                                  : 'Status 2 · Needs Further Checking'
                                : isBn
                                ? 'ল্যাব পরীক্ষা প্রয়োজন'
                                : 'Status 3 · Lab Verification Required'}
                            </span>
                            <p className="font-extrabold text-sm">
                              {isBn
                                ? activeReport.safetyReport.statusTextBn
                                : activeReport.safetyReport.statusText}
                            </p>
                          </div>
                        </div>

                        <ul className="list-disc pl-6 text-xs space-y-1">
                          {(isBn
                            ? activeReport.safetyReport.reasonsBn
                            : activeReport.safetyReport.reasons
                          ).map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>

                        <div className="pt-2 border-t border-current/15 text-xs">
                          <span className="font-bold block">
                            {isBn ? 'ল্যাবরেটরি ও পরবর্তী পদক্ষেপ:' : 'Laboratory & Verification Guidance:'}
                          </span>
                          <p className="mt-0.5">
                            {isBn
                              ? activeReport.safetyReport.labTestingRecommendationBn
                              : activeReport.safetyReport.labTestingRecommendation}
                          </p>
                        </div>

                        <p className="text-[11px] font-bold pt-1">
                          {isBn ? activeReport.safetyReport.disclaimerBn : activeReport.safetyReport.disclaimer}
                        </p>
                      </div>
                    );
                  })()}

                  {/* A. Visual Inspection Controls & Findings */}
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-stone-800 flex items-center space-x-1.5">
                        <Eye className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{isBn ? 'A. দৃশ্যমান পর্যবেক্ষণ' : 'A. Visual Inspection'}</span>
                      </span>
                      <span className="text-[11px] font-semibold text-stone-600">
                        {isBn ? 'ছবির মান:' : 'Image quality:'}{' '}
                        <strong className="uppercase">{activeReport.visualInspection.imageQuality}</strong>
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600">
                      {isBn
                        ? activeReport.visualInspection.imageQualityNoteBn
                        : activeReport.visualInspection.imageQualityNote}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleToggleVisualDefect('moldOrSpoilageDetected')}
                        className={`p-2 rounded-lg border text-left transition-colors ${
                          activeReport.visualInspection.moldOrSpoilageDetected
                            ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold'
                            : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <span className="block text-[10px] uppercase">
                          {isBn ? 'ছত্রাক / পচন' : 'Mold / Spoilage'}
                        </span>
                        <span className="text-xs">
                          {activeReport.visualInspection.moldOrSpoilageDetected
                            ? isBn
                              ? 'সন্দেহজনক (চিহ্নিত)'
                              : 'Flagged'
                            : isBn
                            ? 'দেখা যায়নি'
                            : 'Not observed'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleVisualDefect('unusualAppearanceDetected')}
                        className={`p-2 rounded-lg border text-left transition-colors ${
                          activeReport.visualInspection.unusualAppearanceDetected
                            ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold'
                            : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <span className="block text-[10px] uppercase">
                          {isBn ? 'অস্বাভাবিক রঙ/ভাব' : 'Unusual Appearance'}
                        </span>
                        <span className="text-xs">
                          {activeReport.visualInspection.unusualAppearanceDetected
                            ? isBn
                              ? 'সন্দেহজনক (চিহ্নিত)'
                              : 'Flagged'
                            : isBn
                            ? 'দেখা যায়নি'
                            : 'Not observed'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleVisualDefect('packagingDamageDetected')}
                        className={`p-2 rounded-lg border text-left transition-colors ${
                          activeReport.visualInspection.packagingDamageDetected
                            ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold'
                            : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <span className="block text-[10px] uppercase">
                          {isBn ? 'প্যাকেজিং ক্ষতি' : 'Packaging Damage'}
                        </span>
                        <span className="text-xs">
                          {activeReport.visualInspection.packagingDamageDetected
                            ? isBn
                              ? 'ক্ষতিগ্রস্ত (চিহ্নিত)'
                              : 'Flagged'
                            : isBn
                            ? 'ক্ষতিগ্রস্ত নয়'
                            : 'Intact / N/A'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* B & C. Packaged Food Verification & Consistency Assessment */}
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-stone-800 flex items-center space-x-1.5">
                        <PackageCheck className="w-3.5 h-3.5 text-emerald-700" />
                        <span>
                          {isBn
                            ? 'B & C. প্যাকেটজাত পণ্যের তথ্য ও সত্যতা যাচাই'
                            : 'B & C. Packaged Food Verification & Authenticity Check'}
                        </span>
                      </span>
                      {activeReport.packagedDetails?.openFoodFactsUrl && (
                        <a
                          href={activeReport.packagedDetails.openFoodFactsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-bold text-emerald-700 underline"
                        >
                          OpenFoodFacts
                        </a>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[10px] font-bold text-stone-600 block mb-0.5">
                          {isBn ? 'পণ্য ও ব্র্যান্ড' : 'Product Name & Brand'}
                        </label>
                        <input
                          type="text"
                          value={activeReport.packagedDetails?.productName || ''}
                          onChange={(e) => handlePackagedFieldChange('productName', e.target.value)}
                          placeholder={isBn ? 'প্যাকেটের নাম লিখুন' : 'Enter product name'}
                          className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-stone-600 block mb-0.5">
                          {isBn ? 'প্রস্তুতকারক' : 'Manufacturer'}
                        </label>
                        <input
                          type="text"
                          value={activeReport.packagedDetails?.manufacturer || ''}
                          onChange={(e) => handlePackagedFieldChange('manufacturer', e.target.value)}
                          placeholder={isBn ? 'প্রস্তুতকারকের নাম' : 'Enter manufacturer'}
                          className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-stone-600 block mb-0.5">
                          {isBn ? 'ব্যাচ নম্বর' : 'Batch / Lot Number'}
                        </label>
                        <input
                          type="text"
                          value={activeReport.packagedDetails?.batchNumber || ''}
                          onChange={(e) => handlePackagedFieldChange('batchNumber', e.target.value)}
                          placeholder={isBn ? 'ব্যাচ নম্বর (যেমন B204)' : 'e.g., LOT-402A'}
                          className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-stone-600 block mb-0.5">
                            {isBn ? 'উৎপাদন তারিখ' : 'Mfg Date'}
                          </label>
                          <input
                            type="text"
                            value={activeReport.packagedDetails?.mfgDate || ''}
                            onChange={(e) => handlePackagedFieldChange('mfgDate', e.target.value)}
                            placeholder="YYYY-MM-DD"
                            className="w-full px-2 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-stone-600 block mb-0.5">
                            {isBn ? 'মেয়াদ উত্তীর্ণ' : 'Expiry Date'}
                          </label>
                          <input
                            type="text"
                            value={activeReport.packagedDetails?.expiryDate || ''}
                            onChange={(e) => handlePackagedFieldChange('expiryDate', e.target.value)}
                            placeholder="YYYY-MM-DD"
                            className="w-full px-2 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {activeReport.packagedDetails?.ingredientsList && (
                      <div className="p-2.5 rounded-lg bg-white border border-stone-200 text-[11px] text-stone-700">
                        <strong className="text-stone-900">
                          {isBn ? 'উপাদান তালিকা:' : 'Ingredients List:'}{' '}
                        </strong>
                        {activeReport.packagedDetails.ingredientsList}
                      </div>
                    )}

                    {activeReport.packagedDetails && activeReport.packagedDetails.additives.length > 0 && (
                      <div className="text-[11px] text-stone-700">
                        <strong className="text-stone-900">{isBn ? 'অ্যাডিটিভস:' : 'Additives:'} </strong>
                        {activeReport.packagedDetails.additives.join(', ')}
                      </div>
                    )}

                    {/* Consistency Checks List */}
                    {activeReport.packagedDetails &&
                      activeReport.packagedDetails.consistencyChecks.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          {activeReport.packagedDetails.consistencyChecks.map((chk, idx) => (
                            <div
                              key={idx}
                              className="flex items-start justify-between gap-2 text-[11px] p-2 rounded-lg bg-white border border-stone-200"
                            >
                              <div>
                                <strong className="text-stone-900">
                                  {isBn ? chk.fieldBn : chk.field}:{' '}
                                </strong>
                                <span className="text-stone-600">{isBn ? chk.noteBn : chk.note}</span>
                              </div>
                              <span
                                className={`shrink-0 font-bold uppercase text-[10px] px-1.5 py-0.5 rounded ${
                                  chk.status === 'verified'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : chk.status === 'warning'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {chk.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SCAN HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <h2 className="font-extrabold text-stone-900 text-base">
                {isBn ? 'সংরক্ষিত ফুড স্ক্যান ইতিহাস' : 'Saved Food Scan History'}
              </h2>
              <p className="text-xs text-stone-500">
                {isBn
                  ? 'যেকোনো ২টি খাবার নির্বাচন করে পাশাপাশি পুষ্টি ও নিরাপত্তা তুলনা করুন।'
                  : 'Select any 2 scans to compare nutrition and safety side-by-side.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {compareIds.length === 2 && (
                <button
                  onClick={() => setActiveTab('compare')}
                  className="px-3.5 py-2 rounded-xl bg-[#1B4332] text-white text-xs font-bold flex items-center space-x-1.5"
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  <span>{isBn ? 'নির্বাচিত ২টি তুলনা করুন' : 'Compare Selected (2)'}</span>
                </button>
              )}
              {scanHistory.length > 0 && (
                <button
                  onClick={clearScanHistory}
                  className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-700 text-xs font-bold"
                >
                  {isBn ? 'সব মুছুন' : 'Clear All'}
                </button>
              )}
            </div>
          </div>

          {scanHistory.length === 0 ? (
            <div className="py-12 text-center text-stone-500 text-xs space-y-2">
              <History className="w-8 h-8 mx-auto text-stone-300" />
              <p>
                {isBn
                  ? 'এখনো কোনো স্ক্যান সংরক্ষিত নেই। স্ক্যানার থেকে একটি খাবার বিশ্লেষণ করে সংরক্ষণ করুন।'
                  : 'No saved scans yet. Analyze a food or packaged product and click "Save Scan".'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scanHistory.map((item) => {
                const isSelectedForCompare = compareIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-colors flex gap-3.5 items-start ${
                      isSelectedForCompare
                        ? 'bg-emerald-50/50 border-emerald-400'
                        : 'bg-stone-50/70 border-stone-200'
                    }`}
                  >
                    {item.imageDataUrl && (
                      <img
                        src={item.imageDataUrl}
                        alt={item.detectedTitle}
                        className="w-16 h-16 rounded-lg object-cover shrink-0 border border-stone-200"
                      />
                    )}
                    <div className="flex-1 min-w-0 space-y-1.5 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-extrabold text-stone-900 truncate">
                            {isBn ? item.detectedTitleBn : item.detectedTitle}
                          </h3>
                          <span className="text-[11px] font-mono text-stone-500">{item.displayDate}</span>
                        </div>
                        <button
                          onClick={() => deleteScanReport(item.id)}
                          className="p-1 text-stone-400 hover:text-rose-600"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 font-mono tabular-nums text-[11px] font-bold">
                        <span className="text-orange-700">{item.totals.calories} kcal</span>
                        <span>·</span>
                        <span>P: {item.totals.proteinG}g</span>
                        <span>·</span>
                        <span>S: {item.totals.sugarG}g</span>
                        <span>·</span>
                        <span>Na: {item.totals.sodiumMg}mg</span>
                      </div>

                      <div className="text-[11px] font-semibold text-stone-700">
                        {isBn ? item.safetyReport.statusTextBn : item.safetyReport.statusText}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => {
                            setActiveReport(item);
                            setActiveTab('scanner');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#1B4332] text-white text-[11px] font-bold"
                        >
                          {isBn ? 'রিপোর্ট দেখুন' : 'Open Report'}
                        </button>
                        <button
                          onClick={() => toggleCompareSelection(item.id)}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold ${
                            isSelectedForCompare
                              ? 'bg-emerald-700 text-white border-emerald-700'
                              : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                          }`}
                        >
                          {isSelectedForCompare
                            ? isBn
                              ? 'তুলনায় নির্বাচিত'
                              : 'Selected'
                            : isBn
                            ? 'তুলনায় রাখুন'
                            : 'Compare'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SIDE-BY-SIDE COMPARISON */}
      {activeTab === 'compare' && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <h2 className="font-extrabold text-stone-900 text-base">
                {isBn ? 'দুটি স্ক্যান করা খাবারের তুলনা' : 'Side-by-Side Nutrition & Safety Comparison'}
              </h2>
              <p className="text-xs text-stone-500">
                {isBn
                  ? 'ইতিহাস থেকে দুটি স্ক্যান বেছে নিয়ে পাশাপাশি ক্যালোরি, চিনি, সোডিয়াম ও নিরাপত্তা দেখুন।'
                  : 'Compare calories, macros, sugar, sodium, and safety status between two saved scans.'}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('history')}
              className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-800"
            >
              {isBn ? 'ইতিহাস থেকে বাছুন' : 'Pick From History'}
            </button>
          </div>

          {comparedReports.length < 2 ? (
            <div className="py-10 text-center text-xs text-stone-500 space-y-3">
              <GitCompare className="w-8 h-8 mx-auto text-stone-300" />
              <p>
                {isBn
                  ? `তুলনার জন্য কমপক্ষে ২টি সংরক্ষিত স্ক্যান নির্বাচন করুন (বর্তমানে ${comparedReports.length}/২ নির্বাচিত)।`
                  : `Select 2 saved scans from History to compare side-by-side (${comparedReports.length}/2 selected).`}
              </p>
              <button
                onClick={() => setActiveTab('history')}
                className="px-4 py-2 rounded-xl bg-[#1B4332] text-white font-bold"
              >
                {isBn ? 'ইতিহাসে যান' : 'Go to Scan History'}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500">
                    <th className="py-2.5 pr-4 font-bold">{isBn ? 'বৈশিষ্ট্য' : 'Metric'}</th>
                    <th className="py-2.5 px-4 font-extrabold text-stone-900">
                      {isBn ? comparedReports[0].detectedTitleBn : comparedReports[0].detectedTitle}
                    </th>
                    <th className="py-2.5 px-4 font-extrabold text-stone-900">
                      {isBn ? comparedReports[1].detectedTitleBn : comparedReports[1].detectedTitle}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-mono tabular-nums">
                  {[
                    {
                      label: isBn ? 'ক্যালোরি (kcal)' : 'Calories (kcal)',
                      v1: comparedReports[0].totals.calories,
                      v2: comparedReports[1].totals.calories,
                    },
                    {
                      label: isBn ? 'প্রোটিন (g)' : 'Protein (g)',
                      v1: comparedReports[0].totals.proteinG,
                      v2: comparedReports[1].totals.proteinG,
                    },
                    {
                      label: isBn ? 'কার্বোহাইড্রেট (g)' : 'Carbs (g)',
                      v1: comparedReports[0].totals.carbsG,
                      v2: comparedReports[1].totals.carbsG,
                    },
                    {
                      label: isBn ? 'মোট ফ্যাট (g)' : 'Total Fat (g)',
                      v1: comparedReports[0].totals.totalFatG,
                      v2: comparedReports[1].totals.totalFatG,
                    },
                    {
                      label: isBn ? 'স্যাচুরেটেড ফ্যাট (g)' : 'Saturated Fat (g)',
                      v1: comparedReports[0].totals.saturatedFatG,
                      v2: comparedReports[1].totals.saturatedFatG,
                    },
                    {
                      label: isBn ? 'ফাইবার (g)' : 'Fiber (g)',
                      v1: comparedReports[0].totals.fiberG,
                      v2: comparedReports[1].totals.fiberG,
                    },
                    {
                      label: isBn ? 'চিনি (g)' : 'Sugar (g)',
                      v1: comparedReports[0].totals.sugarG,
                      v2: comparedReports[1].totals.sugarG,
                    },
                    {
                      label: isBn ? 'সোডিয়াম (mg)' : 'Sodium (mg)',
                      v1: comparedReports[0].totals.sodiumMg,
                      v2: comparedReports[1].totals.sodiumMg,
                    },
                  ].map((row) => (
                    <tr key={row.label}>
                      <td className="py-2.5 pr-4 font-sans font-semibold text-stone-700">{row.label}</td>
                      <td className="py-2.5 px-4 font-bold text-stone-900">{row.v1}</td>
                      <td className="py-2.5 px-4 font-bold text-stone-900">{row.v2}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="py-2.5 pr-4 font-sans font-semibold text-stone-700">
                      {isBn ? 'খাদ্য নিরাপত্তা অবস্থা' : 'Safety Status'}
                    </td>
                    <td className="py-2.5 px-4 font-sans font-bold text-stone-800">
                      {isBn
                        ? comparedReports[0].safetyReport.statusTextBn
                        : comparedReports[0].safetyReport.statusText}
                    </td>
                    <td className="py-2.5 px-4 font-sans font-bold text-stone-800">
                      {isBn
                        ? comparedReports[1].safetyReport.statusTextBn
                        : comparedReports[1].safetyReport.statusText}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
