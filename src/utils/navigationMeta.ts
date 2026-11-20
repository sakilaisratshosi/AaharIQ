import { AppView } from '../types';
import { Language } from '../i18n/translations';

export interface AppViewMeta {
  id: AppView;
  labelEn: string;
  labelBn: string;
}

export const APP_VIEW_META: Record<AppView, AppViewMeta> = {
  dashboard: {
    id: 'dashboard',
    labelEn: 'Home',
    labelBn: 'হোম',
  },
  recipes: {
    id: 'recipes',
    labelEn: 'Global Recipe Finder',
    labelBn: 'গ্লোবাল রেসিপি ফাইন্ডার',
  },
  'healthy-guide': {
    id: 'healthy-guide',
    labelEn: 'Healthy Nutrition Guide',
    labelBn: 'সুস্থ খাদ্য ও পুষ্টি গাইড',
  },
  'food-scanner': {
    id: 'food-scanner',
    labelEn: 'Food Scanner',
    labelBn: 'ফুড স্ক্যানার',
  },
  'safety-center': {
    id: 'safety-center',
    labelEn: 'Food Safety Center',
    labelBn: 'খাদ্য নিরাপত্তা কেন্দ্র',
  },
  'bd-nutrition': {
    id: 'bd-nutrition',
    labelEn: 'Bangladesh Food DB',
    labelBn: 'বাংলাদেশ খাদ্য ডেটাবেজ',
  },
  nutrition: {
    id: 'nutrition',
    labelEn: 'Calorie & Nutrition Analyzer',
    labelBn: 'ক্যালোরি ও পুষ্টি বিশ্লেষক',
  },
  'ingredient-ai': {
    id: 'ingredient-ai',
    labelEn: 'Ingredient Recipe Finder',
    labelBn: 'উপাদান দিয়ে রেসিপি',
  },
  'food-journal': {
    id: 'food-journal',
    labelEn: 'Food Journal',
    labelBn: 'খাদ্য জার্নাল',
  },
  'food-comparison': {
    id: 'food-comparison',
    labelEn: 'Food Comparison',
    labelBn: 'খাদ্য তুলনা',
  },
  'food-waste': {
    id: 'food-waste',
    labelEn: 'Food Waste Reduction',
    labelBn: 'খাদ্য অপচয় রোধ',
  },
  'meal-planner': {
    id: 'meal-planner',
    labelEn: 'Meal Planner',
    labelBn: 'মিল প্ল্যানার',
  },
  cuisines: {
    id: 'cuisines',
    labelEn: 'Global Cuisines',
    labelBn: 'বিশ্বের রান্না',
  },
  grocery: {
    id: 'grocery',
    labelEn: 'Grocery Manager',
    labelBn: 'বাজারের তালিকা',
  },
  assistant: {
    id: 'assistant',
    labelEn: 'Food Assistant',
    labelBn: 'খাদ্য সহকারী',
  },
  onboarding: {
    id: 'onboarding',
    labelEn: 'Quick Setup',
    labelBn: 'দ্রুত সেটআপ',
  },
  profile: {
    id: 'profile',
    labelEn: 'My Profile',
    labelBn: 'আমার প্রোফাইল',
  },
};

export const VALID_APP_VIEWS = Object.keys(APP_VIEW_META) as AppView[];

export function isValidAppView(val: string | null | undefined): val is AppView {
  if (!val) return false;
  return VALID_APP_VIEWS.includes(val as AppView);
}

export function getViewTitle(view: AppView, language: Language): string {
  const meta = APP_VIEW_META[view];
  if (!meta) return language === 'bn' ? 'হোম' : 'Home';
  return language === 'bn' ? meta.labelBn : meta.labelEn;
}

export function viewToHash(view: AppView): string {
  return view === 'dashboard' ? '#/' : `#/${view}`;
}

export function parseViewFromHash(hash?: string): AppView {
  try {
    const raw = (hash ?? window.location.hash ?? '').replace(/^#\/?/, '').split('?')[0].trim();
    if (isValidAppView(raw)) {
      return raw;
    }
  } catch {
    // fallback safely
  }
  return 'dashboard';
}
