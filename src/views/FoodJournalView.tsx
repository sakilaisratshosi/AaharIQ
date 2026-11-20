import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BD_FCT_DATABASE, scaleBdFctNutrients, searchBdFctFoods } from '../data/bdFctDatabase';
import { BdFctFoodRecord } from '../types';
import {
  BookOpen,
  Plus,
  Trash2,
  Calendar,
  Search,
  Download,
  Flame,
  AlertCircle,
  Check,
} from 'lucide-react';

type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';

function getTodayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function getPastNDates(n: number): string[] {
  const arr: string[] = [];
  const base = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    arr.push(d.toISOString().slice(0, 10));
  }
  return arr;
}

export const FoodJournalView: React.FC = () => {
  const {
    language,
    userProfile,
    journalEntries,
    addJournalEntry,
    deleteJournalEntry,
    clearJournalEntries,
    isAuthenticated,
    setIsAuthModalOpen,
  } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>(getTodayIso);
  const [mealSlot, setMealSlot] = useState<MealSlot>('lunch');
  const [mode, setMode] = useState<'database' | 'custom'>('database');

  // Database food picker state
  const [dbQuery, setDbQuery] = useState('');
  const [selectedDbFood, setSelectedDbFood] = useState<BdFctFoodRecord | null>(() => BD_FCT_DATABASE[0] || null);
  const [servingGrams, setServingGrams] = useState<number>(150);

  // Custom entry state
  const [customName, setCustomName] = useState('');
  const [customGrams, setCustomGrams] = useState<number>(150);
  const [customCalories, setCustomCalories] = useState<number>(220);
  const [customProtein, setCustomProtein] = useState<number>(8);
  const [customCarbs, setCustomCarbs] = useState<number>(30);
  const [customFat, setCustomFat] = useState<number>(6);
  const [customFiber, setCustomFiber] = useState<number>(3);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const calorieGoal = userProfile?.dailyCalorieGoal || 2000;

  const searchResults = useMemo(() => {
    if (!dbQuery.trim()) return BD_FCT_DATABASE.slice(0, 8);
    return searchBdFctFoods({ query: dbQuery }).slice(0, 10);
  }, [dbQuery]);

  const scaledDbFood = useMemo(() => {
    if (!selectedDbFood) return null;
    return scaleBdFctNutrients(selectedDbFood.nutrientsPer100g, Math.max(1, servingGrams));
  }, [selectedDbFood, servingGrams]);

  const entriesForDate = useMemo(
    () => journalEntries.filter((e) => e.date === selectedDate),
    [journalEntries, selectedDate]
  );

  const dailyTotals = useMemo(() => {
    return entriesForDate.reduce(
      (acc, e) => ({
        calories: acc.calories + (Number(e.calories) || 0),
        proteinG: Number((acc.proteinG + (Number(e.proteinG) || 0)).toFixed(1)),
        carbsG: Number((acc.carbsG + (Number(e.carbsG) || 0)).toFixed(1)),
        fatG: Number((acc.fatG + (Number(e.fatG) || 0)).toFixed(1)),
        fiberG: Number((acc.fiberG + (Number(e.fiberG) || 0)).toFixed(1)),
      }),
      { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 }
    );
  }, [entriesForDate]);

  const last7Days = useMemo(() => {
    const dates = getPastNDates(7);
    return dates.map((d) => {
      const kcal = journalEntries
        .filter((e) => e.date === d)
        .reduce((sum, e) => sum + (Number(e.calories) || 0), 0);
      return {
        date: d,
        shortLabel: d.slice(5),
        kcal,
      };
    });
  }, [journalEntries]);

  const maxChartKcal = Math.max(calorieGoal, ...last7Days.map((d) => d.kcal), 500);

  const handleLogMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      if (mode === 'database' && selectedDbFood && scaledDbFood) {
        await addJournalEntry({
          date: selectedDate,
          mealSlot,
          foodName: selectedDbFood.nameEn,
          foodNameBn: selectedDbFood.nameBn,
          fctCode: selectedDbFood.code,
          servingLabel: `${servingGrams}g`,
          servingGrams,
          calories: Math.round(scaledDbFood.caloriesKcal ?? 0),
          proteinG: Number((scaledDbFood.proteinG ?? 0).toFixed(1)),
          carbsG: Number((scaledDbFood.carbsG ?? 0).toFixed(1)),
          fatG: Number((scaledDbFood.totalFatG ?? 0).toFixed(1)),
          fiberG: Number((scaledDbFood.fiberG ?? 0).toFixed(1)),
          source: selectedDbFood.sourceName,
          notes: notes.trim() || undefined,
        });
      } else if (mode === 'custom' && customName.trim()) {
        await addJournalEntry({
          date: selectedDate,
          mealSlot,
          foodName: customName.trim(),
          foodNameBn: customName.trim(),
          servingLabel: `${customGrams}g`,
          servingGrams: customGrams,
          calories: Math.round(customCalories),
          proteinG: Number(customProtein),
          carbsG: Number(customCarbs),
          fatG: Number(customFat),
          fiberG: Number(customFiber),
          source: 'User Custom Entry',
          notes: notes.trim() || undefined,
        });
        setCustomName('');
      }
      setNotes('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCsv = () => {
    if (journalEntries.length === 0) return;
    const header = 'Date,MealSlot,Food,ServingGrams,Calories,ProteinG,CarbsG,FatG,FiberG,Source';
    const rows = journalEntries.map((e) =>
      [
        e.date,
        e.mealSlot,
        `"${(e.foodName || '').replace(/"/g, '""')}"`,
        e.servingGrams,
        e.calories,
        e.proteinG,
        e.carbsG,
        e.fatG,
        e.fiberG,
        `"${(e.source || '').replace(/"/g, '""')}"`,
      ].join(',')
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aahariq-food-journal-${selectedDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const slotLabel = (slot: MealSlot) => {
    if (language === 'bn') {
      return {
        breakfast: 'সকালের নাস্তা',
        lunch: 'দুপুরের খাবার',
        dinner: 'রাতের খাবার',
        snack: 'বিকেলের নাস্তা',
      }[slot];
    }
    return slot.charAt(0).toUpperCase() + slot.slice(1);
  };

  const progressPct = Math.min(100, Math.round((dailyTotals.calories / calorieGoal) * 100));

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#16382C] via-[#1E4A3B] to-[#122E24] text-white p-6 sm:p-8 rounded-3xl border border-emerald-800/40 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'দৈনিক খাদ্য ও পুষ্টি ইতিহাস' : 'Daily Intake & Macro Tracking'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              {language === 'bn' ? 'ব্যক্তিগত খাদ্য জার্নাল' : 'Personal Food Journal'}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              {language === 'bn'
                ? 'বাংলাদেশ খাদ্য ডেটাবেজ বা নিজস্ব খাবার থেকে প্রতিদিনের খাবার যুক্ত করুন এবং ক্যালোরি ও ম্যাক্রো অগ্রগতি দেখুন।'
                : 'Log daily meals directly from the 389 Bangladesh FCTB records or custom entries, track macros by meal slot, and monitor 7-day trends.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center space-x-2 bg-[#112920] px-3 py-2 rounded-xl border border-emerald-700/50">
              <Calendar className="w-4 h-4 text-emerald-300" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-white font-mono-num text-xs focus:outline-none"
              />
            </div>

            {journalEntries.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold flex items-center space-x-1.5 border border-white/15"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'CSV ডাউনলোড' : 'Export CSV'}</span>
                </button>
                <button
                  type="button"
                  onClick={clearJournalEntries}
                  className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-bold flex items-center space-x-1.5 border border-rose-400/30"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'সব মুছুন' : 'Clear All'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {!isAuthenticated && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start space-x-2.5 text-emerald-950">
            <AlertCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>
              {language === 'bn'
                ? 'অতিথি ওয়ার্কস্পেসে এন্ট্রিগুলো সংরক্ষিত হচ্ছে। সব ডিভাইস থেকে অ্যাকাউন্ট-ভিত্তিক সিঙ্ক করতে সাইন ইন করুন।'
                : 'Entries are currently stored in your local workspace session. Sign in to associate your journal privately with your AaharIQ account.'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="self-start sm:self-center px-3.5 py-1.5 bg-[#16382C] text-white rounded-xl font-bold shrink-0"
          >
            {language === 'bn' ? 'সাইন ইন / নিবন্ধন' : 'Sign In / Create Account'}
          </button>
        </div>
      )}

      {/* Daily Summary & 7-Day Trend Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Summary Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-stone-900 text-base">
                {language === 'bn' ? 'দৈনিক পুষ্টি সারসংক্ষেপ' : 'Daily Intake Summary'}
              </h2>
              <span className="text-xs text-stone-500 font-mono-num">{selectedDate}</span>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 text-lg font-black text-stone-900 font-mono-num">
                <Flame className="w-4 h-4 text-[#E76F51]" />
                <span>{dailyTotals.calories}</span>
                <span className="text-xs font-normal text-stone-400">/ {calorieGoal} kcal</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 font-mono-num">{progressPct}% of target</span>
            </div>
          </div>

          <div className="w-full h-3 rounded-full bg-stone-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                dailyTotals.calories > calorieGoal ? 'bg-[#E76F51]' : 'bg-emerald-600'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
              <span className="text-[10px] font-bold uppercase text-emerald-700 block">
                {language === 'bn' ? 'প্রোটিন' : 'Protein'}
              </span>
              <span className="text-base font-black text-stone-900 font-mono-num">{dailyTotals.proteinG}g</span>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100">
              <span className="text-[10px] font-bold uppercase text-amber-800 block">
                {language === 'bn' ? 'শর্করা' : 'Carbs'}
              </span>
              <span className="text-base font-black text-stone-900 font-mono-num">{dailyTotals.carbsG}g</span>
            </div>
            <div className="p-3 rounded-2xl bg-orange-50 border border-orange-100">
              <span className="text-[10px] font-bold uppercase text-orange-800 block">
                {language === 'bn' ? 'চর্বি' : 'Fat'}
              </span>
              <span className="text-base font-black text-stone-900 font-mono-num">{dailyTotals.fatG}g</span>
            </div>
            <div className="p-3 rounded-2xl bg-teal-50 border border-teal-100">
              <span className="text-[10px] font-bold uppercase text-teal-800 block">
                {language === 'bn' ? 'ফাইবার' : 'Fiber'}
              </span>
              <span className="text-base font-black text-stone-900 font-mono-num">{dailyTotals.fiberG}g</span>
            </div>
          </div>
        </div>

        {/* 7-Day Calorie SVG Chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-stone-900 text-base">
                {language === 'bn' ? 'সাপ্তাহিক ক্যালোরি প্রবণতা (৭ দিন)' : '7-Day Calorie Log History'}
              </h2>
              <p className="text-xs text-stone-500">
                {language === 'bn' ? 'যে কোনো দিনে ক্লিক করে ওই দিনের খাবার দেখুন' : 'Click any bar to inspect or log meals for that date'}
              </p>
            </div>
            <span className="text-[11px] text-stone-500 font-mono-num">
              {language === 'bn' ? 'লক্ষ্য:' : 'Goal:'} {calorieGoal} kcal
            </span>
          </div>

          <div className="h-40 flex items-end justify-between gap-2 sm:gap-3 pt-4 border-t border-stone-100">
            {last7Days.map((day) => {
              const heightPct = Math.max(4, Math.round((day.kcal / maxChartKcal) * 100));
              const isSelected = day.date === selectedDate;
              return (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => setSelectedDate(day.date)}
                  className="flex-1 flex flex-col items-center space-y-1.5 group h-full justify-end"
                >
                  <span className="text-[10px] font-mono-num text-stone-500 group-hover:text-stone-900">
                    {day.kcal > 0 ? day.kcal : '0'}
                  </span>
                  <div className="w-full max-w-[38px] bg-stone-100 rounded-t-xl h-24 flex items-end overflow-hidden">
                    <div
                      className={`w-full rounded-t-xl transition-all ${
                        isSelected
                          ? 'bg-[#E76F51]'
                          : day.kcal > 0
                          ? 'bg-emerald-600 group-hover:bg-emerald-500'
                          : 'bg-stone-200'
                      }`}
                      style={{ height: `${day.kcal === 0 ? 4 : heightPct}%` }}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-mono-num ${
                      isSelected ? 'font-extrabold text-[#E76F51]' : 'text-stone-500'
                    }`}
                  >
                    {day.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Food Entry + Daily Log Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Log New Meal Form */}
        <form
          onSubmit={handleLogMeal}
          className="lg:col-span-5 bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-sm space-y-4 self-start"
        >
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-extrabold text-stone-900 text-base">
              {language === 'bn' ? 'নতুন খাবার যুক্ত করুন' : 'Log a Meal'}
            </h3>
            <div className="flex items-center space-x-1 bg-stone-100 p-1 rounded-xl text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setMode('database')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  mode === 'database' ? 'bg-white text-emerald-900 shadow-sm' : 'text-stone-500'
                }`}
              >
                {language === 'bn' ? 'BD ডেটাবেজ' : 'BD FCTB'}
              </button>
              <button
                type="button"
                onClick={() => setMode('custom')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  mode === 'custom' ? 'bg-white text-emerald-900 shadow-sm' : 'text-stone-500'
                }`}
              >
                {language === 'bn' ? 'কাস্টম' : 'Custom'}
              </button>
            </div>
          </div>

          {/* Meal Slot */}
          <div className="grid grid-cols-4 gap-1.5">
            {(['breakfast', 'lunch', 'dinner', 'snack'] as MealSlot[]).map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setMealSlot(slot)}
                className={`py-2 rounded-xl text-[11px] font-bold border transition-colors ${
                  mealSlot === slot
                    ? 'bg-[#16382C] text-white border-[#16382C]'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {slotLabel(slot)}
              </button>
            ))}
          </div>

          {mode === 'database' ? (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={dbQuery}
                  onChange={(e) => setDbQuery(e.target.value)}
                  placeholder={language === 'bn' ? 'খাদ্য খুঁজুন (ভাত, ইলিশ, ডিম, লাল শাক)...' : 'Search BD foods (Rice, Ilish, Egg, Dal)...'}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="max-h-44 overflow-y-auto divide-y divide-stone-100 border border-stone-200 rounded-xl bg-stone-50/50">
                {searchResults.map((food) => {
                  const selected = selectedDbFood?.code === food.code;
                  return (
                    <button
                      key={food.code}
                      type="button"
                      onClick={() => {
                        setSelectedDbFood(food);
                        setServingGrams(food.defaultServingGrams || 100);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors ${
                        selected ? 'bg-emerald-100/80 text-emerald-950 font-bold' : 'hover:bg-white text-stone-700'
                      }`}
                    >
                      <span className="truncate pr-2">
                        {language === 'bn' ? food.nameBn : food.nameEn}
                      </span>
                      <span className="text-[11px] font-mono-num text-stone-500 shrink-0">
                        {food.nutrientsPer100g.caloriesKcal ?? '—'} kcal/100g
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedDbFood && scaledDbFood && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950">
                      {language === 'bn' ? selectedDbFood.nameBn : selectedDbFood.nameEn}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 uppercase">
                      {selectedDbFood.prepState}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-stone-600 font-semibold">
                      {language === 'bn' ? 'পরিমাণ (গ্রাম):' : 'Serving Weight (g):'}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={2000}
                      value={servingGrams}
                      onChange={(e) => setServingGrams(Math.max(1, Number(e.target.value)))}
                      className="w-24 px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg font-mono-num text-right text-stone-900 font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2 pt-1 text-[11px] font-mono-num text-stone-700">
                    <span>{Math.round(scaledDbFood.caloriesKcal ?? 0)} kcal</span>
                    <span>P: {(scaledDbFood.proteinG ?? 0).toFixed(1)}g</span>
                    <span>C: {(scaledDbFood.carbsG ?? 0).toFixed(1)}g</span>
                    <span>F: {(scaledDbFood.totalFatG ?? 0).toFixed(1)}g</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  {language === 'bn' ? 'খাবারের নাম' : 'Food Name'}
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder={language === 'bn' ? 'যেমন: ঘরে রান্না খিচুড়ি' : 'e.g. Homemade Vegetable Khichuri'}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    {language === 'bn' ? 'ওজন (গ্রাম)' : 'Grams'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={customGrams}
                    onChange={(e) => setCustomGrams(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono-num"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    {language === 'bn' ? 'ক্যালোরি (kcal)' : 'Calories (kcal)'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={customCalories}
                    onChange={(e) => setCustomCalories(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono-num"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-stone-600 block mb-1">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    min={0}
                    value={customProtein}
                    onChange={(e) => setCustomProtein(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-stone-50 border border-stone-200 rounded-lg font-mono-num"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-600 block mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    min={0}
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-stone-50 border border-stone-200 rounded-lg font-mono-num"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-600 block mb-1">Fat (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    min={0}
                    value={customFat}
                    onChange={(e) => setCustomFat(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-stone-50 border border-stone-200 rounded-lg font-mono-num"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-600 block mb-1">Fiber (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    min={0}
                    value={customFiber}
                    onChange={(e) => setCustomFiber(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-stone-50 border border-stone-200 rounded-lg font-mono-num"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={language === 'bn' ? 'ঐচ্ছিক নোট (যেমন: কম তেল)...' : 'Optional note (e.g. less oil, home cooked)...'}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || (mode === 'database' ? !selectedDbFood : !customName.trim())}
            className="w-full py-3 bg-[#1B4332] hover:bg-[#255C45] text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'bn' ? 'জার্নালে সংরক্ষণ করুন' : 'Add to Food Journal'}</span>
          </button>
        </form>

        {/* Right: Logged Entries for Selected Date */}
        <div className="lg:col-span-7 space-y-4">
          {(['breakfast', 'lunch', 'dinner', 'snack'] as MealSlot[]).map((slot) => {
            const slotItems = entriesForDate.filter((e) => e.mealSlot === slot);
            const slotCalories = slotItems.reduce((s, e) => s + e.calories, 0);

            return (
              <div
                key={slot}
                className="bg-white rounded-2xl p-5 border border-emerald-950/10 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-stone-900 text-sm">{slotLabel(slot)}</span>
                    <span className="text-[11px] text-stone-400 font-mono-num">({slotItems.length})</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 font-mono-num">
                    {slotCalories} kcal
                  </span>
                </div>

                {slotItems.length === 0 ? (
                  <p className="text-xs text-stone-400 py-2">
                    {language === 'bn' ? 'এই বেলায় কোনো খাবার যুক্ত করা হয়নি।' : 'No entries logged for this meal slot yet.'}
                  </p>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {slotItems.map((entry) => (
                      <div
                        key={entry.id}
                        className="py-2.5 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="font-bold text-stone-900 truncate">
                            {language === 'bn' ? entry.foodNameBn : entry.foodName}
                          </div>
                          <div className="text-[11px] text-stone-500 font-mono-num">
                            {entry.servingGrams}g · P {entry.proteinG}g · C {entry.carbsG}g · F {entry.fatG}g
                            {entry.notes ? ` · ${entry.notes}` : ''}
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 shrink-0">
                          <span className="font-extrabold text-[#E76F51] font-mono-num">
                            {entry.calories} kcal
                          </span>
                          <button
                            type="button"
                            onClick={() => deleteJournalEntry(entry.id)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            aria-label="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
