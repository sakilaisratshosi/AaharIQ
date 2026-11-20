export type Language = 'en' | 'bn';

export interface Translations {
  appName: string;
  tagline: string;
  eatSmartLiveBetter: string;
  searchPlaceholder: string;
  searchButton: string;
  exploreRecipes: string;
  globalRecipeFinder: string;
  healthyGuide: string;
  analyzeNutrition: string;
  bdNutritionExplorer: string;
  foodScanner: string;
  safetyCenter: string;
  foodComparison: string;
  foodWaste: string;
  foodJournal: string;
  onboarding: string;
  notifications: string;
  ingredientAI: string;
  mealPlanner: string;
  globalCuisines: string;
  groceryManager: string;
  aiAssistant: string;
  favorites: string;
  profile: string;
  signIn: string;
  signOut: string;
  guestUser: string;
  dailyTipTitle: string;
  featuredRecipes: string;
  popularCuisines: string;
  nutritionOverview: string;
  viewAll: string;
  prepTime: string;
  cookTime: string;
  servings: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  vitaminsAndMinerals: string;
  ingredients: string;
  instructions: string;
  addToGrocery: string;
  addedToGrocery: string;
  saveFavorite: string;
  saved: string;
  substitutes: string;
  cookingTips: string;
  difficulty: string;
  missingIngredients: string;
  usedIngredients: string;
  findRecipesByIngredients: string;
  enterIngredientsHelp: string;
  addIngredient: string;
  generateRecipes: string;
  selectCuisine: string;
  allCuisines: string;
  mealType: string;
  dietaryPreference: string;
  allMealTypes: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snack: string;
  vegetarian: string;
  vegan: string;
  halal: string;
  glutenFree: string;
  highProtein: string;
  foodDatabase: string;
  searchFoodItem: string;
  servingSize: string;
  unit: string;
  source: string;
  verifiedData: string;
  aiEstimated: string;
  macroDistribution: string;
  dailyGoal: string;
  generateMealPlan: string;
  calorieTarget: string;
  allergies: string;
  groceryList: string;
  addItem: string;
  itemPlaceholder: string;
  category: string;
  purchased: string;
  clearPurchased: string;
  copyList: string;
  listCopied: string;
  askAssistantPrompt: string;
  assistantDisclaimer: string;
  send: string;
  clearChat: string;
  bangladeshiHeritage: string;
  usdaVerified: string;
  loading: string;
  back: string;
  home: string;
  quickNavigate: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: 'AaharIQ',
    tagline: 'Smart Food. Better Nutrition. Safer Living.',
    eatSmartLiveBetter: 'Smart Food. Better Nutrition. Safer Living.',
    searchPlaceholder: 'Search recipes, ingredients, or Bangladesh foods (e.g., শাক, বাঁধাকপি, Ilish, Dal)...',
    searchButton: 'Search',
    exploreRecipes: 'Global Recipe Finder',
    globalRecipeFinder: 'Global Recipe Finder',
    healthyGuide: 'Healthy Nutrition Guide',
    analyzeNutrition: 'Calorie & Nutrition Analyzer',
    bdNutritionExplorer: 'Bangladesh Food DB',
    foodScanner: 'Food Scanner',
    safetyCenter: 'Food Safety Center',
    foodComparison: 'Food Comparison',
    foodWaste: 'Food Waste Reduction',
    foodJournal: 'Food Journal',
    onboarding: 'Quick Setup',
    notifications: 'Notifications',
    ingredientAI: 'Recipe Finder',
    mealPlanner: 'Meal Planner',
    globalCuisines: 'Global Cuisines',
    groceryManager: 'Grocery Manager',
    aiAssistant: 'Food Assistant',
    favorites: 'Favorites',
    profile: 'My Profile',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    guestUser: 'Guest Explorer',
    dailyTipTitle: 'Daily Nutrition Insight',
    featuredRecipes: 'Featured Nutritious Recipes',
    popularCuisines: 'Global Culinary Traditions',
    nutritionOverview: 'Interactive Nutrition Lab',
    viewAll: 'View All',
    prepTime: 'Prep Time',
    cookTime: 'Cook Time',
    servings: 'Servings',
    calories: 'Calories',
    protein: 'Protein',
    carbs: 'Carbs',
    fat: 'Fat',
    fiber: 'Dietary Fiber',
    vitaminsAndMinerals: 'Vitamins & Minerals',
    ingredients: 'Ingredients',
    instructions: 'Step-by-Step Instructions',
    addToGrocery: 'Add to Grocery List',
    addedToGrocery: 'Added to Grocery!',
    saveFavorite: 'Save Favorite',
    saved: 'Saved',
    substitutes: 'Possible Substitutes',
    cookingTips: 'Cooking Tips',
    difficulty: 'Difficulty',
    missingIngredients: 'Missing Ingredients',
    usedIngredients: 'Ingredients You Have',
    findRecipesByIngredients: 'Cook with What You Have',
    enterIngredientsHelp: 'Add one or more ingredients in Bangla or English to discover genuine matching recipes.',
    addIngredient: 'Add Ingredient',
    generateRecipes: 'Find Matching Recipes',
    selectCuisine: 'Select Cuisine',
    allCuisines: 'All Cuisines',
    mealType: 'Meal Type',
    dietaryPreference: 'Dietary Preference',
    allMealTypes: 'All Meal Types',
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snacks',
    vegetarian: 'Vegetarian',
    vegan: 'Vegan',
    halal: 'Halal',
    glutenFree: 'Gluten-Free',
    highProtein: 'High Protein',
    foodDatabase: 'INFS Bangladesh & USDA Food Database',
    searchFoodItem: 'Search food database (e.g., Ilish Fish, Rice, Lal Shaak)...',
    servingSize: 'Serving Quantity',
    unit: 'Unit',
    source: 'Data Source',
    verifiedData: 'Verified Database Record',
    aiEstimated: 'Estimated Value',
    macroDistribution: 'Macronutrient Ratio',
    dailyGoal: 'Daily Target',
    generateMealPlan: 'Generate Balanced Meal Plan',
    calorieTarget: 'Calorie Target (kcal)',
    allergies: 'Allergies & Sensitivities',
    groceryList: 'Smart Grocery Checklist',
    addItem: 'Add Item',
    itemPlaceholder: 'e.g., Fresh Coriander, 2 bunches',
    category: 'Category',
    purchased: 'Completed',
    clearPurchased: 'Clear Completed',
    copyList: 'Copy Checklist',
    listCopied: 'Copied to clipboard!',
    askAssistantPrompt: 'Ask about local foods, nutrients, storage, food waste, or BFSA safety...',
    assistantDisclaimer: 'AaharIQ provides educational food, nutrition, and safety information. It is not a substitute for a qualified medical doctor, clinical dietitian, or accredited food safety laboratory.',
    send: 'Send',
    clearChat: 'Clear History',
    bangladeshiHeritage: 'Bangladesh Food Composition Focus',
    usdaVerified: 'INFS Bangladesh & USDA Referenced',
    loading: 'Analyzing...',
    back: 'Back',
    home: 'Home',
    quickNavigate: 'Quick Navigate',
  },
  bn: {
    appName: 'আহারআইকিউ (AaharIQ)',
    tagline: 'স্মার্ট খাবার। উন্নত পুষ্টি। নিরাপদ জীবন।',
    eatSmartLiveBetter: 'স্মার্ট খাবার। উন্নত পুষ্টি। নিরাপদ জীবন।',
    searchPlaceholder: 'রেসিপি, উপাদান বা বাংলাদেশি খাদ্য খুঁজুন (যেমন: শাক, বাঁধাকপি, ইলিশ, ডাল)...',
    searchButton: 'অনুসন্ধান',
    exploreRecipes: 'গ্লোবাল রেসিপি খুঁজুন',
    globalRecipeFinder: 'গ্লোবাল রেসিপি ফাইন্ডার',
    healthyGuide: 'সুস্থ খাদ্য ও পুষ্টি গাইড',
    analyzeNutrition: 'ক্যালোরি ও পুষ্টি বিশ্লেষক',
    bdNutritionExplorer: 'বাংলাদেশ খাদ্য ডেটাবেজ',
    foodScanner: 'ফুড স্ক্যানার',
    safetyCenter: 'খাদ্য নিরাপত্তা কেন্দ্র',
    foodComparison: 'খাদ্য তুলনা',
    foodWaste: 'অপচয় রোধ',
    foodJournal: 'খাদ্য জার্নাল',
    onboarding: 'দ্রুত সেটআপ',
    notifications: 'বিজ্ঞপ্তি',
    ingredientAI: 'উপাদান রেসিপি',
    mealPlanner: 'মিল প্ল্যানার',
    globalCuisines: 'বিশ্বের রান্না',
    groceryManager: 'বাজারের তালিকা',
    aiAssistant: 'খাদ্য সহকারী',
    favorites: 'পছন্দের তালিকা',
    profile: 'প্রোফাইল',
    signIn: 'লগইন করুন',
    signOut: 'লগআউট',
    guestUser: 'অতিথি ব্যবহারকারী',
    dailyTipTitle: 'দৈনিক পুষ্টি বার্তা',
    featuredRecipes: 'নির্বাচিত পুষ্টিকর রেসিপি',
    popularCuisines: 'বিশ্বের ঐতিহ্যবাহী রন্ধনশৈলী',
    nutritionOverview: 'ইন্টারেক্টিভ পুষ্টি ল্যাব',
    viewAll: 'সবগুলো দেখুন',
    prepTime: 'প্রস্তুতির সময়',
    cookTime: 'রান্নার সময়',
    servings: 'পরিবেশন সংখ্যা',
    calories: 'ক্যালোরি',
    protein: 'প্রোটিন',
    carbs: 'কার্বোহাইড্রেট',
    fat: 'ফ্যাট / চর্বি',
    fiber: 'আঁশ / ফাইবার',
    vitaminsAndMinerals: 'ভিটামিন ও খনিজ',
    ingredients: 'উপকরণসমূহ',
    instructions: 'রান্নার প্রণালী',
    addToGrocery: 'বাজারের তালিকায় যোগ করুন',
    addedToGrocery: 'তালিকায় যোগ হয়েছে!',
    saveFavorite: 'পছন্দে রাখুন',
    saved: 'সংরক্ষিত',
    substitutes: 'বিকল্প উপকরণ',
    cookingTips: 'রান্নার টিপস',
    difficulty: 'কঠিনতার স্তর',
    missingIngredients: 'প্রয়োজনীয় বাকি উপকরণ',
    usedIngredients: 'আপনার বিদ্যমান উপকরণ',
    findRecipesByIngredients: 'হাতের কাছের উপকরণে রান্না করুন',
    enterIngredientsHelp: 'আপনার রান্নাঘরে থাকা ১টি বা একাধিক উপাদান বাংলা বা ইংরেজিতে লিখুন এবং সঠিক রেসিপি খুঁজুন।',
    addIngredient: 'উপকরণ যোগ করুন',
    generateRecipes: 'রেসিপি খুঁজুন',
    selectCuisine: 'রান্না নির্বাচন করুন',
    allCuisines: 'সকল রান্না',
    mealType: 'খাবারের ধরন',
    dietaryPreference: 'খাদ্যাভ্যাস পছন্দ',
    allMealTypes: 'সকল খাবার',
    breakfast: 'সকালের নাস্তা',
    lunch: 'দুপুরের খাবার',
    dinner: 'রাতের খাবার',
    snack: 'বিকেলের নাস্তা',
    vegetarian: 'নিরামিষ',
    vegan: 'ভেগান',
    halal: 'হালাল',
    glutenFree: 'গ্লুটেন-মুক্ত',
    highProtein: 'উচ্চ প্রোটিন',
    foodDatabase: 'বাংলাদেশ ও USDA খাদ্য ডেটাবেজ',
    searchFoodItem: 'খাদ্য অনুসন্ধান করুন (যেমন: ইলিশ মাছ, চাল, লাল শাক)...',
    servingSize: 'পরিবেশন পরিমাণ',
    unit: 'একক',
    source: 'তথ্যের উৎস',
    verifiedData: 'যাচাইকৃত ডেটাবেজ তথ্য',
    aiEstimated: 'আনুমানিক মান',
    macroDistribution: 'ম্যাক্রোনিউট্রিয়েন্ট অনুপাত',
    dailyGoal: 'দৈনিক লক্ষ্যমাত্রা',
    generateMealPlan: 'ব্যালেন্সড মিল প্ল্যান তৈরি করুন',
    calorieTarget: 'ক্যালোরি লক্ষ্যমাত্রা (কেসিএল)',
    allergies: 'অ্যালার্জি ও সংবেদনশীলতা',
    groceryList: 'স্মার্ট বাজারের ফর্দ',
    addItem: 'আইটেম যোগ করুন',
    itemPlaceholder: 'যেমন: তাজা ধনেপাতা, ২ আটি',
    category: 'বিভাগ',
    purchased: 'সম্পন্ন',
    clearPurchased: 'সম্পন্নগুলো মুছুন',
    copyList: 'ফর্দ কপি করুন',
    listCopied: 'ক্লিপবোর্ডে কপি হয়েছে!',
    askAssistantPrompt: 'দেশীয় খাদ্য, পুষ্টি, সংরক্ষণ, অপচয় রোধ বা BFSA নিরাপত্তা সম্পর্কে জিজ্ঞাসা করুন...',
    assistantDisclaimer: 'AaharIQ খাদ্য, পুষ্টি ও নিরাপত্তা বিষয়ক শিক্ষামূলক তথ্য দেয়। এটি কোনো চিকিৎসক, পুষ্টিবিদ বা সরকারি ল্যাবরেটরি পরীক্ষার বিকল্প নয়।',
    send: 'পাঠান',
    clearChat: 'ইতিহাস মুছুন',
    bangladeshiHeritage: 'বাংলাদেশি খাদ্য ও পুষ্টি তথ্য',
    usdaVerified: 'INFS বাংলাদেশ ও USDA তথ্যসূত্র',
    loading: 'বিশ্লেষণ করা হচ্ছে...',
    back: 'ফিরে যান',
    home: 'হোম',
    quickNavigate: 'দ্রুত নেভিগেশন',
  },
};
