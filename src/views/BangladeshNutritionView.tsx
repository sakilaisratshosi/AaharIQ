import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BD_CATEGORY_LABELS,
  BD_DIETARY_GUIDELINES_2025,
  BD_FCT_DATABASE,
  BD_PRIMARY_DATA_SOURCES,
  buildPhysiologicalBenefits,
  scaleBdFctNutrients,
  searchBdFctFoods,
} from '../data/bdFctDatabase';
import {
  BdFctCategory,
  BdFctDataQuality,
  BdFctFoodRecord,
  BdFctNutrients,
} from '../types';
import {
  Database,
  Search,
  Scale,
  ArrowLeftRight,
  GitCompare,
  BookOpen,
  ExternalLink,
  CheckCircle2,
  FlaskConical,
  Info,
  Sparkles,
  Plus,
  X,
  BarChart3,
  HeartPulse,
  Utensils,
} from 'lucide-react';

function fmtVal(val: number | null | undefined, unit: string, isBn: boolean): string {
  if (val === null || val === undefined || !Number.isFinite(val)) {
    return isBn ? 'FCTB-তে তথ্য নেই' : 'Unavailable in FCTB';
  }
  const rounded = val >= 100 ? Math.round(val) : val >= 10 ? Math.round(val * 10) / 10 : Math.round(val * 100) / 100;
  return `${rounded} ${unit}`;
}

function getQualityBadge(q: BdFctDataQuality, isBn: boolean): { label: string; classes: string } {
  switch (q) {
    case 'measured':
      return {
        label: isBn ? 'পরিমাপকৃত (Measured)' : 'Measured (Lab / Compiled)',
        classes: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      };
    case 'calculated':
      return {
        label: isBn ? 'গণনাকৃত (Calculated Recipe)' : 'Calculated (INFS Recipe)',
        classes: 'bg-sky-100 text-sky-900 border-sky-300',
      };
    case 'borrowed':
      return {
        label: isBn ? 'উদ্ধৃত (Borrowed Reference)' : 'Borrowed (Matched Reference)',
        classes: 'bg-amber-100 text-amber-950 border-amber-300',
      };
    case 'estimated':
      return {
        label: isBn ? 'আনুমানিক হিসাব (Estimated)' : 'Estimated (From FCT Ingredients)',
        classes: 'bg-orange-100 text-orange-950 border-orange-300',
      };
  }
}

export const BangladeshNutritionView: React.FC = () => {
  const { language, showNotification } = useApp();
  const isBn = language === 'bn';

  const [activeSubView, setActiveSubView] = useState<'explorer' | 'compare' | 'guidelines'>('explorer');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BdFctCategory | 'all'>('all');
  const [prepFilter, setPrepFilter] = useState<'all' | 'raw' | 'cooked'>('all');
  const [qualityFilter, setQualityFilter] = useState<BdFctDataQuality | 'all'>('all');

  const [selectedFoodCode, setSelectedFoodCode] = useState<string>('01_0037'); // Default: Cooked rice (ভাত)
  const [servingMode, setServingMode] = useState<'100g' | '1serving' | 'custom'>('100g');
  const [customGrams, setCustomGrams] = useState<number>(150);

  // Comparison list (preloaded with Raw vs Cooked BR-28 Rice & Boiled Mosur Dal)
  const [compareCodes, setCompareCodes] = useState<string[]>(['01_0012', '01_0037', '02_0015']);

  const filteredFoods = useMemo(
    () =>
      searchBdFctFoods({
        query: searchQuery,
        category: selectedCategory,
        prepState: prepFilter,
        dataQuality: qualityFilter,
      }),
    [searchQuery, selectedCategory, prepFilter, qualityFilter]
  );

  const selectedFood: BdFctFoodRecord = useMemo(
    () => BD_FCT_DATABASE.find((f) => f.code === selectedFoodCode) || filteredFoods[0] || BD_FCT_DATABASE[0],
    [selectedFoodCode, filteredFoods]
  );

  const pairedFood: BdFctFoodRecord | undefined = useMemo(
    () => (selectedFood.rawCookedPairCode ? BD_FCT_DATABASE.find((f) => f.code === selectedFood.rawCookedPairCode) : undefined),
    [selectedFood]
  );

  const effectiveGrams = useMemo(() => {
    if (servingMode === '100g') return 100;
    if (servingMode === '1serving') return selectedFood.defaultServingGrams;
    return Math.max(1, Math.min(5000, Number.isFinite(customGrams) ? customGrams : 100));
  }, [servingMode, selectedFood, customGrams]);

  const scaledNutrients: BdFctNutrients = useMemo(
    () => scaleBdFctNutrients(selectedFood.nutrientsPer100g, effectiveGrams),
    [selectedFood, effectiveGrams]
  );

  const macroBreakdown = useMemo(() => {
    const pKcal = (scaledNutrients.proteinG || 0) * 4;
    const cKcal = (scaledNutrients.carbsG || 0) * 4;
    const fKcal = (scaledNutrients.totalFatG || 0) * 9;
    const total = pKcal + cKcal + fKcal || 1;
    const proteinPct = Math.round((pKcal / total) * 100);
    const carbsPct = Math.round((cKcal / total) * 100);
    const fatPct = Math.max(0, 100 - proteinPct - carbsPct);
    return { proteinPct, carbsPct, fatPct, pKcal, cKcal, fKcal };
  }, [scaledNutrients]);

  const physiologicalNotes = useMemo(
    () => buildPhysiologicalBenefits(selectedFood, isBn),
    [selectedFood, isBn]
  );

  const comparedFoods = useMemo(
    () => compareCodes.map((c) => BD_FCT_DATABASE.find((f) => f.code === c)).filter((x): x is BdFctFoodRecord => Boolean(x)),
    [compareCodes]
  );

  const toggleCompareFood = (code: string) => {
    setCompareCodes((prev) => {
      if (prev.includes(code)) return prev.filter((x) => x !== code);
      if (prev.length >= 3) return [...prev.slice(1), code];
      return [...prev, code];
    });
    showNotification(isBn ? 'তুলনার তালিকা আপডেট হয়েছে' : 'Updated food comparison list');
  };

  // Traditional dishes quick-pick bar
  const traditionalQuickPicks = [
    { code: '01_0037', en: 'Cooked Rice (ভাত)', bn: 'ভাত' },
    { code: '02_0015', en: 'Mosur Dal (মসুর ডাল)', bn: 'মসুর ডাল' },
    { code: 'EST_SHAK_BHAJI', en: 'Shak Bhaji (শাক ভাজি)', bn: 'শাক ভাজি' },
    { code: 'EST_MACHER_JHOL', en: 'Macher Jhol (মাছের ঝোল)', bn: 'মাছের ঝোল' },
    { code: '01_0035', en: 'Khichuri (খিচুড়ি)', bn: 'খিচুড়ি' },
    { code: '05_0021', en: 'Alu Bhorta (আলু ভর্তা)', bn: 'আলু ভর্তা' },
    { code: 'EST_BHAPA_PITHA', en: 'Bhapa Pitha (ভাপা পিঠা)', bn: 'ভাপা পিঠা' },
    { code: '09_0033', en: 'Ilish Fish (ইলিশ)', bn: 'ইলিশ মাছ' },
    { code: 'EST_SINGARA', en: 'Singara (সিঙ্গারা)', bn: 'সিঙ্গারা' },
    { code: 'EST_FUCHKA', en: 'Fuchka (ফুচকা)', bn: 'ফুচকা' },
  ];

  const qualityBadge = getQualityBadge(selectedFood.dataQuality, isBn);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* HERO HEADER */}
      <section className="bg-gradient-to-r from-[#16382C] via-[#1E4A3B] to-[#122E24] text-white p-6 sm:p-8 rounded-2xl border border-emerald-800/40 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-300 uppercase tracking-wider">
              <Database className="w-4 h-4 text-amber-300" />
              <span>
                {isBn
                  ? 'ঢাকা বিশ্ববিদ্যালয় INFS · FAO INFOODS · বাংলাদেশ খাদ্য নির্দেশিকা ২০২৫'
                  : 'University of Dhaka (INFS) · FAO INFOODS · Bangladesh Dietary Guidelines 2025'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {isBn
                ? 'বাংলাদেশ খাদ্য ও পুষ্টি এক্সপ্লোরার'
                : 'Bangladesh Food & Nutrition Explorer'}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              {isBn
                ? `${BD_FCT_DATABASE.length}টি বাংলাদেশি খাদ্যের (কাঁচা ও রান্না আলাদাভাবে) পরিমাপকৃত, গণনাকৃত ও আনুমানিক পুষ্টিতথ্য, গ্রাফ এবং পরিবেশন ক্যালকুলেটর।`
                : `Search ${BD_FCT_DATABASE.length} authentic Bangladeshi raw foods, cooked staples, and traditional dishes with transparent FCTB sourcing, charts, and serving calculations.`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: 'explorer', icon: Search, en: 'Food Explorer & Charts', bn: 'খাদ্য ও চার্ট' },
                { id: 'compare', icon: GitCompare, en: `Compare (${comparedFoods.length})`, bn: `তুলনা (${comparedFoods.length})` },
                { id: 'guidelines', icon: BookOpen, en: '2025 Guidelines & Sources', bn: '২০২৫ নির্দেশিকা ও উৎস' },
              ] as const
            ).map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveSubView(t.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
                    activeSubView === t.id
                      ? 'bg-white text-emerald-950'
                      : 'bg-emerald-900/60 text-emerald-100 hover:bg-emerald-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{isBn ? t.bn : t.en}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick-Pick Traditional Bangladeshi Dishes */}
        <div className="mt-5 pt-4 border-t border-emerald-800/50 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-emerald-300 mr-1">
            {isBn ? 'জনপ্রিয় দেশীয় খাবার:' : 'Quick Staples & Dishes:'}
          </span>
          {traditionalQuickPicks.map((q) => (
            <button
              key={q.code}
              type="button"
              onClick={() => {
                setSelectedFoodCode(q.code);
                setActiveSubView('explorer');
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors border ${
                selectedFood.code === q.code
                  ? 'bg-white text-emerald-950 border-white'
                  : 'bg-emerald-950/50 text-emerald-100 border-emerald-700/60 hover:bg-emerald-800'
              }`}
            >
              {isBn ? q.bn : q.en}
            </button>
          ))}
        </div>
      </section>

      {/* EXPLORER TAB */}
      {activeSubView === 'explorer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Search, 10 Categories, Raw vs Cooked Filter, Result List (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-emerald-700 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isBn
                    ? 'বাংলা বা ইংরেজিতে খুঁজুন (যেমন: ভাত, ইলিশ, ডাল, Hilsa, Lal Shak)...'
                    : 'Search Bangla or English (e.g., Hilsa, ভাত, ইলিশ, Lentil, Shak)...'
                }
                className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900"
              />
            </div>

            {/* Raw vs Cooked & Data Quality Toggles */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="inline-flex rounded-xl bg-stone-100 p-1">
                {(
                  [
                    { id: 'all', en: 'All States', bn: 'সব' },
                    { id: 'raw', en: 'Raw Only', bn: 'কাঁচা' },
                    { id: 'cooked', en: 'Cooked Only', bn: 'রান্না' },
                  ] as const
                ).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setPrepFilter(s.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                      prepFilter === s.id
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {isBn ? s.bn : s.en}
                  </button>
                ))}
              </div>

              <select
                value={qualityFilter}
                onChange={(e) => setQualityFilter(e.target.value as BdFctDataQuality | 'all')}
                className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-[11px] font-bold text-stone-700"
              >
                <option value="all">{isBn ? 'সব তথ্য মান' : 'All Data Qualities'}</option>
                <option value="measured">{isBn ? 'পরিমাপকৃত (Measured)' : 'Measured'}</option>
                <option value="calculated">{isBn ? 'গণনাকৃত (Calculated)' : 'Calculated'}</option>
                <option value="borrowed">{isBn ? 'উদ্ধৃত (Borrowed)' : 'Borrowed'}</option>
                <option value="estimated">{isBn ? 'আনুমানিক (Estimated)' : 'Estimated'}</option>
              </select>
            </div>

            {/* 10 Category Filter Buttons */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                  selectedCategory === 'all'
                    ? 'bg-[#1B4332] text-white border-[#1B4332]'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {isBn ? `সব (${BD_FCT_DATABASE.length})` : `All (${BD_FCT_DATABASE.length})`}
              </button>
              {(Object.keys(BD_CATEGORY_LABELS) as BdFctCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                    selectedCategory === cat
                      ? 'bg-[#1B4332] text-white border-[#1B4332]'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {isBn ? BD_CATEGORY_LABELS[cat].bn : BD_CATEGORY_LABELS[cat].en}
                </button>
              ))}
            </div>

            {/* Matching List */}
            <div className="text-[11px] font-semibold text-stone-500 flex items-center justify-between pt-1">
              <span>
                {isBn ? `মোট মিল পাওয়া গেছে: ${filteredFoods.length}` : `Showing ${filteredFoods.length} FCT records`}
              </span>
              {filteredFoods.length > 60 && (
                <span className="text-[10px]">{isBn ? 'সর্বোচ্চ ৮০টি প্রদর্শিত' : 'Top 80 shown'}</span>
              )}
            </div>

            <div className="max-h-[540px] overflow-y-auto space-y-2 pr-1">
              {filteredFoods.slice(0, 80).map((item) => {
                const active = item.code === selectedFood.code;
                const inCompare = compareCodes.includes(item.code);
                return (
                  <div
                    key={item.code}
                    onClick={() => setSelectedFoodCode(item.code)}
                    className={`p-3 rounded-xl border cursor-pointer transition-colors space-y-1.5 ${
                      active
                        ? 'bg-emerald-50 border-emerald-500'
                        : 'bg-stone-50/70 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-extrabold text-stone-900 text-xs block truncate">
                          {isBn ? item.nameBn : item.nameEn}
                        </span>
                        <span className="text-[11px] text-stone-500 block truncate">
                          {isBn ? item.nameEn : item.nameBn}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-extrabold text-emerald-900 shrink-0 tabular-nums">
                        {item.nutrientsPer100g.caloriesKcal ?? '—'} kcal
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-1 text-[10px]">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono text-stone-500">{item.code}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                            item.prepState === 'cooked'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-stone-200 text-stone-800'
                          }`}
                        >
                          {item.prepState}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-white border border-stone-200 text-stone-600 font-semibold">
                          {item.dataQuality}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCompareFood(item.code);
                        }}
                        className={`px-2 py-0.5 rounded font-bold border ${
                          inCompare
                            ? 'bg-[#1B4332] text-white border-[#1B4332]'
                            : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                        }`}
                      >
                        {inCompare ? (isBn ? 'তুলনায় আছে' : 'Comparing') : isBn ? '+ তুলনা' : '+ Compare'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: Detailed Nutrients, Charts, Serving Calculator, Raw/Cooked Switch, Benefits (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Selected Food Summary & Raw/Cooked Pair Switcher */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-stone-100 pb-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-bold">
                      FCT #{selectedFood.code}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold uppercase ${
                        selectedFood.prepState === 'cooked'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      {selectedFood.prepState === 'cooked'
                        ? isBn
                          ? 'রান্না / প্রস্তুতকৃত'
                          : 'Cooked / Prepared'
                        : isBn
                        ? 'কাঁচা (Raw)'
                        : 'Raw Food Record'}
                    </span>
                    <span className={`px-2 py-0.5 rounded border font-bold ${qualityBadge.classes}`}>
                      {qualityBadge.label}
                    </span>
                  </div>

                  <h2 className="text-xl font-black text-stone-900">
                    {isBn ? selectedFood.nameBn : selectedFood.nameEn}
                  </h2>
                  <p className="text-xs text-stone-500">
                    {isBn ? selectedFood.nameEn : selectedFood.nameBn}
                    {selectedFood.scientificName ? ` · ${selectedFood.scientificName}` : ''}
                  </p>
                  <p className="text-xs text-stone-700 leading-relaxed pt-1">
                    {isBn ? selectedFood.descriptionBn : selectedFood.description}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  {pairedFood && (
                    <button
                      type="button"
                      onClick={() => setSelectedFoodCode(pairedFood.code)}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 text-xs font-bold flex items-center space-x-1.5"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      <span>
                        {isBn
                          ? `দেখুন: ${pairedFood.prepState === 'cooked' ? 'রান্না অবস্থা' : 'কাঁচা অবস্থা'}`
                          : `Switch to ${pairedFood.prepState === 'cooked' ? 'Cooked Version' : 'Raw Version'}`}
                      </span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleCompareFood(selectedFood.code)}
                    className="px-3 py-1.5 rounded-xl bg-[#1B4332] hover:bg-[#255C45] text-white text-xs font-bold flex items-center space-x-1.5"
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                    <span>{isBn ? 'তুলনা তালিকায় রাখুন' : 'Add to Compare'}</span>
                  </button>
                </div>
              </div>

              {/* SERVING SIZE CALCULATOR (Per 100g | Per 1 Serving | Custom Grams) */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-stone-900 flex items-center space-x-1.5">
                    <Scale className="w-4 h-4 text-emerald-700" />
                    <span>{isBn ? 'পরিবেশন পরিমাণ ক্যালকুলেটর' : 'Serving Size Calculator'}</span>
                  </span>
                  <span className="font-mono text-xs font-extrabold text-emerald-900 tabular-nums">
                    {isBn ? `হিসাবকৃত পরিমাণ: ${effectiveGrams} গ্রাম` : `Active Quantity: ${effectiveGrams} g`}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setServingMode('100g')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                      servingMode === '100g'
                        ? 'bg-[#1B4332] text-white border-[#1B4332]'
                        : 'bg-white text-stone-700 border-stone-200'
                    }`}
                  >
                    {isBn ? 'প্রতি ১০০ গ্রাম' : 'Per 100 grams'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setServingMode('1serving')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                      servingMode === '1serving'
                        ? 'bg-[#1B4332] text-white border-[#1B4332]'
                        : 'bg-white text-stone-700 border-stone-200'
                    }`}
                  >
                    {isBn
                      ? `১ সার্ভিং (${selectedFood.defaultServingGrams}g)`
                      : `Per 1 Serving (${selectedFood.defaultServingGrams}g)`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setServingMode('custom')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                      servingMode === 'custom'
                        ? 'bg-[#1B4332] text-white border-[#1B4332]'
                        : 'bg-white text-stone-700 border-stone-200'
                    }`}
                  >
                    {isBn ? 'কাস্টম গ্রাম (Custom g)' : 'Custom Quantity (g)'}
                  </button>
                </div>

                {servingMode === '1serving' && (
                  <p className="text-[11px] text-stone-600">
                    {isBn ? selectedFood.defaultServingLabelBn : selectedFood.defaultServingLabel}
                  </p>
                )}

                {servingMode === 'custom' && (
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="range"
                      min={10}
                      max={600}
                      step={5}
                      value={Math.min(600, effectiveGrams)}
                      onChange={(e) => setCustomGrams(Number(e.target.value))}
                      className="flex-1 accent-emerald-700"
                    />
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        min={1}
                        max={5000}
                        value={customGrams}
                        onChange={(e) => setCustomGrams(Number(e.target.value))}
                        className="w-20 px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono font-bold"
                      />
                      <span className="text-xs font-bold text-stone-600">g</span>
                    </div>
                  </div>
                )}
              </div>

              {/* MACRO KPI TILES & NUTRITION CHARTS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-emerald-950 text-white">
                  <span className="text-[10px] uppercase text-emerald-300 font-bold block">
                    {isBn ? 'ক্যালোরি (Energy)' : 'Calories'}
                  </span>
                  <span className="text-xl font-black font-mono tabular-nums">
                    {scaledNutrients.caloriesKcal ?? '—'}
                  </span>{' '}
                  <span className="text-[11px] text-emerald-200">kcal</span>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-[10px] uppercase text-stone-500 font-bold block">
                    {isBn ? 'প্রোটিন' : 'Protein'}
                  </span>
                  <span className="text-lg font-black text-stone-900 font-mono tabular-nums">
                    {scaledNutrients.proteinG ?? '—'} g
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-[10px] uppercase text-stone-500 font-bold block">
                    {isBn ? 'কার্বোহাইড্রেট' : 'Carbohydrates'}
                  </span>
                  <span className="text-lg font-black text-stone-900 font-mono tabular-nums">
                    {scaledNutrients.carbsG ?? '—'} g
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-[10px] uppercase text-stone-500 font-bold block">
                    {isBn ? 'মোট ফ্যাট' : 'Total Fat'}
                  </span>
                  <span className="text-lg font-black text-stone-900 font-mono tabular-nums">
                    {scaledNutrients.totalFatG ?? '—'} g
                  </span>
                </div>
              </div>

              {/* VISUAL NUTRITION CHARTS (Macro Energy Split + Key Micronutrient % Daily Reference Bars) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Chart 1: SVG Macro Donut Chart */}
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
                  <span className="text-xs font-extrabold text-stone-900 flex items-center space-x-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{isBn ? 'শক্তির ম্যাক্রো অনুপাত' : 'Macro Energy Split (% kcal)'}</span>
                  </span>
                  <div className="flex items-center gap-4">
                    <svg viewBox="0 0 36 36" className="w-24 h-24 shrink-0 -rotate-90">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#e7e5e4" strokeWidth="5" />
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="#1B4332"
                        strokeWidth="5"
                        strokeDasharray={`${macroBreakdown.carbsPct * 0.88} 100`}
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="#E76F51"
                        strokeWidth="5"
                        strokeDasharray={`${macroBreakdown.proteinPct * 0.88} 100`}
                        strokeDashoffset={`-${macroBreakdown.carbsPct * 0.88}`}
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="5"
                        strokeDasharray={`${macroBreakdown.fatPct * 0.88} 100`}
                        strokeDashoffset={`-${(macroBreakdown.carbsPct + macroBreakdown.proteinPct) * 0.88}`}
                      />
                    </svg>
                    <div className="space-y-1.5 text-xs flex-1">
                      <div className="flex justify-between">
                        <span className="flex items-center space-x-1.5">
                          <span className="w-2.5 h-2.5 rounded-sm bg-[#1B4332]" />
                          <span>{isBn ? 'কার্ব' : 'Carbs'}</span>
                        </span>
                        <span className="font-mono font-bold tabular-nums">{macroBreakdown.carbsPct}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center space-x-1.5">
                          <span className="w-2.5 h-2.5 rounded-sm bg-[#E76F51]" />
                          <span>{isBn ? 'প্রোটিন' : 'Protein'}</span>
                        </span>
                        <span className="font-mono font-bold tabular-nums">{macroBreakdown.proteinPct}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center space-x-1.5">
                          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                          <span>{isBn ? 'ফ্যাট' : 'Fat'}</span>
                        </span>
                        <span className="font-mono font-bold tabular-nums">{macroBreakdown.fatPct}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chart 2: Key Mineral & Vitamin Adult % Reference Bar Chart */}
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5 text-xs">
                  <span className="text-xs font-extrabold text-stone-900 block">
                    {isBn ? 'মাইক্রোনিউট্রিয়েন্ট চাহিদার তুলনা (% DV অনুমান)' : 'Key Micronutrients (% Adult Reference Intake)'}
                  </span>
                  {[
                    { label: isBn ? 'ক্যালসিয়াম (Ca)' : 'Calcium (Ca)', val: scaledNutrients.calciumMg, ref: 1000, unit: 'mg' },
                    { label: isBn ? 'আয়রন (Fe)' : 'Iron (Fe)', val: scaledNutrients.ironMg, ref: 18, unit: 'mg' },
                    { label: isBn ? 'জিংক (Zn)' : 'Zinc (Zn)', val: scaledNutrients.zincMg, ref: 11, unit: 'mg' },
                    { label: isBn ? 'ভিটামিন সি' : 'Vitamin C', val: scaledNutrients.vitaminCMg, ref: 90, unit: 'mg' },
                    { label: isBn ? 'ভিটামিন এ' : 'Vitamin A', val: scaledNutrients.vitaminAMcg, ref: 700, unit: 'mcg' },
                  ].map((m, idx) => {
                    const pct = m.val !== null ? Math.min(100, Math.round((m.val / m.ref) * 100)) : 0;
                    return (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="font-semibold text-stone-700">{m.label}</span>
                          <span className="font-mono text-stone-800 tabular-nums">
                            {m.val !== null ? `${m.val} ${m.unit} (${pct}%)` : isBn ? 'তথ্য নেই' : 'N/A'}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-stone-200 overflow-hidden">
                          <div className="h-full bg-emerald-700 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* FULL NUTRIENT PROFILE TABLE (Requirement 2 — zero fabricated missing values) */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="font-extrabold text-stone-900 text-sm">
                  {isBn ? `সম্পূর্ণ পুষ্টি সারণি (${effectiveGrams} গ্রাম অনুযায়ী)` : `Complete Nutrient Composition (${effectiveGrams}g serving)`}
                </h3>
                <span className="text-[11px] font-mono text-stone-500">{selectedFood.unit}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Col 1: Proximate & Lipids & Carbs */}
                <div className="space-y-1.5">
                  <span className="font-extrabold text-emerald-900 uppercase text-[11px] block border-b border-stone-200 pb-1">
                    {isBn ? 'ম্যাক্রো ও উপাদান' : 'Macronutrients & Fiber'}
                  </span>
                  {[
                    [isBn ? 'ক্যালোরি' : 'Energy', fmtVal(scaledNutrients.caloriesKcal, 'kcal', isBn)],
                    [isBn ? 'প্রোটিন' : 'Protein', fmtVal(scaledNutrients.proteinG, 'g', isBn)],
                    [isBn ? 'কার্বোহাইড্রেট' : 'Carbohydrates', fmtVal(scaledNutrients.carbsG, 'g', isBn)],
                    [isBn ? 'মোট ফ্যাট' : 'Total Fat', fmtVal(scaledNutrients.totalFatG, 'g', isBn)],
                    [isBn ? 'সম্পৃক্ত চর্বি' : 'Saturated Fat', fmtVal(scaledNutrients.saturatedFatG, 'g', isBn)],
                    [isBn ? 'খাদ্য-আঁশ (Fiber)' : 'Dietary Fiber', fmtVal(scaledNutrients.fiberG, 'g', isBn)],
                    [isBn ? 'চিনি (Sugar)' : 'Total Sugar', fmtVal(scaledNutrients.sugarG, 'g', isBn)],
                    [isBn ? 'জলীয় অংশ' : 'Water', fmtVal(scaledNutrients.waterG, 'g', isBn)],
                  ].map(([k, v], i) => (
                    <div key={i} className="flex justify-between py-1 border-b border-stone-100">
                      <span className="text-stone-600">{k}</span>
                      <span className="font-mono font-bold text-stone-900 tabular-nums">{v}</span>
                    </div>
                  ))}
                </div>

                {/* Col 2: Essential Minerals */}
                <div className="space-y-1.5">
                  <span className="font-extrabold text-emerald-900 uppercase text-[11px] block border-b border-stone-200 pb-1">
                    {isBn ? 'খনিজ উপাদান (Minerals)' : 'Minerals'}
                  </span>
                  {[
                    [isBn ? 'ক্যালসিয়াম (Ca)' : 'Calcium (Ca)', fmtVal(scaledNutrients.calciumMg, 'mg', isBn)],
                    [isBn ? 'আয়রন (Fe)' : 'Iron (Fe)', fmtVal(scaledNutrients.ironMg, 'mg', isBn)],
                    [isBn ? 'জিংক (Zn)' : 'Zinc (Zn)', fmtVal(scaledNutrients.zincMg, 'mg', isBn)],
                    [isBn ? 'ম্যাগনেসিয়াম (Mg)' : 'Magnesium (Mg)', fmtVal(scaledNutrients.magnesiumMg, 'mg', isBn)],
                    [isBn ? 'পটাশিয়াম (K)' : 'Potassium (K)', fmtVal(scaledNutrients.potassiumMg, 'mg', isBn)],
                    [isBn ? 'সোডিয়াম (Na)' : 'Sodium (Na)', fmtVal(scaledNutrients.sodiumMg, 'mg', isBn)],
                    [isBn ? 'ফসফরাস (P)' : 'Phosphorus (P)', fmtVal(scaledNutrients.phosphorusMg, 'mg', isBn)],
                  ].map(([k, v], i) => (
                    <div key={i} className="flex justify-between py-1 border-b border-stone-100">
                      <span className="text-stone-600">{k}</span>
                      <span className="font-mono font-bold text-stone-900 tabular-nums">{v}</span>
                    </div>
                  ))}
                </div>

                {/* Col 3: Vitamins */}
                <div className="space-y-1.5">
                  <span className="font-extrabold text-emerald-900 uppercase text-[11px] block border-b border-stone-200 pb-1">
                    {isBn ? 'ভিটামিনসমূহ (Vitamins)' : 'Vitamins'}
                  </span>
                  {[
                    [isBn ? 'ভিটামিন এ (RAE)' : 'Vitamin A (RAE)', fmtVal(scaledNutrients.vitaminAMcg, 'mcg', isBn)],
                    [isBn ? 'ভিটামিন বি-১ (Thiamin)' : 'Vitamin B1 (Thiamin)', fmtVal(scaledNutrients.vitaminB1Mg, 'mg', isBn)],
                    [isBn ? 'ভিটামিন বি-২ (Riboflavin)' : 'Vitamin B2 (Riboflavin)', fmtVal(scaledNutrients.vitaminB2Mg, 'mg', isBn)],
                    [isBn ? 'ভিটামিন বি-৩ (Niacin)' : 'Vitamin B3 (Niacin)', fmtVal(scaledNutrients.vitaminB3Mg, 'mg', isBn)],
                    [isBn ? 'ভিটামিন বি-৬' : 'Vitamin B6', fmtVal(scaledNutrients.vitaminB6Mg, 'mg', isBn)],
                    [isBn ? 'ফোলেট (B9)' : 'Folate', fmtVal(scaledNutrients.folateMcg, 'mcg', isBn)],
                    [isBn ? 'ভিটামিন বি-১২' : 'Vitamin B12', fmtVal(scaledNutrients.vitaminB12Mcg, 'mcg', isBn)],
                    [isBn ? 'ভিটামিন সি' : 'Vitamin C', fmtVal(scaledNutrients.vitaminCMg, 'mg', isBn)],
                  ].map(([k, v], i) => (
                    <div key={i} className="flex justify-between py-1 border-b border-stone-100">
                      <span className="text-stone-600">{k}</span>
                      <span
                        className={`font-mono font-bold tabular-nums ${
                          String(v).includes('Unavailable') || String(v).includes('তথ্য নেই')
                            ? 'text-stone-400 italic font-sans font-normal text-[11px]'
                            : 'text-stone-900'
                        }`}
                      >
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* NON-MEDICAL HEALTH BENEFITS & RECIPE INGREDIENT TRANSPARENCY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-2.5">
                <h3 className="font-extrabold text-stone-900 text-sm flex items-center space-x-1.5">
                  <HeartPulse className="w-4 h-4 text-emerald-700" />
                  <span>{isBn ? 'স্বাভাবিক শারীরবৃত্তীয় ভূমিকা' : 'Normal Body Function Support'}</span>
                </h3>
                <ul className="list-disc pl-4 space-y-1.5 text-stone-700 leading-relaxed">
                  {physiologicalNotes.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
                <p className="text-[11px] text-stone-500 italic pt-1 border-t border-stone-100">
                  {isBn
                    ? 'পুষ্টিতথ্য স্বাভাবিক শরীরবৃত্তীয় কার্যকারিতা ব্যাখ্যা করে; কোনো খাবার রোগ নিরাময় বা প্রতিরোধের চিকিৎসা বিকল্প নয়।'
                    : 'Explains normal physiological nutrient roles only; balanced dietary patterns do not substitute medical treatment.'}
                </p>
              </div>

              {/* Data Provenance & Estimated Ingredient Breakdown */}
              <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-2.5">
                <h3 className="font-extrabold text-stone-900 text-sm flex items-center space-x-1.5">
                  <FlaskConical className="w-4 h-4 text-amber-700" />
                  <span>{isBn ? 'তথ্যের উৎস ও মান যাচাই' : 'Source Provenance & Accuracy'}</span>
                </h3>
                <div className="space-y-1 text-[11px] text-stone-600">
                  <div>
                    <strong className="text-stone-800">{isBn ? 'মূল উৎস:' : 'Primary Source:'}</strong> {selectedFood.sourceName}
                  </div>
                  <div>
                    <strong className="text-stone-800">{isBn ? 'প্রকাশকাল ও রেফারেন্স:' : 'Source Year & Biblio ID:'}</strong>{' '}
                    <span className="font-mono">{selectedFood.sourceYear}</span> · {selectedFood.biblioRef}
                  </div>
                  <div>
                    <strong className="text-stone-800">{isBn ? 'তথ্যের অবস্থা:' : 'Data Status:'}</strong> {qualityBadge.label}
                  </div>
                </div>

                {selectedFood.recipeBreakdown && selectedFood.recipeBreakdown.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] space-y-1">
                    <span className="font-bold text-amber-950 block">
                      {isBn ? 'আনুমানিক রেসিপি উপাদানের ভিত্তি:' : 'Calculated Ingredient Basis (Estimate):'}
                    </span>
                    <ul className="list-disc pl-4 text-amber-900">
                      {selectedFood.recipeBreakdown.map((ing, idx) => (
                        <li key={idx}>
                          {isBn ? ing.nameBn : ing.nameEn} ({ing.gramsUsed}g · FCT {ing.fctCode})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <a
                  href={selectedFood.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 font-bold text-emerald-700 hover:underline pt-1"
                >
                  <span>{isBn ? 'অফিশিয়াল FAO / INFS উৎস দেখুন' : 'Inspect Official INFS / FAO PDF'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMPARE TAB */}
      {activeSubView === 'compare' && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
            <div>
              <h2 className="font-extrabold text-stone-900 text-base">
                {isBn
                  ? 'বাংলাদেশি খাবারের পাশাপাশি তুলনা (যেমন: কাঁচা বনাম রান্না চাল বা মাছ)'
                  : 'Side-by-Side Nutrition Comparison (Per 100g Edible Portion)'}
              </h2>
              <p className="text-xs text-stone-500">
                {isBn
                  ? 'তালিকা থেকে সর্বোচ্চ ৩টি খাবার যোগ করুন ও কাঁচা/রান্না বা পুষ্টি পার্থক্য দেখুন।'
                  : 'Compare up to 3 Bangladeshi foods across macros, minerals, vitamins, raw/cooked status, and source accuracy.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCompareCodes(['01_0012', '01_0037', '01_0035'])}
              className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-800"
            >
              {isBn ? 'উদাহরণ: কাঁচা চাল বনাম ভাত বনাম খিচুড়ি' : 'Load Preset: Raw Rice vs Cooked Rice vs Khichuri'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50">
                  <th className="py-2.5 px-3 font-bold text-stone-600 w-44">
                    {isBn ? 'পুষ্টি উপাদান / তথ্য' : 'Nutrient / Metadata'}
                  </th>
                  {comparedFoods.map((f) => (
                    <th key={f.code} className="py-2.5 px-3 min-w-[200px]">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-extrabold text-stone-900 block">
                            {isBn ? f.nameBn : f.nameEn}
                          </span>
                          <span className="text-[10px] font-mono text-stone-500">
                            {f.code} · {f.prepState.toUpperCase()} · {f.dataQuality}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleCompareFood(f.code)}
                          className="text-stone-400 hover:text-rose-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 tabular-nums">
                {(
                  [
                    ['Calories (kcal)', (n: BdFctNutrients) => fmtVal(n.caloriesKcal, 'kcal', isBn)],
                    ['Protein (g)', (n: BdFctNutrients) => fmtVal(n.proteinG, 'g', isBn)],
                    ['Carbohydrates (g)', (n: BdFctNutrients) => fmtVal(n.carbsG, 'g', isBn)],
                    ['Total Fat (g)', (n: BdFctNutrients) => fmtVal(n.totalFatG, 'g', isBn)],
                    ['Saturated Fat (g)', (n: BdFctNutrients) => fmtVal(n.saturatedFatG, 'g', isBn)],
                    ['Dietary Fiber (g)', (n: BdFctNutrients) => fmtVal(n.fiberG, 'g', isBn)],
                    ['Sugar (g)', (n: BdFctNutrients) => fmtVal(n.sugarG, 'g', isBn)],
                    ['Calcium (mg)', (n: BdFctNutrients) => fmtVal(n.calciumMg, 'mg', isBn)],
                    ['Iron (mg)', (n: BdFctNutrients) => fmtVal(n.ironMg, 'mg', isBn)],
                    ['Zinc (mg)', (n: BdFctNutrients) => fmtVal(n.zincMg, 'mg', isBn)],
                    ['Magnesium (mg)', (n: BdFctNutrients) => fmtVal(n.magnesiumMg, 'mg', isBn)],
                    ['Potassium (mg)', (n: BdFctNutrients) => fmtVal(n.potassiumMg, 'mg', isBn)],
                    ['Vitamin A (mcg RAE)', (n: BdFctNutrients) => fmtVal(n.vitaminAMcg, 'mcg', isBn)],
                    ['Vitamin C (mg)', (n: BdFctNutrients) => fmtVal(n.vitaminCMg, 'mg', isBn)],
                    ['Vitamin B1 (mg)', (n: BdFctNutrients) => fmtVal(n.vitaminB1Mg, 'mg', isBn)],
                    ['Vitamin B2 (mg)', (n: BdFctNutrients) => fmtVal(n.vitaminB2Mg, 'mg', isBn)],
                    ['Vitamin B3 (mg)', (n: BdFctNutrients) => fmtVal(n.vitaminB3Mg, 'mg', isBn)],
                    ['Vitamin B6 (mg)', (n: BdFctNutrients) => fmtVal(n.vitaminB6Mg, 'mg', isBn)],
                  ] as const
                ).map(([label, getter], idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-3 font-bold text-stone-700">{label}</td>
                    {comparedFoods.map((f) => (
                      <td key={f.code} className="py-2 px-3 font-mono text-stone-900">
                        {getter(f.nutrientsPer100g)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GUIDELINES & OFFICIAL SOURCES TAB */}
      {activeSubView === 'guidelines' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
            <h2 className="font-extrabold text-stone-900 text-base">
              {isBn
                ? 'জাতীয় খাদ্য নির্দেশিকা বাংলাদেশ ২০২৫ (মূল নীতিমালা)'
                : 'National Dietary Guidelines for Bangladesh 2025 — Core Guidance'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {BD_DIETARY_GUIDELINES_2025.map((g) => (
                <div key={g.key} className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
                  <span className="font-extrabold text-stone-900 block">
                    {isBn ? g.titleBn : g.title}
                  </span>
                  <p className="text-stone-600 leading-relaxed">
                    {isBn ? g.guidanceBn : g.guidance}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
            <h2 className="font-extrabold text-stone-900 text-base">
              {isBn
                ? 'অনুমোদিত ও প্রমাণভিত্তিক প্রাথমিক তথ্যসূত্র (Primary Citations)'
                : 'Authentic Bangladesh Nutrition Primary Sources'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {BD_PRIMARY_DATA_SOURCES.map((src) => (
                <div
                  key={src.id}
                  className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      {src.year}
                    </span>
                    <h3 className="font-extrabold text-stone-900">
                      {isBn ? src.titleBn : src.title}
                    </h3>
                    <p className="text-stone-600 leading-relaxed">
                      {isBn ? src.roleBn : src.role}
                    </p>
                  </div>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-emerald-700 hover:underline inline-flex items-center space-x-1"
                  >
                    <span>{isBn ? 'মূল নথি দেখুন' : 'Open Official Reference'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
