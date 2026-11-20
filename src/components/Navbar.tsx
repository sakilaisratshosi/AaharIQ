import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AppView } from '../types';
import {
  UtensilsCrossed,
  Sparkles,
  BookOpen,
  Calculator,
  CalendarDays,
  Globe2,
  ShoppingCart,
  MessageSquare,
  User,
  Heart,
  Globe,
  Menu,
  X,
  Search,
  LogOut,
  Settings,
  LogIn,
  ChevronDown,
  ScanLine,
  ShieldCheck,
  Database,
  Scale,
  Recycle,
  BookOpenCheck,
  Bell,
  LayoutGrid,
  Compass,
  HeartHandshake,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    language,
    setLanguage,
    t,
    currentView,
    setCurrentView,
    navigateToFavorites,
    setRecipesFilters,
    favorites,
    groceryItems,
    searchQuery,
    setSearchQuery,
    addSearchHistory,
    userProfile,
    isAuthenticated,
    logout,
    setIsAuthModalOpen,
    appNotifications,
    unreadNotificationsCount,
    markAllNotificationsRead,
    dismissAppNotification,
    clearAppNotifications,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [modulesDropdownOpen, setModulesDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const modulesRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setProfileDropdownOpen(false);
      }
      if (modulesRef.current && !modulesRef.current.contains(target)) {
        setModulesDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!showSearchModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSearchModal(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showSearchModal]);

  // Lock background body scroll when the drawer menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileMenuOpen]);

  const pendingGroceryCount = groceryItems.filter((i) => !i.isCompleted).length;

  const primaryNavItems: Array<{ id: AppView; label: string; icon: any; badge?: number }> = [
    { id: 'dashboard', label: language === 'bn' ? 'হোম' : 'Home', icon: UtensilsCrossed },
    { id: 'recipes', label: language === 'bn' ? 'রেসিপি' : 'Recipes', icon: BookOpen },
    { id: 'healthy-guide', label: language === 'bn' ? 'পুষ্টি গাইড' : 'Guide', icon: HeartHandshake },
    { id: 'food-scanner', label: language === 'bn' ? 'স্ক্যানার' : 'Scanner', icon: ScanLine },
    { id: 'safety-center', label: language === 'bn' ? 'নিরাপত্তা' : 'Safety', icon: ShieldCheck },
    { id: 'bd-nutrition', label: language === 'bn' ? 'খাদ্য DB' : 'Food DB', icon: Database },
  ];

  const allModuleItems: Array<{ id: AppView; label: string; icon: any; badge?: number }> = [
    { id: 'nutrition', label: t.analyzeNutrition, icon: Calculator },
    { id: 'ingredient-ai', label: t.ingredientAI, icon: Sparkles },
    { id: 'food-journal', label: t.foodJournal, icon: BookOpenCheck },
    { id: 'food-comparison', label: t.foodComparison, icon: Scale },
    { id: 'food-waste', label: t.foodWaste, icon: Recycle },
    { id: 'meal-planner', label: t.mealPlanner, icon: CalendarDays },
    {
      id: 'grocery',
      label: t.groceryManager,
      icon: ShoppingCart,
      badge: pendingGroceryCount > 0 ? pendingGroceryCount : undefined,
    },
    { id: 'cuisines', label: t.globalCuisines, icon: Globe2 },
    { id: 'assistant', label: t.aiAssistant, icon: MessageSquare },
    { id: 'onboarding', label: t.onboarding, icon: Compass },
  ];

  const mobileNavItems: Array<{ id: AppView; label: string; icon: any; badge?: number }> = [
    { id: 'dashboard', label: language === 'bn' ? 'হোম' : 'Home', icon: UtensilsCrossed },
    { id: 'recipes', label: language === 'bn' ? 'গ্লোবাল রেসিপি ফাইন্ডার' : 'Global Recipe Finder', icon: BookOpen },
    { id: 'healthy-guide', label: language === 'bn' ? 'স্বাস্থ্যকর পুষ্টি গাইড' : 'Healthy Nutrition Guide', icon: HeartHandshake },
    { id: 'food-scanner', label: language === 'bn' ? 'ফুড স্ক্যানার' : 'Food Scanner', icon: ScanLine },
    { id: 'safety-center', label: language === 'bn' ? 'খাদ্য নিরাপত্তা কেন্দ্র' : 'Food Safety Center', icon: ShieldCheck },
    { id: 'bd-nutrition', label: language === 'bn' ? 'বাংলাদেশ খাদ্য ডেটাবেজ' : 'Bangladesh Food DB', icon: Database },
    { id: 'nutrition', label: language === 'bn' ? 'ক্যালোরি ও পুষ্টি বিশ্লেষক' : 'Calorie & Nutrition Analyzer', icon: Calculator },
    { id: 'ingredient-ai', label: language === 'bn' ? 'রেসিপি ফাইন্ডার' : 'Recipe Finder', icon: Sparkles },
    { id: 'food-journal', label: language === 'bn' ? 'খাদ্য জার্নাল' : 'Food Journal', icon: BookOpenCheck },
    { id: 'food-comparison', label: language === 'bn' ? 'খাদ্য তুলনা' : 'Food Comparison', icon: Scale },
    { id: 'food-waste', label: language === 'bn' ? 'অপচয় রোধ' : 'Food Waste Reduction', icon: Recycle },
    {
      id: 'meal-planner',
      label: language === 'bn' ? 'মিল প্ল্যানার' : 'Meal Planner',
      icon: CalendarDays,
    },
    {
      id: 'grocery',
      label: language === 'bn' ? 'বাজারের তালিকা' : 'Grocery Manager',
      icon: ShoppingCart,
      badge: pendingGroceryCount > 0 ? pendingGroceryCount : undefined,
    },
    { id: 'cuisines', label: language === 'bn' ? 'বৈশ্বিক রান্না' : 'Global Cuisines', icon: Globe2 },
    { id: 'assistant', label: language === 'bn' ? 'খাদ্য সহকারী' : 'Food Assistant', icon: MessageSquare },
    { id: 'onboarding', label: language === 'bn' ? 'দ্রুত সেটআপ' : 'Quick Setup', icon: Compass },
    { id: 'profile', label: language === 'bn' ? 'আমার প্রোফাইল' : 'My Profile', icon: User },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addSearchHistory(searchQuery.trim());
      setRecipesFilters((prev) => ({ ...prev, onlyFavorites: false }));
      setCurrentView('recipes');
      setShowSearchModal(false);
    }
  };

  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    setModulesDropdownOpen(false);
    setProfileDropdownOpen(false);
    setNotificationsOpen(false);
    setMobileMenuOpen(false);
  };

  const displayName =
    isAuthenticated && userProfile?.name
      ? userProfile.name
      : language === 'bn'
      ? 'অতিথি'
      : 'Guest';

  const userInitial =
    isAuthenticated && userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'G';

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#16382C] text-white shadow-md border-b border-[#255242] w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-3">
            {/* Brand Logo */}
            <button
              type="button"
              className="flex items-center space-x-2 sm:space-x-2.5 cursor-pointer group text-left shrink-0"
              onClick={() => navigateTo('dashboard')}
            >
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-[#E76F51] p-0.5 shadow-md transform transition-transform group-hover:scale-105 shrink-0">
                <div className="w-full h-full bg-[#122E24] rounded-[10px] flex items-center justify-center overflow-hidden">
                  <svg
                    viewBox="0 0 36 36"
                    className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 4C18 4 28 8 28 20C28 26.6274 22.6274 32 16 32C8 32 8 24 8 16C8 10 13 4 18 4Z"
                      fill="currentColor"
                      fillOpacity="0.2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M13 27C17 21 21 15 25 11"
                      stroke="#52B788"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="21" cy="15" r="2.5" fill="#E76F51" />
                    <circle cx="15" cy="22" r="1.8" fill="#74C69D" />
                  </svg>
                </div>
              </div>

              <div className="flex items-center space-x-1 sm:space-x-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                  Aahar<span className="text-emerald-400">IQ</span>
                </span>
              </div>
            </button>

            {/* Primary Desktop Nav + All Modules Dropdown */}
            <nav className="hidden lg:flex items-center space-x-1">
              {primaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigateTo(item.id)}
                    className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-emerald-600/35 text-emerald-200 border border-emerald-500/40 font-semibold'
                        : 'text-emerald-100/90 hover:bg-[#1E4A3B] hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* All Modules Menu */}
              <div className="relative" ref={modulesRef}>
                <button
                  type="button"
                  onClick={() => setModulesDropdownOpen(!modulesDropdownOpen)}
                  className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    allModuleItems.some((m) => m.id === currentView) || modulesDropdownOpen
                      ? 'bg-emerald-600/35 text-emerald-200 border border-emerald-500/40 font-semibold'
                      : 'text-emerald-100/90 hover:bg-[#1E4A3B] hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5 shrink-0 text-amber-300" />
                  <span>{language === 'bn' ? 'সকল টুলস' : 'Tools'}</span>
                  {pendingGroceryCount > 0 && (
                    <span className="px-1.5 rounded-full text-[10px] font-bold bg-[#E76F51] text-white font-mono-num">
                      {pendingGroceryCount}
                    </span>
                  )}
                  <ChevronDown className="w-3 h-3 opacity-80" />
                </button>

                {modulesDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-stone-200 py-2 z-50 text-stone-800 animate-slide-up">
                    <div className="px-4 py-1.5 border-b border-stone-100 text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                      {language === 'bn' ? 'AaharIQ প্ল্যাটফর্ম মডিউল' : 'AaharIQ Platform Tools'}
                    </div>
                    <div className="py-1">
                      {allModuleItems.map((mod) => {
                        const Icon = mod.icon;
                        const active = currentView === mod.id;
                        return (
                          <button
                            key={mod.id}
                            type="button"
                            onClick={() => navigateTo(mod.id)}
                            className={`w-full px-4 py-2 text-left text-xs flex items-center justify-between transition-colors ${
                              active
                                ? 'bg-emerald-50 text-emerald-900 font-bold'
                                : 'text-stone-700 hover:bg-stone-50 font-medium'
                            }`}
                          >
                            <span className="flex items-center space-x-2.5">
                              <Icon className="w-3.5 h-3.5 text-emerald-700" />
                              <span>{mod.label}</span>
                            </span>
                            {mod.badge !== undefined && (
                              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E76F51] text-white font-mono-num">
                                {mod.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Right Utility Controls */}
            <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowSearchModal(true)}
                className="p-1.5 sm:p-2 rounded-lg text-emerald-200 hover:text-white hover:bg-[#1E4A3B] transition-colors"
                title={language === 'bn' ? 'অনুসন্ধান' : 'Search'}
                aria-label="Global Search"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Notifications Center */}
              <div className="relative" ref={notificationsRef}>
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-1.5 sm:p-2 rounded-lg text-emerald-200 hover:text-white hover:bg-[#1E4A3B] transition-colors"
                  title={t.notifications}
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#E76F51] text-white font-mono-num">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-20px)] bg-white rounded-2xl shadow-2xl border border-stone-200 z-50 text-stone-800 overflow-hidden animate-slide-up">
                    <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between bg-stone-50">
                      <span className="text-xs font-extrabold text-stone-900">
                        {t.notifications} ({appNotifications.length})
                      </span>
                      <div className="flex items-center space-x-2 text-[11px]">
                        {unreadNotificationsCount > 0 && (
                          <button
                            type="button"
                            onClick={markAllNotificationsRead}
                            className="text-emerald-700 hover:underline font-semibold"
                          >
                            {language === 'bn' ? 'সব পঠিত' : 'Mark read'}
                          </button>
                        )}
                        {appNotifications.length > 0 && (
                          <button
                            type="button"
                            onClick={clearAppNotifications}
                            className="text-stone-400 hover:text-rose-600 font-semibold"
                          >
                            {language === 'bn' ? 'মুছুন' : 'Clear'}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
                      {appNotifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-stone-400">
                          {language === 'bn' ? 'কোনো নতুন বিজ্ঞপ্তি নেই।' : 'No notifications right now.'}
                        </div>
                      ) : (
                        appNotifications.map((item) => (
                          <div
                            key={item.id}
                            className={`p-3.5 text-xs space-y-1 transition-colors ${
                              item.read ? 'bg-white' : 'bg-emerald-50/40'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (item.targetView) navigateTo(item.targetView);
                                }}
                                className="font-bold text-stone-900 text-left hover:text-emerald-700"
                              >
                                {language === 'bn' ? item.titleBn : item.title}
                              </button>
                              <button
                                type="button"
                                onClick={() => dismissAppNotification(item.id)}
                                className="text-stone-400 hover:text-stone-600 shrink-0"
                                aria-label="Dismiss notification"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            <p className="text-[11px] text-stone-600 leading-relaxed">
                              {language === 'bn' ? item.messageBn : item.message}
                            </p>
                            <div className="text-[10px] text-stone-400 font-mono-num">{item.timestamp}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Language Switcher */}
              <button
                type="button"
                onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
                className="flex items-center space-x-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#112920] hover:bg-[#1E4A3B] text-[11px] sm:text-xs font-bold text-emerald-200 border border-emerald-800/40 transition-colors shrink-0"
                title="Change Language / ভাষা পরিবর্তন"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'en' ? 'বাং' : 'EN'}</span>
              </button>

              {/* Favorites */}
              <button
                type="button"
                onClick={() => {
                  navigateToFavorites();
                  setModulesDropdownOpen(false);
                  setProfileDropdownOpen(false);
                  setNotificationsOpen(false);
                  setMobileMenuOpen(false);
                }}
                className="relative p-2 rounded-lg text-emerald-200 hover:text-white hover:bg-[#1E4A3B] transition-colors hidden sm:flex items-center"
                title={t.favorites}
                aria-label={t.favorites}
              >
                <Heart className={`w-4 h-4 ${favorites.length > 0 ? 'text-rose-400 fill-rose-400/20' : ''}`} />
                {favorites.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-500 text-white font-mono-num">
                    {favorites.length}
                  </span>
                )}
              </button>

              {/* User Profile Dropdown */}
              <div className="relative shrink-0" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className={`flex items-center space-x-1.5 pl-1.5 pr-2 py-1 rounded-xl border transition-all text-xs shrink-0 ${
                    currentView === 'profile' || profileDropdownOpen
                      ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200'
                      : 'bg-[#122E24] border-emerald-800/50 text-white hover:bg-[#1A4234]'
                  }`}
                  aria-expanded={profileDropdownOpen}
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs border border-emerald-400/40 shrink-0">
                    {userInitial}
                  </div>
                  <span className="font-medium max-w-[90px] truncate">{displayName}</span>
                  <ChevronDown className="w-3 h-3 text-emerald-300 opacity-70 shrink-0" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-stone-200 py-2 z-50 text-stone-800 animate-slide-up">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs font-bold text-stone-900 truncate">{displayName}</p>
                      <p className="text-[11px] text-stone-500 truncate">
                        {isAuthenticated && userProfile?.email
                          ? userProfile.email
                          : language === 'bn'
                          ? 'অতিথি মোড (লোকাল সেশন)'
                          : 'Guest mode (Local workspace)'}
                      </p>
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => navigateTo('profile')}
                        className="w-full px-4 py-2 text-left text-xs text-stone-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center space-x-2 transition-colors font-medium"
                      >
                        <User className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{t.profile}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => navigateTo('onboarding')}
                        className="w-full px-4 py-2 text-left text-xs text-stone-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center space-x-2 transition-colors font-medium"
                      >
                        <Compass className="w-3.5 h-3.5 text-stone-500" />
                        <span>{t.onboarding}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => navigateTo('profile')}
                        className="w-full px-4 py-2 text-left text-xs text-stone-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center space-x-2 transition-colors font-medium"
                      >
                        <Settings className="w-3.5 h-3.5 text-stone-500" />
                        <span>{language === 'bn' ? 'সেটিংস' : 'Settings'}</span>
                      </button>
                    </div>

                    <div className="border-t border-stone-100 pt-1">
                      {isAuthenticated ? (
                        <button
                          type="button"
                          onClick={() => {
                            logout();
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2 transition-colors font-bold"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>{t.signOut}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setIsAuthModalOpen(true);
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-xs text-emerald-700 hover:bg-emerald-50 flex items-center space-x-2 transition-colors font-bold"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>{t.signIn}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Menu Toggle (visible on all screens including desktop/Edge) */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 sm:p-2 rounded-lg text-emerald-200 hover:text-white hover:bg-[#1E4A3B] transition-colors shrink-0"
                aria-label="Toggle Menu"
                title={language === 'bn' ? 'মেনু' : 'Menu'}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Drawer (Half-screen side panel on desktop, responsive on mobile) */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Side Drawer Container */}
            <div
              className="fixed top-16 right-0 z-50 w-full sm:w-[380px] md:w-[420px] max-w-full h-[calc(100vh-4rem)] bg-[#112920] border-l border-[#1E4A3B] shadow-2xl flex flex-col overscroll-contain animate-slide-up"
              style={{ overscrollBehavior: 'contain' }}
            >
              {/* Drawer Header with Close (X) Button (FIXED at top) */}
              <div className="shrink-0 px-4 pt-3 pb-2.5 bg-[#112920] border-b border-emerald-800/40 z-10 flex items-center justify-between text-emerald-100">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300/90 flex items-center space-x-1.5">
                  <LayoutGrid className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{language === 'bn' ? 'মেনু ও ফিচার' : 'Menu & Features'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-[#183D30] hover:bg-rose-900/50 text-emerald-300 hover:text-rose-200 border border-emerald-700/50 hover:border-rose-400/60 transition-all cursor-pointer active:scale-95"
                  aria-label="Close drawer"
                  title={language === 'bn' ? 'বন্ধ করুন' : 'Close'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Features Content Area */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 overscroll-contain">
                <div className="p-2.5 mb-2 bg-[#183D30] rounded-xl flex items-center justify-between text-xs text-emerald-200 border border-emerald-700/40">
                  <span className="font-bold flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{displayName}</span>
                  </span>
                  {isAuthenticated ? (
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="text-xs text-rose-300 font-bold underline"
                    >
                      {t.signOut}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setMobileMenuOpen(false);
                      }}
                      className="text-xs text-emerald-300 font-bold underline"
                    >
                      {language === 'bn' ? 'লগইন করুন' : 'Sign In'}
                    </button>
                  )}
                </div>

                {mobileNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigateTo(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-emerald-600/40 text-emerald-200 border border-emerald-500/30 font-semibold shadow-xs'
                          : 'text-emerald-100/90 hover:bg-[#1A4033]'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#E76F51] text-white font-mono-num">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </header>

      {/* Global Quick Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-5 border border-emerald-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm flex items-center space-x-2">
                <Search className="w-4 h-4 text-emerald-600" />
                <span>{language === 'bn' ? 'দ্বিভাষিক রেসিপি ও খাদ্য অনুসন্ধান' : 'Bilingual Food & Recipe Search'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="mt-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'bn' ? 'খুঁজুন (যেমন: শাক, বিরিয়ানি, ডিম, আলু)...' : 'Search (e.g. Spinach, Biryani, Egg, Potato)...'}
                  autoFocus
                  className="w-full pl-4 pr-24 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 px-4 py-1.5 bg-[#1B4332] text-white rounded-lg text-xs font-semibold hover:bg-[#255C45] transition-colors"
                >
                  {t.searchButton}
                </button>
              </div>
            </form>

            <div className="mt-4">
              <p className="text-xs font-semibold text-stone-500 mb-2">
                {language === 'bn' ? 'দ্রুত অন্বেষণ:' : 'Quick Shortcuts:'}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { en: 'Biryani', bn: 'বিরিয়ানি' },
                  { en: 'Egg', bn: 'ডিম' },
                  { en: 'Potato', bn: 'আলু' },
                  { en: 'Spinach', bn: 'শাক' },
                  { en: 'Shorshe Ilish', bn: 'সর্ষে ইলিশ' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const val = language === 'bn' ? item.bn : item.en;
                      setSearchQuery(val);
                      addSearchHistory(val);
                      setRecipesFilters((prev) => ({ ...prev, onlyFavorites: false }));
                      setCurrentView('recipes');
                      setShowSearchModal(false);
                    }}
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs font-medium border border-emerald-200/50 transition-colors"
                  >
                    {language === 'bn' ? item.bn : item.en}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
