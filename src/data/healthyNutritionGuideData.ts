export interface HealthyPlateProportion {
  id: string;
  sharePercent: number;
  titleEn: string;
  titleBn: string;
  examplesEn: string;
  examplesBn: string;
  roleEn: string;
  roleBn: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
}

export interface MealIdeaItem {
  id: string;
  slot: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  titleEn: string;
  titleBn: string;
  subtitleEn: string;
  subtitleBn: string;
  whyHealthyEn: string;
  whyHealthyBn: string;
  linkedRecipeId?: string;
  searchKeyword: string;
  kcalApprox: number;
  proteinApprox: number;
  fiberApprox: number;
}

export interface NutrientEducationCard {
  id: string;
  nutrientEn: string;
  nutrientBn: string;
  roleEn: string;
  roleBn: string;
  bangladeshiSourcesEn: string;
  bangladeshiSourcesBn: string;
  globalSourcesEn: string;
  globalSourcesBn: string;
  pairingTipEn: string;
  pairingTipBn: string;
}

export const BALANCED_PLATE_PROPORTIONS: HealthyPlateProportion[] = [
  {
    id: 'vegetables-greens',
    sharePercent: 40,
    titleEn: 'Vegetables & Leafy Greens',
    titleBn: 'সবজি ও সবুজ শাকসবজি',
    examplesEn: 'Lal Shaak, Spinach, Cabbage (Bandhakopi), Broccoli, Tomato, Bitter Gourd, Cucumber',
    examplesBn: 'লাল শাক, পালং শাক, বাঁধাকপি, ব্রকলি, টমেটো, করলা, শসা ও মৌসুমি সবজি',
    roleEn: 'Supplies dietary fiber, potassium, folate, vitamin C, and natural antioxidants for satiety and gut health.',
    roleBn: 'ফাইবার, পটাশিয়াম, ভিটামিন সি, ফোলেট ও অ্যান্টিঅক্সিডেন্ট জোগায় এবং হজমে সহায়তা করে।',
    accentBg: 'bg-emerald-50',
    accentText: 'text-emerald-900',
    accentBorder: 'border-emerald-200',
  },
  {
    id: 'whole-grains-starches',
    sharePercent: 25,
    titleEn: 'Whole Grains & Complex Staples',
    titleBn: 'পূর্ণ শস্য ও জটিল শর্করা',
    examplesEn: 'Parboiled / Brown Rice, Whole Wheat Ruti, Oats, Millet, Potato with Skin, Bhuna Khichuri Grains',
    examplesBn: 'ঢেঁকিছাঁটা/বাদামি চাল, লাল আটার রুটি, ওটস, খোসাসহ আলু, ভুনা খিচুড়ির শস্য',
    roleEn: 'Provides steady brain and muscle glucose without sharp energy crashes when paired with fiber.',
    roleBn: 'শরীর ও মস্তিষ্কের জন্য স্থিতিশীল শক্তি দেয় এবং রক্তে শর্করার আকস্মিক ওঠানামা কমায়।',
    accentBg: 'bg-amber-50',
    accentText: 'text-amber-900',
    accentBorder: 'border-amber-200',
  },
  {
    id: 'protein-foods',
    sharePercent: 25,
    titleEn: 'Plant & Lean Protein Sources',
    titleBn: 'উদ্ভিজ্জ ও প্রাণীজ প্রোটিন',
    examplesEn: 'Masoor Dal, Chickpeas, Eggs, Rohu/Hilsa Fish, Skinless Chicken, Paneer/Tofu, Plain Yogurt',
    examplesBn: 'মসুর ডাল, ছোলা, ডিম, রুই ও ইলিশ মাছ, মুরগির বুকের মাংস, পনির ও টক দই',
    roleEn: 'Builds and repairs tissue, enzymes, and muscles while sustaining fullness across meals.',
    roleBn: 'পেশি ও কোষ গঠন এবং এনজাইম তৈরিতে সাহায্য করে এবং দীর্ঘক্ষণ ক্ষুধা নিয়ন্ত্রণে রাখে।',
    accentBg: 'bg-teal-50',
    accentText: 'text-teal-900',
    accentBorder: 'border-teal-200',
  },
  {
    id: 'healthy-fats-fruits',
    sharePercent: 10,
    titleEn: 'Healthy Fats, Seeds & Fresh Fruit',
    titleBn: 'স্বাস্থ্যকর চর্বি, বীজ ও তাজা ফল',
    examplesEn: 'Cold-pressed Mustard Oil, Chia/Flax Seeds, Walnuts/Peanuts, Guava, Papaya, Amla',
    examplesBn: 'সরিষার তেল, চিয়া বীজ, বাদাম, পেয়ারা, পাকা পেঁপে ও আমলকি',
    roleEn: 'Supports absorption of vitamins A, D, E, K and supplies essential omega-3 fatty acids.',
    roleBn: 'ভিটামিন এ, ডি, ই, কে শোষণে সাহায্য করে এবং অপরিহার্য ওমেগা-৩ ফ্যাটি অ্যাসিড দেয়।',
    accentBg: 'bg-stone-100',
    accentText: 'text-stone-900',
    accentBorder: 'border-stone-200',
  },
];

export const HEALTHY_MEAL_IDEAS: MealIdeaItem[] = [
  // Breakfast
  {
    id: 'idea-oats-chia',
    slot: 'breakfast',
    titleEn: 'Protein Oats, Chia & Yogurt Morning Bowl',
    titleBn: 'ওটস, চিয়া ও টক দইয়ের পুষ্টিকর সকালের বাটি',
    subtitleEn: 'Rolled oats simmered with milk/yogurt, chia seeds, cinnamon & banana',
    subtitleBn: 'ওটস, দুধ বা টক দই, চিয়া সিড, দারুচিনি ও পাকা কলা',
    whyHealthyEn: 'High beta-glucan fiber (8.5g) and 15g protein keep blood sugar steady through the morning.',
    whyHealthyBn: '৮.৫ গ্রাম ফাইবার ও ১৫ গ্রাম প্রোটিন সারা সকাল মনোযোগ ও শক্তি ধরে রাখতে সাহায্য করে।',
    linkedRecipeId: 'healthy-oats-chia-bowl',
    searchKeyword: 'Healthy Breakfast',
    kcalApprox: 340,
    proteinApprox: 15,
    fiberApprox: 8.5,
  },
  {
    id: 'idea-moong-chilla',
    slot: 'breakfast',
    titleEn: 'Savory Moong Dal & Spinach Chilla',
    titleBn: 'মুগ ডাল ও পালং শাকের মচমচে চিলা (প্যানকেক)',
    subtitleEn: 'Yellow moong lentil batter folded with chopped spinach, ginger & cumin',
    subtitleBn: 'বাটা মুগ ডাল, পালং শাক, আদা ও জিরার স্বাস্থ্যকর সকালের নাস্তা',
    whyHealthyEn: 'Zero added sugar, plant-complete lentil amino acids, and crisp savory satiety.',
    whyHealthyBn: 'সম্পূর্ণ চিনি-মুক্ত, ডালের উদ্ভিজ্জ প্রোটিন ও শাকের আয়রনে সমৃদ্ধ সকালের পদ।',
    linkedRecipeId: 'healthy-moong-dal-chilla',
    searchKeyword: 'Chilla',
    kcalApprox: 265,
    proteinApprox: 14.5,
    fiberApprox: 6.2,
  },
  {
    id: 'idea-tomato-egg-bhurji',
    slot: 'breakfast',
    titleEn: 'Spiced Egg & Tomato Bhurji with Atta Ruti',
    titleBn: 'টমেটো-ডিম ভুর্জি ও লাল আটার রুটি',
    subtitleEn: '2 farm eggs scrambled with tomatoes, onions, coriander & turmeric',
    subtitleBn: 'টমেটো, পেঁয়াজ, ধনেপাতা ও হলুদে তৈরি সুষম ডিম ভুর্জি',
    whyHealthyEn: 'Fast 12-minute breakfast pairing bioavailable egg protein with lycopene & whole wheat fiber.',
    whyHealthyBn: 'মাত্র ১২ মিনিটে তৈরি উচ্চমানের ডিমের প্রোটিন ও লাল আটার আঁশের দারুণ সমন্বয়।',
    linkedRecipeId: 'egg-tomato-bhurji',
    searchKeyword: 'Egg Bhurji',
    kcalApprox: 215,
    proteinApprox: 13.5,
    fiberApprox: 2.2,
  },
  // Lunch
  {
    id: 'idea-dal-bhat-lunch',
    slot: 'lunch',
    titleEn: 'Homestyle Masoor Dal, Brown Rice & Stir-Fried Greens',
    titleBn: 'মসুর ডাল, ভাত ও মৌসুমি শাকসবজির সুষম দুপুরের থালা',
    subtitleEn: 'Tempered red lentils + parboiled rice + lightly sautéed greens + lemon',
    subtitleBn: 'রসুন-জিরা ফোড়নের মসুর ডাল, ভাত, লাল শাক ও লেবু',
    whyHealthyEn: 'Complementary grain-legume amino acids plus vitamin C from lemon to boost plant iron uptake.',
    whyHealthyBn: 'ডাল ও ভাতের সমন্বয়ে পূর্ণাঙ্গ প্রোটিন এবং লেবুর ভিটামিন সি আয়রন শোষণ বাড়ায়।',
    linkedRecipeId: 'bangladeshi-masoor-dal',
    searchKeyword: 'Dal',
    kcalApprox: 220,
    proteinApprox: 14,
    fiberApprox: 7.4,
  },
  {
    id: 'idea-protein-bowl',
    slot: 'lunch',
    titleEn: 'Herb Grilled Chicken & Chickpea Quinoa/Brown Rice Bowl',
    titleBn: 'হার্ব গ্রিলড চিকেন, ছোলা ও ব্রাউন রাইস পুষ্টি বাটি',
    subtitleEn: '41g protein lean chicken breast, roasted chickpeas, broccoli & lemon yogurt',
    subtitleBn: '৪১ গ্রাম প্রোটিনসমৃদ্ধ গ্রিলড চিকেন, সেদ্ধ ছোলা ও ভাপানো ব্রকলি',
    whyHealthyEn: 'Dual animal and chickpea protein keeps afternoon fatigue away with 8.6g fiber.',
    whyHealthyBn: '৪১ গ্রাম প্রোটিন ও ৮.৬ গ্রাম ফাইবার দুপুরের পর অলসতা দূর করে।',
    linkedRecipeId: 'healthy-high-protein-bowl',
    searchKeyword: 'High Protein Food',
    kcalApprox: 475,
    proteinApprox: 41,
    fiberApprox: 8.6,
  },
  {
    id: 'idea-bibimbap-lunch',
    slot: 'lunch',
    titleEn: 'Vegetable & Rice Bibimbap Wellness Bowl',
    titleBn: 'রঙিন সবজি ও ভাতের কোরিয়ান বিবিমবাপ বোল',
    subtitleEn: 'Spinach, mushrooms, carrots, zucchini, warm rice & soft egg',
    subtitleBn: 'পালং শাক, মাশরুম, গাজর, শসা ও পোচড ডিমের রঙিন ভাত',
    whyHealthyEn: 'Encourages diverse rainbow vegetables (4+ plants in one bowl) with measured grain portion.',
    whyHealthyBn: 'এক বাটিতেই ৪+ রকমের রঙিন সবজি ও পরিমিত প্রোটিনের সুষম সমন্বয়।',
    linkedRecipeId: 'korean-bibimbap',
    searchKeyword: 'Bibimbap',
    kcalApprox: 480,
    proteinApprox: 19,
    fiberApprox: 6.4,
  },
  // Dinner
  {
    id: 'idea-macher-jhol-dinner',
    slot: 'dinner',
    titleEn: 'Light Rui Fish & Ridge Gourd Curry (Macher Jhol)',
    titleBn: 'দেশি রুই মাছ ও ঝিঙের হালকা পাতলা ঝোল',
    subtitleEn: 'Pan-seared freshwater rohu simmered in tomato, turmeric & cumin broth',
    subtitleBn: 'জিরা-হলুদ ও সবজির পাতলা ঝোলে রুই মাছের সহজপাচ্য রাতের পদ',
    whyHealthyEn: 'Easy to digest in the evening, rich in bioavailable freshwater fish protein (24g) & selenium.',
    whyHealthyBn: 'রাতের জন্য সহজপাচ্য এবং প্রতি পরিবেশনে ২৪ গ্রাম উচ্চমানের মাছের প্রোটিন সমৃদ্ধ।',
    linkedRecipeId: 'bd-macher-jhol',
    searchKeyword: 'Macher Jhol',
    kcalApprox: 290,
    proteinApprox: 24,
    fiberApprox: 2.5,
  },
  {
    id: 'idea-thukpa-dinner',
    slot: 'dinner',
    titleEn: 'Himalayan Ginger Chicken & Noodle Soup (Thukpa)',
    titleBn: 'হিমালয়ান আদা-মসলার চিকেন ও সবজি স্যুপ (থুকপা)',
    subtitleEn: 'Aromatic clear ginger-garlic broth with shredded chicken, cabbage & noodles',
    subtitleBn: 'আদা, রসুন, বাঁধাকপি, গাজর ও নুডুলসের উষ্ণ ও হালকা রাতের স্যুপ',
    whyHealthyEn: 'Hydrating warm broth lowers energy density while providing 23g lean protein.',
    whyHealthyBn: 'উষ্ণ স্যুপের ঝোল ও ২৩ গ্রাম প্রোটিন শরীর আর্দ্র রেখে পরিমিত তৃপ্তি দেয়।',
    linkedRecipeId: 'nepali-thukpa',
    searchKeyword: 'Thukpa',
    kcalApprox: 375,
    proteinApprox: 23,
    fiberApprox: 4.5,
  },
  {
    id: 'idea-palak-paneer-dinner',
    slot: 'dinner',
    titleEn: 'Fresh Spinach & Cottage Cheese (Palak Paneer)',
    titleBn: 'তাজা পালং শাক ও পনিরের সুষম রাতের পদ',
    subtitleEn: 'Silky puréed spinach simmered with seared paneer & light garam masala',
    subtitleBn: 'পালং শাক ও ঘরোয়া পনিরের আয়রন ও ক্যালসিয়াম-সমৃদ্ধ পদ',
    whyHealthyEn: 'Concentrates calcium, folate, and vegetarian protein in a satisfying low-sugar dinner.',
    whyHealthyBn: 'নিরামিষ প্রোটিন, ক্যালসিয়াম ও ফোলেটের উৎকৃষ্ট রাতের উৎস।',
    linkedRecipeId: 'palak-paneer',
    searchKeyword: 'Palak Paneer',
    kcalApprox: 340,
    proteinApprox: 18,
    fiberApprox: 5.5,
  },
  // Snacks
  {
    id: 'idea-steamed-momo-snack',
    slot: 'snack',
    titleEn: 'Steamed Chicken & Cabbage Dumplings (Momo)',
    titleBn: 'ভাপানো চিকেন ও বাঁধাকপির মোমো',
    subtitleEn: 'Zero deep-frying steamed parcels with roasted tomato-sesame chutney',
    subtitleBn: 'তেলছাড়া ভাপে তৈরি মোমো ও টমেটো-তিলের চাটনি',
    whyHealthyEn: 'Steaming avoids heavy frying oils while delivering 21g protein and ~310 kcal.',
    whyHealthyBn: 'ডুবো তেলে ভাজা না হওয়ায় মাত্র ৩১০ ক্যালোরিতে ২১ গ্রাম প্রোটিন পাওয়া যায়।',
    linkedRecipeId: 'nepali-momo',
    searchKeyword: 'Momo',
    kcalApprox: 310,
    proteinApprox: 21,
    fiberApprox: 3.5,
  },
  {
    id: 'idea-veg-soup-snack',
    slot: 'snack',
    titleEn: 'Garden Vegetable & Lentil Comfort Soup',
    titleBn: 'তাজা সবজি ও ডালের পুষ্টিকর বিকেলের স্যুপ',
    subtitleEn: 'Carrots, spinach, green beans, celery & tomatoes simmered with herbs',
    subtitleBn: 'গাজর, পালং শাক, বরবটি ও টমেটোর ফাইবার-সমৃদ্ধ হালকা স্যুপ',
    whyHealthyEn: 'Under 200 kcal with 6g fiber—ideal warm afternoon snack instead of sugary biscuits.',
    whyHealthyBn: 'চিনিযুক্ত বিস্কুটের বদলে ২০০ ক্যালোরির কম এই স্যুপ ৬ গ্রাম ফাইবার দেয়।',
    linkedRecipeId: 'garden-vegetable-soup',
    searchKeyword: 'Vegetable Recipes',
    kcalApprox: 195,
    proteinApprox: 7,
    fiberApprox: 6,
  },
  {
    id: 'idea-panta-snack',
    slot: 'snack',
    titleEn: 'Spiced Chola (Chickpea), Cucumber & Lemon Bowl',
    titleBn: 'মসলাদার সেদ্ধ ছোলা, শসা, ধনেপাতা ও লেবুর বিকেলের নাস্তা',
    subtitleEn: 'Boiled chickpeas tossed with diced cucumber, tomato, green chili & cumin',
    subtitleBn: 'খুব কম তেলে সেদ্ধ ছোলা ও কাঁচা সবজির প্রোটিন-ফাইবারযুক্ত নাস্তা',
    whyHealthyEn: 'High plant fiber and steady energy (~210 kcal) with heart-friendly hydration from fresh veggies.',
    whyHealthyBn: 'উদ্ভিজ্জ ফাইবার ও প্রোটিন সমৃদ্ধ বিকেলের স্বাস্থ্যকর ঐতিহ্যবাহী নাস্তা।',
    searchKeyword: 'High Fiber Food',
    kcalApprox: 210,
    proteinApprox: 10.5,
    fiberApprox: 6.5,
  },
];

export const NUTRIENT_EDUCATION_CARDS: NutrientEducationCard[] = [
  {
    id: 'protein',
    nutrientEn: 'Protein',
    nutrientBn: 'প্রোটিন (আমিষ)',
    roleEn: 'Maintains muscle tissue, immunity antibodies, hair/skin structure, and helps meals keep you comfortably full.',
    roleBn: 'পেশি, রোগ প্রতিরোধ ক্ষমতা, এনজাইম ও হরমোন গঠনে সাহায্য করে এবং দীর্ঘক্ষণ পেট ভরা রাখে।',
    bangladeshiSourcesEn: 'Hilsa & Rohu fish, small mola fish, farm eggs, Masoor/Moong dal, chickpeas, fermented yogurt (Doi).',
    bangladeshiSourcesBn: 'রুই ও ইলিশ মাছ, ছোট মাছ, ডিম, মসুর ও মুগ ডাল, ছোলা, দুধ ও টক দই।',
    globalSourcesEn: 'Greek yogurt, edamame, salmon, tofu, paneer, chicken breast, quinoa.',
    globalSourcesBn: 'টফু, পনির, সয়াবিন/এডামামে, সালমন, মুরগির বুকের মাংস ও কুইনোয়া।',
    pairingTipEn: 'Combine rice + dal together so plant amino acids complement each other.',
    pairingTipBn: 'ভাত ও ডাল একসাথে খেলে পূর্ণাঙ্গ অ্যামাইনো এসিড প্রোফাইল পাওয়া যায়।',
  },
  {
    id: 'carbohydrates',
    nutrientEn: 'Complex Carbohydrates',
    nutrientBn: 'জটিল শর্করা (কার্বোহাইড্রেট)',
    roleEn: 'Primary daily fuel for active students, brains, and physical movement when sourced from intact grains.',
    roleBn: 'মস্তিষ্ক ও শরীরের প্রতিদিনের প্রধান জ্বালানি। পরিশোধিত চিনির বদলে পূর্ণ শস্য বাছাই করা উত্তম।',
    bangladeshiSourcesEn: 'Parboiled rice (Siddho chal), red/brown rice, whole wheat atta ruti, sweet potato, pressed chira.',
    bangladeshiSourcesBn: 'সিদ্ধ চাল, লাল বা বাদামি চাল, লাল আটার রুটি, মিষ্টি আলু ও লাল চিঁড়া।',
    globalSourcesEn: 'Rolled oats, buckwheat soba, quinoa, whole-grain pasta, corn tortillas.',
    globalSourcesBn: 'ওটস, কুইনোয়া, লাল আটার পাস্তা ও ভুট্টার রুটি।',
    pairingTipEn: 'Eat carbs alongside greens and protein to slow digestion and avoid sluggishness.',
    pairingTipBn: 'শর্করার সাথে শাকসবজি ও ডাল/মাছ রাখলে হঠাৎ ক্লান্তি আসে না।',
  },
  {
    id: 'healthy-fats',
    nutrientEn: 'Healthy Fats',
    nutrientBn: 'স্বাস্থ্যকর চর্বি (ফ্যাট)',
    roleEn: 'Required for hormone balance, cell membranes, brain development, and absorbing vitamins A, D, E & K.',
    roleBn: 'হরমোন ভারসাম্য, মস্তিষ্কের বিকাশ এবং ভিটামিন এ, ডি, ই ও কে শোষণের জন্য অপরিহার্য।',
    bangladeshiSourcesEn: 'Mustard oil (used moderately), Hilsa & Pangas omega-3 fish oil, peanuts, mustard paste, sesame (Til).',
    bangladeshiSourcesBn: 'পরিমিত সরিষার তেল, ইলিশ মাছের ওমেগা-৩ ফ্যাট, চিনাবাদাম ও তিল।',
    globalSourcesEn: 'Extra-virgin olive oil, walnuts, chia & flax seeds, avocado.',
    globalSourcesBn: 'অলিভ অয়েল, আখরোট, চিয়া ও তিসির বীজ এবং অ্যাভোকাডো।',
    pairingTipEn: 'Sauté leafy greens in 1 teaspoon of oil so beta-carotene converts well to Vitamin A.',
    pairingTipBn: 'শাকসবজি সামান্য তেলে রান্না করলে এর বিটা-ক্যারোটিন শরীরে সহজে শোষিত হয়।',
  },
  {
    id: 'dietary-fiber',
    nutrientEn: 'Dietary Fiber',
    nutrientBn: 'খাদ্য আঁশ (ফাইবার)',
    roleEn: 'Nourishes beneficial gut bacteria, supports regular digestion, helps manage cholesterol, and prevents sugar spikes.',
    roleBn: 'অন্ত্রের উপকারী ব্যাকটেরিয়া সুস্থ রাখে, কোষ্ঠকাঠিন্য দূর করে এবং রক্তের কোলেস্টেরল ও শর্করা নিয়ন্ত্রণে সহায়তা করে।',
    bangladeshiSourcesEn: 'Guava, okra (Dherosh), bottle gourd, cabbage, red amaranth, whole lentils & roasted chickpeas.',
    bangladeshiSourcesBn: 'পেয়ারা, ঢেঁড়স, লাউ, বাঁধাকপি, লাল শাক, খোসাযুক্ত ডাল ও ছোলা।',
    globalSourcesEn: 'Oats, chia seeds, broccoli, berries, black beans.',
    globalSourcesBn: 'ওটস, চিয়া বীজ, ব্রকলি, বেরি ও শিমের বীজ।',
    pairingTipEn: 'Increase fiber gradually and drink water steadily alongside high-fiber meals.',
    pairingTipBn: 'আঁশযুক্ত খাবার বাড়ানোর পাশাপাশি পর্যাপ্ত নিরাপদ পানি পান করা জরুরি।',
  },
  {
    id: 'vitamins',
    nutrientEn: 'Essential Vitamins (A, B-Complex, C, D)',
    nutrientBn: 'ভিটামিন (এ, বি-কমপ্লেক্স, সি, ডি)',
    roleEn: 'Drives energy metabolism (B vitamins), vision & immunity (A, C), and bone strength with sunlight (D).',
    roleBn: 'দৃষ্টিশক্তি (ভিটামিন এ), রোগ প্রতিরোধ (সি), শক্তি উৎপাদন (বি) এবং হাড়ের সুস্থতা (ডি) নিশ্চিত করে।',
    bangladeshiSourcesEn: 'Amla/Kagozi lemon/guava (Vit C), Mola fish & sweet pumpkin/carrot (Vit A), eggs & dairy (B12/D).',
    bangladeshiSourcesBn: 'আমলকি, কাগজি লেবু ও পেয়ারা (ভিটামিন সি), মলা মাছ ও গাজর (ভিটামিন এ), ডিম ও দুধ (বি১২/ডি)।',
    globalSourcesEn: 'Bell peppers, citrus, fortified mushrooms, salmon, nutritional yeast.',
    globalSourcesBn: 'ক্যাপসিকাম, কমলা, সূর্যালোকে পুষ্ট মাশরুম ও সামুদ্রিক মাছ।',
    pairingTipEn: 'Add raw lemon juice after turning off heat because high heat destroys Vitamin C.',
    pairingTipBn: 'ভিটামিন সি অক্ষুণ্ণ রাখতে চুলা থেকে নামানোর পর কাঁচা লেবুর রস দিন।',
  },
  {
    id: 'minerals',
    nutrientEn: 'Vital Minerals (Iron, Calcium, Zinc, Potassium)',
    nutrientBn: 'গুরুত্বপূর্ণ খনিজ (আয়রন, ক্যালসিয়াম, জিঙ্ক, পটাশিয়াম)',
    roleEn: 'Carries oxygen in red blood cells (Iron), fortifies teeth & bones (Calcium), and supports immunity (Zinc).',
    roleBn: 'রক্তে অক্সিজেন পরিবহন (আয়রন), হাড়-দাঁত মজবুত (ক্যালসিয়াম) ও রোগ প্রতিরোধ (জিঙ্ক) রক্ষা করে।',
    bangladeshiSourcesEn: 'Small fish eaten with bones, Kochu shaak, Lal shaak, lentils, sesame, milk & banana.',
    bangladeshiSourcesBn: 'কাঁটাসহ ছোট মাছ (মলা/কাঁচকি), কচু শাক, লাল শাক, ডাল, দুধ ও কলা।',
    globalSourcesEn: 'Tofu (calcium-set), pumpkin seeds (zinc), spinach, white beans.',
    globalSourcesBn: 'টফু, মিষ্টিকুমড়ার বীজ (জিঙ্ক), পালং শাক ও সিমের বিচি।',
    pairingTipEn: 'Avoid drinking strong tea or coffee immediately with iron-rich meals as tannins reduce iron absorption.',
    pairingTipBn: 'আয়রনসমৃদ্ধ খাবারের ঠিক পরপরই চা-কফি না খেলে আয়রন ভালোভাবে শোষিত হয়।',
  },
  {
    id: 'hydration',
    nutrientEn: 'Hydration & Electrolytes',
    nutrientBn: 'পানিশূন্যতা রোধ ও ইলেকট্রোলাইট',
    roleEn: 'Maintains body temperature in humid weather, sharpens concentration, and transports nutrients across cells.',
    roleBn: 'গরম ও আর্দ্র আবহাওয়ায় শরীরের তাপমাত্রা নিয়ন্ত্রণ, মনোযোগ ধরে রাখা এবং পুষ্টি পরিবহনে সহায়তা করে।',
    bangladeshiSourcesEn: 'Safe boiled/filtered drinking water, green coconut water (Dab), unsweetened Tok Doi ghol/borhani.',
    bangladeshiSourcesBn: 'নিরাপদ ফিল্টার/ফোটানো পানি, ডাবের পানি ও চিনিছাড়া টক দইয়ের ঘোল।',
    globalSourcesEn: 'Infused lemon-mint water, clear vegetable broths, herbal teas.',
    globalSourcesBn: 'লেবু-পুদিনার পানি, পাতলা সবজি স্যুপ ও চিনিবিহীন হার্বাল চা।',
    pairingTipEn: 'Choose plain water over sweetened sodas or packaged fruit drinks.',
    pairingTipBn: 'কোমল পানীয় ও প্যাকেটজাত মিষ্টি জুসের বদলে বিশুদ্ধ পানি বা ডাবের পানি বেছে নিন।',
  },
  {
    id: 'variety',
    nutrientEn: 'Food Variety & Portion Balance',
    nutrientBn: 'খাবারের বৈচিত্র্য ও পরিমিতিবোধ',
    roleEn: 'No single "superfood" delivers every nutrient—rotating local seasonal crops ensures complete micronutrient coverage.',
    roleBn: 'কোনো একক খাবার সব পুষ্টি দিতে পারে না; মৌসুমি ও রঙিন শাকসবজি ঘুরিয়ে ফিরিয়ে খাওয়াই সেরা উপায়।',
    bangladeshiSourcesEn: 'Rotating seasonal haat-bazaar produce: winter beans/cauliflower, summer mango/okra, monsoon leafy greens.',
    bangladeshiSourcesBn: 'মৌসুম অনুযায়ী খাবার: শীতে শিম-ফুলকপি, গ্রীষ্মে ঢেঁড়স-কাঁঠাল ও বর্ষায় নানা রকমের শাক।',
    globalSourcesEn: 'Rotating different grains, legumes, herbs, and cooking traditions weekly.',
    globalSourcesBn: 'সপ্তাহজুড়ে বিভিন্ন ধরনের শস্য, ডাল ও আন্তর্জাতিক রন্ধনশৈলী ঘুরিয়ে ব্যবহার করা।',
    pairingTipEn: 'Eat regular meals every day—skipping meals leads to energy dips rather than lasting wellness.',
    pairingTipBn: 'প্রতিদিন নিয়মিত সময়মতো সুষম খাবার খান; উপোস থাকা বা খাবার বাদ দেওয়া স্বাস্থ্যকর নয়।',
  },
];
