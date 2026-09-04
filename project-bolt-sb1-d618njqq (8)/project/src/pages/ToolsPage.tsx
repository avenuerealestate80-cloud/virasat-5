import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calculator,
  TrendingUp,
  Ruler,
  ArrowRight,
  Info,
  Home,
  Wallet,
  Landmark,
} from 'lucide-react';
import EMICalculator from '../components/EMICalculator';
import StampDutyCalculator from '../components/StampDutyCalculator';

type Tab = 'emi' | 'roi' | 'area' | 'eligibility' | 'stampduty';

// ── Indian Currency Formatter ─────────────────────────────────
function formatCurrency(val: number): string {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
  return `₹${val.toFixed(0)}`;
}

// ── Land Area Conversion Constants (base unit: sqft) ─────────
const AREA_UNITS: Record<string, { label: string; factor: number }> = {
  sqft: { label: 'Square Feet', factor: 1 },
  sqm: { label: 'Square Meters', factor: 10.7639 },
  sqyard: { label: 'Square Yards', factor: 9 },
  acre: { label: 'Acres', factor: 43560 },
  hectare: { label: 'Hectares', factor: 107639 },
  marla: { label: 'Marla', factor: 272.25 },
  ground: { label: 'Ground', factor: 2400 },
};

// ════════════════════════════════════════════════════════════
//  ROI Calculator Component
// ════════════════════════════════════════════════════════════
function ROICalculator() {
  const [propertyPrice, setPropertyPrice] = useState(50000000);
  const [monthlyRent, setMonthlyRent] = useState(25000);
  const [annualAppreciation, setAnnualAppreciation] = useState(8);
  const [holdingPeriod, setHoldingPeriod] = useState(5);

  const results = useMemo(() => {
    const annualRent = monthlyRent * 12;
    const totalRentIncome = annualRent * holdingPeriod;
    const rentalYield = (annualRent / propertyPrice) * 100;
    const appreciationValue = propertyPrice * Math.pow(1 + annualAppreciation / 100, holdingPeriod) - propertyPrice;
    const totalROI = totalRentIncome + appreciationValue;
    const roiPercentage = (totalROI / propertyPrice) * 100;
    return {
      annualRent,
      totalRentIncome,
      rentalYield,
      appreciationValue,
      totalROI,
      roiPercentage,
    };
  }, [propertyPrice, monthlyRent, annualAppreciation, holdingPeriod]);

  // For the bar comparison
  const totalReturns = results.totalRentIncome + results.appreciationValue;
  const rentPercent = totalReturns > 0 ? (results.totalRentIncome / totalReturns) * 100 : 0;
  const appreciationPercent = totalReturns > 0 ? (results.appreciationValue / totalReturns) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-slate-800">Property Price</label>
            <span className="text-sm font-semibold text-slate-900">{formatCurrency(propertyPrice)}</span>
          </div>
          <input
            type="range"
            min="1000000"
            max="100000000"
            step="100000"
            value={propertyPrice}
            onChange={(e) => setPropertyPrice(Number(e.target.value))}
            className="w-full accent-slate-800"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>₹10 L</span>
            <span>₹10 Cr</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-slate-800">Expected Monthly Rent</label>
            <span className="text-sm font-semibold text-slate-900">{formatCurrency(monthlyRent)}</span>
          </div>
          <input
            type="range"
            min="5000"
            max="500000"
            step="500"
            value={monthlyRent}
            onChange={(e) => setMonthlyRent(Number(e.target.value))}
            className="w-full accent-slate-800"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>₹5K</span>
            <span>₹5L</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-slate-800">Annual Appreciation</label>
            <span className="text-sm font-semibold text-slate-900">{annualAppreciation}% p.a.</span>
          </div>
          <input
            type="range"
            min="0"
            max="25"
            step="0.5"
            value={annualAppreciation}
            onChange={(e) => setAnnualAppreciation(Number(e.target.value))}
            className="w-full accent-slate-800"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>0%</span>
            <span>25%</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-slate-800">Holding Period</label>
            <span className="text-sm font-semibold text-slate-900">{holdingPeriod} years</span>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            step="1"
            value={holdingPeriod}
            onChange={(e) => setHoldingPeriod(Number(e.target.value))}
            className="w-full accent-slate-800"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>1 yr</span>
            <span>30 yrs</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-xl p-6 border border-slate-100">
        {/* Headline ROI */}
        <div className="text-center mb-6">
          <p className="text-sm text-slate-600 mb-1">Total Return on Investment</p>
          <p className="text-4xl font-serif font-bold text-slate-900">{formatCurrency(results.totalROI)}</p>
          <p className="text-lg font-semibold text-gold-600 mt-1">{results.roiPercentage.toFixed(1)}% ROI</p>
        </div>

        {/* Rental vs Appreciation Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs font-medium mb-2">
            <span className="text-slate-800">Rental Income {rentPercent.toFixed(0)}%</span>
            <span className="text-gold-600">Appreciation {appreciationPercent.toFixed(0)}%</span>
          </div>
          <div className="h-6 rounded-full overflow-hidden flex bg-slate-100">
            <div
              className="bg-slate-800 transition-all duration-500 flex items-center justify-center"
              style={{ width: `${rentPercent}%` }}
            >
              {rentPercent > 15 && <span className="text-xs text-white font-medium">Rent</span>}
            </div>
            <div
              className="bg-gold-400 transition-all duration-500 flex items-center justify-center"
              style={{ width: `${appreciationPercent}%` }}
            >
              {appreciationPercent > 15 && <span className="text-xs text-slate-900 font-medium">Growth</span>}
            </div>
          </div>
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="p-3 bg-slate-50 rounded-lg text-center">
            <p className="text-xs text-slate-500 mb-1">Rental Yield</p>
            <p className="text-lg font-semibold text-slate-900">{results.rentalYield.toFixed(2)}%</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg text-center">
            <p className="text-xs text-slate-500 mb-1">Annual Rent</p>
            <p className="text-lg font-semibold text-slate-900">{formatCurrency(results.annualRent)}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg text-center">
            <p className="text-xs text-slate-500 mb-1">Total Rent Income</p>
            <p className="text-lg font-semibold text-slate-900">{formatCurrency(results.totalRentIncome)}</p>
          </div>
          <div className="p-3 bg-gold-50 rounded-lg text-center">
            <p className="text-xs text-gold-600 mb-1">Appreciation Value</p>
            <p className="text-lg font-semibold text-gold-700">{formatCurrency(results.appreciationValue)}</p>
          </div>
          <div className="p-3 bg-gold-50 rounded-lg text-center">
            <p className="text-xs text-gold-600 mb-1">Future Property Value</p>
            <p className="text-lg font-semibold text-gold-700">
              {formatCurrency(propertyPrice + results.appreciationValue)}
            </p>
          </div>
          <div className="p-3 bg-slate-900 rounded-lg text-center">
            <p className="text-xs text-slate-300 mb-1">Total ROI</p>
            <p className="text-lg font-semibold text-gold-400">{formatCurrency(results.totalROI)}</p>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
        <Info size={18} className="text-slate-500 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-600 leading-relaxed">
          This calculator provides estimates based on your inputs. Actual returns may vary due to market
          conditions, vacancy periods, maintenance costs, taxes, and other factors. Consult with our
          experts for a detailed investment analysis.
        </p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  Land Area Converter Component
// ════════════════════════════════════════════════════════════
function LandAreaConverter() {
  const [inputValue, setInputValue] = useState(1000);
  const [inputUnit, setInputUnit] = useState('sqft');

  const conversions = useMemo(() => {
    const inSqft = inputValue * AREA_UNITS[inputUnit].factor;
    return Object.entries(AREA_UNITS).map(([key, { label, factor }]) => ({
      key,
      label,
      value: inSqft / factor,
    }));
  }, [inputValue, inputUnit]);

  const formatValue = (val: number) => {
    if (val >= 100000) return val.toLocaleString('en-IN', { maximumFractionDigits: 0 });
    if (val >= 100) return val.toLocaleString('en-IN', { maximumFractionDigits: 2 });
    return val.toLocaleString('en-IN', { maximumFractionDigits: 4 });
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-800 mb-2 block">Enter Area</label>
          <div className="relative">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(Math.max(0, Number(e.target.value)))}
              className="w-full px-4 py-3 rounded-lg bg-white border border-slate-200 text-slate-900 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
              placeholder="Enter value"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-800 mb-2 block">Select Unit</label>
          <select
            value={inputUnit}
            onChange={(e) => setInputUnit(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white border border-slate-200 text-slate-900 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent capitalize"
          >
            {Object.entries(AREA_UNITS).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label} ({key})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {conversions.map(({ key, label, value }) => (
          <div
            key={key}
            className={`p-5 rounded-xl border transition-all ${
              key === inputUnit
                ? 'bg-slate-900 border-slate-900'
                : 'bg-white border-slate-100 hover:border-gold-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Ruler
                size={16}
                className={key === inputUnit ? 'text-gold-400' : 'text-gold-500'}
              />
              <span
                className={`text-xs font-medium uppercase tracking-wider ${
                  key === inputUnit ? 'text-gold-400' : 'text-slate-500'
                }`}
              >
                {label}
              </span>
            </div>
            <p
              className={`text-2xl font-serif font-bold ${
                key === inputUnit ? 'text-white' : 'text-slate-900'
              }`}
            >
              {formatValue(value)}
            </p>
            <p
              className={`text-sm mt-1 ${
                key === inputUnit ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              {key}
            </p>
          </div>
        ))}
      </div>

      {/* Info Note */}
      <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
        <Info size={18} className="text-slate-500 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-600 leading-relaxed">
          Conversions are based on standard Indian land measurement units. Marla is commonly used in
          North India (1 Marla = 272.25 sqft), and Ground is used in South India (1 Ground = 2400 sqft).
        </p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  Home Loan Eligibility Calculator
// ════════════════════════════════════════════════════════════
function EligibilityCalculator() {
  const [monthlyIncome, setMonthlyIncome] = useState(80000);
  const [existingEMI, setExistingEMI] = useState(0);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const results = useMemo(() => {
    // Banks typically lend so that EMI doesn't exceed 50% of monthly income (minus existing EMIs)
    const maxEMI = (monthlyIncome * 0.5) - existingEMI;
    if (maxEMI <= 0) return { maxLoan: 0, maxEMI: 0, downPayment: 0, maxProperty: 0 };

    const r = interestRate / 12 / 100;
    const n = tenure * 12;
    const maxLoan = (maxEMI * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));
    const downPayment = maxLoan * 0.2; // 20% down payment
    const maxProperty = maxLoan + downPayment;

    return { maxLoan, maxEMI, downPayment, maxProperty };
  }, [monthlyIncome, existingEMI, interestRate, tenure]);

  return (
    <div>
      <div className="lg:grid lg:grid-cols-2 lg:gap-8">
        <div className="space-y-5">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-slate-800">Monthly Income</label>
              <span className="text-sm font-semibold text-slate-900">{formatCurrency(monthlyIncome)}</span>
            </div>
            <input
              type="range" min="20000" max="1000000" step="5000"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(Number(e.target.value))}
              className="w-full accent-slate-800"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>₹20K</span><span>₹10L</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-slate-800">Existing Monthly EMI(s)</label>
              <span className="text-sm font-semibold text-slate-900">{formatCurrency(existingEMI)}</span>
            </div>
            <input
              type="range" min="0" max="50000" step="1000"
              value={existingEMI}
              onChange={(e) => setExistingEMI(Number(e.target.value))}
              className="w-full accent-slate-800"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>₹0</span><span>₹50K</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-slate-800">Interest Rate</label>
              <span className="text-sm font-semibold text-slate-900">{interestRate}% p.a.</span>
            </div>
            <input
              type="range" min="6" max="15" step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full accent-slate-800"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-slate-800">Loan Tenure</label>
              <span className="text-sm font-semibold text-slate-900">{tenure} years</span>
            </div>
            <input
              type="range" min="5" max="30" step="1"
              value={tenure}
              onChange={(e) => setTenure(Number(e.target.value))}
              className="w-full accent-slate-800"
            />
          </div>
        </div>

        <div className="mt-6 lg:mt-0 space-y-4">
          <div className="bg-slate-900 text-white rounded-xl p-6 text-center">
            <p className="text-sm text-slate-300 mb-1">Maximum Loan Eligibility</p>
            <p className="text-4xl font-serif font-bold text-gold-400">{formatCurrency(results.maxLoan)}</p>
            <p className="text-sm text-slate-300 mt-3">Max Monthly EMI: <span className="text-white font-semibold">{formatCurrency(results.maxEMI)}</span></p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
              <p className="text-xs text-slate-600 mb-1">Required Down Payment (20%)</p>
              <p className="text-lg font-bold text-slate-900">{formatCurrency(results.downPayment)}</p>
            </div>
            <div className="bg-gold-50 rounded-xl p-4 text-center border border-gold-100">
              <p className="text-xs text-slate-600 mb-1">Max Property Value</p>
              <p className="text-lg font-bold text-slate-900">{formatCurrency(results.maxProperty)}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              Banks typically lend up to 80% of property value. Eligibility is calculated assuming EMI should not exceed 50% of your monthly income.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  Main Tools Page
// ════════════════════════════════════════════════════════════
export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('emi');

  const tabs: { id: Tab; label: string; icon: typeof Calculator; description: string }[] = [
    { id: 'emi', label: 'EMI Calculator', icon: Calculator, description: 'Calculate your monthly loan payments' },
    { id: 'eligibility', label: 'Loan Eligibility', icon: Wallet, description: 'Check how much loan you can get' },
    { id: 'roi', label: 'ROI Calculator', icon: TrendingUp, description: 'Estimate returns on your property investment' },
    { id: 'area', label: 'Land Area Converter', icon: Ruler, description: 'Convert between Indian land measurement units' },
    { id: 'stampduty', label: 'Stamp Duty', icon: Landmark, description: 'Calculate stamp duty & registration costs' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-slate-900 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-gold-400 text-sm font-semibold uppercase tracking-wider">Financial Tools</span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-2 mb-4">
            Property Investment Tools
          </h1>
          <p className="text-slate-300 max-w-2xl">
            Make informed decisions with our suite of calculators. Plan your EMI, estimate ROI, and
            convert land areas — all in one place.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center gap-3 px-5 py-4 rounded-xl border-2 transition-all text-left ${
                activeTab === tab.id
                  ? 'border-slate-900 bg-slate-900 text-white shadow-lg'
                  : 'border-slate-100 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <tab.icon
                size={22}
                className={activeTab === tab.id ? 'text-gold-400' : 'text-gold-500'}
              />
              <div>
                <div className="font-semibold text-sm">{tab.label}</div>
                <div
                  className={`text-xs mt-0.5 ${
                    activeTab === tab.id ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {tab.description}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Active Tool Card */}
        <div className="bg-slate-50 rounded-2xl p-6 sm:p-8">
          {activeTab === 'emi' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
                  <Calculator size={24} className="text-gold-400" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-bold text-slate-900">EMI Calculator</h2>
                  <p className="text-sm text-slate-600">Calculate your monthly home loan installment</p>
                </div>
              </div>
              <EMICalculator />
            </div>
          )}

          {activeTab === 'eligibility' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gold-100 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-gold-600" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-slate-900">Home Loan Eligibility</h2>
              </div>
              <EligibilityCalculator />
            </div>
          )}

          {activeTab === 'roi' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
                  <TrendingUp size={24} className="text-gold-400" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-bold text-slate-900">ROI Calculator</h2>
                  <p className="text-sm text-slate-600">Estimate returns from rental income & appreciation</p>
                </div>
              </div>
              <ROICalculator />
            </div>
          )}

          {activeTab === 'area' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
                  <Ruler size={24} className="text-gold-400" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-bold text-slate-900">Land Area Converter</h2>
                  <p className="text-sm text-slate-600">Convert between Indian land measurement units</p>
                </div>
              </div>
              <LandAreaConverter />
            </div>
          )}

          {activeTab === 'stampduty' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
                  <Landmark size={24} className="text-gold-400" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-bold text-slate-900">Stamp Duty Calculator</h2>
                  <p className="text-sm text-slate-600">Calculate stamp duty & registration costs for Haryana</p>
                </div>
              </div>
              <StampDutyCalculator />
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center bg-white rounded-2xl p-8 border border-slate-100">
          <Home size={32} className="text-gold-500 mx-auto mb-4" />
          <h3 className="font-serif text-xl font-bold text-slate-900 mb-2">
            Ready to Invest?
          </h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Explore our premium properties in Sohna and find the perfect investment opportunity.
          </p>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-all hover:translate-y-[-2px] shadow-lg"
          >
            Browse Projects
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
