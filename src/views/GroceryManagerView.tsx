import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { GroceryItem } from '../types';
import {
  ShoppingCart,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Copy,
  Check,
  Tag,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

export const GroceryManagerView: React.FC = () => {
  const {
    language,
    t,
    groceryItems,
    addGroceryItem,
    toggleGroceryItem,
    removeGroceryItem,
    clearCompletedGrocery,
    showNotification,
  } = useApp();

  const [nameInput, setNameInput] = useState('');
  const [amountInput, setAmountInput] = useState('1');
  const [unitInput, setUnitInput] = useState('portion');
  const [categoryInput, setCategoryInput] = useState<GroceryItem['category']>('produce');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  const categories = [
    { id: 'produce', label: 'Fresh Produce (শাকসবজি ও ফল)', labelBn: 'তাজা শাকসবজি ও ফল' },
    { id: 'pantry', label: 'Grains & Pantry (চাল ও মুদি)', labelBn: 'চাল ও শুকনো মুদি' },
    { id: 'protein', label: 'Meat, Fish & Eggs (মাছ, মাংস, ডিম)', labelBn: 'মাছ, মাংস ও ডিম' },
    { id: 'dairy', label: 'Dairy & Curd (দুধ ও দই)', labelBn: 'দুধ ও দুগ্ধজাত' },
    { id: 'spices', label: 'Spices & Oils (মসলা ও তেল)', labelBn: 'মসলা ও তেল' },
    { id: 'others', label: 'Others (অন্যান্য)', labelBn: 'অন্যান্য' },
  ];

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    addGroceryItem({
      name: nameInput.trim(),
      amount: amountInput.trim() || '1',
      unit: unitInput.trim() || 'pcs',
      category: categoryInput,
      addedFrom: 'manual',
    });

    setNameInput('');
    setAmountInput('1');
  };

  const handleCopyChecklist = () => {
    if (groceryItems.length === 0) return;
    const text = groceryItems
      .map(
        (it) =>
          `[${it.isCompleted ? 'X' : ' '}] ${it.amount} ${it.unit} ${it.name} (${it.category})`
      )
      .join('\n');

    navigator.clipboard.writeText(`AaharIQ Grocery Checklist:\n\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showNotification(t.listCopied);
  };

  const completedCount = groceryItems.filter((i) => i.isCompleted).length;
  const progressPct =
    groceryItems.length > 0 ? Math.round((completedCount / groceryItems.length) * 100) : 0;

  const filteredItems = useMemo(() => {
    if (filterCategory === 'all') return groceryItems;
    return groceryItems.filter((i) => i.category === filterCategory);
  }, [groceryItems, filterCategory]);

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#16382C] via-[#1E4A3B] to-[#122E24] text-white p-6 sm:p-8 rounded-3xl border border-emerald-800/40 shadow-lg">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
            <ShoppingCart className="w-3.5 h-3.5 text-amber-300" />
            <span>{language === 'bn' ? 'স্মার্ট খাদ্য কেনাকাটার ফর্দ' : 'Smart Nutritional Pantry'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            {t.groceryManager}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            {language === 'bn'
              ? 'যেকোনো রেসিপি বা মিল প্ল্যান থেকে উপকরণ এক ক্লিকে যুক্ত করুন। কেনা হয়ে গেলে টিক দিন এবং ফর্দ সংরক্ষণ করুন।'
              : 'Keep track of all ingredients needed for your weekly meals. Automatically sync from recipes and check off as you shop.'}
          </p>
        </div>

        {/* Progress Tracker Strip */}
        <div className="mt-6 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-200">
              {language === 'bn'
                ? `কেনাকাটার অগ্রগতি: ${completedCount} / ${groceryItems.length} টি সম্পন্ন`
                : `Shopping Progress: ${completedCount} of ${groceryItems.length} purchased`}
            </span>
            <span className="font-extrabold text-amber-300">{progressPct}%</span>
          </div>
          <div className="h-2.5 w-full bg-emerald-900/60 rounded-full overflow-hidden">
            <div
              style={{ width: `${progressPct}%` }}
              className="h-full bg-gradient-to-r from-emerald-400 to-[#E76F51] transition-all duration-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Quick Add Form (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-sm space-y-4">
          <h2 className="font-extrabold text-stone-900 text-sm flex items-center space-x-2 border-b border-stone-100 pb-3">
            <Plus className="w-4 h-4 text-emerald-700" />
            <span>{t.addItem}</span>
          </h2>

          <form onSubmit={handleAddItem} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                {language === 'bn' ? 'উপাদানের নাম' : 'Item Name'}
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder={t.itemPlaceholder}
                required
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  {language === 'bn' ? 'পরিমাণ' : 'Amount'}
                </label>
                <input
                  type="text"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">{t.unit}</label>
                <input
                  type="text"
                  value={unitInput}
                  onChange={(e) => setUnitInput(e.target.value)}
                  placeholder="g, kg, bunch, pcs"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">{t.category}</label>
              <select
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value as any)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-xs font-semibold"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {language === 'bn' ? cat.labelBn : cat.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#1B4332] hover:bg-[#255C45] text-white rounded-xl font-bold transition-colors flex items-center justify-center space-x-1.5 shadow-sm pt-2"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addItem}</span>
            </button>
          </form>
        </div>

        {/* RIGHT: Checklist (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
            <div className="flex items-center space-x-2">
              <h2 className="font-extrabold text-stone-900 text-sm">
                {t.groceryList}
              </h2>
              <span className="text-xs text-stone-400">
                ({groceryItems.length} {language === 'bn' ? 'টি আইটেম' : 'items'})
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-2 text-xs">
              <button
                onClick={handleCopyChecklist}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center space-x-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t.listCopied : t.copyList}</span>
              </button>

              {completedCount > 0 && (
                <button
                  onClick={clearCompletedGrocery}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold flex items-center space-x-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.clearPurchased}</span>
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                filterCategory === 'all'
                  ? 'bg-[#1B4332] text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {language === 'bn' ? 'সব' : 'All'}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  filterCategory === cat.id
                    ? 'bg-[#1B4332] text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {language === 'bn' ? cat.labelBn.split(' ')[0] : cat.id.toUpperCase()}
              </button>
            ))}
          </div>

          {/* List items */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-stone-400 space-y-2">
              <ShoppingBag className="w-10 h-10 mx-auto text-stone-300" />
              <p className="text-xs">
                {language === 'bn'
                  ? 'আপনার বাজারের ফর্দ খালি। বাঁদিকের ফর্ম দিয়ে বা রেসিপি থেকে যোগ করুন।'
                  : 'Your grocery checklist is empty. Add items using the form or from recipes.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-colors ${
                    item.isCompleted
                      ? 'bg-stone-50 border-stone-200/60 text-stone-400'
                      : 'bg-white border-stone-200 hover:border-emerald-300 shadow-sm text-stone-800'
                  }`}
                >
                  <div
                    className="flex items-center space-x-3 cursor-pointer flex-1"
                    onClick={() => toggleGroceryItem(item.id)}
                  >
                    {item.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-stone-400 shrink-0" />
                    )}
                    <div className="space-y-0.5">
                      <span
                        className={`font-extrabold text-sm block ${
                          item.isCompleted ? 'line-through text-stone-400' : 'text-stone-900'
                        }`}
                      >
                        {item.name}
                      </span>
                      <div className="flex items-center space-x-2 text-[10px] text-stone-400">
                        <span className="font-semibold text-emerald-800">
                          {item.amount} {item.unit}
                        </span>
                        {item.addedFrom && (
                          <span>• from: {item.addedFrom}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeGroceryItem(item.id)}
                    className="p-1.5 rounded-lg text-stone-300 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
