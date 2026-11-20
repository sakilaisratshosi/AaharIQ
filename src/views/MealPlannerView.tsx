import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CalendarDays,
  Sparkles,
  Flame,
  CheckCircle2,
  Bookmark,
  ShoppingCart,
  ShieldAlert,
  Clock,
  Utensils,
  Plus,
  Trash2,
  ChevronRight,
  Info,
} from 'lucide-react';

const COMMON_ALLERGIES = [
  'Peanuts',
  'Tree Nuts',
  'Dairy / Milk',
  'Eggs',
  'Shellfish',
  'Wheat / Gluten',
  'Soy',
];

export const MealPlannerView: React.FC = () => {
  const { language, t, saveMealPlan, savedMealPlans, deleteMealPlan, addBatchGroceryItems, showNotification } = useApp();

  const [targetCalories, setTargetCalories] = useState<number>(2000);
  const [dietaryPref, setDietaryPref] = useState<string>('Balanced');
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(['Peanuts']);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([
    'Bangladeshi',
    'Mediterranean',
  ]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);

  const toggleAllergy = (allergy: string) => {
    setSelectedAllergies((prev) =>
      prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy]
    );
  };

  const toggleCuisine = (c: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(c) ? (prev.length > 1 ? prev.filter((item) => item !== c) : prev) : [...prev, c]
    );
  };

  const handleGeneratePlan = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/gemini/meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calorieTarget: targetCalories,
          dietaryPreference: dietaryPref,
          allergies: selectedAllergies,
          cuisines: selectedCuisines,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate meal plan');
      setGeneratedPlan(data.mealPlan);
    } catch (err: any) {
      setError(err.message || 'Error connecting with Gemini Meal Planner.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToProfile = () => {
    if (!generatedPlan) return;
    saveMealPlan({
      title: generatedPlan.title,
      titleBn: generatedPlan.titleBn,
      targetCalories: generatedPlan.targetCalories || targetCalories,
      dailyNutritionSummary: generatedPlan.dailyNutritionSummary,
      meals: generatedPlan.meals,
      dietitianNotes: generatedPlan.dietitianNotes,
      dietitianNotesBn: generatedPlan.dietitianNotesBn,
    });
  };

  const handleSendAllToGrocery = (meals: any[]) => {
    const allItems: any[] = [];
    for (const m of meals) {
      if (Array.isArray(m.ingredients)) {
        for (const ing of m.ingredients) {
          allItems.push({
            name: ing,
            amount: '1',
            unit: 'portion',
            category: 'produce' as const,
            addedFrom: `Plan: ${m.dishName}`,
          });
        }
      }
    }
    if (allItems.length > 0) {
      addBatchGroceryItems(allItems);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#16382C] via-[#1E4A3B] to-[#122E24] text-white p-6 sm:p-8 rounded-3xl border border-emerald-800/40 shadow-lg">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold">
            <CalendarDays className="w-3.5 h-3.5 text-teal-300" />
            <span>{language === 'bn' ? 'সুষম পুষ্টি ব্যবস্থাপনা' : 'Evidence-Based Nutrition Balance'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            {t.mealPlanner}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            {language === 'bn'
              ? 'আপনার ক্যালোরি লক্ষ্য ও পছন্দের ওপর ভিত্তি করে সকালের নাস্তা, দুপুর, রাত ও বিকালের নাস্তার সুষম খাদ্যতালিকা তৈরি করুন। কোনো কঠোর অনশন বা অস্বাস্থ্যকর সীমাবদ্ধতা ছাড়া।'
              : 'Construct balanced daily meals for Breakfast, Lunch, Dinner, and Snacks matching your specific calorie targets and food preferences.'}
          </p>
        </div>
      </div>

      {/* Configuration Form & Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Config Panel (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-sm space-y-5">
          <h2 className="font-extrabold text-stone-900 text-sm flex items-center justify-between border-b border-stone-100 pb-3">
            <span>{language === 'bn' ? 'পরিকল্পনা সেটিংস' : 'Plan Configuration'}</span>
            <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Safe Calorie Bounds
            </span>
          </h2>

          {/* Calorie Target Slider */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between font-bold text-stone-700">
              <span>{t.calorieTarget}:</span>
              <span className="text-base font-extrabold text-emerald-800">
                {targetCalories} kcal
              </span>
            </div>
            <input
              type="range"
              min="1400"
              max="3200"
              step="100"
              value={targetCalories}
              onChange={(e) => setTargetCalories(Number(e.target.value))}
              className="w-full accent-emerald-700"
            />
            <div className="flex justify-between text-[10px] text-stone-400">
              <span>1,400 kcal (Mild Deficit)</span>
              <span>2,000 kcal</span>
              <span>3,200 kcal (Active)</span>
            </div>
          </div>

          {/* Dietary Restriction */}
          <div className="space-y-1 text-xs">
            <label className="font-bold text-stone-700 block">
              {t.dietaryPreference}
            </label>
            <select
              value={dietaryPref}
              onChange={(e) => setDietaryPref(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-xs font-semibold focus:ring-1 focus:ring-emerald-500"
            >
              <option value="Balanced">Balanced & Halal (সাধারণ ও সুষম খাদ্য)</option>
              <option value="High-Protein">High-Protein (উচ্চ প্রোটিন ও পেশি গঠন)</option>
              <option value="Diabetic-Friendly">Diabetic-Friendly / Low-GI (সুগার নিয়ন্ত্রণ)</option>
              <option value="Vegetarian">Vegetarian (নিরামিষ)</option>
              <option value="Vegan">Vegan (সম্পূর্ণ উদ্ভিজ্জ)</option>
              <option value="Heart-Healthy">Heart-Healthy / Low-Sodium (হৃদযন্ত্রের সুরক্ষা)</option>
            </select>
          </div>

          {/* Allergies Multi-select */}
          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-stone-700 block flex items-center justify-between">
              <span>{t.allergies}:</span>
              <span className="text-stone-400 font-normal">
                {selectedAllergies.length} excluded
              </span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_ALLERGIES.map((allergy) => {
                const isSelected = selectedAllergies.includes(allergy);
                return (
                  <button
                    key={allergy}
                    type="button"
                    onClick={() => toggleAllergy(allergy)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                      isSelected
                        ? 'bg-rose-50 text-rose-700 border-rose-300'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {isSelected ? '✕ ' : '+ '}
                    {allergy}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cuisine Multi-select */}
          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-stone-700 block">
              {language === 'bn' ? 'পছন্দের রন্ধনশৈলী:' : 'Preferred Cuisines:'}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Bangladeshi',
                'Indian',
                'Mediterranean',
                'Japanese',
                'Chinese',
                'Italian',
                'Mexican',
              ].map((c) => {
                const isSelected = selectedCuisines.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCuisine(c)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                      isSelected
                        ? 'bg-[#1B4332] text-white border-[#1B4332]'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGeneratePlan}
            disabled={loading}
            className="w-full py-3.5 bg-[#1B4332] hover:bg-[#255C45] text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>{t.loading}</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{t.generateMealPlan}</span>
              </>
            )}
          </button>
        </div>

        {/* RIGHT: Generated Meal Plan Display (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {generatedPlan ? (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-950/10 shadow-sm space-y-6 animate-fade-in">
              {/* Plan Title & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-stone-900">
                    {language === 'bn' ? generatedPlan.titleBn : generatedPlan.title}
                  </h3>
                  <div className="flex items-center space-x-3 text-xs text-stone-500 mt-1">
                    <span className="text-orange-600 font-bold">
                      {generatedPlan.dailyNutritionSummary?.totalCalories || targetCalories} kcal Total
                    </span>
                    <span>•</span>
                    <span>{generatedPlan.meals?.length || 4} Meals</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleSendAllToGrocery(generatedPlan.meals)}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center space-x-1.5 transition-colors"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{language === 'bn' ? 'বাজারে যোগ' : 'Grocery'}</span>
                  </button>
                  <button
                    onClick={handleSaveToProfile}
                    className="px-3.5 py-1.5 rounded-xl bg-[#1B4332] hover:bg-[#255C45] text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-amber-300" />
                    <span>{language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Plan'}</span>
                  </button>
                </div>
              </div>

              {/* Macro Totals Strip */}
              {generatedPlan.dailyNutritionSummary && (
                <div className="grid grid-cols-4 gap-2 text-center text-xs p-3 bg-stone-50 rounded-2xl border border-stone-200/60">
                  <div>
                    <span className="text-[10px] text-stone-500 block">Total Protein</span>
                    <span className="font-extrabold text-emerald-800 text-sm">
                      {generatedPlan.dailyNutritionSummary.totalProteinG}g
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block">Total Carbs</span>
                    <span className="font-extrabold text-amber-800 text-sm">
                      {generatedPlan.dailyNutritionSummary.totalCarbsG}g
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block">Total Fat</span>
                    <span className="font-extrabold text-orange-800 text-sm">
                      {generatedPlan.dailyNutritionSummary.totalFatG}g
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block">Target Kcal</span>
                    <span className="font-extrabold text-stone-800 text-sm">
                      {generatedPlan.dailyNutritionSummary.totalCalories}
                    </span>
                  </div>
                </div>
              )}

              {/* Individual Meals List */}
              <div className="space-y-4">
                {generatedPlan.meals?.map((meal: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/80 space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                          {language === 'bn' ? meal.categoryBn : meal.category}
                        </span>
                        <h4 className="font-extrabold text-stone-900 text-sm pt-1">
                          {language === 'bn' ? meal.dishNameBn : meal.dishName}
                        </h4>
                        <span className="text-[11px] text-stone-500 block">
                          {meal.portionDescription}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-orange-600 block text-sm">
                          {meal.calories} kcal
                        </span>
                        <span className="text-[10px] text-stone-500">
                          {meal.proteinG}g P | {meal.carbsG}g C | {meal.fatG}g F
                        </span>
                      </div>
                    </div>

                    {/* Ingredients */}
                    <div className="pt-2 border-t border-stone-200/60 flex flex-wrap gap-1">
                      {meal.ingredients?.map((ing: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-white border border-stone-200 rounded text-[11px] text-stone-700"
                        >
                          {ing}
                        </span>
                      ))}
                    </div>

                    {/* Nutrition Benefit */}
                    {meal.nutritionBenefit && (
                      <p className="text-[11px] text-emerald-800 italic pt-1">
                        ★ {language === 'bn' ? meal.nutritionBenefitBn : meal.nutritionBenefit}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Dietitian Notes */}
              {generatedPlan.dietitianNotes && (
                <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200/60 text-xs text-stone-700 leading-relaxed">
                  <span className="font-bold text-emerald-900 block mb-0.5 flex items-center space-x-1">
                    <Info className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{language === 'bn' ? 'পুষ্টিবিজ্ঞানীর পরামর্শ:' : 'Clinical Nutrition Advice:'}</span>
                  </span>
                  <p>{language === 'bn' ? generatedPlan.dietitianNotesBn : generatedPlan.dietitianNotes}</p>
                </div>
              )}
            </div>
          ) : (
            /* Blank state */
            <div className="bg-white rounded-3xl p-10 border border-stone-200 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <Utensils className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-stone-800 text-base">
                {language === 'bn' ? 'মিল প্ল্যান তৈরি করুন' : 'Your Meal Plan Appears Here'}
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                {language === 'bn'
                  ? 'বামপাশের ক্যালোরি লক্ষ্য ও পছন্দ নির্বাচন করে "ব্যালেন্সড মিল প্ল্যান তৈরি করুন" বাটনে চাপুন।'
                  : 'Adjust calorie target and restrictions on the left, then click Generate to produce a personalized schedule.'}
              </p>
            </div>
          )}

          {/* Saved Meal Plans History */}
          {savedMealPlans.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-sm space-y-4">
              <h3 className="font-extrabold text-stone-900 text-sm flex items-center justify-between">
                <span>{language === 'bn' ? 'সংরক্ষিত মিল প্ল্যানসমূহ' : 'Saved Meal Plans'}</span>
                <span className="text-xs text-stone-400">{savedMealPlans.length} saved</span>
              </h3>

              <div className="space-y-3">
                {savedMealPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-stone-900 block">
                        {language === 'bn' ? plan.titleBn : plan.title}
                      </span>
                      <span className="text-[10px] text-stone-500">
                        {plan.savedAt} • {plan.targetCalories} kcal
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleSendAllToGrocery(plan.meals)}
                        className="p-1.5 text-stone-600 hover:text-emerald-700"
                        title="Add to grocery"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteMealPlan(plan.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600"
                        title="Delete plan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
