import React from 'react';
import { useApp } from '../context/AppContext';
import { AppView } from '../types';
import { getViewTitle } from '../utils/navigationMeta';
import {
  ArrowLeft,
  Home,
  ChevronRight,
  BookOpen,
  HeartHandshake,
  ScanLine,
  ShieldCheck,
  Database,
  Globe2,
  CalendarDays,
  ShoppingCart,
  MessageSquare,
} from 'lucide-react';

export const InnerPageNavigation: React.FC = () => {
  const {
    language,
    t,
    currentView,
    setCurrentView,
    goBack,
    goHome,
    previousView,
  } = useApp();

  // Never show Back button or inner navigation bar on the main Home page
  if (currentView === 'dashboard') {
    return null;
  }

  const currentLabel = getViewTitle(currentView, language);
  const previousLabel = getViewTitle(previousView || 'dashboard', language);

  const quickNavOptions: Array<{ id: AppView; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'recipes', label: language === 'bn' ? 'রেসিপি' : 'Recipes', icon: BookOpen },
    { id: 'healthy-guide', label: language === 'bn' ? 'পুষ্টি গাইড' : 'Healthy Guide', icon: HeartHandshake },
    { id: 'food-scanner', label: language === 'bn' ? 'স্ক্যানার' : 'Scanner', icon: ScanLine },
    { id: 'safety-center', label: language === 'bn' ? 'নিরাপত্তা' : 'Safety', icon: ShieldCheck },
    { id: 'bd-nutrition', label: language === 'bn' ? 'বাংলাদেশ DB' : 'BD Food DB', icon: Database },
    { id: 'cuisines', label: language === 'bn' ? 'রান্নাঘর' : 'Cuisines', icon: Globe2 },
    { id: 'meal-planner', label: language === 'bn' ? 'মিল প্ল্যান' : 'Meal Plan', icon: CalendarDays },
    { id: 'grocery', label: language === 'bn' ? 'বাজার' : 'Grocery', icon: ShoppingCart },
    { id: 'assistant', label: language === 'bn' ? 'সহকারী' : 'Assistant', icon: MessageSquare },
  ];

  return (
    <div
      className="mb-5 bg-white/95 backdrop-blur-sm rounded-2xl border border-emerald-950/10 shadow-sm px-3 py-2.5 sm:px-4 sm:py-3 space-y-2.5"
      role="navigation"
      aria-label={language === 'bn' ? 'পৃষ্ঠা নেভিগেশন' : 'Page Navigation'}
      data-testid="inner-page-navigation"
    >
      {/* Top Row: Back Arrow Button + Home Button + Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2">
          {/* Dedicated Back Arrow Button */}
          <button
            type="button"
            onClick={goBack}
            data-testid="nav-back-btn"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#16382C] hover:bg-[#1E4A3B] text-white text-xs font-bold shadow-xs transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            title={
              language === 'bn'
                ? `${previousLabel}-এ ফিরে যান`
                : `Back to ${previousLabel}`
            }
            aria-label={
              language === 'bn'
                ? `${previousLabel}-এ ফিরে যান`
                : `Back to ${previousLabel}`
            }
          >
            <ArrowLeft className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{t.back}</span>
            <span className="hidden sm:inline text-[11px] font-medium text-emerald-200/90 max-w-[140px] truncate">
              · {previousLabel}
            </span>
          </button>

          {/* Dedicated Home Button */}
          <button
            type="button"
            onClick={goHome}
            data-testid="nav-home-btn"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#16382C] border border-emerald-200/80 text-xs font-bold transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            title={language === 'bn' ? 'হোমপেজে যান' : 'Go to AaharIQ Home'}
            aria-label={language === 'bn' ? 'হোমপেজে যান' : 'Go to Home'}
          >
            <Home className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>{t.home}</span>
          </button>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center space-x-1 text-xs text-stone-500 font-medium min-w-0">
          <button
            type="button"
            onClick={goHome}
            className="hover:text-emerald-800 hover:underline transition-colors shrink-0"
          >
            {t.home}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span className="font-bold text-[#16382C] truncate max-w-[200px] sm:max-w-xs">
            {currentLabel}
          </span>
        </div>
      </div>

      {/* Bottom Row: Smooth Quick Switcher Between Options */}
      <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none pt-1.5 border-t border-stone-100">
        {quickNavOptions.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setCurrentView(item.id)}
              className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors shrink-0 ${
                isActive
                  ? 'bg-[#16382C] text-white shadow-2xs'
                  : 'bg-stone-50 text-stone-600 hover:bg-emerald-50 hover:text-emerald-900 border border-stone-200/70'
              }`}
            >
              <Icon className={`w-3 h-3 shrink-0 ${isActive ? 'text-emerald-300' : 'text-emerald-700'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
