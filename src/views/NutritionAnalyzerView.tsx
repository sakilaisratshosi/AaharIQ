import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { FOOD_DATABASE, FoodItem, ServingUnit } from '../data/foodData';
import {
  Calculator,
  Search,
  Plus,
  Trash2,
  Sparkles,
  ShieldCheck,
  Flame,
  Info,
  Layers,
  ArrowRight,
  Database,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface SelectedMealItem {
  id: string;
  food: FoodItem;
  quantity: number;
  unit: ServingUnit;
}

export const NutritionAnalyzerView: React.FC = () => {
  const { language, t, showNotification, setCurrentView } = useApp();

  const [activeTab, setActiveTab] = useState<'database' | 'aiAnalyze'>('database');
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Selected foods in meal calculator
  const [mealItems, setMealItems] = useState<SelectedMealItem[]>([
    {
      id: 'm1',
      food: FOOD_DATABASE.find((f) => f.id === 'white-rice-cooked') || FOOD_DATABASE[0],
      quantity: 1,
      unit: FOOD_DATABASE.find((f) => f.id === 'white-rice-cooked')?.servingUnits[1] || FOOD_DATABASE[0].servingUnits[0],
    },
    {
      id: 'm2',
      food: FOOD_DATABASE.find((f) => f.id === 'rohu-rui-fish') || FOOD_DATABASE[1],
      quantity: 1,
      unit: FOOD_DATABASE.find((f) => f.id === 'rohu-rui-fish')?.servingUnits[1] || FOOD_DATABASE[1].servingUnits[0],
    },
    {
      id: 'm3',
      food: FOOD_DATABASE.find((f) => f.id === 'lal-shaak') || FOOD_DATABASE[7],
      quantity: 1,
      unit: FOOD_DATABASE.find((f) => f.id === 'lal-shaak')?.servingUnits[1] || FOOD_DATABASE[7].servingUnits[0],
    },
  ]);

  // AI Food Analyzer state
  const [aiFoodInput, setAiFoodInput] = useState('');
  const [aiPortionInput, setAiPortionInput] = useState('1 standard serving / 150g');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Filtered food catalog
  const filteredFoodList = useMemo(() => {
    return FOOD_DATABASE.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (foodSearchQuery.trim()) {
        const q = foodSearchQuery.toLowerCase().trim();
        const matchName =
          item.name.toLowerCase().includes(q) || item.nameBn.toLowerCase().includes(q);
        const matchCat =
          item.categoryLabel.toLowerCase().includes(q) ||
          item.categoryLabelBn.toLowerCase().includes(q);
        return matchName || matchCat;
      }
      return true;
    });
  }, [foodSearchQuery, selectedCategory]);

  // Add food item to meal
  const handleAddFoodToMeal = (food: FoodItem) => {
    const newItem: SelectedMealItem = {
      id: 'item_' + Date.now(),
      food,
      quantity: food.servingUnits[0].defaultQuantity || 1,
      unit: food.servingUnits[0],
    };
    setMealItems((prev) => [...prev, newItem]);
    showNotification(`Added ${food.name} to meal calculator 🥗`);
  };

  const handleRemoveMealItem = (id: string) => {
    setMealItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateQuantity = (id: string, qty: number) => {
    if (qty < 0.1) return;
    setMealItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
    );
  };

  const handleUpdateUnit = (id: string, unit: ServingUnit) => {
    setMealItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, unit, quantity: unit.defaultQuantity } : item
      )
    );
  };

  // Aggregated totals calculation
  const mealTotals = useMemo(() => {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    let fiber = 0;
    let calcium = 0;
    let iron = 0;
    let vitaminA = 0;
    let vitaminC = 0;
    let potassium = 0;
    let sodium = 0;

    for (const item of mealItems) {
      // multiplier relative to 100g
      const multiplier = item.unit.multiplier * item.quantity;
      const base = item.food.nutritionPer100g;

      calories += base.calories * multiplier;
      protein += base.protein * multiplier;
      carbs += base.carbs * multiplier;
      fat += base.fat * multiplier;
      fiber += base.fiber * multiplier;
      calcium += (base.calcium || 0) * multiplier;
      iron += (base.iron || 0) * multiplier;
      vitaminA += (base.vitaminA || 0) * multiplier;
      vitaminC += (base.vitaminC || 0) * multiplier;
      potassium += (base.potassium || 0) * multiplier;
      sodium += (base.sodium || 0) * multiplier;
    }

    return {
      calories: Math.round(calories),
      protein: parseFloat(protein.toFixed(1)),
      carbs: parseFloat(carbs.toFixed(1)),
      fat: parseFloat(fat.toFixed(1)),
      fiber: parseFloat(fiber.toFixed(1)),
      calcium: Math.round(calcium),
      iron: parseFloat(iron.toFixed(1)),
      vitaminA: Math.round(vitaminA),
      vitaminC: parseFloat(vitaminC.toFixed(1)),
      potassium: Math.round(potassium),
      sodium: Math.round(sodium),
    };
  }, [mealItems]);

  // Macro calorie contributions
  const macroPercentages = useMemo(() => {
    const proteinKcal = mealTotals.protein * 4;
    const carbsKcal = mealTotals.carbs * 4;
    const fatKcal = mealTotals.fat * 9;
    const totalKcal = proteinKcal + carbsKcal + fatKcal || 1;

    return {
      proteinPct: Math.round((proteinKcal / totalKcal) * 100),
      carbsPct: Math.round((carbsKcal / totalKcal) * 100),
      fatPct: Math.round((fatKcal / totalKcal) * 100),
    };
  }, [mealTotals]);

  // Handle AI analysis call
  const handleRunAiAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiFoodInput.trim()) return;

    setAiLoading(true);
    setAiError(null);
    setAiResult(null);

    try {
      const res = await fetch('/api/gemini/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodName: aiFoodInput.trim(),
          portion: aiPortionInput.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze food.');
      setAiResult(data.item);
    } catch (err: any) {
      setAiError(err.message || 'Error communicating with Gemini AI.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#16382C] via-[#1E4A3B] to-[#122E24] text-white p-6 sm:p-8 rounded-3xl border border-emerald-800/40 shadow-lg">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
            <Calculator className="w-3.5 h-3.5 text-amber-300" />
            <span>{t.usdaVerified}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            {t.analyzeNutrition}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            {language === 'bn'
              ? 'ইউএসডিএ এবং বাংলাদেশ ফুড কম্পোজিশন টেবিলের যাচাইকৃত পুষ্টিতথ্য দিয়ে খাবার নির্বাচন করুন এবং নিখুঁত ম্যাক্রো ও মাইক্রোনিউট্রিয়েন্ট বিশ্লেষণ দেখুন।'
              : 'Construct meals from verified USDA FoodData Central and curated Bangladeshi food records. Accurately measure calories, macros, and essential vitamins.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2 mt-6">
          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'database'
                ? 'bg-white text-emerald-950 shadow-md'
                : 'bg-emerald-900/60 text-emerald-200 hover:bg-emerald-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'যাচাইকৃত ডেটাবেজ ক্যালকুলেটর' : 'Verified Dataset Calculator'}</span>
          </button>
          <button
            onClick={() => setActiveTab('aiAnalyze')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'aiAnalyze'
                ? 'bg-white text-emerald-950 shadow-md'
                : 'bg-emerald-900/60 text-emerald-200 hover:bg-emerald-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{language === 'bn' ? 'জেমিনাই ডিপ এআই ফুড অ্যানালাইজার' : 'Gemini AI Deep Analyzer'}</span>
          </button>
          <button
            onClick={() => setCurrentView('bd-nutrition')}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 bg-amber-400/20 text-amber-200 hover:bg-amber-400/30 border border-amber-300/30"
          >
            <Database className="w-3.5 h-3.5 text-amber-300" />
            <span>{language === 'bn' ? 'বাংলাদেশ খাদ্য পুষ্টি এক্সপ্লোরার (FCTB)' : 'Bangladesh Nutrition Explorer (FCTB)'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {activeTab === 'database' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Meal Builder & Aggregated Nutrition (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Meal Items Container */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-950/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h2 className="font-extrabold text-stone-900 text-sm flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-emerald-700" />
                  <span>{language === 'bn' ? 'খাবারের থালা / প্লেট' : 'Your Meal Plate'}</span>
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {mealItems.length} {language === 'bn' ? 'আইটেম' : 'items'}
                </span>
              </div>

              {mealItems.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-xs">
                  {language === 'bn'
                    ? 'ডানপাশের তালিকা থেকে খাবার যোগ করুন।'
                    : 'Click "+" on foods on the right to build your meal.'}
                </div>
              ) : (
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {mealItems.map((item) => {
                    const itemMult = item.unit.multiplier * item.quantity;
                    const itemCalories = Math.round(item.food.nutritionPer100g.calories * itemMult);
                    const itemProtein = (item.food.nutritionPer100g.protein * itemMult).toFixed(1);

                    return (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-extrabold text-stone-900 block">
                              {language === 'bn' ? item.food.nameBn : item.food.name}
                            </span>
                            <span className="text-[10px] text-stone-500">
                              {item.food.source}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemoveMealItem(item.id)}
                            className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-stone-200/60 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Quantity & Unit Selectors */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div>
                            <label className="text-[10px] font-bold text-stone-600 block mb-0.5">
                              {t.servingSize}
                            </label>
                            <input
                              type="number"
                              min="0.1"
                              step="0.5"
                              value={item.quantity}
                              onChange={(e) =>
                                handleUpdateQuantity(item.id, parseFloat(e.target.value) || 1)
                              }
                              className="w-full p-1.5 bg-white border border-stone-300 rounded-lg text-stone-800 font-bold text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-stone-600 block mb-0.5">
                              {t.unit}
                            </label>
                            <select
                              value={item.unit.label}
                              onChange={(e) => {
                                const selectedU = item.food.servingUnits.find(
                                  (u) => u.label === e.target.value
                                );
                                if (selectedU) handleUpdateUnit(item.id, selectedU);
                              }}
                              className="w-full p-1.5 bg-white border border-stone-300 rounded-lg text-stone-800 text-xs"
                            >
                              {item.food.servingUnits.map((u) => (
                                <option key={u.label} value={u.label}>
                                  {language === 'bn' ? u.labelBn : u.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Item Calculated Metrics */}
                        <div className="flex items-center justify-between pt-1 border-t border-stone-200/50 text-[11px] font-semibold">
                          <span className="text-orange-700">{itemCalories} kcal</span>
                          <span className="text-emerald-800">{itemProtein}g Protein</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Aggregated Total Nutrition Dashboard */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-950/10 shadow-sm space-y-4">
              <h3 className="font-extrabold text-stone-900 text-sm flex items-center justify-between">
                <span>{language === 'bn' ? 'মোট পুষ্টি ফলাফল' : 'Combined Meal Nutrition'}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                  Verified Data
                </span>
              </h3>

              {/* Big Calorie Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white flex items-center justify-between shadow-md">
                <div>
                  <span className="text-xs text-emerald-200 block uppercase font-bold tracking-wider">
                    {t.calories}
                  </span>
                  <span className="text-3xl font-black">{mealTotals.calories}</span>
                  <span className="text-xs text-emerald-200 ml-1">kcal</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Flame className="w-7 h-7 text-[#E76F51]" />
                </div>
              </div>

              {/* Macro Percentages Progress Bar */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between font-bold text-stone-700">
                  <span>{t.macroDistribution}</span>
                  <span className="text-stone-500">
                    C:{macroPercentages.carbsPct}% | P:{macroPercentages.proteinPct}% | F:
                    {macroPercentages.fatPct}%
                  </span>
                </div>
                <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${macroPercentages.carbsPct}%` }}
                    className="bg-amber-400"
                    title={`Carbs: ${macroPercentages.carbsPct}%`}
                  />
                  <div
                    style={{ width: `${macroPercentages.proteinPct}%` }}
                    className="bg-emerald-600"
                    title={`Protein: ${macroPercentages.proteinPct}%`}
                  />
                  <div
                    style={{ width: `${macroPercentages.fatPct}%` }}
                    className="bg-orange-500"
                    title={`Fat: ${macroPercentages.fatPct}%`}
                  />
                </div>
              </div>

              {/* Macro 4-Grid */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200/60">
                  <span className="text-[10px] block font-bold text-emerald-700">{t.protein}</span>
                  <span className="font-extrabold text-stone-900 text-sm">{mealTotals.protein}g</span>
                </div>
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/60">
                  <span className="text-[10px] block font-bold text-amber-700">{t.carbs}</span>
                  <span className="font-extrabold text-stone-900 text-sm">{mealTotals.carbs}g</span>
                </div>
                <div className="p-2 rounded-xl bg-orange-50 border border-orange-200/60">
                  <span className="text-[10px] block font-bold text-orange-700">{t.fat}</span>
                  <span className="font-extrabold text-stone-900 text-sm">{mealTotals.fat}g</span>
                </div>
                <div className="p-2 rounded-xl bg-teal-50 border border-teal-200/60">
                  <span className="text-[10px] block font-bold text-teal-700">{t.fiber}</span>
                  <span className="font-extrabold text-stone-900 text-sm">{mealTotals.fiber}g</span>
                </div>
              </div>

              {/* Essential Micronutrients Checklist */}
              <div className="pt-2 border-t border-stone-100 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                  {t.vitaminsAndMinerals}
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-stone-50 flex justify-between">
                    <span className="text-stone-500">Calcium (ক্যালসিয়াম):</span>
                    <span className="font-bold text-stone-800">{mealTotals.calcium} mg</span>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-50 flex justify-between">
                    <span className="text-stone-500">Iron (আয়রন):</span>
                    <span className="font-bold text-stone-800">{mealTotals.iron} mg</span>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-50 flex justify-between">
                    <span className="text-stone-500">Vitamin A:</span>
                    <span className="font-bold text-stone-800">{mealTotals.vitaminA} mcg</span>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-50 flex justify-between">
                    <span className="text-stone-500">Vitamin C:</span>
                    <span className="font-bold text-stone-800">{mealTotals.vitaminC} mg</span>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-50 flex justify-between">
                    <span className="text-stone-500">Potassium:</span>
                    <span className="font-bold text-stone-800">{mealTotals.potassium} mg</span>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-50 flex justify-between">
                    <span className="text-stone-500">Sodium:</span>
                    <span className="font-bold text-stone-800">{mealTotals.sodium} mg</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Curated Food Database Catalog (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-950/10 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-extrabold text-stone-900 text-base">
                    {t.foodDatabase}
                  </h2>
                  <p className="text-xs text-stone-500">
                    {language === 'bn'
                      ? 'খাদ্য নির্বাচন করে থালায় যোগ করতে "+" চাপুন'
                      : 'Click "+" to add verified foods to your plate'}
                  </p>
                </div>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="p-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-xs font-semibold"
                >
                  <option value="all">{language === 'bn' ? 'সকল খাদ্য বিভাগ' : 'All Categories'}</option>
                  <option value="fish">{language === 'bn' ? 'মাছ ও সামুদ্রিক' : 'Fish & Seafood'}</option>
                  <option value="grains">{language === 'bn' ? 'চাল ও দানা শস্য' : 'Grains & Rice'}</option>
                  <option value="vegetables">{language === 'bn' ? 'শাকসবজি' : 'Vegetables & Greens'}</option>
                  <option value="pulses">{language === 'bn' ? 'ডাল ও শিম' : 'Lentils & Legumes'}</option>
                  <option value="meat">{language === 'bn' ? 'মাংস ও ডিম' : 'Meat & Eggs'}</option>
                  <option value="fruits">{language === 'bn' ? 'ফলমূল' : 'Fruits'}</option>
                  <option value="dairy">{language === 'bn' ? 'দুগ্ধজাত খাদ্য' : 'Dairy & Curd'}</option>
                  <option value="spices_oils">{language === 'bn' ? 'তেল ও চর্বি' : 'Oils & Fats'}</option>
                </select>
              </div>

              {/* Food Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-emerald-700 absolute left-3 top-3 shrink-0" />
                <input
                  type="text"
                  value={foodSearchQuery}
                  onChange={(e) => setFoodSearchQuery(e.target.value)}
                  placeholder={t.searchFoodItem}
                  className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Foods List */}
              <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
                {filteredFoodList.map((food) => (
                  <div
                    key={food.id}
                    className="p-3.5 rounded-2xl border border-stone-200/70 hover:border-emerald-300 bg-stone-50/50 hover:bg-emerald-50/20 transition-all flex items-center justify-between text-xs"
                  >
                    <div className="space-y-1 pr-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-stone-900 text-sm">
                          {language === 'bn' ? food.nameBn : food.name}
                        </span>
                        <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                          {food.categoryLabel}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-stone-600 font-medium">
                        <span className="text-orange-700 font-bold">
                          {food.nutritionPer100g.calories} kcal / 100g
                        </span>
                        <span>{food.nutritionPer100g.protein}g Protein</span>
                        <span>{food.nutritionPer100g.carbs}g Carbs</span>
                        <span>{food.nutritionPer100g.fat}g Fat</span>
                        {food.nutritionPer100g.calcium && (
                          <span className="text-emerald-700 font-semibold">
                            {food.nutritionPer100g.calcium}mg Ca
                          </span>
                        )}
                        {food.nutritionPer100g.iron && (
                          <span className="text-amber-700 font-semibold">
                            {food.nutritionPer100g.iron}mg Fe
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-stone-400 flex items-center space-x-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span className="truncate max-w-xs">{food.source}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddFoodToMeal(food)}
                      className="px-3 py-2 bg-[#1B4332] hover:bg-[#255C45] text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center space-x-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'যোগ করুন' : 'Add'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* AI Deep Food Analyzer Tab */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-950/10 shadow-sm max-w-3xl mx-auto space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>AaharIQ AI Nutrition Estimator</span>
            </div>
            <h2 className="text-xl font-extrabold text-stone-900">
              {language === 'bn'
                ? 'যেকোনো খাবারের গভীর এআই পুষ্টি বিশ্লেষণ'
                : 'Analyze Any Food with Gemini AI'}
            </h2>
            <p className="text-xs text-stone-500 leading-relaxed">
              {language === 'bn'
                ? 'ডেটাবেজে খুঁজে না পাওয়া যেকোনো আন্তর্জাতিক বা স্থানীয় খাবারের পুষ্টিমান বৈজ্ঞানিক তথ্যের ভিত্তিতে অনুমান করুন।'
                : 'Get accurate nutrition estimates for uncatalogued homemade dishes, street foods, or specialty beverages.'}
            </p>
          </div>

          <form onSubmit={handleRunAiAnalysis} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {language === 'bn' ? 'খাবারের নাম বা বর্ণনা' : 'Food Name or Description'}
              </label>
              <input
                type="text"
                value={aiFoodInput}
                onChange={(e) => setAiFoodInput(e.target.value)}
                placeholder="e.g., Doi Fuchka (5 pieces) or Chicken Momos with chili sauce"
                required
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs sm:text-sm focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {language === 'bn' ? 'পরিবেশন পরিমাণ' : 'Serving Size / Portion'}
              </label>
              <input
                type="text"
                value={aiPortionInput}
                onChange={(e) => setAiPortionInput(e.target.value)}
                placeholder="e.g., 1 bowl (200g) or 2 pieces"
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs sm:text-sm focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={aiLoading}
              className="w-full py-3 bg-[#1B4332] hover:bg-[#255C45] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {aiLoading ? (
                <span>{t.loading}</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{language === 'bn' ? 'এআই দিয়ে বিশ্লেষণ করুন' : 'Run Deep AI Analysis'}</span>
                </>
              )}
            </button>
          </form>

          {aiError && (
            <div className="p-4 bg-rose-50 text-rose-800 rounded-2xl border border-rose-200 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{aiError}</span>
            </div>
          )}

          {aiResult && (
            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-4 text-xs animate-fade-in">
              <div className="flex items-start justify-between border-b border-stone-200 pb-3">
                <div>
                  <h3 className="font-extrabold text-stone-900 text-base">
                    {language === 'bn' ? aiResult.foodNameBn : aiResult.foodName}
                  </h3>
                  <span className="text-[11px] text-stone-500">
                    Portion: {aiResult.portionSize}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>{t.aiEstimated}</span>
                </span>
              </div>

              {/* Macro Cards */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2.5 bg-orange-50 rounded-xl border border-orange-200/60">
                  <span className="text-[10px] block font-bold text-orange-700">{t.calories}</span>
                  <span className="font-black text-stone-900 text-base">{aiResult.calories}</span>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200/60">
                  <span className="text-[10px] block font-bold text-emerald-700">{t.protein}</span>
                  <span className="font-black text-stone-900 text-base">{aiResult.protein}g</span>
                </div>
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200/60">
                  <span className="text-[10px] block font-bold text-amber-700">{t.carbs}</span>
                  <span className="font-black text-stone-900 text-base">{aiResult.carbs}g</span>
                </div>
                <div className="p-2.5 bg-teal-50 rounded-xl border border-teal-200/60">
                  <span className="text-[10px] block font-bold text-teal-700">{t.fiber}</span>
                  <span className="font-black text-stone-900 text-base">{aiResult.fiber}g</span>
                </div>
              </div>

              {/* Health Summary */}
              <div className="p-3 bg-white rounded-xl border border-stone-200 text-stone-700 leading-relaxed">
                <span className="font-bold text-emerald-900 block mb-0.5">
                  {language === 'bn' ? 'পুষ্টি সারসংক্ষেপ:' : 'Nutritional Summary:'}
                </span>
                {language === 'bn' ? aiResult.healthSummaryBn : aiResult.healthSummary}
              </div>

              <div className="text-[10px] text-stone-400 flex items-center space-x-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>
                  {language === 'bn'
                    ? 'উৎস: AaharIQ এআই পুষ্টি বিশ্লেষক। খাদ্য বিজ্ঞানের ওপর ভিত্তি করে অনুমানকৃত।'
                    : 'Source: AaharIQ AI Estimator. Explicitly tagged as estimated, not laboratory verified.'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
