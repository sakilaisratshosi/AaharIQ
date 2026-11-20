import React from 'react';
import { useApp } from '../context/AppContext';
import { AppView } from '../types';
import {
  ArrowLeft,
  Home,
  BookOpen,
  HeartHandshake,
  ScanLine,
  Database,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const {
    language,
    t,
    currentView,
    setCurrentView,
    goBack,
    goHome,
    selectedRecipe,
  } = useApp();

  const isInnerPage = currentView !== 'dashboard' || Boolean(selectedRecipe);

  const tabs: Array<{
    id: AppView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'recipes', label: language === 'bn' ? 'রেসিপি' : 'Recipes', icon: BookOpen },
    { id: 'healthy-guide', label: language === 'bn' ? 'গাইড' : 'Guide', icon: HeartHandshake },
    { id: 'food-scanner', label: language === 'bn' ? 'স্ক্যান' : 'Scan', icon: ScanLine },
    { id: 'bd-nutrition', label: language === 'bn' ? 'খাদ্য DB' : 'Food DB', icon: Database },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#16382C] border-t border-[#255242] text-white shadow-[0_-4px_20px_rgba(0,0,0,0.18)] px-1.5 py-1.5"
      aria-label={language === 'bn' ? 'মোবাইল নেভিগেশন' : 'Mobile Navigation'}
      data-testid="mobile-bottom-nav"
    >
      <div className="flex items-center justify-around gap-1">
        {/* Back button appears ONLY on inner pages / modals (never on Home page) */}
        {isInnerPage && (
          <button
            type="button"
            onClick={goBack}
            data-testid="mobile-nav-back-btn"
            className="flex flex-col items-center justify-center px-2.5 py-1.5 rounded-xl text-[10px] font-bold text-emerald-100 hover:bg-[#1E4A3B] active:scale-95 transition-all"
            aria-label={t.back}
          >
            <ArrowLeft className="w-4 h-4 text-emerald-300 mb-0.5" />
            <span>{t.back}</span>
          </button>
        )}

        {/* Home Button */}
        <button
          type="button"
          onClick={goHome}
          data-testid="mobile-nav-home-btn"
          className={`flex flex-col items-center justify-center px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all active:scale-95 ${
            currentView === 'dashboard' && !selectedRecipe
              ? 'bg-emerald-600/40 text-white border border-emerald-400/40'
              : 'text-emerald-100 hover:bg-[#1E4A3B]'
          }`}
          aria-label={t.home}
        >
          <Home className="w-4 h-4 text-emerald-300 mb-0.5" />
          <span>{t.home}</span>
        </button>

        {/* Primary Sections */}
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = currentView === tab.id && !selectedRecipe;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCurrentView(tab.id)}
              className={`flex flex-col items-center justify-center px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all active:scale-95 ${
                active
                  ? 'bg-emerald-600/40 text-white border border-emerald-400/40'
                  : 'text-emerald-100/85 hover:bg-[#1E4A3B]'
              }`}
            >
              <Icon className="w-4 h-4 text-emerald-300 mb-0.5" />
              <span className="truncate max-w-[54px]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
