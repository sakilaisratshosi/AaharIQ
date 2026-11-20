import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FoodWastePlanResult } from '../types';
import { resolveRecipeImage } from '../utils/recipeImageResolver';
import {
  hasBanglaText,
  toBanglaDigits,
  translateCookingStepToBn,
  translateIngredientToBn,
  translateUnitToBn,
} from '../utils/bilingualRecipeTranslator';
import {
  Leaf,
  Plus,
  X,
  Clock,
  Flame,
  Refrigerator,
  Snowflake,
  Package,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  ChefHat,
  Info,
  ShoppingCart,
} from 'lucide-react';

interface NearExpiryEntry {
  id: string;
  name: string;
  daysRemaining: number;
}

export const FoodWasteView: React.FC = () => {
  const { language, addBatchGroceryItems, pushAppNotification } = useApp();

  const [availableIngredients, setAvailableIngredients] = useState<string[]>([
    'Spinach (শাক)',
    'Potato',
    'Onion',
  ]);
  const [leftoverIngredients, setLeftoverIngredients] = useState<string[]>([
    'Cooked Rice (ভাত)',
  ]);
  const [nearExpiryIngredients, setNearExpiryIngredients] = useState<NearExpiryEntry[]>([
    { id: 'ne_1', name: 'Ripe Tomato', daysRemaining: 1 },
  ]);

  const [availInput, setAvailInput] = useState('');
  const [leftoverInput, setLeftoverInput] = useState('');
  const [nearNameInput, setNearNameInput] = useState('');
  const [nearDaysInput, setNearDaysInput] = useState<number>(2);
  const [storageLocation, setStorageLocation] = useState<'refrigerator' | 'freezer' | 'pantry'>('refrigerator');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FoodWastePlanResult | null>(null);

  const addAvailable = () => {
    const val = availInput.trim();
    if (val && !availableIngredients.includes(val)) {
      setAvailableIngredients((prev) => [...prev, val]);
      setAvailInput('');
    }
  };

  const addLeftover = () => {
    const val = leftoverInput.trim();
    if (val && !leftoverIngredients.includes(val)) {
      setLeftoverIngredients((prev) => [...prev, val]);
      setLeftoverInput('');
    }
  };

  const addNearExpiry = () => {
    const val = nearNameInput.trim();
    if (val) {
      setNearExpiryIngredients((prev) => [
        ...prev,
        { id: 'ne_' + Date.now(), name: val, daysRemaining: Number(nearDaysInput) },
      ]);
      setNearNameInput('');
      setNearDaysInput(2);
    }
  };

  const loadSampleScenario = (preset: 'rice_shak' | 'cabbage_expired' | 'tomato_egg') => {
    setError(null);
    if (preset === 'rice_shak') {
      setAvailableIngredients(['Red Lentils (মসুর ডাল)', 'Garlic']);
      setLeftoverIngredients(['Cooked Rice (ভাত)']);
      setNearExpiryIngredients([{ id: 's1', name: 'Spinach (পালং শাক)', daysRemaining: 1 }]);
      setStorageLocation('refrigerator');
    } else if (preset === 'cabbage_expired') {
      setAvailableIngredients(['Cabbage (বাঁধাকপি)', 'Potato']);
      setLeftoverIngredients([]);
      setNearExpiryIngredients([{ id: 's2', name: 'Raw Fish Fillet', daysRemaining: -1 }]);
      setStorageLocation('refrigerator');
    } else {
      setAvailableIngredients(['Potato', 'Egg']);
      setLeftoverIngredients(['Steamed Rice']);
      setNearExpiryIngredients([{ id: 's3', name: 'Soft Ripe Tomato', daysRemaining: 1 }]);
      setStorageLocation('pantry');
    }
  };

  const handleAnalyzeWastePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/gemini/food-waste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          availableIngredients,
          leftoverIngredients,
          nearExpiryIngredients: nearExpiryIngredients.map((x) => ({
            name: x.name,
            daysRemaining: x.daysRemaining,
          })),
          storageLocation,
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate waste reduction plan.');
      }
      setResult(data);

      if (Array.isArray(data.expiredItemsExcluded) && data.expiredItemsExcluded.length > 0) {
        pushAppNotification({
          title: 'Expired Item Safety Alert',
          titleBn: 'মেয়াদোত্তীর্ণ খাদ্য সতর্কতা',
          message: `Excluded expired item(s): ${data.expiredItemsExcluded.map((i: any) => i.name).join(', ')}. Do not consume spoiled perishables.`,
          messageBn: `মেয়াদোত্তীর্ণ খাবার বাদ দেওয়া হয়েছে: ${data.expiredItemsExcluded.map((i: any) => i.name).join(', ')}। নষ্ট খাবার গ্রহণ করবেন না।`,
          category: 'waste',
          targetView: 'food-waste',
        });
      }
    } catch (err: any) {
      setError(
        err.message ||
          (language === 'bn'
            ? 'খাদ্য অপচয় রোধ পরিকল্পনা তৈরি করতে সমস্যা হয়েছে।'
            : 'Unable to analyze food waste plan right now.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#16382C] via-[#1E4A3B] to-[#122E24] text-white p-6 sm:p-8 rounded-3xl border border-emerald-800/40 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
              <Leaf className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'স্মার্ট কিচেন ও অপচয় রোধ' : 'Smart Kitchen & Zero-Waste Preservation'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              {language === 'bn' ? 'খাদ্য অপচয় রোধ এআই' : 'Food Waste Reduction AI'}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              {language === 'bn'
                ? 'মেয়াদ শেষ হতে যাওয়া, বেঁচে যাওয়া ও ঘরে থাকা উপাদান দিয়ে নিরাপদ রেসিপি তৈরি করুন এবং সঠিক সংরক্ষণ পদ্ধতি জানুন।'
                : 'Prioritize near-expiry foods, safely transform leftovers, and follow evidence-based cold-chain storage limits without compromising food safety.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => loadSampleScenario('rice_shak')}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-100 font-semibold border border-white/15 transition-colors"
            >
              {language === 'bn' ? 'নমুনা: ভাত ও শাক' : 'Sample: Leftover Rice & Spinach'}
            </button>
            <button
              type="button"
              onClick={() => loadSampleScenario('cabbage_expired')}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-100 font-semibold border border-white/15 transition-colors"
            >
              {language === 'bn' ? 'নমুনা: মেয়াদ সতর্কতা' : 'Sample: Expired Safety Check'}
            </button>
          </div>
        </div>
      </div>

      {/* Safety Guardrail Notice */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-start space-x-3 text-xs text-stone-700">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-900">
            {language === 'bn'
              ? 'খাদ্য নিরাপত্তা প্রথম: নষ্ট বা মেয়াদোত্তীর্ণ খাবার কখনই খাওয়া উচিত নয়'
              : 'Safety First: Never Repurpose Spoiled or Use-By Expired Food'}
          </p>
          <p className="leading-relaxed">
            {language === 'bn'
              ? '"Best Before" মানে গুণগত মানের নির্দেশক, তবে "Use By" হলো নিরাপত্তার চূড়ান্ত সময়সীমা। মাছ, মাংস, দুধ বা >২ ঘণ্টার বেশি বাইরে থাকা রান্না করা ভাতে দুর্গন্ধ, ছত্রাক বা পিচ্ছিল ভাব থাকলে তা বর্জন করুন।'
              : '"Best Before" reflects peak quality, whereas "Use By" marks a strict microbiological safety limit. Discard perishables with visible mold, slime, off-odors, or cooked rice left unchilled over 2 hours.'}
          </p>
        </div>
      </div>

      {/* Inventory Input Form */}
      <form
        onSubmit={handleAnalyzeWastePlan}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-950/10 shadow-sm space-y-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 1. Near-Expiry Items */}
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-amber-950 uppercase tracking-wider">
                {language === 'bn' ? '১. দ্রুত মেয়াদ শেষ হবে' : '1. Near-Expiry Items'}
              </label>
              <span className="text-[10px] font-bold text-amber-700">
                {language === 'bn' ? 'অগ্রাধিকার তালিকা' : 'Cook First'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={nearNameInput}
                onChange={(e) => setNearNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addNearExpiry();
                  }
                }}
                placeholder={language === 'bn' ? 'যেমন: পালং শাক' : 'e.g. Spinach, Tomato'}
                className="flex-1 min-w-0 px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <input
                type="number"
                min={-7}
                max={30}
                value={nearDaysInput}
                onChange={(e) => setNearDaysInput(Number(e.target.value))}
                title={language === 'bn' ? 'বাকি দিন (নেগেটিভ = মেয়াদ শেষ)' : 'Days left (-1 = expired)'}
                className="w-16 px-2 py-2 bg-white border border-amber-200 rounded-xl text-xs font-mono-num text-center text-stone-900"
              />
              <button
                type="button"
                onClick={addNearExpiry}
                className="p-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white"
                aria-label="Add near expiry item"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-stone-500">
              {language === 'bn'
                ? 'সংখ্যা = বাকি দিন (০ = আজই, -১ = ইতিমধ্যে মেয়াদোত্তীর্ণ)'
                : 'Number = days remaining (0 = today, -1 = already expired)'}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {nearExpiryIngredients.map((item) => {
                const isExpired = item.daysRemaining < 0;
                return (
                  <span
                    key={item.id}
                    className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                      isExpired
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-white text-amber-900 border-amber-300'
                    }`}
                  >
                    <span>
                      {item.name} ({isExpired ? (language === 'bn' ? 'মেয়াদোত্তীর্ণ' : 'Expired') : `${item.daysRemaining}d`})
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setNearExpiryIngredients((prev) => prev.filter((x) => x.id !== item.id))
                      }
                      className="hover:text-rose-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>

          {/* 2. Leftover Foods */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
            <label className="text-xs font-extrabold text-stone-800 uppercase tracking-wider block">
              {language === 'bn' ? '২. বেঁচে যাওয়া খাবার' : '2. Cooked Leftovers'}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={leftoverInput}
                onChange={(e) => setLeftoverInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addLeftover();
                  }
                }}
                placeholder={language === 'bn' ? 'যেমন: ভাত, ডাল, রুটি' : 'e.g. Cooked Rice, Boiled Potato'}
                className="flex-1 min-w-0 px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={addLeftover}
                className="p-2 rounded-xl bg-[#1B4332] hover:bg-[#255C45] text-white"
                aria-label="Add leftover food"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {leftoverIngredients.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-stone-800 border border-stone-300"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => setLeftoverIngredients((prev) => prev.filter((x) => x !== item))}
                    className="text-stone-400 hover:text-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 3. Available Pantry / Kitchen Ingredients */}
          <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/60 space-y-3">
            <label className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider block">
              {language === 'bn' ? '৩. ঘরে থাকা উপাদান' : '3. Available Ingredients'}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={availInput}
                onChange={(e) => setAvailInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addAvailable();
                  }
                }}
                placeholder={language === 'bn' ? 'যেমন: বাঁধাকপি, ডিম, আলু' : 'e.g. Cabbage, Egg, Lentils'}
                className="flex-1 min-w-0 px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={addAvailable}
                className="p-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white"
                aria-label="Add available ingredient"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {availableIngredients.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-emerald-900 border border-emerald-300"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => setAvailableIngredients((prev) => prev.filter((x) => x !== item))}
                    className="text-stone-400 hover:text-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Storage Location + Submit */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-stone-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-stone-600 mr-1">
              {language === 'bn' ? 'সংরক্ষণের স্থান:' : 'Storage Location:'}
            </span>
            {[
              { id: 'refrigerator', labelEn: 'Refrigerator (4°C)', labelBn: 'ফ্রিজ (৪°C)', icon: Refrigerator },
              { id: 'freezer', labelEn: 'Freezer (-18°C)', labelBn: 'ডিপ ফ্রিজ (-১৮°C)', icon: Snowflake },
              { id: 'pantry', labelEn: 'Dry Pantry', labelBn: 'শুকনো শেলফ', icon: Package },
            ].map((loc) => {
              const Icon = loc.icon;
              const active = storageLocation === loc.id;
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setStorageLocation(loc.id as any)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    active
                      ? 'bg-[#16382C] text-white border-[#16382C]'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? loc.labelBn : loc.labelEn}</span>
                </button>
              );
            })}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#E76F51] hover:bg-[#d85c3f] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>
              {loading
                ? (language === 'bn' ? 'পরিকল্পনা তৈরি হচ্ছে...' : 'Generating Smart Plan...')
                : (language === 'bn' ? 'অপচয় রোধ পরিকল্পনা তৈরি করুন' : 'Generate Zero-Waste Plan')}
            </span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}
      </form>

      {/* Results View */}
      {result && (
        <div className="space-y-8 animate-fade-in">
          {/* Expired Warning Banner */}
          {result.expiredItemsExcluded && result.expiredItemsExcluded.length > 0 && (
            <div className="bg-rose-50 border border-rose-300 rounded-2xl p-5 flex items-start space-x-3 text-xs text-rose-900">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm text-rose-900">
                  {language === 'bn'
                    ? 'মেয়াদোত্তীর্ণ উপাদান বাদ দেওয়া হয়েছে (নিরাপত্তা নীতি)'
                    : 'Expired Items Excluded From Recipes'}
                </h3>
                <p>
                  {language === 'bn'
                    ? `নিম্নলিখিত খাবারগুলো মেয়াদোত্তীর্ণ হওয়ায় রান্না বা সংরক্ষণের পরামর্শ থেকে বাদ দেওয়া হয়েছে: `
                    : `The following items have negative days remaining and were excluded for your safety: `}
                  <strong>
                    {result.expiredItemsExcluded.map((i) => `${i.name} (${i.daysRemaining}d)`).join(', ')}
                  </strong>
                </p>
              </div>
            </div>
          )}

          {/* Priority Order Strip */}
          {result.prioritizedIngredients.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-emerald-950/10 shadow-sm space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-stone-500 block">
                {language === 'bn' ? 'প্রথমে ব্যবহারের অগ্রাধিকার ক্রম' : 'Recommended Use-First Priority'}
              </span>
              <div className="flex flex-wrap gap-2">
                {result.prioritizedIngredients.map((item, idx) => (
                  <span
                    key={`${item}-${idx}`}
                    className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900"
                  >
                    <span className="text-emerald-600 font-mono-num">#{idx + 1}</span>
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Prioritized Recipes */}
          {result.recommendedRecipes && result.recommendedRecipes.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center space-x-2">
                <ChefHat className="w-5 h-5 text-emerald-700" />
                <h2 className="text-xl font-black text-stone-900">
                  {language === 'bn' ? 'অগ্রাধিকারভিত্তিক জিরো-ওয়েস্ট রেসিপি' : 'Priority Zero-Waste Recipes'}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {result.recommendedRecipes.map((rec) => (
                  <div
                    key={rec.id}
                    className="bg-white rounded-2xl overflow-hidden border border-emerald-950/10 shadow-sm flex flex-col justify-between"
                  >
                    <div className="relative h-44 w-full bg-stone-100">
                      <img
                        src={resolveRecipeImage(rec as any)}
                        alt={language === 'bn' ? rec.recipeNameBn : rec.recipeName}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const img = e.currentTarget;
                          if (!img.dataset.fallbackApplied) {
                            img.dataset.fallbackApplied = '1';
                            img.src = '/images/food-placeholder.jpg';
                          }
                        }}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] font-semibold">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-emerald-300" />
                          <span className="font-mono-num">
                            {rec.prepTimeMinutes + rec.cookTimeMinutes} {language === 'bn' ? 'মিনিট' : 'mins'}
                          </span>
                        </span>
                        <span className="flex items-center space-x-1 text-amber-300">
                          <Flame className="w-3.5 h-3.5" />
                          <span className="font-mono-num">{rec.caloriesPerServing} kcal</span>
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h3 className="font-extrabold text-stone-900 text-sm">
                          {language === 'bn' ? rec.recipeNameBn : rec.recipeName}
                        </h3>
                        <p className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-xl leading-relaxed">
                          {language === 'bn' ? rec.whyWasteSmartBn : rec.whyWasteSmart}
                        </p>
                        <ul className="space-y-1.5 text-xs text-stone-700">
                          {rec.instructions.slice(0, 3).map((enStep, i) => {
                            const rawBn = rec.instructionsBn?.[i];
                            const bnStep =
                              rawBn && hasBanglaText(rawBn)
                                ? rawBn
                                : translateCookingStepToBn(enStep);
                            const primary = language === 'bn' ? bnStep : enStep;
                            const secondary = language === 'bn' ? enStep : bnStep;
                            return (
                              <li key={i} className="bg-stone-50 p-2 rounded-lg border border-stone-100 space-y-0.5">
                                <div className="font-medium">
                                  <span className="font-bold text-emerald-700 mr-1">
                                    {language === 'bn' ? toBanglaDigits(i + 1) : i + 1}.
                                  </span>
                                  {primary}
                                </div>
                                {secondary && secondary !== primary && (
                                  <div className="text-[11px] text-stone-500 pl-3.5">
                                    <span className="font-semibold text-emerald-700 mr-1">
                                      {language === 'bn' ? 'EN:' : 'বাংলা:'}
                                    </span>
                                    {secondary}
                                  </div>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2 text-[11px] text-stone-600">
                        <span className="leading-snug">
                          {rec.usedIngredients
                            .map((ing) => {
                              const bn = hasBanglaText(ing) ? ing : translateIngredientToBn(ing);
                              return bn !== ing ? `${ing} (${bn})` : ing;
                            })
                            .join(' · ')}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            addBatchGroceryItems(
                              rec.usedIngredients.map((name) => ({
                                name,
                                nameBn: hasBanglaText(name) ? name : translateIngredientToBn(name),
                                amount: '1',
                                unit: 'portion',
                                unitBn: translateUnitToBn('portion'),
                                category: 'produce',
                                addedFrom: rec.recipeName,
                              }))
                            )
                          }
                          className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center space-x-1 shrink-0"
                        >
                          <ShoppingCart className="w-3 h-3" />
                          <span>{language === 'bn' ? 'ফর্দে রাখুন' : 'To Grocery'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Leftover Transformation & Preservation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Leftover Ideas */}
            <div className="bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-sm space-y-4">
              <h3 className="font-extrabold text-stone-900 text-base">
                {language === 'bn' ? 'বেঁচে যাওয়া খাবার রূপান্তরের ধারণা' : 'Smart Leftover Ideas'}
              </h3>
              <div className="space-y-3">
                {result.leftoverIdeas.map((idea, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1.5">
                    <h4 className="font-bold text-stone-900 text-sm">
                      {language === 'bn' ? idea.titleBn : idea.title}
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {language === 'bn' ? idea.descriptionBn : idea.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Preservation Tips */}
            <div className="bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-sm space-y-4">
              <h3 className="font-extrabold text-stone-900 text-base">
                {language === 'bn' ? 'সংরক্ষণ ও সতেজতা বৃদ্ধির কৌশল' : 'Preservation Guidelines'}
              </h3>
              <div className="space-y-3">
                {result.preservationTips.map((tip, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 space-y-1.5">
                    <h4 className="font-bold text-emerald-950 text-sm flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{language === 'bn' ? tip.titleBn : tip.title}</span>
                    </h4>
                    <p className="text-xs text-stone-700 leading-relaxed">
                      {language === 'bn' ? tip.detailBn : tip.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Storage Matrix Table */}
          <section className="bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-sm space-y-4">
            <h3 className="font-extrabold text-stone-900 text-base">
              {language === 'bn' ? 'উপাদানভিত্তিক সংরক্ষণ ও পচন লক্ষণ গাইড' : 'Ingredient Storage & Spoilage Reference'}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 pr-4">{language === 'bn' ? 'উপাদান' : 'Ingredient'}</th>
                    <th className="py-2.5 pr-4">{language === 'bn' ? 'সঠিক সংরক্ষণ পদ্ধতি' : 'Optimal Storage'}</th>
                    <th className="py-2.5 pr-4">{language === 'bn' ? 'আনুমানিক স্থায়িত্ব' : 'Estimated Shelf Life'}</th>
                    <th className="py-2.5">{language === 'bn' ? 'পচন শনাক্তকরণ (কখন ফেলে দেবেন)' : 'Spoilage Warning Signs'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {result.storageGuide.map((row, i) => (
                    <tr key={i} className="align-top">
                      <td className="py-3 pr-4 font-bold text-stone-900 whitespace-nowrap">{row.ingredient}</td>
                      <td className="py-3 pr-4 text-stone-700 leading-relaxed">
                        {language === 'bn' ? row.optimalStorageBn : row.optimalStorage}
                      </td>
                      <td className="py-3 pr-4 font-semibold text-emerald-800 whitespace-nowrap">
                        {language === 'bn' ? row.shelfLifeEstimateBn : row.shelfLifeEstimate}
                      </td>
                      <td className="py-3 text-rose-700 leading-relaxed">
                        {language === 'bn' ? row.spoilageSignsBn : row.spoilageSigns}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Safety Reminders */}
          <div className="bg-stone-900 text-stone-100 rounded-3xl p-6 space-y-2.5">
            <h4 className="font-bold text-sm flex items-center space-x-2 text-amber-300">
              <Info className="w-4 h-4" />
              <span>{language === 'bn' ? 'গুরুত্বপূর্ণ খাদ্য নিরাপত্তা স্মারক' : 'Mandatory Food Safety Reminders'}</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-300 list-disc list-inside">
              {(language === 'bn' ? result.safetyRemindersBn : result.safetyReminders).map((item, idx) => (
                <li key={idx} className="leading-relaxed">{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
