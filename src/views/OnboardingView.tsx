import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Globe,
  ShieldCheck,
  ChefHat,
  Database,
  ScanLine,
  Scale,
  Recycle,
  BookOpenCheck,
} from 'lucide-react';

const ALLERGEN_OPTIONS = [
  { id: 'Hilsa / Fish', bn: 'ইলিশ / মাছ' },
  { id: 'Shellfish / Prawn', bn: 'চিংড়ি / শেলফিশ' },
  { id: 'Eggs', bn: 'ডিম' },
  { id: 'Milk / Lactose', bn: 'দুধ / ল্যাকটোজ' },
  { id: 'Peanuts / Tree Nuts', bn: 'বাদাম' },
  { id: 'Gluten / Wheat', bn: 'গ্লুটেন / গম' },
  { id: 'Soybean', bn: 'সয়াবিন' },
  { id: 'Mustard', bn: 'সরিষা' },
];

export const OnboardingView: React.FC = () => {
  const { language, setLanguage, userProfile, completeOnboarding, setCurrentView, setIsAuthModalOpen } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedLang, setSelectedLang] = useState<'en' | 'bn'>(language);
  const [name, setName] = useState(userProfile?.name || '');
  const [calorieGoal, setCalorieGoal] = useState(userProfile?.dailyCalorieGoal || 2000);
  const [dietPref, setDietPref] = useState(userProfile?.dietaryPreference || 'Balanced & Halal');
  const [allergies, setAllergies] = useState<string[]>(userProfile?.allergies || []);

  const isBn = selectedLang === 'bn';

  const handleToggleAllergy = (id: string) => {
    setAllergies((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  };

  const handleFinish = async () => {
    await completeOnboarding({
      language: selectedLang,
      name: name.trim() || (isBn ? 'অতিথি ব্যবহারকারী' : 'Guest Explorer'),
      dailyCalorieGoal: Number(calorieGoal) || 2000,
      dietaryPreference: dietPref,
      allergies,
      onboardingCompleted: true,
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-4 pb-16 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-[#16382C] text-white p-6 sm:p-8 rounded-2xl border border-emerald-900/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="text-xs font-semibold text-emerald-300">
            {isBn ? 'আহারআইকিউ · ধাপে ধাপে সেটআপ' : 'AaharIQ · Personal Workspace Setup'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {isBn ? 'স্বাগতম AaharIQ প্ল্যাটফর্মে' : 'Welcome to AaharIQ'}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90">
            {isBn
              ? 'স্মার্ট খাবার। উন্নত পুষ্টি। নিরাপদ জীবন। আপনার ভাষা ও পুষ্টি লক্ষ্য নির্ধারণ করুন।'
              : 'Smart Food. Better Nutrition. Safer Living. Customize your language, nutrition targets, and dietary safety alerts.'}
          </p>
        </div>

        <button
          onClick={() => completeOnboarding()}
          className="self-start sm:self-center px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold whitespace-nowrap shrink-0 transition-colors"
        >
          {isBn ? 'এড়িয়ে যান' : 'Skip Setup'}
        </button>
      </div>

      {/* Stepper Indicator */}
      <div className="flex items-center gap-2 text-xs font-semibold">
        {[
          { num: 1 as const, en: '01. Language & Basics', bn: '০১. ভাষা ও পরিচিতি' },
          { num: 2 as const, en: '02. Diet & Allergens', bn: '০২. খাদ্যাভ্যাস ও অ্যালার্জি' },
          { num: 3 as const, en: '03. Platform Modules', bn: '০৩. মূল মডিউল পরিচিতি' },
        ].map((item) => (
          <button
            key={item.num}
            onClick={() => setStep(item.num)}
            className={`flex-1 py-2.5 px-3 rounded-xl border text-center transition-colors ${
              step === item.num
                ? 'bg-[#16382C] text-white border-[#16382C]'
                : step > item.num
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-white text-stone-500 border-stone-200'
            }`}
          >
            {isBn ? item.bn : item.en}
          </button>
        ))}
      </div>

      {/* Step Body */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                {isBn ? 'আপনার পছন্দের ভাষা নির্বাচন করুন' : 'Choose Your Preferred Language'}
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                {isBn
                  ? 'আপনি যেকোনো সময় টপ বার থেকে বাংলা ও ইংরেজি পরিবর্তন করতে পারবেন।'
                  : 'You can switch between English and Bangla anytime from the top navigation bar.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setSelectedLang('en');
                  setLanguage('en');
                }}
                className={`p-5 rounded-xl border text-left transition-all flex items-start justify-between ${
                  selectedLang === 'en'
                    ? 'border-[#16382C] bg-emerald-50/70'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-bold text-stone-900">
                    <Globe className="w-4 h-4 text-emerald-700" />
                    <span>English</span>
                  </div>
                  <p className="text-xs text-stone-500">
                    International standard scientific units & English-Bangla search.
                  </p>
                </div>
                {selectedLang === 'en' && <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedLang('bn');
                  setLanguage('bn');
                }}
                className={`p-5 rounded-xl border text-left transition-all flex items-start justify-between ${
                  selectedLang === 'bn'
                    ? 'border-[#16382C] bg-emerald-50/70'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-bold text-stone-900">
                    <Globe className="w-4 h-4 text-emerald-700" />
                    <span>বাংলা (Bangla)</span>
                  </div>
                  <p className="text-xs text-stone-500">
                    সম্পূর্ণ বাংলা ইন্টারফেস, দেশীয় খাদ্যের নাম ও বাংলায় রেসিপি।
                  </p>
                </div>
                {selectedLang === 'bn' && <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  {isBn ? 'আপনার নাম (ঐচ্ছিক)' : 'Your Name (Optional)'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isBn ? 'যেমন: ড. নাফিসা আক্তার' : 'e.g. Ayesha Rahman'}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  {isBn ? 'দৈনিক ক্যালোরি লক্ষ্য (kcal)' : 'Daily Calorie Target (kcal)'}
                </label>
                <input
                  type="number"
                  min={1200}
                  max={4000}
                  step={50}
                  value={calorieGoal}
                  onChange={(e) => setCalorieGoal(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 font-mono-num focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                {isBn ? 'খাদ্যাভ্যাস ও অ্যালার্জি সতর্কতা' : 'Dietary Preferences & Allergen Alerts'}
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                {isBn
                  ? 'আপনার খাদ্যতালিকার ধরন ও অ্যালার্জি নির্বাচন করুন যাতে প্যাকেটের লেবেল ও মিল প্ল্যানে সতর্কতা দেখানো যায়।'
                  : 'Select your dietary style and allergens so label OCR and meal planning highlight relevant warnings.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                {isBn ? 'খাদ্যাভ্যাসের ধরন' : 'Dietary Style'}
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Balanced & Halal',
                  'High Protein',
                  'Vegetarian',
                  'Plant-Forward',
                  'Low Added Sugar',
                ].map((pref) => (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => setDietPref(pref)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                      dietPref === pref
                        ? 'bg-[#16382C] text-white border-[#16382C]'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                {isBn ? 'খাদ্য অ্যালার্জি / সংবেদনশীলতা (যদি থাকে)' : 'Allergies or Sensitivities (Select any)'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {ALLERGEN_OPTIONS.map((alg) => {
                  const active = allergies.includes(alg.id);
                  return (
                    <button
                      key={alg.id}
                      type="button"
                      onClick={() => handleToggleAllergy(alg.id)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left flex items-center justify-between transition-colors ${
                        active
                          ? 'bg-amber-50 border-amber-400 text-amber-900'
                          : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <span>{isBn ? alg.bn : alg.id}</span>
                      {active && <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-stone-600">
                <strong className="text-stone-900">
                  {isBn ? 'অ্যাকাউন্ট সুরক্ষা:' : 'Want cloud-like account persistence?'}
                </strong>{' '}
                {isBn
                  ? 'আপনার ফুড জার্নাল ও তুলনার ইতিহাস সংরক্ষণের জন্য বিনামূল্যে অ্যাকাউন্ট তৈরি করতে পারেন।'
                  : 'Create an AaharIQ account to isolate and preserve your Food Journal and saved comparisons.'}
              </div>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 text-xs font-semibold whitespace-nowrap shrink-0"
              >
                {isBn ? 'সাইন ইন / নিবন্ধন' : 'Sign In / Sign Up'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                {isBn ? 'AaharIQ-এর প্রধান ক্ষমতা ও বিজ্ঞানসম্মত নীতি' : 'Platform Capabilities & Scientific Standards'}
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                {isBn
                  ? 'প্রতিটি মডিউল বাস্তব উপাত্ত, স্বচ্ছ সীমাবদ্ধতা ও বাংলাদেশি খাদ্য সংস্কৃতির ওপর ভিত্তি করে তৈরি।'
                  : 'Every module combines strict ingredient validation, verified Bangladesh datasets, and transparent safety boundaries.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {[
                {
                  icon: ChefHat,
                  en: 'Strict Ingredient Finder',
                  bn: 'নিখুঁত উপাদান রেসিপি',
                  descEn: 'Bangla & English matching with strict main-ingredient validation and unique dish photography.',
                  descBn: 'বাংলা ও ইংরেজি উপাদান দিয়ে মূল উপাদান যাচাইকৃত রেসিপি ও আলাদা ছবি।',
                  view: 'ingredient-ai' as const,
                },
                {
                  icon: Database,
                  en: 'Bangladesh FCTB (389 Foods)',
                  bn: 'বাংলাদেশ খাদ্য ডেটাবেজ',
                  descEn: 'Raw vs. cooked separated INFS Dhaka University composition data & 2025 Dietary Guidelines.',
                  descBn: 'কাঁচা ও রান্না করা আলাদা তথ্যসহ ঢাকা বিশ্ববিদ্যালয়ের INFS ডেটাবেজ।',
                  view: 'bd-nutrition' as const,
                },
                {
                  icon: ScanLine,
                  en: 'Photo Food Scanner',
                  bn: 'ছবি ভিত্তিক ফুড স্ক্যানার',
                  descEn: 'Identifies dishes with editable portions and honest estimation uncertainty notices.',
                  descBn: 'ছবি থেকে খাবার শনাক্ত, অংশ সংশোধন ও স্বচ্ছ পুষ্টি অনুমান।',
                  view: 'food-scanner' as const,
                },
                {
                  icon: ShieldCheck,
                  en: 'Safety Center & BFSA Labs',
                  bn: 'নিরাপত্তা কেন্দ্র ও BFSA ল্যাব',
                  descEn: 'Visual spoilage check, label OCR, and 9 BFSA-listed Bangladesh testing laboratories.',
                  descBn: 'দৃশ্যমান পচন যাচাই, লেবেল OCR এবং BFSA অনুমোদিত ল্যাব ডিরেক্টরি।',
                  view: 'safety-center' as const,
                },
                {
                  icon: Scale,
                  en: 'Equal-Serving Comparison',
                  bn: 'সম-পরিমাণ খাদ্য তুলনা',
                  descEn: 'Compare Rice vs Roti, Fish vs Egg, and 389 foods side-by-side without bias.',
                  descBn: 'ভাত বনাম রুটি, মাছ বনাম ডিমসহ শত শত খাদ্যের নিরপেক্ষ তুলনা।',
                  view: 'food-comparison' as const,
                },
                {
                  icon: Recycle,
                  en: 'Food Waste Reduction',
                  bn: 'খাদ্য অপচয় রোধ এআই',
                  descEn: 'Matches safe near-expiry and leftover ingredients to quick recipes & storage tips.',
                  descBn: 'মেয়াদ-নিকটবর্তী ও অবশিষ্ট নিরাপদ খাবারের রেসিপি এবং সংরক্ষণ গাইড।',
                  view: 'food-waste' as const,
                },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.en}
                    onClick={() => {
                      completeOnboarding();
                      setCurrentView(card.view);
                    }}
                    className="p-4 rounded-xl border border-stone-200 hover:border-emerald-600 cursor-pointer transition-colors space-y-1.5"
                  >
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{isBn ? card.bn : card.en}</span>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      {isBn ? card.descBn : card.descEn}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Controls */}
        <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s === 3 ? 2 : 1))}
              className="px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isBn ? 'পূর্ববর্তী' : 'Back'}</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s === 1 ? 2 : 3))}
              className="px-5 py-2.5 rounded-xl bg-[#16382C] hover:bg-[#1E4A3B] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>{isBn ? 'পরবর্তী ধাপ' : 'Continue'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-5 py-2.5 rounded-xl bg-[#16382C] hover:bg-[#1E4A3B] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <BookOpenCheck className="w-4 h-4 text-emerald-300" />
              <span>{isBn ? 'ড্যাশবোর্ডে প্রবেশ করুন' : 'Complete Setup & Enter AaharIQ'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
