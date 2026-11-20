/**
 * Shared Bilingual Recipe, Ingredient & Unit Translator (EN -> BN)
 * Works seamlessly on both Client (React) and Server (Node.js) to ensure
 * every recipe's ingredients, measurements, units, cuisines, and categories
 * display cleanly in natural Bangla when Bangla language is selected.
 */

const UNIT_BN_MAP: Record<string, string> = {
  tbsp: 'টেবিল চামচ',
  tablespoon: 'টেবিল চামচ',
  tablespoons: 'টেবিল চামচ',
  tbs: 'টেবিল চামচ',
  tsp: 'চা চামচ',
  teaspoon: 'চা চামচ',
  teaspoons: 'চা চামচ',
  cup: 'কাপ',
  cups: 'কাপ',
  g: 'গ্রাম',
  gm: 'গ্রাম',
  gms: 'গ্রাম',
  gram: 'গ্রাম',
  grams: 'গ্রাম',
  kg: 'কেজি',
  kgs: 'কেজি',
  kilogram: 'কেজি',
  kilograms: 'কেজি',
  ml: 'মিলি',
  milliliter: 'মিলি',
  milliliters: 'মিলি',
  l: 'লিটার',
  liter: 'লিটার',
  liters: 'লিটার',
  litre: 'লিটার',
  litres: 'লিটার',
  oz: 'আউন্স',
  ounce: 'আউন্স',
  ounces: 'আউন্স',
  lb: 'পাউন্ড',
  lbs: 'পাউন্ড',
  pound: 'পাউন্ড',
  pounds: 'পাউন্ড',
  pc: 'টি',
  pcs: 'টি',
  piece: 'টুকরো',
  pieces: 'টুকরো',
  slice: 'টুকরো',
  slices: 'টুকরো',
  clove: 'কোয়া',
  cloves: 'কোয়া',
  pinch: 'এক চিমটি',
  pinches: 'চিমটি',
  handful: 'এক মুঠো',
  handfuls: 'মুঠো',
  bunch: 'আঁটি',
  bunches: 'আঁটি',
  can: 'ক্যান',
  cans: 'ক্যান',
  tin: 'টিন',
  tins: 'টিন',
  dash: 'সামান্য',
  drop: 'ফোঁটা',
  drops: 'ফোঁটা',
  stick: 'টুকরা',
  sticks: 'টুকরা',
  sprig: 'ডাঁটা',
  sprigs: 'ডাঁটা',
  leaf: 'পাতা',
  leaves: 'পাতা',
  fillet: 'ফিলে',
  fillets: 'ফিলে',
  packet: 'প্যাকেট',
  packets: 'প্যাকেট',
  pack: 'প্যাকেট',
  packs: 'প্যাকেট',
  bottle: 'বোতল',
  jar: 'জার',
  box: 'বক্স',
  bag: 'ব্যাগ',
  bowl: 'বাটি',
  serving: 'পরিবেশন',
  servings: 'পরিবেশন',
  portion: 'পরিমাণমতো',
  portions: 'পরিমাণমতো',
  small: 'ছোট',
  medium: 'মাঝারি',
  large: 'বড়',
  whole: 'আস্ত',
  half: 'অর্ধেক',
  quarter: 'এক-চতুর্থাংশ',
  inch: 'ইঞ্চি',
  inches: 'ইঞ্চি',
  'to taste': 'স্বাদমতো',
  'as needed': 'প্রয়োজনমতো',
  garnish: 'সাজানোর জন্য',
  'for garnish': 'সাজানোর জন্য',
  splash: 'সামান্য',
  drizzle: 'সামান্য',
  knob: 'সামান্য',
  head: 'আস্ত',
  stalk: 'ডাঁটা',
  stalks: 'ডাঁটা',
  rib: 'ডাঁটা',
  ribs: 'ডাঁটা',
  sheet: 'শিট',
  sheets: 'শিট',
  strip: 'টুকরা',
  strips: 'টুকরা',
  finely: 'মিহি',
  thinly: 'পাতলা',
  roughly: 'বড়',
  chopped: 'কুচানো',
  sliced: 'ফালি করা',
  minced: 'মিহি কুচি',
  diced: 'কিউব করা',
  crushed: 'থেঁতো করা',
  grated: 'গ্রেট করা',
  beaten: 'ফেটানো',
  whisked: 'ফেটানো',
  melted: 'গলানো',
  softened: 'নরম করা',
  peeled: 'খোসা ছাড়ানো',
  fresh: 'তাজা',
  dried: 'শুকনো',
};

const EXACT_INGREDIENT_BN_MAP: Record<string, string> = {
  // Proteins, Poultry & Meat
  chicken: 'মুরগির মাংস',
  'chicken breast': 'মুরগির বুকের মাংস',
  'chicken breasts': 'মুরগির বুকের মাংস',
  'boneless chicken': 'হাড়ছাড়া মুরগির মাংস',
  'boneless skinless chicken breasts': 'হাড়ছাড়া মুরগির বুকের মাংস',
  'chicken thigh': 'মুরগির থাইয়ের মাংস',
  'chicken thighs': 'মুরগির থাইয়ের মাংস',
  'chicken drumsticks': 'মুরগির লেগ পিস',
  'chicken wings': 'মুরগির উইংস',
  'chicken stock': 'চিকেন স্টক',
  'chicken broth': 'চিকেন ব্রথ',
  beef: 'গরুর মাংস',
  'ground beef': 'গরুর মাংসের কিমা',
  'minced beef': 'গরুর মাংসের কিমা',
  steak: 'বিফ স্টেক',
  lamb: 'ভেড়ার / খাসির মাংস',
  mutton: 'খাসির মাংস',
  goat: 'খাসির মাংস',
  bacon: 'বেকন',
  turkey: 'টার্কি মাংস',
  duck: 'হাঁসের মাংস',
  egg: 'ডিম',
  eggs: 'ডিম',
  'boiled egg': 'সেদ্ধ ডিম',
  'boiled eggs': 'সেদ্ধ ডিম',
  'egg yolk': 'ডিমের কুসুম',
  'egg white': 'ডিমের সাদা অংশ',

  // Fish & Seafood
  fish: 'মাছ',
  'fish fillet': 'মাছের ফিলে',
  'fish fillets': 'মাছের ফিলে',
  hilsa: 'ইলিশ মাছ',
  ilish: 'ইলিশ মাছ',
  salmon: 'সালমন মাছ',
  'salmon fillet': 'সালমন মাছের ফিলে',
  tuna: 'টুনা মাছ',
  cod: 'কড মাছ',
  mackerel: 'ম্যাকেরেল মাছ',
  shrimp: 'চিংড়ি মাছ',
  shrimps: 'চিংড়ি মাছ',
  prawn: 'চিংড়ি মাছ',
  prawns: 'চিংড়ি মাছ',
  'king prawns': 'বড় গলদা চিংড়ি',
  crab: 'কাঁকড়া',
  squid: 'স্কুইড',
  mussels: 'ঝিনুক',
  seafood: 'সামুদ্রিক মাছ',

  // Vegetables & Leafy Greens
  potato: 'আলু',
  potatoes: 'আলু',
  'baby potatoes': 'ছোট আলু',
  'sweet potato': 'মিষ্টি আলু',
  'sweet potatoes': 'মিষ্টি আলু',
  tomato: 'টমেটো',
  tomatoes: 'টমেটো',
  'cherry tomatoes': 'চেরি টমেটো',
  'plum tomatoes': 'পাকা টমেটো',
  'chopped tomatoes': 'টমেটো কুচি',
  'crushed tomatoes': 'টমেটো পেস্ট',
  'tomato puree': 'টমেটো পিউরি',
  'tomato paste': 'টমেটো পেস্ট',
  'tomato sauce': 'টমেটো সস',
  onion: 'পেঁয়াজ',
  onions: 'পেঁয়াজ',
  'red onion': 'লাল পেঁয়াজ',
  'red onions': 'লাল পেঁয়াজ',
  'spring onion': 'পেঁয়াজ পাতা',
  'spring onions': 'পেঁয়াজ পাতা',
  scallion: 'পেঁয়াজ পাতা',
  scallions: 'পেঁয়াজ পাতা',
  shallot: 'ছোট পেঁয়াজ',
  shallots: 'ছোট পেঁয়াজ',
  garlic: 'রসুন',
  'garlic clove': 'রসুনের কোয়া',
  'garlic cloves': 'রসুনের কোয়া',
  'minced garlic': 'রসুন কুচি',
  'garlic powder': 'রসুন গুঁড়ো',
  ginger: 'আদা',
  'fresh ginger': 'তাজা আদা',
  'ginger paste': 'আদা বাটা',
  'ginger-garlic paste': 'আদা-রসুন বাটা',
  spinach: 'পালং শাক',
  'baby spinach': 'কচি পালং শাক',
  shak: 'শাক',
  'lal shaak': 'লাল শাক',
  cabbage: 'বাঁধাকপি',
  'red cabbage': 'লাল বাঁধাকপি',
  cauliflower: 'ফুলকপি',
  pumpkin: 'মিষ্টি কুমড়া',
  carrot: 'গাজর',
  carrots: 'গাজর',
  peas: 'মটরশুঁটি',
  'green peas': 'সবুজ মটরশুঁটি',
  'snow peas': 'স্নো পি',
  corn: 'ভুট্টা',
  'sweet corn': 'মিষ্টি ভুট্টা',
  cucumber: 'শসা',
  'bell pepper': 'ক্যাপসিকাম',
  'bell peppers': 'ক্যাপসিকাম',
  'red pepper': 'লাল ক্যাপসিকাম',
  'green pepper': 'সবুজ ক্যাপসিকাম',
  capsicum: 'ক্যাপসিকাম',
  broccoli: 'ব্রকলি',
  mushroom: 'মাশরুম',
  mushrooms: 'মাশরুম',
  eggplant: 'বেগুন',
  aubergine: 'বেগুন',
  zucchini: 'জুকিনি',
  courgette: 'জুকিনি',
  celery: 'সেলেরি পাতা',
  lettuce: 'লেটুস পাতা',
  kale: 'কেল পাতা',
  beans: 'শিম / বরবটি',
  'green beans': 'সবুজ বরবটি',
  'bean sprouts': 'বিন স্প্রাউট',
  okra: 'ঢ্যাঁড়স',
  avocado: 'অ্যাভোকাডো',
  radish: 'মুলা',
  beetroot: 'বিট',
  peas_corn: 'মটরশুঁটি ও ভুট্টা',
  chili: 'মরিচ',
  chilies: 'মরিচ',
  chilli: 'মরিচ',
  chillies: 'মরিচ',
  'green chili': 'কাঁচা মরিচ',
  'green chilies': 'কাঁচা মরিচ',
  'green chilli': 'কাঁচা মরিচ',
  'green chillies': 'কাঁচা মরিচ',
  'red chili': 'শুকনা লাল মরিচ',
  'red chilies': 'লাল মরিচ',
  'dry red chili': 'শুকনা লাল মরিচ',
  'dried red chilies': 'শুকনা লাল মরিচ',
  'chili powder': 'মরিচ গুঁড়ো',
  'chilli powder': 'মরিচ গুঁড়ো',
  'red chili powder': 'লাল মরিচ গুঁড়ো',
  'chili flakes': 'চিলি ফ্লেক্স',
  jalapeno: 'জালাপেনো মরিচ',
  lemon: 'লেবু',
  'lemon juice': 'লেবুর রস',
  lime: 'কাগজি লেবু',
  'lime juice': 'লেবুর রস',

  // Herbs & Spices
  coriander: 'ধনেপাতা / ধনে',
  'coriander leaves': 'তাজা ধনেপাতা',
  'fresh coriander': 'তাজা ধনেপাতা',
  cilantro: 'ধনেপাতা',
  'coriander powder': 'ধনে গুঁড়ো',
  parsley: 'পার্সলে পাতা',
  basil: 'বেসিল পাতা',
  'fresh basil': 'তাজা বেসিল পাতা',
  mint: 'পুদিনা পাতা',
  thyme: 'থাইম পাতা',
  oregano: 'ওরিগ্যানো',
  rosemary: 'রোজমেরি',
  'bay leaf': 'তেজপাতা',
  'bay leaves': 'তেজপাতা',
  'curry leaves': 'কারিপাতা',
  lemongrass: 'লেমনগ্রাস',
  turmeric: 'হলুদ',
  'turmeric powder': 'হলুদ গুঁড়ো',
  cumin: 'জিরা',
  'cumin seeds': 'গোটা জিরা',
  'cumin powder': 'জিরা গুঁড়ো',
  'ground cumin': 'জিরা গুঁড়ো',
  'garam masala': 'গরম মসলা',
  cardamom: 'এলাচ',
  'green cardamom': 'ছোট এলাচ',
  cinnamon: 'দারুচিনি',
  'cinnamon stick': 'দারুচিনির টুকরা',
  cloves: 'লবঙ্গ',
  nutmeg: 'জায়ফল',
  paprika: 'প্যাপরিকা গুঁড়ো',
  'smoked paprika': 'স্মোকড প্যাপরিকা',
  'cayenne pepper': 'কেয়েন মরিচ গুঁড়ো',
  'black pepper': 'কালো গোলমরিচ',
  'white pepper': 'সাদা গোলমরিচ',
  pepper: 'গোলমরিচ',
  salt: 'লবণ',
  'sea salt': 'সামুদ্রিক লবণ',
  mustard: 'সরিষা',
  'mustard seeds': 'সরিষা দানা',
  'nigella seeds': 'কালোজিরা',
  'panch phoron': 'পাঁচফোড়ন',
  'sesame seeds': 'তিল',
  saffron: 'জাফরান',
  star_anise: 'স্টার অ্যানিস',
  'star anise': 'স্টার অ্যানিস',
  fenugreek: 'মেথি',

  // Grains, Rice, Pasta & Noodles
  rice: 'চাল / ভাত',
  'white rice': 'সাদা চাল',
  'basmati rice': 'বাসমতী চাল',
  'jasmine rice': 'জেসমিন চাল',
  'cooked rice': 'রান্না করা ভাত',
  'sushi rice': 'সুশি চাল',
  noodles: 'নুডুলস',
  'egg noodles': 'এগ নুডুলস',
  'rice noodles': 'রাইস নুডুলস',
  'ramen noodles': 'রামেন নুডুলস',
  'udon noodles': 'উডন নুডুলস',
  'glass noodles': 'গ্লাস নুডুলস',
  pasta: 'পাস্তা',
  spaghetti: 'স্প্যাগেটি পাস্তা',
  penne: 'পেনে পাস্তা',
  fettuccine: 'ফেটুচিনি পাস্তা',
  macaroni: 'ম্যাকারনি পাস্তা',
  lasagne: 'লাজানিয়া শিট',
  flour: 'ময়দা / আটা',
  'all-purpose flour': 'ময়দা',
  'plain flour': 'ময়দা',
  'wheat flour': 'গমের আটা',
  cornflour: 'কর্নফ্লাওয়ার',
  cornstarch: 'কর্নস্টার্চ',
  bread: 'পাউরুটি',
  breadcrumbs: 'ব্রেডক্রাম্বস',
  oats: 'ওটস',
  quinoa: 'কিনোয়া',
  tortilla: 'টর্টিলা রুটি',
  pastry: 'পেস্ট্রি ডো',
  'pizza dough': 'পিজ্জা ডো',

  // Lentils & Legumes
  lentils: 'মসুর ডাল',
  'red lentils': 'মসুর ডাল',
  'red lentils (masoor dal)': 'মসুর ডাল',
  dal: 'ডাল',
  chickpeas: 'ছোলা / কাবুলি বুট',
  'kidney beans': 'রাজমা / শিমের বিচি',
  'black beans': 'কালো শিমের বিচি',
  tofu: 'টোফু',
  peanuts: 'চিনাবাদাম',
  cashews: 'কাজুবাদাম',
  almonds: 'কাঠবাদাম',
  walnuts: 'আখরোট',

  // Dairy, Oils & Fats
  oil: 'রান্নার তেল',
  'vegetable oil': 'সয়াবিন / উদ্ভিজ্জ তেল',
  'olive oil': 'অলিভ অয়েল',
  'extra virgin olive oil': 'খাঁটি অলিভ অয়েল',
  'mustard oil': 'খাঁটি সরিষার তেল',
  'sesame oil': 'তিলের তেল',
  'coconut oil': 'নারকেল তেল',
  'sunflower oil': 'সূর্যমুখী তেল',
  butter: 'মাখন',
  'unsalted butter': 'লবণহীন মাখন',
  ghee: 'খাঁটি ঘি',
  milk: 'তরল দুধ',
  'whole milk': 'ফুল ক্রিম দুধ',
  'coconut milk': 'নারকেলের দুধ',
  cream: 'ক্রিম',
  'heavy cream': 'হেভি ক্রিম',
  'double cream': 'ডাবল ক্রিম',
  'sour cream': 'সাওয়ার ক্রিম',
  yogurt: 'টক দই',
  'plain yogurt': 'টক দই',
  'greek yogurt': 'গ্রিক ইয়োগার্ট',
  cheese: 'চিজ / পনির',
  'cheddar cheese': 'চেডার চিজ',
  'mozzarella cheese': 'মোজারেলা চিজ',
  mozzarella: 'মোজারেলা চিজ',
  'parmesan cheese': 'পারমেসান চিজ',
  parmesan: 'পারমেসান চিজ',
  paneer: 'পনির',
  'feta cheese': 'ফেটা চিজ',

  // Sauces, Condiments & Sweeteners
  'soy sauce': 'সয়া সস',
  'light soy sauce': 'লাইট সয়া সস',
  'dark soy sauce': 'ডার্ক সয়া সস',
  'fish sauce': 'ফিশ সস',
  'oyster sauce': 'অয়েস্টার সস',
  'worcestershire sauce': 'ওরচেস্টারশায়ার সস',
  'hot sauce': 'হট সস',
  'chili sauce': 'চিলি সস',
  ketchup: 'টমেটো কেচাপ',
  mayonnaise: 'মেয়োনিজ',
  vinegar: 'ভিনেগার',
  'rice vinegar': 'রাইস ভিনেগার',
  mirin: 'মিরিন (মিষ্টি রাইস ভিনেগার)',
  'apple cider vinegar': 'অ্যাপল সিডার ভিনেগার',
  'balsamic vinegar': 'বালসামিক ভিনেগার',
  sugar: 'চিনি',
  'brown sugar': 'ব্রাউন সুগার',
  honey: 'মধু',
  'maple syrup': 'ম্যাপল সিরাপ',
  water: 'পানি',
  'warm water': 'হালকা গরম পানি',
  'vegetable stock': 'সবজির স্টক',
  'vegetable broth': 'সবজির স্টক',
  'beef stock': 'বিফ স্টক',
  'curry powder': 'কারি পাউডার',
  'curry paste': 'কারি পেস্ট',
  'red curry paste': 'রেড কারি পেস্ট',
  'miso paste': 'মিসো পেস্ট',
  yeast: 'ইস্ট',
  'baking powder': 'বেকিং পাউডার',
  'baking soda': 'বেকিং সোডা',
  vanilla: 'ভ্যানিলা এসেন্স',
  'vanilla extract': 'ভ্যানিলা এসেন্স',
  nori: 'নরি সি-উইড শিট',
  wasabi: 'ওয়াসাবি',
};

const PREP_MODIFIER_MAP: Array<[RegExp, string]> = [
  [/\bfinely chopped\b/gi, 'মিহি কুচানো'],
  [/\broughly chopped\b/gi, 'বড় টুকরো করা'],
  [/\bchopped\b/gi, 'কুচানো'],
  [/\bsliced\b/gi, 'ফালি করা'],
  [/\bthinly sliced\b/gi, 'পাতলা ফালি করা'],
  [/\bdiced\b/gi, 'কিউব করা'],
  [/\bminced\b/gi, 'মিহি কুচি'],
  [/\bcrushed\b/gi, 'থেঁতো করা'],
  [/\bgrated\b/gi, 'গ্রেট করা'],
  [/\bshredded\b/gi, 'কুচানো'],
  [/\bpeeled\b/gi, 'খোসা ছাড়ানো'],
  [/\bfresh\b/gi, 'তাজা'],
  [/\bdried\b/gi, 'শুকনো'],
  [/\bboiled\b/gi, 'সেদ্ধ'],
  [/\bcooked\b/gi, 'রান্না করা'],
  [/\broasted\b/gi, 'ভাজা'],
  [/\btoasted\b/gi, 'টেলে নেওয়া'],
  [/\bground\b/gi, 'গুঁড়ো'],
  [/\bboneless\b/gi, 'হাড়ছাড়া'],
  [/\bskinless\b/gi, 'চামড়া ছাড়ানো'],
  [/\braw\b/gi, 'কাঁচা'],
  [/\blarge\b/gi, 'বড়'],
  [/\bmedium\b/gi, 'মাঝারি'],
  [/\bsmall\b/gi, 'ছোট'],
  [/\bwarm\b/gi, 'হালকা গরম'],
  [/\bcold\b/gi, 'ঠান্ডা'],
];

const CUISINE_BN_MAP: Record<string, string> = {
  bangladeshi: 'বাংলাদেশি',
  bengali: 'বাঙালি',
  indian: 'ভারতীয়',
  chinese: 'চাইনিজ',
  japanese: 'জাপানি',
  korean: 'কোরিয়ান',
  italian: 'ইতালীয়',
  thai: 'থাই',
  mexican: 'মেক্সিকান',
  mediterranean: 'ভূমধ্যসাগরীয়',
  nepali: 'নেপালি',
  american: 'আমেরিকান',
  british: 'ব্রিটিশ',
  french: 'ফরাসি',
  spanish: 'স্প্যানিশ',
  turkish: 'তুর্কি',
  malaysian: 'মালয়েশিয়ান',
  vietnamese: 'ভিয়েতনামি',
  greek: 'গ্রিক',
  moroccan: 'মরক্কান',
  irish: 'আইরিশ',
  canadian: 'কানাডিয়ান',
  dutch: 'ডাচ',
  jamaican: 'জ্যামাইকান',
  kenyan: 'কেনিয়ান',
  polish: 'পোলিশ',
  portuguese: 'পর্তুগিজ',
  russian: 'রাশিয়ান',
  filipino: 'ফিলিপিনো',
  international: 'আন্তর্জাতিক',
  unknown: 'আন্তর্জাতিক',
};

const CATEGORY_BN_MAP: Record<string, string> = {
  vegetarian: 'নিরামিষ',
  vegan: 'উদ্ভিজ্জ (ভেগান)',
  seafood: 'সামুদ্রিক মাছ ও সিফুড',
  chicken: 'মুরগির পদ',
  beef: 'গরুর মাংসের পদ',
  lamb: 'খাসির / ভেড়ার পদ',
  pasta: 'পাস্তা ও নুডুলস',
  breakfast: 'সকালের নাস্তা',
  dessert: 'মিষ্টান্ন',
  starter: 'অ্যাপেটাইজার',
  side: 'সাইড ডিশ',
  miscellaneous: 'মিশ্র পদ',
  'main course': 'মূল খাবার',
  'side / vegetarian': 'ভর্তা ও নিরামিষ',
  'vegetarian curry': 'নিরামিষ তরকারি',
  'traditional curry & rice': 'ঐতিহ্যবাহী দেশীয় পদ',
  'global kitchen': 'বিশ্ব রন্ধনশিল্প',
  'global recipe': 'আন্তর্জাতিক রেসিপি',
  'culinary guide': 'রন্ধন নির্দেশিকা',
};

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBanglaDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => BN_DIGITS[Number(d)] || d);
}

export function hasBanglaText(text: string | undefined | null): boolean {
  return Boolean(text && /[\u0980-\u09FF]/.test(text));
}

/**
 * Translates an English culinary unit (tbsp, tsp, cup, g, oz, pcs, etc.) into natural Bangla.
 */
export function translateUnitToBn(unit: string | undefined | null): string {
  const raw = String(unit || '').trim();
  if (!raw) return 'পরিমাণমতো';
  if (hasBanglaText(raw)) return raw;

  const lower = raw.toLowerCase().replace(/[.,]/g, '').trim();
  if (UNIT_BN_MAP[lower]) {
    return UNIT_BN_MAP[lower];
  }

  // Handle compound unit strings like "tbsp chopped", "cloves chopped", "finely sliced"
  const parts = lower.split(/\s+/);
  const translatedParts = parts.map((p) => {
    if (UNIT_BN_MAP[p]) return UNIT_BN_MAP[p];
    if (p === '½' || p === '1/2') return 'অর্ধেক';
    if (p === '¼' || p === '1/4') return '১/৪';
    if (p === '¾' || p === '3/4') return '৩/৪';
    const numUnitMatch = p.match(/^(\d+(?:\.\d+)?)(g|gm|ml|kg|l|oz|lb)$/i);
    if (numUnitMatch) {
      return `${toBanglaDigits(numUnitMatch[1])} ${UNIT_BN_MAP[numUnitMatch[2].toLowerCase()] || numUnitMatch[2]}`;
    }
    return p;
  });

  const joined = translatedParts.join(' ');
  return joined !== lower ? joined : raw;
}

/**
 * Translates an English recipe ingredient name (including modifiers like "Fresh chopped garlic")
 * into natural Bangla using curated culinary dictionaries.
 */
export function translateIngredientToBn(name: string | undefined | null): string {
  const raw = String(name || '').trim();
  if (!raw) return '';
  if (hasBanglaText(raw)) return raw;

  const lower = raw.toLowerCase().replace(/\s+/g, ' ').trim();

  // 1. Direct whole-phrase lookup
  if (EXACT_INGREDIENT_BN_MAP[lower]) {
    return EXACT_INGREDIENT_BN_MAP[lower];
  }

  // 2. Strip trailing parenthetical e.g. "Red lentils (masoor dal)" and check core
  const withoutParens = lower.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
  if (EXACT_INGREDIENT_BN_MAP[withoutParens]) {
    return EXACT_INGREDIENT_BN_MAP[withoutParens];
  }

  // 3. Extract modifiers ("chopped", "fresh", "minced", etc.) and look up remaining core noun
  const detectedModifiers: string[] = [];
  let core = withoutParens;
  for (const [rx, bnMod] of PREP_MODIFIER_MAP) {
    if (rx.test(core)) {
      detectedModifiers.push(bnMod);
      core = core.replace(rx, ' ').replace(/\s+/g, ' ').trim();
    }
  }

  // Clean trailing punctuation like commas or "of"
  core = core.replace(/^[,\s-]+|[,\s-]+$/g, '').replace(/\bof\b/g, '').trim();

  if (core && EXACT_INGREDIENT_BN_MAP[core]) {
    const coreBn = EXACT_INGREDIENT_BN_MAP[core];
    return detectedModifiers.length > 0 ? `${detectedModifiers.join(' ')} ${coreBn}` : coreBn;
  }

  // 4. Check longest matching key substring (e.g. "boneless chicken breast cubes" -> "মুরগির বুকের মাংস")
  let bestKey = '';
  for (const key of Object.keys(EXACT_INGREDIENT_BN_MAP)) {
    if (key.length > bestKey.length && withoutParens.includes(key)) {
      bestKey = key;
    }
  }
  if (bestKey) {
    const baseBn = EXACT_INGREDIENT_BN_MAP[bestKey];
    return detectedModifiers.length > 0 ? `${detectedModifiers.join(' ')} ${baseBn}` : baseBn;
  }

  // 5. Fallback: preserve original ingredient cleanly if no dictionary hit
  return raw;
}

export function translateCuisineToBn(cuisine: string | undefined | null): string {
  const raw = String(cuisine || '').trim();
  if (!raw) return 'আন্তর্জাতিক';
  if (hasBanglaText(raw)) return raw;
  return CUISINE_BN_MAP[raw.toLowerCase()] || raw;
}

export function translateCategoryToBn(category: string | undefined | null): string {
  const raw = String(category || '').trim();
  if (!raw) return 'রেসিপি';
  if (hasBanglaText(raw)) return raw;
  return CATEGORY_BN_MAP[raw.toLowerCase()] || raw;
}

export function translateMealTypeToBn(mealType: string | undefined | null): string {
  const m = String(mealType || '').toLowerCase().trim();
  if (m === 'breakfast') return 'সকালের নাস্তা';
  if (m === 'lunch') return 'দুপুরের খাবার';
  if (m === 'dinner') return 'রাতের খাবার';
  if (m === 'snack') return 'হালকা নাস্তা';
  return mealType || 'মূল খাবার';
}

const COOKING_PHRASE_BN_RULES: Array<[RegExp, string]> = [
  [/\bpreheat(?:\s+the)?\s+oven\s+to\b/gi, 'ওভেন প্রি-হিট করুন'],
  [/\bbring(?:\s+a)?(?:\s+large|\s+medium)?\s+pot\s+of\s+salted\s+water\s+to\s+a\s+boil\b/gi, 'একটি বড় পাত্রে লবণযুক্ত পানি ফুটিয়ে নিন'],
  [/\bbring(?:\s+everything|\s+it)?\s+to\s+(?:the\s+|a\s+)?boil\b/gi, 'বলক আসা পর্যন্ত ফুটিয়ে নিন'],
  [/\bdrain\s+thoroughly\b/gi, 'ভালো করে পানি ঝরিয়ে নিন'],
  [/\bdrain\s+(?:the\s+)?water\b/gi, 'পানি ঝরিয়ে নিন'],
  [/\bdrain\s+and\s+set\s+aside\b/gi, 'পানি ঝরিয়ে একপাশে রাখুন'],
  [/\bset\s+aside\b/gi, 'একপাশে রাখুন'],
  [/\bremove\s+from(?:\s+the)?\s+heat\b/gi, 'চুলা থেকে নামিয়ে নিন'],
  [/\bserve\s+immediately\b/gi, 'সঙ্গে সঙ্গে গরম পরিবেশন করুন'],
  [/\bserve\s+(?:steaming\s+)?hot(?:\s+with)?\b/gi, 'গরম গরম পরিবেশন করুন'],
  [/\bserve\s+warm\b/gi, 'হালকা গরম অবস্থায় পরিবেশন করুন'],
  [/\bgarnish\s+with\b/gi, 'ওপর থেকে সাজিয়ে দিন'],
  [/\bseason\s+with\b/gi, 'স্বাদ অনুযায়ী মেশান'],
  [/\bsalt\s+and\s+(?:black\s+)?pepper(?:\s+to\s+taste)?\b/gi, 'স্বাদমতো লবণ ও গোলমরিচ'],
  [/\bto\s+taste\b/gi, 'স্বাদমতো'],
  [/\buntil\s+golden(?:\s+brown)?\b/gi, 'সোনালি বাদামী হওয়া পর্যন্ত'],
  [/\buntil\s+tender(?:\s+and\s+aromatic)?\b/gi, 'নরম ও সুগন্ধি হওয়া পর্যন্ত'],
  [/\buntil\s+softened\b/gi, 'নরম হওয়া পর্যন্ত'],
  [/\buntil\s+fragrant\b/gi, 'সুগন্ধ বের হওয়া পর্যন্ত'],
  [/\buntil\s+thickened\b/gi, 'ঘন হওয়া পর্যন্ত'],
  [/\buntil\s+cooked\s+through\b/gi, 'সম্পূর্ণ সেদ্ধ ও রান্না হওয়া পর্যন্ত'],
  [/\bfor\s+(\d+(?:\s*[-–]\s*\d+)?)\s+minutes?\s+more\b/gi, 'আরও $1 মিনিট ধরে'],
  [/\bfor\s+(\d+(?:\s*[-–]\s*\d+)?)\s+mins?\s+more\b/gi, 'আরও $1 মিনিট ধরে'],
  [/\bfor\s+(\d+(?:\s*[-–]\s*\d+)?)\s+minutes?\b/gi, '$1 মিনিট ধরে'],
  [/\bfor\s+(\d+(?:\s*[-–]\s*\d+)?)\s+mins?\b/gi, '$1 মিনিট ধরে'],
  [/\bfor\s+(\d+(?:\s*[-–]\s*\d+)?)\s+seconds?\b/gi, '$1 সেকেন্ড ধরে'],
  [/\bfor\s+(\d+(?:\s*[-–]\s*\d+)?)\s+hours?\b/gi, '$1 ঘণ্টা ধরে'],
  [/\bapprox(?:imately)?\.?\s*(\d+)\s+minutes?\b/gi, 'প্রায় $1 মিনিট'],
  [/\bon\s+(?:low|gentle)\s+heat\b/gi, 'মৃদু আঁচে'],
  [/\bon\s+medium(?:-low)?\s+heat\b/gi, 'মাঝারি আঁচে'],
  [/\bon\s+high\s+heat\b/gi, 'বেশি আঁচে'],
  [/\bover\s+medium(?:-high)?\s+heat\b/gi, 'মাঝারি আঁচে'],
  [/\bover\s+low\s+heat\b/gi, 'মৃদু আঁচে'],
  [/\bover\s+high\s+heat\b/gi, 'বেশি আঁচে'],
  [/\bin\s+(?:a\s+)?(?:large|medium|small|heavy(?:-bottomed)?)\s+(?:saucepan|pan|skillet|wok|pot)\b/gi, 'একটি প্যান বা কড়াইতে'],
  [/\bin\s+(?:a\s+)?(?:large|medium|small)\s+(?:jug|bowl|dish)\b/gi, 'একটি পাত্রে বা বাটিতে'],
  [/\bheat\s+(?:the\s+)?oil\b/gi, 'তেল গরম করুন'],
  [/\bheat\s+(?:the\s+)?butter\b/gi, 'মাখন গরম করুন'],
  [/\bstir\s+occasionally\b/gi, 'মাঝে মাঝে নেড়ে দিন'],
  [/\bstir\s+well\b/gi, 'ভালোভাবে নেড়ে মেশান'],
  [/\bstir\s+to\s+combine\b/gi, 'ভালোভাবে নেড়ে মিশিয়ে নিন'],
  [/\bstir-fry\b/gi, 'হালকা আঁচে ভাজুন'],
  [/\bstir(?:\s+in)?\b/gi, 'নেড়ে মিশিয়ে নিন'],
  [/\btip\s+in\b/gi, 'ঢেলে যোগ করুন'],
  [/\bpour\s+into\b/gi, 'ভেতরে ঢেলে দিন'],
  [/\bdissolve\b/gi, 'গুলে মিশিয়ে নিন'],
  [/\bmarinate\b/gi, 'মেরিনেট করে রাখুন'],
  [/\bsaute|sauté\b/gi, 'হালকা ভেজে নিন'],
  [/\bsimmer\b/gi, 'মৃদু আঁচে জ্বাল দিন'],
  [/\bboil\b/gi, 'ফুটিয়ে সেদ্ধ করুন'],
  [/\bboiling\s+water\b/gi, 'ফুটন্ত গরম পানি'],
  [/\bparboil\b/gi, 'আধা-সেদ্ধ করুন'],
  [/\broast\b/gi, 'ভাজুন / রোস্ট করুন'],
  [/\bgrill\b/gi, 'গ্রিল করুন'],
  [/\bbake\b/gi, 'বেক করুন'],
  [/\bsteam\b/gi, 'ভাপে রান্না করুন'],
  [/\bwhisk\b/gi, 'ফেটিয়ে নিন'],
  [/\bmix\s+well\b/gi, 'ভালো করে মিশিয়ে নিন'],
  [/\bmix\b/gi, 'মিশিয়ে নিন'],
  [/\bcombine\b/gi, 'একসাথে মেশান'],
  [/\btoss\b/gi, 'নেড়েচেড়ে মেশান'],
  [/\bfry\b/gi, 'ভেজে নিন'],
  [/\bbrown\b/gi, 'হালকা লালচে করে ভাজুন'],
  [/\bcook\b/gi, 'রান্না করুন'],
  [/\bcover(?:\s+with\s+a\s+lid)?\b/gi, 'ঢাকনা দিয়ে ঢেকে দিন'],
  [/\bslice\b/gi, 'পাতলা ফালি করে কাটুন'],
  [/\bchop\b/gi, 'কুচি করে কাটুন'],
  [/\bdice\b/gi, 'ছোট টুকরো করে কাটুন'],
  [/\bmince\b/gi, 'মিহি কুচি করুন'],
  [/\bpeel\b/gi, 'খোসা ছাড়িয়ে নিন'],
  [/\bwash\s+and\s+rinse\b/gi, 'ভালো করে ধুয়ে পরিষ্কার করুন'],
  [/\brinse\b/gi, 'ধুয়ে নিন'],
  [/\bwash\b/gi, 'ধুয়ে নিন'],
  [/\bsprinkle\b/gi, 'ছড়িয়ে দিন'],
  [/\bdrizzle\b/gi, 'ওপর থেকে ছড়িয়ে দিন'],
  [/\bpour\b/gi, 'ঢেলে দিন'],
  [/\badd\b/gi, 'যোগ করুন'],
  [/\bplace\b/gi, 'রাখুন'],
  [/\bprepare\b/gi, 'প্রস্তুত করুন'],
  [/\btransfer\b/gi, 'নামিয়ে পাত্রে তুলুন'],
  [/\bcut\b/gi, 'কেটে নিন'],
  [/\bmeanwhile\b/gi, 'এদিকে'],
  [/\bfinally\b/gi, 'সবশেষে'],
  [/\bthen\b/gi, 'তারপর'],
  [/\bgently\b/gi, 'আলতো হাতে'],
  [/\bslowly\b/gi, 'ধীরে ধীরে'],
  [/\bgradually\b/gi, 'অল্প অল্প করে'],
  [/\btogether\b/gi, 'একসাথে'],
  [/\bwith\b/gi, 'সাথে'],
  [/\band\b/gi, 'এবং'],
  [/\binto\b/gi, 'ভেতরে'],
  [/\bin\b/gi, 'তে'],
  [/\bover\b/gi, 'ওপরে'],
];

const EXTRA_STEP_VOCAB: Array<[RegExp, string]> = [
  [/\bcoconut\s+milk\b/gi, 'নারকেলের দুধ'],
  [/\bcurry\s+paste\b/gi, 'কারি পেস্ট'],
  [/\bstock\s+cube\b/gi, 'স্টক কিউব'],
  [/\bnoodles\b/gi, 'নুডুলস'],
  [/\bspaghetti\b/gi, 'স্প্যাগেটি'],
  [/\bpasta\b/gi, 'পাস্তা'],
  [/\bramen\b/gi, 'রামেন'],
  [/\brice\b/gi, 'চাল / ভাত'],
  [/\bchicken\b/gi, 'মুরগির মাংস'],
  [/\bbeef\b/gi, 'গরুর মাংস'],
  [/\bprawns?\b/gi, 'চিংড়ি মাছ'],
  [/\bshrimps?\b/gi, 'চিংড়ি মাছ'],
  [/\bfish\b/gi, 'মাছ'],
  [/\beggs?\b/gi, 'ডিম'],
  [/\bpotato(?:es)?\b/gi, 'আলু'],
  [/\btomato(?:es)?\b/gi, 'টমেটো'],
  [/\bonions?\b/gi, 'পেঁয়াজ'],
  [/\bgarlic\b/gi, 'রসুন'],
  [/\bginger\b/gi, 'আদা'],
  [/\bchill?i(?:es)?\b/gi, 'মরিচ'],
  [/\bcoriander\b/gi, 'ধনেপাতা'],
  [/\bturmeric\b/gi, 'হলুদ'],
  [/\bcumin\b/gi, 'জিরা'],
  [/\bsoy\s+sauce\b/gi, 'সয়া সস'],
  [/\bolive\s+oil\b/gi, 'অলিভ অয়েল'],
  [/\bmustard\s+oil\b/gi, 'সরিষার তেল'],
  [/\boil\b/gi, 'তেল'],
  [/\bbutter\b/gi, 'মাখন'],
  [/\bghee\b/gi, 'ঘি'],
  [/\bsalt\b/gi, 'লবণ'],
  [/\bsugar\b/gi, 'চিনি'],
  [/\bwater\b/gi, 'পানি'],
  [/\bbroth\b/gi, 'ব্রথ'],
  [/\bstock\b/gi, 'স্টক'],
  [/\bsauce\b/gi, 'সস'],
  [/\bvegetables?\b/gi, 'সবজি'],
  [/\bmushrooms?\b/gi, 'মাশরুম'],
  [/\bspinach\b/gi, 'পালং শাক'],
  [/\bcabbage\b/gi, 'বাঁধাকপি'],
  [/\bcauliflower\b/gi, 'ফুলকপি'],
  [/\bcheese\b/gi, 'চিজ'],
  [/\bmilk\b/gi, 'দুধ'],
  [/\byogurt\b/gi, 'টক দই'],
  [/\bcream\b/gi, 'ক্রিম'],
  [/\blemon\s+juice\b/gi, 'লেবুর রস'],
  [/\blime\s+juice\b/gi, 'লেবুর রস'],
  [/\bflour\b/gi, 'ময়দা'],
  [/\bsaucepan\b/gi, 'সসপ্যান'],
  [/\bpan\b/gi, 'প্যান'],
  [/\bpot\b/gi, 'পাত্র'],
  [/\bskillet\b/gi, 'কড়াই'],
  [/\bwok\b/gi, 'কড়াই'],
  [/\bbowl\b/gi, 'বাটি'],
  [/\bjug\b/gi, 'জগ বা পাত্র'],
  [/\bplate\b/gi, 'প্লেট'],
  [/\bserving\b/gi, 'পরিবেশনের'],
  [/\bheat\b/gi, 'আঁচ'],
  [/\bmixture\b/gi, 'মিশ্রণ'],
  [/\bingredients\b/gi, 'উপকরণগুলো'],
  [/\bspices\b/gi, 'মসলা'],
  [/\bherbs\b/gi, 'ভেষজ পাতা'],
  [/(\d+)\s*ml\b/gi, '$1 মিলি'],
  [/(\d+)\s*g\b/gi, '$1 গ্রাম'],
];

/**
 * Translates an English cooking instruction step into readable culinary Bangla
 * so every recipe displays reliable Bangla cooking steps even when external DBs
 * or offline mode do not supply pre-translated instructions.
 */
export function translateCookingStepToBn(step: string | undefined | null): string {
  const raw = String(step || '').trim();
  if (!raw) return '';
  if (hasBanglaText(raw)) return raw;

  let out = raw;
  for (const [pattern, replacement] of COOKING_PHRASE_BN_RULES) {
    out = out.replace(pattern, replacement);
  }
  for (const [pattern, replacement] of EXTRA_STEP_VOCAB) {
    out = out.replace(pattern, replacement);
  }

  // Clean common leftover English articles surrounded by Bangla words
  out = out
    .replace(/\b(?:the|a|an|to)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;!?])/g, '$1')
    .trim();

  return toBanglaDigits(out);
}

export function translateCookingStepListToBn(steps: string[] | undefined | null): string[] {
  if (!Array.isArray(steps)) return [];
  return steps.map((s) => translateCookingStepToBn(s)).filter(Boolean);
}

