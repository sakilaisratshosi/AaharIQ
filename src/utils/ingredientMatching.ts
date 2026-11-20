/**
 * NutriSmart AI - SmartChef-Style Ingredient Recognition, Feasibility & Validation Engine
 *
 * Core Capabilities:
 * 1. Smart Bilingual Ingredient Recognition & Normalization (Bangla Unicode variants, English, phonetic spellings)
 * 2. Single-Ingredient & Multi-Ingredient Kitchen Analysis
 * 3. Strict 4-Gate Recipe Relevance Validation (rejects unrelated chicken/fish/egg or generic fallback dishes)
 * 4. Available vs Optional vs Missing Essential Ingredients Categorization
 * 5. Smart Deduplication
 */

export type IngredientCategory =
  | 'protein'
  | 'starch'
  | 'greens'
  | 'vegetable'
  | 'aromatic'
  | 'spice'
  | 'oil'
  | 'dairy'
  | 'pantry';

export interface CanonicalIngredient {
  key: string;
  nameEn: string;
  nameBn: string;
  category: IngredientCategory;
  synonyms: string[];
  isPrimaryStarch?: boolean;
  isPrimaryProtein?: boolean;
  isPrimaryGreens?: boolean;
  isPrimaryVegetable?: boolean;
  substitutes?: { en: string; bn: string }[];
}

/**
 * Normalizes Bengali nukta/ya-fola variants and trims/lowercases text
 * so 'পেঁয়াজ' and 'পেঁয়াজ', 'কুমড়া' and 'কুমড়া', 'খিচুড়ি' and 'খিচুড়ি' match seamlessly.
 */
export function normalizeBilingualText(str: string): string {
  return str
    .replace(/\u09AF\u09BC/g, '\u09AF') // য + nukta -> য
    .replace(/\u09DF/g, '\u09AF') // য় -> য
    .replace(/\u09A1\u09BC/g, '\u09A1') // ড + nukta -> ড
    .replace(/\u09DC/g, '\u09A1') // ড় -> ড
    .replace(/\u09A2\u09BC/g, '\u09A2') // ঢ + nukta -> ঢ
    .replace(/\u09DD/g, '\u09A2') // ঢ় -> ঢ
    .replace(/\u09CE/g, '\u09A4') // ৎ -> ত
    .trim()
    .toLowerCase();
}

export const CANONICAL_INGREDIENTS: CanonicalIngredient[] = [
  // Primary Greens
  {
    key: 'shak',
    nameEn: 'Shak (Spinach / Leafy Greens)',
    nameBn: 'শাক',
    category: 'greens',
    isPrimaryGreens: true,
    synonyms: [
      'shak',
      'shaak',
      'saak',
      'spinach',
      'palak',
      'palong',
      'amaranth',
      'red amaranth',
      'water spinach',
      'kolmi',
      'pui shak',
      'malabar spinach',
      'data shak',
      'leafy greens',
      'greens',
      'শাক',
      'শাকের',
      'শাক ভাজি',
      'শাক ভর্তা',
      'পালং শাক',
      'পালং',
      'লাল শাক',
      'পুঁই শাক',
      'কলমি শাক',
      'ডাঁটা শাক',
      'পাট শাক',
    ],
    substitutes: [
      {
        en: 'Use Red Amaranth (Lal Shaak), Spinach (Palong Shaak), or Malabar Spinach (Pui Shaak)',
        bn: 'লাল শাক, পালং শাক বা পুঁই শাকের যেকোনো একটি দিয়ে করা যায়',
      },
    ],
  },

  // Primary Starches
  {
    key: 'rice',
    nameEn: 'Rice',
    nameBn: 'চাল / ভাত',
    category: 'starch',
    isPrimaryStarch: true,
    synonyms: [
      'rice',
      'basmati',
      'chinigura',
      'kalijeera',
      'gobindobhog',
      'pilaf',
      'pulao',
      'polao',
      'khichuri',
      'khichdi',
      'cooked rice',
      'steamed rice',
      'চাল',
      'ভাত',
      'পোলাও',
      'খিচুড়ি',
      'খিচুড়ি',
      'চিনিগুঁড়া',
      'গোবিন্দভোগ',
      'সাদা ভাত',
    ],
    substitutes: [
      {
        en: 'Brown rice, quinoa, or cauliflower rice for lower glycemic index',
        bn: 'কম ক্যালরির জন্য ব্রাউন রাইস বা ফুলকপি রাইস ব্যবহার করা যায়',
      },
    ],
  },
  {
    key: 'potato',
    nameEn: 'Potato',
    nameBn: 'আলু',
    category: 'starch',
    isPrimaryStarch: true,
    synonyms: [
      'potato',
      'potatoes',
      'alu',
      'aloo',
      'আলু',
      'আলুর',
      'আলু ভাজি',
      'আলু ভর্তা',
      'আলুর দম',
    ],
    substitutes: [
      {
        en: 'Sweet potato or raw green banana (kachakola) for low-GI fiber',
        bn: 'কাঁচকলা বা মিষ্টি আলু বিকল্প হতে পারে',
      },
    ],
  },

  // Primary Vegetables (SmartChef Single-Ingredient Discovery Core)
  {
    key: 'tomato',
    nameEn: 'Tomato',
    nameBn: 'টমেটো',
    category: 'vegetable',
    isPrimaryVegetable: true,
    synonyms: ['tomato', 'tomatoes', 'puree', 'টমেটো', 'টমেটোর', 'টমাটো'],
    substitutes: [
      {
        en: 'Tomato paste, canned crushed tomatoes, or tamarind pulp for tanginess',
        bn: 'টমেটো পেস্ট বা সামান্য তেঁতুলের ক্বাথ বিকল্প হিসেবে ব্যবহার করা যায়',
      },
    ],
  },
  {
    key: 'cabbage',
    nameEn: 'Cabbage',
    nameBn: 'বাঁধাকপি',
    category: 'vegetable',
    isPrimaryVegetable: true,
    synonyms: [
      'cabbage',
      'bandhakopi',
      'badhakopi',
      'patta gobi',
      'বাঁধাকপি',
      'বাধাকপি',
      'বাঁধাকপির',
      'পাতাকপি',
    ],
    substitutes: [
      {
        en: 'Savoy cabbage, Napa cabbage, or finely shredded cauliflower florets',
        bn: 'ন্যাপা বাঁধাকপি বা মিহি কুচি করা ফুলকপি ব্যবহার করা যায়',
      },
    ],
  },
  {
    key: 'cauliflower',
    nameEn: 'Cauliflower',
    nameBn: 'ফুলকপি',
    category: 'vegetable',
    isPrimaryVegetable: true,
    synonyms: ['cauliflower', 'fulkopi', 'phoolkopi', 'gobi', 'ফুলকপি', 'ফুলকপির'],
    substitutes: [
      {
        en: 'Broccoli florets or cubed turnip give a similar texture',
        bn: 'ব্রোকলি বা শালগম বিকল্প হিসেবে চমৎকার',
      },
    ],
  },
  {
    key: 'pumpkin',
    nameEn: 'Pumpkin (Mishti Kumra)',
    nameBn: 'মিষ্টি কুমড়া',
    category: 'vegetable',
    isPrimaryVegetable: true,
    synonyms: [
      'pumpkin',
      'kumra',
      'kumro',
      'mishti kumra',
      'squash',
      'butternut',
      'কুমড়া',
      'কুমড়া',
      'কুমড়ো',
      'মিষ্টি কুমড়া',
      'মিষ্টি কুমড়া',
      'কুমড়ার',
    ],
    substitutes: [
      {
        en: 'Butternut squash or sweet potato works wonderfully in curries and bhorta',
        bn: 'বাটারনাট স্কোয়াশ বা মিষ্টি আলু বিকল্প হিসেবে ব্যবহারযোগ্য',
      },
    ],
  },
  {
    key: 'brinjal',
    nameEn: 'Eggplant / Brinjal',
    nameBn: 'বেগুন',
    category: 'vegetable',
    isPrimaryVegetable: true,
    synonyms: ['brinjal', 'eggplant', 'aubergine', 'begun', 'বেগুন', 'বেগুনের'],
  },
  {
    key: 'okra',
    nameEn: 'Okra / Bhindi',
    nameBn: 'ঢেঁড়স',
    category: 'vegetable',
    isPrimaryVegetable: true,
    synonyms: ['okra', 'bhindi', 'ladyfinger', 'dherosh', 'ঢেঁড়স', 'ঢেঁড়স', 'ভেন্ডি'],
  },
  {
    key: 'bottle_gourd',
    nameEn: 'Bottle Gourd (Lau)',
    nameBn: 'লাউ',
    category: 'vegetable',
    isPrimaryVegetable: true,
    synonyms: ['bottle gourd', 'lau', 'lauki', 'calabash', 'লাউ', 'লাউয়ের'],
  },
  {
    key: 'carrot',
    nameEn: 'Carrot',
    nameBn: 'গাজর',
    category: 'vegetable',
    isPrimaryVegetable: true,
    synonyms: ['carrot', 'carrots', 'gajor', 'গাজর', 'গাজরের'],
  },
  {
    key: 'mushroom',
    nameEn: 'Mushroom',
    nameBn: 'মাশরুম',
    category: 'vegetable',
    isPrimaryVegetable: true,
    synonyms: ['mushroom', 'mushrooms', 'মাশরুম'],
  },

  // Primary Proteins
  {
    key: 'egg',
    nameEn: 'Egg',
    nameBn: 'ডিম',
    category: 'protein',
    isPrimaryProtein: true,
    synonyms: [
      'egg',
      'eggs',
      'boiled egg',
      'poached egg',
      'omelet',
      'omelette',
      'egg curry',
      'dim',
      'ডিম',
      'ডিমের',
      'ডিম ভুনা',
      'ডিম কারি',
      'ডিম ভাজি',
      'ভুর্জি',
      'ভুরজি',
      'অমলেট',
    ],
    substitutes: [
      {
        en: 'Crumbled firm paneer or extra-firm tofu for egg bhurji style dishes',
        bn: 'ডিম ভাজির বদলে ছানা বা পনির ব্যবহার করা যায়',
      },
    ],
  },
  {
    key: 'chicken',
    nameEn: 'Chicken',
    nameBn: 'মুরগির মাংস',
    category: 'protein',
    isPrimaryProtein: true,
    synonyms: [
      'chicken',
      'poultry',
      'murgi',
      'murgir',
      'মুরগি',
      'মুরগীর',
      'মুরগির',
      'মুরগির মাংস',
      'চিকেন',
      'মোরগ',
    ],
    substitutes: [
      {
        en: 'Boneless chicken breast or drumsticks can be used interchangeably',
        bn: 'মুরগির ব্রেস্ট বা লেগ পিস ব্যবহার করা যায়',
      },
    ],
  },
  {
    key: 'fish',
    nameEn: 'Fish (Ilish / Rui / Salmon)',
    nameBn: 'মাছ',
    category: 'protein',
    isPrimaryProtein: true,
    synonyms: [
      'fish',
      'ilish',
      'hilsa',
      'rui',
      'rohu',
      'katla',
      'salmon',
      'prawn',
      'shrimp',
      'macher',
      'মাছ',
      'মাছের',
      'ইলিশ',
      'রুই',
      'কাতলা',
      'সালমন',
      'চিংড়ি',
    ],
    substitutes: [
      {
        en: 'Rui, Katla, Tilapia, or Salmon fillets work wonderfully',
        bn: 'রুই, কাতলা, তেলাপিয়া বা সালমন মাছ ব্যবহার করা যায়',
      },
    ],
  },
  {
    key: 'beef',
    nameEn: 'Beef',
    nameBn: 'গরুর মাংস',
    category: 'protein',
    isPrimaryProtein: true,
    synonyms: ['beef', 'gorur', 'গরু', 'গরুর', 'গরুর মাংস', 'বিফ'],
  },
  {
    key: 'lentils',
    nameEn: 'Lentils (Dal)',
    nameBn: 'মসুর ডাল',
    category: 'protein',
    isPrimaryProtein: true,
    synonyms: [
      'lentils',
      'lentil',
      'dal',
      'daal',
      'moong',
      'masoor',
      'chana dal',
      'pulses',
      'ডাল',
      'মসুর ডাল',
      'মুগ ডাল',
      'কালাই ডাল',
    ],
  },
  {
    key: 'paneer',
    nameEn: 'Paneer (Cottage Cheese)',
    nameBn: 'পনির',
    category: 'protein',
    isPrimaryProtein: true,
    synonyms: ['paneer', 'cottage cheese', 'chenna', 'পনির', 'ছানা'],
  },

  // Supporting Aromatics, Spices & Oils
  {
    key: 'onion',
    nameEn: 'Onion',
    nameBn: 'পেঁয়াজ',
    category: 'aromatic',
    synonyms: ['onion', 'onions', 'shallot', 'shallots', 'peyaj', 'peyaju', 'পেঁয়াজ', 'পেঁয়াজ', 'পিয়াজ', 'পিয়াজ', 'পেঁয়াজু', 'বেরেস্তা'],
    substitutes: [
      {
        en: 'Shallots, leeks, or spring onions give similar sweet aromatic punch',
        bn: 'শালট বা পেঁয়াজ পাতা বিকল্প হতে পারে',
      },
    ],
  },
  {
    key: 'garlic',
    nameEn: 'Garlic',
    nameBn: 'রসুন',
    category: 'aromatic',
    synonyms: ['garlic', 'lahsun', 'roshun', 'রসুন', 'রসুন বাটা'],
  },
  {
    key: 'ginger',
    nameEn: 'Ginger',
    nameBn: 'আদা',
    category: 'aromatic',
    synonyms: ['ginger', 'adrak', 'ada', 'আদা', 'আদা বাটা'],
  },
  {
    key: 'green_chili',
    nameEn: 'Green Chili',
    nameBn: 'কাঁচা মরিচ',
    category: 'spice',
    synonyms: ['green chili', 'chili', 'chilies', 'chilli', 'chilly', 'কাঁচা মরিচ', 'মরিচ', 'ঝাল'],
  },
  {
    key: 'turmeric',
    nameEn: 'Turmeric',
    nameBn: 'হলুদ',
    category: 'spice',
    synonyms: ['turmeric', 'curcumin', 'হলুদ', 'হলুদ গুঁড়ো'],
  },
  {
    key: 'cumin',
    nameEn: 'Cumin',
    nameBn: 'জিরা',
    category: 'spice',
    synonyms: ['cumin', 'jeera', 'zeera', 'জিরা', 'জিরার গুঁড়ো', 'আস্ত জিরা'],
  },
  {
    key: 'coriander_leaves',
    nameEn: 'Fresh Coriander / Cilantro',
    nameBn: 'ধনেপাতা',
    category: 'greens',
    synonyms: ['coriander', 'cilantro', 'dhonepata', 'dhaniya', 'ধনেপাতা', 'ধনে পাতা', 'ধনে'],
  },
  {
    key: 'mustard_oil',
    nameEn: 'Mustard Oil',
    nameBn: 'সরিষার তেল',
    category: 'oil',
    synonyms: ['mustard oil', 'shorshe tel', 'mustard', 'oil', 'সরিষার তেল', 'সরিষা তেল', 'তেল'],
  },
  {
    key: 'ghee',
    nameEn: 'Ghee (Clarified Butter)',
    nameBn: 'ঘি',
    category: 'oil',
    synonyms: ['ghee', 'clarified butter', 'butter', 'ঘি', 'গাওয়া ঘি'],
  },
];

// Major animal proteins that CANNOT appear in a recipe unless explicitly selected by the user
export const RESTRICTED_ANIMAL_PROTEINS = [
  { key: 'chicken', label: 'Chicken', synonyms: ['chicken', 'poultry', 'মুরগি', 'মুরগীর', 'মুরগির', 'মুরগির মাংস', 'চিকেন', 'মোরগ'] },
  { key: 'beef', label: 'Beef', synonyms: ['beef', 'mutton', 'lamb', 'গরু', 'গরুর', 'গরুর মাংস', 'বিফ', 'খাসি'] },
  { key: 'fish', label: 'Fish', synonyms: ['fish', 'ilish', 'hilsa', 'rui', 'salmon', 'prawn', 'shrimp', 'মাছ', 'ইলিশ', 'রুই', 'সালমন', 'চিংড়ি'] },
  { key: 'egg', label: 'Egg', synonyms: ['egg', 'eggs', 'ডিম', 'ডিমের', 'ডিম ভুনা', 'ডিম কারি', 'bhurji', 'ভুর্জি', 'অমলেট', 'omelet', 'omelette'] },
];

export const RICE_RESTRICTED_TERMS = {
  key: 'rice',
  label: 'Rice',
  synonyms: ['rice', 'biryani', 'khichuri', 'polao', 'pulao', 'pilaf', 'fried rice', 'চাল', 'ভাত', 'পোলাও', 'বিরিয়ানি', 'খিচুড়ি', 'খিচুড়ি'],
};

/**
 * Normalizes input string and finds canonical ingredient match
 */
export function identifyCanonicalIngredient(input: string): CanonicalIngredient | null {
  const norm = normalizeBilingualText(input);
  if (!norm) return null;
  for (const item of CANONICAL_INGREDIENTS) {
    if (
      item.key === norm ||
      normalizeBilingualText(item.nameEn) === norm ||
      normalizeBilingualText(item.nameBn) === norm ||
      item.synonyms.some((syn) => {
        const ns = normalizeBilingualText(syn);
        return ns === norm || norm.includes(ns);
      })
    ) {
      return item;
    }
  }
  return null;
}

/**
 * Normalizes an arbitrary ingredient input into a clean bilingual object
 */
export function normalizeIngredientInput(input: string): {
  key: string;
  nameEn: string;
  nameBn: string;
  category: IngredientCategory;
  isPrimaryProtein: boolean;
  isPrimaryStarch: boolean;
  isPrimaryGreens: boolean;
  isPrimaryVegetable: boolean;
} {
  const found = identifyCanonicalIngredient(input);
  if (found) {
    return {
      key: found.key,
      nameEn: found.nameEn,
      nameBn: found.nameBn,
      category: found.category,
      isPrimaryProtein: !!found.isPrimaryProtein,
      isPrimaryStarch: !!found.isPrimaryStarch,
      isPrimaryGreens: !!found.isPrimaryGreens,
      isPrimaryVegetable: !!found.isPrimaryVegetable,
    };
  }

  const clean = input.trim();
  return {
    key: clean.toLowerCase(),
    nameEn: clean,
    nameBn: clean,
    category: 'vegetable', // Treat custom typed ingredients (like okra/turnip/etc.) as usable core ingredients
    isPrimaryProtein: false,
    isPrimaryStarch: false,
    isPrimaryGreens: false,
    isPrimaryVegetable: true,
  };
}

/**
 * Intelligent Kitchen Ingredient Analysis
 * Single-ingredient search is ALWAYS feasible if the user entered a vegetable, green, starch, protein, or onion!
 */
export function analyzeKitchenIngredients(rawIngredients: string[]): {
  normalized: ReturnType<typeof normalizeIngredientInput>[];
  mainIngredients: ReturnType<typeof normalizeIngredientInput>[];
  supportingIngredients: ReturnType<typeof normalizeIngredientInput>[];
  hasShak: boolean;
  hasEgg: boolean;
  hasChicken: boolean;
  hasFish: boolean;
  hasBeef: boolean;
  hasRice: boolean;
  hasPotato: boolean;
  hasTomato: boolean;
  hasOnion: boolean;
  hasCabbage: boolean;
  hasCauliflower: boolean;
  hasPumpkin: boolean;
  hasLentils: boolean;
  isFeasible: boolean;
  infeasibilityReasonEn?: string;
  infeasibilityReasonBn?: string;
} {
  const normalized = rawIngredients.map(normalizeIngredientInput);

  const mainIngredients = normalized.filter(
    (item) =>
      item.isPrimaryProtein ||
      item.isPrimaryStarch ||
      item.isPrimaryGreens ||
      item.isPrimaryVegetable ||
      item.key === 'onion'
  );

  const supportingIngredients = normalized.filter(
    (item) => !mainIngredients.some((m) => m.key === item.key)
  );

  const hasKey = (k: string) => normalized.some((i) => i.key === k);

  const hasShak = hasKey('shak');
  const hasEgg = hasKey('egg');
  const hasChicken = hasKey('chicken');
  const hasFish = hasKey('fish');
  const hasBeef = hasKey('beef');
  const hasRice = hasKey('rice');
  const hasPotato = hasKey('potato');
  const hasTomato = hasKey('tomato');
  const hasOnion = hasKey('onion');
  const hasCabbage = hasKey('cabbage');
  const hasCauliflower = hasKey('cauliflower');
  const hasPumpkin = hasKey('pumpkin');
  const hasLentils = hasKey('lentils');

  // Only block if user submitted ONLY salt/spices/oil with zero core food item
  const hasOnlySeasonings =
    normalized.length > 0 &&
    normalized.every((i) => ['spice', 'oil'].includes(i.category) || i.key === 'salt' || i.key === 'লবণ' || i.key === 'water' || i.key === 'পানি');

  const isFeasible = normalized.length > 0 && !hasOnlySeasonings && mainIngredients.length > 0;

  return {
    normalized,
    mainIngredients,
    supportingIngredients,
    hasShak,
    hasEgg,
    hasChicken,
    hasFish,
    hasBeef,
    hasRice,
    hasPotato,
    hasTomato,
    hasOnion,
    hasCabbage,
    hasCauliflower,
    hasPumpkin,
    hasLentils,
    isFeasible,
    infeasibilityReasonEn: isFeasible
      ? undefined
      : 'It is not possible to prepare a suitable recipe with your provided ingredients. Please add at least one main ingredient like Spinach, Potato, Tomato, Egg, Cabbage, or Rice.',
    infeasibilityReasonBn: isFeasible
      ? undefined
      : 'আপনার দেওয়া উপকরণ দিয়ে উপযুক্ত রেসিপি তৈরি করা সম্ভব হচ্ছে না। অনুগ্রহ করে শাক, আলু, টমেটো, ডিম বা বাঁধাকপির মতো অন্তত একটি মূল উপকরণ যোগ করুন।',
  };
}

/**
 * Checks if a specific canonical ingredient or synonym group is GENUINELY used in a recipe
 * (inspects recipe title, description/notes, ingredients array, and cooking steps — NOT just echoed usedIngredients!).
 */
export function isCanonicalIngredientUsed(
  canonical: { synonyms: string[] },
  recipe: {
    recipeName?: string;
    recipeNameBn?: string;
    ingredientNote?: string;
    ingredientNoteBn?: string;
    usedIngredients?: string[];
    availableIngredients?: string[];
    instructions?: string[];
    instructionsBn?: string[];
    ingredients?: any[];
  },
  options: { checkUsedField?: boolean } = {}
): boolean {
  const { checkUsedField = true } = options;

  // 1. Core dish identifiers (Title, Notes, structured ingredients)
  const coreParts = [
    recipe.recipeName || '',
    recipe.recipeNameBn || '',
    recipe.ingredientNote || '',
    recipe.ingredientNoteBn || '',
    ...(recipe.ingredients?.map((i) => (typeof i === 'string' ? i : i.name || i.nameBn || '')) || []),
  ];

  if (checkUsedField) {
    coreParts.push(...(recipe.usedIngredients || []), ...(recipe.availableIngredients || []));
  }

  const coreBlob = normalizeBilingualText(coreParts.join(' '));

  if (canonical.synonyms.some((syn) => coreBlob.includes(normalizeBilingualText(syn)))) {
    return true;
  }

  // 2. Cooking instructions check with side serving suggestions stripped
  const instructionsList = [
    ...(recipe.instructions || []),
    ...(recipe.instructionsBn || []),
  ];

  const cleanedInstructions = normalizeBilingualText(
    instructionsList
      .map((inst) =>
        inst
          .toLowerCase()
          .replace(/(serve|served|serving|pair|paired|eat|eaten)\s+(immediately\s+)?(steaming\s+)?(hot\s+)?(with|alongside)\s+(steamed\s+|warm\s+|hot\s+|boiled\s+|fluffy\s+|plain\s+)?rice(\s+and\s+ghee)?/gi, '')
          .replace(/serve\s+with\s+(steamed\s+|warm\s+|hot\s+)?rice/gi, '')
          .replace(/(গরম\s+)?(গরম\s+)?ভাতের\s+সাথে\s+(পরিবেশন\s+করুন|পরিবেশন|পরিবেশনযোগ্য|খান)/g, '')
          .replace(/(গরম\s+)?ভাতের\s+পাতে\s+(পরিবেশন\s+করুন|পরিবেশন|পরিবেশনযোগ্য|খান)/g, '')
          .replace(/(ভাত\s+বা\s+রুটির\s+সাথে|ভাতের\s+সাথে)/g, '')
      )
      .join(' ')
  );

  return canonical.synonyms.some((syn) => cleanedInstructions.includes(normalizeBilingualText(syn)));
}

/**
 * Multi-Gate Strict Validation & SmartChef Ingredient Categorization
 */
export function validateRecipeAgainstIngredients(
  recipe: {
    recipeName?: string;
    recipeNameBn?: string;
    ingredientNote?: string;
    ingredientNoteBn?: string;
    usedIngredients?: string[];
    availableIngredients?: string[];
    optionalIngredients?: string[];
    missingIngredients?: string[];
    instructions?: string[];
    instructionsBn?: string[];
  },
  userIngredients: string[]
): {
  isValid: boolean;
  rejectionReason?: string;
  matchedIngredients: string[];
  unmatchedSelectedIngredients: string[];
  matchPercentage: number;
  availableIngredients: string[];
  optionalIngredients: string[];
  missingIngredients: string[];
  ingredientAvailabilityPercentage: number;
} {
  const analysis = analyzeKitchenIngredients(userIngredients);
  const selectedCanonicals = analysis.normalized;

  // GATE 1: STRICT REJECTION of unselected animal proteins (Chicken, Beef, Fish, Egg)
  for (const restricted of RESTRICTED_ANIMAL_PROTEINS) {
    const isSelectedByUser = selectedCanonicals.some((c) => c.key === restricted.key);
    if (!isSelectedByUser) {
      const isPresentInRecipe = isCanonicalIngredientUsed(restricted, recipe, { checkUsedField: true });
      if (isPresentInRecipe) {
        return {
          isValid: false,
          rejectionReason: `STRICT VIOLATION: Recipe contains unselected animal protein "${restricted.label}".`,
          matchedIngredients: [],
          unmatchedSelectedIngredients: userIngredients,
          matchPercentage: 0,
          availableIngredients: [],
          optionalIngredients: recipe.optionalIngredients || [],
          missingIngredients: recipe.missingIngredients || [],
          ingredientAvailabilityPercentage: 0,
        };
      }
    }
  }

  // GATE 1B: Smart Rice Rule
  // If user did NOT select Rice:
  // Reject rice-heavy dishes (Fried Rice, Biryani, Pulao, Plain Rice) UNLESS it is a vegetable/greens Khichuri
  // where Rice is transparently declared in missingIngredients AND the searched vegetable/greens is in the title!
  if (!analysis.hasRice) {
    const isRiceInRecipe = isCanonicalIngredientUsed(RICE_RESTRICTED_TERMS, recipe, { checkUsedField: true });
    if (isRiceInRecipe) {
      const titleNorm = normalizeBilingualText(`${recipe.recipeName || ''} ${recipe.recipeNameBn || ''}`);
      const isKhichuri = titleNorm.includes('khichuri') || titleNorm.includes('খিচুড') || titleNorm.includes('খিচুড়ি');
      const riceDeclaredMissing = (recipe.missingIngredients || []).some((m) =>
        normalizeBilingualText(m).includes('rice') || normalizeBilingualText(m).includes('চাল')
      );
      const primarySearchedInTitle = analysis.mainIngredients.some((main) => {
        const canon = CANONICAL_INGREDIENTS.find((c) => c.key === main.key);
        const syns = canon ? canon.synonyms : [main.key];
        return syns.some((s) => titleNorm.includes(normalizeBilingualText(s)));
      });

      if (!(isKhichuri && riceDeclaredMissing && primarySearchedInTitle)) {
        return {
          isValid: false,
          rejectionReason: 'STRICT VIOLATION: Recipe contains unselected Rice (without being a primary-ingredient khichuri with missing rice declared).',
          matchedIngredients: [],
          unmatchedSelectedIngredients: userIngredients,
          matchPercentage: 0,
          availableIngredients: [],
          optionalIngredients: recipe.optionalIngredients || [],
          missingIngredients: recipe.missingIngredients || [],
          ingredientAvailabilityPercentage: 0,
        };
      }
    }
  }

  // GATE 2: MANDATORY PRESENCE of every primary searched/selected ingredient
  // IMPORTANT: Check actual recipe title, notes, and instructions (checkUsedField: false) so fake usedIngredients tags cannot cheat!
  const mandatoryKeys = [
    'shak',
    'potato',
    'tomato',
    'egg',
    'cabbage',
    'cauliflower',
    'pumpkin',
    'rice',
    'fish',
    'chicken',
    'lentils',
    'brinjal',
    'okra',
    'bottle_gourd',
    'carrot',
    'mushroom',
    'paneer',
  ];

  for (const key of mandatoryKeys) {
    if (selectedCanonicals.some((c) => c.key === key)) {
      const canon = CANONICAL_INGREDIENTS.find((c) => c.key === key)!;
      if (!isCanonicalIngredientUsed(canon, recipe, { checkUsedField: false })) {
        return {
          isValid: false,
          rejectionReason: `Recipe lacks mandatory selected ingredient "${canon.nameEn}" in its title or cooking instructions.`,
          matchedIngredients: [],
          unmatchedSelectedIngredients: userIngredients,
          matchPercentage: 0,
          availableIngredients: [],
          optionalIngredients: recipe.optionalIngredients || [],
          missingIngredients: recipe.missingIngredients || [],
          ingredientAvailabilityPercentage: 0,
        };
      }
    }
  }

  // Also check custom single ingredients (e.g., if user typed "Onion" alone or a custom vegetable like "Turnip")
  if (selectedCanonicals.length === 1) {
    const single = selectedCanonicals[0];
    const canon = CANONICAL_INGREDIENTS.find((c) => c.key === single.key) || {
      synonyms: [single.nameEn.toLowerCase(), single.nameBn],
    };
    if (!isCanonicalIngredientUsed(canon, recipe, { checkUsedField: false })) {
      return {
        isValid: false,
        rejectionReason: `Single-ingredient search for "${single.nameEn}" requires it as the main ingredient in the recipe.`,
        matchedIngredients: [],
        unmatchedSelectedIngredients: userIngredients,
        matchPercentage: 0,
        availableIngredients: [],
        optionalIngredients: recipe.optionalIngredients || [],
        missingIngredients: recipe.missingIngredients || [],
        ingredientAvailabilityPercentage: 0,
      };
    }
  }

  // Calculate genuine matched and unmatched user ingredients
  const matchedIngredients: string[] = [];
  const unmatchedSelectedIngredients: string[] = [];

  for (const item of selectedCanonicals) {
    const canonicalObj = CANONICAL_INGREDIENTS.find((c) => c.key === item.key) || {
      synonyms: [item.nameEn.toLowerCase()],
    };
    if (isCanonicalIngredientUsed(canonicalObj, recipe, { checkUsedField: false })) {
      matchedIngredients.push(item.nameEn);
    } else {
      unmatchedSelectedIngredients.push(item.nameEn);
    }
  }

  const totalUser = selectedCanonicals.length || 1;
  const matchPercentage = Math.round((matchedIngredients.length / totalUser) * 100);

  if (matchedIngredients.length === 0) {
    return {
      isValid: false,
      rejectionReason: 'Recipe does not genuinely feature any of the user searched ingredients.',
      matchedIngredients,
      unmatchedSelectedIngredients,
      matchPercentage,
      availableIngredients: [],
      optionalIngredients: recipe.optionalIngredients || [],
      missingIngredients: recipe.missingIngredients || [],
      ingredientAvailabilityPercentage: 0,
    };
  }

  const availableIngredients = matchedIngredients.slice();
  const missingIngredients = (recipe.missingIngredients || []).filter(
    (m) =>
      !matchedIngredients.some(
        (u) =>
          normalizeBilingualText(u).includes(normalizeBilingualText(m)) ||
          normalizeBilingualText(m).includes(normalizeBilingualText(u))
      )
  );
  const optionalIngredients = recipe.optionalIngredients || ['Coriander leaves (garnish)', 'Extra green chili'];

  const totalRequired = Math.max(1, availableIngredients.length + missingIngredients.length);
  const ingredientAvailabilityPercentage = Math.round((availableIngredients.length / totalRequired) * 100);

  return {
    isValid: true,
    matchedIngredients,
    unmatchedSelectedIngredients,
    matchPercentage,
    availableIngredients,
    optionalIngredients,
    missingIngredients,
    ingredientAvailabilityPercentage,
  };
}

/**
 * Deduplicates recipes by normalized English or Bangla name
 */
export function deduplicateRecipes<T extends { recipeName?: string; recipeNameBn?: string }>(recipes: T[]): T[] {
  const seen = new Set<string>();
  const unique: T[] = [];
  for (const r of recipes) {
    const keyEn = normalizeBilingualText(r.recipeName || '').replace(/[^a-z0-9]/g, '');
    const keyBn = normalizeBilingualText(r.recipeNameBn || '');
    const sig = keyEn || keyBn;
    if (!sig || seen.has(sig)) continue;
    seen.add(sig);
    unique.push(r);
  }
  return unique;
}
