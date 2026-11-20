import React from 'react';
import { useApp } from '../context/AppContext';
import { Leaf, Heart, ShieldCheck, Database } from 'lucide-react';

export const Footer: React.FC = () => {
  const { language, t, setCurrentView } = useApp();

  return (
    <footer className="bg-[#122E24] text-emerald-100/90 border-t border-[#1C4737] mt-16 pt-12 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#1E4A3B]">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                <Leaf className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="font-extrabold text-lg text-white">
                Aahar<span className="text-emerald-400">IQ</span>
              </span>
            </div>
            <p className="text-xs font-semibold text-emerald-300">
              {t.tagline}
            </p>
            <p className="text-xs text-emerald-200/80 leading-relaxed">
              {language === 'bn'
                ? 'খাদ্য, পুষ্টি, খাদ্য নিরাপত্তা ও অপচয় রোধের সমন্বিত বুদ্ধিমান প্ল্যাটফর্ম।'
                : 'AI-powered food intelligence platform combining Bangladesh FCTB nutrition science, BFSA safety references, waste reduction, and personalized tracking.'}
            </p>
          </div>

          {/* Core Modules */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              {language === 'bn' ? 'প্রধান মডিউল' : 'Platform Modules'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button type="button" onClick={() => setCurrentView('recipes')} className="hover:text-emerald-300 transition-colors">
                  {t.globalRecipeFinder}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setCurrentView('healthy-guide')} className="hover:text-emerald-300 transition-colors">
                  {t.healthyGuide}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setCurrentView('bd-nutrition')} className="hover:text-emerald-300 transition-colors">
                  {t.bdNutritionExplorer}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setCurrentView('food-scanner')} className="hover:text-emerald-300 transition-colors">
                  {t.foodScanner}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setCurrentView('safety-center')} className="hover:text-emerald-300 transition-colors">
                  {t.safetyCenter}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setCurrentView('food-comparison')} className="hover:text-emerald-300 transition-colors">
                  {t.foodComparison}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setCurrentView('food-journal')} className="hover:text-emerald-300 transition-colors">
                  {t.foodJournal}
                </button>
              </li>
            </ul>
          </div>

          {/* Data Integrity & Authoritative Sources */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              {language === 'bn' ? 'তথ্যসূত্র ও মানদণ্ড' : 'Authoritative References'}
            </h4>
            <ul className="space-y-2 text-xs text-emerald-200/80">
              <li className="flex items-start space-x-2">
                <Database className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>Food Composition Table for Bangladesh (INFS, Dhaka University)</span>
              </li>
              <li className="flex items-start space-x-2">
                <Database className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>National Dietary Guidelines for Bangladesh 2025 & USDA FoodData</span>
              </li>
              <li className="flex items-start space-x-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>Bangladesh Food Safety Authority (BFSA) Lab Repository Reference</span>
              </li>
            </ul>
          </div>

          {/* Safety Disclaimer */}
          <div className="bg-[#183D30] p-3.5 rounded-xl border border-emerald-800/40 text-xs">
            <h4 className="font-bold text-white mb-1.5 flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'bn' ? 'পুষ্টি ও নিরাপত্তা সতর্কতা' : 'Clinical & Safety Notice'}</span>
            </h4>
            <p className="text-[11px] text-emerald-200/80 leading-normal">
              {t.assistantDisclaimer}
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-300/70 space-y-3 sm:space-y-0">
          <div>
            © {new Date().getFullYear()} AaharIQ · {t.tagline}
          </div>
          <div className="flex items-center space-x-1">
            <span>Built for safer nutrition & sustainable living</span>
            <Heart className="w-3.5 h-3.5 text-[#E76F51] fill-[#E76F51]" />
          </div>
        </div>
      </div>
    </footer>
  );
};
