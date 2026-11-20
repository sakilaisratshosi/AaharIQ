import { GoogleGenAI, Type } from '@google/genai';
import { RECIPES_DATABASE, Recipe, Ingredient } from '../src/data/recipesData.ts';
import { resolveRecipeImage } from '../src/utils/recipeImageResolver.ts';
import {
  analyzeUniversalQuery,
  DietIntentType,
  expandBilingualTokens,
  normalizeBengaliText,
  STRICT_DISH_ANCHORS,
  UniversalQueryAnalysis,
} from '../src/utils/searchNormalizer.ts';
import {
  hasBanglaText,
  toBanglaDigits,
  translateCookingStepListToBn,
  translateCookingStepToBn,
  translateCuisineToBn,
  translateIngredientToBn,
  translateUnitToBn,
} from '../src/utils/bilingualRecipeTranslator.ts';

import {
  formatCountryLabel,
  getTheMealDbAreasForCountry,
  normalizeCountryKey,
  recipeMatchesCountry,
  SUPPORTED_COUNTRIES,
} from '../src/utils/countryNormalizer.ts';

export interface UniversalSearchParams {
  query: string;
  country?: string;
  cuisine?: string;
  mealType?: string;
  dietary?: string;
  maxTime?: number;
  page?: number;
  limit?: number;
  language?: string;
}

export interface UniversalSearchResponse {
  query: string;
  correctedQuery: string;
  wasCorrected: boolean;
  intent: 'empty' | 'broad' | 'specific' | 'diet';
  dietIntent?: DietIntentType;
  dietSummary?: string;
  dietSummaryBn?: string;
  englishQuery: string;
  selectedCountry: string;
  recipes: Recipe[];
  totalCount: number;
  exactCount: number;
  relatedCount: number;
  page: number;
  limit: number;
  hasMore: boolean;
  availableCuisines: string[];
  availableCountries: string[];
  suggestedQueries: string[];
  sourcesUsed: string[];
  externalApiAvailable: boolean;
  emptyCountryMessage?: string;
}

export interface SuggestionItem {
  text: string;
  sublabel: string;
  type: 'recipe' | 'ingredient' | 'category' | 'correction';
}

interface CacheEntry {
  timestamp: number;
  analysis: UniversalQueryAnalysis;
  recipes: Recipe[];
  sourcesUsed: string[];
  externalApiAvailable: boolean;
}

const SEARCH_CACHE = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_CACHE_ENTRIES = 80;

function parseNumericAmount(measure: string): { amount: number; unit: string } {
  const cleaned = String(measure || '').trim();
  if (!cleaned) return { amount: 1, unit: 'serving' };

  const fractionMap: Record<string, number> = {
    '1/2': 0.5,
    '½': 0.5,
    '1/4': 0.25,
    '¼': 0.25,
    '3/4': 0.75,
    '¾': 0.75,
    '1/3': 0.33,
    '⅓': 0.33,
    '2/3': 0.67,
    '⅔': 0.67,
  };

  for (const [frac, val] of Object.entries(fractionMap)) {
    if (cleaned.startsWith(frac)) {
      const rest = cleaned.slice(frac.length).trim();
      return { amount: val, unit: rest || 'pcs' };
    }
  }

  const numMatch = cleaned.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
  if (numMatch) {
    const val = parseFloat(numMatch[1]);
    return {
      amount: Number.isFinite(val) && val > 0 ? val : 1,
      unit: numMatch[2].trim() || 'pcs',
    };
  }

  return { amount: 1, unit: cleaned };
}

function estimateNutritionFromMeal(
  title: string,
  category: string,
  ingredientNames: string[]
): {
  caloriesPerServing: number;
  proteinPerServing: number;
  carbsPerServing: number;
  fatPerServing: number;
  fiberPerServing: number;
} {
  const hay = `${title} ${category} ${ingredientNames.join(' ')}`.toLowerCase();
  let cal = 340;
  let protein = 16;
  let carbs = 38;
  let fat = 12;
  let fiber = 3.5;

  if (hay.includes('chicken') || hay.includes('beef') || hay.includes('lamb') || hay.includes('pork')) {
    protein += 14;
    fat += 5;
    cal += 95;
  }
  if (hay.includes('salmon') || hay.includes('fish') || hay.includes('shrimp') || hay.includes('prawn') || hay.includes('seafood')) {
    protein += 13;
    fat += 3;
    cal += 70;
  }
  if (hay.includes('noodle') || hay.includes('ramen') || hay.includes('pasta') || hay.includes('spaghetti') || hay.includes('rice')) {
    carbs += 16;
    cal += 75;
  }
  if (hay.includes('potato') || hay.includes('fries')) {
    carbs += 12;
    fiber += 1.5;
    cal += 45;
  }
  if (hay.includes('egg')) {
    protein += 6;
    fat += 4;
    cal += 40;
  }
  if (hay.includes('soup') || hay.includes('salad') || hay.includes('vegetarian')) {
    cal = Math.max(185, cal - 85);
    fat = Math.max(5, fat - 4);
    fiber += 2.2;
  }
  if (hay.includes('dessert') || hay.includes('cake') || hay.includes('chocolate')) {
    carbs += 22;
    fat += 6;
    protein = Math.max(4, protein - 8);
    cal += 60;
  }

  return {
    caloriesPerServing: Math.round(cal),
    proteinPerServing: Math.round(protein * 10) / 10,
    carbsPerServing: Math.round(carbs * 10) / 10,
    fatPerServing: Math.round(fat * 10) / 10,
    fiberPerServing: Math.round(fiber * 10) / 10,
  };
}

function inferMealType(title: string, category: string, tags: string[] = []): 'breakfast' | 'lunch' | 'dinner' | 'snack' {
  const hay = `${title} ${category} ${tags.join(' ')}`.toLowerCase();
  if (hay.includes('breakfast') || hay.includes('omelette') || hay.includes('pancake') || hay.includes('toast')) {
    return 'breakfast';
  }
  if (hay.includes('dessert') || hay.includes('starter') || hay.includes('side') || hay.includes('snack') || hay.includes('fries')) {
    return 'snack';
  }
  if (hay.includes('biryani') || hay.includes('roast') || hay.includes('steak') || hay.includes('pasta') || hay.includes('ramen')) {
    return 'dinner';
  }
  return 'lunch';
}

function mapTheMealDbToRecipe(meal: any): Recipe {
  const ingredients: Ingredient[] = [];
  const rawIngNames: string[] = [];

  for (let i = 1; i <= 20; i++) {
    const ingName = String(meal[`strIngredient${i}`] || '').trim();
    const ingMeasure = String(meal[`strMeasure${i}`] || '').trim();
    if (!ingName) continue;
    rawIngNames.push(ingName);
    const { amount, unit } = parseNumericAmount(ingMeasure);
    ingredients.push({
      name: ingName,
      nameBn: translateIngredientToBn(ingName),
      amount,
      unit,
      unitBn: translateUnitToBn(unit),
      category: 'others',
    });
  }

  const rawInstructions = String(meal.strInstructions || '')
    .split(/\r?\n+/)
    .map((s) => s.replace(/^\s*(?:step\s*\d+[:.]?\s*|\d+[.)]\s*)/i, '').trim())
    .filter((s) => s.length > 8);

  const instructions =
    rawInstructions.length > 0
      ? rawInstructions.slice(0, 12)
      : ['Prepare and measure all ingredients cleanly.', 'Cook following traditional method until tender and aromatic, then serve warm.'];

  const title = String(meal.strMeal || 'Global Dish').trim();
  const category = String(meal.strCategory || 'Main Course').trim();
  const cuisine = String(meal.strArea || 'International').trim();
  const tags = String(meal.strTags || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const hay = `${title} ${category} ${rawIngNames.join(' ')}`.toLowerCase();
  const isPorkOrAlcohol =
    hay.includes('pork') ||
    hay.includes('bacon') ||
    hay.includes('ham') ||
    hay.includes('prosciutto') ||
    hay.includes('wine') ||
    hay.includes('beer') ||
    hay.includes('rum') ||
    hay.includes('brandy');

  const hasMeat =
    hay.includes('chicken') ||
    hay.includes('beef') ||
    hay.includes('lamb') ||
    hay.includes('mutton') ||
    hay.includes('pork') ||
    hay.includes('fish') ||
    hay.includes('salmon') ||
    hay.includes('shrimp') ||
    hay.includes('prawn') ||
    hay.includes('tuna') ||
    hay.includes('turkey') ||
    hay.includes('bacon');

  const isVeg = category.toLowerCase() === 'vegetarian' || category.toLowerCase() === 'vegan' || !hasMeat;
  const isVegan = category.toLowerCase() === 'vegan';
  const est = estimateNutritionFromMeal(title, category, rawIngNames);

  const description = `${cuisine} ${category.toLowerCase()} prepared with ${rawIngNames.slice(0, 5).join(', ') || 'wholesome culinary ingredients'}.`;
  const prepTime = 15;
  const cookTime = category.toLowerCase() === 'soup' || category.toLowerCase() === 'beef' ? 35 : 25;

  const mappedCountry = normalizeCountryKey(cuisine) || cuisine;
  const hayLower = title.toLowerCase();
  let inferredOrigin = mappedCountry;
  if (hayLower.includes('pizza') || hayLower.includes('margherita') || hayLower.includes('pasta') || hayLower.includes('spaghetti') || hayLower.includes('fettuccine') || hayLower.includes('lasagn') || hayLower.includes('linguine')) {
    inferredOrigin = 'Italy';
  } else if (hayLower.includes('sushi') || hayLower.includes('ramen') || /\budon\b/.test(hayLower)) {
    inferredOrigin = 'Japan';
  } else if (hayLower.includes('momo')) {
    inferredOrigin = 'Nepal';
  } else if (hayLower.includes('biryani')) {
    inferredOrigin = mappedCountry || 'India';
  }
  const adaptationType: 'traditional_origin' | 'regional_adaptation' =
    inferredOrigin && mappedCountry && inferredOrigin.toLowerCase() !== mappedCountry.toLowerCase()
      ? 'regional_adaptation'
      : 'traditional_origin';

  const totalMins = prepTime + cookTime;
  const difficulty: 'Easy' | 'Medium' | 'Hard' =
    totalMins <= 30 && instructions.length <= 5 ? 'Easy' : instructions.length >= 10 ? 'Hard' : 'Medium';
  const difficultyBn = difficulty === 'Easy' ? 'সহজ' : difficulty === 'Hard' ? 'কঠিন' : 'মাঝারি';
  const estimatedSugar =
    hay.includes('sugar') || hay.includes('honey') || hay.includes('syrup') || category.toLowerCase() === 'dessert'
      ? 16
      : hay.includes('tomato') || hay.includes('carrot') || hay.includes('onion')
      ? 4.5
      : 3;

  return {
    id: `themealdb-${meal.idMeal}`,
    name: title,
    name_en: title,
    nameBn: title,
    name_bn: title,
    cuisine,
    country: mappedCountry,
    countryOfOrigin: inferredOrigin,
    regionalStyle:
      adaptationType === 'regional_adaptation'
        ? `${cuisine} Adaptation`
        : `${cuisine} Traditional`,
    adaptationType,
    tags: Array.from(new Set([mappedCountry, cuisine, category, ...tags].filter(Boolean))),
    category,
    mealType: inferMealType(title, category, tags),
    difficulty,
    difficultyBn,
    prepTime,
    cookTime,
    servings: 3,
    caloriesPerServing: est.caloriesPerServing,
    proteinPerServing: est.proteinPerServing,
    carbsPerServing: est.carbsPerServing,
    fatPerServing: est.fatPerServing,
    fiberPerServing: est.fiberPerServing,
    sugarPerServing: estimatedSugar,
    isVegetarian: isVeg,
    isVegan,
    isHalal: !isPorkOrAlcohol,
    isGlutenFree: !hay.includes('flour') && !hay.includes('pasta') && !hay.includes('noodle') && !hay.includes('bread'),
    image: String(meal.strMealThumb || '/images/food-placeholder.jpg').trim(),
    description,
    description_en: description,
    descriptionBn: `${translateCuisineToBn(cuisine)} স্টাইলের সুস্বাদু ${title} — মূল উপকরণ: ${ingredients
      .slice(0, 4)
      .map((i) => i.nameBn)
      .join(', ')}।`,
    description_bn: `${translateCuisineToBn(cuisine)} স্টাইলের সুস্বাদু ${title} — মূল উপকরণ: ${ingredients
      .slice(0, 4)
      .map((i) => i.nameBn)
      .join(', ')}।`,
    ingredients,
    ingredients_en: ingredients.map((i) => `${i.amount} ${i.unit} ${i.name}`),
    ingredients_bn: ingredients.map((i) => `${toBanglaDigits(i.amount)} ${i.unitBn} ${i.nameBn}`),
    instructions,
    instructions_en: instructions,
    instructionsBn: translateCookingStepListToBn(instructions),
    instructions_bn: translateCookingStepListToBn(instructions),
    cookingTips: [
      'Wash fresh produce thoroughly and prepare measured aromatics before cooking.',
      'Taste seasoning before removing from heat to balance salt, acidity, and spice.',
    ],
    cookingTipsBn: [
      'রান্নার আগে তাজা সবজি ভালোভাবে ধুয়ে এবং সব উপকরণ মেপে প্রস্তুত রাখুন।',
      'নামানোর আগে লবণ ও মসলার স্বাদ পরখ করে নিন।',
    ],
    substitutions: [
      'Adapt oil type (olive, mustard, or canola) and adjust chili level to suit household taste.',
    ],
    substitutionsBn: [
      'ঘরোয়া পছন্দ অনুযায়ী রান্নার তেল এবং ঝালের মাত্রা সহজেই পরিবর্তন করা যায়।',
    ],
    healthHighlight: `Provides estimated macronutrients (~${est.proteinPerServing}g protein, ${est.fiberPerServing}g fiber per serving) from ${cuisine} culinary tradition.`,
    healthHighlightBn: `${translateCuisineToBn(cuisine)} রান্নার ঐতিহ্যবাহী এই পদে আনুমানিক ${toBanglaDigits(est.proteinPerServing)} গ্রাম প্রোটিন ও ${toBanglaDigits(est.fiberPerServing)} গ্রাম ফাইবার রয়েছে।`,
    keywords: [title.toLowerCase(), cuisine.toLowerCase(), mappedCountry.toLowerCase(), category.toLowerCase(), ...tags.map((t) => t.toLowerCase())],
    source: 'themealdb',
    sourceLabel: 'TheMealDB',
    nutritionStatus: 'ai_estimated',
    nutritionBasis: 'per_serving_recipe',
    nutritionEstimated: true,
    externalUrl: String(meal.strSource || meal.strYoutube || '').trim() || undefined,
  };
}

async function fetchJsonWithTimeout(
  url: string,
  timeoutMs = 6500
): Promise<{ reachable: boolean; data: any | null }> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) return { reachable: false, data: null };
    const data = await res.json();
    return { reachable: true, data };
  } catch {
    return { reachable: false, data: null };
  }
}

async function queryTheMealDB(
  analysis: UniversalQueryAnalysis,
  activeCountry = ''
): Promise<{ recipes: Recipe[]; reachable: boolean }> {
  const words = analysis.englishQuery
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w && w !== 'style' && w !== 'recipe');
  const detectedAnchor = STRICT_DISH_ANCHORS.find((a) => words.includes(a));

  const searchTerms = Array.from(
    new Set(
      [
        analysis.englishQuery,
        detectedAnchor,
        ...(words.length <= 1 ? analysis.relatedVariations : []),
      ].filter((s): s is string => Boolean(s && s.length >= 2))
    )
  ).slice(0, 5);

  const mealById = new Map<string, any>();
  const searchPromises: Array<Promise<{ reachable: boolean; data: any | null }>> = [];

  // 1. If Smart Diet Intent, query appropriate TheMealDB categories / wholesome ingredients
  if (analysis.intent === 'diet' && analysis.dietIntent) {
    const dietCategoriesMap: Record<DietIntentType, string[]> = {
      healthy_breakfast: ['Breakfast', 'Vegetarian'],
      healthy_lunch: ['Seafood', 'Vegetarian', 'Chicken'],
      healthy_dinner: ['Seafood', 'Vegetarian', 'Chicken'],
      high_protein: ['Chicken', 'Seafood'],
      high_fiber: ['Vegetarian', 'Vegan'],
      low_sugar: ['Seafood', 'Chicken', 'Vegetarian'],
      balanced_meal: ['Seafood', 'Vegetarian'],
      healthy_food: ['Vegetarian', 'Seafood'],
      diet_food: ['Vegetarian', 'Seafood'],
      vegetable_recipes: ['Vegetarian', 'Vegan'],
      nutritious_snacks: ['Vegetarian', 'Starter'],
    };
    const cats = dietCategoriesMap[analysis.dietIntent] || ['Vegetarian'];
    for (const c of cats.slice(0, 2)) {
      searchPromises.push(
        fetchJsonWithTimeout(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(c)}`)
      );
    }
    if (analysis.dietIntent === 'vegetable_recipes') {
      searchPromises.push(
        fetchJsonWithTimeout(`https://www.themealdb.com/api/json/v1/1/filter.php?i=spinach`)
      );
    }
  } else {
    // Query search.php?s= when a dish/ingredient query exists
    for (const term of searchTerms) {
      searchPromises.push(
        fetchJsonWithTimeout(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(term)}`)
      );
    }
  }

  // 2. When a country filter is active, also query TheMealDB area endpoint so country-authentic meals
  // (e.g. Italian pastas, Indian curries, Japanese rice/noodles) are reliably discovered.
  if (activeCountry) {
    const areas = getTheMealDbAreasForCountry(activeCountry);
    for (const area of areas.slice(0, 2)) {
      searchPromises.push(
        fetchJsonWithTimeout(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(area)}`)
      );
    }
  }

  // 3. Query ingredient/category endpoints for single-concept broad searches
  if (analysis.intent !== 'diet' && words.length <= 1) {
    const singleWordCore = words[0] || '';
    if (singleWordCore && singleWordCore.length >= 3) {
      searchPromises.push(
        fetchJsonWithTimeout(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(singleWordCore)}`)
      );
    }

    const categoryMap: Record<string, string> = {
      pasta: 'Pasta',
      fish: 'Seafood',
      seafood: 'Seafood',
      vegetable: 'Vegetarian',
      vegetables: 'Vegetarian',
      vegetarian: 'Vegetarian',
      chicken: 'Chicken',
      beef: 'Beef',
      lamb: 'Lamb',
      breakfast: 'Breakfast',
    };
    const mealDbCategory = categoryMap[analysis.englishQuery];
    if (mealDbCategory) {
      searchPromises.push(
        fetchJsonWithTimeout(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(mealDbCategory)}`)
      );
    }
  }

  const responses = await Promise.all(searchPromises);
  const anyReachable = responses.some((r) => r.reachable);
  const partialMealsToHydrate: Array<{ id: string; title: string; relevance: number }> = [];
  const seenPartial = new Set<string>();
  const relevanceTerms = Array.from(
    new Set([analysis.englishQuery, ...words, ...analysis.relatedVariations].map((t) => t.toLowerCase()).filter((t) => t.length >= 2))
  );

  for (const res of responses) {
    const meals = res.data?.meals;
    if (!Array.isArray(meals)) continue;
    for (const m of meals) {
      if (!m?.idMeal) continue;
      const id = String(m.idMeal);
      if (m.strInstructions) {
        mealById.set(id, m);
      } else if (!mealById.has(id) && !seenPartial.has(id)) {
        seenPartial.add(id);
        const mealTitle = String(m.strMeal || '').toLowerCase();
        const rel = relevanceTerms.reduce((acc, term) => (mealTitle.includes(term) ? acc + 1 : acc), 0);
        partialMealsToHydrate.push({ id, title: mealTitle, relevance: rel });
      }
    }
  }

  // Prioritize hydrating meals whose title matches the search terms first
  partialMealsToHydrate.sort((a, b) => b.relevance - a.relevance);
  const uniqueIdsToHydrate = partialMealsToHydrate
    .filter((item) => !mealById.has(item.id))
    .slice(0, 12)
    .map((item) => item.id);

  if (uniqueIdsToHydrate.length > 0) {
    const hydratedList = await Promise.all(
      uniqueIdsToHydrate.map((id) =>
        fetchJsonWithTimeout(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(id)}`)
      )
    );
    for (const h of hydratedList) {
      const m = h.data?.meals?.[0];
      if (m?.idMeal) {
        mealById.set(String(m.idMeal), m);
      }
    }
  }

  return {
    recipes: Array.from(mealById.values()).map(mapTheMealDbToRecipe),
    reachable: anyReachable,
  };
}

async function queryGeminiComplementaryRecipes(
  analysis: UniversalQueryAnalysis,
  existingCount: number,
  existingTitles: string[]
): Promise<Recipe[]> {
  if (!process.env.GEMINI_API_KEY) return [];

  // Only invoke Gemini when external/curated DBs don't already cover the query thoroughly,
  // or for broad Asian/Bangladeshi categories like noodles/ramen/potato where real free DBs lack iconic dishes (e.g., Ramen, Hakka Noodles, Stir-Fried Noodles).
  const needsSupplement =
    existingCount < 6 ||
    analysis.intent === 'broad' ||
    analysis.isBanglaQuery;

  if (!needsSupplement) return [];

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const desiredCount = existingCount < 4 ? 5 : 4;
    const avoidList = existingTitles.slice(0, 12).join(', ');
    const prompt = `You are an expert culinary & nutrition architect at AaharIQ.
User searched for: "${analysis.originalQuery}" (interpreted concept: "${analysis.englishQuery}", intent: ${analysis.intent}).
Already found recipes in external/local databases: ${avoidList || 'none'}.

Task: Suggest ${desiredCount} authentic, well-known, distinct recipes that directly match or represent key missing popular variations of "${analysis.englishQuery}" (for example: if searching "noodles", include missing classics like Hakka Noodles, Vegetable Stir-Fried Noodles, Chicken Ramen, Soup Noodles; if searching "potato", include Crispy French Fries, Spiced Potato Wedges, Garlic Mashed Potatoes; if searching in Bangla, match authentic Bangladeshi or popular global recipes).
Rules:
1. Do NOT duplicate any of the already-found titles listed above.
2. Every recipe must be 100% relevant to "${analysis.originalQuery}". Never return unrelated chicken/meat dishes for a vegetable/noodle query unless requested.
3. Provide accurate realistic prepTime, cookTime, servings, estimated calories, protein, carbs, fat, and fiber, plus both English and Bangla names/descriptions and health highlights.
4. Provide 5-8 clear ingredients with quantities (name & nameBn) and 4-6 clear cooking steps in BOTH English (instructions) and natural Bangla (instructionsBn).`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  idSlug: { type: Type.STRING },
                  name: { type: Type.STRING },
                  nameBn: { type: Type.STRING },
                  cuisine: { type: Type.STRING },
                  category: { type: Type.STRING },
                  mealType: { type: Type.STRING },
                  prepTime: { type: Type.INTEGER },
                  cookTime: { type: Type.INTEGER },
                  servings: { type: Type.INTEGER },
                  caloriesPerServing: { type: Type.INTEGER },
                  proteinPerServing: { type: Type.NUMBER },
                  carbsPerServing: { type: Type.NUMBER },
                  fatPerServing: { type: Type.NUMBER },
                  fiberPerServing: { type: Type.NUMBER },
                  isVegetarian: { type: Type.BOOLEAN },
                  isHalal: { type: Type.BOOLEAN },
                  description: { type: Type.STRING },
                  descriptionBn: { type: Type.STRING },
                  healthHighlight: { type: Type.STRING },
                  healthHighlightBn: { type: Type.STRING },
                  ingredients: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        nameBn: { type: Type.STRING },
                        amount: { type: Type.NUMBER },
                        unit: { type: Type.STRING },
                      },
                      required: ['name', 'amount', 'unit'],
                    },
                  },
                  instructions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  instructionsBn: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['idSlug', 'name', 'nameBn', 'cuisine', 'mealType', 'ingredients', 'instructions', 'instructionsBn'],
              },
            },
          },
          required: ['recipes'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (!Array.isArray(parsed.recipes)) return [];

    return parsed.recipes.map((item: any, idx: number): Recipe => {
      const safeMealType =
        item.mealType === 'breakfast' || item.mealType === 'lunch' || item.mealType === 'dinner' || item.mealType === 'snack'
          ? item.mealType
          : 'lunch';
      const title = String(item.name || 'Culinary Dish').trim();
      const titleBn = String(item.nameBn || title).trim();
      const ings: Ingredient[] = Array.isArray(item.ingredients)
        ? item.ingredients.map((ing: any) => {
            const rawName = String(ing.name || 'Ingredient').trim();
            const rawUnit = String(ing.unit || 'pcs').trim();
            const bnName =
              ing.nameBn && hasBanglaText(ing.nameBn)
                ? String(ing.nameBn).trim()
                : translateIngredientToBn(rawName);
            const bnUnit = translateUnitToBn(rawUnit);
            return {
              name: rawName,
              nameBn: bnName,
              amount: Number(ing.amount) || 1,
              unit: rawUnit,
              unitBn: bnUnit,
              category: 'others',
            };
          })
        : [];
      const steps: string[] = Array.isArray(item.instructions) && item.instructions.length > 0
        ? item.instructions.map(String)
        : ['Prepare ingredients fresh and cook gently until aromatic.'];
      const rawStepsBn: string[] = Array.isArray(item.instructionsBn) && item.instructionsBn.length > 0
        ? item.instructionsBn.map(String)
        : [];
      const stepsBn: string[] = steps.map((enStep, sIdx) => {
        const cand = rawStepsBn[sIdx];
        return cand && hasBanglaText(cand) ? cand : translateCookingStepToBn(enStep);
      });

      const slug = String(item.idSlug || title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      const id = `ai-${slug || 'dish'}-${idx}`;
      const image = resolveRecipeImage({
        id,
        recipeId: id,
        recipeName: title,
        recipeNameBn: titleBn,
        cuisine: item.cuisine,
        source: 'ai_chef',
      });

      return {
        id,
        name: title,
        name_en: title,
        nameBn: titleBn,
        name_bn: titleBn,
        cuisine: String(item.cuisine || 'International'),
        category: String(item.category || 'Culinary Guide'),
        mealType: safeMealType,
        prepTime: Number(item.prepTime) || 15,
        cookTime: Number(item.cookTime) || 20,
        servings: Number(item.servings) || 3,
        caloriesPerServing: Number(item.caloriesPerServing) || 320,
        proteinPerServing: Number(item.proteinPerServing) || 14,
        carbsPerServing: Number(item.carbsPerServing) || 40,
        fatPerServing: Number(item.fatPerServing) || 10,
        fiberPerServing: Number(item.fiberPerServing) || 3.5,
        isVegetarian: Boolean(item.isVegetarian),
        isVegan: false,
        isHalal: item.isHalal !== false,
        isGlutenFree: false,
        image,
        description: String(item.description || ''),
        description_en: String(item.description || ''),
        descriptionBn: String(item.descriptionBn || item.description || ''),
        description_bn: String(item.descriptionBn || item.description || ''),
        ingredients: ings,
        ingredients_en: ings.map((i) => `${i.amount} ${i.unit} ${i.name}`),
        ingredients_bn: ings.map((i) => `${toBanglaDigits(i.amount)} ${i.unitBn} ${i.nameBn}`),
        instructions: steps,
        instructions_en: steps,
        instructionsBn: stepsBn,
        instructions_bn: stepsBn,
        healthHighlight: String(item.healthHighlight || 'Estimated nutritional balance from wholesome culinary ingredients.'),
        healthHighlightBn: String(item.healthHighlightBn || item.healthHighlight || 'উপাদান অনুযায়ী আনুমানিক পুষ্টিমান নির্ধারণ করা হয়েছে।'),
        keywords: [title.toLowerCase(), analysis.englishQuery],
        source: 'ai_chef',
        sourceLabel: 'AaharIQ AI Culinary Guide',
        nutritionStatus: 'ai_estimated',
        nutritionBasis: 'per_serving_recipe',
        nutritionEstimated: true,
        difficulty: 'Medium',
        difficultyBn: 'মাঝারি',
        sugarPerServing: 3,
      };
    });
  } catch {
    return [];
  }
}

const DIET_SUMMARY_TEXT: Record<DietIntentType, { en: string; bn: string }> = {
  healthy_food: {
    en: 'Ranked by nutrient balance: wholesome protein, dietary fiber, fresh vegetables, and moderate portions.',
    bn: 'প্রোটিন, ফাইবার, তাজা সবজি ও সুষম ক্যালোরির ভিত্তিতে স্বাস্থ্যকর খাবারগুলো সাজানো হয়েছে।',
  },
  diet_food: {
    en: 'Selected for nutrient-dense, steady-energy meals with solid protein and fiber under 620 kcal/serving — without extreme restriction.',
    bn: 'প্রতি পরিবেশনে ৬২০ ক্যালোরির মধ্যে পর্যাপ্ত প্রোটিন ও ফাইবারযুক্ত পুষ্টিকর ডায়েট খাবার বাছাই করা হয়েছে।',
  },
  healthy_breakfast: {
    en: 'Morning recipes rich in protein and complex fiber to sustain energy without a sharp sugar spike.',
    bn: 'সকালের জন্য প্রোটিন ও জটিল শর্করা-সমৃদ্ধ নাস্তা যা দীর্ঘক্ষণ শক্তি জোগায়।',
  },
  healthy_lunch: {
    en: 'Midday balanced meals combining complex grains, quality protein, and vegetables.',
    bn: 'দুপুরের জন্য শস্য, প্রোটিন ও সবজির সুষম সমন্বয়ের খাবার।',
  },
  healthy_dinner: {
    en: 'Wholesome, lighter evening recipes with satisfying protein and vegetables.',
    bn: 'রাতের জন্য সহজপাচ্য ও পুষ্টিকর প্রোটিন-সবজিসমৃদ্ধ খাবার।',
  },
  high_protein: {
    en: 'Evaluated by protein content (>= 20g per serving or >= 22% of calories from protein).',
    bn: 'প্রতি পরিবেশনে ২০ গ্রাম+ প্রোটিন বা মোট ক্যালোরির ২২%+ প্রোটিন অনুযায়ী সাজানো।',
  },
  high_fiber: {
    en: 'Evaluated by actual dietary fiber (>= 4.5g per serving) from lentils, oats, whole grains, and greens.',
    bn: 'ডাল, ওটস, পূর্ণ শস্য ও সবুজ শাকসবজি থেকে প্রাপ্ত ৪.৫ গ্রাম+ ফাইবার অনুযায়ী সাজানো।',
  },
  low_sugar: {
    en: 'Savory, nutrient-dense dishes with minimal free/added sugar (<= 6g estimated sugar per serving).',
    bn: 'স্বল্প চিনিযুক্ত (প্রতি পরিবেশনে ৬ গ্রাম বা কম) সুষম ও ঝাল-মসলাদার পদসমূহ।',
  },
  balanced_meal: {
    en: 'Complete meals pairing steady carbs, protein (>= 12g), and dietary fiber (>= 3g).',
    bn: 'শর্করা, প্রোটিন (১২ গ্রাম+) ও আঁশ (৩ গ্রাম+)-এর পূর্ণাঙ্গ ভারসাম্যসমৃদ্ধ খাবার।',
  },
  vegetable_recipes: {
    en: 'Plant-forward vegetable & legume dishes evaluated from actual ingredient composition.',
    bn: 'প্রকৃত উপকরণ বিশ্লেষণের মাধ্যমে বাছাইকৃত সবজি ও ডাল-নির্ভর স্বাস্থ্যকর পদ।',
  },
  nutritious_snacks: {
    en: 'Steamed, savory, or light snacks under 330 kcal with meaningful protein or fiber.',
    bn: '৩৩০ ক্যালোরির নিচে ভাপানো বা হালকা পুষ্টিকর নাস্তা।',
  },
};

function evaluateDietIntentMatch(
  recipe: Recipe,
  dietIntent: DietIntentType
): { score: number; matchType: 'exact' | 'related'; matchReason: string; nutritionMatchReason: string; nutritionMatchReasonBn: string } | null {
  const nameLower = (recipe.name_en || recipe.name).toLowerCase();
  const catLower = (recipe.category || '').toLowerCase();
  const ingText = recipe.ingredients.map((i) => i.name.toLowerCase()).join(' ');
  const cal = recipe.caloriesPerServing || 0;
  const protein = recipe.proteinPerServing || 0;
  const fiber = recipe.fiberPerServing || 0;
  const sugar = typeof recipe.sugarPerServing === 'number' ? recipe.sugarPerServing : 3.5;
  const proteinRatio = cal > 0 ? (protein * 4) / cal : 0;

  const isSweetOrDeepFried =
    catLower.includes('dessert') ||
    nameLower.includes('pitha') ||
    nameLower.includes('french fries') ||
    nameLower.includes('cake') ||
    sugar >= 10;

  const hasVeggieIngredients =
    /spinach|shaak|amaranth|cabbage|broccoli|tomato|pepper|okra|cauliflower|eggplant|carrot|mushroom|lentil|dal|bean|chickpea|vegetable/.test(
      `${nameLower} ${ingText}`
    );

  if (dietIntent === 'high_protein') {
    if (protein >= 20 || proteinRatio >= 0.22) {
      return {
        score: 180 + protein * 2 + (proteinRatio >= 0.25 ? 25 : 0),
        matchType: protein >= 22 || proteinRatio >= 0.24 ? 'exact' : 'related',
        matchReason: `${protein}g Protein / serving`,
        nutritionMatchReason: `${protein}g protein per serving (${Math.round(proteinRatio * 100)}% of calories) • ${cal} kcal`,
        nutritionMatchReasonBn: `প্রতি পরিবেশনে ${toBanglaDigits(protein)} গ্রাম প্রোটিন (${toBanglaDigits(Math.round(proteinRatio * 100))}% ক্যালোরি) • ${toBanglaDigits(cal)} ক্যালোরি`,
      };
    }
    return null;
  }

  if (dietIntent === 'high_fiber') {
    if (fiber >= 4.5) {
      return {
        score: 175 + fiber * 8 + (hasVeggieIngredients ? 15 : 0),
        matchType: fiber >= 6 ? 'exact' : 'related',
        matchReason: `${fiber}g Fiber / serving`,
        nutritionMatchReason: `${fiber}g dietary fiber per serving from legumes, whole grains, or greens`,
        nutritionMatchReasonBn: `ডাল, শস্য বা শাকসবজি থেকে প্রতি পরিবেশনে ${toBanglaDigits(fiber)} গ্রাম আঁশ (ফাইবার)`,
      };
    }
    return null;
  }

  if (dietIntent === 'low_sugar') {
    if (sugar <= 6 && !catLower.includes('dessert') && protein >= 8) {
      return {
        score: 165 + protein + fiber * 4 - sugar * 5,
        matchType: sugar <= 4 ? 'exact' : 'related',
        matchReason: `Low sugar (~${sugar}g)`,
        nutritionMatchReason: `Low natural/added sugar (~${sugar}g/serving) with ${protein}g protein & ${fiber}g fiber`,
        nutritionMatchReasonBn: `কম চিনি (~${toBanglaDigits(sugar)} গ্রাম/পরিবেশন) এবং ${toBanglaDigits(protein)} গ্রাম প্রোটিন ও ${toBanglaDigits(fiber)} গ্রাম ফাইবার`,
      };
    }
    return null;
  }

  if (dietIntent === 'healthy_breakfast') {
    const isBreakfast = recipe.mealType === 'breakfast' || /oat|chilla|egg|dosa|bhurji|shakshuka|khichuri/.test(nameLower);
    if (isBreakfast && protein >= 8 && fiber >= 2 && sugar <= 8 && cal <= 540) {
      const exactMatch = recipe.mealType === 'breakfast' && protein >= 10 && fiber >= 2.5;
      const curatedBonus = recipe.source === 'aahariq_curated' ? 35 : 0;
      return {
        score: (recipe.mealType === 'breakfast' ? 190 : 140) + protein * 1.5 + fiber * 8 + curatedBonus,
        matchType: exactMatch ? 'exact' : 'related',
        matchReason: 'Protein & Fiber Morning Meal',
        nutritionMatchReason: `Balanced morning plate: ${protein}g protein, ${fiber}g fiber, ~${sugar}g sugar (${cal} kcal)`,
        nutritionMatchReasonBn: `সকালের সুষম নাস্তা: ${toBanglaDigits(protein)} গ্রাম প্রোটিন, ${toBanglaDigits(fiber)} গ্রাম ফাইবার ও ~${toBanglaDigits(sugar)} গ্রাম চিনি`,
      };
    }
    return null;
  }

  if (dietIntent === 'healthy_lunch') {
    if ((recipe.mealType === 'lunch' || recipe.mealType === 'dinner') && !isSweetOrDeepFried && protein >= 12 && fiber >= 3 && cal <= 640) {
      return {
        score: (recipe.mealType === 'lunch' ? 190 : 140) + protein + fiber * 4,
        matchType: recipe.mealType === 'lunch' ? 'exact' : 'related',
        matchReason: 'Balanced Healthy Lunch',
        nutritionMatchReason: `Sustained midday nutrition: ${cal} kcal, ${protein}g protein, ${fiber}g fiber`,
        nutritionMatchReasonBn: `দুপুরের পুষ্টিকর খাবার: ${toBanglaDigits(cal)} ক্যালোরি, ${toBanglaDigits(protein)} গ্রাম প্রোটিন ও ${toBanglaDigits(fiber)} গ্রাম ফাইবার`,
      };
    }
    return null;
  }

  if (dietIntent === 'healthy_dinner') {
    if ((recipe.mealType === 'dinner' || recipe.mealType === 'lunch') && !isSweetOrDeepFried && protein >= 12 && fiber >= 3 && cal <= 560) {
      return {
        score: (recipe.mealType === 'dinner' ? 190 : 140) + protein + fiber * 4 + (cal <= 460 ? 20 : 0),
        matchType: recipe.mealType === 'dinner' ? 'exact' : 'related',
        matchReason: 'Wholesome Dinner Option',
        nutritionMatchReason: `Light yet satisfying dinner: ${cal} kcal, ${protein}g protein, ${fiber}g fiber`,
        nutritionMatchReasonBn: `রাতের সুষম ও হালকা খাবার: ${toBanglaDigits(cal)} ক্যালোরি, ${toBanglaDigits(protein)} গ্রাম প্রোটিন`,
      };
    }
    return null;
  }

  if (dietIntent === 'nutritious_snacks') {
    if ((recipe.mealType === 'snack' || cal <= 340) && !isSweetOrDeepFried && fiber >= 2 && protein >= 6) {
      return {
        score: (recipe.mealType === 'snack' ? 190 : 145) + protein * 2 + fiber * 5,
        matchType: recipe.mealType === 'snack' && cal <= 310 ? 'exact' : 'related',
        matchReason: 'Nutritious Light Snack',
        nutritionMatchReason: `Light ${cal} kcal portion providing ${protein}g protein & ${fiber}g fiber without heavy frying`,
        nutritionMatchReasonBn: `মাত্র ${toBanglaDigits(cal)} ক্যালোরিতে ${toBanglaDigits(protein)} গ্রাম প্রোটিন ও ${toBanglaDigits(fiber)} গ্রাম ফাইবারযুক্ত নাস্তা`,
      };
    }
    return null;
  }

  if (dietIntent === 'vegetable_recipes') {
    const noHeavyMeat = !/chicken|beef|mutton|lamb|shrimp|prawn|fish|salmon|ilish|rui/.test(`${nameLower} ${ingText}`);
    if ((recipe.isVegetarian || noHeavyMeat) && hasVeggieIngredients && !catLower.includes('dessert')) {
      return {
        score: (recipe.isVegetarian ? 185 : 135) + fiber * 8 + protein * 1.5,
        matchType: recipe.isVegetarian && hasVeggieIngredients ? 'exact' : 'related',
        matchReason: 'Plant-Rich Vegetable Recipe',
        nutritionMatchReason: `Plant-forward dish delivering ${fiber}g fiber & ${protein}g protein from vegetables and pulses`,
        nutritionMatchReasonBn: `তাজা সবজি ও ডাল থেকে ${toBanglaDigits(fiber)} গ্রাম ফাইবার ও ${toBanglaDigits(protein)} গ্রাম প্রোটিন`,
      };
    }
    return null;
  }

  // 'healthy_food', 'diet_food', 'balanced_meal'
  if (!isSweetOrDeepFried && protein >= 11 && fiber >= 2.8 && cal >= 160 && cal <= 620) {
    const isTopHealthy = protein >= 15 && fiber >= 4 && cal <= 540;
    return {
      score: (isTopHealthy ? 190 : 145) + protein * 1.6 + fiber * 5 + (hasVeggieIngredients ? 15 : 0),
      matchType: isTopHealthy ? 'exact' : 'related',
      matchReason: `${cal} kcal • ${protein}g P • ${fiber}g Fiber`,
      nutritionMatchReason: `Balanced nutrition profile: ${protein}g protein, ${fiber}g fiber, ~${sugar}g sugar (${cal} kcal)`,
      nutritionMatchReasonBn: `সুষম পুষ্টি প্রোফাইল: ${toBanglaDigits(protein)} গ্রাম প্রোটিন, ${toBanglaDigits(fiber)} গ্রাম ফাইবার ও ${toBanglaDigits(cal)} ক্যালোরি`,
    };
  }
  return null;
}

function scoreAndClassifyRecipe(
  recipe: Recipe,
  analysis: UniversalQueryAnalysis
): { score: number; matchType: 'exact' | 'related'; matchReason: string; nutritionMatchReason?: string; nutritionMatchReasonBn?: string } | null {
  if (analysis.intent === 'empty') {
    return { score: 0, matchType: 'exact', matchReason: 'Curated AaharIQ Selection' };
  }

  if (analysis.intent === 'diet' && analysis.dietIntent) {
    return evaluateDietIntentMatch(recipe, analysis.dietIntent);
  }

  const nameEn = normalizeBengaliText(recipe.name_en || recipe.name);
  const nameBn = normalizeBengaliText(recipe.name_bn || recipe.nameBn);
  const category = normalizeBengaliText(recipe.category || '');
  const cuisine = normalizeBengaliText(recipe.cuisine || '');
  const countryText = normalizeBengaliText(
    `${recipe.country || ''} ${recipe.regionalStyle || ''} ${(recipe.tags || []).join(' ')}`
  );
  const keywordsText = normalizeBengaliText((recipe.keywords || []).join(' '));
  const ingText = normalizeBengaliText(
    recipe.ingredients.map((i) => `${i.name} ${i.nameBn}`).join(' ')
  );
  const descText = normalizeBengaliText(
    `${recipe.description} ${recipe.descriptionBn} ${keywordsText} ${countryText}`
  );

  // Strict guard: never match Shakshuka when user asks for leafy greens ("শাক" / "spinach")
  const isLeafyShak =
    !analysis.correctedQuery.toLowerCase().includes('shakshuka') &&
    !analysis.correctedQuery.includes('শাকশুকা') &&
    (analysis.exactTerms.includes('শাক') || analysis.englishQuery === 'spinach');
  if (isLeafyShak && recipe.id.includes('shakshuka')) {
    return null;
  }

  const normCore = normalizeBengaliText(analysis.englishQuery);
  const normCorrected = normalizeBengaliText(analysis.correctedQuery);
  const queryWords = normCore
    .split(/\s+/)
    .filter((w) => w && w !== 'style' && w !== 'recipe' && w !== 'recipes' && w !== 'dish');

  // Strict dish-anchor enforcement so "Chicken Pizza", "Vegetable Pizza", "Bangladesh Style Pizza",
  // "Margherita", "Biryani", "Noodles", "Ramen", "Pasta", "Momo", "Sushi", "Cabbage" NEVER leak unrelated dishes!
  const titleCatText = `${nameEn} ${nameBn} ${category} ${keywordsText}`;
  const fullText = `${titleCatText} ${cuisine} ${countryText} ${ingText} ${descText}`;

  const detectedAnchors = STRICT_DISH_ANCHORS.filter((anchor) => queryWords.includes(anchor));
  if (detectedAnchors.length > 0) {
    const matchesAnchorConcept = detectedAnchors.some((anchor) => {
      if (anchor === 'pizza') {
        return (
          titleCatText.includes('pizza') ||
          titleCatText.includes('margherita') ||
          titleCatText.includes('পিজ্জা') ||
          titleCatText.includes('পিৎজা')
        );
      }
      if (anchor === 'margherita') {
        return titleCatText.includes('margherita') || titleCatText.includes('মার্গারিটা');
      }
      if (anchor === 'pasta') {
        return (
          titleCatText.includes('pasta') ||
          titleCatText.includes('spaghetti') ||
          titleCatText.includes('fettuccine') ||
          titleCatText.includes('penne') ||
          titleCatText.includes('linguine') ||
          titleCatText.includes('lasagna') ||
          titleCatText.includes('lasagne') ||
          titleCatText.includes('macaroni') ||
          titleCatText.includes('পাস্তা')
        );
      }
      if (anchor === 'biryani' || anchor === 'biriyani') {
        return (
          titleCatText.includes('biryani') ||
          titleCatText.includes('biriyani') ||
          titleCatText.includes('kacchi') ||
          titleCatText.includes('বিরিয়ানি') ||
          titleCatText.includes('বিরিয়ানি') ||
          titleCatText.includes('কাচ্চি')
        );
      }
      if (anchor === 'noodles' || anchor === 'noodle') {
        return (
          titleCatText.includes('noodle') ||
          titleCatText.includes('ramen') ||
          titleCatText.includes('chow mein') ||
          titleCatText.includes('pad thai') ||
          titleCatText.includes('laksa') ||
          /\budon\b/.test(titleCatText) ||
          titleCatText.includes('vermicelli') ||
          titleCatText.includes('নুডুলস') ||
          titleCatText.includes('রামেন') ||
          titleCatText.includes('চাওমিন')
        );
      }
      if (anchor === 'ramen') {
        return (
          titleCatText.includes('ramen') ||
          /\budon\b/.test(titleCatText) ||
          titleCatText.includes('noodle') ||
          titleCatText.includes('রামেন') ||
          titleCatText.includes('নুডুলস')
        );
      }
      if (anchor === 'cabbage' || anchor === 'bandhakopi') {
        return (
          fullText.includes('cabbage') ||
          fullText.includes('bandhakopi') ||
          fullText.includes('বাঁধাকপি')
        );
      }
      if (anchor === 'sushi') {
        return (
          titleCatText.includes('sushi') ||
          titleCatText.includes('maki') ||
          titleCatText.includes('nigiri') ||
          titleCatText.includes('সুশি')
        );
      }
      if (anchor === 'momo') {
        return (
          titleCatText.includes('momo') ||
          titleCatText.includes('dumpling') ||
          titleCatText.includes('মোমো')
        );
      }
      if (anchor === 'dumpling' || anchor === 'dumplings') {
        return (
          titleCatText.includes('dumpling') ||
          titleCatText.includes('momo') ||
          titleCatText.includes('jiaozi') ||
          titleCatText.includes('ডাম্পলিং') ||
          titleCatText.includes('মোমো')
        );
      }
      if (anchor === 'taco' || anchor === 'tacos') {
        return (
          titleCatText.includes('taco') ||
          titleCatText.includes('টাকো')
        );
      }
      if (anchor === 'dal') {
        return (
          titleCatText.includes('dal') ||
          titleCatText.includes('daal') ||
          titleCatText.includes('lentil') ||
          titleCatText.includes('ডাল')
        );
      }
      if (anchor === 'kimchi') {
        return titleCatText.includes('kimchi') || titleCatText.includes('কিমচি');
      }
      if (anchor === 'paneer') {
        return titleCatText.includes('paneer') || titleCatText.includes('পনির');
      }
      if (anchor === 'bhorta') {
        return titleCatText.includes('bhorta') || titleCatText.includes('bharta') || titleCatText.includes('ভর্তা');
      }
      if (anchor === 'pitha') {
        return titleCatText.includes('pitha') || titleCatText.includes('পিঠা');
      }
      if (anchor === 'panta') {
        return titleCatText.includes('panta') || titleCatText.includes('পান্তা');
      }
      return titleCatText.includes(anchor) || fullText.includes(anchor);
    });

    if (!matchesAnchorConcept) {
      return null;
    }
  }

  // Strict vegetarian guard when user explicitly asks for "Vegetable Pizza" / "Vegetarian ..."
  const asksVegetablePizza =
    detectedAnchors.includes('pizza') &&
    (queryWords.includes('vegetable') || queryWords.includes('vegetarian') || queryWords.includes('veggie'));
  if (asksVegetablePizza && !recipe.isVegetarian) {
    return null;
  }

  const tokens = Array.from(
    new Set([
      normCore,
      normCorrected,
      ...analysis.exactTerms,
      ...expandBilingualTokens(analysis.correctedQuery),
    ].filter((t) => t && t.length >= 2))
  );
  const relatedTokens = analysis.relatedVariations.map((v) => normalizeBengaliText(v));

  const titleExact =
    nameEn.includes(normCore) ||
    nameBn.includes(normCore) ||
    nameEn.includes(normCorrected) ||
    nameBn.includes(normCorrected);

  const nonAnchorModifiers = queryWords.filter((w) => !STRICT_DISH_ANCHORS.includes(w));
  const matchesModifier = (mod: string): boolean => {
    if (mod === 'bangladesh' || mod === 'bangladeshi') {
      return (
        fullText.includes('bangladesh') ||
        fullText.includes('bengali') ||
        fullText.includes('tandoori') ||
        cuisine.includes('bangladeshi') ||
        nameBn.includes('বাংলাদেশি')
      );
    }
    if (mod === 'vegetable' || mod === 'vegetables') {
      return (
        fullText.includes('vegetable') ||
        fullText.includes('veggie') ||
        fullText.includes('vegetarian') ||
        recipe.isVegetarian
      );
    }
    return fullText.includes(mod);
  };

  const allWordsMatch =
    queryWords.length > 0 &&
    queryWords.every((w) =>
      STRICT_DISH_ANCHORS.includes(w) ? detectedAnchors.length > 0 : matchesModifier(w)
    );

  // For single-word queries, check tokens against title/ingredients/category;
  // for multi-word anchored queries, avoid letting just the modifier ("chicken" or "bangladeshi") trigger false exact hits.
  const effectiveTokens =
    queryWords.length > 1 && detectedAnchors.length > 0
      ? tokens.filter((t) => !nonAnchorModifiers.includes(t))
      : tokens;

  const titleTokenHit = effectiveTokens.some((tok) => nameEn.includes(tok) || nameBn.includes(tok));
  const ingTokenHit = effectiveTokens.some((tok) => ingText.includes(tok));
  const catTokenHit = effectiveTokens.some((tok) => category.includes(tok) || cuisine.includes(tok));
  const relatedTitleHit = relatedTokens.some((tok) => tok && (nameEn.includes(tok) || nameBn.includes(tok)));
  const anyTokenHit =
    detectedAnchors.length > 0 ||
    effectiveTokens.some((tok) => fullText.includes(tok)) ||
    relatedTokens.some((tok) => tok && fullText.includes(tok));

  if (!anyTokenHit) {
    return null;
  }

  let score = 0;
  if (titleExact) score += 160;
  else if (allWordsMatch && queryWords.length > 1) score += 150;
  else if (titleTokenHit) score += 100;

  if (ingTokenHit) score += 45;
  if (catTokenHit) score += 30;
  if (relatedTitleHit) score += 25;
  if (recipe.source === 'aahariq_curated') score += 20;
  else if (recipe.source === 'themealdb') score += 12;

  // Prefer dishes whose title explicitly mentions requested modifiers (e.g., "Vegetable Pizza" -> "Garden Roasted Vegetable & Olive Pizza" #1)
  for (const mod of nonAnchorModifiers) {
    if (nameEn.includes(mod) || nameBn.includes(mod)) {
      score += 45;
    }
  }

  // Prefer exact Ramen dishes before broader noodles when querying Ramen
  if (normCore === 'ramen' && titleCatText.includes('ramen')) {
    score += 90;
  }

  const isExact =
    queryWords.length > 1 && detectedAnchors.length > 0
      ? titleExact || allWordsMatch
      : titleExact || titleTokenHit || (ingTokenHit && queryWords.length <= 1);
  const matchType: 'exact' | 'related' = isExact ? 'exact' : 'related';

  let matchReason = 'Related Recipe Variation';
  if (titleExact) {
    matchReason = 'Exact Title Match';
  } else if (allWordsMatch && queryWords.length > 1) {
    matchReason = `Matches "${analysis.correctedQuery}"`;
  } else if (titleTokenHit) {
    matchReason = `Matches "${analysis.correctedQuery}"`;
  } else if (ingTokenHit) {
    matchReason = `Uses ${analysis.englishQuery}`;
  } else if (detectedAnchors.length > 0) {
    matchReason = `Related ${detectedAnchors[0]} dish`;
  } else if (relatedTitleHit) {
    matchReason = `Related ${analysis.englishQuery} dish`;
  }

  return { score, matchType, matchReason };
}

function deduplicateAndEnsureImages(scored: Array<{ recipe: Recipe; score: number }>): Recipe[] {
  scored.sort((a, b) => b.score - a.score);

  const seenIds = new Set<string>();
  const seenTitles = new Set<string>();
  const unique: Recipe[] = [];

  for (const { recipe } of scored) {
    const normTitle = (recipe.name_en || recipe.name)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

    if (seenIds.has(recipe.id) || (normTitle && seenTitles.has(normTitle))) {
      continue;
    }

    seenIds.add(recipe.id);
    if (normTitle) seenTitles.add(normTitle);

    const safeImage = resolveRecipeImage({
      id: recipe.id,
      recipeId: recipe.id,
      recipeName: recipe.name,
      recipeNameBn: recipe.nameBn,
      cuisine: recipe.cuisine,
      image: recipe.image,
      imageUrl: recipe.image,
      source: recipe.source,
    });

    unique.push({
      ...recipe,
      image: safeImage,
    });
  }

  return unique;
}

interface ExternalCacheEntry {
  timestamp: number;
  recipes: Recipe[];
  reachable: boolean;
}

const EXTERNAL_API_CACHE = new Map<string, ExternalCacheEntry>();

async function fetchExternalRecipesCached(
  analysis: UniversalQueryAnalysis,
  activeCountry = ''
): Promise<{ recipes: Recipe[]; reachable: boolean }> {
  const key = `${analysis.englishQuery.toLowerCase().trim()}::${activeCountry.toLowerCase() || 'all'}`;
  const cached = EXTERNAL_API_CACHE.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { recipes: cached.recipes, reachable: cached.reachable };
  }

  const mealDb = await queryTheMealDB(analysis, activeCountry);

  if (mealDb.reachable) {
    if (EXTERNAL_API_CACHE.size >= MAX_CACHE_ENTRIES) {
      const oldest = EXTERNAL_API_CACHE.keys().next().value;
      if (oldest) EXTERNAL_API_CACHE.delete(oldest);
    }
    EXTERNAL_API_CACHE.set(key, {
      timestamp: Date.now(),
      recipes: mealDb.recipes,
      reachable: true,
    });
  }

  return mealDb;
}

export async function runUniversalRecipeSearch(
  params: UniversalSearchParams
): Promise<UniversalSearchResponse> {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.min(24, Math.max(4, Number(params.limit) || 12));
  const activeCountry = normalizeCountryKey(params.country || params.cuisine || '');
  const analysis = analyzeUniversalQuery(params.query || '');
  const cacheKey = `${normalizeBengaliText(analysis.correctedQuery || '__empty__')}::${activeCountry.toLowerCase() || 'all'}`;

  let cached = SEARCH_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp > CACHE_TTL_MS) {
    SEARCH_CACHE.delete(cacheKey);
    cached = undefined;
  }

  let unifiedRecipes: Recipe[];
  let sourcesUsed: string[];
  let externalApiAvailable = true;

  if (cached) {
    unifiedRecipes = cached.recipes;
    sourcesUsed = cached.sourcesUsed;
    externalApiAvailable = cached.externalApiAvailable;
  } else if (analysis.intent === 'empty') {
    const baseCurated = RECIPES_DATABASE.map((r) => ({
      ...r,
      matchType: 'exact' as const,
      matchReason: 'AaharIQ Verified Curated Recipe',
      image: resolveRecipeImage(r),
    }));

    // When a country filter is selected with no search text, also fetch country dishes from TheMealDB
    if (activeCountry) {
      const external = await fetchExternalRecipesCached(analysis, activeCountry);
      externalApiAvailable = external.reachable;
      const merged = deduplicateAndEnsureImages(
        [...baseCurated, ...external.recipes].map((r, i) => ({
          recipe: {
            ...r,
            matchType: 'exact' as const,
            matchReason: r.source === 'aahariq_curated' ? 'AaharIQ Verified Curated Recipe' : 'TheMealDB Country Catalog',
          },
          score: r.source === 'aahariq_curated' ? 100 - i * 0.01 : 50 - i * 0.01,
        }))
      );
      unifiedRecipes = merged;
    } else {
      unifiedRecipes = baseCurated;
      externalApiAvailable = true;
    }

    const actualSources = new Set<string>();
    for (const r of unifiedRecipes) {
      if (r.source === 'aahariq_curated') actualSources.add('AaharIQ Curated DB');
      else if (r.source === 'themealdb') actualSources.add('TheMealDB');
    }
    sourcesUsed = actualSources.size > 0 ? Array.from(actualSources) : ['AaharIQ Curated DB'];
  } else {
    // 1. Always score local curated AaharIQ recipes first (reliable local search index)
    const candidates: Recipe[] = [...RECIPES_DATABASE];

    // 2. Query supported external API (TheMealDB) with country-aware lookup + graceful fallback
    const external = await fetchExternalRecipesCached(analysis, activeCountry);
    externalApiAvailable = external.reachable;
    if (external.recipes.length > 0) {
      candidates.push(...external.recipes);
    }

    const realScored: Array<{ recipe: Recipe; score: number }> = [];
    for (const c of candidates) {
      const evaluated = scoreAndClassifyRecipe(c, analysis);
      if (evaluated) {
        realScored.push({
          recipe: {
            ...c,
            matchType: evaluated.matchType,
            matchReason: evaluated.matchReason,
            nutritionMatchReason: evaluated.nutritionMatchReason || c.nutritionMatchReason,
            nutritionMatchReasonBn: evaluated.nutritionMatchReasonBn || c.nutritionMatchReasonBn,
          },
          score: evaluated.score,
        });
      }
    }

    // 3. Only optionally invoke Gemini complementary guide when NO strict country filter is restricting results
    // so we never fabricate/invent country-specific dishes when a country genuinely has none.
    if (!activeCountry) {
      const currentTitles = realScored.map((s) => s.recipe.name);
      const aiRecipes = await queryGeminiComplementaryRecipes(
        analysis,
        realScored.length,
        currentTitles
      );

      if (aiRecipes.length > 0) {
        for (const aiRec of aiRecipes) {
          const evaluated = scoreAndClassifyRecipe(aiRec, analysis);
          if (evaluated) {
            realScored.push({
              recipe: {
                ...aiRec,
                matchType: evaluated.matchType,
                matchReason: evaluated.matchReason,
              },
              score: evaluated.score - 8,
            });
          }
        }
      }
    }

    unifiedRecipes = deduplicateAndEnsureImages(realScored);

    const actualSources = new Set<string>();
    for (const r of unifiedRecipes) {
      if (r.source === 'aahariq_curated') actualSources.add('AaharIQ Curated DB');
      else if (r.source === 'themealdb') actualSources.add('TheMealDB');
      else if (r.source === 'ai_chef') actualSources.add('AaharIQ AI Culinary Guide');
    }
    sourcesUsed = actualSources.size > 0 ? Array.from(actualSources) : ['AaharIQ Curated DB'];

    if (SEARCH_CACHE.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = SEARCH_CACHE.keys().next().value;
      if (oldestKey) SEARCH_CACHE.delete(oldestKey);
    }
    SEARCH_CACHE.set(cacheKey, {
      timestamp: Date.now(),
      analysis,
      recipes: unifiedRecipes,
      sourcesUsed,
      externalApiAvailable,
    });
  }

  // Collect available cuisines & normalized countries across unfiltered discovered results
  const availableCuisines = Array.from(
    new Set(unifiedRecipes.map((r) => r.cuisine).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const countrySet = new Set<string>(SUPPORTED_COUNTRIES);
  for (const r of unifiedRecipes) {
    const nk = normalizeCountryKey(r.country || r.cuisine);
    if (nk) countrySet.add(nk);
  }
  const availableCountries = Array.from(countrySet);

  // Apply interactive user filters: Country/Cuisine, Meal Type, Dietary, Max Time
  const mealTypeFilter = (params.mealType || 'all').trim();
  const dietaryFilter = (params.dietary || 'all').trim();
  const maxTimeFilter = Number(params.maxTime) || 120;

  const filtered = unifiedRecipes.filter((r) => {
    if (activeCountry && !recipeMatchesCountry(r, activeCountry)) return false;
    if (mealTypeFilter !== 'all' && r.mealType !== mealTypeFilter) return false;
    if (dietaryFilter === 'vegetarian' && !r.isVegetarian) return false;
    if (dietaryFilter === 'vegan' && !r.isVegan) return false;
    if (dietaryFilter === 'halal' && !r.isHalal) return false;
    if (dietaryFilter === 'glutenFree' && !r.isGlutenFree) return false;
    if (r.prepTime + r.cookTime > maxTimeFilter) return false;
    return true;
  });

  // Update sourcesUsed to accurately reflect sources in the country-filtered set if activeCountry is set
  const activeSources = new Set<string>();
  for (const r of filtered) {
    if (r.source === 'aahariq_curated') activeSources.add('AaharIQ Curated DB');
    else if (r.source === 'themealdb') activeSources.add('TheMealDB');
    else if (r.source === 'ai_chef') activeSources.add('AaharIQ AI Culinary Guide');
  }
  const reportedSources =
    filtered.length > 0 && activeSources.size > 0
      ? Array.from(activeSources)
      : activeCountry
      ? ['AaharIQ Curated DB', ...(externalApiAvailable ? ['TheMealDB'] : [])]
      : sourcesUsed;

  // Sort exact matches strictly before related variations while preserving score rank within each bucket
  const exactBucket = filtered.filter((r) => r.matchType === 'exact');
  const relatedBucket = filtered.filter((r) => r.matchType !== 'exact');
  const ordered = [...exactBucket, ...relatedBucket];

  const startIdx = (page - 1) * limit;
  let pagedRecipes = ordered.slice(startIdx, startIdx + limit);

  if (params.language === 'bn') {
    pagedRecipes = await enrichBanglaRecipePage(pagedRecipes);
  }

  let emptyCountryMessage: string | undefined;
  if (activeCountry && ordered.length === 0) {
    const labelEn = formatCountryLabel(activeCountry, 'en');
    const labelBn = formatCountryLabel(activeCountry, 'bn');
    emptyCountryMessage =
      params.language === 'bn'
        ? `${labelBn}-এর জন্য "${analysis.correctedQuery || analysis.originalQuery || 'নির্বাচিত ফিল্টার'}" সম্পর্কিত কোনো যাচাইকৃত রেসিপি পাওয়া যায়নি।`
        : `No matching recipe found for ${labelEn}.`;
  }

  const dietMetaText = analysis.dietIntent ? DIET_SUMMARY_TEXT[analysis.dietIntent] : undefined;

  return {
    query: analysis.originalQuery,
    correctedQuery: analysis.correctedQuery,
    wasCorrected: analysis.wasCorrected,
    intent: analysis.intent,
    dietIntent: analysis.dietIntent,
    dietSummary: dietMetaText?.en,
    dietSummaryBn: dietMetaText?.bn,
    englishQuery: analysis.englishQuery,
    selectedCountry: activeCountry,
    recipes: pagedRecipes,
    totalCount: ordered.length,
    exactCount: exactBucket.length,
    relatedCount: relatedBucket.length,
    page,
    limit,
    hasMore: startIdx + pagedRecipes.length < ordered.length,
    availableCuisines,
    availableCountries,
    suggestedQueries: analysis.suggestedQueries,
    sourcesUsed: reportedSources,
    externalApiAvailable,
    emptyCountryMessage,
  };
}

interface BnRecipeTranslation {
  nameBn: string;
  descriptionBn: string;
  ingredientNamesBn: string[];
  instructionsBn: string[];
}

const BN_TRANSLATION_CACHE = new Map<string, BnRecipeTranslation>();

async function enrichBanglaRecipePage(recipes: Recipe[]): Promise<Recipe[]> {
  // Apply cached translations first + identify recipes needing translation
  const needsGemini: Recipe[] = [];
  for (const r of recipes) {
    if (r.source === 'aahariq_curated') continue;
    const cached = BN_TRANSLATION_CACHE.get(r.id);
    if (cached) continue;
    const missingTitleBn = !hasBanglaText(r.nameBn);
    const missingStepsBn = !r.instructionsBn?.some((s) => hasBanglaText(s));
    const missingAnyIngBn = r.ingredients.some((i) => !hasBanglaText(i.nameBn));
    if (missingTitleBn || missingStepsBn || missingAnyIngBn) {
      needsGemini.push(r);
    }
  }

  if (needsGemini.length > 0 && process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const batchPayload = needsGemini.slice(0, 8).map((r) => ({
        id: r.id,
        name: r.name,
        ingredients: r.ingredients.map((i) => i.name),
        instructions: r.instructions.slice(0, 8),
      }));

      const prompt = `Translate these recipes accurately into natural culinary Bengali (বাংলা) so every recipe title, ingredient name, short description, and cooking step reads fluently in Bangla. Keep ingredient order identical.

Input recipes:
${JSON.stringify(batchPayload)}`;

      const aiRes = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              translations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    nameBn: { type: Type.STRING },
                    descriptionBn: { type: Type.STRING },
                    ingredientNamesBn: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    instructionsBn: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ['id', 'nameBn', 'ingredientNamesBn', 'instructionsBn'],
                },
              },
            },
            required: ['translations'],
          },
        },
      });

      const parsed = JSON.parse(aiRes.text || '{}');
      if (Array.isArray(parsed.translations)) {
        for (const tr of parsed.translations) {
          if (tr?.id) {
            BN_TRANSLATION_CACHE.set(String(tr.id), {
              nameBn: String(tr.nameBn || ''),
              descriptionBn: String(tr.descriptionBn || ''),
              ingredientNamesBn: Array.isArray(tr.ingredientNamesBn)
                ? tr.ingredientNamesBn.map(String)
                : [],
              instructionsBn: Array.isArray(tr.instructionsBn)
                ? tr.instructionsBn.map(String)
                : [],
            });
          }
        }
      }
    } catch {
      // Fall back silently to static Bangla ingredient & unit dictionary
    }
  }

  return recipes.map((r) => {
    const cached = BN_TRANSLATION_CACHE.get(r.id);
    const updatedIngredients: Ingredient[] = r.ingredients.map((ing, idx) => {
      const fromCache = cached?.ingredientNamesBn?.[idx];
      const bnName =
        fromCache && hasBanglaText(fromCache)
          ? fromCache
          : hasBanglaText(ing.nameBn)
          ? ing.nameBn
          : translateIngredientToBn(ing.name);
      const bnUnit = hasBanglaText(ing.unitBn) ? ing.unitBn : translateUnitToBn(ing.unit);
      return {
        ...ing,
        nameBn: bnName,
        unitBn: bnUnit,
      };
    });

    const nextNameBn = cached?.nameBn && hasBanglaText(cached.nameBn) ? cached.nameBn : r.nameBn;
    const nextDescBn =
      cached?.descriptionBn && hasBanglaText(cached.descriptionBn)
        ? cached.descriptionBn
        : r.descriptionBn;
    const nextStepsBn =
      cached?.instructionsBn &&
      cached.instructionsBn.length > 0 &&
      cached.instructionsBn.some((s) => hasBanglaText(s))
        ? cached.instructionsBn
        : r.instructionsBn?.some((s) => hasBanglaText(s))
        ? r.instructionsBn.map((s, idx) =>
            hasBanglaText(s) ? s : translateCookingStepToBn(r.instructions[idx] || s)
          )
        : translateCookingStepListToBn(r.instructions);

    return {
      ...r,
      nameBn: nextNameBn,
      name_bn: nextNameBn,
      descriptionBn: nextDescBn,
      description_bn: nextDescBn,
      ingredients: updatedIngredients,
      ingredients_bn: updatedIngredients.map(
        (i) => `${toBanglaDigits(i.amount)} ${i.unitBn} ${i.nameBn}`
      ),
      instructionsBn: nextStepsBn,
      instructions_bn: nextStepsBn,
    };
  });
}

export async function translateSingleRecipeToBn(recipe: Recipe): Promise<Recipe> {
  if (!recipe || !recipe.id) return recipe;
  const enriched = await enrichBanglaRecipePage([recipe]);
  return enriched[0] || recipe;
}

const POPULAR_SUGGESTION_TERMS: Array<{
  text: string;
  sublabelEn: string;
  sublabelBn: string;
  type: 'recipe' | 'ingredient' | 'category';
}> = [
  { text: 'Healthy Breakfast', sublabelEn: 'High protein & fiber morning meals', sublabelBn: 'প্রোটিন ও ফাইবারসমৃদ্ধ সকালের নাস্তা', type: 'category' },
  { text: 'High Protein Food', sublabelEn: '20g+ protein recipes across cuisines', sublabelBn: 'প্রতি পরিবেশনে ২০ গ্রাম+ প্রোটিনযুক্ত খাবার', type: 'category' },
  { text: 'Diet Food', sublabelEn: 'Balanced, nutrient-dense everyday meals', sublabelBn: 'সুষম ও পুষ্টিকর ডায়েট খাবার', type: 'category' },
  { text: 'Khichuri', sublabelEn: 'Bhuna Khichuri, Rice & Lentil Comfort', sublabelBn: 'ভুনা খিচুড়ি ও ডাল-ভাতের সমন্বয়', type: 'recipe' },
  { text: 'Momo', sublabelEn: 'Nepali & Himalayan Steamed Dumplings', sublabelBn: 'নেপালি স্টিমড মোমো', type: 'recipe' },
  { text: 'Biryani', sublabelEn: 'Chicken Biryani, Kacchi, Dum Biryani', sublabelBn: 'চিকেন বিরিয়ানি, কাচ্চি বিরিয়ানি', type: 'recipe' },
  { text: 'Pizza', sublabelEn: 'Bangladesh Style, Chicken, Margherita, Vegetable', sublabelBn: 'বাংলাদেশি স্টাইল, চিকেন, মার্গারিটা, ভেজিটেবল পিজ্জা', type: 'category' },
  { text: 'Bibimbap', sublabelEn: 'Korean Warm Rice, Veggie & Egg Bowl', sublabelBn: 'কোরিয়ান বিবিমবাপ রাইস বোল', type: 'recipe' },
  { text: 'Pad Thai', sublabelEn: 'Thai Stir-Fried Rice Noodles', sublabelBn: 'থাই প্যাড থাই নুডুলস', type: 'recipe' },
  { text: 'Dosa', sublabelEn: 'South Indian Crisp Masala Dosa', sublabelBn: 'মচমচে মসলা দোসা', type: 'recipe' },
  { text: 'Tacos', sublabelEn: 'Mexican Grilled Tacos & Salsa', sublabelBn: 'মেক্সিকান গ্রিলড টাকোস', type: 'recipe' },
  { text: 'Ramen', sublabelEn: 'Japanese Noodle Soup', sublabelBn: 'জাপানি নুডুলস স্যুপ', type: 'recipe' },
  { text: 'Sushi', sublabelEn: 'Japanese Salmon & Avocado Rolls', sublabelBn: 'জাপানি সুশি রোল', type: 'recipe' },
  { text: 'Vegetable Recipes', sublabelEn: 'High-fiber greens, dals & veggie dishes', sublabelBn: 'উচ্চ ফাইবারযুক্ত সবজি ও ডাল রেসিপি', type: 'category' },
  { text: 'High Fiber Food', sublabelEn: 'Lentils, oats & leafy vegetable dishes', sublabelBn: 'ডাল, ওটস ও শাকসবজিসমৃদ্ধ উচ্চ ফাইবার পদ', type: 'category' },
  { text: 'Low-Sugar Meal', sublabelEn: 'Savory low-sugar balanced meals', sublabelBn: 'কম চিনিযুক্ত সুষম খাবার', type: 'category' },
  { text: 'খিচুড়ি', sublabelEn: 'Bangladeshi Bhuna Khichuri', sublabelBn: 'ঐতিহ্যবাহী ভুনা খিচুড়ি', type: 'recipe' },
  { text: 'পিজ্জা', sublabelEn: 'Pizza Recipes', sublabelBn: 'বাংলাদেশি স্টাইল, চিকেন, মার্গারিটা পিজ্জা', type: 'category' },
  { text: 'বিরিয়ানি', sublabelEn: 'Biryani Recipes', sublabelBn: 'চিকেন বিরিয়ানি, কাচ্চি বিরিয়ানি', type: 'recipe' },
  { text: 'বাঁধাকপি', sublabelEn: 'Cabbage & Bandhakopi Recipes', sublabelBn: 'বাঁধাকপি ঘণ্ট, বাঁধাকপি ডাল', type: 'ingredient' },
  { text: 'স্বাস্থ্যকর খাবার', sublabelEn: 'Healthy Balanced Foods', sublabelBn: 'প্রোটিন, ফাইবার ও সবজি-সমৃদ্ধ সুষম খাবার', type: 'category' },
];

export function getRecipeAutocompleteSuggestions(rawQuery: string, language = 'en'): SuggestionItem[] {
  const q = String(rawQuery || '').trim();
  const isBn = language === 'bn';
  const analysis = analyzeUniversalQuery(q);

  if (!q) {
    return POPULAR_SUGGESTION_TERMS.slice(0, 8).map((p) => ({
      text: p.text,
      sublabel: isBn ? p.sublabelBn : p.sublabelEn,
      type: p.type,
    }));
  }

  const results: SuggestionItem[] = [];
  const seen = new Set<string>();

  const pushUnique = (item: SuggestionItem) => {
    const key = item.text.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    results.push(item);
  };

  if (analysis.wasCorrected) {
    pushUnique({
      text: analysis.correctedQuery.replace(/\b\w/g, (c) => c.toUpperCase()),
      sublabel: isBn ? `"${q}" এর সংশোধিত অনুসন্ধান` : `Did you mean "${analysis.correctedQuery}"?`,
      type: 'correction',
    });
  }

  const normQ = normalizeBengaliText(analysis.correctedQuery || q);
  const expanded = expandBilingualTokens(analysis.correctedQuery || q);

  // Match curated recipe titles in both EN and BN
  for (const r of RECIPES_DATABASE) {
    const titleEn = r.name_en || r.name;
    const titleBn = r.name_bn || r.nameBn;
    const nEn = normalizeBengaliText(titleEn);
    const nBn = normalizeBengaliText(titleBn);

    if (
      nEn.includes(normQ) ||
      nBn.includes(normQ) ||
      expanded.some((tok) => tok && (nEn.includes(tok) || nBn.includes(tok)))
    ) {
      pushUnique({
        text: isBn ? titleBn : titleEn,
        sublabel: `${r.cuisine} • ${r.caloriesPerServing} kcal`,
        type: 'recipe',
      });
    }
  }

  // Match broad popular categories & variations
  for (const term of POPULAR_SUGGESTION_TERMS) {
    const nt = normalizeBengaliText(term.text);
    const ns = normalizeBengaliText(`${term.sublabelEn} ${term.sublabelBn}`);
    if (nt.includes(normQ) || ns.includes(normQ) || expanded.some((tok) => tok && nt.includes(tok))) {
      pushUnique({
        text: term.text,
        sublabel: isBn ? term.sublabelBn : term.sublabelEn,
        type: term.type,
      });
    }
  }

  // Add related suggested variations from query analysis
  for (const sq of analysis.suggestedQueries) {
    pushUnique({
      text: sq,
      sublabel: isBn ? 'সম্পর্কিত রেসিপি খুঁজুন' : 'Discover matching recipes',
      type: 'category',
    });
  }

  return results.slice(0, 8);
}
