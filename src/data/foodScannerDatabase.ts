import {
  ConsistencyCheckItem,
  ExcessNutrientAlert,
  FoodSafetyReport,
  HealthBenefitAnalysis,
  MicronutrientEntry,
  NutrientProfile,
  PackagedFoodDetails,
  SafetyStatusCode,
  ScannedFoodItem,
  VisualSafetyInspection,
} from '../types';

export interface ReferenceFoodEntry {
  id: string;
  name: string;
  nameBn: string;
  category: string;
  categoryBn: string;
  defaultPortionGrams: number;
  servingLabel: string;
  servingLabelBn: string;
  keywords: string[];
  sourceLabel: string;
  sourceLabelBn: string;
  per100g: NutrientProfile;
  benefits: string[];
  benefitsBn: string[];
  bodyFunctions: string[];
  bodyFunctionsBn: string[];
  allergens: string[];
  allergensBn: string[];
  mealSuggestions: string[];
  mealSuggestionsBn: string[];
}

export const LAB_VERIFICATION_DISCLAIMER =
  'Visual AI cannot confirm chemical adulteration. Laboratory testing is required for confirmation.';
export const LAB_VERIFICATION_DISCLAIMER_BN =
  'দৃশ্যমান এআই রাসায়নিক ভেজাল নিশ্চিত করতে পারে না। নিশ্চিতকরণের জন্য ল্যাবরেটরি পরীক্ষা প্রয়োজন।';

export const SAFETY_STATUS_COPY: Record<
  SafetyStatusCode,
  { en: string; bn: string }
> = {
  consistent: {
    en: 'Information available — available details are consistent.',
    bn: 'তথ্য পাওয়া গেছে — প্রাপ্ত বিবরণগুলো সামঞ্জস্যপূর্ণ।',
  },
  needs_checking: {
    en: 'Needs further checking — information is incomplete or suspicious.',
    bn: 'আরও যাচাই প্রয়োজন — তথ্য অসম্পূর্ণ বা সন্দেহজনক।',
  },
  lab_required: {
    en: 'Laboratory verification required — possible contamination or adulteration cannot be ruled out.',
    bn: 'ল্যাবরেটরি যাচাই প্রয়োজন — সম্ভাব্য দূষণ বা ভেজালের ঝুঁকি উড়িয়ে দেওয়া যাচ্ছে না।',
  },
};

export const FOOD_SCANNER_DATABASE: ReferenceFoodEntry[] = [
  {
    id: 'steamed-rice',
    name: 'Steamed White Rice (Bhat)',
    nameBn: 'সাদা ভাত',
    category: 'Rice & Grains (ভাত)',
    categoryBn: 'ভাত ও দানা শস্য',
    defaultPortionGrams: 180,
    servingLabel: '1 medium plate (~180g)',
    servingLabelBn: '১ মাঝারি প্লেট (~১৮০ গ্রাম)',
    keywords: ['rice', 'bhat', 'steamed rice', 'white rice', 'ভাত', 'সাদা ভাত', 'চাল', 'miniket'],
    sourceLabel: 'Bangladesh Food Composition Table (INFS) & USDA',
    sourceLabelBn: 'বাংলাদেশ খাদ্য পুষ্টি টেবিল (INFS) ও USDA',
    per100g: {
      calories: 130,
      proteinG: 2.7,
      carbsG: 28.2,
      totalFatG: 0.3,
      saturatedFatG: 0.1,
      fiberG: 0.4,
      sugarG: 0.1,
      sodiumMg: 1,
      vitamins: [
        { name: 'Vitamin B1 (Thiamin)', nameBn: 'ভিটামিন বি১', amount: '0.02 mg', dailyValuePct: 2 },
        { name: 'Folate (B9)', nameBn: 'ফোলেট (বি৯)', amount: '3 mcg', dailyValuePct: 1 },
      ],
      minerals: [
        { name: 'Manganese', nameBn: 'ম্যাঙ্গানিজ', amount: '0.47 mg', dailyValuePct: 20 },
        { name: 'Magnesium', nameBn: 'ম্যাগনেসিয়াম', amount: '12 mg', dailyValuePct: 3 },
      ],
    },
    benefits: ['Clean, fast-digesting glycogen energy source for daily physical work'],
    benefitsBn: ['দৈনন্দিন কাজের জন্য দ্রুত হজমযোগ্য শক্তির প্রধান উৎস'],
    bodyFunctions: ['Supports immediate brain glucose metabolism and muscular glycogen replenishment'],
    bodyFunctionsBn: ['মস্তিষ্কের তাৎক্ষণিক গ্লুকোজ চাহিদা এবং পেশির শক্তি পূরণে সহায়তা করে'],
    allergens: [],
    allergensBn: [],
    mealSuggestions: ['Pair with Lentil Dal (ডাল), leafy Shak, and fish to lower glycemic spike and balance amino acids.'],
    mealSuggestionsBn: ['রক্তে শর্করার দ্রুত বৃদ্ধি কমাতে এবং সম্পূর্ণ প্রোটিন পেতে ভাতের সাথে ডাল, শাক ও মাছ খান।'],
  },
  {
    id: 'lentil-dal',
    name: 'Masoor Lentil Dal',
    nameBn: 'মসুর ডাল',
    category: 'Lentils (ডাল)',
    categoryBn: 'ডাল ও শিম',
    defaultPortionGrams: 160,
    servingLabel: '1 bowl (~160g)',
    servingLabelBn: '১ বাটি (~১৬০ গ্রাম)',
    keywords: ['dal', 'lentil', 'masoor', 'daal', 'ডাল', 'মসুর ডাল', 'মুগ ডাল'],
    sourceLabel: 'Bangladesh Food Composition Table (INFS)',
    sourceLabelBn: 'বাংলাদেশ খাদ্য পুষ্টি টেবিল (INFS)',
    per100g: {
      calories: 116,
      proteinG: 9.0,
      carbsG: 20.1,
      totalFatG: 0.4,
      saturatedFatG: 0.1,
      fiberG: 7.9,
      sugarG: 1.8,
      sodiumMg: 185,
      vitamins: [
        { name: 'Folate (B9)', nameBn: 'ফোলেট (বি৯)', amount: '181 mcg', dailyValuePct: 45 },
        { name: 'Vitamin B6', nameBn: 'ভিটামিন বি৬', amount: '0.18 mg', dailyValuePct: 11 },
      ],
      minerals: [
        { name: 'Iron', nameBn: 'আয়রন', amount: '3.3 mg', dailyValuePct: 18 },
        { name: 'Potassium', nameBn: 'পটাশিয়াম', amount: '369 mg', dailyValuePct: 8 },
      ],
    },
    benefits: ['Plant-based protein powerhouse rich in soluble fiber and folate'],
    benefitsBn: ['উদ্ভিজ্জ প্রোটিন, আঁশ ও ফোলেটের উৎকৃষ্ট উৎস'],
    bodyFunctions: ['Supports red blood cell production, gut motility, and steady blood glucose regulation'],
    bodyFunctionsBn: ['লোহিত রক্তকণিকা তৈরি, হজমশক্তি ও রক্তের শর্করা নিয়ন্ত্রণে সাহায্য করে'],
    allergens: [],
    allergensBn: [],
    mealSuggestions: ['Add a squeeze of fresh lime/lemon juice to enhance plant iron absorption alongside rice.'],
    mealSuggestionsBn: ['ডালের আয়রন শোষণ বাড়াতে খাওয়ার সময় সামান্য লেবুর রস যোগ করুন।'],
  },
  {
    id: 'fish-curry',
    name: 'Bengali Fish Curry (Rui / Hilsa)',
    nameBn: 'মাছের ঝোল / ইলিশ মাছ',
    category: 'Fish (মাছ)',
    categoryBn: 'মাছ ও সামুদ্রিক খাবার',
    defaultPortionGrams: 140,
    servingLabel: '1 fish piece with gravy (~140g)',
    servingLabelBn: '১ টুকরো মাছ ও ঝোল (~১৪০ গ্রাম)',
    keywords: ['fish', 'ilish', 'hilsa', 'rui', 'rohu', 'katla', 'মাছ', 'ইলিশ', 'রুই', 'মাছের ঝোল', 'fish curry'],
    sourceLabel: 'Bangladesh National Food Composition Table (INFS)',
    sourceLabelBn: 'বাংলাদেশ জাতীয় খাদ্য পুষ্টি টেবিল (INFS)',
    per100g: {
      calories: 175,
      proteinG: 18.5,
      carbsG: 2.8,
      totalFatG: 9.8,
      saturatedFatG: 2.4,
      fiberG: 0.5,
      sugarG: 0.9,
      sodiumMg: 290,
      vitamins: [
        { name: 'Vitamin D', nameBn: 'ভিটামিন ডি', amount: '4.2 mcg', dailyValuePct: 21 },
        { name: 'Vitamin B12', nameBn: 'ভিটামিন বি১২', amount: '2.8 mcg', dailyValuePct: 117 },
      ],
      minerals: [
        { name: 'Calcium', nameBn: 'ক্যালসিয়াম', amount: '125 mg', dailyValuePct: 10 },
        { name: 'Selenium', nameBn: 'সেলেনিয়াম', amount: '34 mcg', dailyValuePct: 62 },
      ],
    },
    benefits: ['High-biological-value protein with heart-healthy Omega-3 fatty acids and Vitamin D'],
    benefitsBn: ['উচ্চমানের প্রোটিন, হৃদবান্ধব ওমেগা-৩ ফ্যাটি এসিড ও ভিটামিন ডি সমৃদ্ধ'],
    bodyFunctions: ['Maintains muscle tissue repair, cardiovascular health, and nerve signaling'],
    bodyFunctionsBn: ['পেশির গঠন, হৃদযন্ত্রের সুস্থতা এবং স্নায়ুতন্ত্রের কার্যকারিতা রক্ষা করে'],
    allergens: ['Fish'],
    allergensBn: ['মাছ (ফিশ অ্যালার্জেন)'],
    mealSuggestions: ['Serve with moderate steamed rice and green salad for balanced Omega-3 intake.'],
    mealSuggestionsBn: ['পরিমিত ভাত ও শসা-টমেটোর সালাদের সাথে পরিবেশন করুন।'],
  },
  {
    id: 'chicken-meat',
    name: 'Chicken Curry / Bhuna (Murgi)',
    nameBn: 'মুরগির মাংস ভুনা',
    category: 'Meat (মাংস)',
    categoryBn: 'মাংস',
    defaultPortionGrams: 150,
    servingLabel: '2 medium pieces (~150g)',
    servingLabelBn: '২ টুকরো মাংস ও ঝোল (~১৫০ গ্রাম)',
    keywords: ['chicken', 'meat', 'beef', 'mutton', 'biryani', 'মাংস', 'মুরগি', 'গরু', 'চিকেন', 'ভুনা'],
    sourceLabel: 'USDA FoodData Central & INFS Reference',
    sourceLabelBn: 'USDA ও বাংলাদেশ পুষ্টি রেফারেন্স',
    per100g: {
      calories: 198,
      proteinG: 20.5,
      carbsG: 4.5,
      totalFatG: 10.6,
      saturatedFatG: 2.9,
      fiberG: 0.8,
      sugarG: 1.5,
      sodiumMg: 340,
      vitamins: [
        { name: 'Niacin (B3)', nameBn: 'নিয়াসিন (বি৩)', amount: '6.8 mg', dailyValuePct: 43 },
        { name: 'Vitamin B6', nameBn: 'ভিটামিন বি৬', amount: '0.42 mg', dailyValuePct: 25 },
      ],
      minerals: [
        { name: 'Phosphorus', nameBn: 'ফসফরাস', amount: '195 mg', dailyValuePct: 16 },
        { name: 'Zinc', nameBn: 'জিংক', amount: '1.8 mg', dailyValuePct: 16 },
      ],
    },
    benefits: ['Dense complete amino acid source supporting lean body mass and immunity'],
    benefitsBn: ['সম্পূর্ণ অ্যামিনো এসিড ও জিংক সমৃদ্ধ যা পেশি ও রোগপ্রতিরোধ ক্ষমতা বাড়ায়'],
    bodyFunctions: ['Builds enzymes, antibodies, and muscle protein while supporting B-vitamin energy metabolism'],
    bodyFunctionsBn: ['শরীরে এনজাইম, অ্যান্টিবডি এবং পেশি গঠনে গুরুত্বপূর্ণ ভূমিকা রাখে'],
    allergens: [],
    allergensBn: [],
    mealSuggestions: ['Balance rich meat gravies with high-fiber vegetables or cucumber salad to moderate fat intake.'],
    mealSuggestionsBn: ['তৈলাক্ত মাংসের সাথে পর্যাপ্ত শাকসবজি ও সালাদ রাখুন।'],
  },
  {
    id: 'shak-vegetables',
    name: 'Shak Bhaji & Mixed Vegetables',
    nameBn: 'শাক ভাজি ও সবজি',
    category: 'Vegetables (শাকসবজি)',
    categoryBn: 'শাকসবজি',
    defaultPortionGrams: 130,
    servingLabel: '1 bowl (~130g)',
    servingLabelBn: '১ বাটি (~১৩০ গ্রাম)',
    keywords: ['shak', 'shaak', 'spinach', 'amaranth', 'vegetable', 'veggie', 'torkari', 'শাক', 'লাল শাক', 'পালং', 'সবজি', 'তরকারি'],
    sourceLabel: 'Bangladesh National Food Composition Table (INFS)',
    sourceLabelBn: 'বাংলাদেশ জাতীয় খাদ্য পুষ্টি টেবিল (INFS)',
    per100g: {
      calories: 68,
      proteinG: 3.1,
      carbsG: 6.4,
      totalFatG: 3.6,
      saturatedFatG: 0.5,
      fiberG: 3.4,
      sugarG: 1.2,
      sodiumMg: 145,
      vitamins: [
        { name: 'Vitamin A', nameBn: 'ভিটামিন এ', amount: '390 mcg', dailyValuePct: 43 },
        { name: 'Vitamin C', nameBn: 'ভিটামিন সি', amount: '24 mg', dailyValuePct: 27 },
        { name: 'Vitamin K', nameBn: 'ভিটামিন কে', amount: '280 mcg', dailyValuePct: 233 },
      ],
      minerals: [
        { name: 'Calcium', nameBn: 'ক্যালসিয়াম', amount: '165 mg', dailyValuePct: 13 },
        { name: 'Iron', nameBn: 'আয়রন', amount: '3.8 mg', dailyValuePct: 21 },
      ],
    },
    benefits: ['Low-calorie micronutrient powerhouse rich in antioxidants, iron, calcium, and fiber'],
    benefitsBn: ['কম ক্যালরিতে প্রচুর আয়রন, ক্যালসিয়াম, অ্যান্টিঅক্সিডেন্ট ও খাদ্য আঁশের উৎস'],
    bodyFunctions: ['Supports retinal vision, bone mineralization, immune defense, and healthy bowel transit'],
    bodyFunctionsBn: ['দৃষ্টিশক্তি, হাড়ের গঠন, রোগপ্রতিরোধ ক্ষমতা ও হজমক্রিয়া সচল রাখে'],
    allergens: [],
    allergensBn: [],
    mealSuggestions: ['Combine with dal, boiled egg, or fish to turn a low-calorie vegetable plate into a complete meal.'],
    mealSuggestionsBn: ['সুষম খাবারের জন্য এর সাথে ডাল, ডিম বা মাছ যুক্ত করুন।'],
  },
  {
    id: 'bhorta',
    name: 'Traditional Bhorta (Aloo / Begun)',
    nameBn: 'আলু / বেগুন ভর্তা',
    category: 'Bhorta (ভর্তা)',
    categoryBn: 'ঐতিহ্যবাহী ভর্তা',
    defaultPortionGrams: 100,
    servingLabel: '2 servings (~100g)',
    servingLabelBn: '২টি ভর্তার গোল্লা (~১০০ গ্রাম)',
    keywords: ['bhorta', 'vorta', 'aloo bhorta', 'begun bhorta', 'ভর্তা', 'আলু ভর্তা', 'বেগুন ভর্তা'],
    sourceLabel: 'Bangladesh Culinary & INFS Composite Reference',
    sourceLabelBn: 'বাংলাদেশ রন্ধন ও INFS পুষ্টি রেফারেন্স',
    per100g: {
      calories: 132,
      proteinG: 2.3,
      carbsG: 18.5,
      totalFatG: 5.5,
      saturatedFatG: 0.7,
      fiberG: 2.6,
      sugarG: 1.6,
      sodiumMg: 260,
      vitamins: [
        { name: 'Vitamin C', nameBn: 'ভিটামিন সি', amount: '14 mg', dailyValuePct: 16 },
        { name: 'Vitamin B6', nameBn: 'ভিটামিন বি৬', amount: '0.25 mg', dailyValuePct: 15 },
      ],
      minerals: [
        { name: 'Potassium', nameBn: 'পটাশিয়াম', amount: '345 mg', dailyValuePct: 7 },
        { name: 'Magnesium', nameBn: 'ম্যাগনেসিয়াম', amount: '21 mg', dailyValuePct: 5 },
      ],
    },
    benefits: ['Provides potassium, dietary fiber, and monounsaturated fats from mustard oil'],
    benefitsBn: ['পটাশিয়াম, খাদ্য আঁশ এবং খাঁটি সরিষার তেলের উপকারী ফ্যাট সরবরাহ করে'],
    bodyFunctions: ['Helps maintain electrolyte balance and stimulates appetite with natural spice compounds'],
    bodyFunctionsBn: ['ইলেক্ট্রোলাইট ভারসাম্য বজায় রাখে ও প্রাকৃতিক মসলা হজমে সাহায্য করে'],
    allergens: ['Mustard'],
    allergensBn: ['সরিষা (তেল)'],
    mealSuggestions: ['Enjoy in moderation with steamed rice and lentil soup; avoid excess table salt during mashing.'],
    mealSuggestionsBn: ['ভর্তা মাখানোর সময় অতিরিক্ত কাঁচা লবণ এড়িয়ে চলুন এবং ডাল-ভাতের সাথে খান।'],
  },
  {
    id: 'khichuri',
    name: 'Bhuna / Vegetable Khichuri',
    nameBn: 'ভুনা / সবজি খিচুড়ি',
    category: 'Khichuri (খিচুড়ি)',
    categoryBn: 'খিচুড়ি',
    defaultPortionGrams: 250,
    servingLabel: '1 full plate (~250g)',
    servingLabelBn: '১ প্লেট (~২৫০ গ্রাম)',
    keywords: ['khichuri', 'khichdi', 'bhuna khichuri', 'খিচুড়ি', 'ভুনা খিচুড়ি', 'সবজি খিচুড়ি'],
    sourceLabel: 'INFS Bangladesh Composite Dish Reference',
    sourceLabelBn: 'INFS বাংলাদেশ মিশ্র খাদ্য রেফারেন্স',
    per100g: {
      calories: 148,
      proteinG: 4.9,
      carbsG: 22.8,
      totalFatG: 4.1,
      saturatedFatG: 1.1,
      fiberG: 2.3,
      sugarG: 1.0,
      sodiumMg: 245,
      vitamins: [
        { name: 'Folate (B9)', nameBn: 'ফোলেট (বি৯)', amount: '32 mcg', dailyValuePct: 8 },
        { name: 'Vitamin A', nameBn: 'ভিটামিন এ', amount: '85 mcg', dailyValuePct: 9 },
      ],
      minerals: [
        { name: 'Iron', nameBn: 'আয়রন', amount: '1.4 mg', dailyValuePct: 8 },
        { name: 'Magnesium', nameBn: 'ম্যাগনেসিয়াম', amount: '24 mg', dailyValuePct: 6 },
      ],
    },
    benefits: ['Synergistic rice-and-lentil amino acid pairing in a comforting, easy-to-digest dish'],
    benefitsBn: ['চাল ও ডালের সমন্বয়ে তৈরি সহজপাচ্য ও সম্পূর্ণ অ্যামিনো এসিডযুক্ত খাবার'],
    bodyFunctions: ['Delivers sustained glucose release alongside plant protein for tissue repair'],
    bodyFunctionsBn: ['দীর্ঘস্থায়ী শক্তি ও কোষ গঠনের প্রোটিন সরবরাহ করে'],
    allergens: [],
    allergensBn: [],
    mealSuggestions: ['Serve with a boiled egg or fresh tomato-cucumber salad for extra protein and Vitamin C.'],
    mealSuggestionsBn: ['অতিরিক্ত প্রোটিন ও ভিটামিনের জন্য সাথে একটি সেদ্ধ ডিম ও সালাদ রাখুন।'],
  },
  {
    id: 'pitha',
    name: 'Bangladeshi Pitha (Bhapa / Chitoi)',
    nameBn: 'বাঙালি পিঠা (ভাপা / চিতই)',
    category: 'Pitha (পিঠা)',
    categoryBn: 'ঐতিহ্যবাহী পিঠা',
    defaultPortionGrams: 110,
    servingLabel: '2 pieces (~110g)',
    servingLabelBn: '২টি পিঠা (~১১০ গ্রাম)',
    keywords: ['pitha', 'bhapa pitha', 'chitoi', 'puli', 'patishapta', 'পিঠা', 'ভাপা পিঠা', 'চিতই পিঠা'],
    sourceLabel: 'Bangladesh Traditional Food Reference',
    sourceLabelBn: 'বাংলাদেশ ঐতিহ্যবাহী খাদ্য রেফারেন্স',
    per100g: {
      calories: 235,
      proteinG: 3.8,
      carbsG: 46.5,
      totalFatG: 3.9,
      saturatedFatG: 2.6,
      fiberG: 1.8,
      sugarG: 14.2,
      sodiumMg: 75,
      vitamins: [
        { name: 'Vitamin B1 (Thiamin)', nameBn: 'ভিটামিন বি১', amount: '0.06 mg', dailyValuePct: 5 },
      ],
      minerals: [
        { name: 'Iron', nameBn: 'আয়রন', amount: '1.6 mg', dailyValuePct: 9 },
        { name: 'Potassium', nameBn: 'পটাশিয়াম', amount: '140 mg', dailyValuePct: 3 },
      ],
    },
    benefits: ['Steamed rice flour base retains energy without deep frying; date jaggery (gur) adds trace iron'],
    benefitsBn: ['ভাপে তৈরি পিঠায় ভাজাপোড়ার অতিরিক্ত তেল থাকে না এবং খেজুরের গুড়ে সামান্য আয়রন থাকে'],
    bodyFunctions: ['Supplies quick carbohydrate calories and trace minerals during seasonal activity'],
    bodyFunctionsBn: ['দ্রুত কার্বোহাইড্রেট শক্তি ও খনিজ সরবরাহ করে'],
    allergens: [],
    allergensBn: [],
    mealSuggestions: ['Limit portion to 1–2 pieces if managing blood sugar due to jaggery/molasses sugars.'],
    mealSuggestionsBn: ['গুড় ও চালের গুঁড়ার কারণে রক্তে শর্করা নিয়ন্ত্রণে রাখতে পরিমিত (১-২টি) খান।'],
  },
  {
    id: 'fruits',
    name: 'Fresh Seasonal Fruits (Mango / Banana / Guava)',
    nameBn: 'তাজা ফলমূল (আম / কলা / পেয়ারা)',
    category: 'Fruits (ফলমূল)',
    categoryBn: 'তাজা ফলমূল',
    defaultPortionGrams: 150,
    servingLabel: '1 medium serving (~150g)',
    servingLabelBn: '১ মাঝারি পরিবেশন (~১৫০ গ্রাম)',
    keywords: ['fruit', 'mango', 'banana', 'guava', 'apple', 'orange', 'papaya', 'ফল', 'আম', 'কলা', 'পেয়ারা', 'আপেল'],
    sourceLabel: 'USDA FoodData Central & INFS Bangladesh',
    sourceLabelBn: 'USDA ও বাংলাদেশ পুষ্টি ডেটাবেজ',
    per100g: {
      calories: 68,
      proteinG: 0.9,
      carbsG: 16.5,
      totalFatG: 0.4,
      saturatedFatG: 0.1,
      fiberG: 3.1,
      sugarG: 11.8,
      sodiumMg: 2,
      vitamins: [
        { name: 'Vitamin C', nameBn: 'ভিটামিন সি', amount: '62 mg', dailyValuePct: 69 },
        { name: 'Vitamin A', nameBn: 'ভিটামিন এ', amount: '54 mcg', dailyValuePct: 6 },
      ],
      minerals: [
        { name: 'Potassium', nameBn: 'পটাশিয়াম', amount: '248 mg', dailyValuePct: 5 },
      ],
    },
    benefits: ['Packed with natural Vitamin C, polyphenols, soluble fiber, and potassium'],
    benefitsBn: ['প্রাকৃতিক ভিটামিন সি, পটাশিয়াম, অ্যান্টিঅক্সিডেন্ট এবং দ্রবণীয় আঁশে ভরপুর'],
    bodyFunctions: ['Boosts collagen synthesis, immune cell defense, and blood pressure regulation'],
    bodyFunctionsBn: ['রোগপ্রতিরোধ ক্ষমতা, ত্বকের কোলাজেন তৈরি এবং রক্তচাপ নিয়ন্ত্রণে সাহায্য করে'],
    allergens: [],
    allergensBn: [],
    mealSuggestions: ['Wash skins thoroughly before eating; pair whole fruit with a handful of nuts for sustained satiety.'],
    mealSuggestionsBn: ['খাওয়ার আগে ভালো করে ধুয়ে নিন এবং পুষ্টি বাড়াতে সামান্য বাদামের সাথে খান।'],
  },
  {
    id: 'milk-dairy',
    name: 'Milk & Yogurt (Dudh / Doi)',
    nameBn: 'দুধ ও দুগ্ধজাত খাবার (দই)',
    category: 'Dairy (দুধ ও দুগ্ধজাত খাবার)',
    categoryBn: 'দুধ ও দুগ্ধজাত খাবার',
    defaultPortionGrams: 200,
    servingLabel: '1 cup (~200g)',
    servingLabelBn: '১ কাপ (~২০০ গ্রাম)',
    keywords: ['milk', 'yogurt', 'doi', 'curd', 'dairy', 'paneer', 'cheese', 'দুধ', 'দই', 'মিষ্টি দই', 'পনির'],
    sourceLabel: 'USDA FoodData Central & INFS Bangladesh',
    sourceLabelBn: 'USDA ও INFS দুগ্ধজাত খাদ্য ডেটাবেজ',
    per100g: {
      calories: 68,
      proteinG: 3.5,
      carbsG: 5.2,
      totalFatG: 3.6,
      saturatedFatG: 2.2,
      fiberG: 0.0,
      sugarG: 5.0,
      sodiumMg: 46,
      vitamins: [
        { name: 'Vitamin B12', nameBn: 'ভিটামিন বি১২', amount: '0.5 mcg', dailyValuePct: 21 },
        { name: 'Vitamin B2 (Riboflavin)', nameBn: 'ভিটামিন বি২', amount: '0.18 mg', dailyValuePct: 14 },
      ],
      minerals: [
        { name: 'Calcium', nameBn: 'ক্যালসিয়াম', amount: '122 mg', dailyValuePct: 9 },
        { name: 'Phosphorus', nameBn: 'ফসফরাস', amount: '95 mg', dailyValuePct: 8 },
      ],
    },
    benefits: ['Bioavailable calcium, complete milk proteins, and live probiotics (in yogurt/doi)'],
    benefitsBn: ['সহজে শোষণযোগ্য ক্যালসিয়াম, সম্পূর্ণ প্রোটিন এবং (দইয়ে) উপকারী প্রোবায়োটিক রয়েছে'],
    bodyFunctions: ['Maintains bone mineral density, dental strength, and gut microbiome balance'],
    bodyFunctionsBn: ['হাড় ও দাঁতের গঠন মজবুত রাখে এবং অন্ত্রের উপকারী ব্যাকটেরিয়া বাড়ায়'],
    allergens: ['Milk / Lactose'],
    allergensBn: ['দুধ / ল্যাকটোজ'],
    mealSuggestions: ['Choose plain/unsweetened yogurt (টক দই) over high-sugar sweetened varieties when possible.'],
    mealSuggestionsBn: ['অতিরিক্ত চিনি এড়াতে মিষ্টি দইয়ের বদলে টক দই বেছে নেওয়া ভালো।'],
  },
  {
    id: 'boiled-egg',
    name: 'Chicken Egg (Boiled / Omelette)',
    nameBn: 'মুরগির ডিম',
    category: 'Eggs & Protein',
    categoryBn: 'ডিম ও প্রোটিন',
    defaultPortionGrams: 100,
    servingLabel: '2 medium eggs (~100g)',
    servingLabelBn: '২টি মাঝারি ডিম (~১০০ গ্রাম)',
    keywords: ['egg', 'boiled egg', 'omelette', 'bhurji', 'dim', 'ডিম', 'ডিম সেদ্ধ', 'অমলেট'],
    sourceLabel: 'USDA FoodData Central Reference',
    sourceLabelBn: 'USDA খাদ্য পুষ্টি রেফারেন্স',
    per100g: {
      calories: 155,
      proteinG: 12.6,
      carbsG: 1.1,
      totalFatG: 10.6,
      saturatedFatG: 3.3,
      fiberG: 0.0,
      sugarG: 1.1,
      sodiumMg: 124,
      vitamins: [
        { name: 'Vitamin B12', nameBn: 'ভিটামিন বি১২', amount: '1.1 mcg', dailyValuePct: 46 },
        { name: 'Vitamin D', nameBn: 'ভিটামিন ডি', amount: '2.0 mcg', dailyValuePct: 10 },
      ],
      minerals: [
        { name: 'Selenium', nameBn: 'সেলেনিয়াম', amount: '30.8 mcg', dailyValuePct: 56 },
        { name: 'Iron', nameBn: 'আয়রন', amount: '1.2 mg', dailyValuePct: 7 },
      ],
    },
    benefits: ['Gold-standard complete protein containing choline for brain & eye nutrition'],
    benefitsBn: ['উচ্চমানের সম্পূর্ণ প্রোটিন এবং মস্তিষ্কের জন্য উপকারী কোলিন সমৃদ্ধ'],
    bodyFunctions: ['Supports neurotransmitter synthesis, cellular repair, and satiety'],
    bodyFunctionsBn: ['মস্তিষ্কের স্নায়ুসংযোগ, কোষ মেরামত এবং দীর্ঘক্ষণ পেট ভরা রাখতে সাহায্য করে'],
    allergens: ['Egg'],
    allergensBn: ['ডিম (এগ অ্যালার্জেন)'],
    mealSuggestions: ['Pair with whole wheat roti and sautéed greens for a balanced breakfast.'],
    mealSuggestionsBn: ['সকালের নাস্তায় লাল আটার রুটি ও শাকসবজির সাথে পরিবেশন করুন।'],
  },
];

export function matchReferenceFood(query: string): ReferenceFoodEntry | undefined {
  const q = query.toLowerCase().trim();
  if (!q) return undefined;

  for (const entry of FOOD_SCANNER_DATABASE) {
    if (
      entry.name.toLowerCase() === q ||
      entry.nameBn.toLowerCase() === q ||
      entry.id.toLowerCase() === q
    ) {
      return entry;
    }
  }

  let best: ReferenceFoodEntry | undefined;
  let bestScore = 0;

  for (const entry of FOOD_SCANNER_DATABASE) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (q.includes(kw.toLowerCase())) {
        score += kw.length >= 4 ? 3 : 2;
      } else if (kw.toLowerCase().includes(q) && q.length >= 3) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  return bestScore > 0 ? best : undefined;
}

function scaleAmountString(amountStr: string, factor: number): string {
  const m = String(amountStr).match(/^([\d.]+)\s*(.*)$/);
  if (!m) return amountStr;
  const val = parseFloat(m[1]);
  if (Number.isNaN(val)) return amountStr;
  const scaled = val * factor;
  const formatted = scaled >= 10 ? Math.round(scaled).toString() : scaled.toFixed(1);
  return `${formatted} ${m[2]}`.trim();
}

export function scaleNutrientProfile(per100g: NutrientProfile, portionGrams: number): NutrientProfile {
  const factor = Math.max(0.05, portionGrams) / 100;
  return {
    calories: Math.round((per100g.calories || 0) * factor),
    proteinG: Number(((per100g.proteinG || 0) * factor).toFixed(1)),
    carbsG: Number(((per100g.carbsG || 0) * factor).toFixed(1)),
    totalFatG: Number(((per100g.totalFatG || 0) * factor).toFixed(1)),
    saturatedFatG: Number(((per100g.saturatedFatG || 0) * factor).toFixed(1)),
    fiberG: Number(((per100g.fiberG || 0) * factor).toFixed(1)),
    sugarG: Number(((per100g.sugarG || 0) * factor).toFixed(1)),
    sodiumMg: Math.round((per100g.sodiumMg || 0) * factor),
    vitamins: (per100g.vitamins || []).map((v) => ({
      ...v,
      amount: scaleAmountString(v.amount, factor),
      dailyValuePct: v.dailyValuePct !== undefined ? Math.round(v.dailyValuePct * factor) : undefined,
    })),
    minerals: (per100g.minerals || []).map((m) => ({
      ...m,
      amount: scaleAmountString(m.amount, factor),
      dailyValuePct: m.dailyValuePct !== undefined ? Math.round(m.dailyValuePct * factor) : undefined,
    })),
  };
}

export function aggregateItemNutrients(items: ScannedFoodItem[]): NutrientProfile {
  const vitMap = new Map<string, MicronutrientEntry>();
  const minMap = new Map<string, MicronutrientEntry>();

  let calories = 0;
  let proteinG = 0;
  let carbsG = 0;
  let totalFatG = 0;
  let saturatedFatG = 0;
  let fiberG = 0;
  let sugarG = 0;
  let sodiumMg = 0;

  for (const item of items) {
    const n = item.nutrition;
    calories += n.calories || 0;
    proteinG += n.proteinG || 0;
    carbsG += n.carbsG || 0;
    totalFatG += n.totalFatG || 0;
    saturatedFatG += n.saturatedFatG || 0;
    fiberG += n.fiberG || 0;
    sugarG += n.sugarG || 0;
    sodiumMg += n.sodiumMg || 0;

    for (const v of n.vitamins || []) {
      const existing = vitMap.get(v.name);
      if (!existing) {
        vitMap.set(v.name, { ...v });
      } else {
        vitMap.set(v.name, {
          ...existing,
          dailyValuePct:
            existing.dailyValuePct !== undefined && v.dailyValuePct !== undefined
              ? existing.dailyValuePct + v.dailyValuePct
              : existing.dailyValuePct ?? v.dailyValuePct,
        });
      }
    }

    for (const m of n.minerals || []) {
      const existing = minMap.get(m.name);
      if (!existing) {
        minMap.set(m.name, { ...m });
      } else {
        minMap.set(m.name, {
          ...existing,
          dailyValuePct:
            existing.dailyValuePct !== undefined && m.dailyValuePct !== undefined
              ? existing.dailyValuePct + m.dailyValuePct
              : existing.dailyValuePct ?? m.dailyValuePct,
        });
      }
    }
  }

  return {
    calories: Math.round(calories),
    proteinG: Number(proteinG.toFixed(1)),
    carbsG: Number(carbsG.toFixed(1)),
    totalFatG: Number(totalFatG.toFixed(1)),
    saturatedFatG: Number(saturatedFatG.toFixed(1)),
    fiberG: Number(fiberG.toFixed(1)),
    sugarG: Number(sugarG.toFixed(1)),
    sodiumMg: Math.round(sodiumMg),
    vitamins: Array.from(vitMap.values()).slice(0, 6),
    minerals: Array.from(minMap.values()).slice(0, 6),
  };
}

export function buildExcessNutrientAlerts(totals: NutrientProfile, totalGrams: number): ExcessNutrientAlert[] {
  const alerts: ExcessNutrientAlert[] = [];
  const safeGrams = Math.max(100, totalGrams);
  const sugarPer100 = (totals.sugarG / safeGrams) * 100;
  const sodiumPer100 = (totals.sodiumMg / safeGrams) * 100;
  const satFatPer100 = (totals.saturatedFatG / safeGrams) * 100;

  if (totals.sugarG >= 22 || sugarPer100 >= 15) {
    alerts.push({
      type: 'sugar',
      severity: totals.sugarG >= 30 || sugarPer100 >= 22.5 ? 'high' : 'moderate',
      message: `High sugar content (${totals.sugarG}g in this portion). Watch added sugars relative to WHO's 25g/day target.`,
      messageBn: `উচ্চ চিনির মাত্রা (${totals.sugarG} গ্রাম)। দৈনিক অতিরিক্ত চিনি গ্রহণের সীমা (২৫ গ্রাম) খেয়াল রাখুন।`,
    });
  }

  if (totals.sodiumMg >= 750 || sodiumPer100 >= 600) {
    alerts.push({
      type: 'salt',
      severity: totals.sodiumMg >= 1100 || sodiumPer100 >= 750 ? 'high' : 'moderate',
      message: `Elevated sodium (${totals.sodiumMg}mg in this portion). High salt intake increases daily blood pressure load.`,
      messageBn: `বেশি সোডিয়াম বা লবণ (${totals.sodiumMg} মিগ্রা)। অতিরিক্ত লবণ রক্তচাপের ঝুঁকি বাড়াতে পারে।`,
    });
  }

  if (totals.saturatedFatG >= 9 || satFatPer100 >= 5) {
    alerts.push({
      type: 'saturated_fat',
      severity: totals.saturatedFatG >= 14 ? 'high' : 'moderate',
      message: `Elevated saturated fat (${totals.saturatedFatG}g in this portion). Balance with high-fiber vegetables.`,
      messageBn: `উচ্চ স্যাচুরেটেড ফ্যাট (${totals.saturatedFatG} গ্রাম)। ভারসাম্য রাখতে আঁশযুক্ত শাকসবজি যোগ করুন।`,
    });
  }

  return alerts;
}

export function buildConsistencyChecks(packaged?: PackagedFoodDetails): ConsistencyCheckItem[] {
  if (!packaged) return [];
  const checks: ConsistencyCheckItem[] = [];

  if (packaged.openFoodFactsMatched) {
    checks.push({
      field: 'Barcode Registry (OpenFoodFacts)',
      fieldBn: 'বারকোড ডেটাবেজ (OpenFoodFacts)',
      status: 'verified',
      note: `Matched barcode ${packaged.barcode || ''} to trusted product record (${packaged.productName || 'Listed'}).`,
      noteBn: `বারকোড ${packaged.barcode || ''} যাচাইকৃত পণ্যের তথ্যের সাথে মিলেছে।`,
    });
  } else if (packaged.barcode) {
    checks.push({
      field: 'Barcode Registry',
      fieldBn: 'বারকোড যাচাই',
      status: 'warning',
      note: `Barcode ${packaged.barcode} could not be matched in OpenFoodFacts public registry.`,
      noteBn: `বারকোড ${packaged.barcode} উন্মুক্ত ডেটাবেজে খুঁজে পাওয়া যায়নি।`,
    });
  } else {
    checks.push({
      field: 'Barcode',
      fieldBn: 'বারকোড',
      status: 'missing',
      note: 'No barcode detected or entered for product cross-checking.',
      noteBn: 'পণ্য যাচাইয়ের জন্য কোনো বারকোড পাওয়া যায়নি।',
    });
  }

  checks.push(
    packaged.manufacturer
      ? {
          field: 'Manufacturer / Origin',
          fieldBn: 'প্রস্তুতকারক তথ্য',
          status: 'verified',
          note: `Manufacturer listed: ${packaged.manufacturer}`,
          noteBn: `প্রস্তুতকারক: ${packaged.manufacturer}`,
        }
      : {
          field: 'Manufacturer / Origin',
          fieldBn: 'প্রস্তুতকারক তথ্য',
          status: 'missing',
          note: 'Manufacturer information is missing.',
          noteBn: 'প্রস্তুতকারকের তথ্য অনুপস্থিত।',
        }
  );

  checks.push(
    packaged.batchNumber
      ? {
          field: 'Batch / Lot Number',
          fieldBn: 'ব্যাচ / লট নম্বর',
          status: 'verified',
          note: `Batch number recorded: ${packaged.batchNumber}`,
          noteBn: `ব্যাচ নম্বর: ${packaged.batchNumber}`,
        }
      : {
          field: 'Batch / Lot Number',
          fieldBn: 'ব্যাচ / লট নম্বর',
          status: 'missing',
          note: 'Batch number not clearly visible or entered.',
          noteBn: 'ব্যাচ নম্বর স্পষ্টভাবে দেখা যায়নি বা দেওয়া হয়নি।',
        }
  );

  const isExpired = checkExpiryDatePast(packaged.expiryDate);
  if (!packaged.expiryDate) {
    checks.push({
      field: 'Expiry Date',
      fieldBn: 'মেয়াদ উত্তীর্ণের তারিখ',
      status: 'missing',
      note: 'Expiry date is not visible or entered.',
      noteBn: 'মেয়াদ উত্তীর্ণের তারিখ পাওয়া যায়নি।',
    });
  } else if (isExpired) {
    checks.push({
      field: 'Expiry Date',
      fieldBn: 'মেয়াদ উত্তীর্ণের তারিখ',
      status: 'warning',
      note: `Printed expiry date (${packaged.expiryDate}) appears expired — do not consume without verification.`,
      noteBn: `উল্লেখিত মেয়াদ (${packaged.expiryDate}) উত্তীর্ণ হয়েছে বলে মনে হচ্ছে।`,
    });
  } else {
    checks.push({
      field: 'Expiry Date',
      fieldBn: 'মেয়াদ উত্তীর্ণের তারিখ',
      status: 'verified',
      note: `Expiry date listed: ${packaged.expiryDate}`,
      noteBn: `মেয়াদ: ${packaged.expiryDate}`,
    });
  }

  return checks;
}

function checkExpiryDatePast(expiryStr?: string): boolean {
  if (!expiryStr) return false;
  const cleaned = expiryStr.trim();
  const parsed = Date.parse(cleaned);
  if (!Number.isNaN(parsed)) {
    return parsed < Date.now() - 86400000;
  }
  const mmYyyy = cleaned.match(/^(\d{1,2})[\/-](\d{2,4})$/);
  if (mmYyyy) {
    const month = parseInt(mmYyyy[1], 10);
    let year = parseInt(mmYyyy[2], 10);
    if (year < 100) year += 2000;
    if (month >= 1 && month <= 12) {
      const endOfMonth = new Date(year, month, 0).getTime();
      return endOfMonth < Date.now() - 86400000;
    }
  }
  return false;
}

export function evaluateFoodSafetyReport(params: {
  scanMode: string;
  visualInspection: VisualSafetyInspection;
  packagedDetails?: PackagedFoodDetails;
  items: ScannedFoodItem[];
}): FoodSafetyReport {
  const { visualInspection, packagedDetails, items } = params;
  const reasons: string[] = [];
  const reasonsBn: string[] = [];
  const missingFields: string[] = [];
  const missingFieldsBn: string[] = [];

  const isExpired = checkExpiryDatePast(packagedDetails?.expiryDate);

  // Determine missing packaged verification details when packaged info is present or packaged scan mode
  if (packagedDetails) {
    if (!packagedDetails.productName && !packagedDetails.brand) {
      missingFields.push('Product name & brand');
      missingFieldsBn.push('পণ্যের নাম ও ব্র্যান্ড');
    }
    if (!packagedDetails.manufacturer) {
      missingFields.push('Manufacturer information');
      missingFieldsBn.push('প্রস্তুতকারকের তথ্য');
    }
    if (!packagedDetails.batchNumber) {
      missingFields.push('Batch / lot number');
      missingFieldsBn.push('ব্যাচ / লট নম্বর');
    }
    if (!packagedDetails.mfgDate) {
      missingFields.push('Manufacturing date');
      missingFieldsBn.push('উৎপাদনের তারিখ');
    }
    if (!packagedDetails.expiryDate) {
      missingFields.push('Expiry date');
      missingFieldsBn.push('মেয়াদ উত্তীর্ণের তারিখ');
    }
    if (!packagedDetails.ingredientsList) {
      missingFields.push('Complete ingredient list');
      missingFieldsBn.push('সম্পূর্ণ উপাদানের তালিকা');
    }
  }

  // Case 3: Laboratory verification required
  if (
    visualInspection.moldOrSpoilageDetected ||
    visualInspection.unusualAppearanceDetected ||
    visualInspection.packagingDamageDetected ||
    isExpired
  ) {
    if (visualInspection.moldOrSpoilageDetected) {
      reasons.push(visualInspection.moldOrSpoilageNote || 'Visible mold or spoilage indicators spotted.');
      reasonsBn.push(visualInspection.moldOrSpoilageNoteBn || 'দৃশ্যমান ছত্রাক বা পচনের লক্ষণ দেখা গেছে।');
    }
    if (visualInspection.unusualAppearanceDetected) {
      reasons.push(visualInspection.unusualAppearanceNote || 'Unusual surface discoloration or texture observed.');
      reasonsBn.push(visualInspection.unusualAppearanceNoteBn || 'অস্বাভাবিক রঙ বা গঠন লক্ষ্য করা গেছে।');
    }
    if (visualInspection.packagingDamageDetected) {
      reasons.push(visualInspection.packagingDamageNote || 'Packaging appears swollen, torn, or tampered.');
      reasonsBn.push(visualInspection.packagingDamageNoteBn || 'প্যাকেজিং ক্ষতিগ্রস্ত বা বিকৃত মনে হচ্ছে।');
    }
    if (isExpired) {
      reasons.push(`Expiry date (${packagedDetails?.expiryDate}) appears past due.`);
      reasonsBn.push(`প্যাকেটের মেয়াদ (${packagedDetails?.expiryDate}) উত্তীর্ণ হয়েছে।`);
    }

    return {
      status: 'lab_required',
      statusText: SAFETY_STATUS_COPY.lab_required.en,
      statusTextBn: SAFETY_STATUS_COPY.lab_required.bn,
      reasons,
      reasonsBn,
      missingVerificationFields: missingFields,
      missingVerificationFieldsBn: missingFieldsBn,
      labTestingRecommended: true,
      labTestingRecommendation:
        'Do not consume until verified. Submit a sample to an accredited food testing lab (e.g., BSTI or Bangladesh Food Safety Authority recognized lab) for microbiological or chemical screening.',
      labTestingRecommendationBn:
        'যাচাই না হওয়া পর্যন্ত গ্রহণ থেকে বিরত থাকুন। অণুজীব বা রাসায়নিক পরীক্ষার জন্য অনুমোদিত ফুড টেস্টিং ল্যাবে (যেমন BSTI বা BFSA স্বীকৃত ল্যাব) নমুনা পরীক্ষা করান।',
      disclaimer: LAB_VERIFICATION_DISCLAIMER,
      disclaimerBn: LAB_VERIFICATION_DISCLAIMER_BN,
    };
  }

  // Case 2: Needs further checking (incomplete info, blurry photo, unverified packaged item, or suspicious gaps)
  const poorImage = visualInspection.imageQuality !== 'good';
  const packagedIncomplete =
    Boolean(packagedDetails) &&
    (!packagedDetails?.openFoodFactsMatched ||
      !packagedDetails?.expiryDate ||
      !packagedDetails?.manufacturer ||
      !packagedDetails?.batchNumber);

  const hasLowConfidence = items.some((i) => i.confidence < 70);

  if (poorImage || packagedIncomplete || hasLowConfidence) {
    if (poorImage) {
      reasons.push(visualInspection.imageQualityNote || 'Image clarity or lighting is insufficient for reliable inspection.');
      reasonsBn.push(visualInspection.imageQualityNoteBn || 'নির্ভরযোগ্য পরীক্ষার জন্য ছবির স্পষ্টতা বা আলো পর্যাপ্ত নয়।');
    }
    if (packagedDetails && !packagedDetails.openFoodFactsMatched) {
      reasons.push('Packaged product could not be confirmed against the OpenFoodFacts trusted barcode registry.');
      reasonsBn.push('প্যাকেটজাত পণ্যটি উন্মুক্ত বারকোড ডেটাবেজে যাচাই করা যায়নি।');
    }
    if (missingFields.length > 0) {
      reasons.push(`Missing verification label fields: ${missingFields.join(', ')}.`);
      reasonsBn.push(`লেবেলের অনুপস্থিত তথ্য: ${missingFieldsBn.join(', ')}।`);
    }
    if (hasLowConfidence) {
      reasons.push('Visual identification confidence is moderate; confirm food name and inspect physically.');
      reasonsBn.push('দৃশ্যমান শনাক্তকরণ নিশ্চিততা মাঝারি; অনুগ্রহ করে খাবারের নাম ও মান যাচাই করুন।');
    }

    return {
      status: 'needs_checking',
      statusText: SAFETY_STATUS_COPY.needs_checking.en,
      statusTextBn: SAFETY_STATUS_COPY.needs_checking.bn,
      reasons,
      reasonsBn,
      missingVerificationFields: missingFields,
      missingVerificationFieldsBn: missingFieldsBn,
      labTestingRecommended: true,
      labTestingRecommendation:
        'Check physical packaging seals, batch number, BSTI mark, and expiry date. If chemical adulteration is suspected, laboratory testing is required.',
      labTestingRecommendationBn:
        'প্যাকেটের সিল, ব্যাচ নম্বর, বিএসটিআই (BSTI) চিহ্ন এবং মেয়াদ যাচাই করুন। রাসায়নিক ভেজালের সন্দেহ থাকলে ল্যাবরেটরি পরীক্ষা আবশ্যক।',
      disclaimer: LAB_VERIFICATION_DISCLAIMER,
      disclaimerBn: LAB_VERIFICATION_DISCLAIMER_BN,
    };
  }

  // Case 1: Information available — available details are consistent (NEVER claim 100% chemically safe)
  reasons.push('No visible mold, spoilage, or damaged packaging cues were detected in the provided photo.');
  reasonsBn.push('প্রদত্ত ছবিতে দৃশ্যমান ছত্রাক, পচন বা প্যাকেজিং ক্ষতির লক্ষণ পাওয়া যায়নি।');
  if (packagedDetails?.openFoodFactsMatched) {
    reasons.push('Barcode and key packaging details align with public OpenFoodFacts records.');
    reasonsBn.push('বারকোড ও প্যাকেজিংয়ের মূল তথ্য উন্মুক্ত ডেটাবেজের সাথে সামঞ্জস্যপূর্ণ।');
  } else {
    reasons.push('Nutritional figures align with standard food composition references, though hidden/chemical contaminants cannot be seen.');
    reasonsBn.push('পুষ্টিমানের তথ্য আদর্শ খাদ্য ডেটাবেজের সাথে সামঞ্জস্যপূর্ণ, তবে অদৃশ্য বা রাসায়নিক উপাদান ছবিতে দেখা সম্ভব নয়।');
  }

  return {
    status: 'consistent',
    statusText: SAFETY_STATUS_COPY.consistent.en,
    statusTextBn: SAFETY_STATUS_COPY.consistent.bn,
    reasons,
    reasonsBn,
    missingVerificationFields: missingFields,
    missingVerificationFieldsBn: missingFieldsBn,
    labTestingRecommended: false,
    labTestingRecommendation:
      'Visual details are consistent, but only certified laboratory testing can confirm chemical purity or freedom from adulterants.',
    labTestingRecommendationBn:
      'দৃশ্যমান তথ্য সামঞ্জস্যপূর্ণ, তবে রাসায়নিক বিশুদ্ধতা বা ভেজালমুক্ততা নিশ্চিত করতে কেবল স্বীকৃত ল্যাবরেটরি পরীক্ষাই নির্ভরযোগ্য।',
    disclaimer: LAB_VERIFICATION_DISCLAIMER,
    disclaimerBn: LAB_VERIFICATION_DISCLAIMER_BN,
  };
}

export function buildHealthAnalysisForItems(
  items: ScannedFoodItem[],
  totals: NutrientProfile,
  packagedDetails?: PackagedFoodDetails
): HealthBenefitAnalysis {
  const benefitsSet = new Set<string>();
  const benefitsBnSet = new Set<string>();
  const bodyFnSet = new Set<string>();
  const bodyFnBnSet = new Set<string>();
  const allergensSet = new Set<string>(packagedDetails?.allergens || []);
  const allergensBnSet = new Set<string>();
  const suggestionsSet = new Set<string>();
  const suggestionsBnSet = new Set<string>();
  const keyNutrientsSet = new Set<string>();
  const keyNutrientsBnSet = new Set<string>();

  for (const item of items) {
    const ref = item.referenceMatchId
      ? FOOD_SCANNER_DATABASE.find((r) => r.id === item.referenceMatchId)
      : matchReferenceFood(item.name);

    if (ref) {
      ref.benefits.forEach((b) => benefitsSet.add(b));
      ref.benefitsBn.forEach((b) => benefitsBnSet.add(b));
      ref.bodyFunctions.forEach((f) => bodyFnSet.add(f));
      ref.bodyFunctionsBn.forEach((f) => bodyFnBnSet.add(f));
      ref.allergens.forEach((a) => allergensSet.add(a));
      ref.allergensBn.forEach((a) => allergensBnSet.add(a));
      ref.mealSuggestions.forEach((s) => suggestionsSet.add(s));
      ref.mealSuggestionsBn.forEach((s) => suggestionsBnSet.add(s));
    }
  }

  if (totals.proteinG >= 12) {
    keyNutrientsSet.add(`Protein (${totals.proteinG}g)`);
    keyNutrientsBnSet.add(`প্রোটিন (${totals.proteinG} গ্রাম)`);
  }
  if (totals.fiberG >= 3.5) {
    keyNutrientsSet.add(`Dietary Fiber (${totals.fiberG}g)`);
    keyNutrientsBnSet.add(`খাদ্য আঁশ (${totals.fiberG} গ্রাম)`);
  }
  totals.vitamins.slice(0, 3).forEach((v) => {
    keyNutrientsSet.add(`${v.name} (${v.amount})`);
    keyNutrientsBnSet.add(`${v.nameBn} (${v.amount})`);
  });
  totals.minerals.slice(0, 3).forEach((m) => {
    keyNutrientsSet.add(`${m.name} (${m.amount})`);
    keyNutrientsBnSet.add(`${m.nameBn} (${m.amount})`);
  });

  if (benefitsSet.size === 0) {
    benefitsSet.add('Provides macronutrient energy alongside trace micronutrients depending on preparation.');
    benefitsBnSet.add('রন্ধনপ্রণালী অনুযায়ী শক্তি ও প্রয়োজনীয় মাইক্রোনিউট্রিয়েন্ট সরবরাহ করে।');
  }
  if (bodyFnSet.size === 0) {
    bodyFnSet.add('Contributes to daily metabolic energy and tissue maintenance when eaten as part of a varied diet.');
    bodyFnBnSet.add('সুষম খাদ্যাভ্যাসের অংশ হিসেবে দৈনন্দিন বিপাকীয় শক্তি ও কোষ গঠনে সহায়তা করে।');
  }
  if (suggestionsSet.size === 0) {
    suggestionsSet.add('Pair with fresh leafy vegetables and adequate water for balanced digestion.');
    suggestionsBnSet.add('হজম ও পুষ্টির ভারসাম্যের জন্য তাজা শাকসবজি ও পর্যাপ্ত পানির সাথে গ্রহণ করুন।');
  }

  const totalGrams = items.reduce((acc, i) => acc + (i.portionGrams || 0), 0);
  const excessAlerts = buildExcessNutrientAlerts(totals, totalGrams);

  return {
    benefits: Array.from(benefitsSet),
    benefitsBn: Array.from(benefitsBnSet),
    keyNutrients: Array.from(keyNutrientsSet),
    keyNutrientsBn: Array.from(keyNutrientsBnSet),
    bodyFunctions: Array.from(bodyFnSet),
    bodyFunctionsBn: Array.from(bodyFnBnSet),
    excessAlerts,
    allergens: Array.from(allergensSet),
    allergensBn: Array.from(allergensBnSet),
    mealSuggestions: Array.from(suggestionsSet),
    mealSuggestionsBn: Array.from(suggestionsBnSet),
  };
}
