import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Recipe } from '../data/recipesData';
import {
  X,
  ArrowLeft,
  Home,
  Clock,
  Flame,
  Users,
  CheckCircle2,
  Circle,
  Heart,
  ShoppingCart,
  Sparkles,
  Share2,
  Check,
  Globe,
  Lightbulb,
  Repeat2,
  Gauge,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { resolveRecipeImage } from '../utils/recipeImageResolver';
import { formatCountryLabel } from '../utils/countryNormalizer';
import {
  hasBanglaText,
  toBanglaDigits,
  translateCookingStepToBn,
  translateCuisineToBn,
  translateIngredientToBn,
  translateUnitToBn,
} from '../utils/bilingualRecipeTranslator';

interface RecipeModalProps {
  recipe: Recipe;
  onClose: () => void;
}

export const RecipeModal: React.FC<RecipeModalProps> = ({ recipe, onClose }) => {
  const {
    language,
    setLanguage,
    t,
    goBack,
    goHome,
    toggleFavorite,
    isFavorite,
    addBatchGroceryItems,
    showNotification,
  } = useApp();

  const [activeRecipe, setActiveRecipe] = useState<Recipe>(recipe);
  const [servingMultiplier, setServingMultiplier] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [displayLangMode, setDisplayLangMode] = useState<'both' | 'bn' | 'en'>('both');
  const [isTranslatingBn, setIsTranslatingBn] = useState(false);
  const [kitchenPantryText, setKitchenPantryText] = useState('');

  // Reset modal state and hydrate fluent Bangla steps/ingredients if needed
  useEffect(() => {
    setActiveRecipe(recipe);
    setImageError(false);
    setCompletedSteps([]);
    setCheckedIngredients([]);
    setKitchenPantryText('');

    const needsBnEnrichment =
      recipe.source !== 'aahariq_curated' &&
      (!hasBanglaText(recipe.nameBn) ||
        !(recipe.instructions_bn || recipe.instructionsBn)?.some((s) => hasBanglaText(s)) ||
        recipe.ingredients.some((i) => !hasBanglaText(i.nameBn)));

    if (!needsBnEnrichment) {
      setIsTranslatingBn(false);
      return;
    }

    const controller = new AbortController();
    setIsTranslatingBn(true);

    fetch('/api/recipes/translate-bn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({ recipe }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.recipe && !controller.signal.aborted) {
          setActiveRecipe((prev) => (prev.id === data.recipe.id ? data.recipe : prev));
        }
      })
      .catch(() => {
        // Keep static dictionary translations as clean fallback
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsTranslatingBn(false);
      });

    return () => controller.abort();
  }, [recipe]);

  const favorited = isFavorite(activeRecipe.id);

  // Safe localized text getter that guarantees no blank fields
  const getLocalized = (bnVal: string | undefined, enVal: string | undefined): string => {
    if (language === 'bn') {
      return bnVal && bnVal.trim().length > 0
        ? bnVal
        : enVal || 'তথ্য শীঘ্রই আসছে (Translation coming soon)';
    }
    return enVal && enVal.trim().length > 0
      ? enVal
      : bnVal || 'Information coming soon';
  };

  // Keyboard Escape key support routed through unified Back navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        goBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goBack]);

  const handleBackOrClose = () => {
    goBack();
  };

  const enInstructions = activeRecipe.instructions_en || activeRecipe.instructions || [];
  const bnInstructionsRaw = activeRecipe.instructions_bn || activeRecipe.instructionsBn || [];
  const totalStepCount = Math.max(enInstructions.length, bnInstructionsRaw.length);
  const stepPairs = Array.from({ length: totalStepCount }, (_, idx) => {
    const enText = enInstructions[idx] || bnInstructionsRaw[idx] || '';
    const rawBn = bnInstructionsRaw[idx];
    const bnText =
      rawBn && hasBanglaText(rawBn) ? rawBn : translateCookingStepToBn(enText);
    return { en: enText, bn: bnText };
  });

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) => {
      const next = prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index];
      if (next.length === stepPairs.length && stepPairs.length > 0) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
        showNotification(
          language === 'bn'
            ? 'অভিনন্দন! রান্না সফলভাবে সম্পন্ন হয়েছে 🎉'
            : 'Awesome! Recipe completed 🎉'
        );
      }
      return next;
    });
  };

  const toggleIngredientCheck = (index: number) => {
    setCheckedIngredients((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleAddAllToGrocery = () => {
    const recipeTitle = getLocalized(
      activeRecipe.name_bn || activeRecipe.nameBn,
      activeRecipe.name_en || activeRecipe.name
    );

    const itemsToAdd = activeRecipe.ingredients.map((ing) => ({
      name: ing.name,
      nameBn: hasBanglaText(ing.nameBn) ? ing.nameBn : translateIngredientToBn(ing.name),
      amount: ing.amount * servingMultiplier,
      unit: ing.unit,
      unitBn: hasBanglaText(ing.unitBn) ? ing.unitBn : translateUnitToBn(ing.unit),
      category: ing.category || 'pantry',
      addedFrom: recipeTitle,
    }));
    addBatchGroceryItems(itemsToAdd);
  };

  const handleCopyShare = () => {
    const title = getLocalized(
      activeRecipe.name_bn || activeRecipe.nameBn,
      activeRecipe.name_en || activeRecipe.name
    );
    navigator.clipboard.writeText(
      `${title} - ${activeRecipe.caloriesPerServing} kcal per serving. Discover on AaharIQ!`
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    showNotification(
      language === 'bn' ? 'রেসিপি লিংক কপি করা হয়েছে!' : 'Recipe link copied!'
    );
  };

  const currentServings = activeRecipe.servings * servingMultiplier;
  const currentCalories = Math.round(activeRecipe.caloriesPerServing * servingMultiplier);
  const currentProtein = Math.round(activeRecipe.proteinPerServing * servingMultiplier);
  const currentCarbs = Math.round(activeRecipe.carbsPerServing * servingMultiplier);
  const currentFat = Math.round(activeRecipe.fatPerServing * servingMultiplier);
  const currentFiber = Math.round(activeRecipe.fiberPerServing * servingMultiplier);
  const currentSugar =
    typeof activeRecipe.sugarPerServing === 'number'
      ? Math.round(activeRecipe.sugarPerServing * servingMultiplier * 10) / 10
      : undefined;

  const difficultyLabel =
    language === 'bn'
      ? activeRecipe.difficultyBn ||
        (activeRecipe.difficulty === 'Easy'
          ? 'সহজ'
          : activeRecipe.difficulty === 'Hard'
          ? 'কঠিন'
          : 'মাঝারি')
      : activeRecipe.difficulty || 'Medium';

  const nutritionStatusLabel =
    activeRecipe.nutritionStatus === 'verified'
      ? language === 'bn'
        ? 'যাচাইকৃত পুষ্টি তথ্য'
        : 'Verified Nutrition'
      : activeRecipe.nutritionStatus === 'calculated'
      ? language === 'bn'
        ? 'রেসিপি অনুযায়ী গণনাকৃত'
        : 'Calculated Recipe Nutrition'
      : activeRecipe.nutritionStatus === 'missing'
      ? language === 'bn'
        ? 'তথ্য অসম্পূর্ণ'
        : 'Nutrition Pending'
      : language === 'bn'
      ? 'আনুমানিক হিসাব'
      : 'Estimated Values';

  const nutritionBasisLabel =
    activeRecipe.nutritionBasis === 'cooked'
      ? language === 'bn'
        ? 'রান্না করা পরিবেশন ভিত্তিক'
        : 'Cooked Serving Basis'
      : activeRecipe.nutritionBasis === 'raw'
      ? language === 'bn'
        ? 'কাঁচা উপাদান ভিত্তিক'
        : 'Raw Ingredient Basis'
      : language === 'bn'
      ? 'প্রতি পরিবেশন ভিত্তিক'
      : 'Per Recipe Serving';

  const tipsList =
    language === 'bn'
      ? activeRecipe.cookingTipsBn && activeRecipe.cookingTipsBn.length > 0
        ? activeRecipe.cookingTipsBn
        : activeRecipe.cookingTips || []
      : activeRecipe.cookingTips && activeRecipe.cookingTips.length > 0
      ? activeRecipe.cookingTips
      : activeRecipe.cookingTipsBn || [];

  const subsList =
    language === 'bn'
      ? activeRecipe.substitutionsBn && activeRecipe.substitutionsBn.length > 0
        ? activeRecipe.substitutionsBn
        : activeRecipe.substitutions || []
      : activeRecipe.substitutions && activeRecipe.substitutions.length > 0
      ? activeRecipe.substitutions
      : activeRecipe.substitutionsBn || [];

  const pantryTokens = kitchenPantryText
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length >= 2);

  // Active localized data fields
  const recipeName = getLocalized(
    activeRecipe.name_bn || activeRecipe.nameBn,
    activeRecipe.name_en || activeRecipe.name
  );
  const secondaryName =
    language === 'bn'
      ? activeRecipe.name_en || activeRecipe.name
      : activeRecipe.name_bn || activeRecipe.nameBn;

  const recipeDescription = getLocalized(
    activeRecipe.description_bn || activeRecipe.descriptionBn,
    activeRecipe.description_en || activeRecipe.description
  );

  const healthInsight = getLocalized(
    activeRecipe.healthHighlightBn || activeRecipe.healthHighlight,
    activeRecipe.healthHighlight || activeRecipe.healthHighlightBn
  );

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-2 sm:p-4 md:p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recipe-modal-title"
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-emerald-950/20 my-4 sm:my-8 relative flex flex-col max-h-[92vh]">
        {/* TOP PERSISTENT CONTROLS BAR (Always visible on mobile & desktop) */}
        <div className="sticky top-0 z-30 bg-[#16382C] text-white px-3 sm:px-5 py-2.5 flex items-center justify-between border-b border-emerald-800/80 shadow-md">
          {/* Left Navigation Cluster: Back Arrow + Home */}
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={handleBackOrClose}
              data-testid="modal-back-btn"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15 focus:outline-none focus:ring-2 focus:ring-emerald-400 active:scale-95"
              aria-label={language === 'bn' ? 'ফিরে যান' : 'Back'}
            >
              <ArrowLeft className="w-4 h-4 text-emerald-300 shrink-0" />
              <span className="hidden xs:inline">
                {language === 'bn' ? 'ফিরে যান' : 'Back'}
              </span>
            </button>

            <button
              type="button"
              onClick={goHome}
              data-testid="modal-home-btn"
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-emerald-600/35 hover:bg-emerald-600/55 text-white text-xs font-bold transition-all border border-emerald-400/30 focus:outline-none focus:ring-2 focus:ring-emerald-400 active:scale-95"
              title={language === 'bn' ? 'হোমপেজে যান' : 'Go to Home'}
              aria-label={language === 'bn' ? 'হোমপেজে যান' : 'Go to Home'}
            >
              <Home className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
              <span className="hidden sm:inline">{t.home}</span>
            </button>
          </div>

          {/* Right Action Controls: Language, Share, Favorite, Close (X) */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* Functional Bilingual Language Switcher */}
            <div className="bg-black/40 p-0.5 rounded-lg border border-white/15 flex items-center">
              <button
                onClick={() => setLanguage('bn')}
                className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                  language === 'bn'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-stone-300 hover:text-white'
                }`}
                title="Switch to Bangla / বাংলায় দেখুন"
              >
                বাংলা
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                  language === 'en'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-stone-300 hover:text-white'
                }`}
                title="Switch to English"
              >
                EN
              </button>
            </div>

            {/* Share Recipe */}
            <button
              onClick={handleCopyShare}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
              title={language === 'bn' ? 'রেসিপি শেয়ার করুন' : 'Share Recipe'}
            >
              {copiedLink ? (
                <Check className="w-4 h-4 text-emerald-300" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>

            {/* Favorite Toggle */}
            <button
              onClick={() => toggleFavorite(activeRecipe.id, activeRecipe)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
              title={
                favorited
                  ? language === 'bn'
                    ? 'পছন্দ থেকে সরান'
                    : 'Remove from favorites'
                  : language === 'bn'
                  ? 'পছন্দে যোগ করুন'
                  : 'Add to favorites'
              }
            >
              <Heart
                className={`w-4 h-4 ${
                  favorited ? 'text-rose-400 fill-rose-400' : 'text-white'
                }`}
              />
            </button>

            {/* Visible Dedicated Close (X) Button */}
            <button
              onClick={handleBackOrClose}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              title={language === 'bn' ? 'বন্ধ করুন (Esc)' : 'Close Details (Esc)'}
              aria-label="Close details"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">
                {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </span>
            </button>
          </div>
        </div>

        {/* SCROLLABLE CONTENT BODY */}
        <div className="overflow-y-auto flex-1">
          {/* Hero Image Section */}
          <div className="relative h-60 sm:h-72 md:h-80 w-full overflow-hidden bg-stone-900">
            <img
              key={`${activeRecipe.id}-${activeRecipe.image}`}
              src={imageError ? '/images/food-placeholder.jpg' : resolveRecipeImage(activeRecipe)}
              alt={recipeName}
              referrerPolicy="no-referrer"
              onError={() => {
                setImageError(true);
              }}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

            {/* Title & Metadata Overlaid on Image */}
            <div className="absolute bottom-3 left-4 right-4 sm:bottom-4 sm:left-6 sm:right-6 text-white space-y-1.5">
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600/95 backdrop-blur-md text-white shadow-sm">
                  {activeRecipe.country
                    ? formatCountryLabel(activeRecipe.country, language)
                    : language === 'bn'
                    ? translateCuisineToBn(activeRecipe.cuisine)
                    : activeRecipe.cuisine}
                </span>
                {activeRecipe.adaptationType === 'regional_adaptation' &&
                  activeRecipe.countryOfOrigin &&
                  activeRecipe.country &&
                  activeRecipe.countryOfOrigin.toLowerCase() !== activeRecipe.country.toLowerCase() && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/85 backdrop-blur-md text-stone-950">
                      {language === 'bn'
                        ? `মূল উৎপত্তি: ${formatCountryLabel(activeRecipe.countryOfOrigin, 'bn')} • আঞ্চলিক সংস্করণ`
                        : `Origin: ${formatCountryLabel(activeRecipe.countryOfOrigin, 'en')} • ${activeRecipe.regionalStyle || `${activeRecipe.country} Style`}`}
                    </span>
                  )}
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/20 backdrop-blur-md text-white capitalize">
                  {language === 'bn'
                    ? activeRecipe.mealType === 'breakfast'
                      ? 'সকালের নাস্তা'
                      : activeRecipe.mealType === 'lunch'
                      ? 'দুপুরের খাবার'
                      : activeRecipe.mealType === 'dinner'
                      ? 'রাতের খাবার'
                      : 'হালকা নাস্তা'
                    : activeRecipe.mealType}
                </span>
                {activeRecipe.isVegetarian && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-green-500/85 text-white">
                    {language === 'bn' ? 'নিরামিষ' : 'Vegetarian'}
                  </span>
                )}
                {activeRecipe.isHalal && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/85 text-white">
                    {language === 'bn' ? 'হালাল' : 'Halal'}
                  </span>
                )}
                {activeRecipe.sourceLabel && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/20 backdrop-blur-md text-emerald-100">
                    {activeRecipe.sourceLabel}
                  </span>
                )}
              </div>

              {/* Dual Language Recipe Titles */}
              <h2
                id="recipe-modal-title"
                className="text-xl sm:text-2xl md:text-3xl font-black leading-tight text-white drop-shadow-sm"
              >
                {recipeName}
              </h2>
              {secondaryName && secondaryName !== recipeName && (
                <p className="text-xs sm:text-sm text-emerald-200/95 font-medium">
                  {secondaryName}
                </p>
              )}
              <p className="text-xs sm:text-sm text-stone-200/90 line-clamp-2 leading-relaxed">
                {recipeDescription}
              </p>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-4 sm:p-6 md:p-7 space-y-6">
            {/* Quick Metrics Bar with Localized Labels */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 text-xs">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-stone-500 block text-[10px] font-medium">
                    {language === 'bn' ? 'প্রস্তুতি সময়' : 'Prep Time'}
                  </span>
                  <span className="font-bold text-stone-800 font-mono-num">
                    {activeRecipe.prepTime} {language === 'bn' ? 'মিনিট' : 'mins'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-stone-500 block text-[10px] font-medium">
                    {language === 'bn' ? 'রান্নার সময়' : 'Cook Time'}
                  </span>
                  <span className="font-bold text-stone-800 font-mono-num">
                    {activeRecipe.cookTime} {language === 'bn' ? 'মিনিট' : 'mins'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Gauge className="w-4 h-4 text-teal-600 shrink-0" />
                <div>
                  <span className="text-stone-500 block text-[10px] font-medium">
                    {language === 'bn' ? 'কঠিন্য' : 'Difficulty'}
                  </span>
                  <span className="font-bold text-stone-800">{difficultyLabel}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-orange-500 shrink-0" />
                <div>
                  <span className="text-stone-500 block text-[10px] font-medium">
                    {language === 'bn' ? 'ক্যালোরি' : 'Calories'}
                  </span>
                  <span className="font-bold text-stone-800 font-mono-num">
                    {currentCalories} {language === 'bn' ? 'ক্যালোরি' : 'kcal'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-stone-500 block text-[10px] font-medium">
                    {language === 'bn' ? 'পরিবেশন সংখ্যা' : 'Servings'}
                  </span>
                  <span className="font-bold text-stone-800 font-mono-num">
                    {currentServings} {language === 'bn' ? 'জন' : 'servings'}
                  </span>
                </div>
              </div>
            </div>

            {/* Serving Size Adjuster */}
            <div className="flex items-center justify-between p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 text-xs">
              <span className="font-bold text-emerald-950">
                {language === 'bn' ? 'পরিবেশন সংখ্যা পরিবর্তন:' : 'Adjust Servings:'}
              </span>
              <div className="flex items-center space-x-1.5">
                {[1, 2, 3, 4].map((mult) => (
                  <button
                    key={mult}
                    onClick={() => setServingMultiplier(mult)}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${
                      servingMultiplier === mult
                        ? 'bg-[#1B4332] text-white shadow-sm'
                        : 'bg-white text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    {mult}x ({recipe.servings * mult})
                  </button>
                ))}
              </div>
            </div>

            {/* Nutrition Breakdown with Transparent Provenance & Sugar Metric */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 flex flex-wrap items-center justify-between gap-1.5">
                <span>
                  {language === 'bn'
                    ? 'পুষ্টি উপাদানের বিন্যাস'
                    : 'Macronutrient Distribution'}
                  {' · '}
                  <span className="normal-case font-semibold text-stone-500">{nutritionBasisLabel}</span>
                </span>
                <span
                  className={`text-[10px] font-semibold normal-case px-2 py-0.5 rounded-md border ${
                    activeRecipe.nutritionStatus === 'ai_estimated' || activeRecipe.nutritionEstimated
                      ? 'text-amber-800 bg-amber-50 border-amber-200'
                      : 'text-emerald-800 bg-emerald-50 border-emerald-200'
                  }`}
                >
                  {nutritionStatusLabel}
                </span>
              </h3>
              <div className={`grid ${currentSugar !== undefined ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-4'} gap-2 text-center text-xs`}>
                <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200/70">
                  <span className="block text-[10px] font-semibold text-emerald-800">
                    {language === 'bn' ? 'প্রোটিন' : 'Protein'}
                  </span>
                  <span className="font-extrabold text-base text-emerald-950 font-mono-num">
                    {currentProtein}g
                  </span>
                </div>
                <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200/70">
                  <span className="block text-[10px] font-semibold text-amber-800">
                    {language === 'bn' ? 'শর্করা' : 'Carbs'}
                  </span>
                  <span className="font-extrabold text-base text-amber-950 font-mono-num">
                    {currentCarbs}g
                  </span>
                </div>
                <div className="bg-orange-50 p-2.5 rounded-xl border border-orange-200/70">
                  <span className="block text-[10px] font-semibold text-orange-800">
                    {language === 'bn' ? 'স্নেহ (ফ্যাট)' : 'Fat'}
                  </span>
                  <span className="font-extrabold text-base text-orange-950 font-mono-num">
                    {currentFat}g
                  </span>
                </div>
                <div className="bg-teal-50 p-2.5 rounded-xl border border-teal-200/70">
                  <span className="block text-[10px] font-semibold text-teal-800">
                    {language === 'bn' ? 'আঁশ (ফাইবার)' : 'Fiber'}
                  </span>
                  <span className="font-extrabold text-base text-teal-950 font-mono-num">
                    {currentFiber}g
                  </span>
                </div>
                {currentSugar !== undefined && (
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                    <span className="block text-[10px] font-semibold text-stone-600">
                      {language === 'bn' ? 'চিনি (আনু.)' : 'Est. Sugar'}
                    </span>
                    <span className="font-extrabold text-base text-stone-900 font-mono-num">
                      ~{currentSugar}g
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Smart Diet / Nutrition Match Reason Banner if applicable */}
            {(activeRecipe.nutritionMatchReason || activeRecipe.nutritionMatchReasonBn) && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <span className="font-bold mr-1">
                    {language === 'bn' ? 'পুষ্টিগত সামঞ্জস্য:' : 'Dietary Fit:'}
                  </span>
                  <span>
                    {language === 'bn'
                      ? activeRecipe.nutritionMatchReasonBn || activeRecipe.nutritionMatchReason
                      : activeRecipe.nutritionMatchReason || activeRecipe.nutritionMatchReasonBn}
                  </span>
                </div>
              </div>
            )}

            {/* Clinical Health Insight */}
            <div className="flex items-start space-x-3 p-3.5 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-amber-500/10 rounded-2xl border border-emerald-200/70 text-xs text-emerald-950">
              <Sparkles className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold block text-emerald-900 mb-0.5">
                  {language === 'bn' ? 'পুষ্টিবিজ্ঞানীদের মূল্যায়ন:' : 'Nutrition Science Insight:'}
                </span>
                <p className="text-stone-700 leading-relaxed">{healthInsight}</p>
              </div>
            </div>

            {/* Bilingual Recipe Display Mode Bar for Ingredients & Cooking Steps */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-stone-100/80 rounded-xl border border-stone-200/80 text-xs">
              <div className="flex items-center space-x-2 text-stone-700 font-bold">
                <Globe className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  {language === 'bn'
                    ? 'উপকরণ ও রান্নার ধাপ ভাষা:'
                    : 'Ingredients & Steps Language:'}
                </span>
                {isTranslatingBn && (
                  <span className="text-[10px] font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {language === 'bn' ? 'বাংলা অনুবাদ আপডেট হচ্ছে...' : 'Refining Bangla...'}
                  </span>
                )}
              </div>
              <div className="inline-flex bg-white p-0.5 rounded-lg border border-stone-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setDisplayLangMode('both')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                    displayLangMode === 'both'
                      ? 'bg-[#1B4332] text-white'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  EN + বাংলা
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayLangMode('bn')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                    displayLangMode === 'bn'
                      ? 'bg-[#1B4332] text-white'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  বাংলা
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayLangMode('en')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                    displayLangMode === 'en'
                      ? 'bg-[#1B4332] text-white'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Ingredients Section (Bilingual Bangla & English) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-extrabold text-stone-900 text-sm flex items-center space-x-2">
                  <span>
                    {displayLangMode === 'both'
                      ? language === 'bn'
                        ? 'উপকরণ ও পরিমাণ (Ingredients & Quantities)'
                        : 'Ingredients & Quantities (উপকরণ ও পরিমাণ)'
                      : displayLangMode === 'bn'
                      ? 'উপকরণ ও পরিমাণ'
                      : 'Ingredients & Quantities'}
                  </span>
                  <span className="text-xs font-normal text-stone-500">
                    ({activeRecipe.ingredients.length} {language === 'bn' ? 'টি' : 'items'})
                  </span>
                </h3>
                <button
                  onClick={handleAddAllToGrocery}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#1B4332] hover:bg-[#255C45] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'ফর্দে যোগ করুন' : 'Add to Grocery'}</span>
                </button>
              </div>

              {/* Optional Kitchen Ingredient Availability Highlighter */}
              <div className="mb-3 flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 bg-stone-50 rounded-xl border border-stone-200/80 text-xs">
                <label className="font-bold text-stone-700 shrink-0">
                  {language === 'bn' ? 'ঘরে থাকা উপাদান মিলিয়ে দেখুন:' : 'Check your kitchen:'}
                </label>
                <input
                  type="text"
                  value={kitchenPantryText}
                  onChange={(e) => setKitchenPantryText(e.target.value)}
                  placeholder={language === 'bn' ? 'কমা দিয়ে লিখুন (যেমন: ডিম, পেঁয়াজ, ডাল)...' : 'Type ingredients you have (e.g., onion, rice, garlic)...'}
                  className="flex-1 bg-white px-2.5 py-1 rounded-lg border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {activeRecipe.ingredients.map((ing, idx) => {
                  const isChecked = checkedIngredients.includes(idx);
                  const adjustedAmount = (ing.amount * servingMultiplier).toFixed(
                    ing.amount % 1 === 0 ? 0 : 1
                  );
                  const ingNameBn = hasBanglaText(ing.nameBn)
                    ? ing.nameBn
                    : translateIngredientToBn(ing.name);
                  const ingUnitBn = hasBanglaText(ing.unitBn)
                    ? ing.unitBn
                    : translateUnitToBn(ing.unit);
                  const amountEn = adjustedAmount;
                  const amountBn = toBanglaDigits(adjustedAmount);

                  const enLine = `${amountEn} ${ing.unit} ${ing.name}`.trim();
                  const bnLine = `${amountBn} ${ingUnitBn} ${ingNameBn}`.trim();
                  const bnFirst = language === 'bn';
                  const primaryText =
                    displayLangMode === 'bn'
                      ? bnLine
                      : displayLangMode === 'en'
                      ? enLine
                      : bnFirst
                      ? bnLine
                      : enLine;
                  const secondaryText =
                    displayLangMode === 'both' ? (bnFirst ? enLine : bnLine) : '';

                  const ingHay = `${ing.name} ${ingNameBn}`.toLowerCase();
                  const matchedHave = pantryTokens.length > 0 && pantryTokens.some((t) => ingHay.includes(t));

                  return (
                    <div
                      key={idx}
                      onClick={() => toggleIngredientCheck(idx)}
                      className={`flex items-start space-x-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-emerald-50/70 border-emerald-200 text-stone-400 line-through'
                          : matchedHave
                          ? 'bg-emerald-50/50 border-emerald-300 text-stone-800'
                          : 'bg-stone-50/70 border-stone-200/70 text-stone-800 hover:bg-stone-100'
                      }`}
                    >
                      {isChecked ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="font-semibold text-emerald-950 leading-snug">
                            {primaryText}
                          </div>
                          {pantryTokens.length > 0 && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                                matchedHave ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {matchedHave
                                ? language === 'bn'
                                  ? 'আছে'
                                  : 'Have'
                                : language === 'bn'
                                ? 'দরকার'
                                : 'Need'}
                            </span>
                          )}
                        </div>
                        {secondaryText && secondaryText !== primaryText && (
                          <div className="text-[11px] text-stone-500 leading-snug">
                            {secondaryText}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cooking Instructions (Bilingual Bangla & English) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-extrabold text-stone-900 text-sm">
                  {displayLangMode === 'both'
                    ? language === 'bn'
                      ? 'রান্নার প্রণালী (Cooking Steps)'
                      : 'Step-by-Step Cooking Instructions (রান্নার প্রণালী)'
                    : displayLangMode === 'bn'
                    ? 'রান্নার প্রণালী'
                    : 'Step-by-Step Instructions'}
                </h3>
                <span className="text-xs text-stone-500 font-medium">
                  {completedSteps.length} / {stepPairs.length}{' '}
                  {language === 'bn' ? 'ধাপ সম্পন্ন' : 'steps completed'}
                </span>
              </div>

              <div className="space-y-3">
                {stepPairs.map((pair, idx) => {
                  const isDone = completedSteps.includes(idx);
                  const bnFirst = language === 'bn';
                  const primaryStep =
                    displayLangMode === 'bn'
                      ? pair.bn
                      : displayLangMode === 'en'
                      ? pair.en
                      : bnFirst
                      ? pair.bn
                      : pair.en;
                  const secondaryStep =
                    displayLangMode === 'both' ? (bnFirst ? pair.en : pair.bn) : '';
                  const secondaryTag = bnFirst ? 'EN' : 'বাংলা';

                  return (
                    <div
                      key={idx}
                      onClick={() => toggleStep(idx)}
                      className={`p-3.5 rounded-xl border flex items-start space-x-3 cursor-pointer transition-all ${
                        isDone
                          ? 'bg-emerald-50/60 border-emerald-200 text-stone-400'
                          : 'bg-white border-stone-200 hover:border-emerald-300 shadow-sm text-stone-800'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                          isDone ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isDone ? '✓' : language === 'bn' ? toBanglaDigits(idx + 1) : idx + 1}
                      </div>
                      <div className={`flex-1 space-y-1.5 ${isDone ? 'line-through' : ''}`}>
                        <p className="text-xs leading-relaxed font-medium text-stone-800">
                          {primaryStep}
                        </p>
                        {secondaryStep && secondaryStep !== primaryStep && (
                          <p className="text-[11px] leading-relaxed text-stone-600 pt-1 border-t border-stone-100">
                            <span className="inline-block font-bold text-emerald-800 mr-1.5">
                              {secondaryTag}:
                            </span>
                            {secondaryStep}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cooking Tips & Ingredient Substitutions */}
            {(tipsList.length > 0 || subsList.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tipsList.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                    <div className="flex items-center space-x-1.5 font-extrabold text-stone-900">
                      <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{t.cookingTips}</span>
                    </div>
                    <ul className="space-y-1.5 text-stone-700 leading-relaxed list-disc list-inside">
                      {tipsList.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {subsList.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 space-y-2 text-xs">
                    <div className="flex items-center space-x-1.5 font-extrabold text-emerald-950">
                      <Repeat2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>
                        {language === 'bn' ? 'সহজ বিকল্প উপকরণ (Substitutions)' : 'Practical Substitutions'}
                      </span>
                    </div>
                    <ul className="space-y-1.5 text-stone-700 leading-relaxed list-disc list-inside">
                      {subsList.map((sub, idx) => (
                        <li key={idx}>{sub}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM DEDICATED CONTROLS BAR (With Back, Home, and Close Buttons) */}
        <div className="p-3 sm:p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            {/* Back Button with Left Arrow */}
            <button
              type="button"
              onClick={handleBackOrClose}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 shadow-sm transition-colors active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-stone-600" />
              <span>{language === 'bn' ? 'ফিরে যান' : 'Back'}</span>
            </button>

            {/* Home Button */}
            <button
              type="button"
              onClick={goHome}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 shadow-sm transition-colors active:scale-95"
            >
              <Home className="w-4 h-4 text-emerald-700" />
              <span>{t.home}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {/* Favorite button */}
            <button
              onClick={() => toggleFavorite(activeRecipe.id, activeRecipe)}
              className={`hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                favorited
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${favorited ? 'fill-rose-500 text-rose-500' : ''}`}
              />
              <span>
                {favorited
                  ? language === 'bn'
                    ? 'সংরক্ষিত'
                    : 'Saved'
                  : language === 'bn'
                  ? 'পছন্দ'
                  : 'Favorite'}
              </span>
            </button>

            {/* Prominent Close Button */}
            <button
              onClick={handleBackOrClose}
              className="flex items-center space-x-1.5 px-5 py-2 bg-[#1B4332] hover:bg-[#255C45] text-white rounded-xl text-xs font-bold shadow-md transition-colors active:scale-95"
            >
              <X className="w-4 h-4" />
              <span>{language === 'bn' ? 'বন্ধ করুন' : 'Close Details'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
