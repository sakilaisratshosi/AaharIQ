import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Language, translations, Translations } from '../i18n/translations';
import {
  AppNotificationItem,
  AppView,
  ChatMessage,
  FoodJournalEntry,
  FoodSafetyCenterReport,
  FoodScanReport,
  GroceryItem,
  SavedFoodComparison,
  SavedMealPlan,
  UserProfile,
} from '../types';
import { Recipe, RECIPES_DATABASE } from '../data/recipesData';
import { parseViewFromHash, viewToHash } from '../utils/navigationMeta';

export interface RecipesFilterState {
  mealType: string;
  dietaryTag: string;
  maxTime: number;
  onlyFavorites: boolean;
}

interface NavHistoryEntry {
  view: AppView;
  recipeId: string | null;
}

interface BrowserNavState {
  aahariqNav: true;
  idx: number;
  view: AppView;
  recipeId: string | null;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  goBack: () => void;
  goHome: () => void;
  canGoBack: boolean;
  previousView: AppView | null;
  navigateToFavorites: () => void;
  recipesFilters: RecipesFilterState;
  setRecipesFilters: React.Dispatch<React.SetStateAction<RecipesFilterState>>;
  activeCuisineId: string;
  setActiveCuisineId: (id: string) => void;
  selectedCuisineFilter: string | null;
  setSelectedCuisineFilter: (cuisine: string | null) => void;
  selectedRecipe: Recipe | null;
  setSelectedRecipe: (recipe: Recipe | null) => void;
  favorites: string[];
  favoriteRecipesMap: Record<string, Recipe>;
  toggleFavorite: (recipeId: string, recipeData?: Recipe) => void;
  isFavorite: (recipeId: string) => boolean;
  groceryItems: GroceryItem[];
  addGroceryItem: (item: Omit<GroceryItem, 'id' | 'isCompleted'>) => void;
  addBatchGroceryItems: (items: Omit<GroceryItem, 'id' | 'isCompleted'>[]) => void;
  toggleGroceryItem: (id: string) => void;
  removeGroceryItem: (id: string) => void;
  clearCompletedGrocery: () => void;
  savedMealPlans: SavedMealPlan[];
  saveMealPlan: (plan: Omit<SavedMealPlan, 'id' | 'savedAt'>) => void;
  deleteMealPlan: (id: string) => void;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  authToken: string | null;
  login: (profile: UserProfile, token?: string) => void;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  onboardingCompleted: boolean;
  completeOnboarding: (prefs?: Partial<UserProfile>) => Promise<void>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchHistory: string[];
  addSearchHistory: (term: string) => void;
  clearSearchHistory: () => void;
  chatHistory: ChatMessage[];
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChatHistory: () => void;
  scanHistory: FoodScanReport[];
  saveScanReport: (report: FoodScanReport) => void;
  deleteScanReport: (id: string) => void;
  clearScanHistory: () => void;
  safetyReportsHistory: FoodSafetyCenterReport[];
  saveSafetyReport: (report: FoodSafetyCenterReport) => void;
  deleteSafetyReport: (id: string) => void;
  clearSafetyHistory: () => void;
  journalEntries: FoodJournalEntry[];
  addJournalEntry: (entry: Omit<FoodJournalEntry, 'id' | 'createdAt'>) => Promise<void>;
  deleteJournalEntry: (id: string) => Promise<void>;
  clearJournalEntries: () => Promise<void>;
  comparisonHistory: SavedFoodComparison[];
  saveComparisonRecord: (record: { title: string; servingGrams: number; foodCodes: string[]; foodNames: string[] }) => Promise<void>;
  deleteComparisonRecord: (id: string) => Promise<void>;
  appNotifications: AppNotificationItem[];
  unreadNotificationsCount: number;
  pushAppNotification: (item: Omit<AppNotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  markAllNotificationsRead: () => void;
  dismissAppNotification: (id: string) => void;
  clearAppNotifications: () => void;
  notification: string | null;
  showNotification: (msg: string) => void;
  getAuthHeaders: () => Record<string, string>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function getOrCreateWorkspaceId(): string {
  try {
    let existing = localStorage.getItem('aahariq_workspace_id');
    if (!existing) {
      existing = 'ws_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
      localStorage.setItem('aahariq_workspace_id', existing);
    }
    return existing;
  } catch {
    return 'ws_default';
  }
}

const INITIAL_GROCERY: GroceryItem[] = [
  { id: 'g1', name: 'Mustard Seeds (Ground)', nameBn: 'হলুদ সরিষা বাটা', amount: 3, unit: 'tbsp', category: 'pantry', isCompleted: false, addedFrom: 'Shorshe Ilish' },
  { id: 'g2', name: 'Fresh Lal Shaak (Red Amaranth)', nameBn: 'তাজা লাল শাক', amount: 1, unit: 'bunch', category: 'produce', isCompleted: false, addedFrom: 'Lal Shaak Bhaji' },
  { id: 'g3', name: 'Cold Pressed Mustard Oil', nameBn: 'সরিষার তেল', amount: 500, unit: 'ml', category: 'spices', isCompleted: true, addedFrom: 'manual' },
  { id: 'g4', name: 'Basmati Rice', nameBn: 'বাসমতী চাল', amount: 1, unit: 'kg', category: 'pantry', isCompleted: false, addedFrom: 'Chicken Dum Biryani' },
];

const INITIAL_NOTIFICATIONS: AppNotificationItem[] = [
  {
    id: 'notif_fctb',
    title: 'Bangladesh FCTB Dataset Active',
    titleBn: 'বাংলাদেশ খাদ্য ডেটাবেজ প্রস্তুত',
    message: '389 Bangladesh food records from University of Dhaka (INFS) & 2025 Dietary Guidelines are ready to explore and compare.',
    messageBn: 'ঢাকা বিশ্ববিদ্যালয়ের (INFS) ৩৮৯টি দেশীয় খাদ্য ও ২০২৫ নির্দেশিকা এখন অনুসন্ধান ও তুলনার জন্য প্রস্তুত।',
    category: 'database',
    timestamp: 'Today',
    read: false,
    targetView: 'bd-nutrition',
  },
  {
    id: 'notif_bfsa',
    title: 'BFSA Laboratory Directory Connected',
    titleBn: 'BFSA খাদ্য পরীক্ষাগার তথ্যসূত্র যুক্ত',
    message: 'Check official food testing parameters, lab accreditation, and BFSA 16155 consumer guidance inside the Safety Center.',
    messageBn: 'খাদ্য নিরাপত্তা কেন্দ্রে BFSA তালিকাভুক্ত ল্যাবরেটরি ও হটলাইন ১৬১৫৫ তথ্য দেখুন।',
    category: 'safety',
    timestamp: 'Today',
    read: false,
    targetView: 'safety-center',
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Language state
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('aahariq_lang') || localStorage.getItem('nutrismart_lang');
    return saved === 'bn' || saved === 'en' ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('aahariq_lang', lang);
  };

  const t = translations[language];

  // 2. Navigation, Unified Browser/Android History Stack & Scroll Preservation
  const initialHashViewRef = useRef<AppView>(parseViewFromHash());
  const [currentView, setCurrentViewState] = useState<AppView>(() => initialHashViewRef.current);
  const [selectedCuisineFilter, setSelectedCuisineFilter] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipeState] = useState<Recipe | null>(null);
  const [recipesFilters, setRecipesFilters] = useState<RecipesFilterState>({
    mealType: 'all',
    dietaryTag: 'all',
    maxTime: 120,
    onlyFavorites: false,
  });
  const [activeCuisineId, setActiveCuisineId] = useState<string>('Bangladeshi');

  const navStackRef = useRef<NavHistoryEntry[]>(
    initialHashViewRef.current !== 'dashboard'
      ? [
          { view: 'dashboard', recipeId: null },
          { view: initialHashViewRef.current, recipeId: null },
        ]
      : [{ view: 'dashboard', recipeId: null }]
  );
  const navIndexRef = useRef<number>(initialHashViewRef.current !== 'dashboard' ? 1 : 0);
  const scrollPositionsRef = useRef<Map<number, number>>(new Map());
  const recipeRegistryRef = useRef<Map<string, Recipe>>(
    new Map(RECIPES_DATABASE.map((r) => [r.id, r]))
  );
  const currentViewRef = useRef<AppView>(currentView);
  currentViewRef.current = currentView;
  const selectedRecipeRef = useRef<Recipe | null>(selectedRecipe);
  selectedRecipeRef.current = selectedRecipe;

  const [navMeta, setNavMeta] = useState<{ canGoBack: boolean; previousView: AppView | null }>(() => ({
    canGoBack: initialHashViewRef.current !== 'dashboard',
    previousView: initialHashViewRef.current !== 'dashboard' ? 'dashboard' : null,
  }));

  const syncNavMeta = useCallback(() => {
    const idx = navIndexRef.current;
    const prevEntry = idx > 0 ? navStackRef.current[idx - 1] : null;
    const fallbackPrev =
      !prevEntry && currentViewRef.current !== 'dashboard' ? 'dashboard' : null;
    setNavMeta({
      canGoBack: idx > 0 || currentViewRef.current !== 'dashboard' || Boolean(selectedRecipeRef.current),
      previousView: prevEntry ? prevEntry.view : fallbackPrev,
    });
  }, []);

  const restoreScrollForIndex = useCallback((idx: number, fallbackTop = 0) => {
    const targetY = scrollPositionsRef.current.get(idx) ?? fallbackTop;
    requestAnimationFrame(() => {
      window.scrollTo({ top: targetY, behavior: 'auto' });
      setTimeout(() => {
        window.scrollTo({ top: targetY, behavior: 'auto' });
      }, 40);
    });
  }, []);

  // Initialize history baseline + handle Android hardware Back & browser Back/Forward (popstate)
  useEffect(() => {
    const initialView = initialHashViewRef.current;
    if (initialView !== 'dashboard') {
      const rootState: BrowserNavState = {
        aahariqNav: true,
        idx: 0,
        view: 'dashboard',
        recipeId: null,
      };
      const entryState: BrowserNavState = {
        aahariqNav: true,
        idx: 1,
        view: initialView,
        recipeId: null,
      };
      window.history.replaceState(rootState, '', viewToHash('dashboard'));
      window.history.pushState(entryState, '', viewToHash(initialView));
    } else {
      const rootState: BrowserNavState = {
        aahariqNav: true,
        idx: 0,
        view: 'dashboard',
        recipeId: null,
      };
      window.history.replaceState(rootState, '', viewToHash('dashboard'));
    }

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as Partial<BrowserNavState> | null;
      if (state && state.aahariqNav && typeof state.idx === 'number' && state.view) {
        navIndexRef.current = state.idx;
        if (!navStackRef.current[state.idx]) {
          navStackRef.current[state.idx] = {
            view: state.view,
            recipeId: state.recipeId ?? null,
          };
        }
        currentViewRef.current = state.view;
        setCurrentViewState(state.view);

        if (state.recipeId) {
          const found =
            recipeRegistryRef.current.get(state.recipeId) ||
            favoriteRecipesMapRef.current[state.recipeId] ||
            RECIPES_DATABASE.find((r) => r.id === state.recipeId) ||
            null;
          selectedRecipeRef.current = found;
          setSelectedRecipeState(found);
        } else {
          selectedRecipeRef.current = null;
          setSelectedRecipeState(null);
        }

        syncNavMeta();
        if (!state.recipeId) {
          restoreScrollForIndex(state.idx, 0);
        }
        return;
      }

      // Fallback if external hash/state navigation occurred
      const fallbackView = parseViewFromHash();
      navIndexRef.current = 0;
      navStackRef.current = [{ view: fallbackView, recipeId: null }];
      currentViewRef.current = fallbackView;
      selectedRecipeRef.current = null;
      setCurrentViewState(fallbackView);
      setSelectedRecipeState(null);
      syncNavMeta();
      restoreScrollForIndex(0, 0);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [restoreScrollForIndex, syncNavMeta]);

  const setCurrentView = useCallback(
    (nextView: AppView) => {
      // Save current page scroll position before navigating away
      scrollPositionsRef.current.set(navIndexRef.current, window.scrollY || 0);

      if (nextView === currentViewRef.current && !selectedRecipeRef.current) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const nextIdx = navIndexRef.current + 1;
      navStackRef.current = [
        ...navStackRef.current.slice(0, nextIdx),
        { view: nextView, recipeId: null },
      ];
      navIndexRef.current = nextIdx;
      scrollPositionsRef.current.set(nextIdx, 0);

      const historyState: BrowserNavState = {
        aahariqNav: true,
        idx: nextIdx,
        view: nextView,
        recipeId: null,
      };
      window.history.pushState(historyState, '', viewToHash(nextView));

      currentViewRef.current = nextView;
      selectedRecipeRef.current = null;
      setCurrentViewState(nextView);
      setSelectedRecipeState(null);
      syncNavMeta();

      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
      });
    },
    [syncNavMeta]
  );

  const setSelectedRecipe = useCallback(
    (recipe: Recipe | null) => {
      if (recipe) {
        recipeRegistryRef.current.set(recipe.id, recipe);
        // Remember scroll position on the underlying view before opening RecipeModal
        scrollPositionsRef.current.set(navIndexRef.current, window.scrollY || 0);

        const nextIdx = navIndexRef.current + 1;
        const activeView = currentViewRef.current;
        navStackRef.current = [
          ...navStackRef.current.slice(0, nextIdx),
          { view: activeView, recipeId: recipe.id },
        ];
        navIndexRef.current = nextIdx;

        const historyState: BrowserNavState = {
          aahariqNav: true,
          idx: nextIdx,
          view: activeView,
          recipeId: recipe.id,
        };
        window.history.pushState(historyState, '', viewToHash(activeView));

        selectedRecipeRef.current = recipe;
        setSelectedRecipeState(recipe);
        syncNavMeta();
      } else {
        const currentEntry = navStackRef.current[navIndexRef.current];
        if (currentEntry?.recipeId && navIndexRef.current > 0) {
          // Let unified popstate unwind the modal and restore underlying scroll position
          window.history.back();
        } else {
          selectedRecipeRef.current = null;
          setSelectedRecipeState(null);
          syncNavMeta();
        }
      }
    },
    [syncNavMeta]
  );

  const goBack = useCallback(() => {
    if (isAuthModalOpenRef.current) {
      setIsAuthModalOpen(false);
      return;
    }
    if (selectedRecipeRef.current) {
      setSelectedRecipe(null);
      return;
    }
    if (navIndexRef.current > 0) {
      scrollPositionsRef.current.set(navIndexRef.current, window.scrollY || 0);
      window.history.back();
      return;
    }
    if (currentViewRef.current !== 'dashboard') {
      setCurrentView('dashboard');
    }
  }, [setCurrentView, setSelectedRecipe]);

  const goHome = useCallback(() => {
    setIsAuthModalOpen(false);
    if (currentViewRef.current === 'dashboard' && !selectedRecipeRef.current) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setCurrentView('dashboard');
  }, [setCurrentView]);

  const navigateToFavorites = useCallback(() => {
    setRecipesFilters((prev) => ({ ...prev, onlyFavorites: true }));
    setCurrentView('recipes');
  }, [setCurrentView]);

  // 3. Authentication & Onboarding state
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('aahariq_token');
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('aahariq_token'));
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('aahariq_user') || localStorage.getItem('nutrismart_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(() => {
    return localStorage.getItem('aahariq_onboarding_done') === 'true';
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const isAuthModalOpenRef = useRef(isAuthModalOpen);
  isAuthModalOpenRef.current = isAuthModalOpen;

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-workspace-id': getOrCreateWorkspaceId(),
    };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
    return headers;
  }, [authToken]);

  // Verify backend session on mount
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const headers: Record<string, string> = { 'x-workspace-id': getOrCreateWorkspaceId() };
        if (authToken) headers.Authorization = `Bearer ${authToken}`;
        const res = await fetch('/api/auth/me', { headers });
        const data = await res.json();
        if (!active) return;
        if (data?.authenticated && data?.user) {
          setIsAuthenticated(true);
          setUserProfile(data.user);
          if (data.user.onboardingCompleted) {
            setOnboardingCompleted(true);
            localStorage.setItem('aahariq_onboarding_done', 'true');
          }
          localStorage.setItem('aahariq_user', JSON.stringify(data.user));
        } else if (authToken) {
          // Token expired on server
          setAuthToken(null);
          setIsAuthenticated(false);
          localStorage.removeItem('aahariq_token');
        }
      } catch {
        // Offline or network hiccup: retain local fallback cleanly
      }
    })();
    return () => {
      active = false;
    };
  }, [authToken]);

  const login = (profile: UserProfile, token?: string) => {
    setIsAuthenticated(true);
    setUserProfile(profile);
    localStorage.setItem('aahariq_user', JSON.stringify(profile));
    if (token) {
      setAuthToken(token);
      localStorage.setItem('aahariq_token', token);
    }
    if (profile.onboardingCompleted) {
      setOnboardingCompleted(true);
      localStorage.setItem('aahariq_onboarding_done', 'true');
    }
    showNotification(
      language === 'bn'
        ? `স্বাগতম, ${profile.name}!`
        : `Welcome back to AaharIQ, ${profile.name}!`
    );
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', headers: getAuthHeaders() });
    } catch {
      // ignore network error on logout
    }
    setIsAuthenticated(false);
    setUserProfile(null);
    setAuthToken(null);
    localStorage.removeItem('aahariq_token');
    localStorage.removeItem('aahariq_user');
    showNotification(
      language === 'bn' ? 'সফলভাবে লগআউট হয়েছে।' : 'Signed out successfully.'
    );
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    const base: UserProfile = userProfile || {
      name: 'Guest Explorer',
      email: '',
      dietaryPreference: 'Balanced & Halal',
      dailyCalorieGoal: 2000,
      allergies: [],
      language,
      preferredCuisines: ['Bangladeshi'],
    };
    const updated = { ...base, ...updates };
    setUserProfile(updated);
    localStorage.setItem('aahariq_user', JSON.stringify(updated));

    if (isAuthenticated && authToken) {
      try {
        const res = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(updates),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUserProfile(data.user);
            localStorage.setItem('aahariq_user', JSON.stringify(data.user));
          }
        }
      } catch {
        // local cache still updated
      }
    }
    showNotification(
      language === 'bn' ? 'প্রোফাইল সেটিংস সংরক্ষিত হয়েছে।' : 'Profile preferences saved.'
    );
  };

  const completeOnboarding = async (prefs?: Partial<UserProfile>) => {
    setOnboardingCompleted(true);
    localStorage.setItem('aahariq_onboarding_done', 'true');
    if (prefs) {
      if (prefs.language) setLanguage(prefs.language);
      await updateUserProfile({ ...prefs, onboardingCompleted: true });
    }
    setCurrentView('dashboard');
  };

  // 4. Search query & history
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('aahariq_search_hist') || localStorage.getItem('nutrismart_search_hist');
      return saved ? JSON.parse(saved) : ['Biryani', 'ডিম', 'Shorshe Ilish', 'Lal Shaak'];
    } catch {
      return ['Biryani', 'ডিম'];
    }
  });

  const addSearchHistory = (term: string) => {
    if (!term.trim()) return;
    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== term.toLowerCase());
      const next = [term.trim(), ...filtered].slice(0, 8);
      localStorage.setItem('aahariq_search_hist', JSON.stringify(next));
      return next;
    });
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('aahariq_search_hist');
  };

  // 5. Favorites (supports both curated & dynamically discovered external/AI recipes)
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('aahariq_favorites') || localStorage.getItem('nutrismart_favorites');
      return saved ? JSON.parse(saved) : ['chicken-biryani', 'shorshe-ilish', 'bengali-egg-curry'];
    } catch {
      return ['chicken-biryani', 'shorshe-ilish'];
    }
  });

  const [favoriteRecipesMap, setFavoriteRecipesMap] = useState<Record<string, Recipe>>(() => {
    try {
      const saved = localStorage.getItem('aahariq_favorite_recipes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const favoriteRecipesMapRef = useRef<Record<string, Recipe>>(favoriteRecipesMap);
  favoriteRecipesMapRef.current = favoriteRecipesMap;

  const toggleFavorite = (recipeId: string, recipeData?: Recipe) => {
    const exists = favorites.includes(recipeId);
    const nextIds = exists ? favorites.filter((id) => id !== recipeId) : [...favorites, recipeId];
    setFavorites(nextIds);
    localStorage.setItem('aahariq_favorites', JSON.stringify(nextIds));

    if (!exists && recipeData) {
      setFavoriteRecipesMap((prev) => {
        const nextMap = { ...prev, [recipeId]: recipeData };
        localStorage.setItem('aahariq_favorite_recipes', JSON.stringify(nextMap));
        return nextMap;
      });
    } else if (exists) {
      setFavoriteRecipesMap((prev) => {
        if (!prev[recipeId]) return prev;
        const nextMap = { ...prev };
        delete nextMap[recipeId];
        localStorage.setItem('aahariq_favorite_recipes', JSON.stringify(nextMap));
        return nextMap;
      });
    }

    const targetRecipe = recipeData || favoriteRecipesMap[recipeId] || RECIPES_DATABASE.find((r) => r.id === recipeId);
    const name = language === 'bn' ? targetRecipe?.nameBn || targetRecipe?.name : targetRecipe?.name;
    showNotification(
      exists
        ? (language === 'bn' ? `পছন্দের তালিকা থেকে সরানো হয়েছে: ${name || 'রেসিপি'}` : `Removed ${name || 'recipe'} from Favorites`)
        : (language === 'bn' ? `পছন্দের তালিকায় যোগ হয়েছে: ${name || 'রেসিপি'}` : `Saved ${name || 'recipe'} to Favorites`)
    );
  };

  const isFavorite = (recipeId: string) => favorites.includes(recipeId);

  // 6. Grocery Items
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>(() => {
    try {
      const saved = localStorage.getItem('aahariq_grocery') || localStorage.getItem('nutrismart_grocery');
      return saved ? JSON.parse(saved) : INITIAL_GROCERY;
    } catch {
      return INITIAL_GROCERY;
    }
  });

  useEffect(() => {
    localStorage.setItem('aahariq_grocery', JSON.stringify(groceryItems));
  }, [groceryItems]);

  const addGroceryItem = (item: Omit<GroceryItem, 'id' | 'isCompleted'>) => {
    const newItem: GroceryItem = {
      ...item,
      id: 'g_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      isCompleted: false,
    };
    setGroceryItems((prev) => [newItem, ...prev]);
    showNotification(
      language === 'bn'
        ? `"${item.nameBn || item.name}" ফর্দে যোগ হয়েছে`
        : `Added "${item.name}" to Grocery Checklist`
    );
  };

  const addBatchGroceryItems = (items: Omit<GroceryItem, 'id' | 'isCompleted'>[]) => {
    const newItems: GroceryItem[] = items.map((it) => ({
      ...it,
      id: 'g_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      isCompleted: false,
    }));
    setGroceryItems((prev) => [...newItems, ...prev]);
    showNotification(
      language === 'bn'
        ? `${items.length} টি উপাদান ফর্দে যোগ হয়েছে`
        : `Added ${items.length} items to Grocery Checklist`
    );
  };

  const toggleGroceryItem = (id: string) => {
    setGroceryItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isCompleted: !item.isCompleted } : item))
    );
  };

  const removeGroceryItem = (id: string) => {
    setGroceryItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCompletedGrocery = () => {
    setGroceryItems((prev) => prev.filter((item) => !item.isCompleted));
    showNotification(
      language === 'bn' ? 'সম্পন্ন উপাদানগুলো পরিষ্কার করা হয়েছে' : 'Cleared completed grocery items'
    );
  };

  // 7. Saved Meal Plans
  const [savedMealPlans, setSavedMealPlans] = useState<SavedMealPlan[]>(() => {
    try {
      const saved = localStorage.getItem('aahariq_mealplans') || localStorage.getItem('nutrismart_mealplans');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveMealPlan = (plan: Omit<SavedMealPlan, 'id' | 'savedAt'>) => {
    const newPlan: SavedMealPlan = {
      ...plan,
      id: 'mp_' + Date.now(),
      savedAt: new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };
    const next = [newPlan, ...savedMealPlans];
    setSavedMealPlans(next);
    localStorage.setItem('aahariq_mealplans', JSON.stringify(next));
    showNotification(
      language === 'bn' ? 'মিল প্ল্যান সংরক্ষিত হয়েছে' : 'Saved Meal Plan to your profile'
    );
  };

  const deleteMealPlan = (id: string) => {
    setSavedMealPlans((prev) => {
      const next = prev.filter((p) => p.id !== id);
      localStorage.setItem('aahariq_mealplans', JSON.stringify(next));
      return next;
    });
    showNotification(
      language === 'bn' ? 'মিল প্ল্যান মুছে ফেলা হয়েছে' : 'Deleted saved meal plan'
    );
  };

  // 8. Chat History
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('aahariq_chat') || localStorage.getItem('nutrismart_chat');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'c1',
              role: 'assistant',
              content:
                language === 'bn'
                  ? 'স্বাগতম! আমি AaharIQ খাদ্য ও পুষ্টি সহকারী। বাংলাদেশি খাদ্য উপাত্ত, রেসিপি, খাদ্য সংরক্ষণ, অপচয় রোধ এবং নিরাপদ খাদ্য সম্পর্কে যেকোনো প্রশ্ন করুন।'
                  : 'Hello! I am the AaharIQ Food & Nutrition Assistant. Ask me about Bangladesh FCTB food nutrients, recipe ideas, food storage, waste reduction, or food safety guidance.',
              timestamp: 'Just now',
            },
          ];
    } catch {
      return [];
    }
  });

  const addChatMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: 'msg_' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatHistory((prev) => {
      const next = [...prev, newMsg];
      localStorage.setItem('aahariq_chat', JSON.stringify(next));
      return next;
    });
  };

  const clearChatHistory = () => {
    setChatHistory([]);
    localStorage.removeItem('aahariq_chat');
    showNotification(
      language === 'bn' ? 'চ্যাট ইতিহাস মোছা হয়েছে' : 'Chat history cleared'
    );
  };

  // 9. Food Scanner & Food Safety Histories
  const [scanHistory, setScanHistory] = useState<FoodScanReport[]>(() => {
    try {
      const saved = localStorage.getItem('aahariq_food_scans') || localStorage.getItem('nutrismart_food_scans');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const persistScanHistory = (next: FoodScanReport[]) => {
    setScanHistory(next);
    try {
      localStorage.setItem('aahariq_food_scans', JSON.stringify(next.slice(0, 20)));
    } catch {
      const compact = next.slice(0, 15).map((r) => ({ ...r, imageDataUrl: undefined }));
      try {
        localStorage.setItem('aahariq_food_scans', JSON.stringify(compact));
      } catch {
        // ignore quota errors
      }
    }
  };

  const saveScanReport = (report: FoodScanReport) => {
    const filtered = scanHistory.filter((item) => item.id !== report.id);
    const next = [report, ...filtered].slice(0, 20);
    persistScanHistory(next);
    showNotification(
      language === 'bn' ? 'স্ক্যান রিপোর্ট সংরক্ষিত হয়েছে' : 'Scan report saved to history'
    );
  };

  const deleteScanReport = (id: string) => {
    persistScanHistory(scanHistory.filter((item) => item.id !== id));
    showNotification(language === 'bn' ? 'স্ক্যান রিপোর্ট মুছে ফেলা হয়েছে' : 'Removed scan report');
  };

  const clearScanHistory = () => {
    persistScanHistory([]);
    showNotification(language === 'bn' ? 'স্ক্যান ইতিহাস পরিষ্কার করা হয়েছে' : 'Scan history cleared');
  };

  const [safetyReportsHistory, setSafetyReportsHistory] = useState<FoodSafetyCenterReport[]>(() => {
    try {
      const saved = localStorage.getItem('aahariq_safety_reports') || localStorage.getItem('nutrismart_safety_reports');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const persistSafetyHistory = (next: FoodSafetyCenterReport[]) => {
    setSafetyReportsHistory(next);
    try {
      localStorage.setItem('aahariq_safety_reports', JSON.stringify(next.slice(0, 20)));
    } catch {
      const compact = next.slice(0, 15).map((r) => ({ ...r, imageDataUrl: undefined, labelImageDataUrl: undefined }));
      try {
        localStorage.setItem('aahariq_safety_reports', JSON.stringify(compact));
      } catch {
        // ignore quota
      }
    }
  };

  const saveSafetyReport = (report: FoodSafetyCenterReport) => {
    const next = [report, ...safetyReportsHistory.filter((item) => item.id !== report.id)].slice(0, 20);
    persistSafetyHistory(next);
    showNotification(language === 'bn' ? 'নিরাপত্তা রিপোর্ট সংরক্ষিত হয়েছে' : 'Safety assessment saved');
  };

  const deleteSafetyReport = (id: string) => {
    persistSafetyHistory(safetyReportsHistory.filter((item) => item.id !== id));
    showNotification(language === 'bn' ? 'নিরাপত্তা রিপোর্ট মুছে ফেলা হয়েছে' : 'Deleted safety report');
  };

  const clearSafetyHistory = () => {
    persistSafetyHistory([]);
    showNotification(language === 'bn' ? 'নিরাপত্তা ইতিহাস পরিষ্কার করা হয়েছে' : 'Cleared safety history');
  };

  // 10. Personal Food Journal (Backend synced + local fallback)
  const [journalEntries, setJournalEntries] = useState<FoodJournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem('aahariq_journal');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/journal/entries', { headers: getAuthHeaders() });
        if (!res.ok) return;
        const data = await res.json();
        if (active && Array.isArray(data.entries)) {
          setJournalEntries(data.entries);
          localStorage.setItem('aahariq_journal', JSON.stringify(data.entries));
        }
      } catch {
        // offline fallback preserved
      }
    })();
    return () => {
      active = false;
    };
  }, [getAuthHeaders, isAuthenticated]);

  const addJournalEntry = async (entry: Omit<FoodJournalEntry, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/journal/entries', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(entry),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.entry) {
          setJournalEntries((prev) => {
            const next = [data.entry, ...prev];
            localStorage.setItem('aahariq_journal', JSON.stringify(next));
            return next;
          });
          showNotification(
            language === 'bn' ? `"${entry.foodNameBn || entry.foodName}" জার্নালে যোগ হয়েছে` : `Logged "${entry.foodName}" to Food Journal`
          );
          return;
        }
      }
    } catch {
      // fallback local write
    }

    const localEntry: FoodJournalEntry = {
      ...entry,
      id: 'jr_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setJournalEntries((prev) => {
      const next = [localEntry, ...prev];
      localStorage.setItem('aahariq_journal', JSON.stringify(next));
      return next;
    });
    showNotification(
      language === 'bn' ? `"${entry.foodNameBn || entry.foodName}" জার্নালে যোগ হয়েছে` : `Logged "${entry.foodName}" to Food Journal`
    );
  };

  const deleteJournalEntry = async (id: string) => {
    try {
      await fetch(`/api/journal/entries/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    } catch {
      // ignore
    }
    setJournalEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      localStorage.setItem('aahariq_journal', JSON.stringify(next));
      return next;
    });
    showNotification(language === 'bn' ? 'জার্নাল এন্ট্রি মুছে ফেলা হয়েছে' : 'Removed journal entry');
  };

  const clearJournalEntries = async () => {
    try {
      await fetch('/api/journal/entries', { method: 'DELETE', headers: getAuthHeaders() });
    } catch {
      // ignore
    }
    setJournalEntries([]);
    localStorage.removeItem('aahariq_journal');
    showNotification(language === 'bn' ? 'জার্নালের সব তথ্য মুছে ফেলা হয়েছে' : 'Cleared personal food journal');
  };

  // 11. Food Comparison History (Backend synced)
  const [comparisonHistory, setComparisonHistory] = useState<SavedFoodComparison[]>(() => {
    try {
      const saved = localStorage.getItem('aahariq_comparisons');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/comparisons', { headers: getAuthHeaders() });
        if (!res.ok) return;
        const data = await res.json();
        if (active && Array.isArray(data.comparisons)) {
          setComparisonHistory(data.comparisons);
          localStorage.setItem('aahariq_comparisons', JSON.stringify(data.comparisons));
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      active = false;
    };
  }, [getAuthHeaders, isAuthenticated]);

  const saveComparisonRecord = async (record: { title: string; servingGrams: number; foodCodes: string[]; foodNames: string[] }) => {
    try {
      const res = await fetch('/api/comparisons', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(record),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.comparison) {
          setComparisonHistory((prev) => {
            const next = [data.comparison, ...prev].slice(0, 20);
            localStorage.setItem('aahariq_comparisons', JSON.stringify(next));
            return next;
          });
          showNotification(language === 'bn' ? 'খাদ্য তুলনা সংরক্ষিত হয়েছে' : 'Comparison saved to history');
          return;
        }
      }
    } catch {
      // ignore
    }
    const localRec: SavedFoodComparison = {
      id: 'cmp_' + Date.now(),
      ...record,
      createdAt: new Date().toISOString(),
    };
    setComparisonHistory((prev) => {
      const next = [localRec, ...prev].slice(0, 20);
      localStorage.setItem('aahariq_comparisons', JSON.stringify(next));
      return next;
    });
    showNotification(language === 'bn' ? 'খাদ্য তুলনা সংরক্ষিত হয়েছে' : 'Comparison saved to history');
  };

  const deleteComparisonRecord = async (id: string) => {
    try {
      await fetch(`/api/comparisons/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    } catch {
      // ignore
    }
    setComparisonHistory((prev) => {
      const next = prev.filter((c) => c.id !== id);
      localStorage.setItem('aahariq_comparisons', JSON.stringify(next));
      return next;
    });
  };

  // 12. Notifications Center Area
  const [appNotifications, setAppNotifications] = useState<AppNotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('aahariq_notifications');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  useEffect(() => {
    localStorage.setItem('aahariq_notifications', JSON.stringify(appNotifications.slice(0, 30)));
  }, [appNotifications]);

  const unreadNotificationsCount = appNotifications.filter((n) => !n.read).length;

  const pushAppNotification = (item: Omit<AppNotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newItem: AppNotificationItem = {
      ...item,
      id: 'n_' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    setAppNotifications((prev) => [newItem, ...prev].slice(0, 30));
  };

  const markAllNotificationsRead = () => {
    setAppNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismissAppNotification = (id: string) => {
    setAppNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAppNotifications = () => {
    setAppNotifications([]);
  };

  // 13. Toast Notifications
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currentView,
        setCurrentView,
        goBack,
        goHome,
        canGoBack: navMeta.canGoBack,
        previousView: navMeta.previousView,
        navigateToFavorites,
        recipesFilters,
        setRecipesFilters,
        activeCuisineId,
        setActiveCuisineId,
        selectedCuisineFilter,
        setSelectedCuisineFilter,
        selectedRecipe,
        setSelectedRecipe,
        favorites,
        favoriteRecipesMap,
        toggleFavorite,
        isFavorite,
        groceryItems,
        addGroceryItem,
        addBatchGroceryItems,
        toggleGroceryItem,
        removeGroceryItem,
        clearCompletedGrocery,
        savedMealPlans,
        saveMealPlan,
        deleteMealPlan,
        userProfile,
        isAuthenticated,
        authToken,
        login,
        logout,
        updateUserProfile,
        isAuthModalOpen,
        setIsAuthModalOpen,
        onboardingCompleted,
        completeOnboarding,
        searchQuery,
        setSearchQuery,
        searchHistory,
        addSearchHistory,
        clearSearchHistory,
        chatHistory,
        addChatMessage,
        clearChatHistory,
        scanHistory,
        saveScanReport,
        deleteScanReport,
        clearScanHistory,
        safetyReportsHistory,
        saveSafetyReport,
        deleteSafetyReport,
        clearSafetyHistory,
        journalEntries,
        addJournalEntry,
        deleteJournalEntry,
        clearJournalEntries,
        comparisonHistory,
        saveComparisonRecord,
        deleteComparisonRecord,
        appNotifications,
        unreadNotificationsCount,
        pushAppNotification,
        markAllNotificationsRead,
        dismissAppNotification,
        clearAppNotifications,
        notification,
        showNotification,
        getAuthHeaders,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
