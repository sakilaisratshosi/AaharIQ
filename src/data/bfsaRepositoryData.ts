import {
  BfsaFoodMatrixCategory,
  BfsaInfoCategory,
  BfsaLaboratoryRecord,
  BfsaLabTestParameter,
  BfsaOfficialInfoItem,
  SafetyFoodCategory,
} from '../types';

export const BFSA_SOURCES_METADATA = {
  labRepositoryName: 'BFSA Laboratory Information Repository',
  labRepositoryUrl: 'https://labrepository.bfsa.gov.bd/',
  authorityName: 'Bangladesh Food Safety Authority (BFSA)',
  authorityUrl: 'https://www.bfsa.gov.bd/',
  lastVerifiedDate: '2026-11-14',
  hotline: '16155',
  unavailableLabelEn: 'Unavailable in public snapshot — verify directly at labrepository.bfsa.gov.bd',
  unavailableLabelBn: 'উন্মুক্ত স্ন্যাপশটে তথ্য নেই — labrepository.bfsa.gov.bd পোর্টালে যাচাই করুন',
};

export const BFSA_MATRIX_CATEGORY_LABELS: Record<
  BfsaFoodMatrixCategory,
  { en: string; bn: string }
> = {
  vegetables: { en: 'Vegetables & Greens', bn: 'শাকসবজি' },
  fruits: { en: 'Fruits', bn: 'ফলমূল' },
  fish: { en: 'Fish & Seafood', bn: 'মাছ ও সামুদ্রিক খাদ্য' },
  milk_dairy: { en: 'Milk & Dairy', bn: 'দুধ ও দুগ্ধজাত পণ্য' },
  spices: { en: 'Spices & Condiments', bn: 'মসলা ও গুঁড়া মসলা' },
  meat_poultry: { en: 'Meat & Poultry', bn: 'মাংস ও পোল্ট্রি' },
  oils_fats: { en: 'Edible Oils & Fats', bn: 'ভোজ্য তেল ও চর্বি' },
  grains_cereals: { en: 'Rice, Grains & Cereals', bn: 'চাল, ডাল ও শস্য' },
  packaged_food: { en: 'Packaged & Processed Foods', bn: 'প্যাকেটজাত ও প্রক্রিয়াজাত খাদ্য' },
  water_beverages: { en: 'Water & Beverages', bn: 'পানি ও পানীয়' },
};

export function mapSafetyCategoryToBfsaMatrix(cat: SafetyFoodCategory): BfsaFoodMatrixCategory {
  switch (cat) {
    case 'vegetables':
      return 'vegetables';
    case 'fruits':
      return 'fruits';
    case 'fish':
      return 'fish';
    case 'meat':
      return 'meat_poultry';
    case 'packaged_food':
      return 'packaged_food';
    case 'dairy_spices':
      return 'milk_dairy';
    case 'cooked_food':
    default:
      return 'packaged_food';
  }
}

export const BFSA_LABORATORY_DIRECTORY: BfsaLaboratoryRecord[] = [
  {
    id: 'nfsl-iph-dhaka',
    labName: 'National Food Safety Laboratory (NFSL)',
    labNameBn: 'ন্যাশনাল ফুড সেফটি ল্যাবরেটরি (NFSL)',
    parentOrganization: 'Institute of Public Health (IPH), DGHS',
    parentOrganizationBn: 'জনস্বাস্থ্য ইনস্টিটিউট (IPH), স্বাস্থ্য অধিদপ্তর',
    labType: 'Government / Reference',
    division: 'Dhaka',
    district: 'Dhaka',
    address: 'Institute of Public Health (IPH) Campus, Mohakhali, Dhaka-1212',
    addressBn: 'জনস্বাস্থ্য ইনস্টিটিউট (IPH) প্রাঙ্গণ, মহাখালী, ঢাকা-১২১২',
    contactPhone: null,
    contactEmail: null,
    accreditationSummary: 'ISO/IEC 17025:2017 Certified National Reference Laboratory (verify active parameter scope on BFSA Repository)',
    accreditationSummaryBn: 'ISO/IEC 17025:2017 সনদপ্রাপ্ত জাতীয় রেফারেন্স ল্যাবরেটরি (সক্রিয় প্যারামিটার স্কোপ BFSA রিপোজিটরিতে যাচাই করুন)',
    foodTypesTested: [
      'vegetables',
      'fruits',
      'fish',
      'milk_dairy',
      'spices',
      'meat_poultry',
      'oils_fats',
      'grains_cereals',
      'packaged_food',
      'water_beverages',
    ],
    foodItemsSummary: ['Vegetables', 'Fruits', 'Fish', 'Milk & Dairy', 'Spices', 'Meat & Poultry', 'Grains', 'Water'],
    foodItemsSummaryBn: ['শাকসবজি', 'ফলমূল', 'মাছ', 'দুধ', 'মসলা', 'মাংস', 'শস্য', 'পানি'],
    parameters: [
      {
        parameterName: 'Pesticide Residue Screening (Organophosphate / Pyrethroid / Organochlorine)',
        parameterNameBn: 'কীটনাশক অবশিষ্টাংশ পরীক্ষা',
        categoryGroup: 'Pesticides & Toxins',
        foodMatrices: ['vegetables', 'fruits', 'grains_cereals'],
        foodExamples: ['Brinjal', 'Tomato', 'Leafy Greens', 'Mango', 'Cauliflower'],
        testingMethod: 'QuEChERS Extraction + LC-MS/MS & GC-MS/MS',
        accreditationStatus: 'ISO/IEC 17025 Accredited',
        publishedFeeBdt: null,
        turnaroundTime: null,
      },
      {
        parameterName: 'Heavy Metals Screening (Lead, Cadmium, Arsenic, Chromium, Mercury)',
        parameterNameBn: 'ভারী ধাতু পরীক্ষা (সিসা, ক্যাডমিয়াম, আর্সেনিক, ক্রোমিয়াম, পারদ)',
        categoryGroup: 'Heavy Metals',
        foodMatrices: ['vegetables', 'fish', 'milk_dairy', 'spices', 'water_beverages', 'fruits'],
        foodExamples: ['Fresh Vegetables', 'Fish', 'Turmeric Powder', 'Drinking Water'],
        testingMethod: 'ICP-MS / Atomic Absorption Spectroscopy (AAS)',
        accreditationStatus: 'ISO/IEC 17025 Accredited',
        publishedFeeBdt: null,
        turnaroundTime: null,
      },
      {
        parameterName: 'Mycotoxin & Aflatoxin Quantification (B1, B2, G1, G2, M1)',
        parameterNameBn: 'মাইকোটক্সিন ও আফ্লাটক্সিন নির্ণয়',
        categoryGroup: 'Pesticides & Toxins',
        foodMatrices: ['milk_dairy', 'spices', 'grains_cereals'],
        foodExamples: ['Liquid Milk', 'Chili Powder', 'Peanuts', 'Rice & Maize'],
        testingMethod: 'HPLC with Fluorescence Detection / ELISA',
        accreditationStatus: 'ISO/IEC 17025 Scope Listed',
        publishedFeeBdt: null,
        turnaroundTime: null,
      },
      {
        parameterName: 'Microbiological Safety (Coliforms, E. coli, Salmonella spp., Total Aerobic Count)',
        parameterNameBn: 'অণুজীব পরীক্ষা (কলিফর্ম, ই. কোলাই, সালমোনেলা)',
        categoryGroup: 'Microbiological',
        foodMatrices: ['vegetables', 'fish', 'milk_dairy', 'meat_poultry', 'packaged_food', 'water_beverages'],
        foodExamples: ['Raw Milk', 'Fish', 'Meat', 'Street & Packaged Food', 'Water'],
        testingMethod: 'ISO Standard Selective Culture & Plate Count',
        accreditationStatus: 'ISO/IEC 17025 Accredited',
        publishedFeeBdt: null,
        turnaroundTime: null,
      },
    ],
    publishedFeeNotes: null,
    expectedTurnaround: null,
    sourceName: 'BFSA Laboratory Information Repository & NFSL Public Profile',
    sourceUrl: 'https://labrepository.bfsa.gov.bd/',
    institutionUrl: 'https://nfsl.gov.bd',
    lastVerifiedDate: '2026-11-14',
    dataCompleteness: 'Verified Public Scope',
  },
  {
    id: 'ifst-bcsir-dhaka',
    labName: 'Institute of Food Science and Technology (IFST) — BCSIR Dhaka',
    labNameBn: 'খাদ্য বিজ্ঞান ও প্রযুক্তি ইনস্টিটিউট (IFST) — বিসিএসআইআর ঢাকা',
    parentOrganization: 'Bangladesh Council of Scientific and Industrial Research (BCSIR)',
    parentOrganizationBn: 'বাংলাদেশ বিজ্ঞান ও শিল্প গবেষণা পরিষদ (BCSIR)',
    labType: 'Research Institute',
    division: 'Dhaka',
    district: 'Dhaka',
    address: 'Dr. Qudrat-i-Khuda Road (Dhanmondi / New Elephant Road), Dhaka-1205',
    addressBn: 'ড. কুদরত-ই-খুদা সড়ক (ধানমন্ডি), ঢাকা-১২০৫',
    contactPhone: '+88-02-58617854',
    contactEmail: null,
    accreditationSummary: 'Designated Government Analytical & Research Institute (check parameter-level ISO/IEC 17025 scope in BFSA Repository)',
    accreditationSummaryBn: 'সরকারি বৈজ্ঞানিক বিশ্লেষণ ও গবেষণা প্রতিষ্ঠান (প্যারামিটার-ভিত্তিক ISO 17025 স্কোপ BFSA রিপোজিটরিতে যাচাই করুন)',
    foodTypesTested: [
      'vegetables',
      'fruits',
      'fish',
      'milk_dairy',
      'spices',
      'meat_poultry',
      'oils_fats',
      'grains_cereals',
      'packaged_food',
      'water_beverages',
    ],
    foodItemsSummary: ['Spices', 'Edible Oils', 'Milk & Dairy', 'Packaged Foods', 'Fish', 'Vegetables', 'Honey'],
    foodItemsSummaryBn: ['মসলা', 'ভোজ্য তেল', 'দুধ', 'প্যাকেটজাত খাদ্য', 'মাছ', 'শাকসবজি'],
    parameters: [
      {
        parameterName: 'Proximate & Nutritional Labeling Analysis (Moisture, Ash, Protein, Fat, Carbohydrate)',
        parameterNameBn: 'পুষ্টিমান ও প্রক্সিমেট বিশ্লেষণ (আর্দ্রতা, প্রোটিন, ফ্যাট, কার্বোহাইড্রেট)',
        categoryGroup: 'Nutritional / Proximate',
        foodMatrices: ['packaged_food', 'milk_dairy', 'grains_cereals', 'fish', 'spices'],
        foodExamples: ['Biscuits', 'Milk Powder', 'Rice', 'Spices', 'Packaged Snacks'],
        testingMethod: 'AOAC / Kjeldahl Protein / Soxhlet Lipid Extraction',
        accreditationStatus: 'Institutional / Statutory Method',
        publishedFeeBdt: 'Approx. 500–3,000 BDT per proximate parameter (+15% VAT; verify official BCSIR schedule)',
        turnaroundTime: '2–10 working days (per sample & test queue)',
      },
      {
        parameterName: 'Food Additives, Preservatives & Synthetic Non-Food Dyes (Sudan Red, Metanil Yellow)',
        parameterNameBn: 'ফুড অ্যাডিটিভ, প্রিজারভেটিভ ও কৃত্রিম রং পরীক্ষা',
        categoryGroup: 'Food Additives & Dyes',
        foodMatrices: ['spices', 'packaged_food', 'water_beverages', 'fruits'],
        foodExamples: ['Turmeric Powder', 'Chili Powder', 'Fruit Drinks', 'Sweets'],
        testingMethod: 'HPLC / Thin-Layer Chromatography (TLC)',
        accreditationStatus: 'Verify Scope in BFSA Repository',
        publishedFeeBdt: 'Unavailable per-dye in public summary — verify BCSIR / BFSA repository',
        turnaroundTime: '2–10 working days',
      },
      {
        parameterName: 'Edible Oil Quality (Acid Value, Peroxide Value, Fatty Acid / Trans-Fat Profile)',
        parameterNameBn: 'ভোজ্য তেলের মান পরীক্ষা (এসিড ভ্যালু, পারঅক্সাইড ভ্যালু, ট্রান্স-ফ্যাট)',
        categoryGroup: 'Chemical',
        foodMatrices: ['oils_fats', 'packaged_food'],
        foodExamples: ['Mustard Oil', 'Soybean Oil', 'Ghee', 'Fried Snacks'],
        testingMethod: 'Titrimetry / GC-FID Fatty Acid Methyl Ester Analysis',
        accreditationStatus: 'Verify Scope in BFSA Repository',
        publishedFeeBdt: 'Approx. 6,000 BDT (Acid/Peroxide baseline; +15% VAT)',
        turnaroundTime: '5–10 working days',
      },
      {
        parameterName: 'Heavy Metals & Mineral Elements (Pb, Cd, As, Hg)',
        parameterNameBn: 'ভারী ধাতু ও খনিজ উপাদান (সিসা, ক্যাডমিয়াম, আর্সেনিক, পারদ)',
        categoryGroup: 'Heavy Metals',
        foodMatrices: ['vegetables', 'spices', 'fish', 'milk_dairy', 'water_beverages'],
        foodExamples: ['Turmeric', 'Brinjal', 'Fish', 'Milk', 'Water'],
        testingMethod: 'Atomic Absorption Spectroscopy (AAS) / ICP-MS',
        accreditationStatus: 'Verify Scope in BFSA Repository',
        publishedFeeBdt: 'Approx. 2,000–3,500 BDT per element (+15% VAT)',
        turnaroundTime: '5–10 working days',
      },
      {
        parameterName: 'Microbiological Parameters (TVC, Coliform, E. coli, Salmonella)',
        parameterNameBn: 'মাইক্রোবায়োলজিক্যাল পরীক্ষা (TVC, কলিফর্ম, ই. কোলাই, সালমোনেলা)',
        categoryGroup: 'Microbiological',
        foodMatrices: ['milk_dairy', 'fish', 'meat_poultry', 'packaged_food', 'water_beverages', 'spices'],
        foodExamples: ['Pasteurized Milk', 'Juice', 'Cooked/Packaged Food', 'Water'],
        testingMethod: 'Conventional Plate Count & Culture Assays',
        accreditationStatus: 'Institutional / Statutory Method',
        publishedFeeBdt: 'Approx. 1,000–4,000 BDT per parameter (+15% VAT)',
        turnaroundTime: '3–7 working days',
      },
    ],
    publishedFeeNotes: 'BCSIR fee circulars typically quote ~500–10,000 BDT per parameter (+15% VAT); confirm latest circular directly.',
    expectedTurnaround: '2–10 working days (varies by test load)',
    sourceName: 'BFSA Laboratory Information Repository & BCSIR Analytical Service Cell',
    sourceUrl: 'https://labrepository.bfsa.gov.bd/',
    institutionUrl: 'https://www.bcsir.gov.bd/',
    lastVerifiedDate: '2026-11-14',
    dataCompleteness: 'Verified Public Scope',
  },
  {
    id: 'bsti-chemical-dhaka',
    labName: 'Chemical Testing Laboratory — BSTI Dhaka',
    labNameBn: 'কেমিক্যাল টেস্টিং ল্যাবরেটরি — বিএসটিআই (BSTI) ঢাকা',
    parentOrganization: 'Bangladesh Standards and Testing Institution (BSTI)',
    parentOrganizationBn: 'বাংলাদেশ স্ট্যান্ডার্ডস অ্যান্ড টেস্টিং ইনস্টিটিউশন (BSTI)',
    labType: 'Statutory / Regulatory',
    division: 'Dhaka',
    district: 'Dhaka',
    address: 'Maan Bhaban, 116/A, Tejgaon Industrial Area, Dhaka-1208',
    addressBn: 'মান ভবন, ১১৬/এ, তেজগাঁও শিল্প এলাকা, ঢাকা-১২০৮',
    contactPhone: '+88-02-55030054, +88-02-55030063',
    contactEmail: 'dg@bsti.gov.bd',
    accreditationSummary: 'National Standards Statutory Testing Authority (BDS certification & ISO/IEC 17025 accredited test scopes; confirm exact matrix on BFSA Repository)',
    accreditationSummaryBn: 'জাতীয় মান নিয়ন্ত্রক ও বিডিএস (BDS) অনুমোদনকারী ল্যাবরেটরি',
    foodTypesTested: ['milk_dairy', 'spices', 'oils_fats', 'packaged_food', 'grains_cereals', 'water_beverages'],
    foodItemsSummary: ['Packaged Milk', 'Mustard & Soybean Oil', 'Biscuits', 'Noodles', 'Ground Spices', 'Bottled Water'],
    foodItemsSummaryBn: ['প্যাকেটজাত দুধ', 'ভোজ্য তেল', 'বিস্কুট', 'নুডলস', 'গুঁড়া মসলা', 'বোতলজাত পানি'],
    parameters: [
      {
        parameterName: 'BDS Statutory Compositional Compliance (Milk, Dairy, Ghee, Spices)',
        parameterNameBn: 'বিডিএস (BDS) মান যাচাই (দুধ, ঘি, গুঁড়া মসলা)',
        categoryGroup: 'Chemical',
        foodMatrices: ['milk_dairy', 'spices', 'packaged_food'],
        foodExamples: ['Pasteurized Milk', 'Milk Powder', 'Turmeric & Chili Powder', 'Biscuits'],
        testingMethod: 'BDS Standard Wet Chemistry / Spectrophotometry',
        accreditationStatus: 'Institutional / Statutory Method',
        publishedFeeBdt: null,
        turnaroundTime: null,
      },
      {
        parameterName: 'Edible Oil & Fat Authenticity (Iodine Value, Saponification, Peroxide Value)',
        parameterNameBn: 'ভোজ্য তেলের বিডিএস মান পরীক্ষা',
        categoryGroup: 'Chemical',
        foodMatrices: ['oils_fats'],
        foodExamples: ['Mustard Oil', 'Fortified Soybean Oil', 'Palm Olein'],
        testingMethod: 'BDS Standard Chemical & Titrimetric Assay',
        accreditationStatus: 'ISO/IEC 17025 Scope Listed',
        publishedFeeBdt: null,
        turnaroundTime: null,
      },
      {
        parameterName: 'Food Additives & Microbiological Packaged Compliance',
        parameterNameBn: 'প্যাকেটজাত খাদ্যের প্রিজারভেটিভ ও অণুজীব পরীক্ষা',
        categoryGroup: 'Microbiological',
        foodMatrices: ['packaged_food', 'water_beverages', 'milk_dairy'],
        foodExamples: ['Fruit Drinks', 'Bottled Drinking Water', 'Packaged Snacks'],
        testingMethod: 'ISO / BDS Microbiological & Chemical Methods',
        accreditationStatus: 'ISO/IEC 17025 Scope Listed',
        publishedFeeBdt: null,
        turnaroundTime: null,
      },
    ],
    publishedFeeNotes: null,
    expectedTurnaround: null,
    sourceName: 'BFSA Laboratory Information Repository & BSTI Directory',
    sourceUrl: 'https://labrepository.bfsa.gov.bd/',
    institutionUrl: 'https://bsti.gov.bd',
    lastVerifiedDate: '2026-11-14',
    dataCompleteness: 'Partial Public Details',
  },
  {
    id: 'acl-baec-dhaka',
    labName: 'Analytical Chemistry Laboratory (ACL) — Atomic Energy Center (BAEC)',
    labNameBn: 'অ্যানালিটিক্যাল কেমিস্ট্রি ল্যাবরেটরি (ACL) — পরমাণু শক্তি কেন্দ্র ঢাকা',
    parentOrganization: 'Bangladesh Atomic Energy Commission (BAEC)',
    parentOrganizationBn: 'বাংলাদেশ পরমাণু শক্তি কমিশন (BAEC)',
    labType: 'Research Institute',
    division: 'Dhaka',
    district: 'Dhaka',
    address: '4 Kazi Nazrul Islam Avenue, Shahbagh, Dhaka-1000',
    addressBn: '৪ কাজী নজরুল ইসলাম এভিনিউ, শাহবাগ, ঢাকা-১০০০',
    contactPhone: null,
    contactEmail: null,
    accreditationSummary: 'Recognized public trace-element & pesticide nuclear/analytical research facility listed in BFSA Laboratory Repository',
    accreditationSummaryBn: 'ভারী ধাতু ও কীটনাশক ট্রেস বিশ্লেষণের জন্য পরিচিত সরকারি গবেষণা ল্যাবরেটরি',
    foodTypesTested: ['vegetables', 'fruits', 'fish', 'milk_dairy', 'grains_cereals', 'water_beverages'],
    foodItemsSummary: ['Vegetables', 'Fish', 'Fruits', 'Milk', 'Rice', 'Water'],
    foodItemsSummaryBn: ['শাকসবজি', 'মাছ', 'ফলমূল', 'দুধ', 'চাল', 'পানি'],
    parameters: [
      {
        parameterName: 'Trace & Toxic Heavy Metals (As, Pb, Cd, Cr, Hg)',
        parameterNameBn: 'ট্রেস ও ক্ষতিকর ভারী ধাতু পরীক্ষা (আর্সেনিক, সিসা, ক্যাডমিয়াম, পারদ)',
        categoryGroup: 'Heavy Metals',
        foodMatrices: ['vegetables', 'fruits', 'fish', 'grains_cereals', 'water_beverages'],
        foodExamples: ['Brinjal', 'Tomato', 'Rice', 'River/Marine Fish', 'Water'],
        testingMethod: 'AAS / ICP-MS / Neutron Activation Analysis',
        accreditationStatus: 'Verify Scope in BFSA Repository',
        publishedFeeBdt: null,
        turnaroundTime: null,
      },
      {
        parameterName: 'Pesticide Residue Trace Analysis',
        parameterNameBn: 'কীটনাশক অবশিষ্টাংশ ট্রেস বিশ্লেষণ',
        categoryGroup: 'Pesticides & Toxins',
        foodMatrices: ['vegetables', 'fruits', 'fish'],
        foodExamples: ['Vegetables', 'Seasonal Fruits', 'Dried Fish (Shutki)'],
        testingMethod: 'GC-ECD / GC-MS / HPLC',
        accreditationStatus: 'Verify Scope in BFSA Repository',
        publishedFeeBdt: null,
        turnaroundTime: null,
      },
    ],
    publishedFeeNotes: null,
    expectedTurnaround: null,
    sourceName: 'BFSA Laboratory Information Repository',
    sourceUrl: 'https://labrepository.bfsa.gov.bd/',
    lastVerifiedDate: '2026-11-14',
    dataCompleteness: 'Partial Public Details',
  },
  {
    id: 'fiqc-dhaka',
    labName: 'Fish Inspection & Quality Control (FIQC) Laboratory — Dhaka',
    labNameBn: 'মৎস্য পরিদর্শন ও মান নিয়ন্ত্রণ (FIQC) ল্যাবরেটরি — ঢাকা',
    parentOrganization: 'Department of Fisheries (DoF)',
    parentOrganizationBn: 'মৎস্য অধিদপ্তর (DoF)',
    labType: 'Departmental QC',
    division: 'Dhaka',
    district: 'Dhaka',
    address: 'Matshya Bhaban (Level 11), Ramna, Dhaka-1000',
    addressBn: 'মৎস্য ভবন (১১তম তলা), রমনা, ঢাকা-১০০০',
    contactPhone: '+88-02-9563674, +88-02-9559121',
    contactEmail: null,
    accreditationSummary: 'Department of Fisheries Statutory Quality Control & Export Salubrity Laboratory',
    accreditationSummaryBn: 'মৎস্য অধিদপ্তরের সরকারি মান নিয়ন্ত্রণ ও রপ্তানি সনদ প্রদানকারী ল্যাবরেটরি',
    foodTypesTested: ['fish'],
    foodItemsSummary: ['Fresh Fish', 'Frozen Shrimp & Prawn', 'Dried Fish (Shutki)', 'Fishery Products'],
    foodItemsSummaryBn: ['তাজা মাছ', 'হিমায়িত চিংড়ি', 'শুঁটকি', 'মৎস্যপণ্য'],
    parameters: [
      {
        parameterName: 'Fishery Microbiological Quality (TPC, E. coli, Salmonella, Vibrio cholerae)',
        parameterNameBn: 'মাছ ও চিংড়ির অণুজীব পরীক্ষা (ই. কোলাই, সালমোনেলা, ভিব্রিও)',
        categoryGroup: 'Microbiological',
        foodMatrices: ['fish'],
        foodExamples: ['Hilsa', 'Rui/Katla', 'Shrimp & Prawn', 'Frozen Fish'],
        testingMethod: 'ISO / BAM Microbiological Culture',
        accreditationStatus: 'ISO/IEC 17025 Scope Listed',
        publishedFeeBdt: null,
        turnaroundTime: null,
      },
      {
        parameterName: 'Veterinary Antibiotic & Chemical Residues in Fish (Chloramphenicol, Nitrofuran, Formaldehyde)',
        parameterNameBn: 'মাছে অ্যান্টিবায়োটিক অবশিষ্টাংশ ও রাসায়নিক পরীক্ষা (নাইট্রোফুরান, ফরমালিন)',
        categoryGroup: 'Chemical',
        foodMatrices: ['fish'],
        foodExamples: ['Farmed Fish', 'Shrimp', 'Fresh Market Fish'],
        testingMethod: 'LC-MS/MS / ELISA / Spectrophotometry',
        accreditationStatus: 'ISO/IEC 17025 Scope Listed',
        publishedFeeBdt: null,
        turnaroundTime: null,
      },
    ],
    publishedFeeNotes: null,
    expectedTurnaround: null,
    sourceName: 'BFSA Laboratory Information Repository & Department of Fisheries',
    sourceUrl: 'https://labrepository.bfsa.gov.bd/',
    lastVerifiedDate: '2026-11-14',
    dataCompleteness: 'Verified Public Scope',
  },
  {
    id: 'fiqc-chattogram',
    labName: 'Fish Inspection & Quality Control (FIQC) Laboratory — Chattogram',
    labNameBn: 'মৎস্য পরিদর্শন ও মান নিয়ন্ত্রণ (FIQC) ল্যাবরেটরি — চট্টগ্রাম',
    parentOrganization: 'Department of Fisheries (DoF)',
    parentOrganizationBn: 'মৎস্য অধিদপ্তর (DoF)',
    labType: 'Departmental QC',
    division: 'Chattogram',
    district: 'Chattogram',
    address: '209, N. M. Khan Hill, Muradpur, Chattogram',
    addressBn: '২০৯, এন. এম. খান হিল, মুরাদপুর, চট্টগ্রাম',
    contactPhone: '+88-01554-333477',
    contactEmail: null,
    accreditationSummary: 'Regional Department of Fisheries ISO/IEC 17025 Fishery Export & Domestic QC Laboratory',
    accreditationSummaryBn: 'চট্টগ্রাম অঞ্চলের মৎস্য মান নিয়ন্ত্রণ ল্যাবরেটরি',
    foodTypesTested: ['fish'],
    foodItemsSummary: ['Marine Fish', 'Frozen Shrimp', 'Dried Marine Fish (Shutki)'],
    foodItemsSummaryBn: ['সামুদ্রিক মাছ', 'হিমায়িত চিংড়ি', 'শুঁটকি'],
    parameters: [
      {
        parameterName: 'Heavy Metals in Seafood (Lead, Cadmium, Mercury)',
        parameterNameBn: 'সামুদ্রিক মাছে ভারী ধাতু পরীক্ষা (সিসা, ক্যাডমিয়াম, পারদ)',
        categoryGroup: 'Heavy Metals',
        foodMatrices: ['fish'],
        foodExamples: ['Marine Fish', 'Hilsa', 'Prawn'],
        testingMethod: 'AAS / ICP-MS',
        accreditationStatus: 'ISO/IEC 17025 Scope Listed',
        publishedFeeBdt: null,
        turnaroundTime: null,
      },
      {
        parameterName: 'Microbiological & Antibiotic Residue Screening for Fishery Exports',
        parameterNameBn: 'মৎস্য রপ্তানি মানের অণুজীব ও অ্যান্টিবায়োটিক অবশিষ্টাংশ পরীক্ষা',
        categoryGroup: 'Microbiological',
        foodMatrices: ['fish'],
        foodExamples: ['Shrimp', 'Frozen Seafood', 'Dried Fish'],
        testingMethod: 'LC-MS/MS & ISO Microbiological Culture',
        accreditationStatus: 'ISO/IEC 17025 Scope Listed',
        publishedFeeBdt: null,
        turnaroundTime: null,
      },
    ],
    publishedFeeNotes: null,
    expectedTurnaround: null,
    sourceName: 'BFSA Laboratory Information Repository & Department of Fisheries',
    sourceUrl: 'https://labrepository.bfsa.gov.bd/',
    lastVerifiedDate: '2026-11-14',
    dataCompleteness: 'Verified Public Scope',
  },
  {
    id: 'fiqc-khulna',
    labName: 'Fish Inspection & Quality Control (FIQC) Laboratory — Khulna',
    labNameBn: 'মৎস্য পরিদর্শন ও মান নিয়ন্ত্রণ (FIQC) ল্যাবরেটরি — খুলনা',
    parentOrganization: 'Department of Fisheries (DoF)',
    parentOrganizationBn: 'মৎস্য অধিদপ্তর (DoF)',
    labType: 'Departmental QC',
    division: 'Khulna',
    district: 'Khulna',
    address: 'FIQC Bhaban, 3, Jalil Sarani, Boyra, Khulna-9000',
    addressBn: 'এফআইকিউসি ভবন, ৩ জলিল সরণি, বয়রা, খুলনা-৯০০০',
    contactPhone: null,
    contactEmail: null,
    accreditationSummary: 'Khulna Regional Department of Fisheries Quality Control & Salubrity Testing Facility',
    accreditationSummaryBn: 'খুলনা বিভাগীয় মৎস্য ও চিংড়ি মান নিয়ন্ত্রণ ল্যাবরেটরি',
    foodTypesTested: ['fish'],
    foodItemsSummary: ['Bagda & Golda Shrimp', 'Freshwater Fish', 'Frozen Seafood'],
    foodItemsSummaryBn: ['বাগদা ও গলদা চিংড়ি', 'মিঠা পানির মাছ', 'হিমায়িত মৎস্যপণ্য'],
    parameters: [
      {
        parameterName: 'Microbiological Safety (Salmonella, E. coli, Vibrio, APC)',
        parameterNameBn: 'অণুজীব পরীক্ষা (সালমোনেলা, ই. কোলাই, ভিব্রিও)',
        categoryGroup: 'Microbiological',
        foodMatrices: ['fish'],
        foodExamples: ['Bagda Shrimp', 'Golda Prawn', 'Fresh Fish'],
        testingMethod: 'ISO Selective Microbiological Culture',
        accreditationStatus: 'ISO/IEC 17025 Scope Listed',
        publishedFeeBdt: null,
        turnaroundTime: null,
      },
      {
        parameterName: 'Heavy Metals & Antibiotic Residues (Chloramphenicol, Nitrofurans, Pb, Cd)',
        parameterNameBn: 'ভারী ধাতু ও অ্যান্টিবায়োটিক অবশিষ্টাংশ পরীক্ষা',
        categoryGroup: 'Chemical',
        foodMatrices: ['fish'],
        foodExamples: ['Cultured Shrimp', 'Frozen Fish'],
        testingMethod: 'LC-MS/MS & AAS',
        accreditationStatus: 'ISO/IEC 17025 Scope Listed',
        publishedFeeBdt: null,
        turnaroundTime: null,
      },
    ],
    publishedFeeNotes: null,
    expectedTurnaround: null,
    sourceName: 'BFSA Laboratory Information Repository & Department of Fisheries',
    sourceUrl: 'https://labrepository.bfsa.gov.bd/',
    lastVerifiedDate: '2026-11-14',
    dataCompleteness: 'Partial Public Details',
  },
  {
    id: 'bcsir-chattogram',
    labName: 'BCSIR Laboratories Chattogram — Food & Analytical Division',
    labNameBn: 'বিসিএসআইআর (BCSIR) ল্যাবরেটরি চট্টগ্রাম — খাদ্য ও বিশ্লেষণ শাখা',
    parentOrganization: 'Bangladesh Council of Scientific and Industrial Research (BCSIR)',
    parentOrganizationBn: 'বাংলাদেশ বিজ্ঞান ও শিল্প গবেষণা পরিষদ (BCSIR)',
    labType: 'Research Institute',
    division: 'Chattogram',
    district: 'Chattogram',
    address: 'Baizid Bostami Road, Chattogram-4220',
    addressBn: 'বায়েজিদ বোস্তামী রোড, চট্টগ্রাম-৪২২০',
    contactPhone: null,
    contactEmail: null,
    accreditationSummary: 'Regional Government Scientific Analytical Laboratory (confirm test-by-test scope in BFSA Repository)',
    accreditationSummaryBn: 'চট্টগ্রাম বিভাগীয় সরকারি বৈজ্ঞানিক খাদ্য ও পানি বিশ্লেষণ ল্যাবরেটরি',
    foodTypesTested: ['vegetables', 'fish', 'milk_dairy', 'spices', 'packaged_food', 'water_beverages'],
    foodItemsSummary: ['Vegetables', 'Milk & Dairy', 'Spices', 'Drinking Water', 'Packaged Foods'],
    foodItemsSummaryBn: ['শাকসবজি', 'দুধ', 'মসলা', 'পানি', 'প্যাকেটজাত খাবার'],
    parameters: [
      {
        parameterName: 'Water & Beverage Microbiological & Chemical Safety',
        parameterNameBn: 'পানি ও পানীয়ের রাসায়নিক ও অণুজীব পরীক্ষা',
        categoryGroup: 'Microbiological',
        foodMatrices: ['water_beverages', 'milk_dairy'],
        foodExamples: ['Drinking Water', 'Beverages', 'Milk'],
        testingMethod: 'Plate Count, Coliform MPN & Spectrophotometry',
        accreditationStatus: 'Institutional / Statutory Method',
        publishedFeeBdt: 'Approx. 1,000–2,000 BDT (TVC/Coliform reference; +15% VAT)',
        turnaroundTime: '3–7 working days',
      },
      {
        parameterName: 'Proximate Quality & Adulteration Indicators (Moisture, Ash, Heavy Metals)',
        parameterNameBn: 'খাদ্যমান ও ভারী ধাতু পরীক্ষা',
        categoryGroup: 'Heavy Metals',
        foodMatrices: ['vegetables', 'spices', 'fish', 'packaged_food'],
        foodExamples: ['Spices', 'Vegetables', 'Processed Foods'],
        testingMethod: 'AAS / AOAC Wet Analytical Methods',
        accreditationStatus: 'Verify Scope in BFSA Repository',
        publishedFeeBdt: null,
        turnaroundTime: '3–10 working days',
      },
    ],
    publishedFeeNotes: 'Follows BCSIR institutional parameter schedule (+15% VAT); verify regional availability.',
    expectedTurnaround: '3–10 working days',
    sourceName: 'BFSA Laboratory Information Repository & BCSIR Chattogram',
    sourceUrl: 'https://labrepository.bfsa.gov.bd/',
    institutionUrl: 'https://www.bcsir.gov.bd/',
    lastVerifiedDate: '2026-11-14',
    dataCompleteness: 'Partial Public Details',
  },
  {
    id: 'sgs-bangladesh-dhaka',
    labName: 'SGS Bangladesh Ltd. — Agriculture & Food Testing Laboratory',
    labNameBn: 'এসজিএস (SGS) বাংলাদেশ লিমিটেড — কৃষি ও খাদ্য পরীক্ষাগার',
    parentOrganization: 'SGS Bangladesh Ltd.',
    parentOrganizationBn: 'এসজিএস (SGS) বাংলাদেশ লিমিটেড',
    labType: 'Private / International TIC',
    division: 'Dhaka',
    district: 'Dhaka',
    address: 'Mohakhali Commercial Area (see current lab reception listing on BFSA Repository), Dhaka',
    addressBn: 'মহাখালী বাণিজ্যিক এলাকা, ঢাকা (BFSA পোর্টালে ঠিকানা দেখুন)',
    contactPhone: null,
    contactEmail: null,
    accreditationSummary: 'ISO/IEC 17025 Accredited Private Testing Laboratory (BAB Accredited scope — verify specific food matrix)',
    accreditationSummaryBn: 'ISO/IEC 17025 (BAB স্বীকৃত) বেসরকারি আন্তর্জাতিক পরীক্ষাগার',
    foodTypesTested: ['vegetables', 'fruits', 'fish', 'milk_dairy', 'spices', 'grains_cereals', 'packaged_food'],
    foodItemsSummary: ['Export Spices', 'Processed & Packaged Food', 'Vegetables', 'Fruits', 'Fish', 'Grains'],
    foodItemsSummaryBn: ['মসলা', 'প্যাকেটজাত খাদ্য', 'শাকসবজি', 'ফলমূল', 'মাছ', 'শস্য'],
    parameters: [
      {
        parameterName: 'Multi-Residue Pesticide Screening & Heavy Metals (Pb, Cd, As, Hg)',
        parameterNameBn: 'মাল্টি-রেসিডিউ কীটনাশক ও ভারী ধাতু পরীক্ষা',
        categoryGroup: 'Pesticides & Toxins',
        foodMatrices: ['vegetables', 'fruits', 'spices', 'grains_cereals', 'fish'],
        foodExamples: ['Vegetables', 'Spices', 'Tea & Grains', 'Fish'],
        testingMethod: 'LC-MS/MS, GC-MS/MS & ICP-MS',
        accreditationStatus: 'ISO/IEC 17025 Accredited',
        publishedFeeBdt: null,
        turnaroundTime: null,
      },
      {
        parameterName: 'Microbiological Pathogen & Commercial Quality Panel (Salmonella, E. coli, Aflatoxins)',
        parameterNameBn: 'অণুজীব প্যাথোজেন ও আফ্লাটক্সিন পরীক্ষা',
        categoryGroup: 'Microbiological',
        foodMatrices: ['packaged_food', 'spices', 'fish', 'milk_dairy'],
        foodExamples: ['Spices', 'Packaged Foods', 'Dairy Products', 'Seafood'],
        testingMethod: 'ISO Microbiological Culture & HPLC',
        accreditationStatus: 'ISO/IEC 17025 Accredited',
        publishedFeeBdt: null,
        turnaroundTime: null,
      },
    ],
    publishedFeeNotes: null,
    expectedTurnaround: null,
    sourceName: 'BFSA Laboratory Information Repository & BAB Directory',
    sourceUrl: 'https://labrepository.bfsa.gov.bd/',
    lastVerifiedDate: '2026-11-14',
    dataCompleteness: 'Partial Public Details',
  },
];

export const BFSA_OFFICIAL_INFORMATION_ITEMS: BfsaOfficialInfoItem[] = [
  {
    id: 'bfsa-recall-reg-2021',
    category: 'official_notice',
    title: 'Sub-Standard, Risky or Toxic Food Withdrawal / Recall Regulations, 2021',
    titleBn: 'নিম্নমানের, ঝুঁকিপূর্ণ বা বিষাক্ত পদার্থযুক্ত খাদ্যদ্রব্য প্রত্যাহার প্রবিধানমালা, ২০২১',
    referenceCode: 'BFSA Recall Regulation 2021',
    publishedDate: '2021 (Active Statutory Regulation — verify latest notices on bfsa.gov.bd)',
    summary:
      'Sets the legal framework for market recall, seizure, and public alerting when laboratory results or inspections identify sub-standard, risky, or toxic food products.',
    summaryBn:
      'ল্যাব পরীক্ষা বা পরিদর্শনে নিম্নমানের, ঝুঁকিপূর্ণ বা বিষাক্ত খাদ্য শনাক্ত হলে বাজার থেকে তা প্রত্যাহার ও জনসতর্কতা জারির আইনি প্রবিধান।',
    consumerActions: [
      'Check ongoing recall notices before buying flagged batch lots.',
      'Report suspected hazardous or recalled food batches via BFSA Hotline 16155.',
    ],
    consumerActionsBn: [
      'কোনো পণ্যের ব্যাচ প্রত্যাহার বা নিষিদ্ধ হয়েছে কিনা তা bfsa.gov.bd-এ যাচাই করুন।',
      'সন্দেহজনক বা ঝুঁকিপূর্ণ খাদ্যপণ্য দেখলে বিএফএসএ হটলাইন ১৬১৫৫-এ অভিযোগ করুন।',
    ],
    relatedFoodCategories: ['packaged_food', 'milk_dairy', 'spices', 'oils_fats'],
    sourceName: 'Bangladesh Food Safety Authority (BFSA)',
    sourceUrl: 'https://www.bfsa.gov.bd/',
    lastVerifiedDate: '2026-11-14',
    availabilityNote: 'Official regulation published on BFSA Laws & Regulations portal; check bfsa.gov.bd for specific product recall circulars.',
    availabilityNoteBn: 'বিএফএসএ-এর আইন ও প্রবিধান পোর্টালে প্রকাশিত; নির্দিষ্ট পণ্যের রিকল সার্কুলার দেখতে bfsa.gov.bd দেখুন।',
  },
  {
    id: 'bfsa-alert-preservatives-hydros',
    category: 'food_safety_alert',
    title: 'Public Alert Against Unapproved Preservatives & Industrial Hydros in Food Processing',
    titleBn: 'খাদ্যে অনুমোদনহীন প্রিজারভেটিভ ও ইন্ডাস্ট্রিয়াল হাইড্রোজ (Hydros) ব্যবহারের বিরুদ্ধে সতর্কতা',
    referenceCode: 'BFSA Public Safety Advisory',
    publishedDate: 'Statutory Advisory (Check bfsa.gov.bd Public Notice board for current issue dates)',
    summary:
      'BFSA issues public safety warnings prohibiting excessive or unauthorized preservatives and toxic textile bleaching agents (such as industrial Hydros / Sodium Dithionite) in jaggery (gur), puffed rice (muri), and processed foods.',
    summaryBn:
      'গুড়, মুড়ি ও অন্যান্য খাদ্যে শিল্প-কারখানার হাইড্রোজ বা অনুমোদনহীন মাত্রার প্রিজারভেটিভ ব্যবহারের বিরুদ্ধে বিএফএসএ-এর সতর্কতামূলক গণবিজ্ঞপ্তি।',
    consumerActions: [
      'Avoid unusually bleached-white jaggery (gur) or puffed rice treated for artificial brightness.',
      'Never judge chemical adulteration visually — submit suspect samples to NFSL/BCSIR via BFSA channels.',
    ],
    consumerActionsBn: [
      'অস্বাভাবিক সাদা বা উজ্জ্বল রঙের গুড় ও মুড়ি কেনা থেকে সতর্ক থাকুন।',
      'রাসায়নিক ভেজাল কেবল চোখে দেখে নিশ্চিত হওয়া যায় না; সন্দেহ হলে অনুমোদিত ল্যাবে পরীক্ষা করান।',
    ],
    relatedFoodCategories: ['packaged_food', 'spices', 'grains_cereals'],
    sourceName: 'Bangladesh Food Safety Authority (BFSA)',
    sourceUrl: 'https://www.bfsa.gov.bd/',
    lastVerifiedDate: '2026-11-14',
    availabilityNote: 'Live date-stamped public alerts are hosted directly in the Food Alerts & Public Notices board at bfsa.gov.bd.',
    availabilityNoteBn: 'তারিখসহ সর্বশেষ গণবিজ্ঞপ্তি সরাসরি bfsa.gov.bd-এর নোটিশ বোর্ডে প্রকাশিত হয়।',
  },
  {
    id: 'bfsa-directives-2022',
    category: 'official_notice',
    title: 'Food Safety Directives (No. 01/2022 & 02/2022) & Bakery Packaging Compliance',
    titleBn: 'নিরাপদ খাদ্য নির্দেশনা (নং ০১/২০২২ ও ০২/২০২২) এবং বেকারি মোড়কীকরণ বিধি',
    referenceCode: 'Directives 01/2022 & 02/2022',
    publishedDate: '2022 (In force — check latest amendments at bfsa.gov.bd)',
    summary:
      'Operational directives under the Food Safety Act 2013 governing mandatory packaging, hygiene standards for bakeries/manufacturers, and immediate corrective measures against prohibited additives.',
    summaryBn:
      'নিরাপদ খাদ্য আইন, ২০১৩-এর অধীনে বেকারি ও খাদ্য উৎপাদনকারীদের বাধ্যতামূলক মোড়কীকরণ, লেবেলিং ও স্বাস্থ্যবিধি সংক্রান্ত নির্দেশনা।',
    consumerActions: [
      'Ensure bakery and packaged foods display legible MFG/EXP dates and producer address.',
      'Avoid loose unlabeled packaged snacks lacking batch & manufacturer identity.',
    ],
    consumerActionsBn: [
      'বেকারি ও প্যাকেটজাত খাদ্যে স্পষ্ট উৎপাদন তারিখ, মেয়াদ ও উৎপাদনকারীর ঠিকানা আছে কিনা দেখুন।',
      'ব্যাচ নম্বর ও লেবেলবিহীন প্যাকেটজাত পণ্য পরিহার করুন।',
    ],
    relatedFoodCategories: ['packaged_food'],
    sourceName: 'Bangladesh Food Safety Authority (BFSA)',
    sourceUrl: 'https://www.bfsa.gov.bd/',
    lastVerifiedDate: '2026-11-14',
    availabilityNote: 'Original PDF directives are published under Directives / Orders on www.bfsa.gov.bd.',
    availabilityNoteBn: 'মূল PDF নির্দেশনাগুলো www.bfsa.gov.bd ওয়েবসাইটে সংরক্ষিত আছে।',
  },
  {
    id: 'bfsa-labeling-regulation',
    category: 'safety_guideline',
    title: 'Safe Food (Packaged Food Labeling) Regulations & Mandatory Consumer Disclosures',
    titleBn: 'নিরাপদ খাদ্য (মোড়কাবদ্ধ খাদ্য লেবেলিং) প্রবিধানমালা ও ভোক্তা তথ্য নির্দেশিকা',
    referenceCode: 'BFSA Labeling Regulation',
    publishedDate: 'Active Regulation (Verify current version on bfsa.gov.bd)',
    summary:
      'Defines mandatory package labeling elements in Bangladesh: net weight, full ingredient list, allergen disclosures, storage guidance, batch/lot code, manufacturing date, and expiry/best-before date.',
    summaryBn:
      'বাংলাদেশে প্যাকেটজাত পণ্যের মোড়কে বাধ্যতামূলক তথ্য—উপাদান তালিকা, অ্যালার্জেন, সংরক্ষণ নির্দেশনা, ব্যাচ নম্বর, MFG ও EXP তারিখ উল্লেখের নিয়মাবলি।',
    consumerActions: [
      'Use AaharIQ Label OCR & Barcode Checker to inspect missing or smudged mandatory label fields.',
      'Do not rely solely on an unexpired date if storage seal or package condition is compromised.',
    ],
    consumerActionsBn: [
      'মোড়কের তারিখ ও ব্যাচ নম্বর পড়তে AaharIQ লেবেল OCR টুল ব্যবহার করুন এবং সিল অক্ষত আছে কিনা দেখুন।',
      'প্যাকেটের সিল ভাঙা থাকলে মেয়াদ থাকলেও পণ্যটি নিরাপদ ধরে নেবেন না।',
    ],
    relatedFoodCategories: ['packaged_food', 'milk_dairy', 'oils_fats'],
    sourceName: 'Bangladesh Food Safety Authority (BFSA)',
    sourceUrl: 'https://www.bfsa.gov.bd/',
    lastVerifiedDate: '2026-11-14',
    availabilityNote: 'Full statutory text available via bfsa.gov.bd Laws & Rules section.',
    availabilityNoteBn: 'পূর্ণাঙ্গ বিধিমালা bfsa.gov.bd-এর আইন ও বিধি শাখায় পাওয়া যাবে।',
  },
  {
    id: 'bfsa-household-five-keys-guideline',
    category: 'safety_guideline',
    title: 'BFSA Household Food Safety Guidelines & Five Keys to Safer Food',
    titleBn: 'বিএফএসএ নিরাপদ খাদ্য বিষয়ক পারিবারিক নির্দেশিকা ও খাদ্য নিরাপদ রাখার ৫ চাবিকাঠি',
    referenceCode: 'BFSA Consumer Guideline',
    publishedDate: 'Official Published Manual (Downloadable at bfsa.gov.bd)',
    summary:
      'National family-level guidelines covering clean preparation, separating raw fish/meat from cooked food, thorough cooking temperatures, safe chilled storage, and potable water usage.',
    summaryBn:
      'গৃহস্থালি পর্যায়ে খাদ্য নিরাপদ রাখার সরকারি গাইডলাইন—পরিচ্ছন্নতা, কাঁচা ও রান্না খাবার আলাদা রাখা, সঠিক তাপমাত্রায় রান্না ও সংরক্ষণ এবং বিশুদ্ধ পানি ব্যবহার।',
    consumerActions: [
      'Wash fresh vegetables and fruits thoroughly under clean running water.',
      'Keep raw fish and meat below cooked dishes inside refrigerators (≤ 4°C).',
    ],
    consumerActionsBn: [
      'কাঁচা সবজি ও ফল পরিষ্কার প্রবাহমান পানিতে ভালোভাবে ধুয়ে নিন।',
      'ফ্রিজে (≤ ৪°C) কাঁচা মাছ-মাংস আলাদা ও নিচের তাকে রাখুন।',
    ],
    relatedFoodCategories: ['vegetables', 'fruits', 'fish', 'meat_poultry', 'water_beverages'],
    sourceName: 'Bangladesh Food Safety Authority (BFSA)',
    sourceUrl: 'https://www.bfsa.gov.bd/',
    lastVerifiedDate: '2026-11-14',
    availabilityNote: 'Downloadable Bengali consumer handbook hosted on www.bfsa.gov.bd.',
    availabilityNoteBn: 'বাংলা পারিবারিক নির্দেশিকা বইটি সরাসরি www.bfsa.gov.bd থেকে ডাউনলোড করা যায়।',
  },
  {
    id: 'bfsa-consumer-complaint-hotline',
    category: 'consumer_info',
    title: 'Consumer Complaint Channel, Restaurant Hygiene Grading & Head Office Directory',
    titleBn: 'ভোক্তা অভিযোগ হটলাইন ১৬১৫৫, রেস্তোরাঁ হাইজিন গ্রেডিং ও প্রধান কার্যালয় তথ্য',
    referenceCode: 'Hotline 16155',
    publishedDate: 'Official Contact Info (Active)',
    summary:
      'Bangladesh Food Safety Authority operates consumer complaint hotline 16155 from Probashi Kallyan Bhaban (Level 12), 71-72 Eskaton Garden, Dhaka, and publishes restaurant hygiene grading icons (A+/A) for dining safety.',
    summaryBn:
      'প্রবাসী কল্যাণ ভবন (স্তর-১২), ৭১-৭২ এস্কাটন গার্ডেন, ঢাকা থেকে পরিচালিত বিএফএসএ-এর জাতীয় হটলাইন ১৬১৫৫ এবং রেস্তোরাঁর স্বাস্থ্যবিধি গ্রেডিং স্টিকার।',
    consumerActions: [
      'Call 16155 or submit evidence via bfsa.gov.bd to request official inspection or sampling.',
      'Look for official BFSA hygiene grading stickers at restaurants.',
    ],
    consumerActionsBn: [
      'অস্বাস্থ্যকর বা সন্দেহজনক খাদ্যের বিরুদ্ধে ১৬১৫৫ হটলাইনে কল করুন অথবা bfsa.gov.bd-এ অভিযোগ জানান।',
      'রেস্তোরাঁয় খাবারের আগে বিএফএসএ-এর সবুজ/নীল গ্রেডিং (A+/A) স্টিকার যাচাই করুন।',
    ],
    relatedFoodCategories: ['packaged_food', 'cooked_food' as any, 'fish', 'milk_dairy'],
    sourceName: 'Bangladesh Food Safety Authority (BFSA)',
    sourceUrl: 'https://www.bfsa.gov.bd/',
    lastVerifiedDate: '2026-11-14',
    availabilityNote: 'Verified BFSA Head Office address and consumer helpline number.',
    availabilityNoteBn: 'যাচাইকৃত বিএফএসএ প্রধান কার্যালয় ঠিকানা ও সরকারি হেল্পলাইন নম্বর।',
  },
];

export interface BfsaLaboratorySearchFilters {
  foodName?: string;
  foodCategory?: BfsaFoodMatrixCategory | 'all';
  testParameter?: string;
  labName?: string;
  division?: string;
  district?: string;
}

export function filterBfsaLaboratories(
  labs: BfsaLaboratoryRecord[],
  filters: BfsaLaboratorySearchFilters
): BfsaLaboratoryRecord[] {
  const foodQ = (filters.foodName || '').trim().toLowerCase();
  const paramQ = (filters.testParameter || '').trim().toLowerCase();
  const labQ = (filters.labName || '').trim().toLowerCase();
  const divQ = (filters.division || 'all').trim().toLowerCase();
  const distQ = (filters.district || 'all').trim().toLowerCase();
  const catFilter = filters.foodCategory || 'all';

  return labs.filter((lab) => {
    if (catFilter !== 'all' && !lab.foodTypesTested.includes(catFilter)) {
      return false;
    }
    if (divQ !== 'all' && lab.division.toLowerCase() !== divQ) {
      return false;
    }
    if (distQ !== 'all' && lab.district.toLowerCase() !== distQ) {
      return false;
    }
    if (labQ) {
      const labMatch =
        lab.labName.toLowerCase().includes(labQ) ||
        lab.labNameBn.toLowerCase().includes(labQ) ||
        lab.parentOrganization.toLowerCase().includes(labQ);
      if (!labMatch) return false;
    }
    if (foodQ) {
      const foodMatch =
        lab.foodItemsSummary.some((f) => f.toLowerCase().includes(foodQ)) ||
        lab.foodItemsSummaryBn.some((f) => f.toLowerCase().includes(foodQ)) ||
        lab.parameters.some((p) =>
          p.foodExamples.some((ex) => ex.toLowerCase().includes(foodQ))
        );
      if (!foodMatch) return false;
    }
    if (paramQ) {
      const paramMatch = lab.parameters.some(
        (p) =>
          p.parameterName.toLowerCase().includes(paramQ) ||
          p.parameterNameBn.toLowerCase().includes(paramQ) ||
          p.categoryGroup.toLowerCase().includes(paramQ) ||
          p.testingMethod.toLowerCase().includes(paramQ)
      );
      if (!paramMatch) return false;
    }
    return true;
  });
}

export interface BfsaRecommendedTestEntry {
  parameter: BfsaLabTestParameter;
  confirmedLabs: Array<{
    id: string;
    labName: string;
    labNameBn: string;
    division: string;
    district: string;
    accreditationSummary: string;
    sourceUrl: string;
  }>;
}

/**
 * Strictly derives recommended tests ONLY from verified laboratory parameter entries matching the selected food category.
 * Never invents tests or assigns an unconfirmed laboratory.
 */
export function getBfsaTestRecommendationsForMatrix(
  labs: BfsaLaboratoryRecord[],
  matrixCategory: BfsaFoodMatrixCategory
): BfsaRecommendedTestEntry[] {
  const byParamKey = new Map<string, BfsaRecommendedTestEntry>();

  for (const lab of labs) {
    for (const param of lab.parameters) {
      if (!param.foodMatrices.includes(matrixCategory)) continue;
      const key = `${param.categoryGroup}::${param.parameterName.toLowerCase()}`;
      const existing = byParamKey.get(key);
      const labRef = {
        id: lab.id,
        labName: lab.labName,
        labNameBn: lab.labNameBn,
        division: lab.division,
        district: lab.district,
        accreditationSummary: lab.accreditationSummary,
        sourceUrl: lab.sourceUrl,
      };
      if (existing) {
        if (!existing.confirmedLabs.some((l) => l.id === lab.id)) {
          existing.confirmedLabs.push(labRef);
        }
      } else {
        byParamKey.set(key, {
          parameter: param,
          confirmedLabs: [labRef],
        });
      }
    }
  }

  return Array.from(byParamKey.values());
}

export function getBfsaDivisionsAndDistricts(labs: BfsaLaboratoryRecord[]): {
  divisions: string[];
  districts: string[];
} {
  const divs = Array.from(new Set(labs.map((l) => l.division))).sort();
  const dists = Array.from(new Set(labs.map((l) => l.district))).sort();
  return { divisions: divs, districts: dists };
}

export function getBfsaInfoCategoryLabel(cat: BfsaInfoCategory, isBn: boolean): string {
  switch (cat) {
    case 'food_safety_alert':
      return isBn ? 'খাদ্য নিরাপত্তা সতর্কতা' : 'Food Safety Alert';
    case 'official_notice':
      return isBn ? 'সরকারি বিজ্ঞপ্তি / প্রবিধান' : 'Official Notice / Regulation';
    case 'safety_guideline':
      return isBn ? 'খাদ্য নিরাপত্তা নির্দেশিকা' : 'Food Safety Guideline';
    case 'consumer_info':
      return isBn ? 'ভোক্তা তথ্য ও হটলাইন' : 'Consumer Information';
  }
}
