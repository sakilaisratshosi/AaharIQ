import React, { useMemo, useRef, useState } from 'react';
import {
  BFSA_LABORATORY_DIRECTORY,
  BFSA_MATRIX_CATEGORY_LABELS,
  BFSA_OFFICIAL_INFORMATION_ITEMS,
  BFSA_SOURCES_METADATA,
  filterBfsaLaboratories,
  getBfsaDivisionsAndDistricts,
  getBfsaInfoCategoryLabel,
  getBfsaTestRecommendationsForMatrix,
} from '../data/bfsaRepositoryData';
import {
  BfsaFoodMatrixCategory,
  BfsaInfoCategory,
  BfsaLaboratoryRecord,
} from '../types';
import {
  Building2,
  Search,
  MapPin,
  Phone,
  Mail,
  FlaskConical,
  Award,
  Clock,
  Banknote,
  ExternalLink,
  GitCompare,
  CheckSquare,
  Square,
  AlertTriangle,
  BookOpen,
  Megaphone,
  FileCheck2,
  Upload,
  Download,
  Info,
  ShieldCheck,
  FilterX,
} from 'lucide-react';

interface BfsaIntegrationSectionProps {
  mode: 'bfsa-labs' | 'bfsa-portal';
  isBn: boolean;
  labsFocusMode: 'directory' | 'parameters' | 'compare';
  setLabsFocusMode: (m: 'directory' | 'parameters' | 'compare') => void;
  selectedMatrixCategory: BfsaFoodMatrixCategory | 'all';
  setSelectedMatrixCategory: (cat: BfsaFoodMatrixCategory | 'all') => void;
  portalCategoryFilter: BfsaInfoCategory | 'all';
  setPortalCategoryFilter: (cat: BfsaInfoCategory | 'all') => void;
  onNotify: (msg: string) => void;
}

export const BfsaIntegrationSection: React.FC<BfsaIntegrationSectionProps> = ({
  mode,
  isBn,
  labsFocusMode,
  setLabsFocusMode,
  selectedMatrixCategory,
  setSelectedMatrixCategory,
  portalCategoryFilter,
  setPortalCategoryFilter,
  onNotify,
}) => {
  // Approved snapshot import state (supports Requirement G: authorized data-import & linking)
  const [importedLabs, setImportedLabs] = useState<BfsaLaboratoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem('nutrismart_bfsa_imported_labs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const importFileRef = useRef<HTMLInputElement | null>(null);
  const comparisonRef = useRef<HTMLDivElement | null>(null);

  // Laboratory search filters (Requirement A)
  const [foodNameQuery, setFoodNameQuery] = useState('');
  const [parameterQuery, setParameterQuery] = useState('');
  const [labNameQuery, setLabNameQuery] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');

  // Lab comparison selection (Requirement C)
  const [comparedLabIds, setComparedLabIds] = useState<string[]>([
    'nfsl-iph-dhaka',
    'ifst-bcsir-dhaka',
  ]);

  // Official BFSA portal search (Requirement D)
  const [portalQuery, setPortalQuery] = useState('');

  const allLaboratories = useMemo(() => {
    const map = new Map<string, BfsaLaboratoryRecord>();
    for (const lab of BFSA_LABORATORY_DIRECTORY) map.set(lab.id, lab);
    for (const imp of importedLabs) map.set(imp.id, imp);
    return Array.from(map.values());
  }, [importedLabs]);

  const { divisions, districts } = useMemo(
    () => getBfsaDivisionsAndDistricts(allLaboratories),
    [allLaboratories]
  );

  const filteredLabs = useMemo(
    () =>
      filterBfsaLaboratories(allLaboratories, {
        foodName: foodNameQuery,
        foodCategory: selectedMatrixCategory,
        testParameter: parameterQuery,
        labName: labNameQuery,
        division: divisionFilter,
        district: districtFilter,
      }),
    [
      allLaboratories,
      foodNameQuery,
      selectedMatrixCategory,
      parameterQuery,
      labNameQuery,
      divisionFilter,
      districtFilter,
    ]
  );

  // Food Test Recommendation strictly grounded in verified lab parameter records (Requirement B)
  const effectiveRecommendationMatrix: BfsaFoodMatrixCategory =
    selectedMatrixCategory === 'all' ? 'vegetables' : selectedMatrixCategory;

  const recommendedTests = useMemo(
    () => getBfsaTestRecommendationsForMatrix(allLaboratories, effectiveRecommendationMatrix),
    [allLaboratories, effectiveRecommendationMatrix]
  );

  const comparedLabs = useMemo(
    () =>
      comparedLabIds
        .map((id) => allLaboratories.find((l) => l.id === id))
        .filter((l): l is BfsaLaboratoryRecord => Boolean(l)),
    [allLaboratories, comparedLabIds]
  );

  const toggleLabCompare = (id: string) => {
    setComparedLabIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
    });
  };

  const handleImportJsonFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'));
        const res = await fetch('/api/safety-center/bfsa/import-snapshot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(isBn && data.errorBn ? data.errorBn : data.error);
        const next = data.laboratories as BfsaLaboratoryRecord[];
        setImportedLabs(next);
        localStorage.setItem('nutrismart_bfsa_imported_labs', JSON.stringify(next));
        onNotify(
          isBn
            ? `${data.importedCount}টি অনুমোদিত ল্যাবরেটরি রেকর্ড লোড করা হয়েছে`
            : `Imported ${data.importedCount} validated laboratory record(s)`
        );
      } catch (err: any) {
        onNotify(err?.message || 'Invalid repository JSON format.');
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadSchemaTemplate = () => {
    const sample = {
      sourceName: BFSA_SOURCES_METADATA.labRepositoryName,
      sourceUrl: BFSA_SOURCES_METADATA.labRepositoryUrl,
      laboratories: BFSA_LABORATORY_DIRECTORY.slice(0, 2),
    };
    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bfsa-lab-repository-template.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredNotices = useMemo(() => {
    const q = portalQuery.trim().toLowerCase();
    return BFSA_OFFICIAL_INFORMATION_ITEMS.filter((item) => {
      if (portalCategoryFilter !== 'all' && item.category !== portalCategoryFilter) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.titleBn.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.summaryBn.toLowerCase().includes(q) ||
        (item.referenceCode || '').toLowerCase().includes(q)
      );
    });
  }, [portalCategoryFilter, portalQuery]);

  if (mode === 'bfsa-labs') {
    return (
      <div className="space-y-6">
        {/* Source Transparency & Repository Header */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-100 pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-2 text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
                <FlaskConical className="w-3.5 h-3.5" />
                <span>
                  {isBn
                    ? 'BFSA ল্যাবরেটরি ইনফরমেশন রিপোজিটরি ইন্টিগ্রেশন'
                    : 'Official BFSA Laboratory Information Repository Integration'}
                </span>
              </div>
              <h2 className="text-xl font-black text-stone-900">
                {isBn ? 'খাদ্য পরীক্ষাগার খুঁজুন (Find Food Testing Laboratory)' : 'Find Food Testing Laboratory'}
              </h2>
              <p className="text-xs text-stone-600 max-w-3xl leading-relaxed">
                {isBn
                  ? 'খাদ্যের নাম, শ্রেণি, পরীক্ষার প্যারামিটার, ল্যাবরেটরি, বিভাগ ও জেলা অনুযায়ী বাংলাদেশের খাদ্য পরীক্ষাগার খুঁজুন এবং যাচাইকৃত সরকারি উৎস দেখুন। যেসব তথ্য উন্মুক্ত রিপোজিটরিতে নেই তা স্পষ্টভাবে অনুপস্থিত হিসেবে চিহ্নিত।'
                  : 'Search authorized food testing laboratories across Bangladesh by food name, category, parameter, lab name, division, or district. Official source links and missing-data indicators are preserved without fabricating unpublished fees or certifications.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <a
                href={BFSA_SOURCES_METADATA.labRepositoryUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-[#16382C] hover:bg-[#1E4A3B] text-white text-xs font-bold inline-flex items-center space-x-1.5"
              >
                <span>labrepository.bfsa.gov.bd</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => importFileRef.current?.click()}
                className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold inline-flex items-center space-x-1.5"
                title="Import approved repository JSON snapshot"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-700" />
                <span>{isBn ? 'JSON ইমপোর্ট' : 'Import Snapshot'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadSchemaTemplate}
                className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold inline-flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5 text-amber-700" />
                <span>{isBn ? 'টেমপ্লেট' : 'Template'}</span>
              </button>
              <input
                ref={importFileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  handleImportJsonFile(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
            </div>
          </div>

          {/* Internal Sub-Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: 'directory', en: `Laboratory Directory (${filteredLabs.length})`, bn: `ল্যাব ডিরেক্টরি (${filteredLabs.length})` },
                  { id: 'parameters', en: 'Food Test Recommendation & Parameters', bn: 'খাদ্য অনুযায়ী টেস্ট সুপারিশ' },
                  { id: 'compare', en: `Compare Laboratories (${comparedLabs.length}/3)`, bn: `ল্যাব তুলনা (${comparedLabs.length}/3)` },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setLabsFocusMode(m.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    labsFocusMode === m.id
                      ? 'bg-[#1B4332] text-white border-[#1B4332]'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {isBn ? m.bn : m.en}
                </button>
              ))}
            </div>

            <div className="text-[11px] font-mono text-stone-500 flex items-center space-x-2">
              <span>{isBn ? 'সর্বশেষ যাচাই:' : 'Last Verified:'}</span>
              <span className="font-bold text-stone-800">{BFSA_SOURCES_METADATA.lastVerifiedDate}</span>
            </div>
          </div>

          {/* 6-Field Search Filter Grid (Requirement A) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={foodNameQuery}
                onChange={(e) => setFoodNameQuery(e.target.value)}
                placeholder={isBn ? 'খাবারের নাম (যেমন: ইলিশ, দুধ, বেগুন, হলুদ)...' : 'Food name (e.g., Hilsa, Milk, Brinjal, Turmeric)...'}
                className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
              />
            </div>

            <select
              value={selectedMatrixCategory}
              onChange={(e) => setSelectedMatrixCategory(e.target.value as BfsaFoodMatrixCategory | 'all')}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold text-stone-900"
            >
              <option value="all">{isBn ? 'সব খাদ্য শ্রেণি (Food Category)' : 'All Food Categories'}</option>
              {(Object.keys(BFSA_MATRIX_CATEGORY_LABELS) as BfsaFoodMatrixCategory[]).map((key) => (
                <option key={key} value={key}>
                  {isBn ? BFSA_MATRIX_CATEGORY_LABELS[key].bn : BFSA_MATRIX_CATEGORY_LABELS[key].en}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={parameterQuery}
              onChange={(e) => setParameterQuery(e.target.value)}
              placeholder={isBn ? 'টেস্ট প্যারামিটার (যেমন: Pesticide, Heavy Metal, E. coli)...' : 'Test parameter (e.g., Pesticide, Heavy Metal, Aflatoxin)...'}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
            />

            <input
              type="text"
              value={labNameQuery}
              onChange={(e) => setLabNameQuery(e.target.value)}
              placeholder={isBn ? 'ল্যাবরেটরির নাম (যেমন: NFSL, BCSIR, BSTI, FIQC)...' : 'Laboratory name (e.g., NFSL, BCSIR, BSTI, FIQC)...'}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
            />

            <select
              value={divisionFilter}
              onChange={(e) => setDivisionFilter(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold text-stone-900"
            >
              <option value="all">{isBn ? 'সব বিভাগ (Division)' : 'All Divisions'}</option>
              {divisions.map((div) => (
                <option key={div} value={div}>
                  {div}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold text-stone-900"
              >
                <option value="all">{isBn ? 'সব জেলা (District)' : 'All Districts'}</option>
                {districts.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  setFoodNameQuery('');
                  setSelectedMatrixCategory('all');
                  setParameterQuery('');
                  setLabNameQuery('');
                  setDivisionFilter('all');
                  setDistrictFilter('all');
                }}
                className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold"
                title={isBn ? 'ফিল্টার মুছুন' : 'Reset filters'}
              >
                <FilterX className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* SECTION B: FOOD TEST RECOMMENDATION (shown cleanly when in 'parameters' mode OR when user picks a category) */}
        {(labsFocusMode === 'parameters' || selectedMatrixCategory !== 'all') && (
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-emerald-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-extrabold text-stone-900 text-base flex items-center space-x-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-700" />
                  <span>
                    {isBn ? 'খাদ্য শ্রেণি অনুযায়ী যাচাইকৃত টেস্ট সুপারিশ:' : 'Food Test Recommendations for:'}{' '}
                    <span className="text-emerald-800">
                      {isBn
                        ? BFSA_MATRIX_CATEGORY_LABELS[effectiveRecommendationMatrix].bn
                        : BFSA_MATRIX_CATEGORY_LABELS[effectiveRecommendationMatrix].en}
                    </span>
                  </span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {isBn
                    ? 'নিচের পরীক্ষাগুলো কেবল তালিকাভুক্ত সরকারি ও অনুমোদিত ল্যাবের নিশ্চিতকৃত স্কোপ থেকে দেখানো হয়েছে — কোনো কাল্পনিক টেস্ট যোগ করা হয়নি।'
                    : 'Only tests confirmed for this food category in listed BFSA repository records are shown below — zero invented tests or unverified claims.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(['vegetables', 'fish', 'milk_dairy', 'spices', 'fruits', 'packaged_food'] as BfsaFoodMatrixCategory[]).map(
                  (quickCat) => (
                    <button
                      key={quickCat}
                      type="button"
                      onClick={() => setSelectedMatrixCategory(quickCat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                        effectiveRecommendationMatrix === quickCat
                          ? 'bg-emerald-800 text-white border-emerald-800'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {isBn ? BFSA_MATRIX_CATEGORY_LABELS[quickCat].bn : BFSA_MATRIX_CATEGORY_LABELS[quickCat].en}
                    </button>
                  )
                )}
              </div>
            </div>

            {recommendedTests.length === 0 ? (
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600">
                {isBn
                  ? 'এই শ্রেণির জন্য স্ন্যাপশটে কোনো তালিকাভুক্ত প্যারামিটার পাওয়া যায়নি। সরাসরি labrepository.bfsa.gov.bd-এ অনুসন্ধান করুন।'
                  : 'No listed parameters found for this category in the local verified snapshot. Search directly on labrepository.bfsa.gov.bd.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {recommendedTests.map((rec, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-extrabold text-stone-900">
                        {isBn ? rec.parameter.parameterNameBn : rec.parameter.parameterName}
                      </span>
                      <span className="shrink-0 px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-bold">
                        {rec.parameter.categoryGroup}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600">
                      <strong className="text-stone-800">{isBn ? 'পদ্ধতি:' : 'Method:'}</strong>{' '}
                      {rec.parameter.testingMethod}
                    </p>
                    <div>
                      <span className="text-[11px] font-bold text-stone-800 block mb-1">
                        {isBn ? 'তালিকাভুক্ত নিশ্চিতকৃত ল্যাবসমূহ:' : 'Confirmed Laboratories in Repository:'}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {rec.confirmedLabs.map((l) => (
                          <span
                            key={l.id}
                            className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg bg-white border border-stone-200 text-[11px] font-semibold text-stone-800"
                          >
                            <span>{isBn ? l.labNameBn : l.labName}</span>
                            <span className="text-stone-400">({l.district})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION C: LAB COMPARISON MATRIX (always accessible when toggled OR when >= 2 labs selected in compare mode) */}
        {(labsFocusMode === 'compare' || comparedLabs.length >= 2) && (
          <div ref={comparisonRef} className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-extrabold text-stone-900 text-base flex items-center space-x-2">
                  <GitCompare className="w-4 h-4 text-emerald-700" />
                  <span>
                    {isBn
                      ? 'ল্যাবরেটরি তুলনা (স্বীকৃতি, প্যারামিটার, ফি, সময় ও অবস্থান)'
                      : 'Laboratory Comparison Matrix (Parameters, Accreditation, Fees, Time & Location)'}
                  </span>
                </h3>
                <p className="text-xs text-stone-500">
                  {isBn
                    ? 'তালিকা থেকে সর্বোচ্চ ৩টি ল্যাব নির্বাচন করে তুলনা করুন। অপ্রকাশিত ফি বা সময় অনুপস্থিত হিসেবে দেখানো হয়েছে।'
                    : 'Compare up to 3 verified repositories side by side. Unpublished fees or turnaround times are transparently marked as unavailable.'}
                </p>
              </div>
              {comparedLabs.length > 0 && (
                <button
                  type="button"
                  onClick={() => setComparedLabIds([])}
                  className="text-xs font-bold text-stone-500 hover:text-rose-700 self-start"
                >
                  {isBn ? 'তুলনা পরিষ্কার করুন' : 'Clear Comparison'}
                </button>
              )}
            </div>

            {comparedLabs.length < 2 ? (
              <div className="p-6 rounded-xl bg-stone-50 border border-stone-200 text-center text-xs text-stone-600">
                {isBn
                  ? 'তুলনা দেখার জন্য নিচের ডিরেক্টরি থেকে কমপক্ষে ২টি ল্যাবের "Compare Lab" বাটনে ক্লিক করুন।'
                  : 'Select at least 2 laboratories below using "Compare Lab" to view side-by-side comparison.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50">
                      <th className="py-2.5 px-3 font-bold text-stone-600 w-44">
                        {isBn ? 'তুলনার বিষয়' : 'Comparison Criterion'}
                      </th>
                      {comparedLabs.map((lab) => (
                        <th key={lab.id} className="py-2.5 px-3 font-extrabold text-stone-900 min-w-[210px]">
                          {isBn ? lab.labNameBn : lab.labName}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-stone-700">{isBn ? 'অবস্থান ও জেলা' : 'Location'}</td>
                      {comparedLabs.map((lab) => (
                        <td key={lab.id} className="py-2.5 px-3 text-stone-700">
                          <span className="font-semibold block">{lab.division} Division · {lab.district}</span>
                          <span className="text-[11px] text-stone-500">{isBn ? lab.addressBn : lab.address}</span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-stone-700">{isBn ? 'অ্যাক্রেডিটেশন অবস্থা' : 'Accreditation Status'}</td>
                      {comparedLabs.map((lab) => (
                        <td key={lab.id} className="py-2.5 px-3 text-stone-800">
                          {isBn ? lab.accreditationSummaryBn : lab.accreditationSummary}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-stone-700">{isBn ? 'উপলব্ধ টেস্ট প্যারামিটার' : 'Available Test Parameters'}</td>
                      {comparedLabs.map((lab) => (
                        <td key={lab.id} className="py-2.5 px-3">
                          <ul className="list-disc pl-4 space-y-1 text-[11px] text-stone-700">
                            {lab.parameters.map((p, i) => (
                              <li key={i}>{isBn ? p.parameterNameBn : p.parameterName}</li>
                            ))}
                          </ul>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-stone-700">{isBn ? 'প্রকাশিত ফি (BDT)' : 'Published Fees'}</td>
                      {comparedLabs.map((lab) => (
                        <td key={lab.id} className="py-2.5 px-3 text-stone-700">
                          {lab.publishedFeeNotes ? (
                            <span className="font-semibold text-emerald-900">{lab.publishedFeeNotes}</span>
                          ) : (
                            <span className="italic text-amber-800">
                              {isBn ? BFSA_SOURCES_METADATA.unavailableLabelBn : BFSA_SOURCES_METADATA.unavailableLabelEn}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-stone-700">{isBn ? 'সম্ভাব্য সময়' : 'Expected Turnaround Time'}</td>
                      {comparedLabs.map((lab) => (
                        <td key={lab.id} className="py-2.5 px-3 text-stone-700">
                          {lab.expectedTurnaround ? (
                            <span className="font-semibold">{lab.expectedTurnaround}</span>
                          ) : (
                            <span className="italic text-amber-800">
                              {isBn ? 'সময়সীমা উন্মুক্ত স্ন্যাপশটে নেই — ল্যাবে নিশ্চিত করুন' : 'Unavailable in public snapshot — confirm with lab'}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-stone-700">{isBn ? 'উৎস ও সর্বশেষ যাচাই' : 'Source & Last Verified'}</td>
                      {comparedLabs.map((lab) => (
                        <td key={lab.id} className="py-2.5 px-3 text-[11px]">
                          <span className="block font-semibold text-stone-800">{lab.sourceName}</span>
                          <span className="block font-mono text-stone-500 mb-1">{lab.lastVerifiedDate}</span>
                          <a
                            href={lab.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1 font-bold text-emerald-700 hover:underline"
                          >
                            <span>{isBn ? 'মূল উৎস' : 'Official Source'}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SECTION A: OFFICIAL LABORATORY DIRECTORY RESULTS CARDS */}
        {labsFocusMode !== 'compare' && (
          <div className="space-y-4">
            {filteredLabs.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-stone-200 text-center space-y-2 text-xs text-stone-600">
                <Building2 className="w-8 h-8 text-stone-300 mx-auto" />
                <p className="font-bold text-stone-800">
                  {isBn ? 'আপনার অনুসন্ধানের সাথে মিলে এমন কোনো ল্যাবরেটরি পাওয়া যায়নি।' : 'No matching laboratory found in the verified directory.'}
                </p>
                <p>
                  {isBn
                    ? 'ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন অথবা সরাসরি labrepository.bfsa.gov.bd-এ অনুসন্ধান করুন।'
                    : 'Adjust your search filters or search directly on labrepository.bfsa.gov.bd.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredLabs.map((lab) => {
                  const isCompared = comparedLabIds.includes(lab.id);
                  return (
                    <div
                      key={lab.id}
                      className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        {/* Header & Completeness Badge */}
                        <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-3">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                                {lab.labType}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded border ${
                                  lab.dataCompleteness === 'Verified Public Scope'
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                    : lab.dataCompleteness === 'User Imported Snapshot'
                                    ? 'bg-sky-50 border-sky-200 text-sky-900'
                                    : 'bg-amber-50 border-amber-200 text-amber-900'
                                }`}
                              >
                                {lab.dataCompleteness}
                              </span>
                            </div>
                            <h3 className="font-extrabold text-stone-900 text-sm sm:text-base">
                              {isBn ? lab.labNameBn : lab.labName}
                            </h3>
                            <p className="text-xs text-stone-500">
                              {isBn ? lab.parentOrganizationBn : lab.parentOrganization}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleLabCompare(lab.id)}
                            className={`shrink-0 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center space-x-1 transition-colors ${
                              isCompared
                                ? 'bg-[#1B4332] text-white border-[#1B4332]'
                                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            {isCompared ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                            <span>{isCompared ? (isBn ? 'তুলনায় যুক্ত' : 'Comparing') : isBn ? 'তুলনা করুন' : 'Compare Lab'}</span>
                          </button>
                        </div>

                        {/* Address, Contact, Accreditation, Fees, Turnaround */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                          <div className="flex items-start space-x-2">
                            <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-stone-800 block">
                                {lab.division} Division · {lab.district}
                              </span>
                              <span className="text-stone-600 text-[11px]">
                                {isBn ? lab.addressBn : lab.address}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-start space-x-2">
                            <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-stone-800 block">
                                {isBn ? 'যোগাযোগ তথ্য:' : 'Contact Info:'}
                              </span>
                              {lab.contactPhone || lab.contactEmail ? (
                                <div className="text-[11px] text-stone-700 space-y-0.5">
                                  {lab.contactPhone && <span className="block font-mono">{lab.contactPhone}</span>}
                                  {lab.contactEmail && (
                                    <span className="inline-flex items-center space-x-1">
                                      <Mail className="w-3 h-3" />
                                      <span>{lab.contactEmail}</span>
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[11px] italic text-amber-800">
                                  {isBn ? 'ফোন/ইমেইল স্ন্যাপশটে নেই — পোর্টালে দেখুন' : 'Unavailable in public snapshot — check BFSA portal'}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-start space-x-2">
                            <Award className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-stone-800 block">
                                {isBn ? 'অ্যাক্রেডিটেশন:' : 'Accreditation Status:'}
                              </span>
                              <span className="text-[11px] text-stone-600">
                                {isBn ? lab.accreditationSummaryBn : lab.accreditationSummary}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-start space-x-2">
                            <Clock className="w-3.5 h-3.5 text-stone-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-stone-800 block">
                                {isBn ? 'সম্ভাব্য সময় ও ফি:' : 'Turnaround & Published Fees:'}
                              </span>
                              <span className="text-[11px] text-stone-600 block">
                                {lab.expectedTurnaround || (isBn ? 'সময়: স্ন্যাপশটে নেই' : 'Turnaround: Unavailable in public snapshot')}
                              </span>
                              <span className="text-[11px] text-stone-600 flex items-start space-x-1 mt-0.5">
                                <Banknote className="w-3 h-3 shrink-0 mt-0.5 text-emerald-700" />
                                <span>
                                  {lab.publishedFeeNotes ||
                                    (isBn ? 'ফি: পোর্টালে যাচাই করুন' : 'Fees: Unavailable — check labrepository.bfsa.gov.bd')}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Food Types Tested */}
                        <div className="text-[11px]">
                          <span className="font-bold text-stone-800 block mb-1">
                            {isBn ? 'পরীক্ষাকৃত খাদ্যের ধরন:' : 'Food Types Tested:'}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {(isBn ? lab.foodItemsSummaryBn : lab.foodItemsSummary).map((item, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded bg-stone-100 text-stone-800 font-medium"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Confirmed Test Parameters & Methods */}
                        <div className="space-y-1.5 text-[11px]">
                          <span className="font-bold text-stone-800 block">
                            {isBn ? 'তালিকাভুক্ত টেস্ট প্যারামিটার ও পদ্ধতি:' : 'Available Test Parameters & Methods:'}
                          </span>
                          <div className="space-y-1.5">
                            {lab.parameters.map((p, idx) => (
                              <div key={idx} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1">
                                <div className="flex items-start justify-between gap-2">
                                  <span className="font-bold text-stone-900">
                                    {isBn ? p.parameterNameBn : p.parameterName}
                                  </span>
                                  <span className="shrink-0 px-1.5 py-0.5 rounded bg-white border border-stone-200 text-[10px] font-semibold text-stone-700">
                                    {p.accreditationStatus}
                                  </span>
                                </div>
                                <div className="text-stone-600">
                                  <span>{isBn ? 'পদ্ধতি:' : 'Method:'} {p.testingMethod}</span>
                                  {p.publishedFeeBdt ? (
                                    <span className="block text-emerald-900 font-medium">
                                      {isBn ? 'প্রকাশিত ফি:' : 'Fee Ref:'} {p.publishedFeeBdt}
                                    </span>
                                  ) : (
                                    <span className="block text-amber-800 italic">
                                      {isBn ? 'ফি: মূল রিপোজিটরিতে দেখুন' : 'Fee: Unavailable in snapshot'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Source Transparency Footer (Requirement E) */}
                      <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <div className="text-stone-500">
                          <span className="font-bold text-stone-700">{lab.sourceName}</span> ·{' '}
                          <span className="font-mono">{isBn ? 'যাচাই:' : 'Verified:'} {lab.lastVerifiedDate}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          {lab.institutionUrl && (
                            <a
                              href={lab.institutionUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-semibold text-stone-600 hover:text-stone-900 inline-flex items-center space-x-1"
                            >
                              <span>{isBn ? 'প্রতিষ্ঠান' : 'Institute'}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <a
                            href={lab.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-emerald-700 hover:underline inline-flex items-center space-x-1"
                          >
                            <span>{isBn ? 'মূল BFSA সূত্র' : 'BFSA Source'}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // MODE 2: OFFICIAL BFSA INFORMATION CENTER (Requirement D)
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                {isBn
                  ? 'বাংলাদেশ নিরাপদ খাদ্য কর্তৃপক্ষ (BFSA) অফিশিয়াল তথ্য কেন্দ্র'
                  : 'Official Bangladesh Food Safety Authority (BFSA) Information Center'}
              </span>
            </div>
            <h2 className="text-xl font-black text-stone-900">
              {isBn
                ? 'খাদ্য নিরাপত্তা সতর্কতা, সরকারি বিজ্ঞপ্তি ও নির্দেশিকা'
                : 'BFSA Food Safety Alerts, Official Notices & Consumer Guidelines'}
            </h2>
            <p className="text-xs text-stone-600 max-w-3xl leading-relaxed">
              {isBn
                ? 'www.bfsa.gov.bd থেকে যাচাইকৃত সরকারি নির্দেশনা, খাদ্য প্রত্যাহার প্রবিধানমালা, পারিবারিক নিরাপদ খাদ্য নির্দেশিকা ও ভোক্তা অভিযোগ হটলাইন (১৬১৫৫) দেখুন।'
                : 'Explore verified BFSA safety advisories, recall regulations, household guidelines, and consumer hotline information linked directly to www.bfsa.gov.bd.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <span className="px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-mono font-extrabold">
              {isBn ? 'বিএফএসএ হটলাইন: ১৬১৫৫' : 'BFSA Hotline: 16155'}
            </span>
            <a
              href={BFSA_SOURCES_METADATA.authorityUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-[#16382C] hover:bg-[#1E4A3B] text-white text-xs font-bold inline-flex items-center space-x-1.5"
            >
              <span>www.bfsa.gov.bd</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Category Filter & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: 'all', en: 'All BFSA Records', bn: 'সব তথ্য' },
                { id: 'food_safety_alert', en: 'Food Safety Alerts', bn: 'নিরাপত্তা সতর্কতা' },
                { id: 'official_notice', en: 'Official Notices & Directives', bn: 'সরকারি বিজ্ঞপ্তি' },
                { id: 'safety_guideline', en: 'Food Safety Guidelines', bn: 'নির্দেশিকা' },
                { id: 'consumer_info', en: 'Consumer Info & Hotline', bn: 'ভোক্তা তথ্য' },
              ] as const
            ).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setPortalCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                  portalCategoryFilter === cat.id
                    ? 'bg-[#1B4332] text-white border-[#1B4332]'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {isBn ? cat.bn : cat.en}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={portalQuery}
              onChange={(e) => setPortalQuery(e.target.value)}
              placeholder={isBn ? 'সতর্কতা বা নির্দেশিকা খুঁজুন...' : 'Filter BFSA notices & guidelines...'}
              className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
            />
          </div>
        </div>
      </div>

      {/* Live Transparency Banner explaining linking vs no public BFSA JSON feed */}
      <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-xs text-stone-700 flex items-start space-x-3">
        <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {isBn
            ? 'উৎস স্বচ্ছতা: প্রতিটি বিজ্ঞপ্তি ও নির্দেশিকা সরকারি প্রকাশনা থেকে যাচাইকৃত। দৈনিক সর্বশেষ বাজার রিকল বা মোবাইল কোর্ট বিজ্ঞপ্তির জন্য প্রতিটি কার্ডের "www.bfsa.gov.bd" লিংকে ক্লিক করে মূল পোর্টাল দেখুন।'
            : 'Source Transparency: Each record reflects verified official BFSA statutory documents and advisories. Because bfsa.gov.bd does not publish a public real-time JSON API, breaking daily recall notices are linked directly to the official BFSA portal.'}
        </p>
      </div>

      {/* Official Notices & Guidelines Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNotices.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${
                    item.category === 'food_safety_alert'
                      ? 'bg-rose-50 text-rose-900 border-rose-200'
                      : item.category === 'official_notice'
                      ? 'bg-amber-50 text-amber-950 border-amber-200'
                      : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  }`}
                >
                  {item.category === 'food_safety_alert' ? (
                    <AlertTriangle className="w-3 h-3" />
                  ) : item.category === 'official_notice' ? (
                    <Megaphone className="w-3 h-3" />
                  ) : (
                    <BookOpen className="w-3 h-3" />
                  )}
                  <span>{getBfsaInfoCategoryLabel(item.category, isBn)}</span>
                </span>
                {item.referenceCode && (
                  <span className="font-mono text-[11px] font-bold text-stone-500">
                    {item.referenceCode}
                  </span>
                )}
              </div>

              <h3 className="font-extrabold text-stone-900 text-sm sm:text-base leading-snug">
                {isBn ? item.titleBn : item.title}
              </h3>

              <div className="text-[11px] font-mono text-stone-500">
                <span>{isBn ? 'প্রকাশনা/সংস্করণ:' : 'Issue / Status:'} </span>
                <span className="font-semibold text-stone-700">{item.publishedDate}</span>
              </div>

              <p className="text-xs text-stone-700 leading-relaxed">
                {isBn ? item.summaryBn : item.summary}
              </p>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1 text-xs">
                <span className="font-bold text-stone-900 block">
                  {isBn ? 'ভোক্তাদের করণীয়:' : 'Consumer Guidance:'}
                </span>
                <ul className="list-disc pl-4 space-y-0.5 text-stone-600 text-[11px]">
                  {(isBn ? item.consumerActionsBn : item.consumerActions).map((act, idx) => (
                    <li key={idx}>{act}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 space-y-1.5 text-[11px]">
              <p className="text-stone-500 italic">
                {isBn ? item.availabilityNoteBn : item.availabilityNote}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-stone-500 font-mono">
                  {item.sourceName} · {isBn ? 'যাচাই:' : 'Verified:'} {item.lastVerifiedDate}
                </span>
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-emerald-700 hover:underline inline-flex items-center space-x-1"
                >
                  <span>{isBn ? 'মূল BFSA বিজ্ঞপ্তি দেখুন' : 'View on bfsa.gov.bd'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
