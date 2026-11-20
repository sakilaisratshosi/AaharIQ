import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RECIPES_DATABASE } from '../data/recipesData';
import { resolveRecipeImage } from '../utils/recipeImageResolver';
import {
  User,
  Heart,
  CalendarDays,
  Settings,
  Trash2,
  LogOut,
  Compass,
  BookOpenCheck,
  Scale,
  Database,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const {
    language,
    setLanguage,
    t,
    userProfile,
    isAuthenticated,
    logout,
    setIsAuthModalOpen,
    updateUserProfile,
    favorites,
    favoriteRecipesMap,
    toggleFavorite,
    savedMealPlans,
    deleteMealPlan,
    setSelectedRecipe,
    searchHistory,
    clearSearchHistory,
    setSearchQuery,
    setCurrentView,
    journalEntries,
    clearJournalEntries,
    scanHistory,
    clearScanHistory,
    safetyReportsHistory,
    clearSafetyHistory,
    comparisonHistory,
  } = useApp();

  const [nameInput, setNameInput] = useState(userProfile?.name || '');
  const [calorieInput, setCalorieInput] = useState(userProfile?.dailyCalorieGoal || 2000);
  const [dietaryInput, setDietaryInput] = useState(userProfile?.dietaryPreference || 'Balanced & Halal');
  const [activeTab, setActiveTab] = useState<'favorites' | 'plans' | 'settings'>('favorites');

  React.useEffect(() => {
    if (userProfile) {
      setNameInput(userProfile.name);
      setCalorieInput(userProfile.dailyCalorieGoal);
      setDietaryInput(userProfile.dietaryPreference);
    }
  }, [userProfile]);

  const favoriteRecipes = React.useMemo(() => {
    const byId = new Map(RECIPES_DATABASE.map((r) => [r.id, r]));
    return favorites
      .map((id) => favoriteRecipesMap[id] || byId.get(id))
      .filter((r): r is NonNullable<typeof r> => Boolean(r));
  }, [favorites, favoriteRecipesMap]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: nameInput.trim() || 'Guest Explorer',
      dailyCalorieGoal: Number(calorieInput) || 2000,
      dietaryPreference: dietaryInput,
    });
  };

  const displayName =
    isAuthenticated && userProfile?.name
      ? userProfile.name
      : userProfile?.name || (language === 'bn' ? 'অতিথি' : 'Guest');

  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="space-y-8 pb-12 animate-fade-in max-w-5xl mx-auto">
      {/* Profile Header Banner */}
      <div className="bg-gradient-to-r from-[#16382C] via-[#1E4A3B] to-[#122E24] text-white p-6 sm:p-8 rounded-3xl border border-emerald-800/40 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-black text-2xl flex items-center justify-center border-2 border-emerald-300 shadow-md">
              {userInitial}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black">{displayName}</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                  {isAuthenticated
                    ? language === 'bn'
                      ? 'নিবন্ধিত অ্যাকাউন্ট'
                      : 'Registered Account'
                    : language === 'bn'
                    ? 'অতিথি ওয়ার্কস্পেস'
                    : 'Guest Workspace'}
                </span>
              </div>
              <p className="text-xs text-emerald-200/80">
                {isAuthenticated && userProfile?.email
                  ? userProfile.email
                  : language === 'bn'
                  ? 'অ্যাকাউন্ট যুক্ত করতে সাইন ইন করুন'
                  : 'Sign in or create an account to sync private data'}
              </p>
              <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-emerald-300 font-mono-num">
                <span className="px-2 py-0.5 rounded bg-emerald-950/60">
                  {language === 'bn' ? 'দৈনিক লক্ষ্য:' : 'Goal:'} {userProfile?.dailyCalorieGoal || 2000} kcal
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950/60">
                  {userProfile?.dietaryPreference || 'Balanced & Halal'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setCurrentView('onboarding')}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold border border-white/15 transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-300" />
              <span>{t.onboarding}</span>
            </button>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={logout}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-bold border border-rose-400/40 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t.signOut}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-extrabold shadow-md transition-colors"
              >
                <User className="w-4 h-4" />
                <span>{language === 'bn' ? 'সাইন ইন / নিবন্ধন' : 'Sign In / Sign Up'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-8 pt-4 border-t border-emerald-800/60">
          <button
            type="button"
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'favorites'
                ? 'bg-white text-emerald-950 shadow-md'
                : 'text-emerald-200 hover:bg-emerald-900/60'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>
              {t.favorites} ({favorites.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('plans')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'plans'
                ? 'bg-white text-emerald-950 shadow-md'
                : 'text-emerald-200 hover:bg-emerald-900/60'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 text-teal-500" />
            <span>
              {language === 'bn' ? 'সংরক্ষিত মিল প্ল্যান' : 'Saved Plans'} ({savedMealPlans.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'settings'
                ? 'bg-white text-emerald-950 shadow-md'
                : 'text-emerald-200 hover:bg-emerald-900/60'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'সেটিংস ও ডেটা নিয়ন্ত্রণ' : 'Settings & Data Controls'}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: FAVORITES */}
      {activeTab === 'favorites' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-stone-900">
              {language === 'bn' ? 'পছন্দের রেসিপিসমূহ' : 'Favorite Recipes'}
            </h2>
            <span className="text-xs text-stone-500 font-mono-num">{favoriteRecipes.length} recipes</span>
          </div>

          {favoriteRecipes.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 text-stone-400 space-y-3">
              <Heart className="w-10 h-10 mx-auto text-stone-300" />
              <p className="text-xs">
                {language === 'bn'
                  ? 'আপনার কোনো পছন্দের রেসিপি যুক্ত করা নেই।'
                  : 'You have not added any favorite recipes yet.'}
              </p>
              <button
                type="button"
                onClick={() => setCurrentView('recipes')}
                className="px-4 py-2 bg-[#1B4332] text-white rounded-xl text-xs font-bold"
              >
                {t.exploreRecipes}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {favoriteRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="bg-white rounded-2xl overflow-hidden border border-emerald-950/10 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div
                    className="relative h-44 w-full cursor-pointer"
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    <img
                      src={resolveRecipeImage(recipe)}
                      alt={language === 'bn' ? recipe.name_bn || recipe.nameBn : recipe.name_en || recipe.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (!img.dataset.fallbackApplied) {
                          img.dataset.fallbackApplied = '1';
                          img.src = '/images/food-placeholder.jpg';
                        }
                      }}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(recipe.id);
                      }}
                      className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/80 hover:bg-white text-rose-500 shadow-sm"
                    >
                      <Heart className="w-4 h-4 fill-rose-500" />
                    </button>
                    <div className="absolute bottom-2 left-2 right-2 flex justify-between text-white text-[11px] font-semibold bg-black/45 p-1.5 rounded-lg font-mono-num">
                      <span>
                        {recipe.prepTime + recipe.cookTime} {language === 'bn' ? 'মি' : 'mins'}
                      </span>
                      <span className="text-amber-300">{recipe.caloriesPerServing} kcal</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3
                      onClick={() => setSelectedRecipe(recipe)}
                      className="font-extrabold text-stone-900 text-sm hover:text-emerald-700 transition-colors cursor-pointer line-clamp-1"
                    >
                      {language === 'bn' ? recipe.name_bn || recipe.nameBn : recipe.name_en || recipe.name}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2">
                      {language === 'bn' ? recipe.description_bn || recipe.descriptionBn : recipe.description_en || recipe.description}
                    </p>
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                      <span className="text-emerald-800 font-bold font-mono-num">
                        {recipe.proteinPerServing}g {language === 'bn' ? 'প্রোটিন' : 'Protein'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedRecipe(recipe)}
                        className="text-stone-700 hover:text-emerald-800 font-bold"
                      >
                        {language === 'bn' ? 'বিস্তারিত' : 'View'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SAVED MEAL PLANS */}
      {activeTab === 'plans' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-stone-900">
              {language === 'bn' ? 'সংরক্ষিত মিল প্ল্যান' : 'Saved Daily Plans'}
            </h2>
            <span className="text-xs text-stone-500 font-mono-num">{savedMealPlans.length} plans</span>
          </div>

          {savedMealPlans.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 text-stone-400 space-y-3">
              <CalendarDays className="w-10 h-10 mx-auto text-stone-300" />
              <p className="text-xs">
                {language === 'bn'
                  ? 'কোনো সংরক্ষিত মিল প্ল্যান নেই।'
                  : 'No saved meal plans yet. Generate one in the Meal Planner and save it.'}
              </p>
              <button
                type="button"
                onClick={() => setCurrentView('meal-planner')}
                className="px-4 py-2 bg-[#1B4332] text-white rounded-xl text-xs font-bold"
              >
                {t.mealPlanner}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {savedMealPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between border-b border-stone-100 pb-3">
                    <div>
                      <h3 className="font-extrabold text-stone-900 text-base">
                        {language === 'bn' ? plan.titleBn : plan.title}
                      </h3>
                      <span className="text-xs text-stone-400 font-mono-num">
                        {plan.savedAt} · Target: {plan.targetCalories} kcal
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteMealPlan(plan.id)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {plan.meals.map((meal, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1 text-xs"
                      >
                        <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                          {language === 'bn' ? meal.categoryBn : meal.category}
                        </span>
                        <h4 className="font-bold text-stone-900 block truncate pt-1">
                          {language === 'bn' ? meal.dishNameBn : meal.dishName}
                        </h4>
                        <div className="flex justify-between text-[11px] text-stone-500 font-medium font-mono-num">
                          <span className="text-orange-600 font-bold">{meal.calories} kcal</span>
                          <span>{meal.proteinG}g Protein</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SETTINGS, LANGUAGE & ACCOUNT DATA CONTROLS */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-sm space-y-4">
            <h3 className="font-extrabold text-stone-900 text-sm border-b border-stone-100 pb-3">
              {language === 'bn' ? 'ব্যক্তিগত তথ্য ও পুষ্টি লক্ষ্য' : 'Personal & Nutrition Settings'}
            </h3>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  {language === 'bn' ? 'আপনার নাম' : 'Display Name'}
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  {t.calorieTarget}
                </label>
                <input
                  type="number"
                  min={1200}
                  max={4500}
                  step={50}
                  value={calorieInput}
                  onChange={(e) => setCalorieInput(Number(e.target.value))}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs font-mono-num focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  {t.dietaryPreference}
                </label>
                <input
                  type="text"
                  value={dietaryInput}
                  onChange={(e) => setDietaryInput(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#1B4332] hover:bg-[#255C45] text-white rounded-xl font-bold transition-colors shadow-sm"
              >
                {language === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Preferences'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-sm space-y-5">
            {/* Account Activity Summary & Data Controls */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-stone-900 text-sm border-b border-stone-100 pb-3 flex items-center space-x-2">
                <Database className="w-4 h-4 text-emerald-700" />
                <span>{language === 'bn' ? 'অ্যাকাউন্ট ডেটা ব্যবস্থাপনা' : 'Stored Workspace Data Controls'}</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200/70">
                  <div className="flex items-center space-x-2">
                    <BookOpenCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="font-semibold text-stone-800">
                      {t.foodJournal}: <span className="font-mono-num">{journalEntries.length}</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setCurrentView('food-journal')}
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      {language === 'bn' ? 'খুলুন' : 'Open'}
                    </button>
                    {journalEntries.length > 0 && (
                      <button
                        type="button"
                        onClick={clearJournalEntries}
                        className="text-rose-600 font-bold hover:underline"
                      >
                        {language === 'bn' ? 'মুছুন' : 'Clear'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200/70">
                  <div className="flex items-center space-x-2">
                    <Scale className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="font-semibold text-stone-800">
                      {t.foodComparison}: <span className="font-mono-num">{comparisonHistory.length}</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentView('food-comparison')}
                    className="text-emerald-700 font-bold hover:underline"
                  >
                    {language === 'bn' ? 'খুলুন' : 'Open'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200/70">
                  <span className="font-semibold text-stone-800">
                    {language === 'bn' ? 'স্ক্যান ইতিহাস:' : 'Food Scan Reports:'}{' '}
                    <span className="font-mono-num">{scanHistory.length}</span>
                  </span>
                  {scanHistory.length > 0 && (
                    <button
                      type="button"
                      onClick={clearScanHistory}
                      className="text-rose-600 font-bold hover:underline"
                    >
                      {language === 'bn' ? 'মুছুন' : 'Clear'}
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200/70">
                  <span className="font-semibold text-stone-800">
                    {language === 'bn' ? 'নিরাপত্তা রিপোর্ট:' : 'Safety Reports:'}{' '}
                    <span className="font-mono-num">{safetyReportsHistory.length}</span>
                  </span>
                  {safetyReportsHistory.length > 0 && (
                    <button
                      type="button"
                      onClick={clearSafetyHistory}
                      className="text-rose-600 font-bold hover:underline"
                    >
                      {language === 'bn' ? 'মুছুন' : 'Clear'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Search History */}
            <div className="pt-3 border-t border-stone-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-extrabold text-stone-900 text-xs">
                  {language === 'bn' ? 'অনুসন্ধানের ইতিহাস' : 'Recent Search History'}
                </h3>
                {searchHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={clearSearchHistory}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold"
                  >
                    {language === 'bn' ? 'মুছুন' : 'Clear'}
                  </button>
                )}
              </div>

              {searchHistory.length === 0 ? (
                <p className="text-xs text-stone-400">
                  {language === 'bn' ? 'কোনো ইতিহাস নেই।' : 'No search history recorded.'}
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 text-xs">
                  {searchHistory.map((term, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setSearchQuery(term);
                        setCurrentView('recipes');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language Preference */}
            <div className="pt-3 border-t border-stone-100 space-y-2 text-xs">
              <span className="font-bold text-stone-700 block">
                {language === 'bn' ? 'ভাষা নির্বাচন' : 'Language Preference'}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-4 py-2 rounded-xl font-bold border transition-colors ${
                    language === 'en'
                      ? 'bg-[#1B4332] text-white border-[#1B4332]'
                      : 'bg-stone-50 text-stone-700 border-stone-200'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('bn')}
                  className={`px-4 py-2 rounded-xl font-bold border transition-colors ${
                    language === 'bn'
                      ? 'bg-[#1B4332] text-white border-[#1B4332]'
                      : 'bg-stone-50 text-stone-700 border-stone-200'
                  }`}
                >
                  বাংলা
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
