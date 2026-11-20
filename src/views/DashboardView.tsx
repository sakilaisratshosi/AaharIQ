import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { RECIPES_DATABASE } from '../data/recipesData';
import { CUISINES_DATA } from '../data/cuisinesData';
import { resolveRecipeImage } from '../utils/recipeImageResolver';
import { AppView } from '../types';
import {
  Search,
  Calculator,
  CalendarDays,
  ArrowRight,
  Flame,
  Clock,
  Heart,
  ShieldCheck,
  Leaf,
  ChevronRight,
  Fish,
  Utensils,
  Award,
  ScanLine,
  Database,
  Scale,
  Recycle,
  BookOpenCheck,
  MessageSquare,
  Compass,
  BookOpen,
  HeartHandshake,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    language,
    t,
    setCurrentView,
    setSelectedCuisineFilter,
    setSelectedRecipe,
    toggleFavorite,
    isFavorite,
    setSearchQuery,
    addSearchHistory,
    onboardingCompleted,
    journalEntries,
    userProfile,
  } = useApp();

  const [heroSearchInput, setHeroSearchInput] = useState('');

  const featuredRecipes = RECIPES_DATABASE.slice(0, 4);
  const todayIso = new Date().toISOString().slice(0, 10);
  const calorieGoal = userProfile?.dailyCalorieGoal || 2000;

  const todayJournalSummary = useMemo(() => {
    const todayItems = journalEntries.filter((e) => e.date === todayIso);
    return {
      count: todayItems.length,
      calories: todayItems.reduce((sum, e) => sum + (Number(e.calories) || 0), 0),
      proteinG: Number(todayItems.reduce((sum, e) => sum + (Number(e.proteinG) || 0), 0).toFixed(1)),
    };
  }, [journalEntries, todayIso]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearchInput.trim()) {
      setSearchQuery(heroSearchInput.trim());
      addSearchHistory(heroSearchInput.trim());
      setCurrentView('recipes');
    }
  };

  const handleCuisineClick = (cuisineName: string) => {
    setSelectedCuisineFilter(cuisineName);
    setCurrentView('recipes');
  };

  const coreModules: Array<{
    id: AppView;
    title: string;
    desc: string;
    cta: string;
    icon: any;
    iconBg: string;
  }> = [
    {
      id: 'recipes',
      title: t.globalRecipeFinder,
      desc:
        language === 'bn'
          ? 'বাংলাদেশ, নেপাল, ভারত, ইতালি, জাপান, কোরিয়া, থাইল্যান্ড ও মেক্সিকোসহ বিশ্বজুড়ে যেকোনো রেসিপি খুঁজুন।'
          : 'Search dishes globally (Khichuri, Momo, Dosa, Risotto, Sushi, Bibimbap, Pad Thai, Tacos) & smart diet filters.',
      cta: language === 'bn' ? 'রেসিপি খুঁজুন' : 'Search Recipes',
      icon: BookOpen,
      iconBg: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'healthy-guide',
      title: t.healthyGuide,
      desc:
        language === 'bn'
          ? 'সুষম প্লেট, সকাল-দুপুর-রাতের পুষ্টিকর খাবার, পুষ্টি শিক্ষা এবং অ্যালার্জি-সচেতন খাদ্য নির্দেশিকা।'
          : 'Balanced plate proportions, meal & snack ideas, nutrient education, and personalized safe food guidance.',
      cta: language === 'bn' ? 'গাইড দেখুন' : 'Open Guide',
      icon: HeartHandshake,
      iconBg: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'food-scanner',
      title: t.foodScanner,
      desc:
        language === 'bn'
          ? 'খাবারের ছবি বা প্যাকেটের বারকোড স্ক্যান করে আনুমানিক ক্যালোরি, পোরশন এডিট ও পুষ্টিগুণ দেখুন।'
          : 'Analyze meals, produce, or packaged barcodes with editable portions and transparent confidence bands.',
      cta: language === 'bn' ? 'স্ক্যানার খুলুন' : 'Scan Food',
      icon: ScanLine,
      iconBg: 'bg-teal-100 text-teal-800',
    },
    {
      id: 'nutrition',
      title: t.analyzeNutrition,
      desc:
        language === 'bn'
          ? 'INFS বাংলাদেশ এবং USDA তথ্যসূত্র অনুযায়ী খাদ্যের ক্যালোরি, ম্যাক্রো এবং ভিটামিন-খনিজ মাপুন।'
          : 'Measure calories, macronutrients, and micronutrients grounded in INFS Bangladesh and USDA data.',
      cta: language === 'bn' ? 'পুষ্টি মাপুন' : 'Analyze Food',
      icon: Calculator,
      iconBg: 'bg-emerald-100 text-emerald-900',
    },
    {
      id: 'safety-center',
      title: t.safetyCenter,
      desc:
        language === 'bn'
          ? 'দৃশ্যমান পচন পরীক্ষা, OCR লেবেল ও মেয়াদ যাচাই এবং BFSA অনুমোদিত খাদ্য পরীক্ষাগার খুঁজুন।'
          : 'Check visual spoilage cues, expiry labels via OCR, and browse official BFSA laboratory directories & alerts.',
      cta: language === 'bn' ? 'নিরাপত্তা কেন্দ্র' : 'Check Safety',
      icon: ShieldCheck,
      iconBg: 'bg-amber-100 text-amber-900',
    },
    {
      id: 'bd-nutrition',
      title: t.bdNutritionExplorer,
      desc:
        language === 'bn'
          ? 'ঢাকা বিশ্ববিদ্যালয়ের INFS ও ২০২৫ জাতীয় নির্দেশিকা অনুযায়ী ৩৮৯টি কাঁচা ও রান্না খাদ্যের তথ্য।'
          : 'Search 389 raw & cooked Bangladeshi foods from DU INFS FCTB, FAO INFOODS, and 2025 Guidelines.',
      cta: language === 'bn' ? 'ডেটাবেজ দেখুন' : 'Explore DB',
      icon: Database,
      iconBg: 'bg-teal-100 text-teal-900',
    },
    {
      id: 'food-journal',
      title: t.foodJournal,
      desc:
        language === 'bn'
          ? 'প্রতিদিনের খাবার নথিভুক্ত করুন, দৈনিক লক্ষ্যমাত্রার সাথে তুলনা করুন এবং ৭ দিনের চার্ট দেখুন।'
          : 'Log meals by date and meal slot, monitor daily macro totals, and export your 7-day nutrition history.',
      cta: language === 'bn' ? 'জার্নাল দেখুন' : 'Open Journal',
      icon: BookOpenCheck,
      iconBg: 'bg-orange-100 text-[#E76F51]',
    },
    {
      id: 'food-comparison',
      title: t.foodComparison,
      desc:
        language === 'bn'
          ? 'সমপরিমাণ গ্রামে ভাত বনাম রুটি, মাছ বনাম ডিম বা ২-৩টি দেশীয় খাদ্যের পুষ্টি তুলনা করুন।'
          : 'Compare 2–3 foods side-by-side at equal gram servings (Rice vs Roti, Fish vs Egg, Lentils vs Chickpeas).',
      cta: language === 'bn' ? 'তুলনা করুন' : 'Compare Foods',
      icon: Scale,
      iconBg: 'bg-stone-100 text-stone-800',
    },
    {
      id: 'food-waste',
      title: t.foodWaste,
      desc:
        language === 'bn'
          ? 'মেয়াদ-নিকটবর্তী ও বেঁচে যাওয়া খাবার দিয়ে নিরাপদ রেসিপি ও সংরক্ষণ গাইড পান (Use-By সতর্কতাসহ)।'
          : 'Turn near-expiry foods and safe leftovers into meals with storage shelf-life & spoilage safety rules.',
      cta: language === 'bn' ? 'অপচয় কমান' : 'Plan Rescue',
      icon: Recycle,
      iconBg: 'bg-lime-100 text-lime-800',
    },
    {
      id: 'assistant',
      title: t.aiAssistant,
      desc:
        language === 'bn'
          ? 'দেশীয় খাদ্যের পুষ্টি, খাদ্য নিরাপত্তা ও সংরক্ষণ বিষয়ে তথ্য-ভিত্তিক বাংলা/ইংরেজি প্রশ্নোত্তর।'
          : 'Ask grounded questions on Bangladesh foods, BFSA safety references, storage, and meal adaptations.',
      cta: language === 'bn' ? 'প্রশ্ন করুন' : 'Ask Assistant',
      icon: MessageSquare,
      iconBg: 'bg-rose-100 text-[#E76F51]',
    },
  ];

  return (
    <div className="space-y-10 pb-12 animate-fade-in">
      {/* Quick Onboarding Callout (if not yet completed) */}
      {!onboardingCompleted && (
        <section className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#16382C] text-emerald-300 flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-stone-900">
                {language === 'bn' ? 'আপনার AaharIQ ওয়ার্কস্পেস সাজিয়ে নিন' : 'Personalize Your AaharIQ Workspace'}
              </h2>
              <p className="text-xs text-stone-600 mt-0.5">
                {language === 'bn'
                  ? 'ভাষা, দৈনিক ক্যালোরি লক্ষ্য ও অ্যালার্জি তথ্য ২ মিনিটে সেট করে নিতে দ্রুত সেটআপ চালু করুন।'
                  : 'Set your preferred language, daily calorie target, and food allergen notes in a quick 3-step setup.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCurrentView('onboarding')}
            className="self-start sm:self-center px-4 py-2 rounded-xl bg-[#16382C] hover:bg-[#1E4A3B] text-white text-xs font-bold shrink-0 flex items-center space-x-1.5 transition-colors"
          >
            <span>{t.onboarding}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </section>
      )}

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#16382C] via-[#1E4A3B] to-[#122E24] text-white p-5 sm:p-10 lg:p-12 shadow-xl border border-emerald-800/40">
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="text-xs font-bold uppercase tracking-widest text-emerald-300">
            AaharIQ · {language === 'bn' ? 'খাদ্য বুদ্ধিমত্তা প্ল্যাটফর্ম' : 'Food Intelligence Platform'}
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] break-words">
            {t.eatSmartLiveBetter}
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 max-w-2xl leading-relaxed font-normal">
            {language === 'bn'
              ? 'উপাদানভিত্তিক রেসিপি, এআই ফুড স্ক্যানার, ঢাকা বিশ্ববিদ্যালয়ের INFS ৩৮৯টি দেশীয় খাদ্য ডেটাবেজ, BFSA খাদ্য নিরাপত্তা তথ্য এবং অপচয় রোধ—সব এক প্ল্যাটফর্মে।'
              : 'Discover ingredient-matched recipes, scan meals, compare 389 INFS Bangladesh foods, inspect BFSA laboratory testing resources, track daily intake, and cut kitchen food waste.'}
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="pt-1">
            <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-2xl p-1.5 shadow-xl border border-emerald-100/80">
              <div className="flex items-center flex-1 px-2.5 sm:px-3 py-1.5 sm:py-2 min-w-0">
                <Search className="w-5 h-5 text-emerald-700 shrink-0 mr-2" />
                <input
                  type="text"
                  value={heroSearchInput}
                  onChange={(e) => setHeroSearchInput(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full text-stone-900 placeholder:text-stone-400 text-xs sm:text-sm focus:outline-none bg-transparent min-w-0"
                />
              </div>
              <button
                type="submit"
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#E76F51] hover:bg-[#d85c3f] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-colors flex items-center justify-center space-x-2 mt-1 sm:mt-0 shrink-0"
              >
                <span>{t.searchButton}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mt-3 text-xs">
              <span className="text-emerald-300/80 text-[11px] font-semibold">
                {language === 'bn' ? 'জনপ্রিয় অনুসন্ধান:' : 'Quick Search:'}
              </span>
              {[
                { en: 'Spinach', bn: 'শাক' },
                { en: 'Cabbage', bn: 'বাঁধাকপি' },
                { en: 'Shorshe Ilish', bn: 'সর্ষে ইলিশ' },
                { en: 'Egg Curry', bn: 'ডিম কারি' },
                { en: 'Bhuna Khichuri', bn: 'ভুনা খিচুড়ি' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const q = language === 'bn' ? item.bn : item.en;
                    setHeroSearchInput(q);
                    setSearchQuery(q);
                    addSearchHistory(q);
                    setCurrentView('recipes');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-200 border border-emerald-700/50 text-[11px] font-medium transition-colors"
                >
                  {language === 'bn' ? item.bn : item.en}
                </button>
              ))}
            </div>
          </form>

          {/* Grounded Platform Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-4 border-t border-emerald-800/60 text-xs">
            <div className="bg-emerald-950/40 p-2.5 sm:p-3 rounded-xl border border-emerald-800/30">
              <span className="text-lg sm:text-2xl font-black text-emerald-300 block font-mono-num">389</span>
              <span className="text-emerald-200/80 text-[10px] sm:text-[11px] leading-tight block">
                {language === 'bn' ? 'INFS দেশীয় খাদ্য রেকর্ড' : 'BD FCTB Food Records'}
              </span>
            </div>
            <div className="bg-emerald-950/40 p-2.5 sm:p-3 rounded-xl border border-emerald-800/30">
              <span className="text-lg sm:text-2xl font-black text-amber-300 block font-mono-num">9 Labs</span>
              <span className="text-emerald-200/80 text-[10px] sm:text-[11px] leading-tight block">
                {language === 'bn' ? 'BFSA তথ্যসূত্র ল্যাব' : 'BFSA Reference Labs'}
              </span>
            </div>
            <div className="bg-emerald-950/40 p-2.5 sm:p-3 rounded-xl border border-emerald-800/30">
              <span className="text-lg sm:text-2xl font-black text-[#E76F51] block font-mono-num">10</span>
              <span className="text-emerald-200/80 text-[10px] sm:text-[11px] leading-tight block">
                {language === 'bn' ? 'সমন্বিত খাদ্য মডিউল' : 'Integrated Modules'}
              </span>
            </div>
            <div className="bg-emerald-950/40 p-2.5 sm:p-3 rounded-xl border border-emerald-800/30">
              <span className="text-lg sm:text-2xl font-black text-teal-300 block font-mono-num">EN · বাং</span>
              <span className="text-emerald-200/80 text-[10px] sm:text-[11px] leading-tight block">
                {language === 'bn' ? 'পূর্ণ দ্বিভাষিক সহায়তা' : 'Full Bilingual Platform'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TODAY'S PERSONAL FOOD JOURNAL SNAPSHOT */}
      <section className="bg-white rounded-2xl p-5 border border-emerald-950/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#E76F51] flex items-center justify-center shrink-0">
            <BookOpenCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-stone-900">
              {language === 'bn' ? 'আজকের খাদ্য জার্নাল সারসংক্ষেপ' : "Today's Food Journal"} ·{' '}
              <span className="font-mono-num text-stone-500 font-semibold">{todayIso}</span>
            </div>
            <p className="text-xs text-stone-600 mt-1 font-mono-num">
              {todayJournalSummary.calories} / {calorieGoal} kcal · {todayJournalSummary.proteinG}g{' '}
              {language === 'bn' ? 'প্রোটিন' : 'Protein'} · {todayJournalSummary.count}{' '}
              {language === 'bn' ? 'টি খাবার যুক্ত' : 'meals logged'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentView('food-journal')}
            className="px-4 py-2 bg-[#16382C] hover:bg-[#225241] text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5"
          >
            <span>{language === 'bn' ? 'খাবার যুক্ত করুন' : 'Log Today’s Meal'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentView('meal-planner')}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5"
          >
            <CalendarDays className="w-3.5 h-3.5 text-emerald-700" />
            <span>{t.mealPlanner}</span>
          </button>
        </div>
      </section>

      {/* 3. ALL 10 CORE PLATFORM MODULES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              {language === 'bn' ? 'AaharIQ-এর ১০টি মূল মডিউল' : '10 Integrated Food Intelligence Modules'}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {language === 'bn'
                ? 'রান্না থেকে শুরু করে খাদ্য নিরাপত্তা, তুলনা, অপচয় রোধ ও দৈনিক পুষ্টি পর্যবেক্ষণ'
                : 'Complete tools from smart cooking and scanning to BFSA safety, food comparison, and waste prevention'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {coreModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                onClick={() => setCurrentView(mod.id)}
                className="group p-5 bg-white rounded-2xl border border-emerald-900/10 hover:border-emerald-500/50 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mod.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-stone-900 text-sm group-hover:text-emerald-700 transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed line-clamp-3">{mod.desc}</p>
                </div>
                <div className="pt-4 flex items-center text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">
                  <span>{mod.cta}</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. FEATURED RECIPES */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              {t.featuredRecipes}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {language === 'bn'
                ? 'পুষ্টিবিজ্ঞানসম্মত দেশীয় ও বৈশ্বিক রেসিপি সংগ্রহ'
                : 'Balanced culinary selections with transparent macronutrient metrics'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCurrentView('recipes')}
            className="flex items-center space-x-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <span>{t.viewAll}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredRecipes.map((recipe) => {
            const favorited = isFavorite(recipe.id);
            return (
              <div
                key={recipe.id}
                className="group bg-white rounded-2xl overflow-hidden border border-emerald-950/10 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div
                  className="relative h-44 w-full overflow-hidden cursor-pointer"
                  onClick={() => setSelectedRecipe(recipe)}
                >
                  <img
                    key={`${recipe.id}-${recipe.image}`}
                    src={resolveRecipeImage(recipe)}
                    alt={language === 'bn' ? recipe.name_bn || recipe.nameBn : recipe.name_en || recipe.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (!img.dataset.fallbackApplied) {
                        img.dataset.fallbackApplied = '1';
                        img.src = '/images/food-placeholder.jpg';
                      }
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1B4332]/90 text-white">
                    {recipe.cuisine}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(recipe.id);
                    }}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/80 hover:bg-white text-stone-800 transition-colors"
                  >
                    <Heart className={`w-3.5 h-3.5 ${favorited ? 'text-rose-500 fill-rose-500' : ''}`} />
                  </button>
                  <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-[11px] font-medium font-mono-num">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-emerald-300" />
                      <span>
                        {recipe.prepTime + recipe.cookTime} {language === 'bn' ? 'মি' : 'm'}
                      </span>
                    </span>
                    <span className="flex items-center space-x-1 font-bold text-amber-300">
                      <Flame className="w-3 h-3" />
                      <span>{recipe.caloriesPerServing} kcal</span>
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      onClick={() => setSelectedRecipe(recipe)}
                      className="font-bold text-stone-900 text-sm group-hover:text-emerald-700 transition-colors cursor-pointer line-clamp-1"
                    >
                      {language === 'bn' ? recipe.name_bn || recipe.nameBn : recipe.name_en || recipe.name}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2 mt-1">
                      {language === 'bn' ? recipe.description_bn || recipe.descriptionBn : recipe.description_en || recipe.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-700 font-semibold font-mono-num">
                      {recipe.proteinPerServing}g {t.protein}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedRecipe(recipe)}
                      className="px-2.5 py-1 bg-stone-100 group-hover:bg-[#1B4332] group-hover:text-white rounded-lg text-stone-700 font-bold transition-colors"
                    >
                      {language === 'bn' ? 'বিস্তারিত' : 'View'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. GLOBAL CUISINES */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              {t.popularCuisines}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {language === 'bn'
                ? '৯টি বৈশ্বিক রন্ধনশৈলীর সাংস্কৃতিক পুষ্টিবৈচিত্র্য'
                : 'Explore traditional nutrition principles from 9 world cultures'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCurrentView('cuisines')}
            className="flex items-center space-x-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <span>{t.viewAll}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {CUISINES_DATA.slice(0, 5).map((cuisine) => (
            <div
              key={cuisine.id}
              onClick={() => handleCuisineClick(cuisine.id)}
              className="group relative h-40 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all border border-emerald-950/10"
            >
              <img
                src={cuisine.image}
                alt={cuisine.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="font-extrabold text-sm block group-hover:text-emerald-300 transition-colors">
                  {language === 'bn' ? cuisine.nameBn : cuisine.name}
                </span>
                <span className="text-[10px] text-emerald-200/90 line-clamp-1 mt-0.5">
                  {language === 'bn' ? cuisine.taglineBn : cuisine.tagline}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. EDUCATIONAL BANGLADESH NUTRITION SPOTLIGHT */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-950/10 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Award className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 text-lg">{t.bangladeshiHeritage}</h3>
              <p className="text-xs text-stone-500">
                {language === 'bn'
                  ? 'ঢাকা বিশ্ববিদ্যালয়ের আইএনএফএস ও ২০২৫ জাতীয় খাদ্য নির্দেশিকার আলোকে'
                  : 'Grounded in INFS Dhaka University FCTB & 2025 Bangladesh Dietary Guidelines'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCurrentView('food-comparison')}
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{t.foodComparison}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
              <Fish className="w-4 h-4 text-[#E76F51]" />
              <span>{language === 'bn' ? 'পদ্মার ইলিশ ও হৃদরোগ প্রতিরোধ' : 'Hilsa Fish & Essential Fatty Acids'}</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              {language === 'bn'
                ? 'ইলিশে প্রচুর পরিমাণে ওমেগা-৩ ফ্যাটি এসিড রয়েছে যা হৃদযন্ত্র ও রক্তের লিপিড প্রোফাইল সুস্থ রাখতে সহায়ক।'
                : 'Hilsa provides EPA and DHA Omega-3 fatty acids supporting cardiac lipid balance and brain health.'}
            </p>
            <div className="text-[11px] font-bold text-emerald-700 font-mono-num">
              273 kcal · 21.8g Protein per 100g (INFS)
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
              <Leaf className="w-4 h-4 text-emerald-600" />
              <span>{language === 'bn' ? 'লাল শাক ও ভিটামিন-সি সমন্বয়' : 'Red Amaranth & Vitamin C Pairing'}</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              {language === 'bn'
                ? 'লাল শাকের নন-হিম আয়রন সহজে শোষণের জন্য খাবারের সাথে লেবুর রস বা টমেটো যোগ করুন।'
                : 'Pair Red Amaranth (Lal Shaak) with fresh lemon juice (Vitamin C) to enhance plant non-heme iron uptake.'}
            </p>
            <div className="text-[11px] font-bold text-emerald-700 font-mono-num">
              Rich in Calcium, Iron & Beta-Carotene
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
              <Utensils className="w-4 h-4 text-amber-600" />
              <span>{language === 'bn' ? 'ভাত ও ডালের অ্যামাইনো এসিড সমন্বয়' : 'Rice & Lentil Amino Acid Synergy'}</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              {language === 'bn'
                ? 'চালের ও ডালের সমন্বয়ে পূর্ণাঙ্গ প্রোটিন প্রোফাইল তৈরি হয় এবং গ্লাইসেমিক প্রভাব ভারসাম্যপূর্ণ থাকে।'
                : 'Pairing cereal grains (rice) with legumes (dal) complements limiting amino acids into a complete protein profile.'}
            </p>
            <div className="text-[11px] font-bold text-emerald-700 font-mono-num">
              Balanced Glycemic & Protein Matrix
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
