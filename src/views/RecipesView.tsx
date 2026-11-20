import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { RECIPES_DATABASE, Recipe } from '../data/recipesData';
import {
  analyzeUniversalQuery,
  expandBilingualTokens,
  normalizeBengaliText,
  STRICT_DISH_ANCHORS,
} from '../utils/searchNormalizer';
import { resolveRecipeImage } from '../utils/recipeImageResolver';
import { translateCategoryToBn } from '../utils/bilingualRecipeTranslator';
import {
  formatCountryLabel,
  normalizeCountryKey,
  recipeMatchesCountry,
  SUPPORTED_COUNTRIES,
} from '../utils/countryNormalizer';
import {
  Search,
  Heart,
  Clock,
  Flame,
  Sparkles,
  X,
  ChefHat,
  Loader2,
  Globe,
  AlertCircle,
  RefreshCw,
  ArrowDownCircle,
  CheckCircle2,
  Tag,
} from 'lucide-react';

interface AutocompleteSuggestion {
  text: string;
  sublabel: string;
  type: 'recipe' | 'ingredient' | 'category' | 'correction';
}

interface UniversalSearchMeta {
  query: string;
  correctedQuery: string;
  wasCorrected: boolean;
  intent: 'empty' | 'broad' | 'specific' | 'diet';
  dietIntent?: string;
  dietSummary?: string;
  dietSummaryBn?: string;
  totalCount: number;
  exactCount: number;
  relatedCount: number;
  page: number;
  hasMore: boolean;
  availableCuisines: string[];
  availableCountries: string[];
  suggestedQueries: string[];
  sourcesUsed: string[];
  externalApiAvailable?: boolean;
  emptyCountryMessage?: string;
}

const DEFAULT_COUNTRIES = SUPPORTED_COUNTRIES;

const QUICK_SEARCH_CHIPS_EN = [
  'Khichuri',
  'Momo',
  'Pizza',
  'Ramen',
  'Sushi',
  'Dosa',
  'Bibimbap',
  'Pad Thai',
  'Tacos',
  'Biryani',
];

const QUICK_SEARCH_CHIPS_BN = [
  'খিচুড়ি',
  'মোমো',
  'পিজ্জা',
  'বিরিয়ানি',
  'বাঁধাকপি',
  'রামেন',
  'দোসা',
  'নুডুলস',
  'শাক',
  'মাছ',
];

const DIET_QUICK_CHIPS_EN = [
  'Healthy Breakfast',
  'Diet Food',
  'High Protein Food',
  'High Fiber Food',
  'Low-Sugar Meal',
  'Vegetable Recipes',
];

const DIET_QUICK_CHIPS_BN = [
  'স্বাস্থ্যকর নাস্তা',
  'ডায়েট খাবার',
  'হাই প্রোটিন',
  'হাই ফাইবার',
  'কম চিনি',
  'সবজি রেসিপি',
];

export const RecipesView: React.FC = () => {
  const {
    language,
    t,
    selectedCuisineFilter,
    setSelectedCuisineFilter,
    recipesFilters,
    setRecipesFilters,
    setSelectedRecipe,
    toggleFavorite,
    isFavorite,
    favorites,
    favoriteRecipesMap,
    searchQuery,
    setSearchQuery,
    addSearchHistory,
  } = useApp();

  const selectedMealType = recipesFilters.mealType;
  const dietaryTag = recipesFilters.dietaryTag;
  const maxTime = recipesFilters.maxTime;
  const onlyFavorites = recipesFilters.onlyFavorites;

  const setSelectedMealType = useCallback(
    (mealType: string) => setRecipesFilters((prev) => ({ ...prev, mealType })),
    [setRecipesFilters]
  );
  const setDietaryTag = useCallback(
    (dietaryTagVal: string) => setRecipesFilters((prev) => ({ ...prev, dietaryTag: dietaryTagVal })),
    [setRecipesFilters]
  );
  const setMaxTime = useCallback(
    (maxTimeVal: number) => setRecipesFilters((prev) => ({ ...prev, maxTime: maxTimeVal })),
    [setRecipesFilters]
  );
  const setOnlyFavorites = useCallback(
    (next: boolean | ((prev: boolean) => boolean)) =>
      setRecipesFilters((prev) => ({
        ...prev,
        onlyFavorites: typeof next === 'function' ? next(prev.onlyFavorites) : next,
      })),
    [setRecipesFilters]
  );

  const activeCountryFilter = useMemo(
    () => normalizeCountryKey(selectedCuisineFilter),
    [selectedCuisineFilter]
  );

  // Live Universal Search states
  const [recipes, setRecipes] = useState<Recipe[]>(RECIPES_DATABASE);
  const [meta, setMeta] = useState<UniversalSearchMeta>({
    query: '',
    correctedQuery: '',
    wasCorrected: false,
    intent: 'empty',
    totalCount: RECIPES_DATABASE.length,
    exactCount: RECIPES_DATABASE.length,
    relatedCount: 0,
    page: 1,
    hasMore: false,
    availableCuisines: DEFAULT_COUNTRIES,
    availableCountries: DEFAULT_COUNTRIES,
    suggestedQueries: QUICK_SEARCH_CHIPS_EN.slice(0, 6),
    sourcesUsed: ['AaharIQ Curated DB'],
    externalApiAvailable: true,
    emptyCountryMessage: undefined,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Autocomplete dropdown state
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const resultsAnchorRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const activeAbortRef = useRef<AbortController | null>(null);
  const prevSearchQueryRef = useRef<string>(searchQuery);

  // Local fallback search helper in case network is temporarily unreachable
  const runLocalFallback = useCallback(
    (q: string) => {
      const analysis = analyzeUniversalQuery(q);
      const normCore = normalizeBengaliText(analysis.englishQuery);
      const normalizedQ = normalizeBengaliText(analysis.correctedQuery || q);
      const queryWords = normCore
        .split(/\s+/)
        .filter((w) => w && w !== 'style' && w !== 'recipe' && w !== 'recipes' && w !== 'dish');
      const detectedAnchors = STRICT_DISH_ANCHORS.filter((a) => queryWords.includes(a));
      const asksVegetablePizza =
        detectedAnchors.includes('pizza') &&
        (queryWords.includes('vegetable') || queryWords.includes('vegetarian') || queryWords.includes('veggie'));
      const nonAnchorModifiers = queryWords.filter((w) => !STRICT_DISH_ANCHORS.includes(w));
      const rawExpanded = q ? expandBilingualTokens(analysis.correctedQuery || q) : [];
      const effectiveExpanded =
        queryWords.length > 1 && detectedAnchors.length > 0
          ? rawExpanded.filter((tok) => !nonAnchorModifiers.includes(tok))
          : rawExpanded;

      const list = RECIPES_DATABASE.filter((r) => {
        if (activeCountryFilter && !recipeMatchesCountry(r, activeCountryFilter)) return false;
        if (selectedMealType !== 'all' && r.mealType !== selectedMealType) return false;
        if (dietaryTag === 'vegetarian' && !r.isVegetarian) return false;
        if (dietaryTag === 'vegan' && !r.isVegan) return false;
        if (dietaryTag === 'halal' && !r.isHalal) return false;
        if (dietaryTag === 'glutenFree' && !r.isGlutenFree) return false;
        if (r.prepTime + r.cookTime > maxTime) return false;
        if (!normalizedQ) return true;
        if (asksVegetablePizza && !r.isVegetarian) return false;

        if (analysis.intent === 'diet' && analysis.dietIntent) {
          const protein = r.proteinPerServing || 0;
          const fiber = r.fiberPerServing || 0;
          const sugar = typeof r.sugarPerServing === 'number' ? r.sugarPerServing : 3.5;
          const cal = r.caloriesPerServing || 0;
          if (analysis.dietIntent === 'high_protein') return protein >= 20;
          if (analysis.dietIntent === 'high_fiber') return fiber >= 4.5;
          if (analysis.dietIntent === 'low_sugar') return sugar <= 6 && protein >= 8;
          if (analysis.dietIntent === 'healthy_breakfast') return r.mealType === 'breakfast' && protein >= 8;
          if (analysis.dietIntent === 'healthy_lunch') return (r.mealType === 'lunch' || r.mealType === 'dinner') && protein >= 12 && cal <= 640;
          if (analysis.dietIntent === 'healthy_dinner') return (r.mealType === 'dinner' || r.mealType === 'lunch') && protein >= 12 && cal <= 560;
          if (analysis.dietIntent === 'nutritious_snacks') return (r.mealType === 'snack' || cal <= 340) && fiber >= 2;
          if (analysis.dietIntent === 'vegetable_recipes') return r.isVegetarian;
          return protein >= 11 && fiber >= 2.8 && cal <= 620 && sugar < 10;
        }

        const titleCat = normalizeBengaliText(
          `${r.name} ${r.nameBn} ${r.category || ''} ${(r.keywords || []).join(' ')}`
        );
        const hay = normalizeBengaliText(
          `${titleCat} ${r.cuisine} ${r.country || ''} ${r.regionalStyle || ''} ${r.description} ${(r.tags || []).join(' ')} ${r.ingredients.map((i) => `${i.name} ${i.nameBn}`).join(' ')}`
        );

        if (detectedAnchors.length > 0) {
          const anchorHit = detectedAnchors.some((anchor) => {
            if (anchor === 'pizza') return titleCat.includes('pizza') || titleCat.includes('margherita') || titleCat.includes('পিজ্জা');
            if (anchor === 'margherita') return titleCat.includes('margherita') || titleCat.includes('মার্গারিটা');
            if (anchor === 'pasta') return titleCat.includes('pasta') || titleCat.includes('spaghetti') || titleCat.includes('fettuccine') || titleCat.includes('penne') || titleCat.includes('পাস্তা');
            if (anchor === 'biryani' || anchor === 'biriyani') return titleCat.includes('biryani') || titleCat.includes('kacchi') || titleCat.includes('বিরিযানি');
            if (anchor === 'noodles' || anchor === 'noodle') return titleCat.includes('noodle') || titleCat.includes('ramen') || titleCat.includes('নুডুলস');
            if (anchor === 'ramen') return titleCat.includes('ramen') || titleCat.includes('noodle') || titleCat.includes('রামেন');
            if (anchor === 'cabbage' || anchor === 'bandhakopi') return hay.includes('cabbage') || hay.includes('bandhakopi') || hay.includes('বাঁধাকপি');
            if (anchor === 'momo' || anchor === 'dumpling' || anchor === 'dumplings') return titleCat.includes('momo') || titleCat.includes('dumpling') || titleCat.includes('মোমো');
            if (anchor === 'taco' || anchor === 'tacos') return titleCat.includes('taco');
            if (anchor === 'dal') return titleCat.includes('dal') || titleCat.includes('daal') || titleCat.includes('lentil') || titleCat.includes('ডাল');
            return titleCat.includes(anchor) || hay.includes(anchor);
          });
          if (!anchorHit) return false;
          return true;
        }

        return hay.includes(normalizedQ) || effectiveExpanded.some((tok) => tok && hay.includes(tok));
      });
      setRecipes(list);
      setMeta((prev) => ({
        ...prev,
        query: q,
        correctedQuery: analysis.correctedQuery || q,
        wasCorrected: analysis.wasCorrected,
        intent: analysis.intent,
        dietIntent: analysis.dietIntent,
        totalCount: list.length,
        exactCount: list.length,
        relatedCount: 0,
        page: 1,
        hasMore: false,
        sourcesUsed: ['AaharIQ Curated DB (Local Fallback)'],
        externalApiAvailable: false,
        emptyCountryMessage:
          activeCountryFilter && list.length === 0
            ? language === 'bn'
              ? `${formatCountryLabel(activeCountryFilter, 'bn')}-এর জন্য কোনো মিল পাওয়া যায়নি।`
              : `No matching recipe found for ${formatCountryLabel(activeCountryFilter, 'en')}.`
            : undefined,
      }));
    },
    [activeCountryFilter, selectedMealType, dietaryTag, maxTime, language]
  );

  // Core universal search request
  const executeUniversalSearch = useCallback(
    async (pageNum: number, append: boolean, explicitQuery?: string) => {
      if (onlyFavorites) return;

      const activeQ = (explicitQuery !== undefined ? explicitQuery : searchQuery).trim();

      if (activeAbortRef.current) {
        activeAbortRef.current.abort();
      }
      const controller = new AbortController();
      activeAbortRef.current = controller;

      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setSearchError(null);

      try {
        const params = new URLSearchParams({
          q: activeQ,
          country: activeCountryFilter || '',
          cuisine: activeCountryFilter || '',
          mealType: selectedMealType,
          dietary: dietaryTag,
          maxTime: String(maxTime),
          page: String(pageNum),
          limit: '12',
          lang: language,
        });

        const res = await fetch(`/api/recipes/search?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        const incoming: Recipe[] = Array.isArray(data.recipes) ? data.recipes : [];

        if (append) {
          setRecipes((prev) => {
            const seen = new Set(prev.map((r) => r.id));
            const merged = [...prev];
            for (const item of incoming) {
              if (!seen.has(item.id)) {
                seen.add(item.id);
                merged.push(item);
              }
            }
            return merged;
          });
        } else {
          setRecipes(incoming);
        }

        setMeta({
          query: data.query ?? activeQ,
          correctedQuery: data.correctedQuery ?? activeQ,
          wasCorrected: Boolean(data.wasCorrected),
          intent: data.intent || (activeQ ? 'specific' : 'empty'),
          dietIntent: data.dietIntent || undefined,
          dietSummary: data.dietSummary || undefined,
          dietSummaryBn: data.dietSummaryBn || undefined,
          totalCount: Number(data.totalCount ?? incoming.length),
          exactCount: Number(data.exactCount ?? incoming.length),
          relatedCount: Number(data.relatedCount ?? 0),
          page: Number(data.page ?? pageNum),
          hasMore: Boolean(data.hasMore),
          availableCuisines: Array.isArray(data.availableCuisines) ? data.availableCuisines : DEFAULT_COUNTRIES,
          availableCountries: Array.isArray(data.availableCountries) ? data.availableCountries : DEFAULT_COUNTRIES,
          suggestedQueries: Array.isArray(data.suggestedQueries) ? data.suggestedQueries : [],
          sourcesUsed: Array.isArray(data.sourcesUsed) ? data.sourcesUsed : ['AaharIQ Curated DB'],
          externalApiAvailable: data.externalApiAvailable !== false,
          emptyCountryMessage: data.emptyCountryMessage || undefined,
        });
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        setSearchError(
          language === 'bn'
            ? 'অনলাইন রেসিপি ডেটাবেজের সাথে সংযোগে সমস্যা হয়েছে — স্থানীয় রেসিপি দেখানো হচ্ছে।'
            : 'Unable to reach live recipe services — showing matching curated local recipes.'
        );
        if (!append) {
          runLocalFallback(activeQ);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [
      onlyFavorites,
      searchQuery,
      activeCountryFilter,
      selectedMealType,
      dietaryTag,
      maxTime,
      language,
      runLocalFallback,
    ]
  );

  // Update immediately when country/filters change; brief debounce when typing text
  useEffect(() => {
    if (onlyFavorites) return;
    const queryChanged = prevSearchQueryRef.current !== searchQuery;
    prevSearchQueryRef.current = searchQuery;
    const delayMs = queryChanged && searchQuery.trim() ? 220 : 0;
    const timer = setTimeout(() => {
      executeUniversalSearch(1, false);
    }, delayMs);
    return () => clearTimeout(timer);
  }, [
    searchQuery,
    activeCountryFilter,
    selectedMealType,
    dietaryTag,
    maxTime,
    onlyFavorites,
    executeUniversalSearch,
  ]);

  // Fetch live autocomplete suggestions as user types
  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/recipes/suggestions?q=${encodeURIComponent(searchQuery.trim())}&lang=${language}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (active && Array.isArray(data.suggestions)) {
          setSuggestions(data.suggestions);
        }
      } catch {
        // ignore quiet autocomplete network hiccup
      }
    }, 150);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery, language]);

  // Close autocomplete dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Favorites filter computation (includes both curated & dynamically discovered saved recipes)
  const displayedRecipes = useMemo(() => {
    if (!onlyFavorites) return recipes;
    const byId = new Map(RECIPES_DATABASE.map((r) => [r.id, r]));
    const allFavs = favorites
      .map((id) => favoriteRecipesMap[id] || byId.get(id))
      .filter((r): r is Recipe => Boolean(r));

    const normQ = normalizeBengaliText(searchQuery.trim());
    return allFavs.filter((r) => {
      if (activeCountryFilter && !recipeMatchesCountry(r, activeCountryFilter)) return false;
      if (selectedMealType !== 'all' && r.mealType !== selectedMealType) return false;
      if (dietaryTag === 'vegetarian' && !r.isVegetarian) return false;
      if (dietaryTag === 'vegan' && !r.isVegan) return false;
      if (dietaryTag === 'halal' && !r.isHalal) return false;
      if (dietaryTag === 'glutenFree' && !r.isGlutenFree) return false;
      if (r.prepTime + r.cookTime > maxTime) return false;
      if (normQ) {
        const hay = normalizeBengaliText(`${r.name} ${r.nameBn} ${r.cuisine} ${r.country || ''}`);
        return hay.includes(normQ);
      }
      return true;
    });
  }, [
    onlyFavorites,
    recipes,
    favorites,
    favoriteRecipesMap,
    activeCountryFilter,
    selectedMealType,
    dietaryTag,
    maxTime,
    searchQuery,
  ]);

  // Combine core supported countries with any dynamically discovered countries
  const countriesList = useMemo(() => {
    const set = new Set<string>(DEFAULT_COUNTRIES);
    for (const c of meta.availableCountries || []) {
      const norm = normalizeCountryKey(c);
      if (norm) set.add(norm);
    }
    if (activeCountryFilter) set.add(activeCountryFilter);
    return Array.from(set);
  }, [meta.availableCountries, activeCountryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = searchQuery.trim();
    setShowSuggestions(false);
    setSearchQuery(cleaned);
    if (cleaned) {
      addSearchHistory(cleaned);
    }
    executeUniversalSearch(1, false, cleaned);
    resultsAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const handleQuickPick = (term: string) => {
    setShowSuggestions(false);
    setOnlyFavorites(false);
    setSearchQuery(term);
    addSearchHistory(term);
    executeUniversalSearch(1, false, term);
  };

  const handleClearFilters = () => {
    setSelectedCuisineFilter(null);
    setSelectedMealType('all');
    setDietaryTag('all');
    setMaxTime(120);
    setOnlyFavorites(false);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const hasActiveFilters =
    Boolean(selectedCuisineFilter) ||
    selectedMealType !== 'all' ||
    dietaryTag !== 'all' ||
    maxTime < 120 ||
    onlyFavorites ||
    Boolean(searchQuery);

  const exactRecipes = useMemo(() => {
    if (!searchQuery.trim() || onlyFavorites) return displayedRecipes;
    return displayedRecipes.filter((r) => r.matchType === 'exact');
  }, [displayedRecipes, searchQuery, onlyFavorites]);

  const relatedRecipes = useMemo(() => {
    if (!searchQuery.trim() || onlyFavorites) return [];
    return displayedRecipes.filter((r) => r.matchType !== 'exact');
  }, [displayedRecipes, searchQuery, onlyFavorites]);

  const renderRecipeCard = (recipe: Recipe) => {
    const favorited = isFavorite(recipe.id);
    const recipeImgSrc = resolveRecipeImage(recipe);
    const isExact = recipe.matchType === 'exact';

    return (
      <div
        key={recipe.id}
        className="group bg-white rounded-2xl overflow-hidden border border-emerald-950/10 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
      >
        {/* Photo & badges */}
        <div
          className="relative h-48 w-full overflow-hidden cursor-pointer bg-stone-100"
          onClick={() => setSelectedRecipe(recipe)}
        >
          <img
            key={`${recipe.id}-${recipeImgSrc}`}
            src={recipeImgSrc}
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1 max-w-[78%]">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1B4332]/90 backdrop-blur-md text-white">
              {formatCountryLabel(recipe.country || recipe.cuisine, language)}
            </span>
            {recipe.adaptationType === 'regional_adaptation' &&
              recipe.countryOfOrigin &&
              recipe.country &&
              recipe.countryOfOrigin.toLowerCase() !== recipe.country.toLowerCase() && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-900/75 backdrop-blur-md text-emerald-200">
                  {language === 'bn'
                    ? `উৎপত্তি: ${formatCountryLabel(recipe.countryOfOrigin, 'bn')}`
                    : `Origin: ${formatCountryLabel(recipe.countryOfOrigin, 'en')}`}
                </span>
              )}
            {searchQuery.trim() && recipe.matchType && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md ${
                  isExact
                    ? 'bg-emerald-500/90 text-white'
                    : 'bg-amber-400/90 text-stone-950'
                }`}
              >
                {isExact
                  ? language === 'bn'
                    ? 'সরাসরি মিল'
                    : 'Exact'
                  : language === 'bn'
                  ? 'সম্পর্কিত'
                  : 'Related'}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(recipe.id, recipe);
            }}
            aria-label={favorited ? 'Remove from favorites' : 'Save to favorites'}
            className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/85 hover:bg-white text-stone-800 shadow-sm transition-colors cursor-pointer"
          >
            <Heart
              className={`w-4 h-4 ${
                favorited ? 'text-rose-500 fill-rose-500' : 'text-stone-700'
              }`}
            />
          </button>

          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] font-medium">
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-emerald-300" />
              <span>
                {recipe.prepTime + recipe.cookTime} {language === 'bn' ? 'মিনিট' : 'mins'}
              </span>
            </span>
            <span className="flex items-center space-x-1 font-bold text-amber-300">
              <Flame className="w-3.5 h-3.5" />
              <span>
                {recipe.nutritionEstimated ? '~' : ''}
                {recipe.caloriesPerServing} {language === 'bn' ? 'ক্যালরি' : 'kcal'}
              </span>
            </span>
          </div>
        </div>

        {/* Recipe Information */}
        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-[10px]">
              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md truncate">
                {language === 'bn'
                  ? translateCategoryToBn(recipe.category || recipe.mealType)
                  : recipe.category || recipe.mealType}
              </span>
              {recipe.sourceLabel && (
                <span className="text-stone-400 font-semibold truncate">
                  {recipe.sourceLabel}
                </span>
              )}
            </div>

            <h3
              onClick={() => setSelectedRecipe(recipe)}
              className="font-extrabold text-stone-900 text-sm group-hover:text-emerald-700 transition-colors cursor-pointer line-clamp-1"
            >
              {language === 'bn' ? recipe.name_bn || recipe.nameBn : recipe.name_en || recipe.name}
            </h3>

            <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
              {language === 'bn'
                ? recipe.description_bn || recipe.descriptionBn
                : recipe.description_en || recipe.description}
            </p>

            {(recipe.nutritionMatchReason || recipe.nutritionMatchReasonBn) && (
              <div className="px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200/70 text-[10px] font-semibold text-emerald-900 line-clamp-2">
                {language === 'bn'
                  ? recipe.nutritionMatchReasonBn || recipe.nutritionMatchReason
                  : recipe.nutritionMatchReason || recipe.nutritionMatchReasonBn}
              </div>
            )}
          </div>

          {/* Nutrients Breakdown */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 text-[11px] text-stone-600 font-semibold font-mono-num">
              <span className="text-emerald-700">{recipe.proteinPerServing}g P</span>
              <span>•</span>
              <span className="text-amber-700">{recipe.fiberPerServing}g Fb</span>
              {recipe.difficulty && (
                <>
                  <span>•</span>
                  <span className="text-stone-500 font-sans">
                    {language === 'bn' ? recipe.difficultyBn || recipe.difficulty : recipe.difficulty}
                  </span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedRecipe(recipe)}
              className="px-3 py-1 bg-stone-100 group-hover:bg-[#1B4332] group-hover:text-white rounded-lg text-stone-700 font-bold transition-colors text-xs cursor-pointer"
            >
              {language === 'bn' ? 'বিস্তারিত' : 'View Details'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const quickChips = language === 'bn' ? QUICK_SEARCH_CHIPS_BN : QUICK_SEARCH_CHIPS_EN;
  const dietQuickChips = language === 'bn' ? DIET_QUICK_CHIPS_BN : DIET_QUICK_CHIPS_EN;

  return (
    <div className="space-y-7 pb-12 animate-fade-in">
      {/* Header & Universal Search Hero */}
      <div className="bg-gradient-to-r from-[#16382C] via-[#1E4A3B] to-[#16382C] text-white p-6 sm:p-8 rounded-3xl border border-emerald-800/40 shadow-lg">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
            <Globe className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {language === 'bn'
                ? 'সর্বজনীন এআই রেসিপি অনুসন্ধান ইঞ্জিন'
                : 'Universal AI Recipe Discovery Engine'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            {t.exploreRecipes}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            {language === 'bn'
              ? 'যেকোনো খাবার, উপাদান, পদ বা ক্যাটাগরি (যেমন: Noodles, Ramen, Chicken, Potato, Egg, মুরগি, আলু, ভাত) লিখে বিশ্বব্যাপী ও দেশীয় রেসিপি খুঁজুন।'
              : 'Search any food, ingredient, dish name, or cuisine across global and Bangladeshi recipe databases — with smart typo correction and related dish discovery.'}
          </p>
        </div>

        {/* Universal Search Bar with Live Autocomplete */}
        <div ref={searchContainerRef} className="relative mt-6 max-w-2xl">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative flex items-center bg-white rounded-2xl p-1.5 shadow-xl border border-emerald-100 gap-1.5">
              <Search className="w-5 h-5 text-emerald-700 ml-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setShowSuggestions(false);
                }}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                aria-label={language === 'bn' ? 'যেকোনো রেসিপি খুঁজুন' : 'Search any recipe, food, or ingredient'}
                placeholder={
                  language === 'bn'
                    ? 'যেমন: Noodles, Ramen, Chicken, Potato, ডিম, মুরগি, আলু, শাক...'
                    : 'Search any dish or ingredient (e.g., Noodles, Ramen, Chicken, Potato, আলু ভর্তা)...'
                }
                className="w-full py-2 px-1 text-stone-900 placeholder:text-stone-400 text-sm focus:outline-none bg-transparent"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setShowSuggestions(false);
                  }}
                  aria-label={language === 'bn' ? 'অনুসন্ধান মুছুন' : 'Clear search'}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-[#16382C] hover:bg-[#255C45] text-white text-xs sm:text-sm font-bold rounded-xl transition-colors shrink-0 flex items-center space-x-1.5 cursor-pointer shadow-sm"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                <span>{language === 'bn' ? 'খুঁজুন' : 'Search'}</span>
              </button>
            </div>
          </form>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-emerald-950/15 overflow-hidden z-40">
              <div className="px-3.5 py-2 bg-stone-50 border-b border-stone-100 flex items-center justify-between text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                <span>
                  {searchQuery.trim()
                    ? language === 'bn'
                      ? 'প্রস্তাবিত রেসিপি ও সংশোধন'
                      : 'Smart Search Suggestions'
                    : language === 'bn'
                    ? 'জনপ্রিয় অনুসন্ধান'
                    : 'Popular Searches'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowSuggestions(false)}
                  className="text-stone-400 hover:text-stone-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto">
                {suggestions.map((sug, idx) => (
                  <button
                    key={`${sug.text}-${idx}`}
                    type="button"
                    onClick={() => handleQuickPick(sug.text)}
                    className="w-full px-4 py-2.5 text-left hover:bg-emerald-50/70 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-stone-900 truncate">{sug.text}</p>
                      <p className="text-[11px] text-stone-500 truncate">{sug.sublabel}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                        sug.type === 'correction'
                          ? 'bg-amber-100 text-amber-800'
                          : sug.type === 'recipe'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {sug.type === 'correction'
                        ? language === 'bn'
                          ? 'সংশোধন'
                          : 'Did you mean'
                        : sug.type === 'recipe'
                        ? language === 'bn'
                          ? 'রেসিপি'
                          : 'Dish'
                        : sug.type === 'ingredient'
                        ? language === 'bn'
                          ? 'উপাদান'
                          : 'Ingredient'
                        : language === 'bn'
                        ? 'ক্যাটাগরি'
                        : 'Category'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Trending Global Food Chips + Smart Diet Food Search */}
        <div className="mt-4 space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-emerald-200/90 mr-1">
              {language === 'bn' ? 'বিশ্বজুড়ে জনপ্রিয়:' : 'Global Dishes:'}
            </span>
            {quickChips.map((chip) => {
              const active = searchQuery.trim().toLowerCase() === chip.toLowerCase();
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleQuickPick(chip)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-amber-400 text-stone-950 shadow-sm'
                      : 'bg-white/10 hover:bg-white/20 text-emerald-50 border border-white/15'
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-amber-300 mr-1">
              {language === 'bn' ? 'স্মার্ট পুষ্টি অনুসন্ধান:' : 'Smart Diet Filters:'}
            </span>
            {dietQuickChips.map((chip) => {
              const active = searchQuery.trim().toLowerCase() === chip.toLowerCase();
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleQuickPick(chip)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-emerald-400 text-stone-950 shadow-sm'
                      : 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-500/30'
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-emerald-950/10 shadow-sm space-y-4">
        {/* Row 1: Country / Culinary Origin Filter */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {language === 'bn' ? 'দেশ নির্বাচন করুন' : 'Select Country'}
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center space-x-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'ফিল্টার মুছুন' : 'Reset Filters'}</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedCuisineFilter(null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                !activeCountryFilter
                  ? 'bg-[#1B4332] text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {language === 'bn' ? 'সকল দেশ' : 'All Countries'}
            </button>
            {countriesList.map((country) => {
              const isSelected = activeCountryFilter === country;
              return (
                <button
                  key={country}
                  type="button"
                  onClick={() => setSelectedCuisineFilter(isSelected ? null : country)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1B4332] text-white shadow-sm'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {formatCountryLabel(country, language)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Meal type, Dietary preference, Time & Favorites */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-stone-100 text-xs">
          <div>
            <label className="block font-bold text-stone-700 mb-1">{t.mealType}</label>
            <select
              value={selectedMealType}
              onChange={(e) => setSelectedMealType(e.target.value)}
              className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-medium focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">{t.allMealTypes}</option>
              <option value="breakfast">{t.breakfast}</option>
              <option value="lunch">{t.lunch}</option>
              <option value="dinner">{t.dinner}</option>
              <option value="snack">{t.snack}</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              {t.dietaryPreference}
            </label>
            <select
              value={dietaryTag}
              onChange={(e) => setDietaryTag(e.target.value)}
              className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-medium focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">{language === 'bn' ? 'সকল খাদ্যাভ্যাস' : 'All Diets'}</option>
              <option value="vegetarian">{t.vegetarian}</option>
              <option value="vegan">{t.vegan}</option>
              <option value="halal">{t.halal}</option>
              <option value="glutenFree">{t.glutenFree}</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between font-bold text-stone-700 mb-1">
              <span>{language === 'bn' ? 'সর্বোচ্চ সময়:' : 'Max Time:'}</span>
              <span className="text-emerald-700">{maxTime} mins</span>
            </div>
            <input
              type="range"
              min={15}
              max={120}
              step={15}
              value={maxTime}
              onChange={(e) => setMaxTime(Number(e.target.value))}
              className="w-full accent-emerald-700"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`w-full py-2 px-3 rounded-xl border flex items-center justify-center space-x-1.5 font-bold transition-colors cursor-pointer ${
                onlyFavorites
                  ? 'bg-rose-50 border-rose-300 text-rose-600'
                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Heart className={`w-4 h-4 ${onlyFavorites ? 'fill-rose-500' : ''}`} />
              <span>{language === 'bn' ? 'কেবল পছন্দের তালিকা' : 'Favorites Only'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Spell-correction, Smart Diet Ranking Banner & Related Variations Discovery Strip */}
      {!onlyFavorites && searchQuery.trim() && (meta.wasCorrected || meta.intent === 'diet' || meta.suggestedQueries.length > 0) && (
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-2.5">
          {meta.intent === 'diet' && (meta.dietSummary || meta.dietSummaryBn) && (
            <div className="flex items-start space-x-2 text-xs font-semibold text-emerald-950">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                {language === 'bn'
                  ? meta.dietSummaryBn || meta.dietSummary
                  : meta.dietSummary || meta.dietSummaryBn}
              </span>
            </div>
          )}

          {meta.wasCorrected && (
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-900">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {language === 'bn'
                  ? `"${meta.query}" এর বদলে "${meta.correctedQuery}" অনুযায়ী ফলাফল দেখানো হচ্ছে`
                  : `Showing results for "${meta.correctedQuery}" (corrected from "${meta.query}")`}
              </span>
            </div>
          )}

          {meta.suggestedQueries.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-emerald-900 flex items-center space-x-1 mr-1">
                <Tag className="w-3.5 h-3.5 text-emerald-700" />
                <span>
                  {language === 'bn' ? 'সম্পর্কিত রেসিপি ধরন:' : 'Explore variations:'}
                </span>
              </span>
              {meta.suggestedQueries.map((sq) => (
                <button
                  key={sq}
                  type="button"
                  onClick={() => handleQuickPick(sq)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#1B4332] hover:text-white text-emerald-900 border border-emerald-200 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  {sq}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Network / external source fallback notice if applicable */}
      {(searchError || (!onlyFavorites && searchQuery.trim() && meta.externalApiAvailable === false)) && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-2xl text-xs">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {searchError ||
                (language === 'bn'
                  ? 'বাহ্যিক রেসিপি এপিআই (TheMealDB) সাময়িকভাবে অনুপলব্ধ — যাচাইকৃত AaharIQ স্থানীয় ডেটাবেজ থেকে ফলাফল দেখানো হচ্ছে।'
                  : 'External recipe source (TheMealDB) is temporarily unreachable — showing verified results from AaharIQ local database fallback.')}
            </span>
          </div>
          <button
            type="button"
            onClick={() => executeUniversalSearch(1, false)}
            className="flex items-center space-x-1 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'পুনরায় চেষ্টা করুন' : 'Retry Live Search'}</span>
          </button>
        </div>
      )}

      {/* Results Summary Bar */}
      <div
        ref={resultsAnchorRef}
        className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600"
      >
        <span className="font-semibold">
          {onlyFavorites
            ? language === 'bn'
              ? `পছন্দের তালিকায় ${displayedRecipes.length} টি রেসিপি রয়েছে`
              : `Showing ${displayedRecipes.length} favorite recipes`
            : language === 'bn'
            ? searchQuery.trim()
              ? `"${meta.correctedQuery || searchQuery.trim()}" এর জন্য মোট ${meta.totalCount} টি রেসিপির মধ্যে ${displayedRecipes.length} টি দেখানো হচ্ছে`
              : `মোট ${meta.totalCount} টি রেসিপির মধ্যে ${displayedRecipes.length} টি দেখানো হচ্ছে`
            : searchQuery.trim()
            ? `Showing ${displayedRecipes.length} of ${meta.totalCount} discovered recipes for "${meta.correctedQuery || searchQuery.trim()}"`
            : `Showing ${displayedRecipes.length} of ${meta.totalCount} recipes`}
        </span>

        {!onlyFavorites && meta.sourcesUsed.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-stone-400">
              {language === 'bn' ? 'উৎস:' : 'Sources:'}
            </span>
            {meta.sourcesUsed.map((src) => (
              <span
                key={src}
                className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-semibold"
              >
                {src}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl overflow-hidden border border-stone-200 animate-pulse"
            >
              <div className="h-48 bg-stone-200" />
              <div className="p-4 space-y-3">
                <div className="h-3 bg-stone-200 rounded w-1/3" />
                <div className="h-4 bg-stone-200 rounded w-4/5" />
                <div className="h-3 bg-stone-200 rounded w-full" />
                <div className="h-7 bg-stone-200 rounded w-full mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : displayedRecipes.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-stone-200 space-y-4">
          <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <ChefHat className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-stone-800 text-base">
            {activeCountryFilter
              ? language === 'bn'
                ? `${formatCountryLabel(activeCountryFilter, 'bn')}-এর জন্য কোনো মিল পাওয়া যায়নি`
                : 'No matching recipe found for this country'
              : language === 'bn'
              ? searchQuery.trim()
                ? `"${searchQuery.trim()}" সম্পর্কিত কোনো রেসিপি পাওয়া যায়নি`
                : 'কোনো রেসিপি পাওয়া যায়নি'
              : searchQuery.trim()
              ? `No recipes found matching "${searchQuery.trim()}"`
              : 'No matching recipes found'}
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
            {activeCountryFilter
              ? language === 'bn'
                ? `${formatCountryLabel(activeCountryFilter, 'bn')}-এ "${searchQuery.trim() || 'নির্বাচিত খাবার'}"-এর কোনো যাচাইকৃত রেসিপি পাওয়া যায়নি। সব দেশ দেখুন অথবা অন্য খাবার খুঁজুন।`
                : `No verified recipe for "${searchQuery.trim() || 'your selected filters'}" was found for ${formatCountryLabel(activeCountryFilter, 'en')}. Try switching to All Countries or exploring signature dishes from ${formatCountryLabel(activeCountryFilter, 'en')}.`
              : language === 'bn'
              ? 'দয়া করে Noodles, Ramen, Chicken, Potato, ডিম, মুরগি, মাছ বা পছন্দের উপাদান লিখে আবার চেষ্টা করুন অথবা ফিল্টার রিসেট করুন।'
              : 'Try searching by dish name, ingredient, or category such as Pizza, Pasta, Noodles, Ramen, Biryani, or reset your active filters.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {activeCountryFilter && (
              <button
                type="button"
                onClick={() => setSelectedCuisineFilter(null)}
                className="px-4 py-2 bg-[#1B4332] text-white rounded-xl text-xs font-bold hover:bg-[#255C45] cursor-pointer"
              >
                {language === 'bn' ? 'সকল দেশে খুঁজুন' : 'Search All Countries'}
              </button>
            )}
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-4 py-2 bg-stone-100 text-stone-800 rounded-xl text-xs font-bold hover:bg-stone-200 cursor-pointer"
            >
              {language === 'bn' ? 'সব ফিল্টার মুছুন' : 'Reset All Filters'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Exact Matches Section */}
          {exactRecipes.length > 0 && (
            <div className="space-y-4">
              {searchQuery.trim() && !onlyFavorites && relatedRecipes.length > 0 && (
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-emerald-950">
                    {language === 'bn'
                      ? `সরাসরি মিলে যাওয়া রেসিপি (${exactRecipes.length})`
                      : `Exact Matches (${exactRecipes.length})`}
                  </h2>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {exactRecipes.map(renderRecipeCard)}
              </div>
            </div>
          )}

          {/* Related Recipes Section */}
          {relatedRecipes.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-stone-200/80">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-800">
                  {language === 'bn'
                    ? `সম্পর্কিত ও বৈচিত্র্যময় রেসিপি (${relatedRecipes.length})`
                    : `Related Recipes & Variations (${relatedRecipes.length})`}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {relatedRecipes.map(renderRecipeCard)}
              </div>
            </div>
          )}

          {/* Pagination / Load More */}
          {!onlyFavorites && meta.hasMore && (
            <div className="flex justify-center pt-4">
              <button
                type="button"
                disabled={isLoadingMore}
                onClick={() => executeUniversalSearch(meta.page + 1, true)}
                className="px-6 py-3 rounded-2xl bg-[#16382C] hover:bg-[#255C45] disabled:opacity-60 text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center space-x-2 cursor-pointer"
              >
                {isLoadingMore ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowDownCircle className="w-4 h-4 text-emerald-300" />
                )}
                <span>
                  {isLoadingMore
                    ? language === 'bn'
                      ? 'আরও রেসিপি লোড হচ্ছে...'
                      : 'Loading more recipes...'
                    : language === 'bn'
                    ? `আরও রেসিপি দেখুন (${displayedRecipes.length} / ${meta.totalCount})`
                    : `Load More Recipes (${displayedRecipes.length} / ${meta.totalCount})`}
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
