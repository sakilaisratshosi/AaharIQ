import React from 'react';
import { useApp } from '../context/AppContext';
import { CUISINES_DATA } from '../data/cuisinesData';
import { RECIPES_DATABASE } from '../data/recipesData';
import { resolveRecipeImage } from '../utils/recipeImageResolver';
import {
  Globe2,
  Clock,
  Flame,
  ArrowRight,
  ShieldCheck,
  Check,
  BookOpen,
} from 'lucide-react';

export const CuisinesView: React.FC = () => {
  const {
    language,
    t,
    setCurrentView,
    setSelectedRecipe,
    setSelectedCuisineFilter,
    setRecipesFilters,
    activeCuisineId,
    setActiveCuisineId,
  } = useApp();

  const activeCuisine =
    CUISINES_DATA.find((c) => c.id === activeCuisineId) || CUISINES_DATA[0];

  const matchingRecipes = RECIPES_DATABASE.filter(
    (r) => r.cuisine.toLowerCase() === activeCuisineId.toLowerCase()
  );

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#16382C] via-[#1E4A3B] to-[#122E24] text-white p-6 sm:p-8 rounded-3xl border border-emerald-800/40 shadow-lg">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
            <Globe2 className="w-3.5 h-3.5 text-amber-300" />
            <span>{language === 'bn' ? 'বিশ্ব রন্ধন ও পুষ্টি ঐতিহ্য' : 'Global Gastronomy & Nutrition'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            {t.globalCuisines}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            {language === 'bn'
              ? 'বিশ্বের ৯টি ঐতিহ্যবাহী রান্নার স্বাস্থ্য দর্শন, প্রধান উপাদান ও সুষম পুষ্টিকর রেসিপি আবিষ্কার করুন।'
              : 'Discover traditional health philosophies, superfood ingredients, and balanced recipes from 9 iconic culinary cultures.'}
          </p>
        </div>

        {/* Horizontal Cuisine Selector Tabs */}
        <div className="flex items-center space-x-2 mt-6 overflow-x-auto pb-2 scrollbar-none">
          {CUISINES_DATA.map((cuisine) => {
            const isActive = cuisine.id === activeCuisineId;
            return (
              <button
                key={cuisine.id}
                onClick={() => setActiveCuisineId(cuisine.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white text-emerald-950 shadow-md font-extrabold'
                    : 'bg-emerald-900/60 text-emerald-200 hover:bg-emerald-900'
                }`}
              >
                {language === 'bn' ? cuisine.nameBn : cuisine.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Cuisine Deep-Dive Spotlight Card */}
      <div className="bg-white rounded-3xl overflow-hidden border border-emerald-950/10 shadow-sm">
        <div className="relative h-64 sm:h-80 w-full overflow-hidden">
          <img
            src={activeCuisine.image}
            alt={activeCuisine.name}
            referrerPolicy="no-referrer"
            onError={(e) => {
              const img = e.currentTarget;
              if (!img.dataset.fallbackApplied) {
                img.dataset.fallbackApplied = '1';
                img.src = '/images/food-placeholder.jpg';
              }
            }}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white max-w-3xl space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#E76F51] text-white">
              {activeCuisine.id} Tradition
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">
              {language === 'bn' ? activeCuisine.nameBn : activeCuisine.name}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              {language === 'bn' ? activeCuisine.taglineBn : activeCuisine.tagline}
            </p>
          </div>
        </div>

        {/* Culture & Health Details */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
            {/* Heritage Column */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
              <h3 className="font-extrabold text-stone-900 text-sm flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                <span>{language === 'bn' ? 'সাংস্কৃতিক ইতিহাস ও ঐতিহ্য' : 'Cultural Heritage & Principles'}</span>
              </h3>
              <p className="text-stone-600">
                {language === 'bn' ? activeCuisine.heritageTextBn : activeCuisine.heritageText}
              </p>
            </div>

            {/* Health Column */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
              <h3 className="font-extrabold text-emerald-900 text-sm flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>{language === 'bn' ? 'স্বাস্থ্য ও পুষ্টিবিজ্ঞান দর্শন' : 'Nutrition Science & Vitality'}</span>
              </h3>
              <p className="text-stone-700">
                {language === 'bn' ? activeCuisine.healthPhilosophyBn : activeCuisine.healthPhilosophy}
              </p>
            </div>
          </div>

          {/* Signature Ingredients Strip */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
              {language === 'bn' ? 'প্রধান সিগনেচার উপাদানসমূহ:' : 'Key Signature Ingredients:'}
            </h4>
            <div className="flex flex-wrap gap-2 text-xs">
              {activeCuisine.signatureIngredients.map((ing, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 text-stone-800 font-bold border border-stone-200/80 flex items-center space-x-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'bn' ? ing.nameBn : ing.name}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Relevant Recipes for this Cuisine */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-stone-900 tracking-tight">
            {language === 'bn'
              ? `${activeCuisine.nameBn} এর রেসিপিসমূহ (${matchingRecipes.length})`
              : `Featured ${activeCuisine.name} Recipes (${matchingRecipes.length})`}
          </h3>
          <button
            onClick={() => {
              setRecipesFilters((prev) => ({ ...prev, onlyFavorites: false }));
              setSelectedCuisineFilter(activeCuisine.id);
              setCurrentView('recipes');
            }}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
          >
            <span>{language === 'bn' ? 'সবগুলো রেসিপি ফিল্টার করুন' : 'Filter All in Recipes'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {matchingRecipes.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-400 text-xs">
            {language === 'bn' ? 'শীঘ্রই নতুন রেসিপি যুক্ত হচ্ছে।' : 'New recipes arriving soon.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {matchingRecipes.map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => setSelectedRecipe(recipe)}
                className="group bg-white rounded-2xl overflow-hidden border border-emerald-950/10 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="relative h-44 w-full overflow-hidden bg-stone-100">
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
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[11px] font-semibold bg-black/40 backdrop-blur-sm p-1.5 rounded-lg">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-emerald-300" />
                      <span>
                        {recipe.prepTime + recipe.cookTime} {language === 'bn' ? 'মিনিট' : 'mins'}
                      </span>
                    </span>
                    <span className="flex items-center space-x-1 font-bold text-amber-300">
                      <Flame className="w-3 h-3" />
                      <span>
                        {recipe.caloriesPerServing} {language === 'bn' ? 'ক্যালরি' : 'kcal'}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h4 className="font-extrabold text-stone-900 text-sm group-hover:text-emerald-700 transition-colors line-clamp-1">
                    {language === 'bn' ? recipe.name_bn || recipe.nameBn : recipe.name_en || recipe.name}
                  </h4>
                  <p className="text-xs text-stone-500 line-clamp-2">
                    {language === 'bn' ? recipe.description_bn || recipe.descriptionBn : recipe.description_en || recipe.description}
                  </p>
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-emerald-800 font-bold">
                    <span>
                      {recipe.proteinPerServing}g {language === 'bn' ? 'প্রোটিন' : 'Protein'}
                    </span>
                    <span className="text-stone-400 text-[11px] group-hover:text-emerald-700">
                      {language === 'bn' ? 'প্রণালী দেখুন →' : 'View Method →'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
