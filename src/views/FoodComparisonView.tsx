import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  BD_FCT_DATABASE,
  scaleBdFctNutrients,
  searchBdFctFoods,
} from '../data/bdFctDatabase';
import { BdFctFoodRecord } from '../types';
import {
  Scale,
  Search,
  Plus,
  X,
  Bookmark,
  Trash2,
  Info,
  BarChart3,
  BookOpen,
} from 'lucide-react';

interface ComparisonPreset {
  id: string;
  labelEn: string;
  labelBn: string;
  codes: string[];
  queries: string[];
}

const COMPARISON_PRESETS: ComparisonPreset[] = [
  {
    id: 'rice-vs-roti',
    labelEn: 'Rice vs Roti',
    labelBn: 'ভাত বনাম রুটি',
    codes: ['01_0037', '01_0023'],
    queries: ['Rice, BR-28, boiled', 'Bread, wheat (roti)'],
  },
  {
    id: 'apple-vs-banana',
    labelEn: 'Apple vs Banana',
    labelBn: 'আপেল বনাম কলা',
    codes: ['08_0001', '08_0003'],
    queries: ['Apple', 'Banana'],
  },
  {
    id: 'fish-vs-egg',
    labelEn: 'Fish (Rohu) vs Egg',
    labelBn: 'রুই মাছ বনাম ডিম',
    codes: ['10_0025', '09_0001'],
    queries: ['Rohu', 'Egg, chicken'],
  },
  {
    id: 'lentils-vs-chickpeas',
    labelEn: 'Lentils vs Chickpeas',
    labelBn: 'মসুর ডাল বনাম ছোলা',
    codes: ['02_0005', '02_0001'],
    queries: ['Lentil', 'Chickpea'],
  },
];

function findBestFoodCode(code: string, fallbackQuery: string): string | null {
  const exact = BD_FCT_DATABASE.find((f) => f.code === code);
  if (exact) return exact.code;
  const search = searchBdFctFoods({ query: fallbackQuery });
  return search[0]?.code || null;
}

export const FoodComparisonView: React.FC = () => {
  const {
    language,
    comparisonHistory,
    saveComparisonRecord,
    deleteComparisonRecord,
  } = useApp();
  const isBn = language === 'bn';

  const defaultLeft = useMemo(() => findBestFoodCode('01_0037', 'Rice, BR-28, boiled') || BD_FCT_DATABASE[0].code, []);
  const defaultRight = useMemo(() => findBestFoodCode('01_0023', 'roti') || BD_FCT_DATABASE[1].code, []);

  const [selectedCodes, setSelectedCodes] = useState<string[]>([defaultLeft, defaultRight]);
  const [equalGrams, setEqualGrams] = useState<number>(100);
  const [searchInput, setSearchInput] = useState('');
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);

  const selectedFoods: BdFctFoodRecord[] = useMemo(() => {
    return selectedCodes
      .map((c) => BD_FCT_DATABASE.find((f) => f.code === c))
      .filter((x): x is BdFctFoodRecord => Boolean(x));
  }, [selectedCodes]);

  const scaledList = useMemo(() => {
    return selectedFoods.map((food) => ({
      food,
      nutrients: scaleBdFctNutrients(food.nutrientsPer100g, equalGrams),
    }));
  }, [selectedFoods, equalGrams]);

  const pickerResults = useMemo(() => {
    if (activeSlotIndex === null) return [];
    return searchBdFctFoods({ query: searchInput }).slice(0, 12);
  }, [activeSlotIndex, searchInput]);

  const handleApplyPreset = (preset: ComparisonPreset) => {
    const resolved = preset.codes
      .map((c, idx) => findBestFoodCode(c, preset.queries[idx]))
      .filter((c): c is string => Boolean(c));
    if (resolved.length >= 2) {
      setSelectedCodes(resolved);
    }
  };

  const handleAssignSlot = (slotIdx: number, code: string) => {
    setSelectedCodes((prev) => {
      const next = [...prev];
      next[slotIdx] = code;
      return next;
    });
    setActiveSlotIndex(null);
    setSearchInput('');
  };

  const handleAddThirdFood = () => {
    if (selectedCodes.length >= 3) return;
    const candidate = BD_FCT_DATABASE.find((f) => !selectedCodes.includes(f.code));
    if (candidate) {
      setSelectedCodes((prev) => [...prev, candidate.code]);
      setActiveSlotIndex(selectedCodes.length);
    }
  };

  const handleRemoveFood = (idx: number) => {
    if (selectedCodes.length <= 2) return;
    setSelectedCodes((prev) => prev.filter((_, i) => i !== idx));
  };

  // Generate balanced, objective contextual explanation (NEVER declares one food universally superior)
  const contextualSummary = useMemo(() => {
    if (scaledList.length < 2) return '';
    const a = scaledList[0];
    const b = scaledList[1];

    const kcalA = a.nutrients.caloriesKcal;
    const kcalB = b.nutrients.caloriesKcal;
    const proA = a.nutrients.proteinG;
    const proB = b.nutrients.proteinG;
    const fibA = a.nutrients.fiberG;
    const fibB = b.nutrients.fiberG;
    const calcA = a.nutrients.calciumMg;
    const calcB = b.nutrients.calciumMg;
    const ironA = a.nutrients.ironMg;
    const ironB = b.nutrients.ironMg;

    if (isBn) {
      const parts: string[] = [
        `সমান ${equalGrams} গ্রাম পরিমাণে "${a.food.nameBn}" এবং "${b.food.nameBn}"-এর পুষ্টিমান তুলনা:`,
      ];
      if (kcalA !== null && kcalB !== null) {
        parts.push(
          `• ক্যালোরি ও শক্তি: ${a.food.nameBn}-এ ${kcalA} kcal এবং ${b.food.nameBn}-এ ${kcalB} kcal শক্তি রয়েছে। কম ক্যালোরির খাবারে পেট ভরানোর জন্য তুলনামূলক কম ঘনত্বের বিকল্পটি সহায়ক হতে পারে, আবার বেশি শক্তির চাহিদায় উচ্চ ক্যালোরির খাবার কার্যকর।`
        );
      }
      if (proA !== null && proB !== null) {
        parts.push(
          `• প্রোটিন: ${a.food.nameBn} (${proA}g) বনাম ${b.food.nameBn} (${proB}g)। পেশী গঠন ও তৃপ্তির জন্য বেশি প্রোটিনযুক্ত বিকল্পটি উপকারী।`
        );
      }
      if (fibA !== null && fibB !== null) {
        parts.push(
          `• খাদ্য আঁশ (ফাইবার): ${a.food.nameBn} (${fibA}g) বনাম ${b.food.nameBn} (${fibB}g)। বেশি আঁশ হজম ও রক্তের শর্করা স্থিতিশীল রাখতে সাহায্য করে।`
        );
      }
      if (ironA !== null && ironB !== null && calcA !== null && calcB !== null) {
        parts.push(
          `• খনিজ উপাদান: ক্যালসিয়াম (${calcA}mg বনাম ${calcB}mg) এবং আয়রন (${ironA}mg বনাম ${ironB}mg)। কোনো একটি খাবার সর্বজনীনভাবে "শ্রেষ্ঠ" নয় — আপনার সামগ্রিক খাদ্যতালিকা ও প্রয়োজন অনুযায়ী উভয়েরই নিজস্ব ভূমিকা রয়েছে।`
        );
      }
      return parts.join('\n');
    }

    const parts: string[] = [
      `At an equal serving weight of ${equalGrams}g, ${a.food.nameEn} (${a.food.prepState}) and ${b.food.nameEn} (${b.food.prepState}) offer distinct nutritional strengths:`,
    ];
    if (kcalA !== null && kcalB !== null) {
      parts.push(
        `• Energy Density: ${a.food.nameEn} supplies ${kcalA} kcal compared to ${kcalB} kcal in ${b.food.nameEn}. Lower energy density supports lighter meals, while higher density helps meet active energy demands.`
      );
    }
    if (proA !== null && proB !== null) {
      parts.push(
        `• Protein: ${a.food.nameEn} provides ${proA}g vs. ${proB}g in ${b.food.nameEn}.`
      );
    }
    if (fibA !== null && fibB !== null) {
      parts.push(
        `• Dietary Fiber: ${fibA}g vs. ${fibB}g — higher fiber aids digestive regularity and steadier post-meal glucose response.`
      );
    }
    if (calcA !== null && calcB !== null && ironA !== null && ironB !== null) {
      parts.push(
        `• Key Minerals: Calcium (${calcA}mg vs. ${calcB}mg) and Iron (${ironA}mg vs. ${ironB}mg). Neither food is universally superior—nutritional suitability depends on your overall daily diet and meal context.`
      );
    }
    return parts.join('\n');
  }, [scaledList, equalGrams, isBn]);

  const chartMetrics = [
    { key: 'caloriesKcal' as const, labelEn: 'Calories (kcal)', labelBn: 'ক্যালোরি (kcal)', unit: 'kcal' },
    { key: 'proteinG' as const, labelEn: 'Protein (g)', labelBn: 'প্রোটিন (g)', unit: 'g' },
    { key: 'carbsG' as const, labelEn: 'Carbohydrates (g)', labelBn: 'শর্করা (g)', unit: 'g' },
    { key: 'totalFatG' as const, labelEn: 'Total Fat (g)', labelBn: 'ফ্যাট (g)', unit: 'g' },
    { key: 'fiberG' as const, labelEn: 'Dietary Fiber (g)', labelBn: 'ফাইবার (g)', unit: 'g' },
  ];

  const comparisonRows: Array<{
    key: keyof BdFctFoodRecord['nutrientsPer100g'];
    en: string;
    bn: string;
    unit: string;
  }> = [
    { key: 'caloriesKcal', en: 'Energy', bn: 'শক্তি / ক্যালোরি', unit: 'kcal' },
    { key: 'proteinG', en: 'Protein', bn: 'প্রোটিন', unit: 'g' },
    { key: 'carbsG', en: 'Carbohydrates', bn: 'কার্বোহাইড্রেট', unit: 'g' },
    { key: 'totalFatG', en: 'Total Fat', bn: 'মোট ফ্যাট', unit: 'g' },
    { key: 'saturatedFatG', en: 'Saturated Fat', bn: 'স্যাচুরেটেড ফ্যাট', unit: 'g' },
    { key: 'fiberG', en: 'Dietary Fiber', bn: 'খাদ্য আঁশ', unit: 'g' },
    { key: 'sugarG', en: 'Sugars', bn: 'চিনি / সুগার', unit: 'g' },
    { key: 'calciumMg', en: 'Calcium', bn: 'ক্যালসিয়াম', unit: 'mg' },
    { key: 'ironMg', en: 'Iron', bn: 'আয়রন', unit: 'mg' },
    { key: 'zincMg', en: 'Zinc', bn: 'জিংক', unit: 'mg' },
    { key: 'magnesiumMg', en: 'Magnesium', bn: 'ম্যাগনেসিয়াম', unit: 'mg' },
    { key: 'potassiumMg', en: 'Potassium', bn: 'পটাসিয়াম', unit: 'mg' },
    { key: 'sodiumMg', en: 'Sodium', bn: 'সোডিয়াম', unit: 'mg' },
    { key: 'vitaminAMcg', en: 'Vitamin A', bn: 'ভিটামিন এ', unit: 'mcg' },
    { key: 'vitaminB1Mg', en: 'Vitamin B1 (Thiamin)', bn: 'ভিটামিন বি১', unit: 'mg' },
    { key: 'vitaminB2Mg', en: 'Vitamin B2 (Riboflavin)', bn: 'ভিটামিন বি২', unit: 'mg' },
    { key: 'vitaminB3Mg', en: 'Vitamin B3 (Niacin)', bn: 'ভিটামিন বি৩', unit: 'mg' },
    { key: 'vitaminB6Mg', en: 'Vitamin B6', bn: 'ভিটামিন বি৬', unit: 'mg' },
    { key: 'folateMcg', en: 'Folate', bn: 'ফোলেট', unit: 'mcg' },
    { key: 'vitaminB12Mcg', en: 'Vitamin B12', bn: 'ভিটামিন বি১২', unit: 'mcg' },
    { key: 'vitaminCMg', en: 'Vitamin C', bn: 'ভিটামিন সি', unit: 'mg' },
  ];

  const COLORS = ['#16382C', '#D97706', '#0284C7'];

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      {/* Header */}
      <div className="bg-[#16382C] text-white p-6 sm:p-8 rounded-2xl border border-emerald-900/40 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs font-semibold text-emerald-300">
            {isBn ? 'আহারআইকিউ · সম-পরিমাণ পুষ্টি তুলনা' : 'AaharIQ · Equal-Serving Nutrient Comparison'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
            <Scale className="w-6 h-6 text-emerald-300 shrink-0" />
            <span>{isBn ? 'খাদ্য তুলনা সিস্টেম' : 'Food Comparison Engine'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            {isBn
              ? 'সমান ওজনে দুটি বা তিনটি বাংলাদেশি খাদ্যের ক্যালোরি, প্রোটিন, আঁশ, ভিটামিন ও খনিজ তুলনা করুন। কাঁচা ও রান্না করা মান আলাদাভাবে সংরক্ষিত।'
              : 'Compare two or three foods side by side at identical serving weights using INFS Bangladesh FCT data. Raw and cooked records remain strictly separate.'}
          </p>
        </div>

        <button
          onClick={() =>
            saveComparisonRecord({
              title: selectedFoods.map((f) => (isBn ? f.nameBn : f.nameEn)).join(' vs '),
              servingGrams: equalGrams,
              foodCodes: selectedFoods.map((f) => f.code),
              foodNames: selectedFoods.map((f) => (isBn ? f.nameBn : f.nameEn)),
            })
          }
          className="self-start lg:self-center px-4 py-2.5 bg-white text-[#16382C] hover:bg-emerald-50 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>{isBn ? 'তুলনা সংরক্ষণ করুন' : 'Save Comparison'}</span>
        </button>
      </div>

      {/* Quick Presets & Equal Serving Control */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <span className="text-xs font-semibold text-stone-500 block">
            {isBn ? 'জনপ্রিয় তুলনা প্রিসেট:' : 'Quick Comparison Presets:'}
          </span>
          <div className="flex flex-wrap gap-2">
            {COMPARISON_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className="px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-emerald-50 hover:border-emerald-400 text-xs font-semibold text-stone-800 transition-colors"
              >
                {isBn ? preset.labelBn : preset.labelEn}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-semibold text-stone-700">
            {isBn ? 'সমান পরিমাণ (গ্রাম):' : 'Equal Serving Weight:'}
          </span>
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg">
            {[50, 100, 150, 200].map((g) => (
              <button
                key={g}
                onClick={() => setEqualGrams(g)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono-num font-semibold transition-colors ${
                  equalGrams === g ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {g}g
              </button>
            ))}
          </div>
          <input
            type="number"
            min={10}
            max={1000}
            value={equalGrams}
            onChange={(e) => setEqualGrams(Math.max(10, Math.min(1000, Number(e.target.value) || 100)))}
            aria-label="Equal serving grams"
            className="w-20 px-2.5 py-1.5 border border-stone-200 rounded-lg text-xs font-mono-num text-stone-900 bg-stone-50"
          />
        </div>
      </div>

      {/* Selected Food Slots (2–3 Foods) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {selectedFoods.map((food, idx) => (
          <div
            key={`${food.code}-${idx}`}
            className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm flex flex-col justify-between gap-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <span
                    className="w-2.5 h-2.5 rounded-sm inline-block shrink-0"
                    style={{ backgroundColor: COLORS[idx] }}
                  />
                  <span className="font-mono-num">{food.code}</span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{food.prepState}</span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{food.dataQuality}</span>
                </div>
                <h2 className="font-bold text-stone-900 text-sm">
                  {isBn ? food.nameBn : food.nameEn}
                </h2>
                <p className="text-xs text-stone-500">
                  {isBn ? food.nameEn : food.nameBn}
                </p>
              </div>
              {selectedFoods.length > 2 && (
                <button
                  onClick={() => handleRemoveFood(idx)}
                  aria-label="Remove compared food"
                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => {
                setActiveSlotIndex(idx);
                setSearchInput('');
              }}
              className="w-full py-2 px-3 rounded-xl border border-stone-200 hover:border-emerald-500 text-xs font-semibold text-stone-700 hover:text-emerald-900 bg-stone-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{isBn ? 'খাদ্য পরিবর্তন করুন' : 'Change Food Item'}</span>
            </button>
          </div>
        ))}

        {selectedFoods.length < 3 && (
          <button
            onClick={handleAddThirdFood}
            className="rounded-2xl border border-dashed border-stone-300 hover:border-emerald-600 bg-stone-50/70 hover:bg-emerald-50/40 p-6 flex flex-col items-center justify-center gap-2 text-stone-500 hover:text-emerald-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs font-semibold">
              {isBn ? '৩য় খাদ্য যোগ করুন' : 'Add 3rd Food to Compare'}
            </span>
          </button>
        )}
      </div>

      {/* Inline Search Picker */}
      {activeSlotIndex !== null && (
        <div className="bg-white rounded-2xl border border-emerald-600 p-5 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900">
              {isBn
                ? `স্লট #${activeSlotIndex + 1}-এর জন্য খাদ্য নির্বাচন করুন`
                : `Select Food for Slot #${activeSlotIndex + 1} (389 BD FCTB Items)`}
            </h3>
            <button
              onClick={() => setActiveSlotIndex(null)}
              className="p-1 text-stone-400 hover:text-stone-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              autoFocus
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={isBn ? 'বাংলা বা ইংরেজিতে খুঁজুন (যেমন: ভাত, রুটি, রুই, ডিম, কলা)...' : 'Search Bangla or English (e.g., rice, roti, banana, egg, lentil)...'}
              className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {pickerResults.map((item) => (
              <button
                key={item.code}
                onClick={() => handleAssignSlot(activeSlotIndex, item.code)}
                className="p-2.5 text-left rounded-xl border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-colors"
              >
                <div className="text-xs font-bold text-stone-900 line-clamp-1">
                  {isBn ? item.nameBn : item.nameEn}
                </div>
                <div className="text-[11px] text-stone-500 flex items-center justify-between mt-0.5">
                  <span className="truncate">{isBn ? item.nameEn : item.nameBn}</span>
                  <span className="font-mono-num ml-2 shrink-0">
                    {item.prepState} · {item.nutrientsPer100g.caloriesKcal ?? '—'} kcal
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Visual SVG Comparison Bars & Contextual Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-700" />
              <span>
                {isBn
                  ? `ম্যাক্রোনিউট্রিয়েন্ট তুলনা (প্রতি ${equalGrams} গ্রাম)`
                  : `Visual Comparison (Per ${equalGrams}g Equal Serving)`}
              </span>
            </h3>
          </div>

          <div className="space-y-4">
            {chartMetrics.map((metric) => {
              const values = scaledList.map((entry) => entry.nutrients[metric.key] ?? 0);
              const maxVal = Math.max(1, ...values);
              return (
                <div key={metric.key} className="space-y-1.5">
                  <div className="text-xs font-semibold text-stone-700">
                    {isBn ? metric.labelBn : metric.labelEn}
                  </div>
                  <div className="space-y-1">
                    {scaledList.map((entry, idx) => {
                      const raw = entry.nutrients[metric.key];
                      const pct = raw === null ? 0 : Math.min(100, Math.round((raw / maxVal) * 100));
                      return (
                        <div key={entry.food.code} className="flex items-center gap-2 text-xs">
                          <span className="w-32 truncate text-stone-600 text-[11px]">
                            {isBn ? entry.food.nameBn : entry.food.nameEn}
                          </span>
                          <div className="flex-1 h-2.5 bg-stone-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: COLORS[idx % COLORS.length],
                              }}
                            />
                          </div>
                          <span className="w-20 text-right font-mono-num text-[11px] font-semibold text-stone-800">
                            {raw !== null ? `${raw} ${metric.unit}` : isBn ? 'তথ্য নেই' : 'N/A'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <span>{isBn ? 'পুষ্টিগত পার্থক্যের ব্যাখ্যা' : 'Nutritional Context Summary'}</span>
          </h3>
          <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-line">
            {contextualSummary}
          </p>
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-600 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-emerald-700 mt-0.5 shrink-0" />
            <span>
              {isBn
                ? 'কোনো খাদ্য এককভাবে ভালো বা খারাপ নয়; ব্যক্তির বয়স, শ্রম ও দৈনিক মোট খাদ্যাভ্যাসের ওপর উপযোগিতা নির্ভর করে।'
                : 'No single food is universally superior; dietary suitability depends on overall meal balance, energy expenditure, and individual needs.'}
            </span>
          </div>
        </div>
      </div>

      {/* Full Nutrient Comparison Matrix Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900">
            {isBn
              ? `সম্পূর্ণ পুষ্টিতথ্য তুলনা (প্রতি ${equalGrams} গ্রাম)`
              : `Full Nutrient Comparison Table (Per ${equalGrams}g)`}
          </h3>
          <span className="text-xs text-stone-500">
            {isBn ? 'অনুপস্থিত মান তৈরি করা হয়নি' : 'Unmeasured values preserved as Unavailable'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-600 border-b border-stone-200">
              <tr>
                <th className="py-3 px-4 font-semibold">{isBn ? 'পুষ্টি উপাদান' : 'Nutrient'}</th>
                {scaledList.map((entry, idx) => (
                  <th key={entry.food.code} className="py-3 px-4 font-semibold text-right">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-xs inline-block"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      <span>{isBn ? entry.food.nameBn : entry.food.nameEn}</span>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {comparisonRows.map((row) => (
                <tr key={row.key} className="hover:bg-stone-50/70">
                  <td className="py-2.5 px-4 font-medium text-stone-800">
                    {isBn ? row.bn : row.en}
                  </td>
                  {scaledList.map((entry) => {
                    const val = entry.nutrients[row.key];
                    return (
                      <td
                        key={`${entry.food.code}-${row.key}`}
                        className="py-2.5 px-4 text-right font-mono-num text-stone-800"
                      >
                        {val !== null ? (
                          <span>
                            {val} <span className="text-stone-400">{row.unit}</span>
                          </span>
                        ) : (
                          <span className="text-stone-400 italic">
                            {isBn ? 'অপ্রকাশিত' : 'Unavailable'}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Saved Comparison History */}
      {comparisonHistory.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-stone-900">
            {isBn ? 'সংরক্ষিত তুলনার ইতিহাস' : 'Saved Comparison History'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {comparisonHistory.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-stone-200 flex items-center justify-between gap-2 text-xs"
              >
                <button
                  onClick={() => {
                    setSelectedCodes(item.foodCodes);
                    setEqualGrams(item.servingGrams);
                  }}
                  className="text-left hover:text-emerald-800 flex-1 truncate"
                >
                  <div className="font-bold text-stone-900 truncate">{item.title}</div>
                  <div className="text-[11px] text-stone-500 font-mono-num">
                    {item.servingGrams}g · {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </button>
                <button
                  onClick={() => deleteComparisonRecord(item.id)}
                  aria-label="Delete saved comparison"
                  className="p-1.5 text-stone-400 hover:text-rose-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
