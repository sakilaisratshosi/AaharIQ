import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  resolveRecipeImage,
  buildRecipeImageSearchQuery,
  enforceUniqueRecipeImages,
} from '../utils/recipeImageResolver';
import {
  CANONICAL_INGREDIENTS,
  analyzeKitchenIngredients,
  validateRecipeAgainstIngredients,
} from '../utils/ingredientMatching';
import { Recipe } from '../data/recipesData';
import {
  hasBanglaText,
  toBanglaDigits,
  translateCookingStepToBn,
  translateCuisineToBn,
  translateIngredientToBn,
  translateMealTypeToBn,
  translateUnitToBn,
} from '../utils/bilingualRecipeTranslator';
import {
  Sparkles,
  Plus,
  X,
  ChefHat,
  Clock,
  Flame,
  CheckCircle2,
  AlertTriangle,
  ShoppingCart,
  ArrowRight,
  Lightbulb,
  Users,
  Check,
  Info,
  RotateCcw,
  Search,
  Leaf,
  Layers,
  Scale,
  Percent,
} from 'lucide-react';

export interface GeneratedRecipe {
  id?: string;
  recipeId?: string;
  recipeName: string;
  recipeNameBn: string;
  cuisine: string;
  mealType: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  servings: number;
  caloriesPerServing: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  image?: string;
  imageUrl?: string;
  imageSearchQuery?: string;
  usedIngredients: string[];
  availableIngredients?: string[];
  optionalIngredients?: string[];
  missingIngredients: string[];
  ingredientAvailabilityPercentage?: number;
  matchedIngredients?: string[];
  unmatchedSelectedIngredients?: string[];
  matchPercentage?: number;
  ingredientNote?: string;
  ingredientNoteBn?: string;
  substitutes?: string[];
  instructions: string[];
  instructionsBn: string[];
  healthHighlight: string;
  healthHighlightBn: string;
  foodWasteTip?: string;
  foodWasteTipBn?: string;
  matchingFoodKeywords?: string;
}

// 6 Required Test Cases per Prompt Specification
const PRESET_TEST_1_SHAK = ['Shak', 'Onion', 'Green Chili'];
const PRESET_TEST_2_EGG_POTATO = ['Egg', 'Potato', 'Onion'];
const PRESET_TEST_3_CHICKEN_RICE = ['Chicken', 'Rice'];
const PRESET_TEST_4_FISH_TOMATO = ['Fish', 'Tomato'];
const PRESET_TEST_5_RICE_ONLY = ['Rice'];
const PRESET_TEST_6_BANGLA = ['শাক', 'পেঁয়াজ', 'কাঁচা মরিচ'];

const COMMON_PANTRY_CHIPS = [
  { en: 'Shak', bn: 'শাক', category: 'greens' },
  { en: 'Spinach', bn: 'পালং শাক', category: 'greens' },
  { en: 'Potato', bn: 'আলু', category: 'starch' },
  { en: 'Tomato', bn: 'টমেটো', category: 'vegetable' },
  { en: 'Egg', bn: 'ডিম', category: 'protein' },
  { en: 'Cabbage', bn: 'বাঁধাকপি', category: 'vegetable' },
  { en: 'Cauliflower', bn: 'ফুলকপি', category: 'vegetable' },
  { en: 'Pumpkin', bn: 'মিষ্টি কুমড়া', category: 'vegetable' },
  { en: 'Rice', bn: 'চাল', category: 'starch' },
  { en: 'Chicken', bn: 'মুরগির মাংস', category: 'protein' },
  { en: 'Fish', bn: 'মাছ', category: 'protein' },
  { en: 'Lentils (Dal)', bn: 'মসুর ডাল', category: 'protein' },
  { en: 'Onion', bn: 'পেঁয়াজ', category: 'aromatic' },
  { en: 'Garlic', bn: 'রসুন', category: 'aromatic' },
  { en: 'Ginger', bn: 'আদা', category: 'aromatic' },
  { en: 'Green Chili', bn: 'কাঁচা মরিচ', category: 'spice' },
  { en: 'Turmeric', bn: 'হলুদ', category: 'spice' },
  { en: 'Cumin', bn: 'জিরা', category: 'spice' },
  { en: 'Mustard Oil', bn: 'সরিষার তেল', category: 'oil' },
];

const SINGLE_INGREDIENT_DISCOVERY = [
  { en: 'Spinach', bn: 'শাক', queryEn: 'Shak', queryBn: 'শাক' },
  { en: 'Lentils (Dal)', bn: 'মসুর ডাল', queryEn: 'Lentils (Dal)', queryBn: 'মসুর ডাল' },
  { en: 'Potato', bn: 'আলু', queryEn: 'Potato', queryBn: 'আলু' },
  { en: 'Tomato', bn: 'টমেটো', queryEn: 'Tomato', queryBn: 'টমেটো' },
  { en: 'Egg', bn: 'ডিম', queryEn: 'Egg', queryBn: 'ডিম' },
  { en: 'Onion', bn: 'পেঁয়াজ', queryEn: 'Onion', queryBn: 'পেঁয়াজ' },
  { en: 'Cabbage', bn: 'বাঁধাকপি', queryEn: 'Cabbage', queryBn: 'বাঁধাকপি' },
  { en: 'Cauliflower', bn: 'ফুলকপি', queryEn: 'Cauliflower', queryBn: 'ফুলকপি' },
  { en: 'Pumpkin', bn: 'মিষ্টি কুমড়া', queryEn: 'Pumpkin', queryBn: 'মিষ্টি কুমড়া' },
  { en: 'Rice', bn: 'চাল', queryEn: 'Rice', queryBn: 'চাল' },
  { en: 'Fish', bn: 'মাছ', queryEn: 'Fish', queryBn: 'মাছ' },
];

type ResultFilter = 'all' | 'quick' | 'healthy' | 'traditional' | 'less_ingredients';

type RecipeImageEntry = {
  url: string;
  status: 'loading' | 'loaded' | 'error';
  query: string;
};

export const IngredientAIView: React.FC = () => {
  const { language, t, addBatchGroceryItems, setSelectedRecipe } = useApp();

  const [ingredientsList, setIngredientsList] = useState<string[]>(PRESET_TEST_1_SHAK);
  const [quickSearchInput, setQuickSearchInput] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState('Bangladeshi');
  const [dietaryPref, setDietaryPref] = useState('Any');
  const [activeFilter, setActiveFilter] = useState<ResultFilter>('all');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<GeneratedRecipe[] | null>(null);
  const [recipeImagesById, setRecipeImagesById] = useState<Record<string, RecipeImageEntry>>({});
  const [bilingualCardMode, setBilingualCardMode] = useState<'both' | 'bn' | 'en'>('both');

  const searchBatchRef = useRef(0);
  const imageAbortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      imageAbortControllerRef.current?.abort();
    };
  }, []);

  // Real-time analysis of user's pantry
  const kitchenAnalysis = useMemo(() => {
    return analyzeKitchenIngredients(ingredientsList);
  }, [ingredientsList]);

  // Autocomplete suggestions based on input
  const suggestions = useMemo(() => {
    const q = customInput.trim().toLowerCase();
    if (!q) return [];
    return CANONICAL_INGREDIENTS.filter(
      (c) =>
        !ingredientsList.some((i) => i.toLowerCase() === c.nameEn.toLowerCase() || i === c.nameBn) &&
        (c.nameEn.toLowerCase().includes(q) ||
          c.nameBn.includes(q) ||
          c.synonyms.some((s) => s.toLowerCase().includes(q)))
    ).slice(0, 6);
  }, [customInput, ingredientsList]);

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customInput.trim();
    if (trimmed && !ingredientsList.some((i) => i.toLowerCase() === trimmed.toLowerCase())) {
      setIngredientsList((prev) => [...prev, trimmed]);
      setCustomInput('');
      setShowAutocomplete(false);
    }
  };

  const handleSelectSuggestion = (s: (typeof CANONICAL_INGREDIENTS)[0]) => {
    const chosenName = language === 'bn' ? s.nameBn : s.nameEn;
    if (!ingredientsList.some((i) => i.toLowerCase() === chosenName.toLowerCase())) {
      setIngredientsList((prev) => [...prev, chosenName]);
    }
    setCustomInput('');
    setShowAutocomplete(false);
  };

  const handleToggleChip = (nameEn: string) => {
    if (ingredientsList.includes(nameEn)) {
      setIngredientsList((prev) => prev.filter((i) => i !== nameEn));
    } else {
      setIngredientsList((prev) => [...prev, nameEn]);
    }
  };

  const handleRemove = (name: string) => {
    setIngredientsList((prev) => prev.filter((i) => i !== name));
  };

  const generateRecipesForIngredients = async (targetIngredients: string[]) => {
    if (targetIngredients.length === 0) {
      setError(
        language === 'bn'
          ? 'অনুগ্রহ করে অন্তত ১টি উপাদান লিখুন বা নির্বাচন করুন।'
          : 'Please type or select at least 1 ingredient from your kitchen.'
      );
      return;
    }

    const analysis = analyzeKitchenIngredients(targetIngredients);
    if (!analysis.isFeasible) {
      setError(
        language === 'bn'
          ? analysis.infeasibilityReasonBn ||
            'আপনার দেওয়া উপকরণ দিয়ে উপযুক্ত রেসিপি তৈরি করা সম্ভব হচ্ছে না। কিছু অতিরিক্ত উপকরণ যোগ করুন।'
          : analysis.infeasibilityReasonEn ||
            'It is not possible to prepare a suitable recipe with your provided ingredients. Please add some additional ingredients.'
      );
      return;
    }

    // Invalidate previous batch requests & reset stale image cache cleanly
    const activeBatchId = ++searchBatchRef.current;
    imageAbortControllerRef.current?.abort();
    const controller = new AbortController();
    imageAbortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    setRecipes(null);
    setRecipeImagesById({});
    setActiveFilter('all');

    try {
      const res = await fetch('/api/gemini/ingredient-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
        cache: 'no-store',
        signal: controller.signal,
        body: JSON.stringify({
          ingredients: targetIngredients,
          cuisine: selectedCuisine,
          dietaryPreference: dietaryPref,
          language,
        }),
      });

      const data = await res.json();
      if (searchBatchRef.current !== activeBatchId) return;

      if (!res.ok) {
        throw new Error(
          data.error ||
            (language === 'bn'
              ? 'আপনার দেওয়া উপকরণ দিয়ে উপযুক্ত রেসিপি তৈরি করা সম্ভব হচ্ছে না। কিছু অতিরিক্ত উপকরণ যোগ করুন।'
              : 'It is not possible to prepare a suitable recipe with your provided ingredients. Please add some additional ingredients.')
        );
      }

      const rawList: any[] = data.recipes || [];
      const strictlyValidated = rawList.filter((r: any) => {
        const val = validateRecipeAgainstIngredients(r, targetIngredients);
        return val.isValid;
      });

      const batchToken = Date.now().toString(36);
      const preliminaryRecipes: GeneratedRecipe[] = strictlyValidated.map((r: any, idx: number) => {
        const slug = (r.recipeName || 'dish')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        const recipeId = r.recipeId || r.id || `${slug || 'dish'}-${batchToken}-${idx}`;
        const imageSearchQuery = r.imageSearchQuery || buildRecipeImageSearchQuery(r);
        const resolvedUrl = resolveRecipeImage({
          ...r,
          recipeId,
          id: recipeId,
          image: undefined,
          imageUrl: undefined,
        });

        const val = validateRecipeAgainstIngredients(r, targetIngredients);

        return {
          ...r,
          id: recipeId,
          recipeId,
          imageSearchQuery,
          difficulty: r.difficulty || 'Easy',
          image: resolvedUrl,
          imageUrl: resolvedUrl,
          availableIngredients: r.availableIngredients || val.availableIngredients,
          optionalIngredients: r.optionalIngredients || val.optionalIngredients,
          missingIngredients: r.missingIngredients || val.missingIngredients,
          ingredientAvailabilityPercentage:
            r.ingredientAvailabilityPercentage || val.ingredientAvailabilityPercentage,
          matchedIngredients: val.matchedIngredients,
          unmatchedSelectedIngredients: val.unmatchedSelectedIngredients,
          matchPercentage: val.matchPercentage,
          substitutes: r.substitutes || [],
          foodWasteTip:
            r.foodWasteTip ||
            'Store unused stems or vegetable trimmings in a cool container to infuse aromatic stocks.',
          foodWasteTipBn:
            r.foodWasteTipBn ||
            'সবজির খোসা বা উচ্ছিষ্ট ডাঁটা ফেলে না দিয়ে ধুয়ে রেখে স্যুপ বা ভাজিতে ব্যবহার করুন।',
        };
      });

      // Enforce per-card unique image URLs across the batch
      const mappedRecipes = enforceUniqueRecipeImages(preliminaryRecipes);

      // Build initial recipeId -> image map
      const initialImageMap: Record<string, RecipeImageEntry> = {};
      mappedRecipes.forEach((rec) => {
        const rid = rec.recipeId || rec.id!;
        const currentUrl = rec.imageUrl || rec.image || '/images/food-placeholder.jpg';
        initialImageMap[rid] = {
          url: currentUrl,
          status: currentUrl.includes('food-placeholder') ? 'loading' : 'loaded',
          query: rec.imageSearchQuery || buildRecipeImageSearchQuery(rec),
        };
      });

      setRecipes(mappedRecipes);
      setRecipeImagesById(initialImageMap);

      // For any unknown recipe without a direct local photo, fetch per recipeId independently
      // with batch/ID race guards so async results NEVER overwrite another card's photo!
      mappedRecipes.forEach((rec) => {
        const rid = rec.recipeId || rec.id!;
        const initialUrl = rec.imageUrl || rec.image || '';
        if (!initialUrl.includes('food-placeholder')) return;

        const searchQ = rec.imageSearchQuery || buildRecipeImageSearchQuery(rec);
        const params = new URLSearchParams({
          recipeId: rid,
          q: searchQ,
          titleBn: rec.recipeNameBn || '',
          cuisine: rec.cuisine || '',
          _t: `${activeBatchId}-${rid}`,
        });

        fetch(`/api/recipe-image?${params.toString()}`, {
          cache: 'no-store',
          signal: controller.signal,
        })
          .then((imgRes) => imgRes.json())
          .then((imgData) => {
            if (searchBatchRef.current !== activeBatchId) return;
            if (!imgData || (imgData.recipeId && imgData.recipeId !== rid)) return;

            const fetchedUrl = imgData.imageUrl || imgData.image || '/images/food-placeholder.jpg';
            setRecipeImagesById((prev) => {
              const otherUrls = new Set(
                Object.entries(prev)
                  .filter(([k]) => k !== rid)
                  .map(([, v]) => (v.url || '').split('?')[0])
              );
              const baseFetched = fetchedUrl.split('?')[0];
              const safeUrl =
                baseFetched === '/images/food-placeholder.jpg' || otherUrls.has(baseFetched)
                  ? '/images/food-placeholder.jpg'
                  : fetchedUrl;
              return {
                ...prev,
                [rid]: {
                  url: safeUrl,
                  status: 'loaded',
                  query: searchQ,
                },
              };
            });
          })
          .catch(() => {
            if (searchBatchRef.current !== activeBatchId) return;
            setRecipeImagesById((prev) => ({
              ...prev,
              [rid]: {
                url: '/images/food-placeholder.jpg',
                status: 'error',
                query: searchQ,
              },
            }));
          });
      });
    } catch (err: any) {
      if (err?.name === 'AbortError' || searchBatchRef.current !== activeBatchId) return;
      setError(
        err.message ||
          (language === 'bn'
            ? 'আপনার দেওয়া উপকরণ দিয়ে উপযুক্ত রেসিপি তৈরি করা সম্ভব হচ্ছে না। কিছু অতিরিক্ত উপকরণ যোগ করুন।'
            : 'It is not possible to prepare a suitable recipe with your provided ingredients. Please add some additional ingredients.')
      );
    } finally {
      if (searchBatchRef.current === activeBatchId) {
        setLoading(false);
      }
    }
  };

  const handleGenerate = () => generateRecipesForIngredients(ingredientsList);

  const handleInstantSingleSearch = (ingredientText: string) => {
    const cleaned = ingredientText.trim();
    if (!cleaned) return;
    setIngredientsList([cleaned]);
    setQuickSearchInput('');
    generateRecipesForIngredients([cleaned]);
  };

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickSearchInput.trim();
    if (!trimmed) return;
    handleInstantSingleSearch(trimmed);
  };

  const filteredRecipes = useMemo(() => {
    if (!recipes) return [];
    switch (activeFilter) {
      case 'quick':
        return recipes.filter((r) => (r.prepTimeMinutes || 0) + (r.cookTimeMinutes || 0) <= 20);
      case 'healthy':
        return recipes.filter((r) => (r.caloriesPerServing || 999) <= 220 || (r.fiberGrams || 0) >= 4);
      case 'traditional':
        return recipes.filter((r) => (r.cuisine || '').toLowerCase().includes('bangladeshi'));
      case 'less_ingredients':
        return recipes.filter((r) => (r.missingIngredients || []).length <= 2);
      default:
        return recipes;
    }
  }, [recipes, activeFilter]);

  const filterCounts = useMemo(() => {
    const list = recipes || [];
    return {
      all: list.length,
      quick: list.filter((r) => (r.prepTimeMinutes || 0) + (r.cookTimeMinutes || 0) <= 20).length,
      healthy: list.filter((r) => (r.caloriesPerServing || 999) <= 220 || (r.fiberGrams || 0) >= 4).length,
      traditional: list.filter((r) => (r.cuisine || '').toLowerCase().includes('bangladeshi')).length,
      less_ingredients: list.filter((r) => (r.missingIngredients || []).length <= 2).length,
    };
  }, [recipes]);

  const handleOpenRecipeModal = (recipe: GeneratedRecipe) => {
    const converted: Recipe = {
      id: recipe.id || 'gen_' + (recipe.recipeName || 'dish').toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: recipe.recipeName,
      name_en: recipe.recipeName,
      nameBn: recipe.recipeNameBn || recipe.recipeName,
      name_bn: recipe.recipeNameBn || recipe.recipeName,
      cuisine: (recipe.cuisine as any) || 'Bangladeshi',
      mealType: (recipe.mealType as any) || 'lunch',
      prepTime: recipe.prepTimeMinutes || 15,
      cookTime: recipe.cookTimeMinutes || 20,
      servings: recipe.servings || 4,
      caloriesPerServing: recipe.caloriesPerServing || 250,
      proteinPerServing: recipe.proteinGrams || 15,
      carbsPerServing: recipe.carbsGrams || 30,
      fatPerServing: recipe.fatGrams || 10,
      fiberPerServing: recipe.fiberGrams || 4,
      isVegetarian:
        recipe.cuisine === 'Vegetarian' ||
        !recipe.usedIngredients.some((i) => {
          const l = i.toLowerCase();
          return l.includes('chicken') || l.includes('fish') || l.includes('meat') || l.includes('beef');
        }),
      isVegan: false,
      isHalal: true,
      isGlutenFree: true,
      image: recipe.image || resolveRecipeImage(recipe),
      description: recipe.healthHighlight || 'Nutritious recipe generated from your ingredients.',
      description_en: recipe.healthHighlight || 'Nutritious recipe generated from your ingredients.',
      descriptionBn:
        recipe.healthHighlightBn || 'আপনার উপাদানগুলো দিয়ে তৈরি পুষ্টিকর রেসিপি।',
      description_bn:
        recipe.healthHighlightBn || 'আপনার উপাদানগুলো দিয়ে তৈরি পুষ্টিকর রেসিপি।',
      ingredients: Array.from(
        new Set([...(recipe.availableIngredients || recipe.usedIngredients || []), ...(recipe.missingIngredients || [])])
      ).map((u) => ({
        name: u,
        nameBn: hasBanglaText(u) ? u : translateIngredientToBn(u),
        amount: 1,
        unit: 'portion',
        unitBn: translateUnitToBn('portion'),
        category: 'pantry',
      })),
      ingredients_en: recipe.usedIngredients,
      ingredients_bn: recipe.usedIngredients.map((u) =>
        hasBanglaText(u) ? u : translateIngredientToBn(u)
      ),
      instructions: recipe.instructions,
      instructions_en: recipe.instructions,
      instructionsBn: recipe.instructions.map((s, idx) =>
        recipe.instructionsBn?.[idx] && hasBanglaText(recipe.instructionsBn[idx])
          ? recipe.instructionsBn[idx]
          : translateCookingStepToBn(s)
      ),
      instructions_bn: recipe.instructions.map((s, idx) =>
        recipe.instructionsBn?.[idx] && hasBanglaText(recipe.instructionsBn[idx])
          ? recipe.instructionsBn[idx]
          : translateCookingStepToBn(s)
      ),
      healthHighlight: recipe.healthHighlight,
      healthHighlightBn: recipe.healthHighlightBn,
    };
    setSelectedRecipe(converted);
  };

  const handleAddMissingToGrocery = (missing: string[], recipeTitle: string) => {
    const items = missing.map((itemStr) => ({
      name: itemStr,
      nameBn: hasBanglaText(itemStr) ? itemStr : translateIngredientToBn(itemStr),
      amount: '1',
      unit: 'portion',
      unitBn: translateUnitToBn('portion'),
      category: 'pantry' as const,
      addedFrom: `Missing for ${recipeTitle}`,
    }));
    addBatchGroceryItems(items);
  };

  return (
    <div className="space-y-8 pb-16 animate-fade-in">
      {/* Smart Ingredients AI Header Banner */}
      <div className="bg-gradient-to-r from-[#16382C] via-[#1E4A3B] to-[#122E24] text-white p-6 sm:p-8 rounded-3xl border border-emerald-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>SMART INGREDIENTS AI SYSTEM</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            {language === 'bn' ? 'স্মার্ট উপাদানভিত্তিক রেসিপি এআই' : 'Smart Ingredients AI Engine'}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            {language === 'bn'
              ? 'আপনার রান্নাঘরের উপাদানগুলো নির্বাচন করুন বা বাংলায়/ইংরেজিতে টাইপ করুন। এআই কঠোরভাবে আপনার নির্বাচিত মূল উপাদান দিয়ে বাস্তবসম্মত রেসিপি প্রস্তুত করবে এবং হাতে থাকা বনাম ঘাটতি উপাদান আলাদাভাবে প্রদর্শন করবে।'
              : 'Add your available pantry items in English or Bangla. Smart Ingredients AI strictly prioritizes your ingredients, validates recipe feasibility, and separates Available vs Missing items.'}
          </p>
        </div>
      </div>

      {/* Interactive Pantry & SmartChef Single-Ingredient Discovery Builder */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-emerald-950/10 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <h2 className="font-extrabold text-stone-900 text-base flex items-center space-x-2">
              <ChefHat className="w-4 h-4 text-emerald-700" />
              <span>{t.findRecipesByIngredients}</span>
            </h2>
            <p className="text-xs text-stone-500">
              {language === 'bn'
                ? 'মাত্র ১টি উপাদান লিখেই তাৎক্ষণিক ৪-৫টি রেসিপি খুঁজুন, অথবা একাধিক উপাদান যোগ করে কম্বিনেশন তৈরি করুন।'
                : 'Type just 1 ingredient for instant multi-recipe discovery, or combine multiple pantry items.'}
            </p>
          </div>

          {/* Quick Clear */}
          {ingredientsList.length > 0 && (
            <button
              onClick={() => setIngredientsList([])}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer self-start sm:self-auto"
            >
              {language === 'bn' ? 'সব মুছুন' : 'Clear All'}
            </button>
          )}
        </div>

        {/* SmartChef Instant 1-Ingredient Discovery Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-br from-emerald-50/90 to-stone-50 rounded-2xl border border-emerald-200/80 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-black text-emerald-950 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>
                {language === 'bn'
                  ? 'তাৎক্ষণিক ১-উপাদান স্মার্ট সার্চ (SmartChef স্টাইল):'
                  : 'Instant 1-Ingredient SmartChef Search:'}
              </span>
            </span>
            <span className="text-[11px] font-semibold text-emerald-800">
              {language === 'bn'
                ? '১টি উপাদানই একাধিক রেসিপির জন্য যথেষ্ট'
                : 'Just 1 ingredient returns 4–5 distinct dishes'}
            </span>
          </div>

          <form onSubmit={handleQuickSearchSubmit} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={quickSearchInput}
                onChange={(e) => setQuickSearchInput(e.target.value)}
                placeholder={
                  language === 'bn'
                    ? 'যেকোনো ১টি উপাদান লিখুন (যেমন: শাক, আলু, টমেটো, ডিম, বাঁধাকপি, ফুলকপি)...'
                    : 'Type ANY single ingredient (e.g. Spinach, Potato, Tomato, Egg, Cabbage, Pumpkin)...'
                }
                className="w-full p-3 pl-10 bg-white border border-emerald-300/80 rounded-2xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
              />
              <Search className="w-4 h-4 text-emerald-700 absolute left-3.5 top-3.5" />
            </div>
            <button
              type="submit"
              disabled={loading || !quickSearchInput.trim()}
              className="px-5 py-3 bg-[#1B4332] hover:bg-[#255C45] text-white rounded-2xl text-xs font-black transition-all cursor-pointer shadow-sm flex items-center justify-center space-x-1.5 shrink-0 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{language === 'bn' ? 'রেসিপি খুঁজুন' : 'Find Recipes'}</span>
            </button>
          </form>

          {/* 1-Click Single-Ingredient Discovery Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-bold text-stone-500 mr-1">
              {language === 'bn' ? '১-ক্লিকে খুঁজুন:' : '1-Click Discover:'}
            </span>
            {SINGLE_INGREDIENT_DISCOVERY.map((item) => {
              const target = language === 'bn' ? item.queryBn : item.queryEn;
              const isCurrentSingle =
                ingredientsList.length === 1 &&
                (ingredientsList[0].toLowerCase() === item.queryEn.toLowerCase() ||
                  ingredientsList[0] === item.queryBn);
              return (
                <button
                  key={item.en}
                  type="button"
                  onClick={() => handleInstantSingleSearch(target)}
                  disabled={loading}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                    isCurrentSingle
                      ? 'bg-[#E76F51] text-white border-[#d85c3f] shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-emerald-400 hover:bg-emerald-50/70'
                  }`}
                >
                  {language === 'bn' ? item.bn : item.en}
                </button>
              );
            })}
          </div>
        </div>

        {/* 6 Required Test Case Presets for Instant 1-Click Verification */}
        <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/70 space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-600 block flex items-center space-x-1.5">
            <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
            <span>{language === 'bn' ? 'প্রয়োজনীয় টেস্ট কেস লোডার (১-ক্লিক যাচাই):' : 'Required Test Case Presets (1-Click Test):'}</span>
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIngredientsList(PRESET_TEST_1_SHAK)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer border ${
                JSON.stringify(ingredientsList) === JSON.stringify(PRESET_TEST_1_SHAK)
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                  : 'bg-white text-emerald-900 border-emerald-300 hover:bg-emerald-50'
              }`}
            >
              <span>Test 1: Shak, Onion, Chili</span>
            </button>

            <button
              onClick={() => setIngredientsList(PRESET_TEST_2_EGG_POTATO)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer border ${
                JSON.stringify(ingredientsList) === JSON.stringify(PRESET_TEST_2_EGG_POTATO)
                  ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                  : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-50'
              }`}
            >
              <span>Test 2: Egg, Potato, Onion</span>
            </button>

            <button
              onClick={() => setIngredientsList(PRESET_TEST_3_CHICKEN_RICE)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer border ${
                JSON.stringify(ingredientsList) === JSON.stringify(PRESET_TEST_3_CHICKEN_RICE)
                  ? 'bg-orange-600 text-white border-orange-700 shadow-sm'
                  : 'bg-white text-orange-900 border-orange-300 hover:bg-orange-50'
              }`}
            >
              <span>Test 3: Chicken, Rice</span>
            </button>

            <button
              onClick={() => setIngredientsList(PRESET_TEST_4_FISH_TOMATO)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer border ${
                JSON.stringify(ingredientsList) === JSON.stringify(PRESET_TEST_4_FISH_TOMATO)
                  ? 'bg-cyan-700 text-white border-cyan-800 shadow-sm'
                  : 'bg-white text-cyan-900 border-cyan-300 hover:bg-cyan-50'
              }`}
            >
              <span>Test 4: Fish, Tomato</span>
            </button>

            <button
              onClick={() => setIngredientsList(PRESET_TEST_5_RICE_ONLY)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer border ${
                JSON.stringify(ingredientsList) === JSON.stringify(PRESET_TEST_5_RICE_ONLY)
                  ? 'bg-teal-700 text-white border-teal-800 shadow-sm'
                  : 'bg-white text-teal-900 border-teal-300 hover:bg-teal-50'
              }`}
            >
              <span>Test 5: Rice Only</span>
            </button>

            <button
              onClick={() => setIngredientsList(PRESET_TEST_6_BANGLA)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer border ${
                JSON.stringify(ingredientsList) === JSON.stringify(PRESET_TEST_6_BANGLA)
                  ? 'bg-purple-700 text-white border-purple-800 shadow-sm'
                  : 'bg-white text-purple-900 border-purple-300 hover:bg-purple-50'
              }`}
            >
              <span>Test 6: বাংলা ইনপুট (শাক, পেঁয়াজ)</span>
            </button>
          </div>
        </div>

        {/* Common Quick Chips */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-2">
            {language === 'bn' ? 'ঝটপট যোগ করার প্রধান উপকরণ:' : 'Quick Add Popular Ingredients:'}
          </span>
          <div className="flex flex-wrap gap-2">
            {COMMON_PANTRY_CHIPS.map((chip, idx) => {
              const isSelected = ingredientsList.some(
                (i) => i.toLowerCase() === chip.en.toLowerCase() || i === chip.bn
              );
              return (
                <button
                  key={idx}
                  onClick={() => handleToggleChip(chip.en)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center space-x-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-sm'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <span>{language === 'bn' ? chip.bn : chip.en}</span>
                  {isSelected ? (
                    <X className="w-3 h-3 text-emerald-300" />
                  ) : (
                    <Plus className="w-3 h-3 text-stone-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Input with Autocomplete Dropdown */}
        <div className="relative">
          <form onSubmit={handleAddCustom} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={customInput}
                onChange={(e) => {
                  setCustomInput(e.target.value);
                  setShowAutocomplete(true);
                }}
                onFocus={() => setShowAutocomplete(true)}
                placeholder={
                  language === 'bn'
                    ? 'উপাদান খুঁজুন বা নতুন লিখুন (যেমন: শাক, আলু, ডিম, মুরগি, চাল, টমেটো)...'
                    : 'Search or type ingredient in English or Bangla (e.g. Shak, Egg, Potato, Rice)...'
                }
                className="w-full p-3 pl-10 bg-stone-50 border border-stone-200 rounded-2xl text-xs sm:text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            </div>
            <button
              type="submit"
              className="px-5 py-3 bg-[#1B4332] hover:bg-[#255C45] text-white rounded-2xl text-xs font-bold transition-colors cursor-pointer shadow-sm flex items-center space-x-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addIngredient}</span>
            </button>
          </form>

          {/* Autocomplete Suggestions Box */}
          {showAutocomplete && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-stone-200 shadow-xl z-30 p-2 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-3 py-1 block">
                {language === 'bn' ? 'পরামর্শ:' : 'Suggested Ingredients:'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(s)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 flex items-center justify-between transition-colors text-xs cursor-pointer group"
                  >
                    <div>
                      <span className="font-bold text-stone-900 group-hover:text-emerald-900">
                        {language === 'bn' ? s.nameBn : s.nameEn}
                      </span>
                      <span className="text-[11px] text-stone-400 ml-2">
                        {language === 'bn' ? s.nameEn : s.nameBn}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 capitalize">
                      {s.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selected Ingredients Pill Bag & Pantry Summary */}
        <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100/90 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-950 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>
                {language === 'bn'
                  ? `হাতে থাকা নির্বাচিত উপাদান (${ingredientsList.length}টি):`
                  : `Available Ingredients in Your Kitchen (${ingredientsList.length}):`}
              </span>
            </span>

            {/* Mandatory Staples Badges */}
            <div className="flex flex-wrap gap-1.5">
              {kitchenAnalysis.hasShak && (
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-950 border border-emerald-300">
                  {language === 'bn' ? 'শাক মূল উপাদান (Shak Main)' : 'Shak Main'}
                </span>
              )}
              {kitchenAnalysis.hasPotato && (
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-yellow-200 text-yellow-950 border border-yellow-300">
                  {language === 'bn' ? 'আলু মূল উপাদান (Potato Main)' : 'Potato Main'}
                </span>
              )}
              {kitchenAnalysis.hasTomato && (
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-950 border border-rose-300">
                  {language === 'bn' ? 'টমেটো মূল উপাদান (Tomato Main)' : 'Tomato Main'}
                </span>
              )}
              {kitchenAnalysis.hasCabbage && (
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-lime-200 text-lime-950 border border-lime-300">
                  {language === 'bn' ? 'বাঁধাকপি মূল উপাদান (Cabbage Main)' : 'Cabbage Main'}
                </span>
              )}
              {kitchenAnalysis.hasCauliflower && (
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-stone-200 text-stone-900 border border-stone-300">
                  {language === 'bn' ? 'ফুলকপি মূল উপাদান (Cauliflower Main)' : 'Cauliflower Main'}
                </span>
              )}
              {kitchenAnalysis.hasPumpkin && (
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 border border-amber-300">
                  {language === 'bn' ? 'মিষ্টি কুমড়া মূল উপাদান (Pumpkin Main)' : 'Pumpkin Main'}
                </span>
              )}
              {kitchenAnalysis.hasEgg && (
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 border border-amber-300">
                  {language === 'bn' ? 'ডিম মূল উপাদান (Egg Main)' : 'Egg Main'}
                </span>
              )}
              {kitchenAnalysis.hasRice && (
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-teal-200 text-teal-900 border border-teal-300">
                  {language === 'bn' ? 'চাল মূল উপাদান (Rice Main)' : 'Rice Main'}
                </span>
              )}
              {kitchenAnalysis.hasChicken && (
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-orange-200 text-orange-950 border border-orange-300">
                  {language === 'bn' ? 'চিকেন মূল উপাদান (Chicken Main)' : 'Chicken Main'}
                </span>
              )}
              {kitchenAnalysis.hasFish && (
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-200 text-cyan-950 border border-cyan-300">
                  {language === 'bn' ? 'মাছ মূল উপাদান (Fish Main)' : 'Fish Main'}
                </span>
              )}
            </div>
          </div>

          {ingredientsList.length === 0 ? (
            <p className="text-xs text-stone-400 italic">
              {language === 'bn'
                ? 'কোনো উপাদান নির্বাচিত নেই। ওপরের বোতাম বা ইনপুট ব্যবহার করুন।'
                : 'No ingredients selected yet. Click any chip above to begin.'}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {ingredientsList.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#1B4332] text-white text-xs font-bold shadow-xs"
                >
                  <span>{item}</span>
                  <button
                    onClick={() => handleRemove(item)}
                    className="hover:text-rose-300 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Cuisine & Dietary Preferences */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t.selectCuisine}
            </label>
            <select
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-medium cursor-pointer"
            >
              <option value="Bangladeshi">Bangladeshi (বাংলাদেশি)</option>
              <option value="Indian">Indian (ভারতীয়)</option>
              <option value="Nepali">Nepali (নেপালি)</option>
              <option value="Chinese">Chinese (চাইনিজ)</option>
              <option value="Japanese">Japanese (জাপানি)</option>
              <option value="Italian">Italian (ইতালীয়)</option>
              <option value="Thai">Thai (থাই)</option>
              <option value="Mediterranean">Mediterranean (ভূমধ্যসাগরীয়)</option>
              <option value="Any">Any International (যেকোনো)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t.dietaryPreference}
            </label>
            <select
              value={dietaryPref}
              onChange={(e) => setDietaryPref(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-medium cursor-pointer"
            >
              <option value="Any">Balanced & Halal (সাধারণ ও সুষম)</option>
              <option value="Vegetarian">Vegetarian (নিরামিষ)</option>
              <option value="High-Protein">High-Protein (উচ্চ প্রোটিন)</option>
              <option value="Gluten-Free">Gluten-Free (গ্লুটেন মুক্ত)</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading || ingredientsList.length === 0}
          className="w-full py-4 bg-[#E76F51] hover:bg-[#d85c3f] text-white rounded-2xl text-xs sm:text-sm font-black shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>{language === 'bn' ? 'উপাদান বিশ্লেষণ ও রেসিপি যাচাই হচ্ছে...' : 'Analyzing Ingredients & Validating Feasibility...'}</span>
            </div>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{t.generateRecipes}</span>
            </>
          )}
        </button>
      </div>

      {/* Error / Feasibility Warning Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center space-x-2.5 shadow-xs">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Generated Recipes List */}
      {recipes && recipes.length > 0 && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-xl font-black text-stone-900 tracking-tight flex items-center space-x-2">
              <ChefHat className="w-5 h-5 text-emerald-700" />
              <span>
                {language === 'bn'
                  ? 'আপনার উপকরণের ভিত্তিতে যাচাইকৃত স্মার্ট রেসিপি'
                  : 'Smart Ingredient-Validated Feasible Recipes'}
              </span>
            </h2>
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <div className="inline-flex bg-white p-0.5 rounded-lg border border-stone-200 shadow-2xs text-[11px]">
                <button
                  type="button"
                  onClick={() => setBilingualCardMode('both')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                    bilingualCardMode === 'both'
                      ? 'bg-[#1B4332] text-white'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  EN + বাংলা
                </button>
                <button
                  type="button"
                  onClick={() => setBilingualCardMode('bn')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                    bilingualCardMode === 'bn'
                      ? 'bg-[#1B4332] text-white'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  বাংলা
                </button>
                <button
                  type="button"
                  onClick={() => setBilingualCardMode('en')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                    bilingualCardMode === 'en'
                      ? 'bg-[#1B4332] text-white'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  English
                </button>
              </div>
              <span className="text-xs text-stone-600 font-bold bg-stone-100 px-3 py-1 rounded-lg">
                {filteredRecipes.length} / {recipes.length}{' '}
                {language === 'bn' ? 'টি রেসিপি প্রদর্শিত' : 'recipes shown'}
              </span>
            </div>
          </div>

          {/* SmartChef 5-Category Result Filter Tabs */}
          <div className="flex flex-wrap gap-2 p-2 bg-stone-100/80 rounded-2xl border border-stone-200/70">
            {(
              [
                {
                  id: 'all' as ResultFilter,
                  labelEn: 'All Recipes',
                  labelBn: 'সব রেসিপি',
                  count: filterCounts.all,
                },
                {
                  id: 'quick' as ResultFilter,
                  labelEn: 'Quick Recipes',
                  labelBn: 'চটজলদি রান্না',
                  count: filterCounts.quick,
                },
                {
                  id: 'healthy' as ResultFilter,
                  labelEn: 'Healthy Recipes',
                  labelBn: 'স্বাস্থ্যকর রেসিপি',
                  count: filterCounts.healthy,
                },
                {
                  id: 'traditional' as ResultFilter,
                  labelEn: 'Traditional Bangladeshi',
                  labelBn: 'ঐতিহ্যবাহী বাংলাদেশি',
                  count: filterCounts.traditional,
                },
                {
                  id: 'less_ingredients' as ResultFilter,
                  labelEn: 'Less Ingredient Recipes',
                  labelBn: 'কম উপকরণ',
                  count: filterCounts.less_ingredients,
                },
              ]
            ).map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-[#1B4332] text-white shadow-sm'
                      : 'bg-white text-stone-700 hover:bg-emerald-50 border border-stone-200/80'
                  }`}
                >
                  <span>{language === 'bn' ? tab.labelBn : tab.labelEn}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                      isActive ? 'bg-emerald-700 text-emerald-100' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {filteredRecipes.length === 0 ? (
            <div className="p-6 bg-stone-50 border border-stone-200 rounded-2xl text-center space-y-2">
              <p className="text-sm font-bold text-stone-700">
                {language === 'bn'
                  ? 'এই ফিল্টার ক্যাটাগরিতে কোনো রেসিপি নেই। সব রেসিপি দেখতে "সব রেসিপি" ট্যাবে ক্লিক করুন।'
                  : 'No recipes match this specific filter. Switch back to "All Recipes" to see all verified dishes.'}
              </p>
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className="px-4 py-1.5 bg-[#1B4332] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                {language === 'bn' ? 'সব রেসিপি দেখুন' : 'Show All Recipes'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredRecipes.map((recipe) => {
              const recipeId =
                recipe.recipeId ||
                recipe.id ||
                `rec-${(recipe.recipeName || 'dish').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
              const trackedImage = recipeImagesById[recipeId]?.url;
              const imageSrc =
                trackedImage ||
                recipe.imageUrl ||
                recipe.image ||
                resolveRecipeImage({ ...recipe, recipeId, id: recipeId });
              const availableItems = recipe.availableIngredients || recipe.usedIngredients || [];
              const optionalItems = recipe.optionalIngredients || [];
              const missingItems = recipe.missingIngredients || [];
              const availabilityPercent =
                recipe.ingredientAvailabilityPercentage ??
                Math.round(
                  (availableItems.length /
                    Math.max(1, availableItems.length + missingItems.length)) *
                    100
                );

              return (
                <div
                  key={recipeId}
                  data-recipe-id={recipeId}
                  className="group bg-white rounded-3xl overflow-hidden border border-emerald-950/10 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Recipe Image Banner */}
                  <div
                    className="relative h-56 w-full overflow-hidden cursor-pointer bg-stone-100"
                    onClick={() =>
                      handleOpenRecipeModal({
                        ...recipe,
                        image: imageSrc,
                        imageUrl: imageSrc,
                      })
                    }
                  >
                    <img
                      key={`${recipeId}:${imageSrc}`}
                      src={imageSrc}
                      alt={language === 'bn' ? recipe.recipeNameBn : recipe.recipeName}
                      referrerPolicy="no-referrer"
                      onError={() => {
                        setRecipeImagesById((prev) => ({
                          ...prev,
                          [recipeId]: {
                            ...(prev[recipeId] || { query: recipe.imageSearchQuery || '' }),
                            url: '/images/food-placeholder.jpg',
                            status: 'error',
                          },
                        }));
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                    {/* Cuisine & Difficulty Badges */}
                    <div className="absolute top-3 left-3 flex items-center space-x-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#1B4332]/90 backdrop-blur-md text-white shadow-sm">
                        {language === 'bn' ? translateCuisineToBn(recipe.cuisine) : recipe.cuisine}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 backdrop-blur-md text-stone-800 shadow-sm capitalize">
                        {language === 'bn' ? translateMealTypeToBn(recipe.mealType) : recipe.mealType}
                      </span>
                    </div>

                    {/* Ingredient Availability Percentage Badge */}
                    <div className="absolute top-3 right-3 flex items-center space-x-1.5">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black text-white shadow-md backdrop-blur-md flex items-center space-x-1 ${
                          availabilityPercent >= 80
                            ? 'bg-emerald-600/95'
                            : availabilityPercent >= 50
                            ? 'bg-amber-600/95'
                            : 'bg-rose-600/95'
                        }`}
                      >
                        <Percent className="w-3 h-3" />
                        <span>
                          {availabilityPercent}% {language === 'bn' ? 'উপাদান মজুত' : 'Available'}
                        </span>
                      </span>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm ${
                          recipe.difficulty === 'Hard'
                            ? 'bg-rose-500 text-white'
                            : recipe.difficulty === 'Medium'
                            ? 'bg-amber-500 text-white'
                            : 'bg-emerald-700 text-white'
                        }`}
                      >
                        {recipe.difficulty || 'Easy'}
                      </span>
                    </div>

                    {/* Bottom Metadata inside Image */}
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs font-semibold">
                      <span className="flex items-center space-x-1.5">
                        <Clock className="w-4 h-4 text-emerald-300" />
                        <span>
                          {recipe.prepTimeMinutes + recipe.cookTimeMinutes}{' '}
                          {language === 'bn' ? 'মিনিট' : 'mins'}
                        </span>
                      </span>

                      <span className="flex items-center space-x-1.5">
                        <Users className="w-4 h-4 text-emerald-300" />
                        <span>
                          {recipe.servings} {language === 'bn' ? 'জন' : 'servings'}
                        </span>
                      </span>

                      <span className="flex items-center space-x-1 font-bold text-amber-300 text-sm">
                        <Flame className="w-4 h-4" />
                        <span>{recipe.caloriesPerServing} kcal</span>
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* Title Header */}
                      <div>
                        <h3
                          onClick={() => handleOpenRecipeModal(recipe)}
                          className="font-black text-stone-900 text-lg hover:text-emerald-700 transition-colors cursor-pointer"
                        >
                          {language === 'bn' ? recipe.recipeNameBn : recipe.recipeName}
                        </h3>
                        <p className="text-xs text-stone-400 font-medium">
                          {language === 'bn' ? recipe.recipeName : recipe.recipeNameBn}
                        </p>
                      </div>

                      {/* Macronutrients Grid */}
                      <div className="grid grid-cols-4 gap-2 text-center text-xs p-2.5 bg-stone-50 rounded-2xl border border-stone-200/60">
                        <div>
                          <span className="text-[10px] text-stone-500 block">Prep/Cook</span>
                          <span className="font-bold text-stone-800">
                            {recipe.prepTimeMinutes}m / {recipe.cookTimeMinutes}m
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-500 block">Protein</span>
                          <span className="font-bold text-emerald-700">{recipe.proteinGrams}g</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-500 block">Carbs</span>
                          <span className="font-bold text-amber-700">{recipe.carbsGrams}g</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-500 block">Fat</span>
                          <span className="font-bold text-orange-700">{recipe.fatGrams}g</span>
                        </div>
                      </div>

                      {/* 3-Tier Ingredient Breakdown: Available vs Optional vs Missing */}
                      <div className="space-y-2.5">
                        {/* A. Available Ingredients (Provided by User) */}
                        <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-emerald-950 text-xs flex items-center space-x-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                              <span>{language === 'bn' ? 'ক. হাতে থাকা উপাদান (Available)' : 'A. Available Ingredients'}</span>
                            </span>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-full">
                              {availableItems.length} {language === 'bn' ? 'টি উপস্থিত' : 'present'}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {availableItems.map((item, i) => {
                              const bnItem = hasBanglaText(item) ? item : translateIngredientToBn(item);
                              const label =
                                bilingualCardMode === 'bn'
                                  ? bnItem
                                  : bilingualCardMode === 'en'
                                  ? item
                                  : bnItem !== item
                                  ? `${item} · ${bnItem}`
                                  : item;
                              return (
                                <span
                                  key={i}
                                  className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-white text-emerald-900 text-[11px] font-bold border border-emerald-300 shadow-2xs"
                                >
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>{label}</span>
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {/* B. Optional Flavor Enhancing Ingredients */}
                        {optionalItems.length > 0 && (
                          <div className="p-3 bg-sky-50/60 rounded-2xl border border-sky-200/70 space-y-1.5">
                            <span className="font-extrabold text-sky-950 text-xs flex items-center space-x-1.5">
                              <Leaf className="w-4 h-4 text-sky-700 shrink-0" />
                              <span>{language === 'bn' ? 'খ. ঐচ্ছিক উপাদান (Optional)' : 'B. Optional Flavor Enhancers'}</span>
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {optionalItems.map((item, i) => {
                                const bnItem = hasBanglaText(item) ? item : translateIngredientToBn(item);
                                const label =
                                  bilingualCardMode === 'bn'
                                    ? bnItem
                                    : bilingualCardMode === 'en'
                                    ? item
                                    : bnItem !== item
                                    ? `${item} · ${bnItem}`
                                    : item;
                                return (
                                  <span
                                    key={i}
                                    className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-white text-sky-900 text-[11px] font-medium border border-sky-200 shadow-2xs"
                                  >
                                    <span>{label}</span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* C. Missing Essential Ingredients */}
                        {missingItems.length > 0 ? (
                          <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-amber-950 text-xs flex items-center space-x-1.5">
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>{language === 'bn' ? 'গ. প্রয়োজনীয় ঘাটতি উপাদান (Missing)' : 'C. Missing Essential Ingredients'}</span>
                              </span>
                              <button
                                onClick={() => handleAddMissingToGrocery(missingItems, recipe.recipeName)}
                                className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900 flex items-center space-x-1 underline cursor-pointer"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>{language === 'bn' ? 'বাজারে যোগ করুন' : 'Add to Grocery'}</span>
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {missingItems.map((item, i) => {
                                const bnItem = hasBanglaText(item) ? item : translateIngredientToBn(item);
                                const label =
                                  bilingualCardMode === 'bn'
                                    ? bnItem
                                    : bilingualCardMode === 'en'
                                    ? item
                                    : bnItem !== item
                                    ? `${item} · ${bnItem}`
                                    : item;
                                return (
                                  <span
                                    key={i}
                                    className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-white text-amber-900 text-[11px] font-bold border border-amber-300 shadow-2xs"
                                  >
                                    <span>• {label}</span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="p-2.5 bg-emerald-100/60 rounded-xl border border-emerald-200 text-emerald-900 text-[11px] font-bold flex items-center space-x-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                            <span>
                              {language === 'bn'
                                ? '১০০% উপাদান আপনার রান্নাঘরে বিদ্যমান! অতিরিক্ত কোনো কেনাকাটা লাগবে না।'
                                : '100% ingredients ready in your kitchen! No extra grocery needed.'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Smart Alternative Suggestions */}
                      {recipe.substitutes && recipe.substitutes.length > 0 && (
                        <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/70 space-y-1 text-xs">
                          <span className="font-bold text-stone-800 flex items-center space-x-1.5 text-xs">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>{language === 'bn' ? 'স্মার্ট বিকল্প পরামর্শ (Smart Substitutes):' : 'Smart Alternative Suggestions:'}</span>
                          </span>
                          <ul className="list-disc list-inside text-stone-600 text-[11px] space-y-0.5">
                            {recipe.substitutes.map((sub, i) => (
                              <li key={i}>{sub}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Food Waste Reduction Tip */}
                      {(recipe.foodWasteTip || recipe.foodWasteTipBn) && (
                        <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-200/60 text-xs text-stone-700 space-y-0.5">
                          <span className="font-extrabold text-emerald-950 flex items-center space-x-1.5 text-xs">
                            <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{language === 'bn' ? 'খাবার অপচয় রোধে পরামর্শ:' : 'Zero-Waste Kitchen Tip:'}</span>
                          </span>
                          <p className="text-[11px] text-stone-600 leading-relaxed pl-5">
                            {language === 'bn' ? recipe.foodWasteTipBn : recipe.foodWasteTip}
                          </p>
                        </div>
                      )}

                      {/* Step-by-Step Cooking Instructions (Bilingual Bangla & English) */}
                      <div className="text-xs space-y-2 pt-1">
                        <span className="font-bold text-stone-900 block flex items-center space-x-1.5">
                          <ChefHat className="w-4 h-4 text-emerald-700" />
                          <span>
                            {bilingualCardMode === 'both'
                              ? language === 'bn'
                                ? 'রান্নার প্রণালী (Cooking Steps)'
                                : 'Cooking Instructions (রান্নার প্রণালী)'
                              : t.instructions}
                            :
                          </span>
                        </span>
                        <ol className="space-y-2 bg-stone-50 p-3 rounded-2xl border border-stone-200/50 text-[11px]">
                          {recipe.instructions.map((enStep, i) => {
                            const rawBn = recipe.instructionsBn?.[i];
                            const bnStep =
                              rawBn && hasBanglaText(rawBn)
                                ? rawBn
                                : translateCookingStepToBn(enStep);
                            const bnFirst = language === 'bn';
                            const primary =
                              bilingualCardMode === 'bn'
                                ? bnStep
                                : bilingualCardMode === 'en'
                                ? enStep
                                : bnFirst
                                ? bnStep
                                : enStep;
                            const secondary =
                              bilingualCardMode === 'both' ? (bnFirst ? enStep : bnStep) : '';
                            const secLabel = bnFirst ? 'EN' : 'বাংলা';

                            return (
                              <li key={i} className="leading-relaxed border-b last:border-b-0 border-stone-200/60 pb-1.5 last:pb-0">
                                <div className="font-medium text-stone-800">
                                  <span className="font-bold text-emerald-800 mr-1.5">
                                    {language === 'bn' ? toBanglaDigits(i + 1) : i + 1}.
                                  </span>
                                  {primary}
                                </div>
                                {secondary && secondary !== primary && (
                                  <div className="text-stone-500 pl-4 mt-0.5">
                                    <span className="font-bold text-emerald-700 mr-1">{secLabel}:</span>
                                    {secondary}
                                  </div>
                                )}
                              </li>
                            );
                          })}
                        </ol>
                      </div>

                      {/* Health Highlight */}
                      <div className="p-3 bg-emerald-50/60 rounded-2xl text-stone-700 text-xs border border-emerald-100/80">
                        <span className="font-bold text-emerald-900 block mb-0.5">
                          {language === 'bn' ? 'পুষ্টি উপাদান ও স্বাস্থ্য সুফল:' : 'Nutrition Benefit:'}
                        </span>
                        <span className="text-[11px]">
                          {language === 'bn' ? recipe.healthHighlightBn : recipe.healthHighlight}
                        </span>
                      </div>
                    </div>

                    {/* View Details Action Button */}
                    <div className="pt-4 border-t border-stone-100">
                      <button
                        onClick={() => handleOpenRecipeModal(recipe)}
                        className="w-full py-3 px-4 bg-[#1B4332] hover:bg-[#255C45] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
                      >
                        <span>{language === 'bn' ? 'সম্পূর্ণ প্রণালী ও বিবরণ দেখুন' : 'View Full Recipe & Cooking Steps'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
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

      {/* Empty State when 0 recipes matched */}
      {recipes !== null && recipes.length === 0 && !loading && (
        <div className="p-8 bg-amber-50/70 border border-amber-200/80 rounded-3xl text-center space-y-3 shadow-xs">
          <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto" />
          <p className="text-base sm:text-lg font-black text-stone-900">
            {language === 'bn'
              ? 'আপনার দেওয়া উপকরণ দিয়ে উপযুক্ত রেসিপি তৈরি করা সম্ভব হচ্ছে না। কিছু অতিরিক্ত উপকরণ যোগ করুন।'
              : 'It is not possible to prepare a suitable recipe with your provided ingredients. Please add some additional ingredients.'}
          </p>
          <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
            {language === 'bn'
              ? 'অনুগ্রহ করে শাক, আলু, ডিম, চাল, ডাল, টমেটো বা মুরগির মতো কোনো প্রধান খাদ্য উপাদান নির্বাচন করে পুনরায় রেসিপি খুঁজুন।'
              : 'Please add staple ingredients like Shak, Potato, Egg, Rice, Lentils, Tomato, or Chicken to generate authentic culinary dishes.'}
          </p>
        </div>
      )}
    </div>
  );
};
