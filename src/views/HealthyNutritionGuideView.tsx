import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { RECIPES_DATABASE, Recipe } from '../data/recipesData';
import {
  BALANCED_PLATE_PROPORTIONS,
  HEALTHY_MEAL_IDEAS,
  NUTRIENT_EDUCATION_CARDS,
} from '../data/healthyNutritionGuideData';
import { resolveRecipeImage } from '../utils/recipeImageResolver';
import { formatCountryLabel } from '../utils/countryNormalizer';
import {
  HeartHandshake,
  Utensils,
  Sun,
  Coffee,
  Moon,
  Sparkles,
  BookOpen,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  SlidersHorizontal,
  Database,
  Search,
} from 'lucide-react';

type DietPattern = 'all' | 'vegetarian' | 'vegan' | 'halal' | 'pescatarian';
type DietaryGoal = 'balanced' | 'high_protein' | 'high_fiber' | 'low_sugar' | 'plant_forward';

const COMMON_ALLERGENS: Array<{ id: string; labelEn: string; labelBn: string; terms: string[] }> = [
  { id: 'dairy', labelEn: 'Dairy / Milk', labelBn: 'দুগ্ধজাত (দুধ/পনির/দই)', terms: ['milk', 'yogurt', 'curd', 'paneer', 'cheese', 'cream', 'butter', 'ghee', 'mozzarella'] },
  { id: 'nuts', labelEn: 'Nuts / Peanuts', labelBn: 'বাদাম (কাঠবাদাম/চিনাবাদাম)', terms: ['peanut', 'cashew', 'almond', 'walnut', 'nut'] },
  { id: 'egg', labelEn: 'Eggs', labelBn: 'ডিম', terms: ['egg'] },
  { id: 'seafood', labelEn: 'Fish / Shrimp', labelBn: 'মাছ ও চিংড়ি', terms: ['fish', 'hilsa', 'ilish', 'rohu', 'rui', 'salmon', 'shrimp', 'prawn', 'dashi'] },
  { id: 'gluten', labelEn: 'Wheat / Gluten', labelBn: 'গম / গ্লুটেন', terms: ['flour', 'wheat', 'pasta', 'noodle', 'spaghetti', 'tortilla', 'bread', 'soy sauce'] },
  { id: 'soy', labelEn: 'Soy / Soy Sauce', labelBn: 'সয়া / সয়া সস', terms: ['soy', 'tofu', 'edamame', 'miso'] },
];

const QUICK_PANTRY_INGREDIENTS: Array<{ id: string; labelEn: string; labelBn: string; match: string[] }> = [
  { id: 'lentil', labelEn: 'Lentils / Dal', labelBn: 'ডাল (মসুর/মুগ)', match: ['dal', 'lentil', 'moong'] },
  { id: 'spinach', labelEn: 'Spinach / Shaak', labelBn: 'পালং / লাল শাক', match: ['spinach', 'shaak', 'amaranth'] },
  { id: 'egg', labelEn: 'Eggs', labelBn: 'ডিম', match: ['egg'] },
  { id: 'chicken', labelEn: 'Chicken', labelBn: 'মুরগি', match: ['chicken'] },
  { id: 'fish', labelEn: 'Fish / Shrimp', labelBn: 'মাছ / চিংড়ি', match: ['fish', 'hilsa', 'rohu', 'salmon', 'shrimp'] },
  { id: 'rice', labelEn: 'Rice / Oats', labelBn: 'চাল / ওটস', match: ['rice', 'oat'] },
  { id: 'tomato', labelEn: 'Tomatoes', labelBn: 'টমেটো', match: ['tomato'] },
  { id: 'chickpea', labelEn: 'Chickpeas', labelBn: 'ছোলা', match: ['chickpea'] },
];

export const HealthyNutritionGuideView: React.FC = () => {
  const { language, setCurrentView, setSelectedRecipe, setSearchQuery } = useApp();
  const isBn = language === 'bn';

  const [activeMealTab, setActiveMealTab] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [dietPattern, setDietPattern] = useState<DietPattern>('all');
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [selectedCulture, setSelectedCulture] = useState<string>('all');
  const [mealFocus, setMealFocus] = useState<'all' | 'breakfast' | 'lunch' | 'dinner' | 'snack'>('all');
  const [nutritionGoal, setNutritionGoal] = useState<DietaryGoal>('balanced');
  const [selectedPantryIds, setSelectedPantryIds] = useState<string[]>([]);
  const [customAvailableText, setCustomAvailableText] = useState<string>('');

  const recipeById = useMemo(() => new Map(RECIPES_DATABASE.map((r) => [r.id, r])), []);

  const openLinkedRecipe = (linkedId?: string, fallbackKeyword?: string) => {
    if (linkedId) {
      const found = recipeById.get(linkedId);
      if (found) {
        setSelectedRecipe(found);
        return;
      }
    }
    if (fallbackKeyword) {
      setSearchQuery(fallbackKeyword);
      setCurrentView('recipes');
    }
  };

  const toggleAllergy = (id: string) => {
    setSelectedAllergies((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const togglePantry = (id: string) => {
    setSelectedPantryIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const personalizedMatches = useMemo(() => {
    const blockedTerms = selectedAllergies.flatMap(
      (id) => COMMON_ALLERGENS.find((a) => a.id === id)?.terms || []
    );
    const customTerms = customAvailableText
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length >= 2);
    const desiredPantryTerms = [
      ...selectedPantryIds.flatMap(
        (id) => QUICK_PANTRY_INGREDIENTS.find((p) => p.id === id)?.match || []
      ),
      ...customTerms,
    ];

    const scored: Array<{ recipe: Recipe; score: number; reasonEn: string; reasonBn: string }> = [];

    for (const r of RECIPES_DATABASE) {
      const titleLower = r.name.toLowerCase();
      const ingJoined = r.ingredients.map((i) => `${i.name} ${i.nameBn}`.toLowerCase()).join(' ');
      const fullHay = `${titleLower} ${ingJoined} ${(r.category || '').toLowerCase()}`;

      // Diet pattern filter
      if (dietPattern === 'vegetarian' && !r.isVegetarian) continue;
      if (dietPattern === 'vegan' && !r.isVegan) continue;
      if (dietPattern === 'halal' && !r.isHalal) continue;
      if (dietPattern === 'pescatarian') {
        const hasRedOrPoultry = /\bchicken\b|\bbeef\b|\blamb\b|\bmutton\b/.test(fullHay);
        if (hasRedOrPoultry) continue;
      }

      // Allergy exclusion
      if (blockedTerms.some((term) => fullHay.includes(term))) continue;
      if (selectedAllergies.includes('gluten') && !r.isGlutenFree && /wheat|flour|pasta|noodle|bread/.test(fullHay)) {
        continue;
      }

      // Cultural cuisine preference
      if (selectedCulture !== 'all') {
        const ctry = (r.country || r.cuisine || '').toLowerCase();
        if (selectedCulture === 'bangladeshi' && ctry !== 'bangladesh' && r.cuisine !== 'Bangladeshi') continue;
        if (selectedCulture === 'south_asian' && !['bangladesh', 'india', 'nepal'].includes(ctry)) continue;
        if (selectedCulture === 'east_asian' && !['japan', 'south korea', 'china', 'thailand'].includes(ctry)) continue;
        if (selectedCulture === 'mediterranean' && !['italy', 'greece', 'mediterranean'].includes(ctry) && r.cuisine !== 'Mediterranean') continue;
        if (selectedCulture === 'mexican_global' && !['mexico', 'usa', 'international'].includes(ctry)) continue;
      }

      // Meal slot filter
      if (mealFocus !== 'all' && r.mealType !== mealFocus) continue;

      // Exclude heavy dessert / extreme sugar when evaluating everyday healthy guidance
      const sugar = r.sugarPerServing ?? 3;
      if (sugar >= 12) continue;

      let score = 40;
      const reasonPartsEn: string[] = [];
      const reasonPartsBn: string[] = [];

      if (nutritionGoal === 'high_protein') {
        if (r.proteinPerServing < 14) continue;
        score += r.proteinPerServing * 2.5;
        reasonPartsEn.push(`${r.proteinPerServing}g protein`);
        reasonPartsBn.push(`${r.proteinPerServing} গ্রাম প্রোটিন`);
      } else if (nutritionGoal === 'high_fiber') {
        if (r.fiberPerServing < 4) continue;
        score += r.fiberPerServing * 9;
        reasonPartsEn.push(`${r.fiberPerServing}g fiber`);
        reasonPartsBn.push(`${r.fiberPerServing} গ্রাম ফাইবার`);
      } else if (nutritionGoal === 'low_sugar') {
        if (sugar > 6) continue;
        score += (6 - sugar) * 10 + r.proteinPerServing;
        reasonPartsEn.push(`low sugar (~${sugar}g)`);
        reasonPartsBn.push(`কম চিনি (~${sugar} গ্রাম)`);
      } else if (nutritionGoal === 'plant_forward') {
        if (!r.isVegetarian) continue;
        score += r.fiberPerServing * 7 + r.proteinPerServing * 1.5;
        reasonPartsEn.push('plant-forward greens/legumes');
        reasonPartsBn.push('সবজি ও ডাল-নির্ভর');
      } else {
        if (r.proteinPerServing >= 12 && r.fiberPerServing >= 2.5) score += 30;
        score += r.proteinPerServing * 1.2 + r.fiberPerServing * 3;
        reasonPartsEn.push(`${r.caloriesPerServing} kcal • ${r.proteinPerServing}g P • ${r.fiberPerServing}g fiber`);
        reasonPartsBn.push(`${r.caloriesPerServing} ক্যালোরি • ${r.proteinPerServing}g প্রোটিন`);
      }

      if (desiredPantryTerms.length > 0) {
        const hits = desiredPantryTerms.filter((t) => fullHay.includes(t));
        if (hits.length > 0) {
          score += hits.length * 35;
          reasonPartsEn.push(`uses your pantry (${hits.slice(0, 2).join(', ')})`);
          reasonPartsBn.push('ঘরের উপাদানের সাথে মিলে যায়');
        }
      }

      scored.push({
        recipe: r,
        score,
        reasonEn: reasonPartsEn.join(' • '),
        reasonBn: reasonPartsBn.join(' • '),
      });
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 6);
  }, [dietPattern, selectedAllergies, selectedCulture, mealFocus, nutritionGoal, selectedPantryIds, customAvailableText]);

  const activeMealIdeas = useMemo(
    () => HEALTHY_MEAL_IDEAS.filter((m) => m.slot === activeMealTab),
    [activeMealTab]
  );

  return (
    <div className="space-y-10 pb-14 animate-fade-in">
      {/* HERO HEADER */}
      <section className="rounded-3xl bg-gradient-to-br from-[#16382C] via-[#1E4A3B] to-[#122E24] text-white p-6 sm:p-8 lg:p-10 border border-emerald-800/40 shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
              <HeartHandshake className="w-4 h-4 text-amber-300" />
              <span>
                {isBn
                  ? 'নিরাপদ ও বাস্তবসম্মত পুষ্টি শিক্ষা কেন্দ্র'
                  : 'Safe, Science-Grounded Food & Nutrition Guide'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              {isBn
                ? 'স্বাস্থ্যকর খাবার ও সুষম পুষ্টি নির্দেশিকা'
                : 'Healthy Food & Balanced Nutrition Guide'}
            </h1>
            <p className="text-sm text-emerald-100/90 leading-relaxed max-w-2xl">
              {isBn
                ? 'বাড়ির পরিচিত দেশীয় ও বৈশ্বিক খাবার দিয়ে সুষম প্লেট সাজান—স্বাস্থ্যকর সকাল, দুপুর ও রাতের খাবারের ধারণা, পুষ্টি উপাদানের ভূমিকা এবং নিজের চাহিদা অনুযায়ী নিরাপদ খাদ্য সুপারিশ দেখুন।'
                : 'Build practical, balanced meals using everyday Bangladeshi and global foods. Explore realistic plate proportions, meal ideas, core nutrient science, and personalized allergen-aware meal matching.'}
            </p>
            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('Healthy Food');
                  setCurrentView('recipes');
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-extrabold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{isBn ? 'স্বাস্থ্যকর রেসিপি খুঁজুন' : 'Search Healthy Recipes'}</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentView('bd-nutrition')}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-emerald-300" />
                <span>{isBn ? 'বাংলাদেশ খাদ্য ডেটাবেজ' : 'Browse BD INFS Food DB'}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-stone-900 aspect-[16/10] shadow-xl">
              <img
                src="/images/balanced-healthy-plate-guide.jpg"
                alt={isBn ? 'সুষম স্বাস্থ্যকর খাবারের থালা' : 'Balanced healthy plate guide'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-3.5 text-white">
                <p className="text-xs font-bold">
                  {isBn
                    ? 'সুষম থালা: ৪০% সবজি ও শাক · ২৫% শস্য · ২৫% প্রোটিন · ১০% ফল/স্বাস্থ্যকর চর্বি'
                    : 'Balanced Plate Model: 40% Vegetables · 25% Grains · 25% Protein · 10% Fruit & Oils'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION A: BALANCED EATING GUIDE */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            {isBn ? 'ক. সুষম খাদ্য থালার গঠন (Balanced Plate)' : 'A. Balanced Eating Guide'}
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            {isBn
              ? 'কঠোরভাবে ক্যালোরি না গুনে প্রতি বেলার থালা সহজ ৪টি অংশে ভাগ করলে শরীরের প্রয়োজনীয় শক্তি, আঁশ ও মাইক্রোনিউট্রিয়েন্ট নিশ্চিত হয়।'
              : 'Structuring each daily plate around food-group proportions covers fiber, steady carbohydrates, amino acids, and essential micronutrients naturally.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BALANCED_PLATE_PROPORTIONS.map((grp) => (
            <div
              key={grp.id}
              className="bg-white rounded-2xl p-5 border border-stone-200 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-extrabold font-mono-num border ${grp.accentBg} ${grp.accentText} ${grp.accentBorder}`}
                  >
                    {grp.sharePercent}% {isBn ? 'থালা' : 'of Plate'}
                  </span>
                </div>
                <h3 className="font-extrabold text-stone-900 text-sm">
                  {isBn ? grp.titleBn : grp.titleEn}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {isBn ? grp.roleBn : grp.roleEn}
                </p>
              </div>
              <div className="pt-3 border-t border-stone-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                  {isBn ? 'পরিচিত উদাহরণ:' : 'Everyday Examples:'}
                </span>
                <p className="text-xs font-medium text-stone-800 leading-relaxed">
                  {isBn ? grp.examplesBn : grp.examplesEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTIONS B, C, D, E: HEALTHY BREAKFAST, LUNCH, DINNER & SNACK IDEAS */}
      <section className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              {isBn ? 'খ–ঙ. প্রতিদিনের স্বাস্থ্যকর খাবারের ধারণা' : 'B–E. Practical Healthy Meal & Snack Ideas'}
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              {isBn
                ? 'ঘরে তৈরি সহজ দেশীয় ও আন্তর্জাতিক পুষ্টিকর পদ—রেসিপি দেখতে যেকোনো কার্ডে ক্লিক করুন।'
                : 'Quick, realistic home-cooked local & global meals you can open directly with full ingredients and bilingual steps.'}
            </p>
          </div>

          <div className="inline-flex flex-wrap gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200">
            {[
              { id: 'breakfast' as const, en: 'B. Breakfast', bn: 'সকালের নাস্তা', icon: Sun },
              { id: 'lunch' as const, en: 'C. Lunch', bn: 'দুপুরের খাবার', icon: Utensils },
              { id: 'dinner' as const, en: 'D. Dinner', bn: 'রাতের খাবার', icon: Moon },
              { id: 'snack' as const, en: 'E. Snacks', bn: 'পুষ্টিকর স্ন্যাকস', icon: Coffee },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeMealTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveMealTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    active ? 'bg-[#16382C] text-white' : 'text-stone-700 hover:bg-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{isBn ? tab.bn : tab.en}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {activeMealIdeas.map((idea) => {
            const linkedRecipe = idea.linkedRecipeId ? recipeById.get(idea.linkedRecipeId) : undefined;
            const cardImage = linkedRecipe ? resolveRecipeImage(linkedRecipe) : '/images/balanced-healthy-plate-guide.jpg';
            return (
              <div
                key={idea.id}
                className="rounded-2xl border border-stone-200 overflow-hidden bg-stone-50/50 hover:border-emerald-500/60 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div
                    onClick={() => openLinkedRecipe(idea.linkedRecipeId, idea.searchKeyword)}
                    className="relative h-40 w-full overflow-hidden bg-stone-200 cursor-pointer"
                  >
                    <img
                      src={cardImage}
                      alt={isBn ? idea.titleBn : idea.titleEn}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] font-bold font-mono-num">
                      <span>~{idea.kcalApprox} kcal</span>
                      <span>
                        {idea.proteinApprox}g P • {idea.fiberApprox}g Fiber
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-extrabold text-stone-900 text-sm leading-snug">
                      {isBn ? idea.titleBn : idea.titleEn}
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {isBn ? idea.subtitleBn : idea.subtitleEn}
                    </p>
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/70 text-[11px] text-emerald-950 leading-relaxed">
                      <span className="font-bold block text-emerald-800 mb-0.5">
                        {isBn ? 'কেন স্বাস্থ্যকর:' : 'Why it helps:'}
                      </span>
                      {isBn ? idea.whyHealthyBn : idea.whyHealthyEn}
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4">
                  <button
                    type="button"
                    onClick={() => openLinkedRecipe(idea.linkedRecipeId, idea.searchKeyword)}
                    className="w-full py-2 px-3 rounded-xl bg-[#16382C] hover:bg-[#225241] text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <span>
                      {linkedRecipe
                        ? isBn
                          ? 'পূর্ণাঙ্গ রেসিপি দেখুন'
                          : 'Open Full Recipe'
                        : isBn
                        ? 'অনুরূপ রেসিপি খুঁজুন'
                        : 'Explore Matching Recipes'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* PERSONALIZED FOOD GUIDANCE PANEL */}
      <section className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-stone-900">
                {isBn ? 'ব্যক্তিগতকৃত খাদ্য সুপারিশ (Personalized Food Guidance)' : 'Personalized Practical Food Guidance'}
              </h2>
              <p className="text-xs text-stone-600 mt-0.5">
                {isBn
                  ? 'আপনার খাদ্যাভ্যাস, অ্যালার্জি, পছন্দের রন্ধনশৈলী ও হাতের কাছের উপাদান নির্বাচন করে বাস্তবসম্মত খাবারের তালিকা পান।'
                  : 'Tailor practical meal suggestions by dietary pattern, food allergies, cultural preference, meal slot, and available ingredients.'}
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-bold text-stone-700 mb-1.5">
              {isBn ? 'খাদ্যাভ্যাস (Diet Pattern)' : 'Dietary Pattern'}
            </label>
            <select
              value={dietPattern}
              onChange={(e) => setDietPattern(e.target.value as DietPattern)}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-800"
            >
              <option value="all">{isBn ? 'সব ধরনের খাবার' : 'All Wholesome Foods'}</option>
              <option value="halal">{isBn ? 'হালাল' : 'Halal'}</option>
              <option value="vegetarian">{isBn ? 'নিরামিষ (Vegetarian)' : 'Vegetarian'}</option>
              <option value="vegan">{isBn ? 'সম্পূর্ণ উদ্ভিজ্জ (Vegan)' : 'Vegan'}</option>
              <option value="pescatarian">{isBn ? 'মাছ-শাকসবজি (Pescatarian)' : 'Pescatarian (Fish & Plants)'}</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1.5">
              {isBn ? 'সাংস্কৃতিক রন্ধনশৈলী' : 'Cultural Preference'}
            </label>
            <select
              value={selectedCulture}
              onChange={(e) => setSelectedCulture(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-800"
            >
              <option value="all">{isBn ? 'দেশীয় ও বৈশ্বিক সব' : 'All Cultures (Bangladeshi & Global)'}</option>
              <option value="bangladeshi">{isBn ? 'বাংলাদেশি ঘরোয়া' : 'Bangladeshi Homestyle'}</option>
              <option value="south_asian">{isBn ? 'দক্ষিণ এশীয় (বাংলাদেশ, নেপাল, ভারত)' : 'South Asian (BD, Nepal, India)'}</option>
              <option value="east_asian">{isBn ? 'পূর্ব/দক্ষিণ-পূর্ব এশীয় (জাপান, কোরিয়া, থাই)' : 'East & SE Asian (Japan, Korea, Thai)'}</option>
              <option value="mediterranean">{isBn ? 'ভূমধ্যসাগরীয় ও ইতালীয়' : 'Mediterranean & Italian'}</option>
              <option value="mexican_global">{isBn ? 'মেক্সিকান ও গ্লোবাল' : 'Mexican & Global'}</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1.5">
              {isBn ? 'কোন বেলার খাবার?' : 'Meal Focus'}
            </label>
            <select
              value={mealFocus}
              onChange={(e) => setMealFocus(e.target.value as any)}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-800"
            >
              <option value="all">{isBn ? 'সকাল, দুপুর, রাত বা স্ন্যাকস' : 'Any Meal of the Day'}</option>
              <option value="breakfast">{isBn ? 'সকালের নাস্তা' : 'Breakfast'}</option>
              <option value="lunch">{isBn ? 'দুপুরের খাবার' : 'Lunch'}</option>
              <option value="dinner">{isBn ? 'রাতের খাবার' : 'Dinner'}</option>
              <option value="snack">{isBn ? 'হালকা নাস্তা' : 'Snack'}</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1.5">
              {isBn ? 'পুষ্টি লক্ষ্য' : 'Practical Nutrition Focus'}
            </label>
            <select
              value={nutritionGoal}
              onChange={(e) => setNutritionGoal(e.target.value as DietaryGoal)}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-800"
            >
              <option value="balanced">{isBn ? 'দৈনিক সুষম পুষ্টি' : 'Balanced Everyday Eating'}</option>
              <option value="high_protein">{isBn ? 'বেশি প্রোটিনযুক্ত পদ' : 'Higher Protein Foods'}</option>
              <option value="high_fiber">{isBn ? 'উচ্চ ফাইবার (আঁশ)' : 'High Dietary Fiber'}</option>
              <option value="low_sugar">{isBn ? 'কম চিনিযুক্ত পদ' : 'Low Added Sugar'}</option>
              <option value="plant_forward">{isBn ? 'সবজি ও ডাল-নির্ভর' : 'Plant-Forward & Greens'}</option>
            </select>
          </div>
        </div>

        {/* Allergies & Intolerances Exclusion Checkboxes */}
        <div className="space-y-2 text-xs">
          <span className="font-bold text-stone-700 block">
            {isBn ? 'খাদ্য অ্যালার্জি বা পরিহারযোগ্য উপাদান (বাদ দিন):' : 'Exclude Allergens or Intolerances:'}
          </span>
          <div className="flex flex-wrap gap-2">
            {COMMON_ALLERGENS.map((alg) => {
              const active = selectedAllergies.includes(alg.id);
              return (
                <button
                  key={alg.id}
                  type="button"
                  onClick={() => toggleAllergy(alg.id)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                    active
                      ? 'bg-rose-50 border-rose-300 text-rose-800'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {active ? '✕ ' : '+ '}
                  {isBn ? alg.labelBn : alg.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        {/* Available Ingredients Matching */}
        <div className="space-y-2 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="font-bold text-stone-700">
              {isBn ? 'ঘরে থাকা উপাদান অনুযায়ী অগ্রাধিকার দিন:' : 'Prioritize Available Ingredients in Your Kitchen:'}
            </span>
            <input
              type="text"
              value={customAvailableText}
              onChange={(e) => setCustomAvailableText(e.target.value)}
              placeholder={isBn ? 'যেমন: paneer, oats, cabbage...' : 'Optional custom ingredients (comma separated)...'}
              className="sm:w-72 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PANTRY_INGREDIENTS.map((item) => {
              const active = selectedPantryIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => togglePantry(item.id)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                    active
                      ? 'bg-emerald-600 border-emerald-700 text-white'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-emerald-50'
                  }`}
                >
                  {isBn ? item.labelBn : item.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        {/* Personalized Meal Results */}
        {personalizedMatches.length === 0 ? (
          <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-2">
            <p className="text-sm font-bold text-stone-800">
              {isBn
                ? 'এই সব কঠোর ফিল্টারের সাথে মিলছে এমন পদ পাওয়া যায়নি।'
                : 'No single dish matched every selected constraint simultaneously.'}
            </p>
            <p className="text-xs text-stone-600">
              {isBn
                ? 'সাংস্কৃতিক রন্ধনশৈলী "সব" করে দেখুন বা অ্যালার্জি/উপাদানের শর্ত শিথিল করুন।'
                : 'Try broadening the cultural cuisine filter or meal slot to discover safe matching foods.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {personalizedMatches.map(({ recipe, reasonEn, reasonBn }) => (
              <div
                key={recipe.id}
                onClick={() => setSelectedRecipe(recipe)}
                className="p-4 rounded-2xl border border-stone-200 hover:border-emerald-500/60 bg-stone-50/40 cursor-pointer transition-colors flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start space-x-3">
                  <img
                    src={resolveRecipeImage(recipe)}
                    alt={isBn ? recipe.nameBn : recipe.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 bg-stone-200"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-800">
                      {formatCountryLabel(recipe.country || recipe.cuisine, language)}
                    </span>
                    <h4 className="font-extrabold text-stone-900 text-xs sm:text-sm line-clamp-1">
                      {isBn ? recipe.nameBn : recipe.name}
                    </h4>
                    <p className="text-[11px] font-medium text-emerald-700 leading-snug">
                      {isBn ? reasonBn : reasonEn}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-stone-200/70 text-[11px] font-bold text-[#16382C]">
                  <span className="font-mono-num">
                    {recipe.prepTime + recipe.cookTime} {isBn ? 'মিনিট' : 'mins'}
                  </span>
                  <span className="flex items-center space-x-1">
                    <span>{isBn ? 'বিস্তারিত দেখুন' : 'Open Recipe'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mandatory Safe Nutrition, Weight & Medical Guardrail Notice */}
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 sm:p-5 space-y-3">
          <div className="flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <h3 className="text-xs sm:text-sm font-extrabold text-amber-950">
                {isBn
                  ? 'স্বাস্থ্যকর অভ্যাস, বয়ঃসন্ধিকালের বৃদ্ধি ও চিকিৎসা নিরাপত্তা নির্দেশিকা'
                  : 'Healthy Habits, Growth & Medical Nutrition Safety Notice'}
              </h3>
              <ul className="text-xs text-stone-700 space-y-1.5 leading-relaxed">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <span>
                    {isBn
                      ? 'প্রতিদিন সময়মতো পরিমিত ও সুষম খাবার খান। কখনোই উপোস থাকা, বেলা বাদ দেওয়া বা চরম ক্যালোরি কমানো উচিত নয়।'
                      : 'Focus on regular, nourishing meals every day—AaharIQ never recommends fasting/starvation, skipping meals, extreme calorie restriction, or rapid weight loss.'}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <span>
                    {isBn
                      ? 'কিশোর-কিশোরীদের (Teens) শারীরিক ও মানসিক বৃদ্ধির জন্য পর্যাপ্ত শক্তি, প্রোটিন, ক্যালসিয়াম ও আয়রন প্রয়োজন; ব্যক্তিগত খাদ্য পরিকল্পনার আগে অভিভাবক ও চিকিৎসকের পরামর্শ নিন।'
                      : 'Growing teens need full nutrition (energy, protein, calcium, iron) for healthy development. Consult parents, caregivers, or a qualified clinician rather than restricting calories.'}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <span>
                    {isBn
                      ? 'ডায়াবেটিস, উচ্চ রক্তচাপ, কিডনি রোগ, গর্ভাবস্থা বা মারাত্মক অ্যালার্জির ক্ষেত্রে এই তথ্য কেবল শিক্ষামূলক—সর্বদা নিবন্ধিত চিকিৎসক বা ডায়েটিশিয়ানের পরামর্শ অনুসরণ করুন।'
                      : 'Educational guidance only—not medical diagnosis. Always consult a licensed physician or registered dietitian for therapeutic diets, allergies, pregnancy, or medical conditions.'}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION F: FOOD & NUTRIENT EDUCATION */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2.5">
          <BookOpen className="w-5 h-5 text-emerald-700" />
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              {isBn ? 'চ. খাদ্য ও পুষ্টি উপাদান পরিচিতি (Food & Nutrient Education)' : 'F. Food & Nutrient Education'}
            </h2>
            <p className="text-xs text-stone-600">
              {isBn
                ? 'কোন পুষ্টি উপাদান শরীরে কী কাজ করে এবং বাংলাদেশি ও আন্তর্জাতিক কোন খাবারে তা পাওয়া যায়।'
                : 'Understand what each essential nutrient does and where to find it across Bangladeshi and global foods.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {NUTRIENT_EDUCATION_CARDS.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                  <h3 className="font-extrabold text-stone-900 text-sm">
                    {isBn ? card.nutrientBn : card.nutrientEn}
                  </h3>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {isBn ? card.roleBn : card.roleEn}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-stone-100 text-[11px]">
                <div>
                  <span className="font-bold text-emerald-800 block">
                    {isBn ? 'দেশীয় উৎস:' : 'Bangladesh Foods:'}
                  </span>
                  <span className="text-stone-700">
                    {isBn ? card.bangladeshiSourcesBn : card.bangladeshiSourcesEn}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-stone-600 block">
                    {isBn ? 'বৈশ্বিক উৎস:' : 'Global Foods:'}
                  </span>
                  <span className="text-stone-600">
                    {isBn ? card.globalSourcesBn : card.globalSourcesEn}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-950 font-medium leading-snug">
                  <span className="font-bold">{isBn ? 'টিপস: ' : 'Tip: '}</span>
                  {isBn ? card.pairingTipBn : card.pairingTipEn}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
