import { Language } from '../i18n/translations';
import { Recipe } from '../data/recipesData';
import { FoodItem } from '../data/foodData';

export type AppView =
  | 'dashboard'
  | 'recipes'
  | 'healthy-guide'
  | 'nutrition'
  | 'bd-nutrition'
  | 'food-scanner'
  | 'safety-center'
  | 'food-comparison'
  | 'food-waste'
  | 'food-journal'
  | 'onboarding'
  | 'ingredient-ai'
  | 'meal-planner'
  | 'cuisines'
  | 'grocery'
  | 'assistant'
  | 'profile';

export type BdFctCategory =
  | 'rice_products'
  | 'lentils_pulses'
  | 'vegetables'
  | 'leafy_vegetables'
  | 'freshwater_fish'
  | 'meat_eggs'
  | 'fruits'
  | 'milk_dairy'
  | 'traditional_dishes'
  | 'snacks_street_foods';

export type BdFctDataQuality = 'measured' | 'calculated' | 'borrowed' | 'estimated';

export interface BdFctNutrients {
  caloriesKcal: number | null;
  waterG: number | null;
  proteinG: number | null;
  totalFatG: number | null;
  saturatedFatG: number | null;
  carbsG: number | null;
  fiberG: number | null;
  sugarG: number | null;
  ashG: number | null;
  calciumMg: number | null;
  ironMg: number | null;
  magnesiumMg: number | null;
  phosphorusMg: number | null;
  potassiumMg: number | null;
  sodiumMg: number | null;
  zincMg: number | null;
  copperMg: number | null;
  vitaminAMcg: number | null;
  retinolMcg: number | null;
  betaCaroteneEqMcg: number | null;
  vitaminDMcg: number | null;
  vitaminEMg: number | null;
  vitaminB1Mg: number | null;
  vitaminB2Mg: number | null;
  vitaminB3Mg: number | null;
  vitaminB6Mg: number | null;
  folateMcg: number | null;
  vitaminB12Mcg: number | null;
  vitaminCMg: number | null;
  cholesterolMg: number | null;
}

export interface BdFctRecipeIngredientRef {
  fctCode: string;
  nameEn: string;
  nameBn: string;
  gramsUsed: number;
}

export interface BdFctFoodRecord {
  code: string;
  rawFctGroup: string;
  category: BdFctCategory;
  nameEn: string;
  nameBn: string;
  nameBnRoman: string;
  description: string;
  descriptionBn: string;
  scientificName?: string | null;
  prepState: 'raw' | 'cooked';
  unit: string;
  defaultServingGrams: number;
  defaultServingLabel: string;
  defaultServingLabelBn: string;
  sourceName: string;
  sourceYear: number;
  sourceUrl: string;
  biblioRef: string;
  dataQuality: BdFctDataQuality;
  edibleCoefficient: number | null;
  rawCookedPairCode?: string;
  recipeBreakdown?: BdFctRecipeIngredientRef[];
  nutrientsPer100g: BdFctNutrients;
}

export type SafetyAssessmentStatus =
  | 'Information Verified'
  | 'Needs Further Checking'
  | 'Potential Safety Concern'
  | 'Laboratory Testing Required'
  | 'Insufficient Information';

export type SafetyFoodCategory =
  | 'vegetables'
  | 'fruits'
  | 'fish'
  | 'meat'
  | 'cooked_food'
  | 'packaged_food'
  | 'dairy_spices';

export interface VisibleIndicatorFinding {
  detected: boolean;
  note: string;
  noteBn: string;
}

export interface FreshnessInspectionDetails {
  imageProvided: boolean;
  imageQuality: 'good' | 'blurry' | 'too_dark' | 'partial' | 'unidentifiable' | 'none';
  imageQualityNote: string;
  imageQualityNoteBn: string;
  visibleMold: VisibleIndicatorFinding;
  unusualDiscoloration: VisibleIndicatorFinding;
  visibleSpoilage: VisibleIndicatorFinding;
  damagedPackaging: VisibleIndicatorFinding;
  unusualTexture: VisibleIndicatorFinding;
  whatWasDetected: string[];
  whatWasDetectedBn: string[];
  whatCouldNotBeDetermined: string[];
  whatCouldNotBeDeterminedBn: string[];
}

export interface LabelOcrResult {
  ocrAttempted: boolean;
  productName?: string;
  brand?: string;
  manufacturer?: string;
  mfgDate?: string;
  expDate?: string;
  bestBefore?: string;
  batchNumber?: string;
  storageInstructions?: string;
  ingredients?: string;
  additives?: string[];
  allergens?: string[];
  nutritionFactsSummary?: string;
  unreadableFields: string[];
  unreadableFieldsBn: string[];
  expiryEvaluation: 'valid_unexpired' | 'expiring_soon' | 'expired' | 'missing_or_unreadable';
  expiryNote: string;
  expiryNoteBn: string;
}

export interface SafetyCategoryAssessment {
  key:
    | 'visibleCondition'
    | 'labelVerification'
    | 'expiryStatus'
    | 'productVerification'
    | 'adulterationStatus'
    | 'recommendedNextSteps';
  code: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  title: string;
  titleBn: string;
  status: SafetyAssessmentStatus;
  summary: string;
  summaryBn: string;
  details: string[];
  detailsBn: string[];
}

export interface FoodSafetyCenterReport {
  id: string;
  scannedAt: string;
  displayDate: string;
  foodCategory: SafetyFoodCategory;
  foodName: string;
  foodNameBn: string;
  imageDataUrl?: string;
  labelImageDataUrl?: string;
  freshness: FreshnessInspectionDetails;
  labelOcr: LabelOcrResult;
  packagedInfo?: PackagedFoodDetails;
  overallStatus: SafetyAssessmentStatus;
  assessments: SafetyCategoryAssessment[];
  disclaimer: string;
  disclaimerBn: string;
}

export type BfsaFoodMatrixCategory =
  | 'vegetables'
  | 'fruits'
  | 'fish'
  | 'milk_dairy'
  | 'spices'
  | 'meat_poultry'
  | 'oils_fats'
  | 'grains_cereals'
  | 'packaged_food'
  | 'water_beverages';

export interface BfsaLabTestParameter {
  parameterName: string;
  parameterNameBn: string;
  categoryGroup: 'Chemical' | 'Microbiological' | 'Heavy Metals' | 'Pesticides & Toxins' | 'Food Additives & Dyes' | 'Nutritional / Proximate' | 'Molecular';
  foodMatrices: BfsaFoodMatrixCategory[];
  foodExamples: string[];
  testingMethod: string;
  accreditationStatus: 'ISO/IEC 17025 Accredited' | 'ISO/IEC 17025 Scope Listed' | 'Institutional / Statutory Method' | 'Verify Scope in BFSA Repository';
  publishedFeeBdt: string | null; // null explicitly indicates unpublished in public snapshot
  turnaroundTime: string | null; // null explicitly indicates unavailable in public snapshot
}

export interface BfsaLaboratoryRecord {
  id: string;
  labName: string;
  labNameBn: string;
  parentOrganization: string;
  parentOrganizationBn: string;
  labType: 'Government / Reference' | 'Statutory / Regulatory' | 'Research Institute' | 'Departmental QC' | 'Private / International TIC';
  division: string;
  district: string;
  address: string;
  addressBn: string;
  contactPhone: string | null;
  contactEmail: string | null;
  accreditationSummary: string;
  accreditationSummaryBn: string;
  foodTypesTested: BfsaFoodMatrixCategory[];
  foodItemsSummary: string[];
  foodItemsSummaryBn: string[];
  parameters: BfsaLabTestParameter[];
  publishedFeeNotes: string | null;
  expectedTurnaround: string | null;
  sourceName: string;
  sourceUrl: string;
  institutionUrl?: string;
  lastVerifiedDate: string;
  dataCompleteness: 'Verified Public Scope' | 'Partial Public Details' | 'User Imported Snapshot';
}

export type BfsaInfoCategory =
  | 'food_safety_alert'
  | 'official_notice'
  | 'safety_guideline'
  | 'consumer_info';

export interface BfsaOfficialInfoItem {
  id: string;
  category: BfsaInfoCategory;
  title: string;
  titleBn: string;
  referenceCode?: string;
  publishedDate: string;
  summary: string;
  summaryBn: string;
  consumerActions: string[];
  consumerActionsBn: string[];
  relatedFoodCategories: BfsaFoodMatrixCategory[];
  sourceName: string;
  sourceUrl: string;
  lastVerifiedDate: string;
  availabilityNote: string;
  availabilityNoteBn: string;
}

export type FoodScanMode = 'auto' | 'cooked_meal' | 'produce' | 'packaged';
export type FoodDataSourceType = 'verified_reference' | 'openfoodfacts' | 'ai_estimate';
export type SafetyStatusCode = 'consistent' | 'needs_checking' | 'lab_required';

export interface MicronutrientEntry {
  name: string;
  nameBn: string;
  amount: string;
  dailyValuePct?: number;
}

export interface NutrientProfile {
  calories: number;
  proteinG: number;
  carbsG: number;
  totalFatG: number;
  saturatedFatG: number;
  fiberG: number;
  sugarG: number;
  sodiumMg: number;
  vitamins: MicronutrientEntry[];
  minerals: MicronutrientEntry[];
}

export interface ScannedFoodItem {
  id: string;
  name: string;
  nameBn: string;
  category: string;
  categoryBn: string;
  portionGrams: number;
  estimatedPortionGrams: number;
  servingLabel: string;
  servingLabelBn: string;
  confidence: number;
  dataSource: FoodDataSourceType;
  sourceLabel: string;
  sourceLabelBn: string;
  referenceMatchId?: string;
  nutrition: NutrientProfile;
  nutritionPer100g: NutrientProfile;
  measuredVsEstimatedNote: string;
  measuredVsEstimatedNoteBn: string;
}

export interface ConsistencyCheckItem {
  field: string;
  fieldBn: string;
  status: 'verified' | 'missing' | 'warning';
  note: string;
  noteBn: string;
}

export interface PackagedFoodDetails {
  barcode?: string;
  productName?: string;
  brand?: string;
  manufacturer?: string;
  batchNumber?: string;
  mfgDate?: string;
  expiryDate?: string;
  ingredientsList?: string;
  nutritionLabelSummary?: string;
  additives: string[];
  allergens: string[];
  openFoodFactsMatched?: boolean;
  openFoodFactsUrl?: string;
  nutriScore?: string;
  novaGroup?: number;
  consistencyChecks: ConsistencyCheckItem[];
}

export interface VisualSafetyInspection {
  imageQuality: 'good' | 'blurry' | 'too_dark' | 'partial' | 'unidentifiable';
  imageQualityNote: string;
  imageQualityNoteBn: string;
  moldOrSpoilageDetected: boolean;
  moldOrSpoilageNote: string;
  moldOrSpoilageNoteBn: string;
  unusualAppearanceDetected: boolean;
  unusualAppearanceNote: string;
  unusualAppearanceNoteBn: string;
  packagingDamageDetected: boolean;
  packagingDamageNote: string;
  packagingDamageNoteBn: string;
}

export interface ExcessNutrientAlert {
  type: 'sugar' | 'salt' | 'saturated_fat';
  severity: 'high' | 'moderate';
  message: string;
  messageBn: string;
}

export interface HealthBenefitAnalysis {
  benefits: string[];
  benefitsBn: string[];
  keyNutrients: string[];
  keyNutrientsBn: string[];
  bodyFunctions: string[];
  bodyFunctionsBn: string[];
  excessAlerts: ExcessNutrientAlert[];
  allergens: string[];
  allergensBn: string[];
  mealSuggestions: string[];
  mealSuggestionsBn: string[];
}

export interface FoodSafetyReport {
  status: SafetyStatusCode;
  statusText: string;
  statusTextBn: string;
  reasons: string[];
  reasonsBn: string[];
  missingVerificationFields: string[];
  missingVerificationFieldsBn: string[];
  labTestingRecommended: boolean;
  labTestingRecommendation: string;
  labTestingRecommendationBn: string;
  disclaimer: string;
  disclaimerBn: string;
}

export interface FoodScanReport {
  id: string;
  scannedAt: string;
  displayDate: string;
  scanMode: FoodScanMode;
  imageDataUrl?: string;
  detectedTitle: string;
  detectedTitleBn: string;
  estimationNote: string;
  estimationNoteBn: string;
  overallConfidence: number;
  items: ScannedFoodItem[];
  totals: NutrientProfile;
  healthAnalysis: HealthBenefitAnalysis;
  visualInspection: VisualSafetyInspection;
  packagedDetails?: PackagedFoodDetails;
  safetyReport: FoodSafetyReport;
}

export interface GroceryItem {
  id: string;
  name: string;
  nameBn?: string;
  amount: number | string;
  unit: string;
  unitBn?: string;
  category: 'produce' | 'pantry' | 'protein' | 'dairy' | 'spices' | 'bakery' | 'others';
  isCompleted: boolean;
  addedFrom?: string; // recipe name or 'manual' or 'meal-plan'
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  avatar?: string;
  dietaryPreference: string;
  dailyCalorieGoal: number;
  allergies: string[];
  language: Language;
  preferredCuisines: string[];
  onboardingCompleted?: boolean;
}

export interface SavedMealPlan {
  id: string;
  savedAt: string;
  title: string;
  titleBn: string;
  targetCalories: number;
  dailyNutritionSummary: {
    totalCalories: number;
    totalProteinG: number;
    totalCarbsG: number;
    totalFatG: number;
    totalFiberG?: number;
  };
  meals: Array<{
    category: string;
    categoryBn: string;
    dishName: string;
    dishNameBn: string;
    portionDescription: string;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    ingredients: string[];
  }>;
  dietitianNotes?: string;
  dietitianNotesBn?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  groundedSources?: string[];
}

export interface FoodJournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mealSlot: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodName: string;
  foodNameBn: string;
  fctCode?: string;
  servingLabel: string;
  servingGrams: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  source: string;
  notes?: string;
  createdAt: string;
}

export interface SavedFoodComparison {
  id: string;
  title: string;
  servingGrams: number;
  foodCodes: string[];
  foodNames: string[];
  createdAt: string;
}

export interface FoodWasteStorageItem {
  ingredient: string;
  optimalStorage: string;
  optimalStorageBn: string;
  shelfLifeEstimate: string;
  shelfLifeEstimateBn: string;
  spoilageSigns: string;
  spoilageSignsBn: string;
}

export interface FoodWastePlanResult {
  prioritizedIngredients: string[];
  expiredItemsExcluded: Array<{ name: string; daysRemaining: number }>;
  storageGuide: FoodWasteStorageItem[];
  recommendedRecipes: Array<{
    id: string;
    recipeName: string;
    recipeNameBn: string;
    cuisine: string;
    prepTimeMinutes: number;
    cookTimeMinutes: number;
    caloriesPerServing: number;
    imageUrl: string;
    usedIngredients: string[];
    whyWasteSmart: string;
    whyWasteSmartBn: string;
    instructions: string[];
    instructionsBn: string[];
  }>;
  leftoverIdeas: Array<{
    title: string;
    titleBn: string;
    description: string;
    descriptionBn: string;
    ingredientsUsed: string[];
  }>;
  preservationTips: Array<{
    title: string;
    titleBn: string;
    detail: string;
    detailBn: string;
  }>;
  safetyReminders: string[];
  safetyRemindersBn: string[];
}

export interface AppNotificationItem {
  id: string;
  title: string;
  titleBn: string;
  message: string;
  messageBn: string;
  category: 'safety' | 'journal' | 'waste' | 'database';
  timestamp: string;
  read: boolean;
  targetView?: AppView;
}

