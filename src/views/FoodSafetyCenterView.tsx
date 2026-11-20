import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ADULTERATION_PROFILES,
  BANGLADESH_OFFICIAL_AUTHORITIES,
  buildSixCategorySafetyReport,
  CONTAMINATION_EDUCATION_TOPICS,
  CRITICAL_SAFETY_RULE,
  CRITICAL_SAFETY_RULE_BN,
  evaluateExpiryStatus,
  getAdulterationProfileForCategory,
} from '../data/foodSafetyDatabase';
import {
  BfsaFoodMatrixCategory,
  BfsaInfoCategory,
  FoodSafetyCenterReport,
  LabelOcrResult,
  SafetyAssessmentStatus,
  SafetyFoodCategory,
} from '../types';
import { BfsaIntegrationSection } from '../components/BfsaIntegrationSection';
import { mapSafetyCategoryToBfsaMatrix } from '../data/bfsaRepositoryData';
import {
  ShieldCheck,
  ShieldAlert,
  Camera,
  Upload,
  SwitchCamera,
  X,
  Barcode,
  FileSearch,
  Microscope,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  History,
  GitCompare,
  Trash2,
  BookmarkCheck,
  FileJson,
  FileText,
  BookOpen,
  RefreshCw,
  Eye,
  CalendarClock,
  FlaskConical,
  Info,
  Building2,
  Megaphone,
  Search,
} from 'lucide-react';

async function compressPhoto(dataUrl: string, maxDim = 1280, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas unavailable'));
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('Unreadable image file'));
    img.src = dataUrl;
  });
}

function getStatusBadgeClasses(status: SafetyAssessmentStatus): string {
  switch (status) {
    case 'Information Verified':
      return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    case 'Needs Further Checking':
      return 'bg-amber-100 text-amber-900 border-amber-300';
    case 'Potential Safety Concern':
      return 'bg-orange-100 text-orange-950 border-orange-300';
    case 'Laboratory Testing Required':
      return 'bg-rose-100 text-rose-950 border-rose-300';
    case 'Insufficient Information':
    default:
      return 'bg-stone-100 text-stone-800 border-stone-300';
  }
}

export const FoodSafetyCenterView: React.FC = () => {
  const {
    language,
    safetyReportsHistory,
    saveSafetyReport,
    deleteSafetyReport,
    clearSafetyHistory,
    showNotification,
  } = useApp();
  const isBn = language === 'bn';

  const [activeTab, setActiveTab] = useState<
    'scanner' | 'label-barcode' | 'bfsa-labs' | 'bfsa-portal' | 'education' | 'history'
  >('scanner');
  const [bfsaLabsFocusMode, setBfsaLabsFocusMode] = useState<'directory' | 'parameters' | 'compare'>('directory');
  const [bfsaSelectedMatrix, setBfsaSelectedMatrix] = useState<BfsaFoodMatrixCategory | 'all'>('all');
  const [bfsaPortalFilter, setBfsaPortalFilter] = useState<BfsaInfoCategory | 'all'>('all');

  // Scanner inputs
  const [foodCategory, setFoodCategory] = useState<SafetyFoodCategory>('vegetables');
  const [foodNameHint, setFoodNameHint] = useState('');
  const [foodPhoto, setFoodPhoto] = useState<string | null>(null);
  const [foodThumb, setFoodThumb] = useState<string | null>(null);
  const [labelPhoto, setLabelPhoto] = useState<string | null>(null);
  const [labelThumb, setLabelThumb] = useState<string | null>(null);

  // Manual visual quality checklist (supports physical inspection + fallback if offline)
  const [manualFlags, setManualFlags] = useState({
    visibleMold: false,
    unusualDiscoloration: false,
    visibleSpoilage: false,
    damagedPackaging: false,
    unusualTexture: false,
  });

  // Packaged / Label inputs
  const [barcode, setBarcode] = useState('');
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [mfgDate, setMfgDate] = useState('');
  const [expDate, setExpDate] = useState('');
  const [bestBefore, setBestBefore] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [storageInstructions, setStorageInstructions] = useState('');
  const [ingredientsList, setIngredientsList] = useState('');
  const [ocrStatusMsg, setOcrStatusMsg] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [barcodeLookupMsg, setBarcodeLookupMsg] = useState<string | null>(null);

  // Camera
  const [cameraTarget, setCameraTarget] = useState<'food' | 'label' | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const foodFileRef = useRef<HTMLInputElement | null>(null);
  const labelFileRef = useRef<HTMLInputElement | null>(null);

  // Inspection result & educational state
  const [inspectLoading, setInspectLoading] = useState(false);
  const [inspectError, setInspectError] = useState<string | null>(null);
  const [activeReport, setActiveReport] = useState<FoodSafetyCenterReport | null>(null);
  const [selectedEduCategory, setSelectedEduCategory] = useState<SafetyFoodCategory>('fish');
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraTarget(null);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const startCamera = async (target: 'food' | 'label', mode: 'environment' | 'user' = facingMode) => {
    setCameraError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        isBn
          ? 'এই ব্রাউজারে সরাসরি ক্যামেরা সমর্থিত নয়। ছবি আপলোড ব্যবহার করুন।'
          : 'Live camera access is unavailable in this browser. Upload a photo from your device instead.'
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
      setCameraTarget(target);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 60);
    } catch {
      setCameraTarget(null);
      setCameraError(
        isBn
          ? 'ক্যামেরার অনুমতি মেলেনি। গ্যালারি থেকে ছবি আপলোড করুন।'
          : 'Camera permission denied or unavailable. Please upload a photo from gallery.'
      );
    }
  };

  const captureFrame = async () => {
    if (!videoRef.current || !cameraTarget) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const raw = canvas.toDataURL('image/jpeg', 0.9);

    // Optional native browser BarcodeDetector check
    try {
      const BD = (window as any).BarcodeDetector;
      if (typeof BD === 'function') {
        const det = new BD({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'] });
        const codes = await det.detect(canvas);
        if (codes?.[0]?.rawValue) {
          const clean = String(codes[0].rawValue).replace(/[^0-9]/g, '');
          if (clean.length >= 8) {
            setBarcode(clean);
            setFoodCategory('packaged_food');
          }
        }
      }
    } catch {
      // ignore if unsupported
    }

    const target = cameraTarget;
    stopCamera();
    await applyImage(target, raw);
  };

  const applyImage = async (target: 'food' | 'label', rawDataUrl: string) => {
    const full = await compressPhoto(rawDataUrl, 1280, 0.85);
    const thumb = await compressPhoto(rawDataUrl, 340, 0.72);
    if (target === 'food') {
      setFoodPhoto(full);
      setFoodThumb(thumb);
    } else {
      setLabelPhoto(full);
      setLabelThumb(thumb);
      setFoodCategory('packaged_food');
    }
  };

  const handleFileChange = (target: 'food' | 'label', file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setInspectError(
        isBn ? 'বৈধ ছবির ফাইল (JPG, PNG, WebP) নির্বাচন করুন।' : 'Select a valid JPG, PNG, or WebP image file.'
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await applyImage(target, String(reader.result || ''));
      } catch {
        setInspectError(isBn ? 'ছবিটি পড়া যায়নি।' : 'Could not decode image file.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRunLabelOcr = async () => {
    if (!labelPhoto) {
      setOcrStatusMsg(
        isBn ? 'প্রথমে প্যাকেটের লেবেল ছবি আপলোড করুন।' : 'Upload or capture a package label image first.'
      );
      return;
    }
    setOcrLoading(true);
    setOcrStatusMsg(null);
    try {
      const res = await fetch('/api/safety-center/ocr-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: labelPhoto }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(isBn && data.errorBn ? data.errorBn : data.error || 'OCR failed');
      }
      const ocr: LabelOcrResult = data.labelOcr;
      if (ocr.productName) setProductName(ocr.productName);
      if (ocr.brand) setBrand(ocr.brand);
      if (ocr.manufacturer) setManufacturer(ocr.manufacturer);
      if (ocr.mfgDate) setMfgDate(ocr.mfgDate);
      if (ocr.expDate) setExpDate(ocr.expDate);
      if (ocr.bestBefore) setBestBefore(ocr.bestBefore);
      if (ocr.batchNumber) setBatchNumber(ocr.batchNumber);
      if (ocr.storageInstructions) setStorageInstructions(ocr.storageInstructions);
      if (ocr.ingredients) setIngredientsList(ocr.ingredients);
      if (data.barcodeDigits) setBarcode(data.barcodeDigits);
      if (data.openFoodFactsProduct?.found) {
        const p = data.openFoodFactsProduct;
        if (!ocr.productName && p.productName) setProductName(p.productName);
        if (!ocr.brand && p.brand) setBrand(p.brand);
        if (!ocr.manufacturer && p.manufacturer) setManufacturer(p.manufacturer);
        if (!ocr.ingredients && p.ingredientsList) setIngredientsList(p.ingredientsList);
      }

      setOcrStatusMsg(isBn ? ocr.expiryNoteBn : ocr.expiryNote);
    } catch (err: any) {
      setOcrStatusMsg(err?.message || 'Could not read label automatically.');
    } finally {
      setOcrLoading(false);
    }
  };

  const handleBarcodeLookup = async () => {
    const clean = barcode.replace(/[^0-9]/g, '');
    if (clean.length < 8) {
      setBarcodeLookupMsg(isBn ? '৮–১৪ সংখ্যার বারকোড লিখুন।' : 'Enter an 8–14 digit barcode.');
      return;
    }
    setBarcodeLookupMsg(isBn ? 'খোঁজা হচ্ছে...' : 'Checking barcode registry...');
    try {
      const res = await fetch(`/api/food-scanner/barcode/${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(isBn && data.errorBn ? data.errorBn : data.error);
      if (data.found) {
        setFoodCategory('packaged_food');
        if (data.productName) setProductName(data.productName);
        if (data.brand) setBrand(data.brand);
        if (data.manufacturer) setManufacturer(data.manufacturer);
        if (data.ingredientsList) setIngredientsList(data.ingredientsList);
        setBarcodeLookupMsg(
          isBn
            ? `OpenFoodFacts-এ পণ্য পাওয়া গেছে: ${data.productName || clean}`
            : `Matched OpenFoodFacts record: ${data.productName || clean}`
        );
      } else {
        setBarcodeLookupMsg(
          isBn
            ? 'বারকোড OpenFoodFacts-এ পাওয়া যায়নি — নিচে হাতে তথ্য যোগ করুন।'
            : 'Barcode not found in OpenFoodFacts — enter packet details manually below.'
        );
      }
    } catch (err: any) {
      setBarcodeLookupMsg(err?.message || 'Lookup failed');
    }
  };

  const handleRunSafetyInspection = async () => {
    setInspectLoading(true);
    setInspectError(null);
    try {
      const res = await fetch('/api/safety-center/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodImageBase64: foodPhoto || undefined,
          labelImageBase64: labelPhoto || undefined,
          foodCategory,
          foodNameHint: foodNameHint.trim() || productName.trim() || undefined,
          barcode: barcode.trim() || undefined,
          manualVisualFlags: manualFlags,
          manualPackaged:
            foodCategory === 'packaged_food' || barcode || productName || expDate || mfgDate || batchNumber
              ? {
                  barcode: barcode.trim() || undefined,
                  productName: productName.trim() || undefined,
                  brand: brand.trim() || undefined,
                  manufacturer: manufacturer.trim() || undefined,
                  mfgDate: mfgDate.trim() || undefined,
                  expiryDate: expDate.trim() || undefined,
                  bestBefore: bestBefore.trim() || undefined,
                  batchNumber: batchNumber.trim() || undefined,
                  storageInstructions: storageInstructions.trim() || undefined,
                  ingredientsList: ingredientsList.trim() || undefined,
                }
              : undefined,
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(isBn && data.errorBn ? data.errorBn : data.error || 'Safety inspection failed.');
      }

      const report: FoodSafetyCenterReport = {
        ...data.report,
        imageDataUrl: foodThumb || undefined,
        labelImageDataUrl: labelThumb || undefined,
      };
      setActiveReport(report);
      setSelectedEduCategory(report.foodCategory);
      setActiveTab('scanner');
    } catch (err: any) {
      setInspectError(err?.message || 'Safety assessment could not be completed.');
    } finally {
      setInspectLoading(false);
    }
  };

  // Recalculate expiry/categories live if user edits manual visual flags after generating a report
  const toggleReportVisualFlag = (
    key: 'visibleMold' | 'unusualDiscoloration' | 'visibleSpoilage' | 'damagedPackaging' | 'unusualTexture'
  ) => {
    if (!activeReport) return;
    const f = activeReport.freshness;
    const nextFreshness = {
      ...f,
      [key]: {
        detected: !f[key].detected,
        note: !f[key].detected ? 'Flagged by user inspection.' : 'Cleared by user.',
        noteBn: !f[key].detected ? 'ব্যবহারকারী কর্তৃক চিহ্নিত।' : 'ব্যবহারকারী কর্তৃক বাতিল।',
      },
    };
    const { overallStatus, assessments } = buildSixCategorySafetyReport({
      foodCategory: activeReport.foodCategory,
      foodName: activeReport.foodName,
      freshness: nextFreshness,
      labelOcr: activeReport.labelOcr,
      packagedInfo: activeReport.packagedInfo,
    });
    setActiveReport({
      ...activeReport,
      freshness: nextFreshness,
      overallStatus,
      assessments,
    });
  };

  const handleExportSafetyReport = (format: 'json' | 'txt') => {
    if (!activeReport) return;
    const slug = activeReport.foodName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 28) || 'safety';
    let content = '';
    let mime = 'application/json';
    let ext = 'json';

    if (format === 'json') {
      content = JSON.stringify(
        { ...activeReport, imageDataUrl: undefined, labelImageDataUrl: undefined },
        null,
        2
      );
    } else {
      mime = 'text/plain;charset=utf-8';
      ext = 'txt';
      content = [
        '============================================================',
        'NUTRISMART AI — FOOD SAFETY & AUTHENTICITY REPORT',
        '============================================================',
        `Report ID: ${activeReport.id}`,
        `Timestamp: ${activeReport.displayDate}`,
        `Food: ${activeReport.foodName} (${activeReport.foodNameBn})`,
        `Category: ${activeReport.foodCategory}`,
        `Overall Status: ${activeReport.overallStatus}`,
        '',
        '--- 6-CATEGORY SAFETY ASSESSMENT ---',
        ...activeReport.assessments.map(
          (a) => `${a.code}. ${a.title}: [${a.status}]\n   ${a.summary}\n   Details: ${a.details.join(' | ')}`
        ),
        '',
        '--- CRITICAL SAFETY RULE ---',
        CRITICAL_SAFETY_RULE,
      ].join('\n');
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aahariq-safety-${slug}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification(
      isBn ? `নিরাপত্তা রিপোর্ট (${ext.toUpperCase()}) ডাউনলোড হয়েছে` : `Exported ${ext.toUpperCase()} safety report`
    );
  };

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const comparedReports = compareIds
    .map((id) => safetyReportsHistory.find((r) => r.id === id))
    .filter((r): r is FoodSafetyCenterReport => Boolean(r));

  const liveExpiryPreview = evaluateExpiryStatus(expDate, bestBefore);
  const currentAdulterationProfile = getAdulterationProfileForCategory(
    activeReport ? activeReport.foodCategory : selectedEduCategory
  );

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-[#16382C] via-[#1E4A3B] to-[#122E24] text-white p-6 sm:p-8 rounded-2xl border border-emerald-800/40 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-300 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>
                {isBn
                  ? 'ভিজ্যুয়াল যাচাই · লেবেল OCR · বারকোড · BFSA / BSTI / NFSL নির্দেশিকা'
                  : 'Visual Freshness · Label OCR · Barcode Verification · Bangladesh Food Safety'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {isBn ? 'খাদ্য নিরাপত্তা ও বিশুদ্ধতা যাচাই কেন্দ্র' : 'Food Safety & Authenticity Center'}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              {isBn
                ? 'তাজা সবজি, ফল, মাছ, মাংস, রান্না খাবার ও প্যাকেটজাত পণ্যের দৃশ্যমান মান, মেয়াদ, বারকোড ও ভেজাল-সংক্রান্ত ল্যাব পরীক্ষার দিকনির্দেশনা পান।'
                : 'Inspect visible freshness cues, read package expiry labels with OCR, verify product barcodes, explore food adulteration lab tests, and save safety assessments.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'scanner', icon: Camera, en: 'Safety Scanner', bn: 'নিরাপত্তা স্ক্যানার' },
                { id: 'label-barcode', icon: FileSearch, en: 'Label OCR & Barcode', bn: 'লেবেল ও বারকোড' },
                { id: 'bfsa-labs', icon: Building2, en: 'BFSA Lab Repository', bn: 'BFSA ল্যাব ডিরেক্টরি' },
                { id: 'bfsa-portal', icon: Megaphone, en: 'BFSA Official Center', bn: 'BFSA সরকারি তথ্য' },
                { id: 'education', icon: BookOpen, en: 'Adulteration & Hygiene', bn: 'ভেজাল ও স্বাস্থ্যবিধি' },
                {
                  id: 'history',
                  icon: History,
                  en: `History (${safetyReportsHistory.length})`,
                  bn: `ইতিহাস (${safetyReportsHistory.length})`,
                },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
                    activeTab === tab.id
                      ? 'bg-white text-emerald-950'
                      : 'bg-emerald-900/60 text-emerald-100 hover:bg-emerald-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{isBn ? tab.bn : tab.en}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* CRITICAL SAFETY RULE BANNER (Always visible across tabs) */}
      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-300 text-amber-950 text-xs flex items-start space-x-3">
        <Microscope className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-extrabold uppercase tracking-wider text-[11px] block">
            {isBn ? 'অবশ্যপাঠ্য বৈজ্ঞানিক নীতি' : 'Critical Scientific & Food Safety Rule'}
          </span>
          <p className="font-semibold leading-relaxed">
            {isBn ? CRITICAL_SAFETY_RULE_BN : CRITICAL_SAFETY_RULE}
          </p>
        </div>
      </div>

      {/* REQUIREMENT F: 5 QUICK-ACTION BFSA INTEGRATION DASHBOARD CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <button
          type="button"
          onClick={() => {
            setActiveTab('bfsa-labs');
            setBfsaLabsFocusMode('directory');
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
            activeTab === 'bfsa-labs' && bfsaLabsFocusMode === 'directory'
              ? 'bg-emerald-50 border-emerald-500 shadow-sm'
              : 'bg-white border-stone-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <Building2 className="w-4 h-4 text-emerald-700" />
            <span className="text-[10px] font-bold uppercase text-stone-400">labrepository</span>
          </div>
          <div>
            <span className="font-extrabold text-stone-900 text-xs block">
              {isBn ? '১. টেস্টিং ল্যাব খুঁজুন' : 'Find Testing Laboratory'}
            </span>
            <span className="text-[11px] text-stone-500">
              {isBn ? 'বিভাগ ও জেলা অনুযায়ী খুঁজুন' : 'Search by food, division & district'}
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('bfsa-labs');
            setBfsaLabsFocusMode('parameters');
            if (bfsaSelectedMatrix === 'all') setBfsaSelectedMatrix('vegetables');
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
            activeTab === 'bfsa-labs' && bfsaLabsFocusMode === 'parameters'
              ? 'bg-emerald-50 border-emerald-500 shadow-sm'
              : 'bg-white border-stone-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <Search className="w-4 h-4 text-emerald-700" />
            <span className="text-[10px] font-bold uppercase text-stone-400">BFSA Tests</span>
          </div>
          <div>
            <span className="font-extrabold text-stone-900 text-xs block">
              {isBn ? '২. টেস্ট প্যারামিটার খুঁজুন' : 'Search Food Testing Parameters'}
            </span>
            <span className="text-[11px] text-stone-500">
              {isBn ? 'সবজি, মাছ, দুধ ও মসলার টেস্ট' : 'Recommended lab assays by food'}
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('bfsa-labs');
            setBfsaLabsFocusMode('compare');
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
            activeTab === 'bfsa-labs' && bfsaLabsFocusMode === 'compare'
              ? 'bg-emerald-50 border-emerald-500 shadow-sm'
              : 'bg-white border-stone-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <GitCompare className="w-4 h-4 text-emerald-700" />
            <span className="text-[10px] font-bold uppercase text-stone-400">Side-by-Side</span>
          </div>
          <div>
            <span className="font-extrabold text-stone-900 text-xs block">
              {isBn ? '৩. ল্যাবরেটরি তুলনা করুন' : 'Compare Laboratories'}
            </span>
            <span className="text-[11px] text-stone-500">
              {isBn ? 'অ্যাক্রেডিটেশন, ফি, সময় ও প্যারামিটার' : 'Compare scope, fees & accreditation'}
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('bfsa-portal');
            setBfsaPortalFilter('food_safety_alert');
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
            activeTab === 'bfsa-portal' && bfsaPortalFilter === 'food_safety_alert'
              ? 'bg-rose-50 border-rose-400 shadow-sm'
              : 'bg-white border-stone-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <Megaphone className="w-4 h-4 text-rose-700" />
            <span className="text-[10px] font-bold uppercase text-stone-400">bfsa.gov.bd</span>
          </div>
          <div>
            <span className="font-extrabold text-stone-900 text-xs block">
              {isBn ? '৪. BFSA খাদ্য সতর্কতা' : 'BFSA Food Safety Alerts'}
            </span>
            <span className="text-[11px] text-stone-500">
              {isBn ? 'সতর্কতা, প্রত্যাহার ও বিজ্ঞপ্তি' : 'Public alerts & recall notices'}
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('bfsa-portal');
            setBfsaPortalFilter('safety_guideline');
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
            activeTab === 'bfsa-portal' && bfsaPortalFilter === 'safety_guideline'
              ? 'bg-amber-50 border-amber-400 shadow-sm'
              : 'bg-white border-stone-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <BookOpen className="w-4 h-4 text-amber-700" />
            <span className="text-[10px] font-bold uppercase text-stone-400">Directives</span>
          </div>
          <div>
            <span className="font-extrabold text-stone-900 text-xs block">
              {isBn ? '৫. সরকারি খাদ্য নির্দেশিকা' : 'Official Food Safety Guidelines'}
            </span>
            <span className="text-[11px] text-stone-500">
              {isBn ? 'পারিবারিক ও লেবেলিং বিধি' : 'Regulations, labeling & hotline 16155'}
            </span>
          </div>
        </button>
      </div>

      {/* LIVE CAMERA MODAL OVERLAY WHEN CAMERA IS ACTIVE */}
      {cameraTarget && (
        <div className="bg-white rounded-2xl p-5 border border-stone-300 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-stone-900">
              {cameraTarget === 'food'
                ? isBn
                  ? 'খাবারের ছবি তুলুন'
                  : 'Capture Food Photo'
                : isBn
                ? 'প্যাকেটের লেবেল ও মেয়াদের ছবি তুলুন'
                : 'Capture Package Label / Expiry Stamp'}
            </span>
            <button onClick={stopCamera} className="text-xs text-stone-500 hover:text-rose-600 font-bold">
              {isBn ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>
          <div className="relative rounded-xl overflow-hidden bg-black max-h-[380px] aspect-video mx-auto">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const next = facingMode === 'environment' ? 'user' : 'environment';
                  setFacingMode(next);
                  void startCamera(cameraTarget, next);
                }}
                className="p-2 rounded-lg bg-black/70 text-white"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={captureFrame}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                {isBn ? 'ছবি তুলুন' : 'Capture Photo'}
              </button>
              <button type="button" onClick={stopCamera} className="p-2 rounded-lg bg-black/70 text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: SAFETY SCANNER & 6-CATEGORY REPORT */}
      {activeTab === 'scanner' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Capture, Category, Manual Physical Checklist (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
              <h2 className="font-extrabold text-stone-900 text-sm flex items-center space-x-2">
                <Camera className="w-4 h-4 text-emerald-700" />
                <span>{isBn ? '১. খাদ্য নিরাপত্তা স্ক্যানার' : '1. Food Safety Image Scanner'}</span>
              </h2>

              {/* Food Category Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-700 block">
                  {isBn ? 'খাদ্যের ধরন নির্বাচন করুন' : 'Select Food Category'}
                </label>
                <select
                  value={foodCategory}
                  onChange={(e) => setFoodCategory(e.target.value as SafetyFoodCategory)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900"
                >
                  <option value="vegetables">{isBn ? 'তাজা শাকসবজি (Vegetables)' : 'Fresh Vegetables (শাকসবজি)'}</option>
                  <option value="fruits">{isBn ? 'তাজা ফলমূল (Fruits)' : 'Fresh Fruits (ফলমূল)'}</option>
                  <option value="fish">{isBn ? 'তাজা বা শুঁটকি মাছ (Fish)' : 'Fresh & Dried Fish (মাছ)'}</option>
                  <option value="meat">{isBn ? 'মাংস ও পোল্ট্রি (Meat)' : 'Meat & Poultry (মাংস)'}</option>
                  <option value="cooked_food">{isBn ? 'রান্না করা খাবার (Cooked Food)' : 'Cooked Meals & Street Food'}</option>
                  <option value="packaged_food">{isBn ? 'প্যাকেটজাত খাদ্য (Packaged Food)' : 'Packaged Food & Beverages'}</option>
                  <option value="dairy_spices">{isBn ? 'দুধ, দই, তেল ও মসলা' : 'Milk, Dairy, Oil & Spices'}</option>
                </select>
              </div>

              {/* Food Photo Upload / Camera Box */}
              {foodPhoto ? (
                <div className="relative rounded-xl overflow-hidden bg-stone-100 aspect-[4/3] border border-stone-200">
                  <img src={foodPhoto} alt="Food sample" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setFoodPhoto(null);
                      setFoodThumb(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-white hover:bg-rose-700"
                    title="Remove photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFileChange('food', e.dataTransfer.files?.[0]);
                  }}
                  className="rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 p-5 text-center space-y-2.5"
                >
                  <p className="text-xs font-bold text-stone-800">
                    {isBn
                      ? 'সবজি, ফল, মাছ, মাংস, রান্না খাবার বা প্যাকেটের ছবি দিন'
                      : 'Take or upload a photo of produce, fish, meat, cooked food, or package'}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => void startCamera('food')}
                      className="px-3 py-1.5 rounded-lg bg-[#1B4332] text-white text-xs font-bold flex items-center space-x-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{isBn ? 'ক্যামেরা' : 'Camera'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => foodFileRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-800 text-xs font-bold flex items-center space-x-1.5"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{isBn ? 'গ্যালারি আপলোড' : 'Upload Image'}</span>
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={foodFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  handleFileChange('food', e.target.files?.[0]);
                  e.target.value = '';
                }}
              />

              {cameraError && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  {cameraError}
                </div>
              )}

              {/* Food Name & Quick Barcode */}
              <div className="space-y-2">
                <input
                  type="text"
                  value={foodNameHint}
                  onChange={(e) => setFoodNameHint(e.target.value)}
                  placeholder={
                    isBn
                      ? 'খাবারের নাম (যেমন: ইলিশ মাছ, লাল শাক, আম, গরুর দুধ)...'
                      : 'Food name (e.g., Hilsa Fish, Tomato, Mango, Raw Milk)...'
                  }
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder={isBn ? 'প্যাকেটের বারকোড (ঐচ্ছিক)' : 'Package barcode (optional)'}
                    className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-900"
                  />
                  <button
                    type="button"
                    onClick={() => setActiveTab('label-barcode')}
                    className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold shrink-0"
                  >
                    {isBn ? 'লেবেল OCR' : 'Label OCR'}
                  </button>
                </div>
              </div>

              {/* Observable Physical Checklist */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <span className="text-[11px] font-bold text-stone-700 block">
                  {isBn
                    ? 'দৃশ্যমান সমস্যা চোখে পড়লে টিক দিন (ঐচ্ছিক):'
                    : 'Flag any visible signs you directly observe (optional):'}
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  {(
                    [
                      { key: 'visibleMold', en: 'Visible Mold', bn: 'ছত্রাক' },
                      { key: 'unusualDiscoloration', en: 'Unusual Color', bn: 'অস্বাভাবিক রঙ' },
                      { key: 'visibleSpoilage', en: 'Signs of Spoilage', bn: 'পচন / গন্ধ' },
                      { key: 'damagedPackaging', en: 'Damaged Seal', bn: 'ক্ষতিগ্রস্ত প্যাকেট' },
                      { key: 'unusualTexture', en: 'Slime / Odd Texture', bn: 'পিচ্ছিল / অস্বাভাবিক' },
                    ] as const
                  ).map((item) => (
                    <label
                      key={item.key}
                      className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer ${
                        manualFlags[item.key]
                          ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold'
                          : 'bg-stone-50 border-stone-200 text-stone-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={manualFlags[item.key]}
                        onChange={(e) =>
                          setManualFlags((prev) => ({ ...prev, [item.key]: e.target.checked }))
                        }
                        className="rounded text-rose-600"
                      />
                      <span>{isBn ? item.bn : item.en}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="button"
                disabled={inspectLoading}
                onClick={() => void handleRunSafetyInspection()}
                className="w-full py-3 rounded-xl bg-[#1B4332] hover:bg-[#255C45] text-white text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {inspectLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{isBn ? 'যাচাই চলছে...' : 'Running Safety Inspection...'}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />
                    <span>{isBn ? 'খাদ্য নিরাপত্তা রিপোর্ট তৈরি করুন' : 'Run Food Safety Assessment'}</span>
                  </>
                )}
              </button>

              {inspectError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
                  {inspectError}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: 6-Category Food Safety Report & Freshness Breakdown (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            {!activeReport ? (
              <div className="bg-white rounded-2xl p-8 border border-stone-200 text-center space-y-3">
                <ShieldAlert className="w-10 h-10 text-emerald-700 mx-auto" />
                <h3 className="font-extrabold text-stone-900 text-base">
                  {isBn
                    ? '৬-স্তরের খাদ্য নিরাপত্তা ও বিশুদ্ধতা রিপোর্ট'
                    : '6-Category Food Safety & Authenticity Report'}
                </h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                  {isBn
                    ? 'বামপাশ থেকে ছবি, খাবারের নাম বা প্যাকেটের বারকোড দিয়ে পরীক্ষা শুরু করুন। রিপোর্টে দৃশ্যমান অবস্থা, লেবেল, মেয়াদ, পণ্য তথ্য, ভেজাল অবস্থা এবং পরবর্তী করণীয় দেখাবে।'
                    : 'Submit a food photo, package label, barcode, or food details to generate assessments across Visible Condition, Label Verification, Expiry Status, Product Verification, Adulteration Status, and Recommended Next Steps.'}
                </p>
              </div>
            ) : (
              <>
                {/* Report Summary Header */}
                <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-stone-100 pb-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-stone-500">
                        <span>{activeReport.displayDate}</span>
                        <span>·</span>
                        <span className="uppercase font-sans font-bold text-stone-700">
                          {activeReport.foodCategory.replace('_', ' ')}
                        </span>
                      </div>
                      <h2 className="text-xl font-black text-stone-900">
                        {isBn ? activeReport.foodNameBn : activeReport.foodName}
                      </h2>
                      <div>
                        <span
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-xs font-extrabold ${getStatusBadgeClasses(
                            activeReport.overallStatus
                          )}`}
                        >
                          <span>
                            {isBn ? 'সামগ্রিক অবস্থা:' : 'Overall Assessment:'} {activeReport.overallStatus}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => saveSafetyReport(activeReport)}
                        className="px-3 py-1.5 rounded-lg bg-[#1B4332] text-white text-xs font-bold flex items-center space-x-1"
                      >
                        <BookmarkCheck className="w-3.5 h-3.5" />
                        <span>{isBn ? 'সংরক্ষণ' : 'Save'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExportSafetyReport('json')}
                        className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-xs font-bold flex items-center space-x-1"
                      >
                        <FileJson className="w-3.5 h-3.5 text-emerald-700" />
                        <span>JSON</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExportSafetyReport('txt')}
                        className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-xs font-bold flex items-center space-x-1"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-700" />
                        <span>{isBn ? 'রিপোর্ট' : 'TXT'}</span>
                      </button>
                    </div>
                  </div>

                  {/* A through F Separate Assessment Categories */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-600">
                      {isBn ? 'নিরাপত্তা মূল্যায়নের ৬টি বিভাগ (A–F)' : 'Safety Assessment Categories (A–F)'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activeReport.assessments.map((cat) => (
                        <div
                          key={cat.key}
                          className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-extrabold text-stone-900">
                              {cat.code}. {isBn ? cat.titleBn : cat.title}
                            </span>
                            <span
                              className={`shrink-0 px-2 py-0.5 rounded border text-[10px] font-bold ${getStatusBadgeClasses(
                                cat.status
                              )}`}
                            >
                              {cat.status}
                            </span>
                          </div>
                          <p className="text-stone-700 leading-relaxed">
                            {isBn ? cat.summaryBn : cat.summary}
                          </p>
                          {(isBn ? cat.detailsBn : cat.details).length > 0 && (
                            <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-stone-500">
                              {(isBn ? cat.detailsBn : cat.details).slice(0, 2).map((d, idx) => (
                                <li key={idx}>{d}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Freshness & Visible Spoilage Breakdown (Detected vs Could Not Determine) */}
                <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <h3 className="font-extrabold text-stone-900 text-sm flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-emerald-700" />
                      <span>
                        {isBn
                          ? 'তাজাভাব ও দৃশ্যমান পচন পরীক্ষা'
                          : 'Freshness & Spoilage Visual Indicators'}
                      </span>
                    </h3>
                    <span className="text-[11px] font-mono text-stone-500">
                      {isBn ? 'ছবির মান:' : 'Image:'} {activeReport.freshness.imageQuality}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                    {(
                      [
                        { key: 'visibleMold', en: 'Visible Mold', bn: 'ছত্রাক' },
                        { key: 'unusualDiscoloration', en: 'Discoloration', bn: 'রঙ পরিবর্তন' },
                        { key: 'visibleSpoilage', en: 'Spoilage', bn: 'পচন' },
                        { key: 'damagedPackaging', en: 'Pkg Damage', bn: 'প্যাকেট ক্ষতি' },
                        { key: 'unusualTexture', en: 'Odd Texture', bn: 'অস্বাভাবিক গঠন' },
                      ] as const
                    ).map((ind) => {
                      const val = activeReport.freshness[ind.key];
                      return (
                        <button
                          key={ind.key}
                          type="button"
                          onClick={() => toggleReportVisualFlag(ind.key)}
                          className={`p-2.5 rounded-xl border text-left transition-colors ${
                            val.detected
                              ? 'bg-rose-50 border-rose-300 text-rose-950 font-bold'
                              : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          <span className="block text-[10px] uppercase">{isBn ? ind.bn : ind.en}</span>
                          <span className="text-xs">
                            {val.detected
                              ? isBn
                                ? 'শনাক্ত'
                                : 'Detected'
                              : isBn
                              ? 'শনাক্ত হয়নি'
                              : 'Not Seen'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                      <span className="font-bold text-stone-900 block">
                        {isBn ? 'কী শনাক্ত করা গেছে:' : 'What Was Detected:'}
                      </span>
                      <ul className="list-disc pl-4 space-y-1 text-stone-600">
                        {(isBn
                          ? activeReport.freshness.whatWasDetectedBn
                          : activeReport.freshness.whatWasDetected
                        ).map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                      <span className="font-bold text-amber-950 block">
                        {isBn ? 'কী নির্ণয় করা সম্ভব হয়নি:' : 'What Could Not Be Determined:'}
                      </span>
                      <ul className="list-disc pl-4 space-y-1 text-amber-900">
                        {(isBn
                          ? activeReport.freshness.whatCouldNotBeDeterminedBn
                          : activeReport.freshness.whatCouldNotBeDetermined
                        ).map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Category-Specific Adulteration & Lab Test Guidance */}
                <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                    <h3 className="font-extrabold text-stone-900 text-sm flex items-center space-x-2">
                      <FlaskConical className="w-4 h-4 text-emerald-700" />
                      <span>
                        {isBn ? currentAdulterationProfile.titleBn : currentAdulterationProfile.title} —{' '}
                        {isBn ? 'ভেজাল ও ল্যাব পরীক্ষা' : 'Adulteration & Lab Testing Guidance'}
                      </span>
                    </h3>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setBfsaSelectedMatrix(mapSafetyCategoryToBfsaMatrix(activeReport.foodCategory));
                          setBfsaLabsFocusMode('parameters');
                          setActiveTab('bfsa-labs');
                        }}
                        className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100"
                      >
                        {isBn ? 'BFSA অনুমোদিত ল্যাব খুঁজুন →' : 'Find BFSA Labs & Tests →'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('education')}
                        className="text-[11px] font-bold text-stone-600 underline"
                      >
                        {isBn ? 'সম্পূর্ণ তথ্য দেখুন' : 'View Full Hub'}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <span className="font-bold text-stone-800 block mb-1">
                        {isBn ? 'সম্ভাব্য ভেজাল ঝুঁকি:' : 'Known Category Adulterants:'}
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5 text-stone-600">
                        {(isBn
                          ? currentAdulterationProfile.knownAdulterantsBn
                          : currentAdulterationProfile.knownAdulterants
                        ).map((k, i) => (
                          <li key={i}>{k}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-bold text-stone-800 block mb-1">
                        {isBn ? 'প্রস্তাবিত ল্যাবরেটরি পরীক্ষা:' : 'Recommended Laboratory Tests:'}
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5 text-stone-600">
                        {(isBn
                          ? currentAdulterationProfile.recommendedLabTestsBn
                          : currentAdulterationProfile.recommendedLabTests
                        ).map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: EXPIRY DATE, LABEL OCR READER & BARCODE VERIFICATION */}
      {activeTab === 'label-barcode' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Label Photo OCR Upload & Barcode Lookup */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
            <h2 className="font-extrabold text-stone-900 text-sm flex items-center space-x-2">
              <FileSearch className="w-4 h-4 text-emerald-700" />
              <span>{isBn ? 'প্যাকেটের লেবেল OCR ও মেয়াদ পরীক্ষক' : 'Label OCR & Expiry Checker'}</span>
            </h2>

            {labelPhoto ? (
              <div className="relative rounded-xl overflow-hidden bg-stone-100 aspect-[4/3] border border-stone-200">
                <img src={labelPhoto} alt="Package label" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setLabelPhoto(null);
                    setLabelThumb(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 p-5 text-center space-y-2.5">
                <p className="text-xs font-bold text-stone-800">
                  {isBn
                    ? 'প্যাকেটের MFG, EXP, ব্যাচ নম্বর ও উপাদান তালিকার ছবি আপলোড করুন'
                    : 'Upload or capture a photo showing MFG, EXP, Best Before, Batch No, and Storage text'}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => void startCamera('label')}
                    className="px-3 py-1.5 rounded-lg bg-[#1B4332] text-white text-xs font-bold flex items-center space-x-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{isBn ? 'লেবেল ছবি তুলুন' : 'Capture Label'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => labelFileRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-800 text-xs font-bold flex items-center space-x-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{isBn ? 'লেবেল আপলোড' : 'Upload Label'}</span>
                  </button>
                </div>
              </div>
            )}

            <input
              ref={labelFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                handleFileChange('label', e.target.files?.[0]);
                e.target.value = '';
              }}
            />

            <button
              type="button"
              disabled={ocrLoading || !labelPhoto}
              onClick={() => void handleRunLabelOcr()}
              className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center space-x-2 disabled:opacity-40"
            >
              {ocrLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{isBn ? 'OCR পড়া হচ্ছে...' : 'Reading Label Text (OCR)...'}</span>
                </>
              ) : (
                <>
                  <FileSearch className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{isBn ? 'OCR দিয়ে লেবেল পড়ুন' : 'Extract Dates & Label via OCR'}</span>
                </>
              )}
            </button>

            {ocrStatusMsg && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs">
                {ocrStatusMsg}
              </div>
            )}

            {/* Barcode Scanner Input */}
            <div className="pt-3 border-t border-stone-100 space-y-2">
              <label className="text-xs font-bold text-stone-800 flex items-center space-x-1.5">
                <Barcode className="w-4 h-4 text-emerald-700" />
                <span>{isBn ? 'বারকোড যাচাই (OpenFoodFacts)' : 'Packaged Food Barcode Lookup'}</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="e.g. 3017620422003"
                  className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => void handleBarcodeLookup()}
                  className="px-3.5 py-2 rounded-xl bg-[#1B4332] text-white text-xs font-bold"
                >
                  {isBn ? 'খুঁজুন' : 'Verify'}
                </button>
              </div>
              {barcodeLookupMsg && (
                <p className="text-[11px] font-semibold text-emerald-800">{barcodeLookupMsg}</p>
              )}
            </div>
          </div>

          {/* RIGHT: Extracted & Manual Label Verification Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-extrabold text-stone-900 text-sm flex items-center space-x-2">
                <CalendarClock className="w-4 h-4 text-emerald-700" />
                <span>
                  {isBn
                    ? 'লেবেল বিবরণ, মেয়াদ ও ম্যানুয়াল এন্ট্রি'
                    : 'Package Details, Dates & Manual Verification'}
                </span>
              </h3>
            </div>

            {/* Live Expiry Warning Box */}
            <div
              className={`p-3 rounded-xl border ${
                liveExpiryPreview.evaluation === 'expired'
                  ? 'bg-rose-50 border-rose-300 text-rose-950 font-bold'
                  : liveExpiryPreview.evaluation === 'missing_or_unreadable'
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-950'
              }`}
            >
              <span className="block font-extrabold uppercase text-[10px] mb-0.5">
                {isBn ? 'মেয়াদ মূল্যায়ন:' : 'Expiry Evaluation:'} {liveExpiryPreview.evaluation.replace(/_/g, ' ')}
              </span>
              <p>{isBn ? liveExpiryPreview.noteBn : liveExpiryPreview.note}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  {isBn ? 'পণ্যের নাম' : 'Product Name'}
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  {isBn ? 'ব্র্যান্ড' : 'Brand'}
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  {isBn ? 'প্রস্তুতকারক' : 'Manufacturer'}
                </label>
                <input
                  type="text"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  {isBn ? 'ব্যাচ / লট নম্বর' : 'Batch / Lot Number'}
                </label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="e.g., B-2026-44"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  {isBn ? 'উৎপাদন তারিখ (MFG Date)' : 'MFG Date'}
                </label>
                <input
                  type="text"
                  value={mfgDate}
                  onChange={(e) => setMfgDate(e.target.value)}
                  placeholder="YYYY-MM-DD"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  {isBn ? 'মেয়াদ উত্তীর্ণ (EXP Date)' : 'EXP Date'}
                </label>
                <input
                  type="text"
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  placeholder="YYYY-MM-DD"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  {isBn ? 'বেস্ট বিফোর (Best Before)' : 'Best Before'}
                </label>
                <input
                  type="text"
                  value={bestBefore}
                  onChange={(e) => setBestBefore(e.target.value)}
                  placeholder="e.g., 12/2027"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  {isBn ? 'সংরক্ষণ নির্দেশনা' : 'Storage Instructions'}
                </label>
                <input
                  type="text"
                  value={storageInstructions}
                  onChange={(e) => setStorageInstructions(e.target.value)}
                  placeholder="e.g., Store in a cool dry place"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1">
                {isBn ? 'উপাদান তালিকা' : 'Ingredients List'}
              </label>
              <textarea
                rows={2}
                value={ingredientsList}
                onChange={(e) => setIngredientsList(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setFoodCategory('packaged_food');
                void handleRunSafetyInspection();
              }}
              className="w-full py-3 rounded-xl bg-[#E76F51] hover:bg-[#d85c3f] text-white font-bold flex items-center justify-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {isBn
                  ? 'এই লেবেল ও বারকোড তথ্য দিয়ে সম্পূর্ণ নিরাপত্তা রিপোর্ট তৈরি করুন'
                  : 'Generate Full 6-Category Safety Report from Label & Barcode'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: ADULTERATION INFORMATION, CONTAMINATION EDUCATION & BANGLADESH AUTHORITIES */}
      {activeTab === 'education' && (
        <div className="space-y-6">
          {/* Adulteration Information by Food Category */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <h2 className="font-extrabold text-stone-900 text-base">
                  {isBn
                    ? 'খাদ্য ভেজাল সচেতনতা ও ল্যাবরেটরি পরীক্ষা নির্দেশিকা'
                    : 'Food Adulteration Information & Laboratory Verification'}
                </h2>
                <p className="text-xs text-stone-500">
                  {isBn
                    ? 'খাদ্য শ্রেণি অনুযায়ী সম্ভাব্য ভেজাল ঝুঁকি, পরিচিত ভেজাল উপাদান, সরকারি সতর্কতা ও নির্ভুল ল্যাব পরীক্ষা জানুন।'
                    : 'Inspect possible adulteration concerns, known category adulterants, official alert guidance, and accredited lab tests.'}
                </p>
              </div>
              <select
                value={selectedEduCategory}
                onChange={(e) => setSelectedEduCategory(e.target.value as SafetyFoodCategory)}
                className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900"
              >
                {ADULTERATION_PROFILES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {isBn ? p.titleBn : p.title}
                  </option>
                ))}
              </select>
            </div>

            {(() => {
              const prof = getAdulterationProfileForCategory(selectedEduCategory);
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
                    <span className="font-extrabold text-stone-900 block">
                      {isBn ? '১. সম্ভাব্য ভেজাল ঝুঁকি' : '1. Possible Adulteration Concerns'}
                    </span>
                    <ul className="list-disc pl-4 space-y-1 text-stone-700">
                      {(isBn ? prof.possibleConcernsBn : prof.possibleConcerns).map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
                    <span className="font-extrabold text-stone-900 block">
                      {isBn ? '২. পরিচিত ভেজাল উপাদান' : '2. Known Associated Adulterants'}
                    </span>
                    <ul className="list-disc pl-4 space-y-1 text-stone-700">
                      {(isBn ? prof.knownAdulterantsBn : prof.knownAdulterants).map((k, i) => (
                        <li key={i}>{k}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
                    <span className="font-extrabold text-stone-900 block">
                      {isBn ? '৩. সরকারি খাদ্য নিরাপত্তা সতর্কতা' : '3. Official Food Safety Alerts Guidance'}
                    </span>
                    <p className="text-stone-700 leading-relaxed">
                      {isBn ? prof.officialAlertGuidanceBn : prof.officialAlertGuidance}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                    <span className="font-extrabold text-emerald-950 block">
                      {isBn ? '৪. প্রস্তাবিত ল্যাবরেটরি পরীক্ষা' : '4. Recommended Laboratory Tests'}
                    </span>
                    <ul className="list-disc pl-4 space-y-1 text-emerald-900">
                      {(isBn ? prof.recommendedLabTestsBn : prof.recommendedLabTests).map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* 6-Topic Contamination, Storage & Hygiene Educational Database */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
            <h2 className="font-extrabold text-stone-900 text-base">
              {isBn
                ? 'খাদ্য দূষণ, সংরক্ষণ ও পরিচ্ছন্নতা শিক্ষা ডেটাবেজ'
                : 'Food Contamination, Storage & Hygiene Educational Database'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {CONTAMINATION_EDUCATION_TOPICS.map((topic) => (
                <div
                  key={topic.id}
                  className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-stone-900 text-sm">
                      {isBn ? topic.titleBn : topic.title}
                    </h3>
                    <p className="text-stone-600 leading-relaxed">
                      {isBn ? topic.summaryBn : topic.summary}
                    </p>
                    <div>
                      <span className="font-bold text-stone-800 block">
                        {isBn ? 'প্রতিরোধ ও সতর্কতা:' : 'Prevention:'}
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5 text-stone-600 mt-0.5">
                        {(isBn ? topic.preventionStepsBn : topic.preventionSteps).map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-stone-200/80 text-[11px]">
                    <span className="font-bold text-emerald-800 block">
                      {isBn ? 'ল্যাব পরীক্ষা:' : 'Laboratory Tests:'}
                    </span>
                    <span className="text-stone-700">
                      {(isBn ? topic.laboratoryTestsBn : topic.laboratoryTests).join(' · ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trusted Verification Sources & Bangladesh Official Authorities */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
            <h2 className="font-extrabold text-stone-900 text-base">
              {isBn
                ? 'বাংলাদেশ ও আন্তর্জাতিক অনুমোদিত যাচাই সংস্থা (Official Sources)'
                : 'Trusted Verification Sources & Bangladesh Official Authorities'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {BANGLADESH_OFFICIAL_AUTHORITIES.map((auth) => (
                <div
                  key={auth.url}
                  className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between space-y-2"
                >
                  <div className="space-y-1">
                    <span className="font-extrabold text-stone-900 block">
                      {isBn ? auth.nameBn : auth.name}
                    </span>
                    <p className="text-stone-600 leading-relaxed">
                      {isBn ? auth.roleBn : auth.role}
                    </p>
                    {auth.hotline && (
                      <span className="inline-block font-mono font-bold text-rose-700">
                        {isBn ? `হটলাইন: ${auth.hotline}` : `Hotline: ${auth.hotline}`}
                      </span>
                    )}
                  </div>
                  <a
                    href={auth.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 font-bold text-emerald-700 hover:text-emerald-900"
                  >
                    <span>{auth.url.replace('https://', '')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SCAN HISTORY & SIDE-BY-SIDE COMPARISON */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <h2 className="font-extrabold text-stone-900 text-base">
                  {isBn ? 'সংরক্ষিত নিরাপত্তা রিপোর্টের ইতিহাস' : 'Saved Food Safety Reports'}
                </h2>
                <p className="text-xs text-stone-500">
                  {isBn
                    ? 'পূর্ববর্তী রিপোর্ট দেখুন, যেকোনো ২টি তুলনা করুন অথবা এক্সপোর্ট করুন।'
                    : 'Review timestamped assessments, select any 2 to compare, or clear history.'}
                </p>
              </div>
              {safetyReportsHistory.length > 0 && (
                <button
                  onClick={clearSafetyHistory}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-700 text-xs font-bold"
                >
                  {isBn ? 'সব মুছুন' : 'Clear History'}
                </button>
              )}
            </div>

            {safetyReportsHistory.length === 0 ? (
              <div className="py-10 text-center text-xs text-stone-500 space-y-2">
                <History className="w-8 h-8 mx-auto text-stone-300" />
                <p>
                  {isBn
                    ? 'এখনো কোনো নিরাপত্তা রিপোর্ট সংরক্ষিত নেই।'
                    : 'No saved food safety reports yet. Run an inspection and click "Save".'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {safetyReportsHistory.map((rep) => {
                  const selected = compareIds.includes(rep.id);
                  return (
                    <div
                      key={rep.id}
                      className={`p-4 rounded-xl border flex gap-3 items-start text-xs ${
                        selected ? 'bg-emerald-50/50 border-emerald-400' : 'bg-stone-50 border-stone-200'
                      }`}
                    >
                      {rep.imageDataUrl && (
                        <img
                          src={rep.imageDataUrl}
                          alt={rep.foodName}
                          className="w-16 h-16 rounded-lg object-cover shrink-0 border border-stone-200"
                        />
                      )}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-extrabold text-stone-900 truncate">
                              {isBn ? rep.foodNameBn : rep.foodName}
                            </h3>
                            <span className="font-mono text-[11px] text-stone-500">{rep.displayDate}</span>
                          </div>
                          <button
                            onClick={() => deleteSafetyReport(rep.id)}
                            className="p-1 text-stone-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div>
                          <span
                            className={`inline-block px-2 py-0.5 rounded border text-[10px] font-bold ${getStatusBadgeClasses(
                              rep.overallStatus
                            )}`}
                          >
                            {rep.overallStatus}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => {
                              setActiveReport(rep);
                              setActiveTab('scanner');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#1B4332] text-white text-[11px] font-bold"
                          >
                            {isBn ? 'রিপোর্ট দেখুন' : 'Open Report'}
                          </button>
                          <button
                            onClick={() => toggleCompare(rep.id)}
                            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold ${
                              selected
                                ? 'bg-emerald-700 text-white border-emerald-700'
                                : 'bg-white text-stone-700 border-stone-300'
                            }`}
                          >
                            {selected ? (isBn ? 'নির্বাচিত' : 'Selected') : isBn ? 'তুলনা' : 'Compare'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Side-by-Side Comparison Matrix */}
          {comparedReports.length === 2 && (
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-stone-100 pb-3">
                <GitCompare className="w-4 h-4 text-emerald-700" />
                <h3 className="font-extrabold text-stone-900 text-sm">
                  {isBn ? 'দুটি নিরাপত্তা মূল্যায়নের তুলনা' : 'Side-by-Side Safety Assessment Comparison'}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-500">
                      <th className="py-2 pr-4 font-bold">{isBn ? 'বিভাগ' : 'Assessment Category'}</th>
                      <th className="py-2 px-4 font-extrabold text-stone-900">
                        {isBn ? comparedReports[0].foodNameBn : comparedReports[0].foodName}
                      </th>
                      <th className="py-2 px-4 font-extrabold text-stone-900">
                        {isBn ? comparedReports[1].foodNameBn : comparedReports[1].foodName}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {comparedReports[0].assessments.map((cat, idx) => {
                      const cat2 = comparedReports[1].assessments[idx];
                      return (
                        <tr key={cat.key}>
                          <td className="py-2.5 pr-4 font-bold text-stone-700">
                            {cat.code}. {isBn ? cat.titleBn : cat.title}
                          </td>
                          <td className="py-2.5 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded border text-[10px] font-bold ${getStatusBadgeClasses(
                                cat.status
                              )}`}
                            >
                              {cat.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-4">
                            {cat2 && (
                              <span
                                className={`inline-block px-2 py-0.5 rounded border text-[10px] font-bold ${getStatusBadgeClasses(
                                  cat2.status
                                )}`}
                              >
                                {cat2.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
      {/* TAB 5 & 6: OFFICIAL BANGLADESH FOOD SAFETY AUTHORITY INTEGRATION */}
      {(activeTab === 'bfsa-labs' || activeTab === 'bfsa-portal') && (
        <BfsaIntegrationSection
          mode={activeTab}
          isBn={isBn}
          labsFocusMode={bfsaLabsFocusMode}
          setLabsFocusMode={setBfsaLabsFocusMode}
          selectedMatrixCategory={bfsaSelectedMatrix}
          setSelectedMatrixCategory={setBfsaSelectedMatrix}
          portalCategoryFilter={bfsaPortalFilter}
          setPortalCategoryFilter={setBfsaPortalFilter}
          onNotify={showNotification}
        />
      )}
    </div>
  );
};
