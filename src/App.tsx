import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { InnerPageNavigation } from './components/InnerPageNavigation';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { RecipeModal } from './components/RecipeModal';
import { AuthModal } from './components/AuthModal';

// Views
import { DashboardView } from './views/DashboardView';
import { RecipesView } from './views/RecipesView';
import { NutritionAnalyzerView } from './views/NutritionAnalyzerView';
import { FoodScannerView } from './views/FoodScannerView';
import { FoodSafetyCenterView } from './views/FoodSafetyCenterView';
import { BangladeshNutritionView } from './views/BangladeshNutritionView';
import { FoodComparisonView } from './views/FoodComparisonView';
import { FoodWasteView } from './views/FoodWasteView';
import { FoodJournalView } from './views/FoodJournalView';
import { OnboardingView } from './views/OnboardingView';
import { IngredientAIView } from './views/IngredientAIView';
import { MealPlannerView } from './views/MealPlannerView';
import { CuisinesView } from './views/CuisinesView';
import { GroceryManagerView } from './views/GroceryManagerView';
import { GeminiAssistantView } from './views/GeminiAssistantView';
import { ProfileView } from './views/ProfileView';
import { HealthyNutritionGuideView } from './views/HealthyNutritionGuideView';

import { CheckCircle2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentView, selectedRecipe, setSelectedRecipe, notification } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-stone-800 font-sans antialiased selection:bg-emerald-600 selection:text-white">
      {/* Navigation */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7">
        {/* Consistent Inner Page Back + Home Navigation (Hidden on Home Page) */}
        <InnerPageNavigation />

        {/* Smooth Page Transition Wrapper */}
        <div key={currentView} className="page-transition">
          {currentView === 'dashboard' && <DashboardView />}
          {currentView === 'recipes' && <RecipesView />}
          {currentView === 'healthy-guide' && <HealthyNutritionGuideView />}
          {currentView === 'food-scanner' && <FoodScannerView />}
          {currentView === 'safety-center' && <FoodSafetyCenterView />}
          {currentView === 'nutrition' && <NutritionAnalyzerView />}
          {currentView === 'bd-nutrition' && <BangladeshNutritionView />}
          {currentView === 'food-comparison' && <FoodComparisonView />}
          {currentView === 'food-waste' && <FoodWasteView />}
          {currentView === 'food-journal' && <FoodJournalView />}
          {currentView === 'onboarding' && <OnboardingView />}
          {currentView === 'ingredient-ai' && <IngredientAIView />}
          {currentView === 'meal-planner' && <MealPlannerView />}
          {currentView === 'cuisines' && <CuisinesView />}
          {currentView === 'grocery' && <GroceryManagerView />}
          {currentView === 'assistant' && <GeminiAssistantView />}
          {currentView === 'profile' && <ProfileView />}
        </div>
      </main>

      {/* Detail Recipe Modal */}
      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal />

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 flex items-center space-x-2.5 px-4 py-3 bg-[#16382C] text-white rounded-2xl shadow-2xl border border-emerald-500/40 text-xs font-semibold animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Responsive Android / Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
