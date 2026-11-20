/**
 * Canonical Country & Culinary Origin Normalizer for AaharIQ
 * Maps country names, demonyms/cuisines, Bangla names, and TheMealDB strArea values
 * consistently across backend search, local curated DB, and UI country filters.
 */

export const SUPPORTED_COUNTRIES: string[] = [
  'Bangladesh',
  'Nepal',
  'India',
  'Italy',
  'Japan',
  'South Korea',
  'USA',
  'China',
  'Thailand',
  'Mexico',
  'Mediterranean',
];

interface CountryMeta {
  key: string;
  labelEn: string;
  labelBn: string;
  demonymEn: string;
  aliases: string[];
  mealDbAreas: string[];
}

const COUNTRY_REGISTRY: CountryMeta[] = [
  {
    key: 'Bangladesh',
    labelEn: 'Bangladesh',
    labelBn: 'বাংলাদেশ',
    demonymEn: 'Bangladeshi',
    aliases: ['bangladesh', 'bangladeshi', 'bengali', 'deshi', 'বাংলাদেশ', 'বাংলাদেশি', 'বাঙালি', 'দেশি'],
    mealDbAreas: ['Bangladeshi'],
  },
  {
    key: 'Nepal',
    labelEn: 'Nepal',
    labelBn: 'নেপাল',
    demonymEn: 'Nepali',
    aliases: ['nepal', 'nepali', 'nepalese', 'himalayan', 'নেপাল', 'নেপালি'],
    mealDbAreas: ['Nepalese'],
  },
  {
    key: 'India',
    labelEn: 'India',
    labelBn: 'ভারত',
    demonymEn: 'Indian',
    aliases: ['india', 'indian', 'ভারত', 'ভারতীয়', 'ভারতীয়'],
    mealDbAreas: ['India', 'Indian'],
  },
  {
    key: 'Italy',
    labelEn: 'Italy',
    labelBn: 'ইতালি',
    demonymEn: 'Italian',
    aliases: ['italy', 'italian', 'neapolitan', 'ইতালি', 'ইতালীয়', 'ইতালীয়'],
    mealDbAreas: ['Italian', 'Italy'],
  },
  {
    key: 'Japan',
    labelEn: 'Japan',
    labelBn: 'জাপান',
    demonymEn: 'Japanese',
    aliases: ['japan', 'japanese', 'জাপান', 'জাপানি'],
    mealDbAreas: ['Japanese', 'Japan'],
  },
  {
    key: 'USA',
    labelEn: 'USA',
    labelBn: 'যুক্তরাষ্ট্র (USA)',
    demonymEn: 'American',
    aliases: ['usa', 'us', 'u.s.', 'u.s.a.', 'united states', 'united states of america', 'america', 'american', 'new york', 'আমেরিকা', 'আমেরিকান', 'যুক্তরাষ্ট্র'],
    mealDbAreas: ['American'],
  },
  {
    key: 'China',
    labelEn: 'China',
    labelBn: 'চীন',
    demonymEn: 'Chinese',
    aliases: ['china', 'chinese', 'szechuan', 'sichuan', 'cantonese', 'চীন', 'চাইনিজ'],
    mealDbAreas: ['Chinese'],
  },
  {
    key: 'Thailand',
    labelEn: 'Thailand',
    labelBn: 'থাইল্যান্ড',
    demonymEn: 'Thai',
    aliases: ['thailand', 'thai', 'থাইল্যান্ড', 'থাই'],
    mealDbAreas: ['Thai'],
  },
  {
    key: 'Mexico',
    labelEn: 'Mexico',
    labelBn: 'মেক্সিকো',
    demonymEn: 'Mexican',
    aliases: ['mexico', 'mexican', 'মেক্সিকো', 'মেক্সিকান'],
    mealDbAreas: ['Mexican'],
  },
  {
    key: 'Mediterranean',
    labelEn: 'Mediterranean',
    labelBn: 'ভূমধ্যসাগরীয়',
    demonymEn: 'Mediterranean',
    aliases: ['mediterranean', 'greek', 'greece', 'levant', 'ভূমধ্যসাগরীয়', 'ভূমধ্যসাগরীয়', 'গ্রিক'],
    mealDbAreas: ['Greek'],
  },
  {
    key: 'South Korea',
    labelEn: 'Korea',
    labelBn: 'দক্ষিণ কোরিয়া',
    demonymEn: 'Korean',
    aliases: ['south korea', 'korea', 'korean', 'কোরিয়া', 'কোরিয়ান', 'দক্ষিণ কোরিয়া'],
    mealDbAreas: ['South Korean', 'Korean'],
  },
  {
    key: 'UK',
    labelEn: 'United Kingdom',
    labelBn: 'যুক্তরাজ্য',
    demonymEn: 'British',
    aliases: ['uk', 'united kingdom', 'british', 'england', 'english', 'ব্রিটিশ', 'যুক্তরাজ্য'],
    mealDbAreas: ['British'],
  },
  {
    key: 'France',
    labelEn: 'France',
    labelBn: 'ফ্রান্স',
    demonymEn: 'French',
    aliases: ['france', 'french', 'ফ্রান্স', 'ফরাসি'],
    mealDbAreas: ['French'],
  },
  {
    key: 'Argentina',
    labelEn: 'Argentina',
    labelBn: 'আর্জেন্টিনা',
    demonymEn: 'Argentine',
    aliases: ['argentina', 'argentine', 'argentinian', 'আর্জেন্টিনা'],
    mealDbAreas: ['Argentine'],
  },
  {
    key: 'Venezuela',
    labelEn: 'Venezuela',
    labelBn: 'ভেনেজুয়েলা',
    demonymEn: 'Venezuelan',
    aliases: ['venezuela', 'venezuelan', 'ভেনেজুয়েলা'],
    mealDbAreas: ['Venezuelan'],
  },
  {
    key: 'Malaysia',
    labelEn: 'Malaysia',
    labelBn: 'মালয়েশিয়া',
    demonymEn: 'Malaysian',
    aliases: ['malaysia', 'malaysian', 'মালয়েশিয়া'],
    mealDbAreas: ['Malaysian'],
  },
  {
    key: 'Singapore',
    labelEn: 'Singapore',
    labelBn: 'সিঙ্গাপুর',
    demonymEn: 'Singaporean',
    aliases: ['singapore', 'singaporean', 'সিঙ্গাপুর'],
    mealDbAreas: ['Singaporean'],
  },
  {
    key: 'Vietnam',
    labelEn: 'Vietnam',
    labelBn: 'ভিয়েতনাম',
    demonymEn: 'Vietnamese',
    aliases: ['vietnam', 'vietnamese', 'ভিয়েতনাম'],
    mealDbAreas: ['Vietnamese'],
  },
  {
    key: 'Spain',
    labelEn: 'Spain',
    labelBn: 'স্পেন',
    demonymEn: 'Spanish',
    aliases: ['spain', 'spanish', 'স্পেন'],
    mealDbAreas: ['Spanish'],
  },
  {
    key: 'Turkey',
    labelEn: 'Turkey',
    labelBn: 'তুরস্ক',
    demonymEn: 'Turkish',
    aliases: ['turkey', 'turkish', 'তুরস্ক'],
    mealDbAreas: ['Turkish'],
  },
];

const ALIAS_TO_COUNTRY = new Map<string, string>();
const KEY_TO_META = new Map<string, CountryMeta>();

for (const meta of COUNTRY_REGISTRY) {
  KEY_TO_META.set(meta.key.toLowerCase(), meta);
  ALIAS_TO_COUNTRY.set(meta.key.toLowerCase(), meta.key);
  ALIAS_TO_COUNTRY.set(meta.demonymEn.toLowerCase(), meta.key);
  for (const alias of meta.aliases) {
    ALIAS_TO_COUNTRY.set(alias.toLowerCase(), meta.key);
  }
}

export function normalizeCountryKey(raw?: string | null): string {
  const cleaned = String(raw || '').normalize('NFC').trim();
  if (!cleaned) return '';
  const lower = cleaned.toLowerCase();
  if (
    lower === 'all' ||
    lower === 'all countries' ||
    lower === 'all cuisines' ||
    lower === 'সকল দেশ' ||
    lower === 'সকল রান্না' ||
    lower === 'unknown' ||
    lower === 'international'
  ) {
    return '';
  }
  return ALIAS_TO_COUNTRY.get(lower) || cleaned;
}

export function getCountryMeta(countryInput?: string | null): CountryMeta | undefined {
  const key = normalizeCountryKey(countryInput);
  if (!key) return undefined;
  return KEY_TO_META.get(key.toLowerCase());
}

export function formatCountryLabel(countryInput?: string | null, language: 'en' | 'bn' = 'en'): string {
  const key = normalizeCountryKey(countryInput);
  if (!key) {
    return language === 'bn' ? 'সকল দেশ' : 'All Countries';
  }
  const meta = KEY_TO_META.get(key.toLowerCase());
  if (!meta) return key;
  return language === 'bn' ? meta.labelBn : meta.labelEn;
}

export function getCountryDemonym(countryInput?: string | null): string {
  const key = normalizeCountryKey(countryInput);
  if (!key) return '';
  const meta = KEY_TO_META.get(key.toLowerCase());
  return meta ? meta.demonymEn : key;
}

export function getTheMealDbAreasForCountry(countryInput?: string | null): string[] {
  const key = normalizeCountryKey(countryInput);
  if (!key) return [];
  const meta = KEY_TO_META.get(key.toLowerCase());
  if (meta) return meta.mealDbAreas;
  return [key];
}

export function getCountrySearchTerms(countryInput?: string | null): string[] {
  const key = normalizeCountryKey(countryInput);
  if (!key) return [];
  const meta = KEY_TO_META.get(key.toLowerCase());
  if (!meta) return [key.toLowerCase()];
  return Array.from(new Set([meta.key.toLowerCase(), meta.demonymEn.toLowerCase(), ...meta.aliases]));
}

export interface CountryMatchableRecipe {
  name?: string;
  nameBn?: string;
  cuisine?: string;
  country?: string;
  countryOfOrigin?: string;
  regionalStyle?: string;
  description?: string;
  tags?: string[];
  keywords?: string[];
}

/**
 * Matches a recipe against a selected country filter.
 * Distinguishes country of culinary version/adaptation (recipe.country / recipe.cuisine / recipe.regionalStyle)
 * from historical countryOfOrigin so e.g. "Pizza + Italy" does not falsely claim a Bangladeshi-style fusion
 * unless that recipe is Italian, while "Pizza + Bangladesh" finds Bangladeshi-style pizza cleanly.
 */
export function recipeMatchesCountry(recipe: CountryMatchableRecipe, countryFilter?: string | null): boolean {
  const targetCountry = normalizeCountryKey(countryFilter);
  if (!targetCountry) return true;

  const recipeCountry = normalizeCountryKey(recipe.country);
  if (recipeCountry && recipeCountry.toLowerCase() === targetCountry.toLowerCase()) {
    return true;
  }

  const recipeCuisineCountry = normalizeCountryKey(recipe.cuisine);
  if (recipeCuisineCountry && recipeCuisineCountry.toLowerCase() === targetCountry.toLowerCase()) {
    return true;
  }

  const recipeStyleCountry = normalizeCountryKey(recipe.regionalStyle);
  if (recipeStyleCountry && recipeStyleCountry.toLowerCase() === targetCountry.toLowerCase()) {
    return true;
  }

  // If explicit country metadata is missing/unknown, inspect title + explicit tags
  const hasExplicitDifferentCountry =
    (recipeCountry && recipeCountry.toLowerCase() !== targetCountry.toLowerCase()) ||
    (recipeCuisineCountry && recipeCuisineCountry.toLowerCase() !== targetCountry.toLowerCase());

  const titleAndTags = `${recipe.name || ''} ${recipe.nameBn || ''} ${(recipe.tags || []).join(' ')} ${recipe.regionalStyle || ''}`.toLowerCase();
  const terms = getCountrySearchTerms(targetCountry);

  if (!hasExplicitDifferentCountry) {
    return terms.some((term) => term.length >= 3 && titleAndTags.includes(term));
  }

  // Allow explicit dual-tagged regional adaptation if present in tags
  const tagText = (recipe.tags || []).map((t) => normalizeCountryKey(t).toLowerCase());
  return tagText.includes(targetCountry.toLowerCase());
}
