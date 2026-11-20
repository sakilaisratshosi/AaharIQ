/**
 * Bilingual Search Normalizer for NutriSmart AI
 * Maps English & Bangla search terms, transliterations, and common synonyms
 * e.g., "বিরিয়ানি" = "Biryani", "চিকেন" = "Chicken", "ডিম" = "Egg", "আলু" = "Potato"
 */

// Bengali character normalization (handles NFC composition, nukta variants, and ya-fola representations)
export function normalizeBengaliText(str: string): string {
  return String(str || '')
    .normalize('NFC')
    .replace(/\u09DF/g, '\u09AF') // য় -> য
    .replace(/\u09DC/g, '\u09A1') // ড় -> ড
    .replace(/\u09DD/g, '\u09A2') // ঢ় -> ঢ
    .replace(/\u09CE/g, '\u09A4') // ৎ -> ত
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

interface SynonymMap {
  [key: string]: string[];
}

const BILINGUAL_SYNONYMS: SynonymMap = {
  // Pasta & Italian Dishes
  'pasta': ['pasta', 'penne', 'fettuccine', 'spaghetti', 'macaroni', 'পাস্তা', 'স্প্যাগেটি', 'ম্যাকারনি'],
  'পাস্তা': ['pasta', 'penne', 'fettuccine', 'spaghetti', 'macaroni', 'পাস্তা', 'স্প্যাগেটি'],
  'penne': ['penne', 'pasta', 'পাস্তা'],
  'spaghetti': ['spaghetti', 'pasta', 'পাস্তা', 'স্প্যাগেটি'],
  'fettuccine': ['fettuccine', 'pasta', 'পাস্তা'],

  // Targeted Core Dishes
  'tomato egg bhurji': ['tomato egg bhurji', 'egg bhurji', 'dim bhaji', 'টমেটো এগ ভুর্জি', 'ডিম ভাজি', 'ডিম ভুর্জি'],
  'egg bhurji': ['tomato egg bhurji', 'egg bhurji', 'dim bhaji', 'টমেটো এগ ভুর্জি', 'ডিম ভাজি', 'ডিম ভুর্জি'],
  'dim bhaji': ['tomato egg bhurji', 'egg bhurji', 'dim bhaji', 'টমেটো এগ ভুর্জি', 'ডিম ভাজি', 'ডিম ভুর্জি'],
  'টমেটো এগ ভুর্জি': ['tomato egg bhurji', 'egg bhurji', 'dim bhaji', 'টমেটো এগ ভুর্জি', 'ডিম ভাজি', 'ডিম ভুর্জি'],
  'ডিম ভাজি': ['tomato egg bhurji', 'egg bhurji', 'dim bhaji', 'টমেটো এগ ভুর্জি', 'ডিম ভাজি', 'ডিম ভুর্জি'],
  'chicken biryani': ['chicken biryani', 'dum biryani', 'biryani', 'kacchi', 'চিকেন বিরিয়ানি', 'বিরিয়ানি'],
  'চিকেন বিরিয়ানি': ['chicken biryani', 'dum biryani', 'biryani', 'kacchi', 'চিকেন বিরিয়ানি', 'বিরিয়ানি'],
  'chicken curry': ['chicken curry', 'murgir jhol', 'bengali chicken', 'মুরগির ঝোল', 'মুরগির তরকারি', 'মুরগি', 'চিকেন'],
  'মুরগির ঝোল': ['chicken curry', 'murgir jhol', 'chicken', 'মুরগির ঝোল', 'মুরগির তরকারি', 'মুরগি'],
  'মুরগির তরকারি': ['chicken curry', 'murgir jhol', 'chicken', 'মুরগির ঝোল', 'মুরগির তরকারি', 'মুরগি'],
  'egg curry': ['egg curry', 'dim bhuna', 'bengali egg curry', 'ডিম ভুনা', 'ডিম কারি'],
  'ডিম কারি': ['egg curry', 'dim bhuna', 'bengali egg curry', 'ডিম ভুনা', 'ডিম কারি'],
  'fish curry': ['fish curry', 'macher jhol', 'bengali fish curry', 'মাছের ঝোল', 'মাছের কারি'],
  'macher jhol': ['fish curry', 'fish', 'macher jhol', 'bengali fish curry', 'মাছের ঝোল', 'মাছ'],
  'মাছের ঝোল': ['fish curry', 'macher jhol', 'bengali fish curry', 'মাছের ঝোল', 'মাছ', 'মাছের তরকারি', 'মাছের কারি'],
  'মাছের কারি': ['fish curry', 'fish', 'macher jhol', 'মাছের ঝোল', 'মাছ'],
  'vegetable fried rice': ['vegetable fried rice', 'fried rice', 'veg fried rice', 'ভেজিটেবল ফ্রাইড রাইস', 'ফ্রাইড রাইস'],
  'ভেজিটেবল ফ্রাইড রাইস': ['vegetable fried rice', 'fried rice', 'veg fried rice', 'ভেজিটেবল ফ্রাইড রাইস', 'ফ্রাইড রাইস'],
  'fried rice': ['vegetable fried rice', 'fried rice', 'veg fried rice', 'ভেজিটেবল ফ্রাইড রাইস', 'ফ্রাইড রাইস', 'সবজি ফ্রাইড রাইস', 'রাইস'],
  'ফ্রাইড রাইস': ['vegetable fried rice', 'fried rice', 'veg fried rice', 'ভেজিটেবল ফ্রাইড রাইস', 'ফ্রাইড রাইস'],

  // Biryani & Kacchi
  'biryani': ['biryani', 'biriyani', 'dum biryani', 'kacchi', 'বিরিয়ানি', 'বিরিয়ানি', 'কাচ্চি'],
  'biriyani': ['biryani', 'biriyani', 'dum biryani', 'kacchi', 'বিরিয়ানি', 'বিরিয়ানি'],
  'বিরিয়ানি': ['biryani', 'biriyani', 'dum biryani', 'chicken biryani', 'kacchi', 'বিরিয়ানি', 'বিরিয়ানি', 'চিকেন বিরিয়ানি', 'কাচ্চি'],
  'বিরিয়ানি': ['biryani', 'biriyani', 'dum biryani', 'chicken biryani', 'kacchi', 'বিরিয়ানি', 'বিরিয়ানি', 'চিকেন বিরিয়ানি', 'কাচ্চি'],
  'কাচ্চি': ['kacchi', 'biryani', 'বিরিয়ানি', 'বিরিয়ানি'],

  // Noodles, Ramen, Chow Mein & Asian Stir-Fries
  'noodles': ['noodles', 'noodle', 'ramen', 'hakka noodles', 'chow mein', 'pad thai', 'udon', 'lo mein', 'laksa', 'vermicelli', 'stir-fried noodles', 'soup noodles', 'নুডুলস', 'নুডলস', 'রামেন', 'চাওমিন', 'হাক্কা নুডুলস'],
  'noodle': ['noodles', 'noodle', 'ramen', 'hakka noodles', 'chow mein', 'pad thai', 'udon', 'lo mein', 'laksa', 'নুডুলস', 'রামেন', 'চাওমিন'],
  'নুডুলস': ['noodles', 'noodle', 'ramen', 'hakka noodles', 'chow mein', 'pad thai', 'udon', 'নুডুলস', 'নুডলস', 'রামেন', 'চাওমিন'],
  'নুডলস': ['noodles', 'noodle', 'ramen', 'hakka noodles', 'chow mein', 'pad thai', 'নুডুলস', 'নুডলস', 'রামেন', 'চাওমিন'],
  'ramen': ['ramen', 'noodles', 'soup noodles', 'udon', 'tonkotsu', 'miso ramen', 'রামেন', 'নুডুলস', 'স্যুপ নুডুলস'],
  'রামেন': ['ramen', 'noodles', 'soup noodles', 'রামেন', 'নুডুলস'],
  'chow mein': ['chow mein', 'hakka noodles', 'stir-fried noodles', 'noodles', 'চাওমিন', 'নুডুলস'],
  'চাওমিন': ['chow mein', 'hakka noodles', 'noodles', 'চাওমিন', 'নুডুলস'],
  'hakka': ['hakka noodles', 'chow mein', 'stir-fried noodles', 'noodles', 'হাক্কা নুডুলস'],
  'pad thai': ['pad thai', 'thai noodles', 'rice noodles', 'noodles', 'প্যাড থাই', 'নুডুলস'],

  // Chicken
  'chicken': ['chicken', 'poultry', 'morog', 'murgi', 'chicken curry', 'chicken biryani', 'chicken roast', 'grilled chicken', 'chicken soup', 'chicken pasta', 'chicken sandwich', 'মুরগির মাংস', 'মুরগির ঝোল', 'মুরগির বুকের মাংস', 'চিকেন'],
  'চিকেন': ['chicken', 'poultry', 'morog', 'murgi', 'মুরগির মাংস', 'মুরগির ঝোল', 'চিকেন'],
  'মুরগি': ['chicken', 'poultry', 'morog', 'murgi', 'মুরগির মাংস', 'মুরগির ঝোল', 'চিকেন'],
  'মুরগির': ['chicken', 'poultry', 'morog', 'murgi', 'মুরগির মাংস', 'মুরগির ঝোল', 'চিকেন'],
  'মুরগির মাংস': ['chicken', 'poultry', 'morog', 'murgi', 'মুরগির মাংস', 'মুরগির ঝোল', 'চিকেন'],
  'মোরগ': ['chicken', 'morog', 'polao', 'মুরগির মাংস', 'মোরগ'],

  // Beef, Mutton & Meat
  'beef': ['beef', 'steak', 'meat', 'গরু', 'গরুর মাংস', 'বিফ'],
  'গরু': ['beef', 'meat', 'গরু', 'গরুর মাংস', 'বিফ'],
  'গরুর মাংস': ['beef', 'meat', 'গরু', 'গরুর মাংস', 'বিফ'],
  'mutton': ['mutton', 'lamb', 'goat', 'kacchi', 'খাসি', 'খাসির মাংস'],
  'lamb': ['lamb', 'mutton', 'খাসি', 'ভেড়া'],
  'খাসি': ['mutton', 'lamb', 'খাসি', 'খাসির মাংস'],

  // Egg
  'egg': ['egg', 'eggs', 'egg curry', 'boiled egg', 'poached', 'shakshuka', 'omelette', 'omelet', 'frittata', 'ডিম', 'ডিমের', 'ডিম ভুনা', 'ডিম কারি', 'ডিম ভুর্জি', 'অমলেট'],
  'eggs': ['egg', 'eggs', 'egg curry', 'boiled egg', 'poached', 'shakshuka', 'omelette', 'ডিম', 'ডিমের', 'ডিম ভুনা', 'ডিম কারি', 'ডিম ভুর্জি'],
  'ডিম': ['egg', 'eggs', 'egg curry', 'shakshuka', 'omelette', 'ডিম', 'ডিমের', 'ডিম ভুনা', 'ডিম কারি', 'ডিমের কোরমা', 'ডিম ভুর্জি'],
  'ডিমের': ['egg', 'eggs', 'egg curry', 'shakshuka', 'ডিম', 'ডিমের', 'ডিম ভুনা', 'ডিম কারি'],
  'ডিম ভুনা': ['egg curry', 'egg', 'dim bhuna', 'ডিম ভুনা', 'ডিম কারি', 'ডিম'],
  'omelette': ['omelette', 'omelet', 'egg', 'অমলেট', 'ডিম'],

  // Potato
  'potato': ['potato', 'potatoes', 'alu', 'aloo', 'french fries', 'fries', 'wedges', 'mashed potato', 'aloo bhorta', 'dum aloo', 'আলু', 'আলুর', 'আলু ভর্তা', 'আলু ভাজি', 'আলুর দম'],
  'potatoes': ['potato', 'potatoes', 'alu', 'aloo', 'french fries', 'mashed potato', 'আলু', 'আলুর'],
  'alu': ['potato', 'potatoes', 'alu', 'aloo', 'আলু', 'আলুর'],
  'আলু': ['potato', 'potatoes', 'alu', 'aloo', 'aloo bhorta', 'dum aloo', 'french fries', 'আলু', 'আলুর', 'আলু ভর্তা', 'আলু ভাজি', 'আলুর দম'],
  'আলুর': ['potato', 'potatoes', 'alu', 'aloo', 'আলু', 'আলুর'],
  'fries': ['french fries', 'fries', 'potato wedges', 'potato', 'ফ্রেঞ্চ ফ্রাই', 'আলু'],
  'french fries': ['french fries', 'fries', 'potato wedges', 'potato', 'ফ্রেঞ্চ ফ্রাই', 'আলু'],

  // Fish & Shorshe Ilish & Seafood
  'fish': ['fish', 'fish curry', 'seafood', 'hilsa', 'ilish', 'rui', 'macher jhol', 'salmon', 'tuna', 'cod', 'prawn', 'shrimp', 'মাছ', 'মাছের ঝোল', 'ইলিশ', 'রুই', 'সালমন', 'চিংড়ি'],
  'মাছ': ['fish', 'fish curry', 'seafood', 'hilsa', 'ilish', 'rui', 'macher jhol', 'salmon', 'prawn', 'shrimp', 'মাছ', 'মাছের ঝোল', 'ইলিশ', 'রুই', 'সালমন', 'চিংড়ি'],
  'seafood': ['seafood', 'fish', 'salmon', 'shrimp', 'prawn', 'tuna', 'মাছ', 'চিংড়ি'],
  'salmon': ['salmon', 'fish', 'sushi', 'সালমন', 'মাছ'],
  'prawn': ['prawn', 'shrimp', 'seafood', 'চিংড়ি'],
  'shrimp': ['shrimp', 'prawn', 'seafood', 'চিংড়ি'],
  'চিংড়ি': ['prawn', 'shrimp', 'seafood', 'fish', 'চিংড়ি'],
  'ilish': ['hilsa', 'ilish', 'shorshe ilish', 'সর্ষে ইলিশ', 'সরিষা ইলিশ', 'ইলিশ', 'fish'],
  'hilsa': ['hilsa', 'ilish', 'shorshe ilish', 'সর্ষে ইলিশ', 'সরিষা ইলিশ', 'ইলিশ', 'fish'],
  'ইলিশ': ['hilsa', 'ilish', 'shorshe ilish', 'সর্ষে ইলিশ', 'সরিষা ইলিশ', 'ইলিশ', 'fish'],
  'shorshe ilish': ['shorshe ilish', 'sorshe ilish', 'mustard fish', 'hilsa', 'ilish', 'সরিষা ইলিশ', 'সর্ষে ইলিশ', 'ইলিশ'],
  'sorshe ilish': ['shorshe ilish', 'sorshe ilish', 'mustard fish', 'hilsa', 'ilish', 'সরিষা ইলিশ', 'সর্ষে ইলিশ', 'ইলিশ'],
  'সরিষা ইলিশ': ['shorshe ilish', 'sorshe ilish', 'mustard fish', 'hilsa', 'ilish', 'সরিষা ইলিশ', 'সর্ষে ইলিশ', 'ইলিশ'],
  'সর্ষে ইলিশ': ['shorshe ilish', 'sorshe ilish', 'mustard fish', 'hilsa', 'ilish', 'সরিষা ইলিশ', 'সর্ষে ইলিশ', 'ইলিশ'],
  'সরিষা': ['mustard', 'shorshe', 'সরিষা', 'সর্ষে', 'সরিষা ইলিশ'],
  'সর্ষে': ['mustard', 'shorshe', 'সরিষা', 'সর্ষে', 'সর্ষে ইলিশ'],
  'mustard': ['mustard', 'shorshe', 'সরিষা', 'সর্ষে', 'shorshe ilish', 'সরিষা ইলিশ'],
  'রুই': ['rui', 'rohu', 'রুই', 'মাছ', 'fish', 'fish curry', 'মাছের ঝোল'],
  'rui': ['rui', 'rohu', 'রুই', 'মাছ', 'fish', 'fish curry', 'macher jhol'],

  // Rice
  'rice': ['rice', 'basmati', 'chinigura', 'khichuri', 'polao', 'fried rice', 'ghee bhat', 'bhat', 'risotto', 'biryani', 'চাল', 'ভাত', 'রাইস', 'পোলাও', 'খিচুড়ি', 'খিচুড়ি', 'ফ্রাইড রাইস', 'ঘি ভাত', 'চিনিগুঁড়া'],
  'ভাত': ['rice', 'ভাত', 'চাল', 'রাইস', 'পোলাও', 'খিচুড়ি', 'খিচুড়ি', 'ফ্রাইড রাইস', 'ঘি ভাত'],
  'চাল': ['rice', 'ভাত', 'চাল', 'পোলাও', 'চিনিগুঁড়া', 'বাসমতী'],
  'রাইস': ['rice', 'fried rice', 'ফ্রাইড রাইস', 'রাইস', 'ভাত', 'চাল'],
  'ঘি ভাত': ['ghee bhat', 'ghee rice', 'rice', 'ঘি ভাত', 'ভাত'],
  'khichuri': ['khichuri', 'bhuna khichuri', 'খিচুড়ি', 'খিচুড়ি', 'ভুনা খিচুড়ি'],
  'bhuna khichuri': ['khichuri', 'bhuna khichuri', 'খিচুড়ি', 'খিচুড়ি', 'ভুনা খিচুড়ি'],
  'খিচুড়ি': ['khichuri', 'bhuna khichuri', 'খিচুড়ি', 'খিচুড়ি', 'ভুনা খিচুড়ি'],
  'খিচুড়ি': ['khichuri', 'bhuna khichuri', 'খিচুড়ি', 'খিচুড়ি', 'ভুনা খিচুড়ি'],
  'ভুনা খিচুড়ি': ['khichuri', 'bhuna khichuri', 'খিচুড়ি', 'খিচুড়ি', 'ভুনা খিচুড়ি'],
  'ভুনা খিচুড়ি': ['khichuri', 'bhuna khichuri', 'খিচুড়ি', 'খিচুড়ি', 'ভুনা খিচুড়ি'],

  // Vegetables & Leafy Greens
  'vegetables': ['vegetables', 'vegetable', 'vegetarian', 'veggie', 'stir fry', 'vegetable soup', 'সবজি', 'শাকসবজি', 'তরকারি', 'নিরামিষ'],
  'vegetable': ['vegetables', 'vegetable', 'vegetarian', 'veggie', 'stir fry', 'vegetable soup', 'সবজি', 'শাকসবজি', 'তরকারি'],
  'সবজি': ['vegetables', 'vegetable', 'vegetarian', 'সবজি', 'শাকসবজি', 'নিরামিষ', 'তরকারি'],
  'শাকসবজি': ['vegetables', 'vegetable', 'shak', 'সবজি', 'শাকসবজি'],

  // Pizza, Burger, Sandwich & Salad
  'pizza': ['pizza', 'margherita', 'পিজ্জা', 'পিৎজা', 'মার্গারিটা'],
  'পিজ্জা': ['pizza', 'margherita', 'পিজ্জা', 'পিৎজা', 'মার্গারিটা'],
  'পিৎজা': ['pizza', 'margherita', 'পিজ্জা', 'পিৎজা', 'মার্গারিটা'],
  'margherita': ['margherita', 'pizza', 'মার্গারিটা', 'পিজ্জা'],
  'মার্গারিটা': ['margherita', 'pizza', 'মার্গারিটা', 'পিজ্জা'],
  'sandwich': ['sandwich', 'club sandwich', 'toast', 'burger', 'স্যান্ডউইচ'],
  'স্যান্ডউইচ': ['sandwich', 'স্যান্ডউইচ'],
  'burger': ['burger', 'cheeseburger', 'প্যাটি', 'বার্গার'],
  'বার্গার': ['burger', 'বার্গার'],
  'salad': ['salad', 'greens', 'caesar salad', 'সালাদ'],
  'সালাদ': ['salad', 'সালাদ'],

  // Sushi
  'sushi': ['sushi', 'roll', 'maki', 'সুশি', 'জাপানি'],
  'সুশি': ['sushi', 'roll', 'maki', 'সুশি', 'জাপানি'],

  // Soup
  'soup': ['soup', 'vegetable soup', 'tom yum', 'broth', 'chicken soup', 'স্যুপ', 'সবজি স্যুপ', 'টম ইয়াম'],
  'স্যুপ': ['soup', 'vegetable soup', 'tom yum', 'broth', 'স্যুপ', 'সবজি স্যুপ', 'টম ইয়াম'],
  'সবজি স্যুপ': ['vegetable soup', 'soup', 'সবজি স্যুপ', 'স্যুপ'],
  'vegetable soup': ['vegetable soup', 'soup', 'সবজি স্যুপ', 'স্যুপ'],

  // Tomato
  'tomato': ['tomato', 'tomatoes', 'cherry tomato', 'টমেটো'],
  'টমেটো': ['tomato', 'tomatoes', 'টমেটো'],

  // Onion
  'onion': ['onion', 'onions', 'পেঁয়াজ', 'পিয়াজ'],
  'পেঁয়াজ': ['onion', 'onions', 'পেঁয়াজ', 'পিয়াজ'],

  // Spinach / Shaak
  'shak': ['shak', 'shaak', 'saak', 'spinach', 'amaranth', 'শাক', 'শাক ভাজি', 'শাক ভর্তা', 'লাল শাক', 'পালং শাক', 'পুঁই শাক'],
  'shaak': ['shak', 'shaak', 'saak', 'spinach', 'amaranth', 'শাক', 'শাক ভাজি', 'শাক ভর্তা', 'লাল শাক', 'পালং শাক', 'পুঁই শাক'],
  'spinach': ['spinach', 'palak', 'palong', 'shak', 'shaak', 'পালং শাক', 'পালং', 'শাক'],
  'palak': ['spinach', 'palak', 'পালং শাক', 'পালক পনির', 'শাক'],
  'শাক': ['shak', 'shaak', 'saak', 'spinach', 'amaranth', 'শাক', 'শাক ভাজি', 'শাক ভর্তা', 'লাল শাক', 'পালং শাক', 'পুঁই শাক'],
  'শাক ভাজি': ['shak bhaji', 'shaak bhaji', 'শাক ভাজি', 'লাল শাক', 'শাক'],
  'শাক ভর্তা': ['shak bhorta', 'shaak bhorta', 'শাক ভর্তা', 'শাক'],
  'শাক দিয়ে ডাল': ['shak dal', 'palong shak dal', 'শাক দিয়ে ডাল', 'শাক ডাল', 'শাক'],
  'লাল শাক': ['lal shaak', 'red amaranth', 'লাল শাক', 'শাক'],
  'পালং শাক': ['spinach', 'palak', 'পালং শাক', 'শাক'],

  // Potato Dishes
  'potato bhaji': ['potato bhaji', 'aloo bhaji', 'আলু ভাজি', 'ভাজি'],
  'aloo bhaji': ['potato bhaji', 'aloo bhaji', 'আলু ভাজি', 'ভাজি'],
  'আলু ভাজি': ['potato bhaji', 'aloo bhaji', 'আলু ভাজি', 'ভাজি'],
  'aloo bhorta': ['aloo bhorta', 'potato mash', 'আলু ভর্তা', 'ভর্তা'],
  'potato mash': ['aloo bhorta', 'potato mash', 'আলু ভর্তা', 'ভর্তা'],
  'আলু ভর্তা': ['aloo bhorta', 'potato mash', 'আলু ভর্তা', 'ভর্তা'],
  'alur dum': ['dum aloo', 'aloo dum', 'alur dum', 'আলুর দম'],
  'আলুর দম': ['dum aloo', 'aloo dum', 'alur dum', 'আলুর দম'],

  // Dal / Lentils
  'dal': ['dal', 'daal', 'lentil', 'lentils', 'ডাল', 'মসুর ডাল', 'মুগ ডাল'],
  'lentil': ['dal', 'daal', 'lentil', 'lentils', 'ডাল', 'মসুর ডাল', 'মুগ ডাল'],
  'lentils': ['dal', 'daal', 'lentil', 'lentils', 'ডাল', 'মসুর ডাল', 'মুগ ডাল'],
  'ডাল': ['dal', 'daal', 'lentil', 'lentils', 'ডাল', 'মসুর ডাল', 'মুগ ডাল'],

  // Momos / Nepali
  'momo': ['momo', 'momos', 'dumpling', 'nepali', 'মোমো', 'নেপালি', 'ডাম্পলিং'],
  'momos': ['momo', 'momos', 'dumpling', 'nepali', 'মোমো', 'নেপালি', 'ডাম্পলিং'],
  'মোমো': ['momo', 'momos', 'dumpling', 'nepali', 'মোমো', 'নেপালি', 'ডাম্পলিং'],
  'nepali': ['nepali', 'nepal', 'momo', 'নেপালি', 'মোমো'],
  'নেপালি': ['nepali', 'nepal', 'momo', 'নেপালি', 'মোমো'],

  // Food Categories, Meal Types, Cuisines & Dietary Categories
  'breakfast': ['breakfast', 'নাস্তা', 'সকালের নাস্তা'],
  'নাস্তা': ['breakfast', 'snack', 'নাস্তা', 'সকালের নাস্তা'],
  'lunch': ['lunch', 'দুপুরের খাবার'],
  'দুপুরের খাবার': ['lunch', 'দুপুরের খাবার'],
  'dinner': ['dinner', 'রাতের খাবার'],
  'রাতের খাবার': ['dinner', 'রাতের খাবার'],
  'snack': ['snack', 'নাস্তা', 'বিকেলের নাস্তা'],
  'vegetarian': ['vegetarian', 'veg', 'নিরামিষ', 'সবজি'],
  'নিরামিষ': ['vegetarian', 'vegan', 'নিরামিষ', 'সবজি'],
  'vegan': ['vegan', 'নিরামিষ', 'উদ্ভিজ্জ'],
  'halal': ['halal', 'হালাল'],
  'হালাল': ['halal', 'হালাল'],
  'bangladeshi': ['bangladeshi', 'bengali', 'বাংলাদেশি', 'বাঙালি'],
  'বাংলাদেশি': ['bangladeshi', 'bengali', 'বাংলাদেশি', 'বাঙালি'],
  'indian': ['indian', 'ভারতীয়', 'ভারতীয়'],
  'ভারতীয়': ['indian', 'ভারতীয়', 'ভারতীয়'],
  'chinese': ['chinese', 'চাইনিজ'],
  'চাইনিজ': ['chinese', 'চাইনিজ'],
  'italian': ['italian', 'ইতালীয়', 'ইতালীয়'],
  'ইতালীয়': ['italian', 'ইতালীয়', 'ইতালীয়'],
  'japanese': ['japanese', 'জাপানি'],
  'জাপানি': ['japanese', 'জাপানি'],
  'thai': ['thai', 'থাই'],
  'থাই': ['thai', 'থাই'],
  'mediterranean': ['mediterranean', 'ভূমধ্যসাগরীয়', 'ভূমধ্যসাগরীয়'],
  'curry': ['curry', 'jhol', 'bhuna', 'torkari', 'কারি', 'তরকারি', 'ঝোল', 'ভুনা'],
  'কারি': ['curry', 'jhol', 'bhuna', 'torkari', 'কারি', 'তরকারি', 'ঝোল', 'ভুনা'],
  'তরকারি': ['curry', 'torkari', 'jhol', 'তরকারি', 'কারি', 'ঝোল'],

  // Spices & Staples
  'ginger': ['ginger', 'আদা'],
  'আদা': ['ginger', 'আদা'],
  'garlic': ['garlic', 'রসুন'],
  'রসুন': ['garlic', 'রসুন'],
  'turmeric': ['turmeric', 'হলুদ'],
  'হলুদ': ['turmeric', 'হলুদ'],
  'cumin': ['cumin', 'জিরা'],
  'জিরা': ['cumin', 'জিরা'],
  'chili': ['chili', 'chilies', 'green chili', 'মরিচ', 'কাঁচা মরিচ'],
  'কাঁচা মরিচ': ['green chili', 'chili', 'কাঁচা মরিচ', 'মরিচ'],
  'mustard oil': ['mustard oil', 'সরিষার তেল', 'সরিষা'],
  'সরিষার তেল': ['mustard oil', 'সরিষার তেল', 'সরিষা'],
  'paneer': ['paneer', 'cottage cheese', 'পনির', 'পালক পনির'],
  'পনির': ['paneer', 'cheese', 'পনির', 'পালক পনির'],
  'cheese': ['cheese', 'mozzarella', 'paneer', 'চিজ', 'পনির'],
  'cabbage': ['cabbage', 'bandhakopi', 'বাঁধাকপি'],
  'বাঁধাকপি': ['cabbage', 'bandhakopi', 'বাঁধাকপি'],
  'cauliflower': ['cauliflower', 'fulkopi', 'ফুলকপি'],
  'ফুলকপি': ['cauliflower', 'fulkopi', 'ফুলকপি'],
  'pumpkin': ['pumpkin', 'kumra', 'কুমড়া', 'মিষ্টি কুমড়া'],
  'কুমড়া': ['pumpkin', 'kumra', 'কুমড়া', 'মিষ্টি কুমড়া'],

  // Global & South/East Asian Dishes
  'bhorta': ['bhorta', 'bharta', 'aloo bhorta', 'mash', 'ভর্তা', 'আলু ভর্তা', 'বেগুন ভর্তা'],
  'ভর্তা': ['bhorta', 'bharta', 'aloo bhorta', 'ভর্তা', 'আলু ভর্তা', 'বেগুন ভর্তা'],
  'pitha': ['pitha', 'bhapa pitha', 'pithe', 'পিঠা', 'ভাপা পিঠা'],
  'পিঠা': ['pitha', 'bhapa pitha', 'pithe', 'পিঠা', 'ভাপা পিঠা'],
  'ভাপা পিঠা': ['bhapa pitha', 'pitha', 'ভাপা পিঠা', 'পিঠা'],
  'panta bhat': ['panta bhat', 'panta', 'fermented rice', 'পান্তা ভাত', 'পান্তা'],
  'panta': ['panta bhat', 'panta', 'পান্তা ভাত', 'পান্তা'],
  'পান্তা ভাত': ['panta bhat', 'panta', 'পান্তা ভাত', 'পান্তা'],
  'dal bhat': ['dal bhat', 'dal', 'nepali', 'ডাল ভাত', 'ডাল'],
  'thukpa': ['thukpa', 'noodle soup', 'nepali', 'থুকপা', 'স্যুপ নুডুলস'],
  'থুকপা': ['thukpa', 'noodle soup', 'থুকপা'],
  'dosa': ['dosa', 'masala dosa', 'crepe', 'দোসা', 'মসলা দোসা'],
  'দোসা': ['dosa', 'masala dosa', 'দোসা', 'মসলা দোসা'],
  'butter chicken': ['butter chicken', 'murgh makhani', 'বাটার চিকেন'],
  'বাটার চিকেন': ['butter chicken', 'murgh makhani', 'বাটার চিকেন'],
  'paneer tikka': ['paneer tikka', 'paneer', 'পনির টিক্কা', 'পনির'],
  'risotto': ['risotto', 'mushroom risotto', 'রিসোটো'],
  'রিসোটো': ['risotto', 'mushroom risotto', 'রিসোটো'],
  'tempura': ['tempura', 'shrimp tempura', 'টেম্পুরা'],
  'টেম্পুরা': ['tempura', 'টেম্পুরা'],
  'bibimbap': ['bibimbap', 'korean rice bowl', 'বিবিমবাপ'],
  'বিবিমবাপ': ['bibimbap', 'বিবিমবাপ'],
  'kimchi': ['kimchi', 'kimchi fried rice', 'কিমচি', 'কিমচি ফ্রাইড রাইস'],
  'কিমচি': ['kimchi', 'kimchi fried rice', 'কিমচি'],
  'kimchi fried rice': ['kimchi fried rice', 'kimchi', 'কিমচি ফ্রাইড রাইস'],
  'dumplings': ['dumplings', 'dumpling', 'jiaozi', 'momo', 'ডাম্পলিং', 'মোমো'],
  'dumpling': ['dumplings', 'dumpling', 'jiaozi', 'momo', 'ডাম্পলিং', 'মোমো'],
  'ডাম্পলিং': ['dumplings', 'dumpling', 'momo', 'ডাম্পলিং', 'মোমো'],
  'tom yum': ['tom yum', 'thai soup', 'টম ইয়াম'],
  'tacos': ['tacos', 'taco', 'টাকোস', 'টাকো'],
  'taco': ['tacos', 'taco', 'টাকোস', 'টাকো'],
  'টাকোস': ['tacos', 'taco', 'টাকোস'],
  'quesadilla': ['quesadilla', 'কেসাডিয়া'],
  'কেসাডিয়া': ['quesadilla', 'কেসাডিয়া'],
  'oats': ['oats', 'oatmeal', 'ওটস'],
  'ওটস': ['oats', 'oatmeal', 'ওটস'],
};

/**
 * Returns expanded normalized tokens for smart bilingual matching
 */
export function expandBilingualTokens(query: string): string[] {
  const cleanQ = normalizeBengaliText(query);
  if (!cleanQ) return [];

  const tokens = new Set<string>();
  tokens.add(cleanQ);

  // Check exact phrase in synonym map (raw lower + NFC/nukta normalized)
  const rawLower = query.normalize('NFC').trim().toLowerCase();
  if (rawLower) tokens.add(rawLower);

  const directSyn = BILINGUAL_SYNONYMS[rawLower] || BILINGUAL_SYNONYMS[cleanQ];
  if (directSyn) {
    for (const syn of directSyn) {
      tokens.add(normalizeBengaliText(syn));
    }
    return Array.from(tokens);
  }

  // Otherwise check individual words if multi-word query
  const words = cleanQ.split(/\s+/).filter(Boolean);
  for (const w of words) {
    tokens.add(w);
    const normW = normalizeBengaliText(w);
    tokens.add(normW);
    if (BILINGUAL_SYNONYMS[w]) {
      for (const syn of BILINGUAL_SYNONYMS[w]) {
        tokens.add(normalizeBengaliText(syn));
      }
    }
    if (BILINGUAL_SYNONYMS[normW]) {
      for (const syn of BILINGUAL_SYNONYMS[normW]) {
        tokens.add(normalizeBengaliText(syn));
      }
    }
  }

  return Array.from(tokens);
}

// ============================================================================
// UNIVERSAL SEARCH INTELLIGENCE: TYPO CORRECTION & BROAD INTENT EXPANSION
// ============================================================================

const DIRECT_TYPO_FIXES: Record<string, string> = {
  noodls: 'noodles',
  nodles: 'noodles',
  noodel: 'noodle',
  noudles: 'noodles',
  nudles: 'noodles',
  ramn: 'ramen',
  ramne: 'ramen',
  raamen: 'ramen',
  chickn: 'chicken',
  chiken: 'chicken',
  chikin: 'chicken',
  chikn: 'chicken',
  cheken: 'chicken',
  poteto: 'potato',
  potatos: 'potato',
  potaoto: 'potato',
  patato: 'potato',
  psta: 'pasta',
  passta: 'pasta',
  spagetti: 'spaghetti',
  spageti: 'spaghetti',
  spagheti: 'spaghetti',
  vegtable: 'vegetables',
  vegitable: 'vegetables',
  vegitables: 'vegetables',
  vegetabels: 'vegetables',
  vegies: 'vegetables',
  biriyani: 'biryani',
  briyani: 'biryani',
  beryani: 'biryani',
  omlet: 'omelette',
  omlette: 'omelette',
  omelete: 'omelette',
  piza: 'pizza',
  pizzza: 'pizza',
  fsh: 'fish',
  riec: 'rice',
  eg: 'egg',
  egs: 'eggs',
  sandwitch: 'sandwich',
  sandwhich: 'sandwich',
  bugrer: 'burger',
  burgr: 'burger',
  curri: 'curry',
  cury: 'curry',
  sald: 'salad',
  shorshe: 'shorshe ilish',
  sorshe: 'shorshe ilish',
  chawmein: 'chow mein',
  chowmin: 'chow mein',
  hakka: 'hakka noodles',
  padthai: 'pad thai',
  tomoto: 'tomato',
  tamato: 'tomato',
  onoin: 'onion',
  spinich: 'spinach',
  spinch: 'spinach',
  caulifower: 'cauliflower',
  cabage: 'cabbage',
  pumkin: 'pumpkin',
  pampkin: 'pumpkin',
  khichdi: 'khichuri',
  khichri: 'khichuri',
  kichuri: 'khichuri',
  bharta: 'bhorta',
  momos: 'momo',
  dumplin: 'dumplings',
  dumpling: 'dumplings',
  taco: 'tacos',
  taccos: 'tacos',
  quesadila: 'quesadilla',
  quesedilla: 'quesadilla',
  rissoto: 'risotto',
  risoto: 'risotto',
  bibimbab: 'bibimbap',
  bibmbap: 'bibimbap',
  kimchee: 'kimchi',
  dhosa: 'dosa',
  dosai: 'dosa',
  thupka: 'thukpa',
  temppura: 'tempura',
  tomyum: 'tom yum',
  pitha: 'pitha',
  helthy: 'healthy',
  protien: 'protein',
  proten: 'protein',
  fibre: 'fiber',
};

const CULINARY_DICTIONARY: string[] = [
  'noodles',
  'ramen',
  'chow mein',
  'hakka noodles',
  'pad thai',
  'udon',
  'laksa',
  'chicken',
  'chicken curry',
  'chicken biryani',
  'chicken roast',
  'grilled chicken',
  'chicken soup',
  'chicken pasta',
  'chicken sandwich',
  'butter chicken',
  'potato',
  'french fries',
  'potato wedges',
  'mashed potatoes',
  'aloo bhorta',
  'bhorta',
  'dum aloo',
  'egg',
  'omelette',
  'egg curry',
  'egg bhurji',
  'shakshuka',
  'pasta',
  'spaghetti',
  'fettuccine',
  'penne',
  'lasagna',
  'macaroni',
  'rice',
  'fried rice',
  'kimchi fried rice',
  'biryani',
  'khichuri',
  'panta bhat',
  'dal bhat',
  'risotto',
  'pitha',
  'bhapa pitha',
  'fish',
  'fish curry',
  'shorshe ilish',
  'salmon',
  'sushi',
  'prawn',
  'shrimp',
  'tempura',
  'vegetables',
  'vegetable',
  'vegetarian',
  'vegetable soup',
  'vegetable pizza',
  'chicken pizza',
  'bangladesh style pizza',
  'bangladesh',
  'bangladeshi',
  'style',
  'tandoori',
  'mozzarella',
  'garlic',
  'spicy',
  'classic',
  'homestyle',
  'homemade',
  'grilled',
  'roasted',
  'stir fry',
  'spinach',
  'cabbage',
  'bandhakopi',
  'cauliflower',
  'pumpkin',
  'tomato',
  'onion',
  'lentil',
  'dal',
  'soup',
  'salad',
  'pizza',
  'margherita',
  'burger',
  'sandwich',
  'pancake',
  'beef',
  'steak',
  'mutton',
  'lamb',
  'curry',
  'momo',
  'dumplings',
  'thukpa',
  'dosa',
  'masala dosa',
  'paneer',
  'paneer tikka',
  'palak paneer',
  'bibimbap',
  'kimchi',
  'tom yum',
  'tacos',
  'quesadilla',
  'kung pao chicken',
  'oats',
  'chilla',
  'healthy',
  'diet',
  'protein',
  'fiber',
  'sugar',
  'balanced',
  'breakfast',
  'lunch',
  'dinner',
  'snack',
  'snacks',
  'dessert',
  'seafood',
];

export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

export function correctRecipeQueryTypo(query: string): {
  correctedQuery: string;
  wasCorrected: boolean;
} {
  const trimmed = String(query || '').trim();
  if (!trimmed || /[\u0980-\u09FF]/.test(trimmed)) {
    return { correctedQuery: trimmed, wasCorrected: false };
  }
  const lower = trimmed.toLowerCase();

  // Exact match in culinary dictionary -> no correction needed
  if (CULINARY_DICTIONARY.includes(lower)) {
    return { correctedQuery: trimmed, wasCorrected: false };
  }

  // Known phonetic / spelling mistake map
  if (DIRECT_TYPO_FIXES[lower]) {
    return { correctedQuery: DIRECT_TYPO_FIXES[lower], wasCorrected: true };
  }

  // Word-by-word correction for single/short phrases (only ASCII words >= 4 chars)
  const words = lower.split(/\s+/).filter(Boolean);
  let anyWordChanged = false;
  const fixedWords = words.map((word) => {
    if (CULINARY_DICTIONARY.includes(word)) return word;
    if (DIRECT_TYPO_FIXES[word]) {
      anyWordChanged = true;
      return DIRECT_TYPO_FIXES[word];
    }
    if (word.length < 4) return word;
    const maxDist = word.length >= 6 ? 2 : 1;
    let bestWord = word;
    let bestDist = Infinity;
    for (const candidate of CULINARY_DICTIONARY) {
      if (candidate.includes(' ')) continue;
      if (Math.abs(candidate.length - word.length) > maxDist) continue;
      const dist = levenshteinDistance(word, candidate);
      if (dist <= maxDist && dist < bestDist) {
        bestDist = dist;
        bestWord = candidate;
      }
    }
    if (bestWord !== word) {
      anyWordChanged = true;
    }
    return bestWord;
  });

  if (anyWordChanged) {
    return { correctedQuery: fixedWords.join(' '), wasCorrected: true };
  }

  // Whole-phrase fuzzy match against multi-word culinary dishes
  if (words.length >= 2 && lower.length >= 6) {
    let bestPhrase = '';
    let bestDist = Infinity;
    for (const candidate of CULINARY_DICTIONARY) {
      if (Math.abs(candidate.length - lower.length) > 2) continue;
      const d = levenshteinDistance(lower, candidate);
      if (d > 0 && d <= 2 && d < bestDist) {
        bestDist = d;
        bestPhrase = candidate;
      }
    }
    if (bestPhrase) {
      return { correctedQuery: bestPhrase, wasCorrected: true };
    }
  }

  return { correctedQuery: trimmed, wasCorrected: false };
}

export type DietIntentType =
  | 'healthy_food'
  | 'diet_food'
  | 'healthy_breakfast'
  | 'healthy_lunch'
  | 'healthy_dinner'
  | 'high_protein'
  | 'high_fiber'
  | 'low_sugar'
  | 'balanced_meal'
  | 'vegetable_recipes'
  | 'nutritious_snacks';

export interface UniversalQueryAnalysis {
  originalQuery: string;
  correctedQuery: string;
  wasCorrected: boolean;
  intent: 'empty' | 'broad' | 'specific' | 'diet';
  dietIntent?: DietIntentType;
  englishQuery: string;
  exactTerms: string[];
  relatedVariations: string[];
  suggestedQueries: string[];
  isBanglaQuery: boolean;
}

export function detectDietIntent(rawQuery: string): DietIntentType | undefined {
  const clean = normalizeBengaliText(rawQuery)
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean) return undefined;

  if (
    /\bhigh protein\b/.test(clean) ||
    clean === 'protein' ||
    clean.includes('প্রোটিন') ||
    clean.includes('হাই প্রোটিন')
  ) {
    return 'high_protein';
  }
  if (
    /\bhigh fiber\b/.test(clean) ||
    /\bhigh fibre\b/.test(clean) ||
    clean === 'fiber' ||
    clean === 'fibre' ||
    clean.includes('ফাইবার') ||
    clean.includes('আঁশযুক্ত')
  ) {
    return 'high_fiber';
  }
  if (
    /\blow sugar\b/.test(clean) ||
    /\bless sugar\b/.test(clean) ||
    /\bsugar free\b/.test(clean) ||
    clean.includes('কম চিনি') ||
    clean.includes('সুগার ফ্রি')
  ) {
    return 'low_sugar';
  }
  if (
    /\bhealthy breakfast\b/.test(clean) ||
    /\bbreakfast healthy\b/.test(clean) ||
    clean.includes('স্বাস্থ্যকর নাস্তা') ||
    clean.includes('স্বাস্থ্যকর সকালের নাস্তা') ||
    clean.includes('হেলদি ব্রেকফাস্ট')
  ) {
    return 'healthy_breakfast';
  }
  if (
    /\bhealthy lunch\b/.test(clean) ||
    clean.includes('স্বাস্থ্যকর দুপুরের খাবার') ||
    clean.includes('হেলদি লাঞ্চ')
  ) {
    return 'healthy_lunch';
  }
  if (
    /\bhealthy dinner\b/.test(clean) ||
    clean.includes('স্বাস্থ্যকর রাতের খাবার') ||
    clean.includes('হেলদি ডিনার')
  ) {
    return 'healthy_dinner';
  }
  if (
    /\bnutritious snack/.test(clean) ||
    /\bhealthy snack/.test(clean) ||
    clean.includes('স্বাস্থ্যকর স্ন্যাকস') ||
    clean.includes('পুষ্টিকর নাস্তা')
  ) {
    return 'nutritious_snacks';
  }
  if (
    /\bvegetable recipes?\b/.test(clean) ||
    /\bveggie recipes?\b/.test(clean) ||
    /\bhealthy vegetable\b/.test(clean) ||
    clean === 'সবজি রেসিপি' ||
    clean.includes('স্বাস্থ্যকর সবজি')
  ) {
    return 'vegetable_recipes';
  }
  if (
    /\bbalanced meal/.test(clean) ||
    /\bbalanced food/.test(clean) ||
    /\bbalanced diet/.test(clean) ||
    clean.includes('সুষম খাবার') ||
    clean.includes('সুষম খাদ্য')
  ) {
    return 'balanced_meal';
  }
  if (
    /\bdiet food\b/.test(clean) ||
    /\bdiet meal/.test(clean) ||
    /\bdiet recipes?\b/.test(clean) ||
    clean === 'diet' ||
    clean.includes('ডায়েট খাবার') ||
    clean.includes('ডায়েট ফুড') ||
    clean.includes('ডায়েট')
  ) {
    return 'diet_food';
  }
  if (
    /\bhealthy food\b/.test(clean) ||
    /\bhealthy meal/.test(clean) ||
    /\bhealthy recipes?\b/.test(clean) ||
    /\bnutritious food\b/.test(clean) ||
    clean === 'healthy' ||
    clean.includes('স্বাস্থ্যকর খাবার') ||
    clean.includes('পুষ্টিকর খাবার') ||
    clean.includes('হেলদি ফুড')
  ) {
    return 'healthy_food';
  }
  return undefined;
}

const BROAD_VARIATION_PROFILES: Record<
  string,
  {
    englishQuery: string;
    relatedVariations: string[];
    suggestedQueries: string[];
  }
> = {
  noodles: {
    englishQuery: 'noodles',
    relatedVariations: ['noodles', 'ramen', 'chow mein', 'pad thai', 'thukpa', 'udon', 'lo mein'],
    suggestedQueries: ['Ramen', 'Hakka Noodles', 'Chow Mein', 'Pad Thai', 'Thukpa', 'Chicken Noodles'],
  },
  chicken: {
    englishQuery: 'chicken',
    relatedVariations: ['chicken', 'chicken curry', 'butter chicken', 'biryani', 'roast chicken', 'chicken soup', 'chicken pasta'],
    suggestedQueries: ['Chicken Curry', 'Butter Chicken', 'Chicken Biryani', 'Grilled Chicken', 'Chicken Soup', 'Chicken Pasta'],
  },
  potato: {
    englishQuery: 'potato',
    relatedVariations: ['potato', 'fries', 'mashed potato', 'aloo', 'bhorta', 'potato salad', 'wedges'],
    suggestedQueries: ['Aloo Bhorta', 'French Fries', 'Dum Aloo', 'Mashed Potatoes', 'Potato Curry', 'Potato Wedges'],
  },
  egg: {
    englishQuery: 'egg',
    relatedVariations: ['egg', 'omelette', 'shakshuka', 'frittata', 'egg curry', 'egg bhurji'],
    suggestedQueries: ['Egg Bhuna', 'Tomato Egg Bhurji', 'Shakshuka', 'Masala Omelette', 'Egg Fried Rice'],
  },
  pasta: {
    englishQuery: 'pasta',
    relatedVariations: ['pasta', 'spaghetti', 'lasagna', 'penne', 'fettuccine', 'alfredo', 'macaroni'],
    suggestedQueries: ['Garlic Herb Pasta', 'Chicken Pasta', 'Spaghetti Carbonara', 'Lasagna', 'Penne Arrabbiata'],
  },
  rice: {
    englishQuery: 'rice',
    relatedVariations: ['rice', 'fried rice', 'biryani', 'risotto', 'khichuri', 'panta bhat', 'dal bhat', 'bibimbap'],
    suggestedQueries: ['Bhuna Khichuri', 'Chicken Biryani', 'Risotto', 'Bibimbap', 'Kimchi Fried Rice', 'Dal Bhat'],
  },
  fish: {
    englishQuery: 'fish',
    relatedVariations: ['fish', 'salmon', 'sushi', 'fish curry', 'seafood', 'hilsa', 'shrimp'],
    suggestedQueries: ['Shorshe Ilish', 'Macher Jhol', 'Salmon Sushi', 'Panta Bhat with Ilish', 'Fish Curry'],
  },
  vegetables: {
    englishQuery: 'vegetable',
    relatedVariations: ['vegetable', 'vegetarian', 'ratatouille', 'vegetable soup', 'spinach', 'cabbage', 'salad'],
    suggestedQueries: ['Garden Vegetable Soup', 'Palak Paneer', 'Lal Shaak Bhaji', 'Paneer Tikka', 'Dum Aloo'],
  },
  soup: {
    englishQuery: 'soup',
    relatedVariations: ['soup', 'vegetable soup', 'tom yum', 'thukpa', 'chicken soup', 'ramen'],
    suggestedQueries: ['Garden Vegetable Soup', 'Thai Tom Yum Soup', 'Nepali Thukpa', 'Ramen'],
  },
  curry: {
    englishQuery: 'curry',
    relatedVariations: ['curry', 'chicken curry', 'butter chicken', 'fish curry', 'egg curry', 'paneer'],
    suggestedQueries: ['Bengali Chicken Curry', 'Butter Chicken', 'Macher Jhol', 'Egg Curry', 'Shorshe Ilish'],
  },
  beef: {
    englishQuery: 'beef',
    relatedVariations: ['beef', 'steak', 'beef stew', 'burger', 'tacos'],
    suggestedQueries: ['Beef Curry', 'Beef Steak', 'Beef Stew', 'Burger'],
  },
  salad: {
    englishQuery: 'salad',
    relatedVariations: ['salad', 'caesar salad', 'greek salad', 'chicken salad'],
    suggestedQueries: ['Caesar Salad', 'Greek Salad', 'Potato Salad', 'Chicken Salad'],
  },
  pizza: {
    englishQuery: 'pizza',
    relatedVariations: ['pizza', 'margherita'],
    suggestedQueries: ['Bangladesh Style Pizza', 'Chicken Pizza', 'Margherita', 'Vegetable Pizza'],
  },
  cabbage: {
    englishQuery: 'cabbage',
    relatedVariations: ['cabbage', 'bandhakopi'],
    suggestedQueries: ['Bandhakopir Ghonto', 'Lentil Dal with Cabbage', 'Cabbage Soup'],
  },
  dal: {
    englishQuery: 'dal',
    relatedVariations: ['dal', 'daal', 'lentil', 'dal bhat', 'khichuri'],
    suggestedQueries: ['Masoor Dal', 'Dal Bhat', 'Bhuna Khichuri', 'Moong Dal Chilla'],
  },
  dumplings: {
    englishQuery: 'dumplings',
    relatedVariations: ['dumplings', 'momo', 'jiaozi'],
    suggestedQueries: ['Steamed Chicken Dumplings', 'Nepali Chicken Momo', 'Vegetable Momo'],
  },
};

const BANGLA_TO_ENGLISH_CORE: Record<string, string> = {
  'নুডুলস': 'noodles',
  'নুডলস': 'noodles',
  'রামেন': 'ramen',
  'চাওমিন': 'chow mein',
  'মুরগি': 'chicken',
  'মুরগির': 'chicken',
  'মুরগির মাংস': 'chicken',
  'চিকেন': 'chicken',
  'মোরগ': 'chicken',
  'বাটার চিকেন': 'butter chicken',
  'আলু': 'potato',
  'আলুর': 'potato',
  'আলু ভর্তা': 'aloo bhorta',
  'ভর্তা': 'bhorta',
  'আলুর দম': 'dum aloo',
  'ডিম': 'egg',
  'ডিমের': 'egg',
  'ডিম ভুনা': 'egg curry',
  'ডিম ভাজি': 'egg bhurji',
  'ভাত': 'rice',
  'চাল': 'rice',
  'রাইস': 'rice',
  'বিরিয়ানি': 'biryani',
  'বিরিয়ানি': 'biryani',
  'খিচুড়ি': 'khichuri',
  'খিচুড়ি': 'khichuri',
  'পান্তা ভাত': 'panta bhat',
  'পান্তা': 'panta bhat',
  'পিঠা': 'pitha',
  'ভাপা পিঠা': 'bhapa pitha',
  'মাছ': 'fish',
  'ইলিশ': 'hilsa',
  'সর্ষে ইলিশ': 'shorshe ilish',
  'পাস্তা': 'pasta',
  'সবজি': 'vegetables',
  'শাকসবজি': 'vegetables',
  'শাক': 'spinach',
  'লাল শাক': 'spinach',
  'পালং শাক': 'spinach',
  'স্যুপ': 'soup',
  'ডাল': 'dal',
  'ডাল ভাত': 'dal bhat',
  'মসুর ডাল': 'masoor dal',
  'টমেটো': 'tomato',
  'বাঁধাকপি': 'cabbage',
  'ফুলকপি': 'cauliflower',
  'কুমড়া': 'pumpkin',
  'পিজ্জা': 'pizza',
  'সুশি': 'sushi',
  'মোমো': 'momo',
  'ডাম্পলিং': 'dumplings',
  'দোসা': 'dosa',
  'মসলা দোসা': 'masala dosa',
  'পনির': 'paneer',
  'পনির টিক্কা': 'paneer tikka',
  'রিসোটো': 'risotto',
  'টেম্পুরা': 'tempura',
  'বিবিমবাপ': 'bibimbap',
  'কিমচি': 'kimchi',
  'কিমচি ফ্রাইড রাইস': 'kimchi fried rice',
  'থুকপা': 'thukpa',
  'টাকোস': 'tacos',
  'কেসাডিয়া': 'quesadilla',
  'প্যাড থাই': 'pad thai',
  'টম ইয়াম': 'tom yum',
  'গরু': 'beef',
  'গরুর মাংস': 'beef',
  'খাসি': 'lamb',
  'চিংড়ি': 'shrimp',
  'সালাদ': 'salad',
  'বার্গার': 'burger',
  'স্যান্ডউইচ': 'sandwich',
};

const DIET_SEARCH_META: Record<
  DietIntentType,
  {
    englishQuery: string;
    relatedVariations: string[];
    suggestedQueries: string[];
  }
> = {
  healthy_food: {
    englishQuery: 'healthy food',
    relatedVariations: ['balanced', 'protein', 'fiber', 'vegetables', 'grilled', 'steamed'],
    suggestedQueries: ['Healthy Breakfast', 'High Protein Food', 'High Fiber Food', 'Vegetable Recipes', 'Low-Sugar Meal'],
  },
  diet_food: {
    englishQuery: 'diet food',
    relatedVariations: ['low calorie', 'balanced', 'salad', 'soup', 'high fiber', 'lean protein'],
    suggestedQueries: ['Healthy Breakfast', 'High Protein Food', 'High Fiber Food', 'Vegetable Recipes', 'Balanced Meal'],
  },
  healthy_breakfast: {
    englishQuery: 'healthy breakfast',
    relatedVariations: ['breakfast', 'oats', 'chilla', 'egg', 'lentil', 'dal'],
    suggestedQueries: ['High Protein Food', 'High Fiber Food', 'Low-Sugar Meal', 'Healthy Lunch', 'Nutritious Snacks'],
  },
  healthy_lunch: {
    englishQuery: 'healthy lunch',
    relatedVariations: ['lunch', 'dal bhat', 'fish', 'quinoa', 'bowl', 'bibimbap'],
    suggestedQueries: ['Balanced Meal', 'High Protein Food', 'Vegetable Recipes', 'Healthy Dinner'],
  },
  healthy_dinner: {
    englishQuery: 'healthy dinner',
    relatedVariations: ['dinner', 'soup', 'grilled', 'fish', 'lentil', 'vegetables'],
    suggestedQueries: ['Balanced Meal', 'High Protein Food', 'Low-Sugar Meal', 'Vegetable Recipes'],
  },
  high_protein: {
    englishQuery: 'high protein',
    relatedVariations: ['protein', 'chicken', 'fish', 'paneer', 'lentil', 'egg'],
    suggestedQueries: ['Balanced Meal', 'Healthy Breakfast', 'Diet Food', 'High Fiber Food'],
  },
  high_fiber: {
    englishQuery: 'high fiber',
    relatedVariations: ['fiber', 'lentil', 'dal', 'oats', 'spinach', 'vegetables'],
    suggestedQueries: ['Vegetable Recipes', 'Balanced Meal', 'Low-Sugar Meal', 'Healthy Breakfast'],
  },
  low_sugar: {
    englishQuery: 'low sugar',
    relatedVariations: ['savory', 'balanced', 'high fiber', 'protein'],
    suggestedQueries: ['Diet Food', 'High Protein Food', 'High Fiber Food', 'Balanced Meal'],
  },
  balanced_meal: {
    englishQuery: 'balanced meal',
    relatedVariations: ['dal bhat', 'bibimbap', 'protein bowl', 'fish'],
    suggestedQueries: ['Healthy Breakfast', 'Healthy Lunch', 'Healthy Dinner', 'High Protein Food'],
  },
  vegetable_recipes: {
    englishQuery: 'vegetable recipes',
    relatedVariations: ['vegetables', 'spinach', 'cabbage', 'lentil', 'paneer'],
    suggestedQueries: ['High Fiber Food', 'Healthy Food', 'Low-Sugar Meal', 'Balanced Meal'],
  },
  nutritious_snacks: {
    englishQuery: 'nutritious snacks',
    relatedVariations: ['snack', 'steamed', 'chilla', 'momo', 'soup'],
    suggestedQueries: ['Healthy Breakfast', 'High Fiber Food', 'Low-Sugar Meal', 'Diet Food'],
  },
};

export function analyzeUniversalQuery(rawQuery: string): UniversalQueryAnalysis {
  const trimmed = String(rawQuery || '').trim();
  const isBanglaQuery = /[\u0980-\u09FF]/.test(trimmed);

  if (!trimmed) {
    return {
      originalQuery: '',
      correctedQuery: '',
      wasCorrected: false,
      intent: 'empty',
      englishQuery: '',
      exactTerms: [],
      relatedVariations: [],
      suggestedQueries: ['Khichuri', 'Momo', 'Pizza', 'Ramen', 'Healthy Breakfast', 'High Protein Food', 'Bibimbap', 'Tacos'],
      isBanglaQuery: false,
    };
  }

  const { correctedQuery, wasCorrected } = correctRecipeQueryTypo(trimmed);
  const normCorrected = normalizeBengaliText(correctedQuery);

  // Check Smart Diet Food Search intent first
  const dietIntent = detectDietIntent(correctedQuery) || detectDietIntent(trimmed);
  if (dietIntent) {
    const dMeta = DIET_SEARCH_META[dietIntent];
    return {
      originalQuery: trimmed,
      correctedQuery,
      wasCorrected,
      intent: 'diet',
      dietIntent,
      englishQuery: dMeta.englishQuery,
      exactTerms: [normCorrected, dMeta.englishQuery],
      relatedVariations: dMeta.relatedVariations,
      suggestedQueries: dMeta.suggestedQueries,
      isBanglaQuery,
    };
  }

  // Translate Bangla phrase/word to core English query for external API lookup
  let englishQuery = BANGLA_TO_ENGLISH_CORE[trimmed.normalize('NFC').trim()] || BANGLA_TO_ENGLISH_CORE[normCorrected] || '';
  if (!englishQuery && isBanglaQuery) {
    const tokens = expandBilingualTokens(correctedQuery);
    const asciiCandidate = tokens.find((t) => /^[a-z0-9\s-]+$/.test(t) && t.length >= 3);
    englishQuery = asciiCandidate || correctedQuery;
  }
  if (!englishQuery) {
    englishQuery = correctedQuery.toLowerCase();
  }

  // Map plural/alias forms to broad profile key
  const broadAliasMap: Record<string, string> = {
    noodle: 'noodles',
    noodles: 'noodles',
    chicken: 'chicken',
    potato: 'potato',
    potatoes: 'potato',
    egg: 'egg',
    eggs: 'egg',
    pasta: 'pasta',
    rice: 'rice',
    fish: 'fish',
    seafood: 'fish',
    vegetable: 'vegetables',
    vegetables: 'vegetables',
    vegetarian: 'vegetables',
    soup: 'soup',
    curry: 'curry',
    beef: 'beef',
    salad: 'salad',
    pizza: 'pizza',
    pizzas: 'pizza',
    cabbage: 'cabbage',
    dal: 'dal',
    daal: 'dal',
    lentil: 'dal',
    lentils: 'dal',
    dumpling: 'dumplings',
    dumplings: 'dumplings',
  };

  const broadKey = broadAliasMap[englishQuery] || broadAliasMap[normCorrected];
  const broadProfile = broadKey ? BROAD_VARIATION_PROFILES[broadKey] : undefined;

  const exactTerms = Array.from(
    new Set([
      normCorrected,
      normalizeBengaliText(englishQuery),
      ...expandBilingualTokens(correctedQuery),
    ].filter(Boolean))
  );

  if (broadProfile) {
    return {
      originalQuery: trimmed,
      correctedQuery,
      wasCorrected,
      intent: 'broad',
      englishQuery: broadProfile.englishQuery,
      exactTerms,
      relatedVariations: broadProfile.relatedVariations,
      suggestedQueries: broadProfile.suggestedQueries,
      isBanglaQuery,
    };
  }

  // Specific dish query (e.g., "Ramen", "Khichuri", "Momo", "Bibimbap", "Pad Thai", "Tacos")
  const specificRelatedMap: Record<string, string[]> = {
    ramen: ['noodles', 'thukpa', 'miso ramen'],
    'pad thai': ['noodles', 'thai noodles'],
    'tom yum': ['thai soup', 'soup'],
    'chow mein': ['noodles', 'hakka noodles'],
    biryani: ['biriyani', 'kacchi', 'dum biryani'],
    khichuri: ['bhuna khichuri', 'dal', 'rice'],
    pitha: ['bhapa pitha'],
    'panta bhat': ['fermented rice', 'hilsa'],
    'dal bhat': ['dal', 'lentil'],
    thukpa: ['noodle soup', 'noodles'],
    dosa: ['masala dosa'],
    'butter chicken': ['chicken curry', 'murgh makhani'],
    'paneer tikka': ['paneer', 'palak paneer'],
    risotto: ['rice', 'mushroom risotto'],
    tempura: ['shrimp', 'japanese'],
    bibimbap: ['korean', 'rice bowl'],
    'kimchi fried rice': ['kimchi', 'fried rice'],
    sushi: ['salmon sushi', 'maki'],
    pizza: ['margherita'],
    margherita: ['pizza'],
    shakshuka: ['egg', 'tomato'],
    'aloo bhorta': ['potato', 'bhorta'],
    bhorta: ['aloo bhorta', 'potato'],
    'dum aloo': ['potato', 'potato curry'],
    tacos: ['taco', 'mexican'],
    taco: ['tacos', 'mexican'],
    quesadilla: ['mexican', 'cheese'],
    spinach: ['shak', 'palak'],
    momo: ['dumplings', 'nepali'],
  };

  const extraRelated = specificRelatedMap[englishQuery] || [];

  return {
    originalQuery: trimmed,
    correctedQuery,
    wasCorrected,
    intent: 'specific',
    englishQuery,
    exactTerms,
    relatedVariations: [englishQuery, ...extraRelated],
    suggestedQueries: [
      correctedQuery,
      ...extraRelated.map((r) => r.replace(/\b\w/g, (c) => c.toUpperCase())),
    ].slice(0, 6),
    isBanglaQuery,
  };
}

export const STRICT_DISH_ANCHORS = [
  'pizza',
  'margherita',
  'ramen',
  'noodles',
  'noodle',
  'biryani',
  'biriyani',
  'pasta',
  'burger',
  'sandwich',
  'sushi',
  'momo',
  'dumpling',
  'dumplings',
  'soup',
  'salad',
  'cabbage',
  'bandhakopi',
  'khichuri',
  'bhorta',
  'pitha',
  'panta',
  'dal',
  'thukpa',
  'dosa',
  'risotto',
  'tempura',
  'bibimbap',
  'kimchi',
  'taco',
  'tacos',
  'quesadilla',
  'paneer',
  'omelette',
  'shakshuka',
];



