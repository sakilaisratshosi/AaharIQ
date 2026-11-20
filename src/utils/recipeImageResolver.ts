/**
 * Smart Recipe Image Resolver & Search Query Builder
 * Accurately matches exact recipe titles, Bangla names, cuisines, and main ingredients
 * to dedicated high-resolution food photography in /public/images/.
 */

export interface RecipeImageInput {
  id?: string;
  recipeId?: string;
  recipeName?: string;
  name?: string;
  nameBn?: string;
  recipeNameBn?: string;
  cuisine?: string;
  ingredients?: any[];
  usedIngredients?: string[];
  availableIngredients?: string[];
  image?: string;
  imageUrl?: string;
  imageSearchQuery?: string;
  source?: string;
}

/**
 * Deterministic 1-to-1 recipeId -> local culinary photography registry.
 * Checked FIRST before any fuzzy matching or potentially stale image strings.
 */
export const RECIPE_IMAGE_BY_ID: Record<string, string> = {
  'chicken-biryani': '/images/chicken-biryani.jpg',
  'bengali-chicken-curry': '/images/bengali-chicken-curry.jpg',
  'bengali-egg-curry': '/images/bengali-egg-curry.jpg',
  'bengali-fish-curry': '/images/bengali-fish-curry.jpg',
  'vegetable-fried-rice': '/images/vegetable-fried-rice.jpg',
  'tomato-egg-bhurji': '/images/tomato-egg-bhurji.jpg',
  'hearty-vegetable-soup': '/images/garden-vegetable-soup.jpg',
  'italian-margherita-pizza': '/images/italian-margherita-pizza.jpg',
  'italian-garlic-herb-pasta': '/images/italian-garlic-herb-pasta.jpg',
  'chicken-herb-pasta': '/images/chicken-herb-pasta.jpg',
  'japanese-salmon-sushi': '/images/japanese-salmon-sushi.jpg',
  'shorshe-ilish': '/images/shorshe-ilish.jpg',
  'bhuna-khichuri': '/images/vegetable-khichuri.jpg',
  'bengali-ghee-bhat': '/images/bengali-ghee-bhat.jpg',
  'lal-shaak-bhaji': '/images/bengali-shak-bhaji.jpg',
  'bengali-shak-bhorta': '/images/bengali-shak-bhorta.jpg',
  'bengali-shak-diye-dal': '/images/spinach-lentil-dal.jpg',
  'bengali-potato-bhaji': '/images/bengali-potato-bhaji.jpg',
  'mediterranean-shakshuka': '/images/mediterranean-shakshuka.jpg',
  'palak-paneer': '/images/palak-paneer.jpg',
  'kung-pao-chicken': '/images/kung-pao-chicken.jpg',
  'thai-tom-yum-soup': '/images/thai-tom-yum-soup.jpg',
  'nepali-chicken-momo': '/images/nepali-steamed-momos.jpg',
  'bengali-aloo-bhorta': '/images/bengali-aloo-bhorta.jpg',
  'bengali-dum-aloo': '/images/bengali-dum-aloo.jpg',
  'bd-tandoori-chicken-pizza': '/images/bangladeshi-tandoori-pizza.jpg',
  'chicken-mozzarella-pizza': '/images/chicken-mozzarella-pizza.jpg',
  'roasted-vegetable-pizza': '/images/roasted-vegetable-pizza.jpg',
  'dhaka-hakka-noodles': '/images/hakka-stir-fry-noodles.jpg',
  'japanese-miso-ramen': '/images/japanese-miso-ramen.jpg',
  'bengali-bandhakopi-ghonto': '/images/cabbage-bhaji-ghonto.jpg',
  'cabbage-lentil-dal': '/images/cabbage-lentil-dal.jpg',
  'indian-paneer-tikka-pizza': '/images/indian-paneer-tikka-pizza.jpg',
  'japanese-teriyaki-pizza': '/images/japanese-teriyaki-pizza.jpg',
  'usa-ny-style-pizza': '/images/ny-style-pizza.jpg',
  'bd-bhapa-pitha': '/images/bangladeshi-bhapa-pitha.jpg',
  'bd-panta-bhat': '/images/bangladeshi-panta-bhat.jpg',
  'bd-masoor-dal': '/images/bangladeshi-masoor-dal.jpg',
  'nepali-dal-bhat': '/images/nepali-dal-bhat.jpg',
  'nepali-thukpa': '/images/nepali-thukpa.jpg',
  'indian-masala-dosa': '/images/indian-masala-dosa.jpg',
  'indian-butter-chicken': '/images/indian-butter-chicken.jpg',
  'indian-paneer-tikka': '/images/indian-paneer-tikka.jpg',
  'italian-mushroom-risotto': '/images/italian-mushroom-risotto.jpg',
  'japanese-shrimp-veg-tempura': '/images/japanese-tempura.jpg',
  'korean-bibimbap': '/images/korean-bibimbap.jpg',
  'korean-kimchi-fried-rice': '/images/korean-kimchi-fried-rice.jpg',
  'chinese-steamed-dumplings': '/images/chinese-dumplings.jpg',
  'thai-pad-thai': '/images/thai-pad-thai.jpg',
  'mexican-grilled-tacos': '/images/mexican-tacos.jpg',
  'mexican-spinach-quesadilla': '/images/mexican-quesadilla.jpg',
  'healthy-oats-chia-bowl': '/images/oats-chia-breakfast-bowl.jpg',
  'healthy-moong-dal-chilla': '/images/moong-dal-chilla.jpg',
  'healthy-high-protein-bowl': '/images/high-protein-chicken-bowl.jpg',
};

/**
 * Generates an accurate, dish-specific English culinary image search query
 * from the recipe's title, Bangla title, and main ingredients.
 */
export function buildRecipeImageSearchQuery(recipe: RecipeImageInput): string {
  const titleEn = (recipe.recipeName || recipe.name || '').trim();
  const titleBn = (recipe.recipeNameBn || recipe.nameBn || '').trim();
  const combined = `${titleEn} ${titleBn}`.toLowerCase();

  // Specific Bengali & South Asian lentil combinations
  if (combined.includes('dal') || combined.includes('lentil') || combined.includes('ডাল')) {
    if (combined.includes('cabbage') || combined.includes('bandhakopi') || combined.includes('বাঁধাকপি') || combined.includes('বাধাকপি')) {
      return 'Cabbage lentil dal';
    }
    if (combined.includes('pumpkin') || combined.includes('kumra') || combined.includes('kumro') || combined.includes('কুমড়া') || combined.includes('কুমড়া')) {
      return 'Sweet pumpkin lentil dal';
    }
    if (combined.includes('spinach') || combined.includes('shak') || combined.includes('palak') || combined.includes('শাক') || combined.includes('পালং')) {
      return 'Spinach lentil dal';
    }
    if (combined.includes('tomato') || combined.includes('tok') || combined.includes('টমেটো')) {
      return 'Tomato red lentil dal';
    }
    if (combined.includes('bhuna') || combined.includes('dry') || combined.includes('ভুনা') || combined.includes('শুকনো')) {
      return 'Dry spiced bhuna lentil dal';
    }
    if (combined.includes('khichuri') || combined.includes('খিচুড়ি') || combined.includes('খিচুড়ি')) {
      return 'Lentil rice khichuri';
    }
    return 'Bengali lentil tadka dal';
  }

  if (combined.includes('pasta') || combined.includes('spaghetti') || combined.includes('penne') || combined.includes('fettuccine') || combined.includes('পাস্তা')) {
    if (combined.includes('chicken') || combined.includes('চিকেন') || combined.includes('মুরগি')) {
      return 'Grilled chicken garlic herb fettuccine pasta';
    }
    return 'Garlic herb cherry tomato penne pasta';
  }

  // Strip parenthetical clarifications and non-ASCII filler if English title exists
  const cleanEn = titleEn
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleanEn) {
    return `${cleanEn} food photography`;
  }

  const mainIngs = [
    ...(recipe.availableIngredients || []),
    ...(recipe.usedIngredients || []),
  ]
    .slice(0, 3)
    .join(' ');

  return `${titleBn} ${mainIngs} food photography`.replace(/\s+/g, ' ').trim();
}

export function resolveRecipeImage(recipe: RecipeImageInput): string {
  const lookupId = (recipe.recipeId || recipe.id || '').trim().toLowerCase();
  if (lookupId && RECIPE_IMAGE_BY_ID[lookupId]) {
    return RECIPE_IMAGE_BY_ID[lookupId];
  }

  const candidateUrl = (recipe.imageUrl || recipe.image || '').trim();
  const title = `${recipe.recipeName || ''} ${recipe.name || ''} ${recipe.recipeId || ''} ${recipe.id || ''}`
    .toLowerCase()
    .trim();
  const titleBn = `${recipe.recipeNameBn || ''} ${recipe.nameBn || ''}`.toLowerCase().trim();
  const cuisine = (recipe.cuisine || '').toLowerCase().trim();

  // Never allow distinct lentil sub-dishes to reuse generic /images/lentil-tadka-dal.jpg!
  const isLentilDish =
    title.includes('dal') ||
    title.includes('daal') ||
    title.includes('lentil') ||
    titleBn.includes('ডাল');

  // Prefer verified local /images/* paths (not placeholder) when provided
  if (
    candidateUrl &&
    candidateUrl.startsWith('/images/') &&
    !candidateUrl.includes('placeholder') &&
    !(isLentilDish && candidateUrl.endsWith('/lentil-tadka-dal.jpg'))
  ) {
    return candidateUrl;
  }

  // CRITICAL: Preserve verified real food photography from supported external recipe API (TheMealDB)
  // BEFORE running fuzzy local dish keyword rules so external dishes keep their real dish photos.
  const isVerifiedExternalSource = recipe.source === 'themealdb';
  const isVerifiedExternalHost =
    candidateUrl.startsWith('https://www.themealdb.com/images/') ||
    candidateUrl.startsWith('https://themealdb.com/images/');

  if (
    candidateUrl &&
    candidateUrl.startsWith('https://') &&
    !candidateUrl.includes('placeholder') &&
    (isVerifiedExternalSource || isVerifiedExternalHost)
  ) {
    return candidateUrl;
  }

  // 0. Iconic Curated Specialties (check exact dish signatures first)
  if (title.includes('bhapa pitha') || title.includes('pitha') || titleBn.includes('পিঠা')) {
    return '/images/bangladeshi-bhapa-pitha.jpg';
  }
  if (title.includes('panta bhat') || title.includes('panta') || titleBn.includes('পান্তা')) {
    return '/images/bangladeshi-panta-bhat.jpg';
  }
  if (title.includes('dal bhat') || titleBn.includes('ডাল ভাত')) {
    return '/images/nepali-dal-bhat.jpg';
  }
  if (title.includes('thukpa') || titleBn.includes('থুকপা')) {
    return '/images/nepali-thukpa.jpg';
  }
  if (title.includes('dosa') || titleBn.includes('দোসা')) {
    return '/images/indian-masala-dosa.jpg';
  }
  if (title.includes('butter chicken') || title.includes('murgh makhani') || titleBn.includes('বাটার চিকেন')) {
    return '/images/indian-butter-chicken.jpg';
  }
  if (title.includes('paneer tikka') && !title.includes('pizza')) {
    return '/images/indian-paneer-tikka.jpg';
  }
  if (title.includes('risotto') || titleBn.includes('রিসোতো')) {
    return '/images/italian-mushroom-risotto.jpg';
  }
  if (title.includes('tempura') || titleBn.includes('টেম্পুরা')) {
    return '/images/japanese-tempura.jpg';
  }
  if (title.includes('bibimbap') || titleBn.includes('বিবিমবাপ')) {
    return '/images/korean-bibimbap.jpg';
  }
  if (title.includes('kimchi') || titleBn.includes('কিমচি')) {
    return '/images/korean-kimchi-fried-rice.jpg';
  }
  if (title.includes('dumpling') || title.includes('jiaozi') || titleBn.includes('ডাম্পলিং')) {
    return '/images/chinese-dumplings.jpg';
  }
  if (title.includes('pad thai') || titleBn.includes('প্যাড থাই')) {
    return '/images/thai-pad-thai.jpg';
  }
  if (title.includes('taco') || titleBn.includes('টাকো')) {
    return '/images/mexican-tacos.jpg';
  }
  if (title.includes('quesadilla') || titleBn.includes('কেসাডিয়া')) {
    return '/images/mexican-quesadilla.jpg';
  }
  if (title.includes('oats') && (title.includes('chia') || title.includes('banana'))) {
    return '/images/oats-chia-breakfast-bowl.jpg';
  }
  if (title.includes('chilla') || titleBn.includes('চিল্লা')) {
    return '/images/moong-dal-chilla.jpg';
  }
  if (title.includes('palak paneer') || titleBn.includes('পালক পনির')) {
    return '/images/palak-paneer.jpg';
  }
  if (title.includes('kung pao') || titleBn.includes('কুং পাও')) {
    return '/images/kung-pao-chicken.jpg';
  }
  if (title.includes('tom yum') || titleBn.includes('টম ইয়াম')) {
    return '/images/thai-tom-yum-soup.jpg';
  }
  if (
    title.includes('pasta') ||
    title.includes('spaghetti') ||
    title.includes('penne') ||
    title.includes('fettuccine') ||
    title.includes('macaroni') ||
    titleBn.includes('পাস্তা')
  ) {
    if (title.includes('chicken') || titleBn.includes('চিকেন') || titleBn.includes('মুরগি')) {
      return '/images/chicken-herb-pasta.jpg';
    }
    return '/images/italian-garlic-herb-pasta.jpg';
  }

  // 1. Shakshuka (Poached Eggs in Tomato Sauce)
  if (
    title.includes('shakshuka') ||
    title.includes('shakshouka') ||
    titleBn.includes('শাকশুকা') ||
    title.includes('poached egg')
  ) {
    return '/images/mediterranean-shakshuka.jpg';
  }

  // 2. Specialized Lentil / Dal Varieties (EVERY variety has its own dedicated image!)
  if (isLentilDish && !title.includes('khichuri') && !title.includes('khichdi') && !titleBn.includes('খিচুড়ি') && !titleBn.includes('খিচুড়ি')) {
    if (
      title.includes('cabbage') ||
      title.includes('bandhakopi') ||
      titleBn.includes('বাঁধাকপি') ||
      titleBn.includes('বাধাকপি')
    ) {
      return '/images/cabbage-lentil-dal.jpg';
    }
    if (
      title.includes('pumpkin') ||
      title.includes('kumra') ||
      title.includes('kumro') ||
      titleBn.includes('কুমড়া') ||
      titleBn.includes('কুমড়া') ||
      titleBn.includes('কুমড়ো')
    ) {
      return '/images/pumpkin-lentil-dal.jpg';
    }
    if (
      title.includes('shak') ||
      title.includes('shaak') ||
      title.includes('spinach') ||
      title.includes('palak') ||
      titleBn.includes('শাক') ||
      titleBn.includes('পালং')
    ) {
      return '/images/spinach-lentil-dal.jpg';
    }
    if (
      title.includes('tomato') ||
      title.includes('tok dal') ||
      titleBn.includes('টমেটো') ||
      titleBn.includes('টক ডাল')
    ) {
      return '/images/tomato-lentil-dal.jpg';
    }
    if (
      title.includes('bhuna') ||
      title.includes('dry spiced lentil') ||
      titleBn.includes('ভুনা') ||
      titleBn.includes('শুকনো')
    ) {
      return '/images/dry-bhuna-lentil-dal.jpg';
    }
    return '/images/lentil-tadka-dal.jpg';
  }

  // 3. Shak / Spinach / Leafy Greens — Distinct image per preparation style!
  if (
    (title.includes('shak') ||
      title.includes('shaak') ||
      title.includes('saak') ||
      title.includes('spinach') ||
      title.includes('palak') ||
      title.includes('amaranth') ||
      titleBn.includes('শাক') ||
      titleBn.includes('পালং')) &&
    !title.includes('shakshuka') &&
    !title.includes('shakshouka') &&
    !titleBn.includes('শাকশুকা')
  ) {
    if (title.includes('khichuri') || title.includes('khichdi') || titleBn.includes('খিচুড়ি') || titleBn.includes('খিচুড়ি')) {
      return '/images/vegetable-khichuri.jpg';
    }
    if (title.includes('bhorta') || title.includes('mash') || titleBn.includes('ভর্তা')) {
      return '/images/bengali-shak-bhorta.jpg';
    }
    if (title.includes('dal') || title.includes('lentil') || titleBn.includes('ডাল')) {
      return '/images/spinach-lentil-dal.jpg';
    }
    if (title.includes('paneer') || titleBn.includes('পনির')) {
      return '/images/palak-paneer.jpg';
    }
    if (
      title.includes('torkari') ||
      title.includes('curry') ||
      title.includes('ghonto') ||
      titleBn.includes('তরকারি') ||
      titleBn.includes('ঘন্ট')
    ) {
      return '/images/shaker-torkari.jpg';
    }
    return '/images/bengali-shak-bhaji.jpg';
  }

  // 4. Cabbage / Bandhakopi — Distinct images per dish
  if (title.includes('cabbage') || title.includes('bandhakopi') || titleBn.includes('বাঁধাকপি') || titleBn.includes('বাধাকপি')) {
    if (title.includes('pakora') || title.includes('bora') || title.includes('fritter') || titleBn.includes('পাকোড়া') || titleBn.includes('বড়া')) {
      return '/images/cabbage-pakora.jpg';
    }
    if (title.includes('dal') || title.includes('lentil') || titleBn.includes('ডাল')) {
      return '/images/cabbage-lentil-dal.jpg';
    }
    if (title.includes('soup') || titleBn.includes('স্যুপ')) {
      return '/images/garden-vegetable-soup.jpg';
    }
    if (title.includes('bhaji') || title.includes('stir-fry') || title.includes('fry') || titleBn.includes('ভাজি')) {
      return '/images/spiced-cabbage-bhaji.jpg';
    }
    return '/images/cabbage-bhaji-ghonto.jpg';
  }

  // 5. Cauliflower / Fulkopi — Distinct images per dish
  if (title.includes('cauliflower') || title.includes('fulkopi') || title.includes('gobi') || titleBn.includes('ফুলকপি')) {
    if (title.includes('pakora') || title.includes('fry') || titleBn.includes('পাকোড়া')) {
      return '/images/cabbage-pakora.jpg';
    }
    if (title.includes('soup') || titleBn.includes('স্যুপ')) {
      return '/images/garden-vegetable-soup.jpg';
    }
    if (title.includes('potato') || title.includes('torkari') || title.includes('aloo') || titleBn.includes('আলু') || titleBn.includes('তরকারি')) {
      return '/images/cauliflower-potato-torkari.jpg';
    }
    return '/images/cauliflower-curry-roast.jpg';
  }

  // 6. Pumpkin / Kumra — Distinct images per dish
  if (title.includes('pumpkin') || title.includes('kumra') || title.includes('kumro') || titleBn.includes('কুমড়া') || titleBn.includes('কুমড়া') || titleBn.includes('কুমড়ো')) {
    if (title.includes('soup') || titleBn.includes('স্যুপ')) {
      return '/images/roasted-tomato-soup.jpg';
    }
    if (title.includes('dal') || titleBn.includes('ডাল')) {
      return '/images/pumpkin-lentil-dal.jpg';
    }
    if (title.includes('bhaji') || title.includes('fry') || titleBn.includes('ভাজি')) {
      return '/images/spiced-pumpkin-bhaji.jpg';
    }
    return '/images/pumpkin-kumra-curry.jpg';
  }

  // 7. Onion Fritters / Peyaju / Onion Bhorta
  if (
    title.includes('peyaju') ||
    title.includes('onion pakora') ||
    title.includes('onion fritter') ||
    titleBn.includes('পেঁয়াজু') ||
    titleBn.includes('পেঁয়াজু')
  ) {
    return '/images/bengali-peyaju.jpg';
  }

  // 8. Potato Dishes — Distinct images for Bhorta, Bhaji, Dum Aloo
  if (title.includes('aloo bhorta') || title.includes('potato mash') || title.includes('mashed potato') || titleBn.includes('আলু ভর্তা')) {
    return '/images/bengali-aloo-bhorta.jpg';
  }
  if (
    title.includes('potato bhaji') ||
    title.includes('aloo bhaji') ||
    title.includes('potato fry') ||
    titleBn.includes('আলু ভাজি')
  ) {
    return '/images/bengali-potato-bhaji.jpg';
  }
  if (
    title.includes('dum aloo') ||
    title.includes('aloo dum') ||
    title.includes('potato curry') ||
    titleBn.includes('আলুর দম') ||
    (title.includes('potato') && !title.includes('egg') && !title.includes('chicken') && !title.includes('fish')) ||
    (titleBn.includes('আলু') && !titleBn.includes('ডিম') && !titleBn.includes('মুরগি') && !titleBn.includes('মাছ'))
  ) {
    return '/images/bengali-dum-aloo.jpg';
  }

  // 9. Egg Dishes — Distinct images for Omelette, Bhurji, Bhuna, Curry
  if (title.includes('omelet') || title.includes('omelette') || titleBn.includes('অমলেট')) {
    return '/images/masala-egg-omelette.jpg';
  }
  if (
    title.includes('bhurji') ||
    titleBn.includes('ভুর্জি') ||
    titleBn.includes('ভুরজি') ||
    title.includes('dim bhaji') ||
    titleBn.includes('ডিম ভাজি') ||
    title.includes('egg bhurji') ||
    title.includes('egg fry') ||
    title.includes('scrambled') ||
    (title.includes('egg') && title.includes('tomato') && !title.includes('curry')) ||
    (titleBn.includes('ডিম') && titleBn.includes('টমেটো') && !titleBn.includes('কারি') && !titleBn.includes('ঝোল'))
  ) {
    return '/images/tomato-egg-bhurji.jpg';
  }
  if (
    title.includes('egg potato bhuna') ||
    title.includes('egg bhuna') ||
    title.includes('dim bhuna') ||
    title.includes('dim alur bhuna') ||
    titleBn.includes('ডিম আলুর ভুনা') ||
    titleBn.includes('ডিম ভুনা')
  ) {
    return '/images/egg-potato-bhuna.jpg';
  }
  if (title.includes('egg') || title.includes('dim') || titleBn.includes('ডিম')) {
    return '/images/bengali-egg-curry.jpg';
  }

  // 10. Tomato Dishes (without meat/egg)
  if (title.includes('tomato soup') || titleBn.includes('টমেটো স্যুপ')) {
    return '/images/roasted-tomato-soup.jpg';
  }
  if (
    title.includes('tomato chutney') ||
    title.includes('tomato tok') ||
    titleBn.includes('টমেটো চাটনি') ||
    titleBn.includes('টমেটোর চাটনি') ||
    titleBn.includes('টমেটোর টক')
  ) {
    return '/images/bengali-tomato-chutney.jpg';
  }
  if (
    title.includes('tomato bhorta') ||
    titleBn.includes('টমেটো ভর্তা') ||
    (title.includes('tomato') && !title.includes('fish') && !title.includes('chicken') && !title.includes('dal')) ||
    (titleBn.includes('টমেটো') && !titleBn.includes('মাছ') && !titleBn.includes('মুরগি') && !titleBn.includes('ডাল'))
  ) {
    return '/images/tomato-bhorta-chutney.jpg';
  }

  // 11. Vegetable Fried Rice / Fried Rice
  if (
    title.includes('fried rice') ||
    titleBn.includes('ফ্রাইড রাইস') ||
    title.includes('veg fried rice') ||
    title.includes('vegetable fried rice') ||
    titleBn.includes('সবজি ফ্রাইড রাইস')
  ) {
    return '/images/vegetable-fried-rice.jpg';
  }

  // 12. Chicken Biryani / Dum Biryani / Kacchi / Polao
  if (
    title.includes('biryani') ||
    title.includes('biriyani') ||
    title.includes('kacchi') ||
    titleBn.includes('বিরিয়ানি') ||
    titleBn.includes('বিরিয়ানি') ||
    titleBn.includes('কাচ্চি')
  ) {
    return '/images/chicken-biryani.jpg';
  }

  // 13. Khichuri
  if (
    title.includes('khichuri') ||
    title.includes('khichdi') ||
    titleBn.includes('খিচুড়ি') ||
    titleBn.includes('খিচুড়ি')
  ) {
    return '/images/vegetable-khichuri.jpg';
  }

  // 14. Shorshe Ilish / Mustard Hilsa
  if (
    title.includes('ilish') ||
    title.includes('hilsa') ||
    titleBn.includes('ইলিশ') ||
    title.includes('shorshe ilish') ||
    titleBn.includes('সর্ষে ইলিশ') ||
    titleBn.includes('সরিষা ইলিশ') ||
    title.includes('mustard fish')
  ) {
    return '/images/shorshe-ilish.jpg';
  }

  // 15. Tomato Fish Bhuna
  if (
    (title.includes('fish') && title.includes('tomato')) ||
    (titleBn.includes('মাছ') && titleBn.includes('টমেটো')) ||
    title.includes('fish bhuna') ||
    title.includes('tomato fish')
  ) {
    return '/images/tomato-fish-bhuna.jpg';
  }

  // 16. Fish Curry / Macher Jhol / Fish Fry
  if (title.includes('fish') || title.includes('macher') || titleBn.includes('মাছ')) {
    return '/images/bengali-fish-curry.jpg';
  }

  // 17. Chicken Curry / Murgir Jhol / Chicken Bhuna (only when NOT noodles/ramen/pizza/sandwich/burger/fries/salad)
  const isDistinctNonCurryWesternOrAsian =
    title.includes('pizza') ||
    titleBn.includes('পিজ্জা') ||
    titleBn.includes('পিৎজা') ||
    title.includes('noodle') ||
    title.includes('ramen') ||
    title.includes('chow mein') ||
    title.includes('pad thai') ||
    title.includes('udon') ||
    title.includes('laksa') ||
    title.includes('sandwich') ||
    title.includes('burger') ||
    title.includes('salad') ||
    title.includes('fries') ||
    title.includes('wedges');
  if (!isDistinctNonCurryWesternOrAsian && (title.includes('chicken') || title.includes('murgi') || titleBn.includes('মুরগি') || titleBn.includes('চিকেন'))) {
    return '/images/bengali-chicken-curry.jpg';
  }

  // 18. Dal / Lentil Tadka (fallback only if not already handled above)
  if (title.includes('dal') || title.includes('lentil') || titleBn.includes('ডাল') || title.includes('tadka') || title.includes('daal')) {
    return '/images/lentil-tadka-dal.jpg';
  }

  // 19. Nepali Momos
  if (title.includes('momo') || titleBn.includes('মোমো') || title.includes('dumpling') || cuisine.includes('nepali')) {
    return '/images/nepali-steamed-momos.jpg';
  }

  // 20. Ramen & Noodles
  if (title.includes('ramen') || titleBn.includes('রামেন')) {
    return '/images/japanese-miso-ramen.jpg';
  }
  if (title.includes('noodle') || title.includes('chow mein') || titleBn.includes('নুডুলস') || titleBn.includes('চাওমিন')) {
    return '/images/hakka-stir-fry-noodles.jpg';
  }

  // 21. Vegetable Soup / Broth
  if (title.includes('soup') || title.includes('broth') || titleBn.includes('স্যুপ')) {
    return '/images/garden-vegetable-soup.jpg';
  }

  // 22. Japanese Sushi
  if (title.includes('sushi') || title.includes('maki') || titleBn.includes('সুশি') || cuisine.includes('japanese')) {
    return '/images/japanese-salmon-sushi.jpg';
  }

  // 23. Pizza Varieties (distinct photo per pizza flavor)
  if (title.includes('pizza') || titleBn.includes('পিজ্জা') || titleBn.includes('পিৎজা') || title.includes('margherita')) {
    if (title.includes('bangladesh') || title.includes('tandoori') || title.includes('deshi') || titleBn.includes('বাংলাদেশি') || titleBn.includes('তন্দুরি')) {
      return '/images/bangladeshi-tandoori-pizza.jpg';
    }
    if (title.includes('paneer') || title.includes('indian') || title.includes('tikka') || titleBn.includes('ইন্ডিয়ান') || titleBn.includes('পনির')) {
      return '/images/indian-paneer-tikka-pizza.jpg';
    }
    if (title.includes('teriyaki') || title.includes('japanese') || titleBn.includes('জাপানি') || titleBn.includes('তেরিয়াকি')) {
      return '/images/japanese-teriyaki-pizza.jpg';
    }
    if (title.includes('new york') || title.includes('american') || title.includes('usa') || titleBn.includes('নিউ ইয়র্ক') || titleBn.includes('আমেরিকান')) {
      return '/images/ny-style-pizza.jpg';
    }
    if (title.includes('chicken') || titleBn.includes('চিকেন') || titleBn.includes('মুরগি')) {
      return '/images/chicken-mozzarella-pizza.jpg';
    }
    if (title.includes('vegetable') || title.includes('veggie') || title.includes('vegetarian') || titleBn.includes('সবজি') || titleBn.includes('ভেজিটেবল')) {
      return '/images/roasted-vegetable-pizza.jpg';
    }
    return '/images/italian-margherita-pizza.jpg';
  }

  // 23. Onion Curry / Onion Bhorta
  if (title.includes('onion') || title.includes('peyaj') || titleBn.includes('পেঁয়াজ') || titleBn.includes('পেঁয়াজ')) {
    return '/images/tomato-bhorta-chutney.jpg';
  }

  // 24. Steamed Rice / Plain Rice / Ghee Bhat / Bhaja Bhat / Panta Bhat
  if (title.includes('bhaja bhat') || title.includes('pan-fried rice') || titleBn.includes('ভাজা ভাত')) {
    return '/images/bengali-bhaja-bhat.jpg';
  }
  if (title.includes('ghee bhat') || title.includes('ghee rice') || titleBn.includes('ঘি ভাত')) {
    return '/images/bengali-ghee-bhat.jpg';
  }
  if (
    title.includes('steamed rice') ||
    title.includes('white rice') ||
    title.includes('plain rice') ||
    title.includes('panta bhat') ||
    title.includes('steamed fragrant') ||
    titleBn.includes('সাদা ভাত') ||
    titleBn.includes('পান্তা ভাত') ||
    titleBn.includes('সুগন্ধি ভাত') ||
    title.includes('rice') ||
    titleBn.includes('ভাত')
  ) {
    return '/images/steamed-fragrant-rice.jpg';
  }

  if (candidateUrl && !candidateUrl.includes('placeholder') && candidateUrl.startsWith('http')) {
    return candidateUrl;
  }

  return '/images/food-placeholder.jpg';
}

/**
 * Guarantees that no two recipes in the same rendered list ever share the same base image path.
 * If an unexpected duplicate occurs, falls back to the neutral food placeholder rather than reusing another dish's photo.
 */
export function enforceUniqueRecipeImages<T extends RecipeImageInput>(recipes: T[]): T[] {
  const usedBaseUrls = new Set<string>();
  return recipes.map((r) => {
    const resolved = resolveRecipeImage({ ...r, image: undefined, imageUrl: undefined });
    const baseUrl = resolved.split('?')[0];
    if (baseUrl !== '/images/food-placeholder.jpg' && !usedBaseUrls.has(baseUrl)) {
      usedBaseUrls.add(baseUrl);
      return { ...r, image: resolved, imageUrl: resolved };
    }
    const fallbackUrl =
      !r.imageUrl || r.imageUrl.includes('placeholder') || usedBaseUrls.has(r.imageUrl.split('?')[0])
        ? '/images/food-placeholder.jpg'
        : r.imageUrl;
    if (fallbackUrl !== '/images/food-placeholder.jpg') {
      usedBaseUrls.add(fallbackUrl.split('?')[0]);
    }
    return { ...r, image: fallbackUrl, imageUrl: fallbackUrl };
  });
}

