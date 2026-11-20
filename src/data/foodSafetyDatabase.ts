import {
  FoodSafetyCenterReport,
  FreshnessInspectionDetails,
  LabelOcrResult,
  PackagedFoodDetails,
  SafetyAssessmentStatus,
  SafetyCategoryAssessment,
  SafetyFoodCategory,
} from '../types';

export const CRITICAL_SAFETY_RULE =
  'A photograph cannot establish chemical purity or rule out harmful contamination. Laboratory testing is required for confirmation.';
export const CRITICAL_SAFETY_RULE_BN =
  'একটি ছবি রাসায়নিক বিশুদ্ধতা প্রমাণ করতে বা ক্ষতিকর দূষণের ঝুঁকি নাকচ করতে পারে না। নিশ্চিতকরণের জন্য ল্যাবরেটরি পরীক্ষা প্রয়োজন।';

export interface AdulterationCategoryProfile {
  id: SafetyFoodCategory | 'edible_oil';
  title: string;
  titleBn: string;
  bangladeshiExamples: string[];
  bangladeshiExamplesBn: string[];
  possibleConcerns: string[];
  possibleConcernsBn: string[];
  knownAdulterants: string[];
  knownAdulterantsBn: string[];
  officialAlertGuidance: string;
  officialAlertGuidanceBn: string;
  recommendedLabTests: string[];
  recommendedLabTestsBn: string[];
}

export interface ContaminationEducationTopic {
  id: 'chemical' | 'microbial' | 'physical' | 'adulteration' | 'storage' | 'hygiene';
  title: string;
  titleBn: string;
  summary: string;
  summaryBn: string;
  examples: string[];
  examplesBn: string[];
  preventionSteps: string[];
  preventionStepsBn: string[];
  laboratoryTests: string[];
  laboratoryTestsBn: string[];
}

export interface TrustedAuthorityLink {
  name: string;
  nameBn: string;
  role: string;
  roleBn: string;
  url: string;
  hotline?: string;
}

export const BANGLADESH_OFFICIAL_AUTHORITIES: TrustedAuthorityLink[] = [
  {
    name: 'Bangladesh Food Safety Authority (BFSA)',
    nameBn: 'বাংলাদেশ নিরাপদ খাদ্য কর্তৃপক্ষ (BFSA)',
    role: 'National regulatory body for food safety monitoring, official advisories, and consumer complaints.',
    roleBn: 'খাদ্য নিরাপত্তা পর্যবেক্ষণ, সরকারি সতর্কতা ও অভিযোগ গ্রহণের জাতীয় নিয়ন্ত্রক সংস্থা।',
    url: 'https://bfsa.gov.bd',
    hotline: '16155',
  },
  {
    name: 'Bangladesh Standards and Testing Institution (BSTI)',
    nameBn: 'বাংলাদেশ স্ট্যান্ডার্ডস অ্যান্ড টেস্টিং ইনস্টিটিউশন (BSTI)',
    role: 'National standardization & product certification authority for packaged food quality marks.',
    roleBn: 'প্যাকেটজাত পণ্যের মান নির্ধারণ ও বিএসটিআই অনুমোদন যাচাইকারী প্রতিষ্ঠান।',
    url: 'https://bsti.gov.bd',
  },
  {
    name: 'National Food Safety Laboratory (NFSL / IPH)',
    nameBn: 'ন্যাশনাল ফুড সেফটি ল্যাবরেটরি (NFSL / IPH)',
    role: 'Accredited reference laboratory for pesticide, heavy metal, mycotoxin, and microbial food testing.',
    roleBn: 'কীটনাশক, ভারী ধাতু, মাইকোটক্সিন ও অণুজীব পরীক্ষার জাতীয় রেফারেন্স ল্যাবরেটরি।',
    url: 'https://nfsl.gov.bd',
  },
  {
    name: 'BCSIR Food Science & Technology',
    nameBn: 'বিসিএসআইআর (BCSIR) খাদ্য বিজ্ঞান ও প্রযুক্তি',
    role: 'Government scientific research institute offering analytical chemical and nutritional lab testing.',
    roleBn: 'খাদ্যের রাসায়নিক ও পুষ্টিমান বিশ্লেষণের জন্য সরকারি বৈজ্ঞানিক গবেষণা প্রতিষ্ঠান।',
    url: 'https://bcsir.gov.bd',
  },
  {
    name: 'OpenFoodFacts Public Registry',
    nameBn: 'OpenFoodFacts উন্মুক্ত পণ্যের ডেটাবেজ',
    role: 'Open collaborative database for barcode, ingredient, allergen, and packaged nutrition comparison.',
    roleBn: 'বারকোড, উপাদান, অ্যালার্জেন ও পুষ্টিতথ্য মিলিয়ে দেখার উন্মুক্ত আন্তর্জাতিক ডেটাবেজ।',
    url: 'https://world.openfoodfacts.org',
  },
];

export const ADULTERATION_PROFILES: AdulterationCategoryProfile[] = [
  {
    id: 'fish',
    title: 'Fresh & Dried Fish (মাছ ও শুঁটকি)',
    titleBn: 'তাজা মাছ ও শুঁটকি',
    bangladeshiExamples: ['Hilsa (ইলিশ)', 'Rui / Katla', 'Tilapia', 'Pangas', 'Shutki (শুঁটকি)'],
    bangladeshiExamplesBn: ['ইলিশ মাছ', 'রুই / কাতল', 'তেলাপিয়া', 'পাঙ্গাস', 'শুঁটকি'],
    possibleConcerns: [
      'Preservation abuse to mask natural spoilage in warm supply chains.',
      'Insecticide contamination concerns occasionally reported in sun-dried fish (shutki).',
    ],
    possibleConcernsBn: [
      'গরম আবহাওয়ায় পচন আড়াল করতে অনুমোদনহীন রাসায়নিক ব্যবহারের ঝুঁকি।',
      'শুঁটকি মাছে পোকা রোধে ক্ষতিকর কীটনাশক ব্যবহারের আশঙ্কা।',
    ],
    knownAdulterants: [
      'Formalin / formaldehyde (unapproved preservative)',
      'Industrial textile dyes used on fish gills to simulate freshness',
      'Organophosphate / DDT residues in improperly processed dried fish',
    ],
    knownAdulterantsBn: [
      'ফরমালিন / ফরমালডিহাইড',
      'কানকো লাল দেখাতে কৃত্রিম টেক্সটাইল রং',
      'শুঁটকিতে ক্ষতিকর কীটনাশকের অবশিষ্টাংশ',
    ],
    officialAlertGuidance:
      'Check official BFSA & Fisheries Department circulars for seasonal testing drives; mobile-court notifications are published on bfsa.gov.bd.',
    officialAlertGuidanceBn:
      'মৌসুমী অভিযান ও পরীক্ষা সংক্রান্ত সরকারি বিজ্ঞপ্তি bfsa.gov.bd ও মৎস্য অধিদপ্তরের পোর্টালে প্রকাশিত হয়।',
    recommendedLabTests: [
      'Spectrophotometric Formaldehyde Quantification (Chromotropic acid / Nash method)',
      'GC-MS / LC-MS Pesticide Residue Screening (for dried fish)',
      'Total Volatile Basic Nitrogen (TVB-N) & Aerobic Plate Count for freshness',
    ],
    recommendedLabTestsBn: [
      'স্পেকট্রোফটোমেট্রিক ফরমালডিহাইড পরীক্ষা',
      'জিসি-এমএস / এলসি-এমএস কীটনাশক অবশিষ্টাংশ পরীক্ষা (শুঁটকি)',
      'টিভিবি-এন ও মাইক্রোবায়োলজিক্যাল প্লেট কাউন্ট পরীক্ষা',
    ],
  },
  {
    id: 'fruits',
    title: 'Seasonal Fruits (ফলমূল)',
    titleBn: 'মৌসুমী ফলমূল (আম, কলা, লিচু)',
    bangladeshiExamples: ['Mango (আম)', 'Banana (কলা)', 'Lychee (লিচু)', 'Papaya (পেঁপে)', 'Jackfruit'],
    bangladeshiExamplesBn: ['আম', 'কলা', 'লিচু', 'পেঁপে', 'কাঁঠাল'],
    possibleConcerns: [
      'Artificial forced ripening prior to natural maturity.',
      'Pre-harvest pesticide residues if harvest withdrawal intervals are ignored.',
    ],
    possibleConcernsBn: [
      'অপরিপক্ক ফল কৃত্রিমভাবে তাড়াতাড়ি পাকানোর প্রবণতা।',
      'ফসল সংগ্রহের নির্দিষ্ট সময়সীমা না মানলে কীটনাশকের অবশিষ্টাংশ থাকা।',
    ],
    knownAdulterants: [
      'Calcium carbide (releases acetylene containing arsenic/phosphorus traces)',
      'Improper concentrations of ethephon / ripening dips',
      'Organophosphate / pyrethroid surface residues',
    ],
    knownAdulterantsBn: [
      'ক্যালসিয়াম কার্বাইড',
      'অনুমোদিত মাত্রার অতিরিক্ত ইথেফন/রাইপেনিং এজেন্ট',
      'অর্গানফসফেট কীটনাশকের অবশিষ্টাংশ',
    ],
    officialAlertGuidance:
      'BFSA publishes annual seasonal mango & lychee safety advisories and maximum residue limits (MRL).',
    officialAlertGuidanceBn:
      'বিএফএসএ প্রতি বছর আম ও লিচুর মৌসুমে নিরাপদ সংগ্রহ ও এমআরএল (MRL) সংক্রান্ত নির্দেশনা প্রকাশ করে।',
    recommendedLabTests: [
      'Inductively Coupled Plasma Mass Spectrometry (ICP-MS) for arsenic/phosphorus trace',
      'LC-MS/MS Multi-Residue Pesticide Analysis',
      'Ethephon residue chromatography',
    ],
    recommendedLabTestsBn: [
      'আর্সেনিক/ফসফরাস ট্রেস নির্ণয়ে ICP-MS পরীক্ষা',
      'মাল্টি-রেসিডিউ কীটনাশক স্ক্রিনিং (LC-MS/MS)',
      'ইথেফন অবশিষ্টাংশ ক্রোমাটোগ্রাফি',
    ],
  },
  {
    id: 'vegetables',
    title: 'Fresh Vegetables & Greens (শাকসবজি)',
    titleBn: 'তাজা শাকসবজি (বেগুন, টমেটো, লাল শাক)',
    bangladeshiExamples: ['Brinjal (বেগুন)', 'Tomato (টমেটো)', 'Lal Shaak', 'Cauliflower', 'Okra'],
    bangladeshiExamplesBn: ['বেগুন', 'টমেটো', 'লাল শাক', 'ফুলকপি', 'ঢেঁড়স'],
    possibleConcerns: [
      'Surface or systemic agricultural pesticide residues above MRL.',
      'Heavy metal uptake (lead, cadmium, chromium) when irrigated with polluted industrial water.',
    ],
    possibleConcernsBn: [
      'অনুমোদিত মাত্রার চেয়ে বেশি কৃষিজ কীটনাশকের অবশিষ্টাংশ।',
      'দূষিত পানি সেচের কারণে ভারী ধাতু (সিসা, ক্যাডমিয়াম, ক্রোমিয়াম) জমার ঝুঁকি।',
    ],
    knownAdulterants: [
      'Copper sulfate / malachite green dips (reported in loose green vegetables)',
      'Persistent insecticides (chlorpyrifos, cypermethrin) & heavy metals',
    ],
    knownAdulterantsBn: [
      'সবুজ রং উজ্জ্বল করতে কৃত্রিম রং বা কপার সালফেট',
      'কীটনাশক (ক্লোরপাইরিফস, সাইপারমেথ্রিন) ও ভারী ধাতু',
    ],
    officialAlertGuidance:
      'Verify vegetable origin where possible, soak & wash under running potable water, and monitor NFSL/BARI monitoring bulletins.',
    officialAlertGuidanceBn:
      'বিশ্বস্ত উৎস থেকে সবজি সংগ্রহ করুন, পরিষ্কার প্রবাহমান পানিতে ভালো করে ধুয়ে নিন এবং NFSL/BFSA বুলেটিন অনুসরণ করুন।',
    recommendedLabTests: [
      'QuEChERS Extraction + GC-MS/MS for pesticide residues',
      'Atomic Absorption Spectroscopy (AAS) / ICP-MS for Pb, Cd, Cr, As',
      'Water-soluble synthetic dye chromatography',
    ],
    recommendedLabTestsBn: [
      'QuEChERS ও GC-MS/MS পদ্ধতিতে কীটনাশক পরীক্ষা',
      'AAS / ICP-MS পদ্ধতিতে ভারী ধাতু পরীক্ষা',
      'কৃত্রিম রং শনাক্তকরণ ক্রোমাটোগ্রাফি',
    ],
  },
  {
    id: 'dairy_spices',
    title: 'Milk, Dairy & Ground Spices (দুধ ও গুঁড়া মসলা)',
    titleBn: 'দুধ, দই, ঘি এবং হলুদ-মরিচের গুঁড়া',
    bangladeshiExamples: ['Liquid Milk (তরল দুধ)', 'Turmeric Powder (হলুদ গুঁড়া)', 'Chili Powder', 'Mustard Oil'],
    bangladeshiExamplesBn: ['তরল দুধ', 'হলুদ গুঁড়া', 'মরিচ গুঁড়া', 'সরিষার তেল'],
    possibleConcerns: [
      'Dilution and density compensation in loose/unpasteurized milk.',
      'Color enhancement or bulking in loose unbranded spice powders.',
    ],
    possibleConcernsBn: [
      'খোলা দুধে পানি মেশানো ও ঘনত্ব বাড়াতে অনুমোদনহীন উপাদান যোগ করার ঝুঁকি।',
      'খোলা গুঁড়া মসলায় ওজন বা রং বাড়াতে কৃত্রিম উপাদান মেশানোর আশঙ্কা।',
    ],
    knownAdulterants: [
      'Milk: Excess water, starch, detergent, hydrogen peroxide, or urea',
      'Turmeric / Chili: Lead chromate, Metanil Yellow, Sudan Red dyes, brick/sawdust filler',
      'Mustard Oil: Argemone oil, mineral oil, or cheap palm/soybean blending',
    ],
    knownAdulterantsBn: [
      'দুধ: অতিরিক্ত পানি, স্টার্চ, ডিটারজেন্ট, ইউরিয়া',
      'হলুদ/মরিচ: লেড ক্রোমেট, মেটানিল ইয়েলো, সুদান রেড বা ভূষি/ইটের গুঁড়া',
      'সরিষার তেল: খনিজ তেল, আরজেমোন তেল বা সস্তা তেলের মিশ্রণ',
    ],
    officialAlertGuidance:
      'Prefer BSTI-certified sealed packs or pasteurized dairy with intact batch codes; check BSTI product cancellation notices at bsti.gov.bd.',
    officialAlertGuidanceBn:
      'সিল করা ও মেয়াদযুক্ত বিএসটিআই অনুমোদিত পণ্য বেছে নিন এবং bsti.gov.bd-তে বাতিলকৃত লাইসেন্স তালিকা দেখে নিন।',
    recommendedLabTests: [
      'Milk: Lactometer + Cryoscope freezing point + Urea/Detergent chemical assay + Total Bacterial Count',
      'Spices: ICP-MS / AAS for Lead (Pb) & HPLC for Sudan I-IV / Metanil Yellow dyes',
      'Oils: Fatty Acid Profile (GC-FID), Peroxide Value & Acid Value',
    ],
    recommendedLabTestsBn: [
      'দুধ: ক্রায়োস্কোপ ফ্রিজিং পয়েন্ট, ল্যাকটোমিটার, ইউরিয়া ও ব্যাকটেরিয়া পরীক্ষা',
      'মসলা: সিসা নির্ণয়ে AAS/ICP-MS এবং কৃত্রিম রঙে HPLC',
      'তেল: ফ্যাটি এসিড প্রোফাইল (GC-FID) ও পারঅক্সাইড ভ্যালু',
    ],
  },
  {
    id: 'meat',
    title: 'Raw Meat & Poultry (মাংস ও মুরগি)',
    titleBn: 'গরু, খাসি ও মুরগির মাংস',
    bangladeshiExamples: ['Beef (গরুর মাংস)', 'Chicken (মুরগি)', 'Mutton (খাসি)'],
    bangladeshiExamplesBn: ['গরুর মাংস', 'মুরগির মাংস', 'খাসির মাংস'],
    possibleConcerns: [
      'Microbial spoilage when ambient display exceeds safe cold-chain limits.',
      'Veterinary antibiotic residues or unhygienic slaughtering surfaces.',
    ],
    possibleConcernsBn: [
      'ঠান্ডা সংরক্ষণ ব্যবস্থা না থাকায় দ্রুত ব্যাকটেরিয়া বৃদ্ধি।',
      'পশুখাদ্যের অ্যান্টিবায়োটিক অবশিষ্টাংশ ও অস্বাস্থ্যকর প্রক্রিয়াকরণ।',
    ],
    knownAdulterants: [
      'Water-pumping / moisture retention abuse',
      'Antibiotic / growth-promoter residues in poultry & cattle tissues',
    ],
    knownAdulterantsBn: [
      'ওজন বাড়াতে পানি প্রবেশ করানো',
      'পোল্ট্রি ও গবাদিপশুর মাংসে অ্যান্টিবায়োটিক অবশিষ্টাংশ',
    ],
    officialAlertGuidance:
      'Purchase freshly slaughtered or properly chilled (≤ 4°C) meat from hygienic municipal/certified outlets.',
    officialAlertGuidanceBn:
      'পরিচ্ছন্ন ও অনুমোদিত দোকান থেকে তাজা বা সঠিকভাবে হিমায়িত (≤ ৪°C) মাংস সংগ্রহ করুন।',
    recommendedLabTests: [
      'Microbiological culture for Salmonella spp., E. coli, Listeria & Staphylococcus aureus',
      'LC-MS/MS Veterinary Antibiotic Residue Screening',
      'Drip-loss / moisture-to-protein ratio determination',
    ],
    recommendedLabTestsBn: [
      'সালমোনেলা, ই. কোলাই ও লিস্টেরিয়া মাইক্রোবায়োলজিক্যাল কালচার',
      'ভেটেরিনারি অ্যান্টিবায়োটিক অবশিষ্টাংশ পরীক্ষা (LC-MS/MS)',
      'ময়েশ্চার-টু-প্রোটিন অনুপাত পরীক্ষা',
    ],
  },
  {
    id: 'cooked_food',
    title: 'Cooked Meals & Street Food (রান্না ও রাস্তার খাবার)',
    titleBn: 'রান্না করা খাবার ও স্ট্রিট ফুড',
    bangladeshiExamples: ['Biryani', 'Singara / Samusa', 'Jilapi', 'Curry Dishes', 'Doi Fuchka'],
    bangladeshiExamplesBn: ['বিরিয়ানি', 'সিঙ্গারা / সমুচা', 'জিলাপি', 'তরকারি', 'দই ফুচকা'],
    possibleConcerns: [
      'Repeatedly heated frying oil generating toxic polar compounds & acrylamide.',
      'Textile colors in sweets/biryani and bacterial contamination from unhygienic handling.',
    ],
    possibleConcernsBn: [
      'একই তেল বারবার গরম করে ভাজাপোড়ায় ব্যবহার।',
      'বিরিয়ানি বা মিষ্টিতে অনুমোদনহীন রং ও অপরিষ্কার হাতে পরিবেশনে জীবাণু সংক্রমণ।',
    ],
    knownAdulterants: [
      'Non-food textile dyes (Orange II, Rhodamine B, Metanil Yellow)',
      'Total Polar Materials (TPM) > 25% in overused frying oils',
    ],
    knownAdulterantsBn: [
      'খাদ্য-অনুপযোগী কাপড়ের রং (রোডামিন বি, মেটানিল ইয়েলো)',
      'অতিরিক্ত পোড়া তেলে ক্ষতিকর পোলার কম্পাউন্ড',
    ],
    officialAlertGuidance:
      'Look for BFSA A+ / A Hygiene Rating stickers on Dhaka and metropolitan restaurants.',
    officialAlertGuidanceBn:
      'রেস্তোরাঁয় বিএফএসএ-এর সবুজ/নীল গ্রেডিং (A+/A) স্টিকার ও পরিচ্ছন্নতা লক্ষ্য করুন।',
    recommendedLabTests: [
      'Foodborne Pathogen Culture (Bacillus cereus in cooked rice, Salmonella, Coliforms)',
      'HPLC / TLC Synthetic Textile Dye Analysis',
      'Oil TPM (Total Polar Materials) Meter & Peroxide Value',
    ],
    recommendedLabTestsBn: [
      'ব্যাসিলাস সিরিয়াস, কলিফর্ম ও সালমোনেলা জীবাণু পরীক্ষা',
      'কৃত্রিম টেক্সটাইল রং নির্ণয়ে HPLC / TLC',
      'ভোজ্য তেলের TPM ও পারঅক্সাইড পরীক্ষা',
    ],
  },
  {
    id: 'packaged_food',
    title: 'Packaged & Processed Food (প্যাকেটজাত খাদ্য)',
    titleBn: 'প্যাকেটজাত খাদ্য, পানীয় ও স্ন্যাকস',
    bangladeshiExamples: ['Biscuits', 'Instant Noodles', 'Fruit Drinks', 'Chips', 'Canned Goods'],
    bangladeshiExamplesBn: ['বিস্কুট', 'ইনস্ট্যান্ট নুডলস', 'জুস/পানীয়', 'চিপস', 'টিনজাত খাবার'],
    possibleConcerns: [
      'Tampered/overprinted expiry dates, missing batch numbers, or counterfeit branding.',
      'Excessive trans fats, sodium, sugar, or unapproved preservatives.',
    ],
    possibleConcernsBn: [
      'মুছে ফেলা বা পরিবর্তন করা মেয়াদ, অনুপস্থিত ব্যাচ নম্বর বা নকল মোড়ক।',
      'অতিরিক্ত ট্রান্স ফ্যাট, সোডিয়াম, চিনি বা অনুমোদনহীন প্রিজারভেটিভ।',
    ],
    knownAdulterants: [
      'Benzoate / sorbate preservatives above statutory limits',
      'Partially hydrogenated oils (industrial trans fats)',
    ],
    knownAdulterantsBn: [
      'অনুমোদিত সীমার বেশি প্রিজারভেটিভ (বেনজয়েট/সরবেট)',
      'অস্বাস্থ্যকর ইন্ডাস্ট্রিয়াল ট্রান্স ফ্যাট',
    ],
    officialAlertGuidance:
      'Always verify intact manufacturer seal, batch code, BSTI certification mark (when applicable), and OpenFoodFacts barcode consistency.',
    officialAlertGuidanceBn:
      'মোড়কের সিল, ব্যাচ কোড, উৎপাদনের তারিখ ও মেয়াদ অক্ষত আছে কিনা দেখুন এবং বারকোড মিলিয়ে নিন।',
    recommendedLabTests: [
      'HPLC Preservative & Artificial Sweetener Quantification',
      'GC-FID Trans-Fatty Acid & Nutritional Label Verification',
      'Commercial Sterility & Swelling Microbial Test (for canned/UHT goods)',
    ],
    recommendedLabTestsBn: [
      'প্রিজারভেটিভ ও কৃত্রিম মিষ্টির মাত্রা নির্ণয়ে HPLC',
      'ট্রান্স-ফ্যাট ও নিউট্রিশন লেবেল যাচাইয়ে GC-FID',
      'ফুলে যাওয়া প্যাকেট বা ক্যানের মাইক্রোবায়োলজিক্যাল পরীক্ষা',
    ],
  },
];

export const CONTAMINATION_EDUCATION_TOPICS: ContaminationEducationTopic[] = [
  {
    id: 'chemical',
    title: '1. Chemical Contamination',
    titleBn: '১. রাসায়নিক দূষণ (Chemical Contamination)',
    summary:
      'Occurs when foods absorb agricultural pesticides, heavy metals (lead, arsenic, cadmium), cleaning agents, or harmful packaging leachates.',
    summaryBn:
      'খাদ্যে কৃষিজ কীটনাশক, ভারী ধাতু (সিসা, আর্সেনিক, ক্যাডমিয়াম), ডিটারজেন্ট বা প্লাস্টিক/প্যাকেজিংয়ের ক্ষতিকর রাসায়নিক মিশে গেলে রাসায়নিক দূষণ হয়।',
    examples: [
      'Residual insecticides on unwashed brinjal, greens, or seasonal fruits',
      'Heavy metals from industrial effluent irrigation',
      'Bisphenol-A / phthalates leaching from hot food stored in non-food-grade plastic',
    ],
    examplesBn: [
      'শাকসবজি ও ফলে থেকে যাওয়া অতিরিক্ত কীটনাশক',
      'দূষিত সেচ বা মাটি থেকে আসা সিসা ও আর্সেনিক',
      'গরম খাবার নিম্নমানের প্লাস্টিক পাত্রে রাখলে নির্গত রাসায়নিক',
    ],
    preventionSteps: [
      'Wash produce thoroughly in clean running water; peel where appropriate.',
      'Use glass, stainless steel, or food-grade BPA-free containers for hot foods.',
    ],
    preventionStepsBn: [
      'পরিষ্কার প্রবাহমান পানিতে সবজি-ফল ভালোভাবে ধুয়ে নিন এবং প্রয়োজনে খোসা ছাড়ান।',
      'গরম খাবার রাখতে কাঁচ, স্টিল বা অনুমোদিত ফুড-গ্রেড পাত্র ব্যবহার করুন।',
    ],
    laboratoryTests: ['LC-MS/MS & GC-MS (Pesticide Multi-Residue)', 'ICP-MS / AAS (Heavy Metals)', 'HPLC (Industrial Dyes & Toxins)'],
    laboratoryTestsBn: ['LC-MS/MS ও GC-MS (কীটনাশক)', 'ICP-MS / AAS (ভারী ধাতু)', 'HPLC (কৃত্রিম রং ও টক্সিন)'],
  },
  {
    id: 'microbial',
    title: '2. Microbial Contamination',
    titleBn: '২. জীবাণুজনিত দূষণ (Microbial Contamination)',
    summary:
      'Caused by bacteria (Salmonella, E. coli, Listeria, Bacillus cereus), viruses, parasites, or mold toxins (aflatoxins) multiplying in improperly handled food.',
    summaryBn:
      'অপরিচ্ছন্ন পরিবেশ বা ভুল তাপমাত্রায় খাদ্যে ব্যাকটেরিয়া (সালমোনেলা, ই. কোলাই, ব্যাসিলাস সিরিয়াস), ভাইরাস বা ছত্রাকের বিষ (আফ্লাটক্সিন) জন্মালে এই দূষণ ঘটে।',
    examples: [
      'Cooked rice left at warm room temperature > 2 hours (Bacillus cereus)',
      'Cross-contamination from raw fish/chicken juices to fresh salad',
      'Visible green/black mold on damp peanuts, rice, bread, or spices (Mycotoxins)',
    ],
    examplesBn: [
      'গরম আবহাওয়ায় রান্না করা ভাত ২ ঘণ্টার বেশি বাইরে রাখলে ব্যাকটেরিয়া বৃদ্ধি',
      'কাঁচা মাছ-মাংসের রস সালাদ বা রান্না খাবারে লেগে যাওয়া',
      'ভেজা বাদাম, মসলা বা রুটিতে সাদা/সবুজ/কালো ছত্রাক (মাইকোটক্সিন)',
    ],
    preventionSteps: [
      'Cook poultry/meat thoroughly (core ≥ 74°C) and refrigerate leftovers promptly at ≤ 4°C.',
      'Discard moldy bread, nuts, or soft foods entirely — toxins penetrate beneath the surface.',
    ],
    preventionStepsBn: [
      'মাছ-মাংস ভালোভাবে সেদ্ধ করুন (৭৪°C+) এবং বাড়তি খাবার দ্রুত ফ্রিজে (≤ ৪°C) রাখুন।',
      'ছত্রাক পড়া রুটি, বাদাম বা নরম খাবার অংশ কেটে না খেয়ে সম্পূর্ণ ফেলে দিন।',
    ],
    laboratoryTests: ['Standard Aerobic Plate Count & Coliform MPN', 'Selective Culture / PCR (Salmonella, E. coli, Listeria)', 'ELISA / HPLC (Aflatoxin & Ochratoxin)'],
    laboratoryTestsBn: ['প্লেট কাউন্ট ও কলিফর্ম MPN পরীক্ষা', 'পিসিআর ও কালচার (সালমোনেলা/ই. কোলাই)', 'ELISA / HPLC (আফ্লাটক্সিন)'],
  },
  {
    id: 'physical',
    title: '3. Physical Contamination',
    titleBn: '৩. ভৌত বা বাহ্যিক দূষণ (Physical Contamination)',
    summary:
      'Presence of unintended foreign objects such as stones, metal fragments, glass shards, plastic pieces, hair, or insect parts.',
    summaryBn:
      'খাবারের মধ্যে অপ্রত্যাশিত শক্ত বা বাহ্যিক বস্তু যেমন—পাথরের কণা, ধাতব টুকরা, কাঁচ, প্লাস্টিক বা পোকামাকড় থাকাকে ভৌত দূষণ বলে।',
    examples: [
      'Small grit/stones in uncleaned rice or lentils',
      'Broken plastic seals or staple pins falling from takeaway packets',
    ],
    examplesBn: [
      'ভালোভাবে না বাছা চাল বা ডালে ছোট পাথর/কাঁকর',
      'প্যাকেটের স্ট্যাপলার পিন বা ভাঙা প্লাস্টিকের টুকরা খাবারে পড়া',
    ],
    preventionSteps: [
      'Never use metal staple pins on food packets; inspect dry grains and pulses carefully.',
      'Discard food immediately if packaging glass or hard plastic cracks.',
    ],
    preventionStepsBn: [
      'খাবারের প্যাকেটে স্ট্যাপলার পিন ব্যবহার এড়িয়ে চলুন; চাল-ডাল রান্নার আগে ভালোভাবে বেছে ধুয়ে নিন।',
      'কাঁচ বা প্লাস্টিক ভেঙে গেলে সেই খাবার পুরোপুরি বাতিল করুন।',
    ],
    laboratoryTests: ['Microscopic Filth & Foreign Matter Extraction (AOAC)', 'Industrial X-ray / Metal Detector Screening', 'Sieve & Sedimentation Analysis'],
    laboratoryTestsBn: ['মাইক্রোস্কোপিক ফরেন ম্যাটার পরীক্ষা', 'এক্স-রে / মেটাল ডিটেক্টর স্ক্রিনিং', 'চালুনি ও সেডিমেন্টেশন পরীক্ষা'],
  },
  {
    id: 'adulteration',
    title: '4. Food Adulteration Awareness',
    titleBn: '৪. খাদ্য ভেজাল সচেতনতা (Food Adulteration)',
    summary:
      'Intentional addition of inferior, hidden, or prohibited substances for profit, weight inflation, or visual deception.',
    summaryBn:
      'অনৈতিক মুনাফা, ওজন বৃদ্ধি বা বাহ্যিক সৌন্দর্য দেখাতে খাবারে নিম্নমানের বা নিষিদ্ধ রাসায়নিক মেশানোই খাদ্য ভেজাল।',
    examples: [
      'Non-food dyes in turmeric/chili powder or bright sweets',
      'Unapproved preservatives in loose milk, fish, or sweets',
      'Counterfeit packaging with altered expiry dates',
    ],
    examplesBn: [
      'হলুদ-মরিচের গুঁড়া বা মিষ্টিতে কাপড়ের রং মেশানো',
      'খোলা দুধ বা মাছে অনুমোদনহীন প্রিজারভেটিভ',
      'নকল লেবেল বা মেয়াদ পরিবর্তন করা প্যাকেটজাত পণ্য',
    ],
    preventionSteps: [
      'Buy whole spices and grind hygienically or purchase sealed brands with clear batch & BSTI info.',
      'Report suspected adulterated products to BFSA (Hotline 16155) for laboratory sampling.',
    ],
    preventionStepsBn: [
      'সম্ভব হলে আস্ত মসলা কিনে গুঁড়া করুন অথবা স্পষ্ট ব্যাচ নম্বর ও বিএসটিআই যুক্ত সিল করা প্যাকেট কিনুন।',
      'সন্দেহ হলে বিএফএসএ হটলাইন ১৬১৫৫-এ ল্যাব পরীক্ষার জন্য অভিযোগ জানান।',
    ],
    laboratoryTests: ['Chromatography (HPLC/GC-FID)', 'Atomic Absorption Spectroscopy (AAS)', 'Certified BFSA / BSTI / NFSL Laboratory Screening'],
    laboratoryTestsBn: ['ক্রোমাটোগ্রাফি (HPLC / GC-FID)', 'AAS হেভি মেটাল পরীক্ষা', 'BFSA / BSTI / NFSL অনুমোদিত ল্যাব পরীক্ষা'],
  },
  {
    id: 'storage',
    title: '5. Safe Food Storage',
    titleBn: '৫. নিরাপদ খাদ্য সংরক্ষণ (Safe Food Storage)',
    summary:
      'Maintaining the "Temperature Danger Zone" boundary (avoid 5°C–60°C prolonged holding) is vital in Bangladesh’s warm, humid climate.',
    summaryBn:
      'বাংলাদেশের উষ্ণ ও আর্দ্র আবহাওয়ায় ৫°C থেকে ৬০°C বিপজ্জনক তাপমাত্রায় খাবার বেশিক্ষণ না রেখে দ্রুত সঠিক সংরক্ষণ করা জরুরি।',
    examples: [
      'Refrigerator ≤ 4°C; Freezer ≤ -18°C for raw fish & meat',
      'Keep raw meats on the lowest fridge shelf to prevent dripping onto cooked items',
    ],
    examplesBn: [
      'ফ্রিজ ≤ ৪°C এবং ডিপ ফ্রিজ ≤ -১৮°C তাপমাত্রায় রাখা',
      'কাঁচা মাছ-মাংস ফ্রিজের নিচের তাকে ঢেকে রাখা যাতে রান্না খাবারে রস না পড়ে',
    ],
    preventionSteps: [
      'Refrigerate cooked food within 2 hours (1 hour if ambient temperature > 32°C).',
      'Store rice, flour, lentils, and spices in airtight moisture-proof jars.',
    ],
    preventionStepsBn: [
      'গরম দিনে (৩২°C+) রান্না খাবার ১ ঘণ্টার মধ্যে এবং সাধারণ দিনে ২ ঘণ্টার মধ্যে ফ্রিজে রাখুন।',
      'চাল, ডাল, আটা ও মসলা শুষ্ক ও বায়ুরোধী পাত্রে সংরক্ষণ করুন।',
    ],
    laboratoryTests: ['Water Activity (aw) & Moisture Testing', 'Cold-Chain Storage Temperature Log Audit'],
    laboratoryTestsBn: ['ওয়াটার অ্যাক্টিভিটি (aw) ও আর্দ্রতা পরীক্ষা', 'কোল্ড-চেইন তাপমাত্রা অডিট'],
  },
  {
    id: 'hygiene',
    title: '6. Food Preparation Hygiene',
    titleBn: '৬. খাদ্য প্রস্তুতি ও পরিচ্ছন্নতা (Food Hygiene)',
    summary:
      'Simple kitchen hygiene prevents most household foodborne illnesses before food reaches the plate.',
    summaryBn:
      'রান্নাঘরের নিয়মিত পরিচ্ছন্নতা বেশিরভাগ খাদ্যবাহিত অসুস্থতা শুরুতেই প্রতিরোধ করে।',
    examples: [
      'Separate knives & cutting boards for raw fish/meat vs ready-to-eat fruits/salads',
      '20-second soap handwashing before cooking and after handling raw protein',
    ],
    examplesBn: [
      'কাঁচা মাছ-মাংস কাটার বটি/চপিং বোর্ড ফল ও সালাদের বোর্ড থেকে আলাদা রাখা',
      'রান্নার আগে ও কাঁচা মাছ-মাংস ধরার পর সাবান দিয়ে ২০ সেকেন্ড হাত ধোয়া',
    ],
    preventionSteps: [
      'Use boiled or safely filtered potable water for washing ready-to-eat produce and making ice/drinks.',
      'Reheat leftover curries & rice thoroughly until steaming hot (≥ 74°C) once only.',
    ],
    preventionStepsBn: [
      'সালাদ, ফল ধোয়া ও বরফ/শরবত তৈরিতে অবশ্যই বিশুদ্ধ বা ফোটানো পানি ব্যবহার করুন।',
      'বাসি বা সংরক্ষিত খাবার পরিবেশনের আগে ভালোভাবে গরম (≥ ৭৪°C) করে নিন।',
    ],
    laboratoryTests: ['ATP Surface Swab Hygiene Audit', 'Potable Water Coliform & E. coli Testing'],
    laboratoryTestsBn: ['সারফেস সোয়াব হাইজিন অডিট', 'খাবার পানির কলিফর্ম ও ই. কোলাই পরীক্ষা'],
  },
];

export function evaluateExpiryStatus(expDate?: string, bestBefore?: string): {
  evaluation: LabelOcrResult['expiryEvaluation'];
  note: string;
  noteBn: string;
} {
  const raw = (expDate || bestBefore || '').trim();
  if (!raw) {
    return {
      evaluation: 'missing_or_unreadable',
      note: 'Expiry / Best-Before date is missing or unreadable. Verify physical stamp before consuming.',
      noteBn: 'মেয়াদ উত্তীর্ণের তারিখ অনুপস্থিত বা অস্পষ্ট। খাওয়ার আগে প্যাকেটের গায়ে সরাসরি যাচাই করুন।',
    };
  }

  let timestamp = Date.parse(raw);
  if (Number.isNaN(timestamp)) {
    const dmy = raw.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})$/);
    if (dmy) {
      const day = parseInt(dmy[1], 10);
      const month = parseInt(dmy[2], 10) - 1;
      let year = parseInt(dmy[3], 10);
      if (year < 100) year += 2000;
      timestamp = new Date(year, month, day).getTime();
    } else {
      const my = raw.match(/^(\d{1,2})[\/.\-](\d{2,4})$/);
      if (my) {
        const month = parseInt(my[1], 10);
        let year = parseInt(my[2], 10);
        if (year < 100) year += 2000;
        timestamp = new Date(year, month, 0).getTime();
      }
    }
  }

  if (Number.isNaN(timestamp)) {
    return {
      evaluation: 'missing_or_unreadable',
      note: `Listed date ("${raw}") could not be reliably parsed. Check physical label carefully.`,
      noteBn: `উল্লেখিত তারিখ ("${raw}") সঠিকভাবে পড়া যায়নি। প্যাকেটের লেবেল নিজে দেখে নিশ্চিত হোন।`,
    };
  }

  const now = Date.now();
  const oneDayMs = 86400000;
  if (timestamp < now - oneDayMs) {
    return {
      evaluation: 'expired',
      note: `EXPIRED WARNING: Printed expiry/best-before date (${raw}) has already passed. Do not consume.`,
      noteBn: `মেয়াদোত্তীর্ণ সতর্কতা: উল্লেখিত তারিখ (${raw}) ইতোমধ্যে পার হয়ে গেছে। এই পণ্য গ্রহণ করবেন না।`,
    };
  }

  if (timestamp < now + 14 * oneDayMs) {
    return {
      evaluation: 'expiring_soon',
      note: `Date (${raw}) has not passed yet (within 14 days). Check storage condition — unexpired date alone never guarantees safety.`,
      noteBn: `তারিখ (${raw}) এখনো পার হয়নি (১৪ দিনের মধ্যে)। শুধু মেয়াদ থাকলেই খাবার নিরাপদ এমন ধরে নেবেন না।`,
    };
  }

  return {
    evaluation: 'valid_unexpired',
    note: `Printed date (${raw}) has not passed. Remember: proper storage and absence of spoilage or contamination still determine safety.`,
    noteBn: `উল্লেখিত তারিখ (${raw}) এখনো অতিক্রান্ত হয়নি। তবে সঠিক সংরক্ষণ ও জীবাণু/ভেজাল না থাকাই নিরাপত্তার আসল শর্ত।`,
  };
}

export function buildSixCategorySafetyReport(params: {
  foodCategory: SafetyFoodCategory;
  foodName: string;
  freshness: FreshnessInspectionDetails;
  labelOcr: LabelOcrResult;
  packagedInfo?: PackagedFoodDetails;
}): {
  overallStatus: SafetyAssessmentStatus;
  assessments: SafetyCategoryAssessment[];
} {
  const { foodCategory, freshness, labelOcr, packagedInfo } = params;
  const isPackaged = foodCategory === 'packaged_food' || Boolean(packagedInfo?.barcode || labelOcr.ocrAttempted);

  // A. Visible Condition
  const hasSevereVisualDefect =
    freshness.visibleMold.detected ||
    freshness.visibleSpoilage.detected ||
    freshness.damagedPackaging.detected;
  const hasMinorVisualConcern =
    freshness.unusualDiscoloration.detected || freshness.unusualTexture.detected;

  let visibleStatus: SafetyAssessmentStatus = 'Insufficient Information';
  let visibleSummary = 'No food image provided for visible inspection.';
  let visibleSummaryBn = 'দৃশ্যমান পরীক্ষার জন্য কোনো ছবি দেওয়া হয়নি।';

  if (hasSevereVisualDefect) {
    visibleStatus = 'Laboratory Testing Required';
    visibleSummary =
      'Visible mold, spoilage, or packaging damage observed — do not consume without verification.';
    visibleSummaryBn =
      'দৃশ্যমান ছত্রাক, পচন বা প্যাকেজিং ক্ষতি দেখা গেছে — যাচাই ছাড়া গ্রহণ করবেন না।';
  } else if (hasMinorVisualConcern) {
    visibleStatus = 'Potential Safety Concern';
    visibleSummary =
      'Unusual surface discoloration or texture noted visually; further physical or lab checking advised.';
    visibleSummaryBn =
      'অস্বাভাবিক রঙ বা গঠন লক্ষ্য করা গেছে; আরও পরীক্ষা বা যাচাই প্রয়োজন।';
  } else if (freshness.imageProvided) {
    if (freshness.imageQuality === 'good') {
      visibleStatus = 'Needs Further Checking';
      visibleSummary =
        'No mold, spoilage, or damaged packaging spotted visually, though appearance alone cannot confirm safety.';
      visibleSummaryBn =
        'ছবিতে দৃশ্যমান ছত্রাক বা পচন দেখা যায়নি, তবে কেবল বাহ্যিক চেহারা দিয়ে নিরাপত্তা নিশ্চিত করা যায় না।';
    } else {
      visibleStatus = 'Insufficient Information';
      visibleSummary =
        freshness.imageQualityNote ||
        'Image clarity or lighting is insufficient for reliable visual inspection.';
      visibleSummaryBn =
        freshness.imageQualityNoteBn ||
        'নির্ভরযোগ্য পর্যবেক্ষণের জন্য ছবির স্পষ্টতা বা আলো পর্যাপ্ত নয়।';
    }
  }

  // B. Label Verification
  let labelStatus: SafetyAssessmentStatus = 'Insufficient Information';
  let labelSummary = 'Not applicable or no package label image / details provided.';
  let labelSummaryBn = 'প্রযোজ্য নয় বা প্যাকেটের লেবেল সংক্রান্ত তথ্য দেওয়া হয়নি।';

  if (isPackaged) {
    const hasCoreLabel =
      Boolean(labelOcr.productName || packagedInfo?.productName) &&
      Boolean(labelOcr.ingredients || packagedInfo?.ingredientsList) &&
      Boolean(labelOcr.batchNumber || packagedInfo?.batchNumber) &&
      Boolean(labelOcr.manufacturer || packagedInfo?.manufacturer);

    if (freshness.damagedPackaging.detected) {
      labelStatus = 'Potential Safety Concern';
      labelSummary = 'Package seal or label integrity appears damaged or suspicious.';
      labelSummaryBn = 'প্যাকেটের সিল বা লেবেলের অখণ্ডতা ক্ষতিগ্রস্ত বা সন্দেহজনক।';
    } else if (hasCoreLabel && labelOcr.unreadableFields.length === 0) {
      labelStatus = 'Information Verified';
      labelSummary = 'Key packaging fields (product, manufacturer, batch, ingredients) are recorded.';
      labelSummaryBn = 'মূল লেবেল তথ্য (পণ্য, প্রস্তুতকারক, ব্যাচ, উপাদান) রেকর্ড করা হয়েছে।';
    } else if (labelOcr.ocrAttempted || packagedInfo?.productName || packagedInfo?.barcode) {
      labelStatus = 'Needs Further Checking';
      labelSummary = `Some package label details are missing or unreadable (${labelOcr.unreadableFields.join(', ') || 'batch/manufacturer/ingredients'}).`;
      labelSummaryBn = 'প্যাকেটের লেবেলের কিছু প্রয়োজনীয় তথ্য অনুপস্থিত বা অস্পষ্ট।';
    } else {
      labelStatus = 'Insufficient Information';
      labelSummary = 'Upload a clear photo of the back nutrition/label panel or enter fields manually.';
      labelSummaryBn = 'প্যাকেটের পেছনের লেবেলের পরিষ্কার ছবি দিন অথবা ম্যানুয়ালি তথ্য লিখুন।';
    }
  }

  // C. Expiry Status
  let expiryStatus: SafetyAssessmentStatus = 'Insufficient Information';
  if (!isPackaged) {
    expiryStatus = 'Insufficient Information';
  } else if (labelOcr.expiryEvaluation === 'expired') {
    expiryStatus = 'Potential Safety Concern';
  } else if (labelOcr.expiryEvaluation === 'expiring_soon') {
    expiryStatus = 'Needs Further Checking';
  } else if (labelOcr.expiryEvaluation === 'valid_unexpired') {
    expiryStatus = 'Information Verified';
  } else {
    expiryStatus = 'Insufficient Information';
  }

  // D. Product Information Verification
  let productStatus: SafetyAssessmentStatus = 'Insufficient Information';
  let productSummary = 'Unpackaged fresh/cooked foods have no barcode registry entry.';
  let productSummaryBn = 'খোলা বা রান্না করা খাবারের জন্য কোনো বারকোড রেজিস্ট্রি প্রযোজ্য নয়।';

  if (isPackaged) {
    if (packagedInfo?.openFoodFactsMatched) {
      productStatus = 'Information Verified';
      productSummary = `Barcode ${packagedInfo.barcode} matched OpenFoodFacts public registry (${packagedInfo.productName || 'product'}).`;
      productSummaryBn = `বারকোড ${packagedInfo.barcode} OpenFoodFacts উন্মুক্ত ডেটাবেজের তথ্যের সাথে মিলেছে।`;
    } else if (packagedInfo?.barcode) {
      productStatus = 'Needs Further Checking';
      productSummary = `Barcode ${packagedInfo.barcode} was not found in OpenFoodFacts; compare packet details with manufacturer & BSTI records.`;
      productSummaryBn = `বারকোড ${packagedInfo.barcode} OpenFoodFacts ডেটাবেজে পাওয়া যায়নি; প্রস্তুতকারক ও বিএসটিআই তথ্য নিজে যাচাই করুন।`;
    } else {
      productStatus = 'Insufficient Information';
      productSummary = 'Scan or enter the EAN/UPC barcode to verify product metadata.';
      productSummaryBn = 'পণ্যের তথ্য যাচাইয়ের জন্য বারকোড স্ক্যান করুন বা লিখুন।';
    }
  } else if (freshness.imageProvided) {
    productStatus = 'Needs Further Checking';
    productSummary = 'Verify local sourcing, vendor hygiene, and cold-chain handling directly.';
    productSummaryBn = 'স্থানীয় উৎস, বিক্রেতার পরিচ্ছন্নতা এবং সংরক্ষণ ব্যবস্থা সরাসরি যাচাই করুন।';
  }

  // E. Adulteration Verification Status (NEVER claim pure/unadulterated from photo!)
  const adulterationStatus: SafetyAssessmentStatus = hasSevereVisualDefect
    ? 'Laboratory Testing Required'
    : 'Laboratory Testing Required';
  const adulterationSummary =
    'Visual inspection cannot detect chemical adulterants (e.g., formalin, carbide, heavy metals, non-food dyes). Laboratory testing is required for verification.';
  const adulterationSummaryBn =
    'দৃশ্যমান পরীক্ষায় রাসায়নিক ভেজাল (ফরমালিন, কার্বাইড, ভারী ধাতু, কৃত্রিম রং) শনাক্ত করা সম্ভব নয়। নিশ্চিত হতে ল্যাবরেটরি পরীক্ষা আবশ্যক।';

  // F. Recommended Next Steps
  let nextStepsStatus: SafetyAssessmentStatus = 'Needs Further Checking';
  const nextSteps: string[] = [];
  const nextStepsBn: string[] = [];

  if (hasSevereVisualDefect || labelOcr.expiryEvaluation === 'expired') {
    nextStepsStatus = 'Laboratory Testing Required';
    nextSteps.push('Do not consume food showing visible mold, spoilage, packaging damage, or an expired date.');
    nextStepsBn.push('ছত্রাক, পচন, প্যাকেটের ক্ষতি বা মেয়াদ উত্তীর্ণ হওয়া খাবার গ্রহণ থেকে বিরত থাকুন।');
    nextSteps.push('Submit suspected samples to an accredited laboratory (NFSL / BSTI / BCSIR) or report to BFSA hotline 16155.');
    nextStepsBn.push('সন্দেহজনক নমুনা অনুমোদিত ল্যাবে (NFSL / BSTI / BCSIR) পরীক্ষা করান বা বিএফএসএ হটলাইন ১৬১৫৫-এ জানান।');
  } else if (hasMinorVisualConcern) {
    nextStepsStatus = 'Potential Safety Concern';
    nextSteps.push('Inspect smell, internal texture, and storage temperature carefully before deciding.');
    nextStepsBn.push('সিদ্ধান্ত নেওয়ার আগে খাবারের গন্ধ, ভেতরের অবস্থা ও সংরক্ষণ তাপমাত্রা ভালোভাবে পরীক্ষা করুন।');
    nextSteps.push('If chemical adulteration or contamination is suspected, laboratory testing is required.');
    nextStepsBn.push('রাসায়নিক ভেজাল বা দূষণের সন্দেহ হলে ল্যাবরেটরি পরীক্ষা আবশ্যক।');
  } else {
    nextStepsStatus = 'Needs Further Checking';
    nextSteps.push('Wash fresh produce under clean running water; cook meat/fish thoroughly and maintain cold-chain storage (≤ 4°C).');
    nextStepsBn.push('সবজি-ফল পরিষ্কার পানিতে ধুয়ে নিন; মাছ-মাংস ভালোভাবে রান্না করুন এবং ফ্রিজে (≤ ৪°C) সংরক্ষণ করুন।');
    nextSteps.push('Remember that a clean appearance or unexpired date does not replace laboratory confirmation for chemical safety.');
    nextStepsBn.push('মনে রাখবেন—পরিষ্কার দেখালে বা মেয়াদ থাকলেই রাসায়নিক নিরাপত্তা নিশ্চিত হয় না; এর জন্য ল্যাব পরীক্ষা প্রয়োজন।');
  }

  const assessments: SafetyCategoryAssessment[] = [
    {
      code: 'A',
      key: 'visibleCondition',
      title: 'Visible Condition',
      titleBn: 'দৃশ্যমান অবস্থা',
      status: visibleStatus,
      summary: visibleSummary,
      summaryBn: visibleSummaryBn,
      details: [...freshness.whatWasDetected, ...freshness.whatCouldNotBeDetermined],
      detailsBn: [...freshness.whatWasDetectedBn, ...freshness.whatCouldNotBeDeterminedBn],
    },
    {
      code: 'B',
      key: 'labelVerification',
      title: 'Label Verification',
      titleBn: 'লেবেল যাচাই',
      status: labelStatus,
      summary: labelSummary,
      summaryBn: labelSummaryBn,
      details:
        labelOcr.unreadableFields.length > 0
          ? [`Unreadable or missing fields: ${labelOcr.unreadableFields.join(', ')}`]
          : ['Check physical label print clarity and tamper seal.'],
      detailsBn:
        labelOcr.unreadableFieldsBn.length > 0
          ? [`অস্পষ্ট বা অনুপস্থিত তথ্য: ${labelOcr.unreadableFieldsBn.join(', ')}`]
          : ['প্যাকেটের প্রিন্ট স্পষ্টতা ও সিল অক্ষত আছে কিনা দেখে নিন।'],
    },
    {
      code: 'C',
      key: 'expiryStatus',
      title: 'Expiry Status',
      titleBn: 'মেয়াদ অবস্থা',
      status: expiryStatus,
      summary: isPackaged
        ? labelOcr.expiryNote
        : 'Not applicable to loose fresh/cooked food — check freshness and storage duration instead.',
      summaryBn: isPackaged
        ? labelOcr.expiryNoteBn
        : 'খোলা বা রান্না খাবারের জন্য প্রযোজ্য নয় — সংরক্ষণ সময় ও তাজাভাব যাচাই করুন।',
      details: [
        `MFG: ${labelOcr.mfgDate || packagedInfo?.mfgDate || 'Not listed'} · EXP: ${labelOcr.expDate || packagedInfo?.expiryDate || 'Not listed'} · Best Before: ${labelOcr.bestBefore || 'Not listed'}`,
      ],
      detailsBn: [
        `উৎপাদন: ${labelOcr.mfgDate || packagedInfo?.mfgDate || 'তথ্য নেই'} · মেয়াদ: ${labelOcr.expDate || packagedInfo?.expiryDate || 'তথ্য নেই'}`,
      ],
    },
    {
      code: 'D',
      key: 'productVerification',
      title: 'Product Information Verification',
      titleBn: 'পণ্য তথ্য যাচাই',
      status: productStatus,
      summary: productSummary,
      summaryBn: productSummaryBn,
      details: [
        `Manufacturer: ${packagedInfo?.manufacturer || labelOcr.manufacturer || 'Not verified'} · Batch: ${packagedInfo?.batchNumber || labelOcr.batchNumber || 'Not verified'}`,
      ],
      detailsBn: [
        `প্রস্তুতকারক: ${packagedInfo?.manufacturer || labelOcr.manufacturer || 'যাচাই হয়নি'} · ব্যাচ: ${packagedInfo?.batchNumber || labelOcr.batchNumber || 'যাচাই হয়নি'}`,
      ],
    },
    {
      code: 'E',
      key: 'adulterationStatus',
      title: 'Adulteration Verification Status',
      titleBn: 'ভেজাল যাচাই অবস্থা',
      status: adulterationStatus,
      summary: adulterationSummary,
      summaryBn: adulterationSummaryBn,
      details: [CRITICAL_SAFETY_RULE],
      detailsBn: [CRITICAL_SAFETY_RULE_BN],
    },
    {
      code: 'F',
      key: 'recommendedNextSteps',
      title: 'Recommended Next Steps',
      titleBn: 'পরবর্তী করণীয়',
      status: nextStepsStatus,
      summary: nextSteps[0],
      summaryBn: nextStepsBn[0],
      details: nextSteps,
      detailsBn: nextStepsBn,
    },
  ];

  // Overall status rules (never "Information Verified" solely from a photo; never fake purity)
  let overallStatus: SafetyAssessmentStatus = 'Needs Further Checking';
  if (hasSevereVisualDefect) {
    overallStatus = 'Laboratory Testing Required';
  } else if (labelOcr.expiryEvaluation === 'expired' || freshness.damagedPackaging.detected || hasMinorVisualConcern) {
    overallStatus = 'Potential Safety Concern';
  } else if (!freshness.imageProvided && !packagedInfo?.barcode && !labelOcr.ocrAttempted) {
    overallStatus = 'Insufficient Information';
  } else if (isPackaged && labelStatus === 'Information Verified' && expiryStatus === 'Information Verified' && productStatus === 'Information Verified') {
    overallStatus = 'Needs Further Checking'; // Visual/label details consistent, but chemical purity cannot be verified without lab
  } else if (!freshness.imageProvided || freshness.imageQuality !== 'good') {
    overallStatus = freshness.imageProvided ? 'Insufficient Information' : 'Needs Further Checking';
  }

  return { overallStatus, assessments };
}

export function getAdulterationProfileForCategory(category: SafetyFoodCategory): AdulterationCategoryProfile {
  return (
    ADULTERATION_PROFILES.find((p) => p.id === category) ||
    ADULTERATION_PROFILES[0]
  );
}
