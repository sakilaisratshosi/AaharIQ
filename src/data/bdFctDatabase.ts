import rawSnapshot from './bdFctRawSnapshot.json';
import {
  BdFctCategory,
  BdFctDataQuality,
  BdFctFoodRecord,
  BdFctNutrients,
  BdFctRecipeIngredientRef,
} from '../types';

export const BD_PRIMARY_DATA_SOURCES = [
  {
    id: 'infs-fctb',
    title: 'Food Composition Table for Bangladesh (INFS, University of Dhaka)',
    titleBn: 'খাদ্য উপাদান সারণি বাংলাদেশ (INFS, ঢাকা বিশ্ববিদ্যালয়)',
    year: '2013 / Final Ed. 2014',
    role: 'Primary analytical & compiled food composition dataset per 100g edible portion (raw, boiled & local dishes).',
    roleBn: 'প্রতি ১০০ গ্রাম ভোজ্য অংশে বাংলাদেশি খাদ্যের মূল পরীক্ষাগার ও সংকলিত পুষ্টি ডেটাবেজ।',
    url: 'https://www.fao.org/fileadmin/templates/food_composition/documents/FCT_10_2_14_final_version.pdf',
  },
  {
    id: 'fao-infoods-asia',
    title: 'FAO INFOODS Asia & Bangladesh Food Composition Database',
    titleBn: 'FAO INFOODS এশিয়া ও বাংলাদেশ খাদ্য উপাদান ডেটাবেজ',
    year: '2014 / Archival Portal',
    role: 'International tagname standardization (ENERC, PROT, FATCE, VITA_RAE, FIBTG) and Excel dataset hosting.',
    roleBn: 'আন্তর্জাতিক INFOODS মানদণ্ডে পুষ্টি ট্যাগ ও ডেটাসেট সংরক্ষণ পোর্টাল।',
    url: 'https://www.fao.org/infoods/infoods/tables-and-databases/asia/en/',
  },
  {
    id: 'bd-dietary-guidelines-2025',
    title: 'National Dietary Guidelines for Bangladesh 2025 (WHO SEARO / MoHFW)',
    titleBn: 'জাতীয় খাদ্য নির্দেশিকা বাংলাদেশ ২০২৫ (WHO SEARO / স্বাস্থ্য মন্ত্রণালয়)',
    year: '2025',
    role: 'Evidence-based food group diversity, safe salt (<5g/day), visible fat (≤30g/day), sugar, and balanced meal proportions.',
    roleBn: 'সুষম খাদ্য পিরামিড, লবণ (<৫ গ্রাম/দিন), তেল-চর্বি (≤৩০ গ্রাম/দিন) ও খাদ্যবৈচিত্র্য সংক্রান্ত সরকারি নির্দেশিকা।',
    url: 'https://cdn.who.int/media/docs/default-source/searo/bangladesh/national-dietary-guidelines-for-bangladesh.pdf',
  },
];

export const BD_DIETARY_GUIDELINES_2025 = [
  {
    key: 'cereals',
    title: 'Staple Cereals & Whole Grains',
    titleBn: 'দানা শস্য ও পূর্ণ শস্য',
    guidance:
      'Choose parboiled or home-pounded / brown rice and whole wheat atta over overly polished refined grains to retain B-vitamins and dietary fiber.',
    guidanceBn:
      'বি-ভিটামিন ও খাদ্য-আঁশ ধরে রাখতে অতিরিক্ত পালিশ করা চালের বদলে ঢেঁকিছাঁটা/লাল চাল বা আটার রুটি বেছে নিন।',
  },
  {
    key: 'produce',
    title: 'Leafy Greens & Colorful Vegetables & Fruits',
    titleBn: 'শাকসবজি ও মৌসুমি ফলমূল',
    guidance:
      'Include dark green leafy vegetables (লাল শাক, পালং শাক, পুঁই শাক) and Vitamin C-rich seasonal fruits daily; Vitamin C supports non-heme iron absorption.',
    guidanceBn:
      'প্রতিদিন রঙিন সবজি, গাঢ় সবুজ শাক এবং ভিটামিন-সি সমৃদ্ধ ফল খান; ভিটামিন-সি উদ্ভিজ্জ আয়রন শোষণে সাহায্য করে।',
  },
  {
    key: 'protein',
    title: 'Fish, Pulses, Meat & Eggs Balance',
    titleBn: 'মাছ, ডাল, মাংস ও ডিমের সমন্বয়',
    guidance:
      'Combine lentils/pulses (মসুর/মুগ ডাল) with rice and include freshwater/small fish, poultry, or eggs for complete amino acid profiles and bioavailable minerals.',
    guidanceBn:
      'ভাতের সাথে ডাল এবং মিঠাপানির/ছোট মাছ, মুরগি বা ডিম রেখে প্রোটিন ও খনিজের চাহিদা পূরণ করুন।',
  },
  {
    key: 'limits',
    title: '2025 Quantitative Limits (Fat, Salt & Free Sugar)',
    titleBn: '২০২৫ নির্দেশিকার পরিমাণগত সীমা (তেল, লবণ ও চিনি)',
    guidance:
      'Limit visible fats/cooking oil to ≤ 30g per person/day, iodized salt intake to < 5g (~1 tsp)/day, minimize deep-fried street snacks, and stay well hydrated.',
    guidanceBn:
      'প্রতিদিন দৃশ্যমান তেল/চর্বি ≤ ৩০ গ্রাম ও আয়োডিনযুক্ত লবণ < ৫ গ্রাম (প্রায় ১ চা চামচ)-এর মধ্যে রাখুন; অতিরিক্ত চিনি ও ভাজাপোড়া কমান।',
  },
];

export const BD_CATEGORY_LABELS: Record<BdFctCategory, { en: string; bn: string }> = {
  rice_products: { en: 'Rice & Rice Products', bn: 'চাল, ভাত ও শস্য' },
  lentils_pulses: { en: 'Lentils & Pulses', bn: 'ডাল ও ডালজাতীয়' },
  vegetables: { en: 'Local Vegetables & Roots', bn: 'দেশীয় শাকসবজি ও আলু' },
  leafy_vegetables: { en: 'Leafy Vegetables (Shak)', bn: 'শাক ও পাতা জাতীয়' },
  freshwater_fish: { en: 'Freshwater & Local Fish', bn: 'দেশীয় মাছ ও চিংড়ি' },
  meat_eggs: { en: 'Meat, Poultry & Eggs', bn: 'মাংস ও ডিম' },
  fruits: { en: 'Fruits', bn: 'দেশীয় ও মৌসুমি ফল' },
  milk_dairy: { en: 'Milk & Dairy', bn: 'দুধ ও দুগ্ধজাত' },
  traditional_dishes: { en: 'Traditional BD Dishes & Recipes', bn: 'ঐতিহ্যবাহী বাংলাদেশি খাবার' },
  snacks_street_foods: { en: 'Snacks, Street Foods & Oils', bn: 'নাস্তা, স্ট্রিট ফুড ও তেল-মসলা' },
};

// Native Bengali Unicode enrichment map for rapid bilingual Bangla searching across authentic FCTB codes
const BANGLA_UNIFIED_NAMES: Record<
  string,
  { bn: string; servingGrams?: number; servingEn?: string; servingBn?: string; desc?: string; descBn?: string }
> = {
  '01_0012': { bn: 'চাল (BR-28, সিদ্ধ, কাঁচা)', servingGrams: 75, servingEn: '1 dry cup portion (75g raw rice)', servingBn: '১ কাপ কাঁচা চাল (৭৫ গ্রাম)' },
  '01_0037': { bn: 'ভাত (BR-28, রান্না করা, লবণ ছাড়া)', servingGrams: 150, servingEn: '1 medium bowl / katori (150g)', servingBn: '১ মাঝারি বাটি ভাত (১৫০ গ্রাম)' },
  '01_0020': { bn: 'ঢেঁকিছাঁটা লাল চাল (সিদ্ধ, কাঁচা)', servingGrams: 75, servingEn: '1 dry cup portion (75g)', servingBn: '১ কাপ কাঁচা চাল (৭৫ গ্রাম)' },
  '01_0038': { bn: 'ঢেঁকিছাঁটা চালের ভাত (রান্না করা)', servingGrams: 150, servingEn: '1 medium bowl (150g)', servingBn: '১ মাঝারি বাটি ভাত (১৫০ গ্রাম)' },
  '01_0021': { bn: 'লাল চাল (কলছাঁটা, কাঁচা)', servingGrams: 75, servingEn: '1 dry cup portion (75g)', servingBn: '১ কাপ কাঁচা চাল (৭৫ গ্রাম)' },
  '01_0039': { bn: 'লাল চালের ভাত (রান্না করা)', servingGrams: 150, servingEn: '1 medium bowl (150g)', servingBn: '১ মাঝারি বাটি ভাত (১৫০ গ্রাম)' },
  '01_0024': { bn: 'আতপ সুগন্ধি চাল (কাঁচা)', servingGrams: 75, servingEn: '1 dry cup (75g)', servingBn: '১ কাপ কাঁচা চাল (৭৫ গ্রাম)' },
  '01_0040': { bn: 'আতপ সুগন্ধি ভাত (রান্না করা)', servingGrams: 150, servingEn: '1 bowl cooked rice (150g)', servingBn: '১ বাটি ভাত (১৫০ গ্রাম)' },
  '01_0010': { bn: 'চিড়া (শুকনো)', servingGrams: 50, servingEn: '1 bowl / cup (50g dry flakes)', servingBn: '১ বাটি শুকনো চিড়া (৫০ গ্রাম)' },
  '01_0011': { bn: 'ভেজা চিড়া (পানিতে ভেজানো)', servingGrams: 120, servingEn: '1 soaked bowl (120g)', servingBn: '১ বাটি ভেজানো চিড়া (১২০ গ্রাম)' },
  '01_0022': { bn: 'খই (ধানের খই)', servingGrams: 30, servingEn: '1 cup popped rice (30g)', servingBn: '১ কাপ খই (৩০ গ্রাম)' },
  '01_0023': { bn: 'মুড়ি (নোনতা)', servingGrams: 30, servingEn: '1 small bowl muri (30g)', servingBn: '১ বাটি মুড়ি (৩০ গ্রাম)' },
  '01_0035': { bn: 'সাধারন খিচুড়ি (চাল-ডাল)', servingGrams: 200, servingEn: '1 standard plate serving (200g)', servingBn: '১ প্লেট খিচুড়ি (২০০ গ্রাম)' },
  '01_0034': { bn: 'মিষ্টি বিস্কুট', servingGrams: 35, servingEn: '3–4 biscuits (35g)', servingBn: '৩–৪টি বিস্কুট (৩৫ গ্রাম)' },
  '01_0002': { bn: 'বনরুটি / পাউরুটি', servingGrams: 50, servingEn: '1 small bun (50g)', servingBn: '১টি বনরুটি (৫০ গ্রাম)' },
  '01_0043': { bn: 'সেমাই (সিদ্ধ)', servingGrams: 140, servingEn: '1 small bowl (140g)', servingBn: '১ বাটি সেমাই (১৪০ গ্রাম)' },
  '02_0008': { bn: 'মসুর ডাল (শুকনো, কাঁচা)', servingGrams: 40, servingEn: '1 raw household portion (40g)', servingBn: '১ বাটি ডালের জন্য কাঁচা (৪০ গ্রাম)' },
  '02_0015': { bn: 'মসুর ডাল (সিদ্ধ/রান্না, লবণ ছাড়া)', servingGrams: 140, servingEn: '1 cup / katori cooked dal (140g)', servingBn: '১ বাটি রান্না করা মসুর ডাল (১৪০ গ্রাম)' },
  '02_0001': { bn: 'ছোলার ডাল (ভাঙা, শুকনো কাঁচা)', servingGrams: 40, servingEn: '1 raw portion (40g)', servingBn: '৪০ গ্রাম কাঁচা' },
  '02_0002': { bn: 'গোটা ছোলা (শুকনো, কাঁচা)', servingGrams: 50, servingEn: '50g raw chola', servingBn: '৫০ গ্রাম কাঁচা ছোলা' },
  '02_0012': { bn: 'গোটা ছোলা (সিদ্ধ)', servingGrams: 100, servingEn: '1 boiled cup (100g)', servingBn: '১ কাপ সিদ্ধ ছোলা (১০০ গ্রাম)' },
  '02_0013': { bn: 'মুগ ডাল (সিদ্ধ)', servingGrams: 140, servingEn: '1 cup cooked mug dal (140g)', servingBn: '১ বাটি সিদ্ধ মুগ ডাল (১৪০ গ্রাম)' },
  '02_0014': { bn: 'খেসারি ডাল (সিদ্ধ)', servingGrams: 140, servingEn: '1 cup cooked khesari dal (140g)', servingBn: '১ বাটি খেসারি ডাল (১৪০ গ্রাম)' },
  '03_0005': { bn: 'বেগুন (লম্বা বেগুন, কাঁচা)', servingGrams: 100, servingEn: '1 small brinjal (100g)', servingBn: '১টি মাঝারি বেগুন (১০০ গ্রাম)' },
  '03_0033': { bn: 'বেগুন (সিদ্ধ, লবণ ছাড়া)', servingGrams: 100, servingEn: '1 serving boiled brinjal (100g)', servingBn: '১ সার্ভিং সিদ্ধ বেগুন (১০০ গ্রাম)' },
  '03_0007': { bn: 'বাঁধাকপি (কাঁচা)', servingGrams: 100, servingEn: '1 cup chopped (100g)', servingBn: '১০০ গ্রাম বাঁধাকপি' },
  '03_0034': { bn: 'বাঁধাকপি (সিদ্ধ)', servingGrams: 100, servingEn: '1 cooked cup (100g)', servingBn: '১ বাটি সিদ্ধ বাঁধাকপি (১০০ গ্রাম)' },
  '03_0024': { bn: 'পেঁয়াজ (কাঁচা)', servingGrams: 50, servingEn: '1 medium onion (50g)', servingBn: '১টি মাঝারি পেঁয়াজ (৫০ গ্রাম)' },
  '03_0031': { bn: 'পাকা টমেটো (কাঁচা)', servingGrams: 100, servingEn: '1 medium tomato (100g)', servingBn: '১টি মাঝারি টমেটো (১০০ গ্রাম)' },
  '04_0004': { bn: 'লাল শাক (কাঁচা)', servingGrams: 100, servingEn: '1 bunch edible leaves (100g)', servingBn: '১০০ গ্রাম কাঁচা লাল শাক' },
  '04_0032': { bn: 'লাল শাক (সিদ্ধ, লবণ ছাড়া)', servingGrams: 100, servingEn: '1 cooked serving (100g)', servingBn: '১ বাটি সিদ্ধ লাল শাক (১০০ গ্রাম)' },
  '04_0025': { bn: 'পালং শাক (কাঁচা)', servingGrams: 100, servingEn: '100g raw spinach leaves', servingBn: '১০০ গ্রাম কাঁচা পালং শাক' },
  '04_0035': { bn: 'পালং শাক (সিদ্ধ, লবণ ছাড়া)', servingGrams: 100, servingEn: '1 cooked cup (100g)', servingBn: '১ বাটি সিদ্ধ পালং শাক (১০০ গ্রাম)' },
  '04_0020': { bn: 'পুঁই শাক (কাঁচা)', servingGrams: 100, servingEn: '100g raw', servingBn: '১০০ গ্রাম কাঁচা পুঁই শাক' },
  '04_0036': { bn: 'পুঁই শাক (সিদ্ধ, লবণ ছাড়া)', servingGrams: 100, servingEn: '1 cooked cup (100g)', servingBn: '১ বাটি সিদ্ধ পুঁই শাক (১০০ গ্রাম)' },
  '04_0030': { bn: 'কলমি শাক (কাঁচা)', servingGrams: 100, servingEn: '100g raw', servingBn: '১০০ গ্রাম কলমি শাক' },
  '04_0021': { bn: 'পাট শাক (কাঁচা)', servingGrams: 100, servingEn: '100g raw', servingBn: '১০০ গ্রাম পাট শাক' },
  '05_0005': { bn: 'ডায়মন্ড আলু (কাঁচা)', servingGrams: 100, servingEn: '1 medium potato (100g)', servingBn: '১টি মাঝারি আলু (১০০ গ্রাম)' },
  '05_0012': { bn: 'ডায়মন্ড আলু (সিদ্ধ, লবণ ছাড়া)', servingGrams: 100, servingEn: '1 boiled potato (100g)', servingBn: '১টি সিদ্ধ আলু (১০০ গ্রাম)' },
  '05_0021': { bn: 'আলু ভর্তা (FCT রেসিপি — লবণ ও পেঁয়াজ-মরিচসহ)', servingGrams: 75, servingEn: '1 serving alu bhorta (75g)', servingBn: '১ সার্ভিং আলু ভর্তা (৭৫ গ্রাম)' },
  '08_0004': { bn: 'পাকা সাগর কলা', servingGrams: 110, servingEn: '1 medium banana (110g)', servingBn: '১টি সাগর কলা (১১০ গ্রাম)' },
  '08_0013': { bn: 'পেয়ারা (সবুজ, কাঁচা)', servingGrams: 100, servingEn: '1 medium guava (100g)', servingBn: '১টি মাঝারি পেয়ারা (১০০ গ্রাম)' },
  '08_0020': { bn: 'পাকা আম (ল্যাংড়া)', servingGrams: 150, servingEn: '1 cup sliced mango (150g)', servingBn: '১ কাপ পাকা আম (১৫০ গ্রাম)' },
  '08_0016': { bn: 'পাকা কাঁঠাল', servingGrams: 120, servingEn: '4–5 bulbs / koa (120g)', servingBn: '৪–৫ কোয়া পাকা কাঁঠাল (১২০ গ্রাম)' },
  '08_0032': { bn: 'পাকা পেঁপে', servingGrams: 140, servingEn: '1 bowl papaya cubes (140g)', servingBn: '১ বাটি পাকা পেঁপে (১৪০ গ্রাম)' },
  '09_0033': { bn: 'ইলিশ মাছ (কাঁটা ছাড়া, কাঁচা)', servingGrams: 100, servingEn: '1 medium piece without bones (100g)', servingBn: '১ টুকরা ইলিশ মাছ (১০০ গ্রাম)' },
  '09_0060': { bn: 'রুই মাছ (কাঁটা ছাড়া, কাঁচা)', servingGrams: 100, servingEn: '1 medium fillet piece (100g)', servingBn: '১ টুকরা রুই মাছ (১০০ গ্রাম)' },
  '09_0015': { bn: 'কাতলা মাছ (কাঁটা ছাড়া, কাঁচা)', servingGrams: 100, servingEn: '1 medium piece (100g)', servingBn: '১ টুকরা কাতলা মাছ (১০০ গ্রাম)' },
  '09_0068': { bn: 'তেলাপিয়া মাছ (কাঁটা ছাড়া, কাঁচা)', servingGrams: 100, servingEn: '1 fillet piece (100g)', servingBn: '১ টুকরা তেলাপিয়া মাছ (১০০ গ্রাম)' },
  '09_0045': { bn: 'পাঙ্গাস মাছ (কাঁচা)', servingGrams: 100, servingEn: '1 piece (100g)', servingBn: '১ টুকরা পাঙ্গাস মাছ (১০০ গ্রাম)' },
  '09_0065': { bn: 'শিং মাছ (কাঁচা)', servingGrams: 90, servingEn: '1 fish portion (90g)', servingBn: '১টি শিং মাছ (৯০ গ্রাম)' },
  '10_0002': { bn: 'গরুর মাংস (চর্বি ও হাড় ছাড়া, কাঁচা)', servingGrams: 100, servingEn: '100g lean raw beef', servingBn: '১০০ গ্রাম চর্বিহীন গরুর মাংস' },
  '10_0006': { bn: 'মুরগির বুকের মাংস (চামড়া ছাড়া, কাঁচা)', servingGrams: 100, servingEn: '100g skinless chicken breast', servingBn: '১০০ গ্রাম মুরগির বুকের মাংস' },
  '10_0007': { bn: 'মুরগির রানের মাংস (চামড়া ছাড়া, কাঁচা)', servingGrams: 100, servingEn: '100g skinless leg', servingBn: '১০০ গ্রাম মুরগির রানের মাংস' },
  '10_0016': { bn: 'গরুর হাঁড়ি কাবাব (FCT রেসিপি)', servingGrams: 100, servingEn: '1 serving (100g)', servingBn: '১ সার্ভিং হাঁড়ি কাবাব (১০০ গ্রাম)' },
  '11_0001': { bn: 'ফার্মের মুরগির ডিম (কাঁচা)', servingGrams: 50, servingEn: '1 medium egg (50g)', servingBn: '১টি ফার্মের ডিম (৫০ গ্রাম)' },
  '11_0005': { bn: 'ফার্মের মুরগির ডিম (সিদ্ধ, লবণ ছাড়া)', servingGrams: 50, servingEn: '1 boiled egg (50g)', servingBn: '১টি সিদ্ধ ডিম (৫০ গ্রাম)' },
  '11_0002': { bn: 'দেশি মুরগির ডিম (কাঁচা)', servingGrams: 42, servingEn: '1 deshi egg (42g)', servingBn: '১টি দেশি ডিম (৪২ গ্রাম)' },
  '11_0006': { bn: 'দেশি মুরগির ডিম (সিদ্ধ)', servingGrams: 42, servingEn: '1 boiled deshi egg (42g)', servingBn: '১টি সিদ্ধ দেশি ডিম (৪২ গ্রাম)' },
  '11_0004': { bn: 'হাঁসের ডিম (কাঁচা)', servingGrams: 65, servingEn: '1 duck egg (65g)', servingBn: '১টি হাঁসের ডিম (৬৫ গ্রাম)' },
  '11_0007': { bn: 'হাঁসের ডিম (সিদ্ধ)', servingGrams: 65, servingEn: '1 boiled duck egg (65g)', servingBn: '১টি সিদ্ধ হাঁসের ডিম (৬৫ গ্রাম)' },
  '12_0008': { bn: 'গরুর তরল দুধ (পূর্ণ ফ্যাট / পাস্তুরিত)', servingGrams: 250, servingEn: '1 glass milk (250g)', servingBn: '১ গ্লাস গরুর দুধ (২৫০ গ্রাম)' },
  '12_0003': { bn: 'মিষ্টি দই', servingGrams: 100, servingEn: '1 small cup curd (100g)', servingBn: '১ কাপ মিষ্টি দই (১০০ গ্রাম)' },
  '12_0001': { bn: 'ঘোল / মাঠা', servingGrams: 250, servingEn: '1 glass (250g)', servingBn: '১ গ্লাস ঘোল (২৫০ গ্রাম)' },
  '12_0013': { bn: 'পায়েস (দুধ ও চালের পায়েস)', servingGrams: 150, servingEn: '1 dessert bowl payesh (150g)', servingBn: '১ বাটি পায়েস (১৫০ গ্রাম)' },
  '14_0007': { bn: 'দুধ চা (চিনি ও গুঁড়া দুধসহ)', servingGrams: 150, servingEn: '1 cup milk tea (150g)', servingBn: '১ কাপ দুধ চা (১৫০ গ্রাম)' },
};

// Direct raw <-> cooked pairs in official Bangladesh FCT
const RAW_COOKED_PAIRS: Record<string, string> = {
  '01_0012': '01_0037',
  '01_0037': '01_0012',
  '01_0020': '01_0038',
  '01_0038': '01_0020',
  '01_0021': '01_0039',
  '01_0039': '01_0021',
  '01_0024': '01_0040',
  '01_0040': '01_0024',
  '01_0025': '01_0041',
  '01_0041': '01_0025',
  '01_0010': '01_0011',
  '01_0011': '01_0010',
  '02_0008': '02_0015',
  '02_0015': '02_0008',
  '02_0002': '02_0012',
  '02_0012': '02_0002',
  '03_0005': '03_0033',
  '03_0033': '03_0005',
  '03_0007': '03_0034',
  '03_0034': '03_0007',
  '04_0004': '04_0032',
  '04_0032': '04_0004',
  '04_0025': '04_0035',
  '04_0035': '04_0025',
  '04_0020': '04_0036',
  '04_0036': '04_0020',
  '05_0005': '05_0012',
  '05_0012': '05_0005',
  '11_0001': '11_0005',
  '11_0005': '11_0001',
  '11_0002': '11_0006',
  '11_0006': '11_0002',
  '11_0004': '11_0007',
  '11_0007': '11_0004',
};

function mapGroupToCategory(rawGroup: string, code: string, nameEn: string): BdFctCategory {
  const low = nameEn.toLowerCase();
  if (
    code === '01_0035' ||
    code === '05_0021' ||
    code === '12_0013' ||
    code === '10_0016'
  ) {
    return 'traditional_dishes';
  }
  if (
    code === '01_0034' ||
    code === '01_0002' ||
    code === '01_0022' ||
    code === '01_0023' ||
    code === '14_0007' ||
    rawGroup.startsWith('13 ') ||
    rawGroup.startsWith('14 ') ||
    rawGroup.startsWith('15 ') ||
    low.includes('biscuit') ||
    low.includes('soft drinks')
  ) {
    return 'snacks_street_foods';
  }
  if (rawGroup.startsWith('01 ')) return 'rice_products';
  if (rawGroup.startsWith('02 ')) return 'lentils_pulses';
  if (rawGroup.startsWith('03 ') || rawGroup.startsWith('05 ')) return 'vegetables';
  if (rawGroup.startsWith('04 ')) return 'leafy_vegetables';
  if (rawGroup.startsWith('09 ')) return 'freshwater_fish';
  if (rawGroup.startsWith('10 ') || rawGroup.startsWith('11 ')) return 'meat_eggs';
  if (rawGroup.startsWith('08 ')) return 'fruits';
  if (rawGroup.startsWith('12 ')) return 'milk_dairy';
  if (rawGroup.startsWith('06 ') || rawGroup.startsWith('07 ')) return 'snacks_street_foods';
  return 'vegetables';
}

const RAW_FCT_MAP = new Map<string, any>(
  (rawSnapshot as any[]).map((r) => [r.code, r])
);

const BASE_FCT_RECORDS: BdFctFoodRecord[] = (rawSnapshot as any[]).map((item) => {
  const mappedCat = mapGroupToCategory(item.group, item.code, item.nameEn);
  const enrich = BANGLA_UNIFIED_NAMES[item.code];
  const bnName = enrich?.bn || item.nameBnRoman;
  const isCooked = item.prepState === 'cooked';

  return {
    code: item.code,
    rawFctGroup: item.group,
    category: mappedCat,
    nameEn: item.nameEn,
    nameBn: bnName,
    nameBnRoman: item.nameBnRoman,
    description: `${item.group.replace(/^\d+\s+/, '')} — ${isCooked ? 'Cooked / prepared form' : 'Raw edible portion'}${
      item.scientificName ? ` (${item.scientificName})` : ''
    }. Verified INFS Bangladesh entry.`,
    descriptionBn: `${isCooked ? 'রান্না / প্রস্তুতকৃত অবস্থা' : 'কাঁচা ভোজ্য অংশ'} (${item.nameBnRoman})। ঢাকা বিশ্ববিদ্যালয় INFS বাংলাদেশ ফুড কম্পোজিশন টেবিলের রেকর্ড।`,
    scientificName: item.scientificName || null,
    prepState: item.prepState,
    unit: 'per 100g edible portion',
    defaultServingGrams: enrich?.servingGrams || (isCooked ? 150 : 100),
    defaultServingLabel: enrich?.servingEn || (isCooked ? '1 standard cooked serving (150g)' : '100g edible portion'),
    defaultServingLabelBn: enrich?.servingBn || (isCooked ? '১টি আদর্শ পরিবেশন (১৫০ গ্রাম)' : '১০০ গ্রাম ভোজ্য অংশ'),
    sourceName: item.sourceName,
    sourceYear: item.sourceYear,
    sourceUrl: item.sourceUrl,
    biblioRef: item.biblioRef,
    dataQuality: item.dataQuality as BdFctDataQuality,
    edibleCoefficient: item.edibleCoefficient ?? null,
    rawCookedPairCode: RAW_COOKED_PAIRS[item.code],
    nutrientsPer100g: item.nutrientsPer100g,
  };
});

/**
 * Computes transparent Estimated Bangladeshi Traditional Dishes & Street Foods
 * strictly from verified ingredient rows in the INFS Bangladesh FCT database.
 * Never invents missing nutrient values; preserves null if all contributors lack a nutrient.
 */
function buildEstimatedDishFromFctIngredients(params: {
  code: string;
  category: BdFctCategory;
  nameEn: string;
  nameBn: string;
  nameBnRoman: string;
  description: string;
  descriptionBn: string;
  defaultServingGrams: number;
  defaultServingLabel: string;
  defaultServingLabelBn: string;
  yieldMultiplier: number; // cooked yield relative to raw ingredient weight (e.g. 0.90 after moisture loss or 1.25 after water addition)
  ingredients: Array<{ fctCode: string; gramsUsed: number }>;
}): BdFctFoodRecord {
  const nutrientKeys: Array<keyof BdFctNutrients> = [
    'caloriesKcal',
    'waterG',
    'proteinG',
    'totalFatG',
    'saturatedFatG',
    'carbsG',
    'fiberG',
    'sugarG',
    'ashG',
    'calciumMg',
    'ironMg',
    'magnesiumMg',
    'phosphorusMg',
    'potassiumMg',
    'sodiumMg',
    'zincMg',
    'copperMg',
    'vitaminAMcg',
    'retinolMcg',
    'betaCaroteneEqMcg',
    'vitaminDMcg',
    'vitaminEMg',
    'vitaminB1Mg',
    'vitaminB2Mg',
    'vitaminB3Mg',
    'vitaminB6Mg',
    'folateMcg',
    'vitaminB12Mcg',
    'vitaminCMg',
    'cholesterolMg',
  ];

  const totalRawGrams = params.ingredients.reduce((sum, i) => sum + i.gramsUsed, 0);
  const finalCookedGrams = Math.max(1, totalRawGrams * params.yieldMultiplier);

  const ingredientRefs: BdFctRecipeIngredientRef[] = [];
  const summed: Partial<Record<keyof BdFctNutrients, number>> = {};
  const hasAnyValue: Partial<Record<keyof BdFctNutrients, boolean>> = {};

  for (const ing of params.ingredients) {
    const src = RAW_FCT_MAP.get(ing.fctCode);
    if (!src) continue;
    const enrich = BANGLA_UNIFIED_NAMES[ing.fctCode];
    ingredientRefs.push({
      fctCode: ing.fctCode,
      nameEn: src.nameEn,
      nameBn: enrich?.bn || src.nameBnRoman,
      gramsUsed: ing.gramsUsed,
    });

    const factor = ing.gramsUsed / 100;
    for (const key of nutrientKeys) {
      const val = src.nutrientsPer100g[key];
      if (typeof val === 'number' && Number.isFinite(val)) {
        summed[key] = (summed[key] || 0) + val * factor;
        hasAnyValue[key] = true;
      }
    }
  }

  const per100g = {} as BdFctNutrients;
  for (const key of nutrientKeys) {
    if (hasAnyValue[key]) {
      per100g[key] = Math.round(((summed[key] || 0) / finalCookedGrams) * 100 * 1000) / 1000;
    } else {
      per100g[key] = null;
    }
  }

  return {
    code: params.code,
    rawFctGroup: 'Estimated Traditional Bangladeshi Recipe / Street Food',
    category: params.category,
    nameEn: params.nameEn,
    nameBn: params.nameBn,
    nameBnRoman: params.nameBnRoman,
    description: params.description,
    descriptionBn: params.descriptionBn,
    scientificName: null,
    prepState: 'cooked',
    unit: 'per 100g prepared dish (estimated)',
    defaultServingGrams: params.defaultServingGrams,
    defaultServingLabel: params.defaultServingLabel,
    defaultServingLabelBn: params.defaultServingLabelBn,
    sourceName: 'Estimated Recipe Calculation from INFS FCTB Ingredients',
    sourceYear: 2013,
    sourceUrl: 'https://www.fao.org/fileadmin/templates/food_composition/documents/FCT_10_2_14_final_version.pdf',
    biblioRef: `Estimated from INFS FCT codes: ${params.ingredients.map((i) => i.fctCode).join(', ')} (Yield ${params.yieldMultiplier}x)`,
    dataQuality: 'estimated',
    edibleCoefficient: 1,
    recipeBreakdown: ingredientRefs,
    nutrientsPer100g: per100g,
  };
}

const ESTIMATED_BANGLADESHI_DISHES: BdFctFoodRecord[] = [
  buildEstimatedDishFromFctIngredients({
    code: 'EST_SHAK_BHAJI',
    category: 'traditional_dishes',
    nameEn: 'Shak Bhaji (Stir-Fried Red Amaranth Greens)*',
    nameBn: 'শাক ভাজি (লাল শাক ও পেঁয়াজ-রসুন ভাজি)',
    nameBnRoman: 'Lal Shak Bhaji',
    description: 'Estimated from FCTB Red Amaranth (04_0004), Mustard Oil (13_0008), Onion (03_0024), and Garlic (03_0014). Exact recipe varies by oil quantity used.',
    descriptionBn: 'FCTB-এর লাল শাক, সরিষার তেল, পেঁয়াজ ও রসুন থেকে আনুমানিক হিসাবকৃত। রান্নায় তেলের পরিমাণের ওপর মান সামান্য পরিবর্তিত হতে পারে।',
    defaultServingGrams: 100,
    defaultServingLabel: '1 household bowl (100g)',
    defaultServingLabelBn: '১ বাটি শাক ভাজি (১০০ গ্রাম)',
    yieldMultiplier: 0.78,
    ingredients: [
      { fctCode: '04_0004', gramsUsed: 250 },
      { fctCode: '13_0008', gramsUsed: 12 },
      { fctCode: '03_0024', gramsUsed: 30 },
      { fctCode: '03_0014', gramsUsed: 8 },
    ],
  }),
  buildEstimatedDishFromFctIngredients({
    code: 'EST_MACHER_JHOL',
    category: 'traditional_dishes',
    nameEn: 'Rui Macher Jhol (Bangladeshi Rohu Fish Curry with Potato)*',
    nameBn: 'মাছের ঝোল (রুই মাছ ও আলুর পাতলা ঝোল)',
    nameBnRoman: 'Rui Macher Jhol',
    description: 'Estimated from FCTB Rohu Fish (09_0060), Potato (05_0005), Onion (03_0024), Soya Oil (13_0012), and Turmeric (07_0020) plus cooking broth yield.',
    descriptionBn: 'রুই মাছ, আলু, পেঁয়াজ, সয়াবিন তেল ও হলুদ থেকে আনুমানিক হিসাবকৃত ঐতিহ্যবাহী মাছের ঝোল।',
    defaultServingGrams: 180,
    defaultServingLabel: '1 bowl (1 fish piece + potato & gravy, 180g)',
    defaultServingLabelBn: '১ বাটি মাছের ঝোল (১ টুকরা মাছ ও ঝোল, ১৮০ গ্রাম)',
    yieldMultiplier: 1.35,
    ingredients: [
      { fctCode: '09_0060', gramsUsed: 120 },
      { fctCode: '05_0005', gramsUsed: 60 },
      { fctCode: '03_0024', gramsUsed: 35 },
      { fctCode: '13_0012', gramsUsed: 15 },
      { fctCode: '07_0020', gramsUsed: 3 },
    ],
  }),
  buildEstimatedDishFromFctIngredients({
    code: 'EST_BEGUN_BHORTA',
    category: 'traditional_dishes',
    nameEn: 'Begun Bhorta (Roasted Brinjal Mash with Mustard Oil)*',
    nameBn: 'বেগুন ভর্তা (সরিষার তেল ও পেঁয়াজসহ)',
    nameBnRoman: 'Begun Bhorta',
    description: 'Estimated from FCTB Purple Brinjal (03_0005), Mustard Oil (13_0008), Onion (03_0024), and Garlic (03_0014).',
    descriptionBn: 'বেগুন, সরিষার তেল, পেঁয়াজ ও রসুন থেকে আনুমানিক হিসাবকৃত বেগুন ভর্তা।',
    defaultServingGrams: 75,
    defaultServingLabel: '1 traditional serving (75g)',
    defaultServingLabelBn: '১ পরিবেশন বেগুন ভর্তা (৭৫ গ্রাম)',
    yieldMultiplier: 0.75,
    ingredients: [
      { fctCode: '03_0005', gramsUsed: 200 },
      { fctCode: '03_0024', gramsUsed: 30 },
      { fctCode: '13_0008', gramsUsed: 10 },
      { fctCode: '03_0014', gramsUsed: 5 },
    ],
  }),
  buildEstimatedDishFromFctIngredients({
    code: 'EST_BHAPA_PITHA',
    category: 'traditional_dishes',
    nameEn: 'Bhapa Pitha (Steamed Rice Flour & Date Palm Jaggery Cake)*',
    nameBn: 'ভাপা পিঠা (চালের গুঁড়া, খেজুর গুড় ও নারকেল)',
    nameBnRoman: 'Bhapa Pitha',
    description: 'Traditional winter steamed pitha estimated from milled rice flour base (01_0025), Date Palm Jaggery (15_0005), and Mature Coconut (06_0006).',
    descriptionBn: 'চালের গুঁড়া, খেজুরের গুড় ও কোড়ানো নারকেল থেকে আনুমানিক হিসাবকৃত শীতকালীন ভাপা পিঠা।',
    defaultServingGrams: 85,
    defaultServingLabel: '1 steamed pitha (85g)',
    defaultServingLabelBn: '১টি ভাপা পিঠা (৮৫ গ্রাম)',
    yieldMultiplier: 1.15,
    ingredients: [
      { fctCode: '01_0025', gramsUsed: 100 },
      { fctCode: '15_0005', gramsUsed: 35 },
      { fctCode: '06_0006', gramsUsed: 25 },
    ],
  }),
  buildEstimatedDishFromFctIngredients({
    code: 'EST_CHITOI_PITHA',
    category: 'traditional_dishes',
    nameEn: 'Chitoi Pitha (Steamed Fermented-Free Rice Pancake)*',
    nameBn: 'চিতই পিঠা (চালের গুঁড়ার পিঠা)',
    nameBnRoman: 'Chitoi Pitha',
    description: 'Estimated from milled white rice (01_0025) steamed into batter cakes with water absorption.',
    descriptionBn: 'চালের গুঁড়া ও পানি থেকে আনুমানিক হিসাবকৃত চিতই পিঠা।',
    defaultServingGrams: 60,
    defaultServingLabel: '1 medium pitha (60g)',
    defaultServingLabelBn: '১টি চিতই পিঠা (৬০ গ্রাম)',
    yieldMultiplier: 1.55,
    ingredients: [{ fctCode: '01_0025', gramsUsed: 100 }],
  }),
  buildEstimatedDishFromFctIngredients({
    code: 'EST_SINGARA',
    category: 'snacks_street_foods',
    nameEn: 'Bangladeshi Singara (Fried Spiced Potato Pastry)*',
    nameBn: 'সিঙ্গারা (ময়দা ও আলুর পুর ভাজা)',
    nameBnRoman: 'Singara',
    description: 'Street-snack estimate computed from refined wheat flour (01_0032), potato (05_0005), onion (03_0024), and frying oil uptake (13_0012).',
    descriptionBn: 'ময়দা, আলু, পেঁয়াজ ও ভাজার তেল থেকে আনুমানিক হিসাবকৃত দেশীয় সিঙ্গারা।',
    defaultServingGrams: 65,
    defaultServingLabel: '1 regular singara (65g)',
    defaultServingLabelBn: '১টি সিঙ্গারা (৬৫ গ্রাম)',
    yieldMultiplier: 0.92,
    ingredients: [
      { fctCode: '01_0032', gramsUsed: 45 },
      { fctCode: '05_0005', gramsUsed: 65 },
      { fctCode: '03_0024', gramsUsed: 15 },
      { fctCode: '13_0012', gramsUsed: 20 },
    ],
  }),
  buildEstimatedDishFromFctIngredients({
    code: 'EST_CHOLA_BHUNA',
    category: 'snacks_street_foods',
    nameEn: 'Chola Bhuna (Spiced Whole Chickpea Iftar Snack)*',
    nameBn: 'ছোলা ভুনা (সিদ্ধ ছোলা, আলু ও পেঁয়াজ ভুনা)',
    nameBnRoman: 'Chola Bhuna',
    description: 'Estimated from boiled Bengal gram whole chickpeas (02_0012), boiled potato (05_0012), onion (03_0024), and soya oil (13_0012).',
    descriptionBn: 'সিদ্ধ ছোলা, আলু, পেঁয়াজ ও তেল থেকে আনুমানিক হিসাবকৃত ছোলা ভুনা।',
    defaultServingGrams: 120,
    defaultServingLabel: '1 iftar bowl (120g)',
    defaultServingLabelBn: '১ বাটি ছোলা ভুনা (১২০ গ্রাম)',
    yieldMultiplier: 0.95,
    ingredients: [
      { fctCode: '02_0012', gramsUsed: 100 },
      { fctCode: '05_0012', gramsUsed: 35 },
      { fctCode: '03_0024', gramsUsed: 25 },
      { fctCode: '13_0012', gramsUsed: 10 },
    ],
  }),
  buildEstimatedDishFromFctIngredients({
    code: 'EST_FUCHKA',
    category: 'snacks_street_foods',
    nameEn: 'Fuchka Plate (Crispy Shell with Chickpea, Potato & Tamarind Water)*',
    nameBn: 'ফুচকা (মচমচে পুরি, ছোলা-আলু পুর ও তেঁতুলের টক)',
    nameBnRoman: 'Fuchka',
    description: 'Estimated street-food serving combining whole/refined flour shell (01_0032), boiled Bengal gram (02_0012), boiled potato (05_0012), tamarind pulp (08_0041), onion (03_0024), and oil.',
    descriptionBn: 'ফুচকার খোসা, সিদ্ধ ছোলা-আলু, পেঁয়াজ ও তেঁতুলের টক মিলিয়ে আনুমানিক হিসাবকৃত।',
    defaultServingGrams: 160,
    defaultServingLabel: '1 plate (6 pcs with stuffing & tok, 160g)',
    defaultServingLabelBn: '১ প্লেট ফুচকা (৬টি ও টকসহ, ১৬০ গ্রাম)',
    yieldMultiplier: 1.05,
    ingredients: [
      { fctCode: '01_0032', gramsUsed: 40 },
      { fctCode: '05_0012', gramsUsed: 65 },
      { fctCode: '02_0012', gramsUsed: 35 },
      { fctCode: '08_0041', gramsUsed: 15 },
      { fctCode: '03_0024', gramsUsed: 15 },
      { fctCode: '13_0012', gramsUsed: 12 },
    ],
  }),
];

export const BD_FCT_DATABASE: BdFctFoodRecord[] = [
  ...BASE_FCT_RECORDS,
  ...ESTIMATED_BANGLADESHI_DISHES,
];

export function scaleBdFctNutrients(base: BdFctNutrients, targetGrams: number): BdFctNutrients {
  const factor = Math.max(0, targetGrams) / 100;
  const scaled = {} as BdFctNutrients;
  for (const key of Object.keys(base) as Array<keyof BdFctNutrients>) {
    const val = base[key];
    scaled[key] = typeof val === 'number' && Number.isFinite(val) ? Math.round(val * factor * 100) / 100 : null;
  }
  return scaled;
}

export function searchBdFctFoods(params: {
  query?: string;
  category?: BdFctCategory | 'all';
  prepState?: 'all' | 'raw' | 'cooked';
  dataQuality?: BdFctDataQuality | 'all';
}): BdFctFoodRecord[] {
  const q = (params.query || '').trim().toLowerCase();
  return BD_FCT_DATABASE.filter((item) => {
    if (params.category && params.category !== 'all' && item.category !== params.category) return false;
    if (params.prepState && params.prepState !== 'all' && item.prepState !== params.prepState) return false;
    if (params.dataQuality && params.dataQuality !== 'all' && item.dataQuality !== params.dataQuality) return false;
    if (!q) return true;
    return (
      item.nameEn.toLowerCase().includes(q) ||
      item.nameBn.toLowerCase().includes(q) ||
      item.nameBnRoman.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      (item.scientificName || '').toLowerCase().includes(q)
    );
  });
}

/**
 * Generates strictly non-medical physiological explanations of nutrient roles in normal body functions.
 * Never claims any food cures, treats, or prevents diseases.
 */
export function buildPhysiologicalBenefits(
  item: BdFctFoodRecord,
  isBn: boolean
): string[] {
  const n = item.nutrientsPer100g;
  const notes: string[] = [];

  if ((n.proteinG || 0) >= 8) {
    notes.push(
      isBn
        ? `উচ্চ প্রোটিন (${n.proteinG}g/100g): শরীরের কোষ ও পেশী গঠন, এনজাইম উৎপাদন এবং স্বাভাবিক টিস্যু মেরামতে ভূমিকা রাখে।`
        : `Notable Protein (${n.proteinG}g/100g): Supplies amino acids that support normal muscle maintenance, enzyme synthesis, and tissue repair.`
    );
  }
  if ((n.carbsG || 0) >= 18) {
    notes.push(
      isBn
        ? `কার্বোহাইড্রেট (${n.carbsG}g/100g): দৈনন্দিন শারীরিক পরিশ্রম ও মস্তিষ্কের স্বাভাবিক কর্মক্ষমতার জন্য প্রধান শক্তির উৎস।`
        : `Energy-yielding Carbohydrates (${n.carbsG}g/100g): Serves as primary fuel for everyday physical activity and normal brain function.`
    );
  }
  if ((n.fiberG || 0) >= 2.5) {
    notes.push(
      isBn
        ? `খাদ্য-আঁশ / ফাইবার (${n.fiberG}g/100g): স্বাভাবিক হজমক্রিয়া ও অন্ত্রের সুস্থ গতিশীলতা বজায় রাখতে সহায়তা করে।`
        : `Dietary Fiber (${n.fiberG}g/100g): Supports normal digestive motility and regular bowel function.`
    );
  }
  if ((n.ironMg || 0) >= 1.5) {
    notes.push(
      isBn
        ? `আয়রন (${n.ironMg}mg/100g): রক্তের হিমোগ্লোবিন তৈরি ও কোষে স্বাভাবিক অক্সিজেন পরিবহনে সহায়তা করে।`
        : `Iron (${n.ironMg}mg/100g): Supports normal hemoglobin formation and oxygen transport throughout the body.`
    );
  }
  if ((n.calciumMg || 0) >= 60) {
    notes.push(
      isBn
        ? `ক্যালসিয়াম (${n.calciumMg}mg/100g): হাড় ও দাঁতের স্বাভাবিক গঠন এবং পেশীর সংকোচন-প্রসারণে সহায়ক।`
        : `Calcium (${n.calciumMg}mg/100g): Supports normal bone and tooth mineralization as well as muscle function.`
    );
  }
  if ((n.zincMg || 0) >= 1.0) {
    notes.push(
      isBn
        ? `জিংক (${n.zincMg}mg/100g): স্বাভাবিক বিপাক প্রক্রিয়া এবং দেহের স্বাভাবিক প্রতিরোধ ব্যবস্থার কার্যে সহায়ক।`
        : `Zinc (${n.zincMg}mg/100g): Plays a structural role in normal metabolism and healthy immune system maintenance.`
    );
  }
  if ((n.potassiumMg || 0) >= 200) {
    notes.push(
      isBn
        ? `পটাশিয়াম (${n.potassiumMg}mg/100g): কোষের তরল ভারসাম্য এবং স্বাভাবিক স্নায়ু ও পেশীর কার্যে সহায়তা করে।`
        : `Potassium (${n.potassiumMg}mg/100g): Helps maintain normal fluid balance, nerve signaling, and muscle contraction.`
    );
  }
  if ((n.vitaminAMcg || 0) >= 60) {
    notes.push(
      isBn
        ? `ভিটামিন এ (${n.vitaminAMcg} mcg RAE/100g): স্বাভাবিক দৃষ্টিশক্তি এবং ত্বক ও মিউকাস পর্দার সুস্থতা বজায় রাখতে ভূমিকা রাখে।`
        : `Vitamin A (${n.vitaminAMcg} mcg RAE/100g): Supports normal vision and healthy skin and epithelial tissues.`
    );
  }
  if ((n.vitaminCMg || 0) >= 10) {
    notes.push(
      isBn
        ? `ভিটামিন সি (${n.vitaminCMg}mg/100g): কোলাজেন গঠনে ভূমিকা রাখে এবং উদ্ভিজ্জ উৎস থেকে আয়রন শোষণ বাড়াতে সাহায্য করে।`
        : `Vitamin C (${n.vitaminCMg}mg/100g): Supports normal collagen synthesis and enhances non-heme iron absorption from plant foods.`
    );
  }
  if ((n.vitaminB1Mg || 0) >= 0.1 || (n.vitaminB2Mg || 0) >= 0.1 || (n.vitaminB3Mg || 0) >= 1.5 || (n.vitaminB6Mg || 0) >= 0.15) {
    notes.push(
      isBn
        ? `বি-কমপ্লেক্স ভিটামিন (B1/B2/B3/B6): খাবার থেকে কোষীয় শক্তি উৎপাদনের স্বাভাবিক এনজাইম বিক্রিয়ায় কো-ফ্যাক্টর হিসেবে কাজ করে।`
        : `B-Complex Vitamins (Thiamin, Riboflavin, Niacin, B6): Act as essential cofactors in normal cellular energy metabolism.`
    );
  }

  if (notes.length === 0) {
    notes.push(
      isBn
        ? 'সুষম খাদ্যের অংশ হিসেবে এই খাবার পরিমিত পরিমাণে গ্রহণ করলে দৈনন্দিন শক্তি ও পুষ্টির চাহিদায় অবদান রাখে।'
        : 'Contributes dietary energy and fluid/micronutrient balance when consumed in balanced portions as part of a varied diet.'
    );
  }

  return notes;
}
