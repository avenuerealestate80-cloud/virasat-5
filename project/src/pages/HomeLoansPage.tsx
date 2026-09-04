import { useState, useEffect } from 'react';
import {
  Building2,
  Calculator,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  HelpCircle,
  IndianRupee,
  Loader2,
  Percent,
  Phone,
  Shield,
  TrendingUp,
  Users,
  Award,
  ArrowRight,
  Building,
  PiggyBank,
  Target,
} from 'lucide-react';
import { supabase, type BankPartner, type LoanApplication } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useAuthUI } from '../lib/authUI';

const ELIGIBILITY_STEPS = [
  { label: 'Income', key: 'income' },
  { label: 'EMI', key: 'emi' },
  { label: 'Loan', key: 'loan' },
  { label: 'Result', key: 'result' },
];

const EMPLOYMENT_TYPES = [
  { key: 'salaried', label: 'Salaried Employee', desc: 'Working in a company/organization' },
  { key: 'self_employed', label: 'Self-Employed Professional', desc: 'Doctor, CA, Lawyer, etc.' },
  { key: 'business', label: 'Business Owner', desc: 'Own a registered business' },
  { key: 'nri', label: 'NRI', desc: 'Non-Resident Indian' },
];

function formatCurrency(value: number): string {
  if (value >= 10000000) return `Rs ${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `Rs ${(value / 100000).toFixed(2)} L`;
  return `Rs ${value.toLocaleString('en-IN')}`;
}

function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num)) return 0;
  if (value.toLowerCase().includes('cr')) return num * 10000000;
  if (value.toLowerCase().includes('l')) return num * 100000;
  return num;
}

export default function HomeLoansPage() {
  const { user } = useAuth();
  const { openAuth } = useAuthUI();

  const [bankPartners, setBankPartners] = useState<BankPartner[]>([]);
  const [loading, setLoading] = useState(true);

  // Eligibility Calculator State
  const [monthlyIncome, setMonthlyIncome] = useState<string>('100000');
  const [existingEmi, setExistingEmi] = useState<string>('0');
  const [tenure, setTenure] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(8.5);

  // Loan Application State
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationStep, setApplicationStep] = useState(0);
  const [applicationType, setApplicationType] = useState<LoanApplication['application_type']>('home_loan');
  const [employmentType, setEmploymentType] = useState<LoanApplication['employment_type']>('salaried');
  const [desiredAmount, setDesiredAmount] = useState<string>('5000000');
  const [propertyValue, setPropertyValue] = useState<string>('7000000');
  const [coApplicantName, setCoApplicantName] = useState('');
  const [coApplicantIncome, setCoApplicantIncome] = useState('0');
  const [submitting, setSubmitting] = useState(false);

  // Fetch bank partners
  useEffect(() => {
    async function fetchBanks() {
      const { data } = await supabase
        .from('bank_partners')
        .select('*')
        .eq('active', true)
        .order('priority', { ascending: true });
      if (data) setBankPartners(data as BankPartner[]);
      setLoading(false);
    }
    fetchBanks();
  }, []);

  // Calculate eligibility
  const eligibleLoanAmount = (() => {
    const income = parseCurrencyInput(monthlyIncome);
    const existing = parseCurrencyInput(existingEmi);
    const maxEmi = income * 0.6 - existing;
    if (maxEmi <= 0) return 0;
    const r = interestRate / 12 / 100;
    const n = tenure * 12;
    const loanAmount = (maxEmi * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));
    return Math.round(loanAmount);
  })();

  const estimatedEmi = (() => {
    const loan = eligibleLoanAmount;
    const r = interestRate / 12 / 100;
    const n = tenure * 12;
    if (loan <= 0 || r <= 0 || n <= 0) return 0;
    return Math.round((loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  })();

  // Submit loan application
  async function handleSubmitApplication() {
    if (!user) {
      openAuth('signin');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('loan_applications').insert({
        user_id: user.id,
        application_type: applicationType,
        employment_type: employmentType,
        monthly_income: parseCurrencyInput(monthlyIncome),
        existing_emis: parseCurrencyInput(existingEmi),
        desired_loan_amount: parseCurrencyInput(desiredAmount),
        tenure_years: tenure,
        property_value: parseCurrencyInput(propertyValue),
        co_applicant_name: coApplicantName || null,
        co_applicant_income: coApplicantName ? parseCurrencyInput(coApplicantIncome) : null,
      });
      if (error) throw error;
      setShowApplicationModal(false);
      setApplicationStep(0);
      alert('Application submitted successfully! Our team will contact you within 24 hours.');
    } catch (err: any) {
      alert('Failed to submit application: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const features = [
    {
      icon: Calculator,
      title: 'Eligibility Calculator',
      description: 'Check your loan eligibility and EMI before applying.',
    },
    {
      icon: Shield,
      title: 'Verified Banks & NBFCs',
      description: 'Partner with 100+ banks and NBFCs for the best rates.',
    },
    {
      icon: Clock,
      title: 'Quick Approval',
      description: 'Get instant approval with digital documentation.',
    },
    {
      icon: IndianRupee,
      title: 'Competitive Rates',
      description: 'Starting 8.40% p.a. with flexible tenure up to 30 years.',
    },
  ];

  const whyChooseUs = [
    { icon: Users, label: '50,000+', sublabel: 'Loans Disbursed' },
    { icon: IndianRupee, label: 'Rs 25,000 Cr+', sublabel: 'Loan Amount Processed' },
    { icon: Award, label: '100+', sublabel: 'Bank Partners' },
    { icon: Percent, label: '8.40%', sublabel: 'Lowest Interest Rate' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gold-500 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-slate-600 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/15 backdrop-blur-sm rounded-full border border-gold-400/30 mb-6">
              <CreditCard size={18} className="text-gold-400" />
              <span className="text-gold-300 text-sm font-medium">Trusted by 50,000+ Home Buyers</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Home Loans Made <span className="text-gold-400">Simple</span>
            </h1>
            <p className="text-slate-200 text-lg sm:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
              Compare loan offers from 100+ banks and NBFCs. Get instant eligibility check,
              lowest interest rates, and hassle-free approval with our expert guidance.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setShowApplicationModal(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gold-500 hover:bg-gold-600 text-slate-900 font-semibold rounded-lg transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-gold-500/20"
              >
                Apply for Loan
                <ArrowRight size={18} />
              </button>
              <a
                href="#eligibility"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg backdrop-blur-sm border border-white/20 transition-all duration-300"
              >
                <Calculator size={18} />
                Check Eligibility
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((stat) => (
              <div key={stat.label} className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <stat.icon className="w-8 h-8 text-gold-400 mx-auto mb-3" />
                <div className="font-serif text-2xl sm:text-3xl font-bold text-white">{stat.label}</div>
                <div className="text-slate-300 text-sm mt-1">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="py-8 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center shrink-0">
                  <feature.icon className="w-5 h-5 text-gold-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">{feature.title}</h3>
                  <p className="text-slate-600 text-xs mt-0.5">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility Calculator */}
      <section id="eligibility" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-gold-600 text-sm font-semibold uppercase tracking-wider">
              Free Tool
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mt-3 mb-4">
              Home Loan Eligibility Calculator
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Check how much loan you can get based on your income, existing EMIs, and tenure.
              Get instant results with accurate EMI calculations.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Calculator Inputs */}
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-8">
                <h3 className="font-serif text-xl font-bold text-slate-900 mb-6">
                  Enter Your Details
                </h3>

                <div className="space-y-6">
                  {/* Monthly Income */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Net Monthly Income
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                        <IndianRupee size={18} />
                      </span>
                      <input
                        type="text"
                        value={monthlyIncome}
                        onChange={(e) => setMonthlyIncome(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 bg-white text-slate-900 font-medium text-lg"
                        placeholder="1,00,000"
                      />
                    </div>
                    <p className="text-slate-500 text-xs mt-1.5">
                      Your take-home salary after deductions
                    </p>
                  </div>

                  {/* Existing EMI */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Existing Monthly EMIs
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                        <IndianRupee size={18} />
                      </span>
                      <input
                        type="text"
                        value={existingEmi}
                        onChange={(e) => setExistingEmi(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 bg-white text-slate-900 font-medium text-lg"
                        placeholder="0"
                      />
                    </div>
                    <p className="text-slate-500 text-xs mt-1.5">
                      Include all existing loan EMIs
                    </p>
                  </div>

                  {/* Tenure Slider */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Loan Tenure: <span className="text-gold-600">{tenure} years</span>
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="30"
                      value={tenure}
                      onChange={(e) => setTenure(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-gold-500"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>5 years</span>
                      <span>30 years</span>
                    </div>
                  </div>

                  {/* Interest Rate Slider */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Interest Rate: <span className="text-gold-600">{interestRate.toFixed(2)}%</span>
                    </label>
                    <input
                      type="range"
                      min="7"
                      max="12"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-gold-500"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>7%</span>
                      <span>12%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="bg-slate-900 rounded-2xl p-8 text-white">
                <h3 className="font-serif text-xl font-bold mb-6">
                  Your Eligibility Result
                </h3>

                <div className="space-y-6">
                  {/* Eligible Amount */}
                  <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
                    <div className="flex items-center gap-2 text-slate-300 text-sm mb-2">
                      <Target size={16} className="text-gold-400" />
                      Maximum Loan Eligibility
                    </div>
                    <div className="font-serif text-4xl sm:text-5xl font-bold text-gold-400">
                      {eligibleLoanAmount > 0 ? formatCurrency(eligibleLoanAmount) : 'Rs 0'}
                    </div>
                    <p className="text-slate-500 text-sm mt-2">
                      Based on 60% FOIR calculation
                    </p>
                  </div>

                  {/* EMI */}
                  <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
                    <div className="flex items-center gap-2 text-slate-300 text-sm mb-2">
                      <PiggyBank size={16} className="text-gold-400" />
                      Estimated Monthly EMI
                    </div>
                    <div className="font-serif text-3xl sm:text-4xl font-bold text-white">
                      {estimatedEmi > 0 ? formatCurrency(estimatedEmi) : 'Rs 0'}
                    </div>
                    <p className="text-slate-500 text-sm mt-2">
                      For {tenure} years @ {interestRate.toFixed(2)}% p.a.
                    </p>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/30 rounded-lg p-4">
                      <div className="text-slate-500 text-xs mb-1">Total Interest Payable</div>
                      <div className="font-semibold text-white">
                        {estimatedEmi > 0
                          ? formatCurrency(estimatedEmi * tenure * 12 - eligibleLoanAmount)
                          : 'Rs 0'}
                      </div>
                    </div>
                    <div className="bg-slate-900/30 rounded-lg p-4">
                      <div className="text-slate-500 text-xs mb-1">Total Payment</div>
                      <div className="font-semibold text-white">
                        {estimatedEmi > 0
                          ? formatCurrency(estimatedEmi * tenure * 12)
                          : 'Rs 0'}
                      </div>
                    </div>
                  </div>

                  {/* Apply CTA */}
                  <button
                    onClick={() => setShowApplicationModal(true)}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-gold-500 hover:bg-gold-600 text-slate-900 font-semibold rounded-lg transition-colors"
                  >
                    Apply for Home Loan
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bank Partners */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-gold-600 text-sm font-semibold uppercase tracking-wider">
              Our Partners
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mt-3 mb-4">
              100+ Banks & NBFCs
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Compare and choose from the best home loan offers from India's leading banks and housing finance companies.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={32} className="text-slate-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bankPartners.map((bank) => (
                <div
                  key={bank.id}
                  className={`bg-white rounded-2xl border ${
                    bank.featured ? 'border-gold-300 shadow-lg shadow-gold-100/50' : 'border-slate-100'
                  } p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                >
                  {bank.featured && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-gold-100 text-gold-700 text-xs font-semibold rounded-full mb-4">
                      <Star size={12} className="fill-current" />
                      Featured
                    </div>
                  )}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center">
                      <Building2 className="w-7 h-7 text-slate-700" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-slate-900">{bank.name}</h3>
                      <span className="text-slate-500 text-sm capitalize">{bank.bank_type}</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Interest Rate</span>
                      <span className="font-semibold text-green-600">
                        {bank.min_interest_rate}% - {bank.max_interest_rate}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Max Loan</span>
                      <span className="font-medium text-slate-900">
                        {bank.max_loan_amount ? formatCurrency(bank.max_loan_amount) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Tenure</span>
                      <span className="font-medium text-slate-900">
                        Up to {bank.max_tenure_years} years
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Processing Fee</span>
                      <span className="font-medium text-slate-900">
                        {bank.processing_fee_percent}% of loan
                      </span>
                    </div>
                  </div>

                  {bank.special_schemes && bank.special_schemes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {bank.special_schemes.map((scheme, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-slate-50 text-slate-700 rounded-full"
                        >
                          {scheme}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-gold-600 text-sm font-semibold uppercase tracking-wider">
              Loan Services
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mt-3 mb-4">
              Types of Loans We Offer
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Building,
                title: 'Home Loan',
                desc: 'Purchase your dream home with competitive rates and flexible tenure.',
                features: ['Up to 90% funding', '15-30 years tenure', 'NRI options'],
              },
              {
                icon: TrendingUp,
                title: 'Balance Transfer',
                desc: 'Transfer your existing home loan to lower interest rates and save money.',
                features: ['Lower EMI', 'Top-up facility', 'No hidden charges'],
              },
              {
                icon: FileText,
                title: 'Loan Against Property',
                desc: 'Get funds against your existing property for business or personal needs.',
                features: ['High loan amount', 'Low interest', 'Flexible repayment'],
              },
              {
                icon: Percent,
                title: 'Top-Up Loan',
                desc: 'Additional loan on your existing home loan for renovations or emergencies.',
                features: ['Quick processing', 'Minimal documentation', 'Competitive rates'],
              },
            ].map((service) => (
              <div
                key={service.title}
                className="bg-slate-50 rounded-2xl border border-slate-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center mb-5 group-hover:bg-gold-500/20 transition-colors">
                  <service.icon className="w-6 h-6 text-gold-600" />
                </div>
                <h3 className="font-serif text-lg font-bold text-slate-900 mb-2">
                  {service.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">{service.desc}</p>
                <ul className="space-y-2">
                  {service.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-slate-700">
                      <CheckCircle2 size={14} className="text-green-500" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Documents Required */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-gold-400 text-sm font-semibold uppercase tracking-wider">
              Quick Processing
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3 mb-4">
              Documents Required
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Salaried */}
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-gold-400" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-white">For Salaried</h3>
                  <p className="text-slate-500 text-sm">Employees working in companies</p>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  'Identity Proof (Aadhaar Card / PAN Card)',
                  'Address Proof',
                  'Last 3 months Salary Slips',
                  'Last 6 months Bank Statements',
                  'Form 16 or IT Returns (last 2 years)',
                  'Employment Certificate / Offer Letter',
                ].map((doc) => (
                  <li key={doc} className="flex items-start gap-3 text-slate-200 text-sm">
                    <CheckCircle2 size={18} className="text-gold-400 shrink-0 mt-0.5" />
                    {doc}
                  </li>
                ))}
              </ul>
            </div>

            {/* Self-Employed */}
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center">
                  <Building className="w-6 h-6 text-gold-400" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-white">For Self-Employed</h3>
                  <p className="text-slate-500 text-sm">Business owners & professionals</p>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  'Identity Proof (Aadhaar Card / PAN Card)',
                  'Address Proof',
                  'Business Registration Certificate',
                  'Last 2 years IT Returns with Computation',
                  'Last 12 months Bank Statements',
                  'Profit & Loss Statement / Balance Sheet',
                ].map((doc) => (
                  <li key={doc} className="flex items-start gap-3 text-slate-200 text-sm">
                    <CheckCircle2 size={18} className="text-gold-400 shrink-0 mt-0.5" />
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-6">
            <CheckCircle2 size={16} />
            Free Consultation Available
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-5">
            Need Help With Your Home Loan?
          </h2>
          <p className="text-slate-600 text-lg mb-10 max-w-2xl mx-auto">
            Our loan advisors are here to help you find the best loan offer and guide you through the entire process.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setShowApplicationModal(true)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-900 text-white font-semibold rounded-lg transition-all"
            >
              Apply Now
              <ArrowRight size={18} />
            </button>
            <a
              href="tel:+917015714787"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold-500 hover:bg-gold-600 text-slate-900 font-semibold rounded-lg transition-all"
            >
              <Phone size={18} />
              Call Us
            </a>
          </div>
        </div>
      </section>

      {/* Application Modal */}
      {showApplicationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setShowApplicationModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold text-slate-900">
                  Apply for Home Loan
                </h2>
                <p className="text-slate-600 text-sm">Step {applicationStep + 1} of 4</p>
              </div>
              <button
                onClick={() => setShowApplicationModal(false)}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            {/* Progress */}
            <div className="px-6 py-3 bg-slate-50">
              <div className="flex items-center gap-2">
                {ELIGIBILITY_STEPS.map((step, idx) => (
                  <div
                    key={step.key}
                    className={`flex-1 h-1.5 rounded-full ${
                      idx <= applicationStep ? 'bg-gold-500' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-600">
                {ELIGIBILITY_STEPS.map((step) => (
                  <span key={step.key} className={ELIGIBILITY_STEPS.indexOf(step) === applicationStep ? 'font-semibold text-slate-900' : ''}>
                    {step.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {!user ? (
                <div className="text-center py-8">
                  <HelpCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="font-serif text-xl font-bold text-slate-900 mb-2">
                    Sign In to Apply
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Please sign in or create an account to submit your loan application.
                  </p>
                  <button
                    onClick={() => {
                      setShowApplicationModal(false);
                      openAuth('signin');
                    }}
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-900 text-white font-semibold rounded-lg transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              ) : (
                <>
                  {/* Step 0: Income */}
                  {applicationStep === 0 && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-2">
                          Your Income Details
                        </label>
                        <p className="text-slate-600 text-sm mb-4">
                          Enter your monthly income for accurate eligibility calculation.
                        </p>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                            <IndianRupee size={18} />
                          </span>
                          <input
                            type="text"
                            value={monthlyIncome}
                            onChange={(e) => setMonthlyIncome(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 bg-white text-slate-900 font-medium text-lg"
                            placeholder="1,00,000"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-3">
                          Employment Type
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {EMPLOYMENT_TYPES.map((type) => (
                            <button
                              key={type.key}
                              onClick={() => setEmploymentType(type.key as LoanApplication['employment_type'])}
                              className={`p-4 rounded-lg border text-left transition-all ${
                                employmentType === type.key
                                  ? 'border-gold-500 bg-gold-50'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="font-semibold text-slate-900 text-sm">{type.label}</div>
                              <div className="text-slate-600 text-xs mt-0.5">{type.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-2">
                          Existing Monthly EMIs
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                            <IndianRupee size={18} />
                          </span>
                          <input
                            type="text"
                            value={existingEmi}
                            onChange={(e) => setExistingEmi(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 bg-white text-slate-900 font-medium text-lg"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 1: EMI Preferences */}
                  {applicationStep === 1 && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-2">
                          Loan Type
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { key: 'home_loan', label: 'Home Loan', desc: 'Buy a new property' },
                            { key: 'balance_transfer', label: 'Balance Transfer', desc: 'Lower your EMI' },
                            { key: 'loan_against_property', label: 'Loan Against Property', desc: 'Use property as collateral' },
                            { key: 'topup', label: 'Top-Up Loan', desc: 'Additional loan on existing' },
                          ].map((type) => (
                            <button
                              key={type.key}
                              onClick={() => setApplicationType(type.key as LoanApplication['application_type'])}
                              className={`p-4 rounded-lg border text-left transition-all ${
                                applicationType === type.key
                                  ? 'border-gold-500 bg-gold-50'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="font-semibold text-slate-900 text-sm">{type.label}</div>
                              <div className="text-slate-600 text-xs mt-0.5">{type.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-2">
                          Desired Loan Amount
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                            <IndianRupee size={18} />
                          </span>
                          <input
                            type="text"
                            value={desiredAmount}
                            onChange={(e) => setDesiredAmount(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 bg-white text-slate-900 font-medium text-lg"
                            placeholder="50,00,000"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-2">
                          Loan Tenure: <span className="text-gold-600">{tenure} years</span>
                        </label>
                        <input
                          type="range"
                          min="5"
                          max="30"
                          value={tenure}
                          onChange={(e) => setTenure(parseInt(e.target.value))}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-gold-500"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                          <span>5 years</span>
                          <span>30 years</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Property Details */}
                  {applicationStep === 2 && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-2">
                          Property Value (Estimated)
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                            <IndianRupee size={18} />
                          </span>
                          <input
                            type="text"
                            value={propertyValue}
                            onChange={(e) => setPropertyValue(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 bg-white text-slate-900 font-medium text-lg"
                            placeholder="70,00,000"
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-800 text-sm mb-2">
                          <IndianRupee size={16} className="text-gold-600" />
                          Estimated EMI
                        </div>
                        <div className="font-serif text-2xl font-bold text-slate-900">
                          {formatCurrency(
                            Math.round(
                              (parseCurrencyInput(desiredAmount) *
                                (8.5 / 12 / 100) *
                                Math.pow(1 + 8.5 / 12 / 100, tenure * 12)) /
                                (Math.pow(1 + 8.5 / 12 / 100, tenure * 12) - 1)
                            )
                          )}/month
                        </div>
                        <p className="text-slate-500 text-xs mt-1">@ 8.50% for {tenure} years</p>
                      </div>

                      <div className="border-t border-slate-100 pt-6">
                        <h4 className="font-semibold text-slate-900 mb-4">
                          Co-Applicant Details (Optional)
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                              Co-Applicant Name
                            </label>
                            <input
                              type="text"
                              value={coApplicantName}
                              onChange={(e) => setCoApplicantName(e.target.value)}
                              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 bg-white text-slate-900"
                              placeholder="Enter co-applicant name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                              Co-Applicant Monthly Income
                            </label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                <IndianRupee size={16} />
                              </span>
                              <input
                                type="text"
                                value={coApplicantIncome}
                                onChange={(e) => setCoApplicantIncome(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 bg-white text-slate-900"
                                placeholder="0"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Review & Submit */}
                  {applicationStep === 3 && (
                    <div className="space-y-6">
                      <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                        <h3 className="font-semibold text-slate-900 mb-4">Application Summary</h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Employment Type</span>
                            <span className="font-medium text-slate-900 capitalize">{employmentType.replace('_', ' ')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Monthly Income</span>
                            <span className="font-medium text-slate-900">{formatCurrency(parseCurrencyInput(monthlyIncome))}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Loan Type</span>
                            <span className="font-medium text-slate-900 capitalize">{applicationType.replace('_', ' ')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Loan Amount</span>
                            <span className="font-medium text-slate-900">{formatCurrency(parseCurrencyInput(desiredAmount))}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Tenure</span>
                            <span className="font-medium text-slate-900">{tenure} years</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Property Value</span>
                            <span className="font-medium text-slate-900">{formatCurrency(parseCurrencyInput(propertyValue))}</span>
                          </div>
                          {coApplicantName && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">Co-Applicant</span>
                              <span className="font-medium text-slate-900">{coApplicantName}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-green-800 font-medium text-sm">What happens next?</p>
                          <ul className="text-green-700 text-xs mt-2 space-y-1">
                            <li>Our loan advisor will contact you within 24 hours</li>
                            <li>We'll compare offers from multiple banks for you</li>
                            <li>Help you choose the best deal with lowest rates</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {user && (
              <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-between">
                <button
                  onClick={() => setApplicationStep((s) => Math.max(0, s - 1))}
                  disabled={applicationStep === 0}
                  className="px-6 py-2.5 text-slate-700 font-medium hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Back
                </button>
                {applicationStep < 3 ? (
                  <button
                    onClick={() => setApplicationStep((s) => s + 1)}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-900 text-white font-semibold rounded-lg transition-colors"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitApplication}
                    disabled={submitting}
                    className="px-6 py-2.5 bg-gold-500 hover:bg-gold-600 text-slate-900 font-semibold rounded-lg transition-colors disabled:opacity-60"
                  >
                    {submitting ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Star({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
