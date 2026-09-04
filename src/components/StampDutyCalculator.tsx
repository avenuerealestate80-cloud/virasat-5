import { useState, useMemo } from 'react';
import { Calculator, Info, TrendingUp, Wallet, Landmark } from 'lucide-react';

interface StampDutyCalculatorProps {
  /** Default property value in rupees (default 50,00,000) */
  defaultValue?: number;
  /** Compact mode omits the outer card chrome */
  compact?: boolean;
}

type Gender = 'male' | 'female';
type PropertyStatus = 'under_construction' | 'ready_to_move';

export default function StampDutyCalculator({
  defaultValue = 5000000,
  compact = false,
}: StampDutyCalculatorProps) {
  const [propertyValue, setPropertyValue] = useState<number>(defaultValue);
  const [gender, setGender] = useState<Gender>('male');
  const [status, setStatus] = useState<PropertyStatus>('under_construction');

  const MIN_VALUE = 1000000; // 10 L
  const MAX_VALUE = 100000000; // 10 Cr

  const formatCurrency = (val: number): string => {
    if (val >= 10000000) return `Rs ${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `Rs ${(val / 100000).toFixed(2)} L`;
    return `Rs ${val.toLocaleString('en-IN')}`;
  };

  const calc = useMemo(() => {
    // Haryana stamp duty: 5% male, 4% female (1% reduction for women buyers)
    const stampDutyRate = gender === 'female' ? 0.04 : 0.05;
    const stampDuty = propertyValue * stampDutyRate;

    // Registration fee: 1% of property value, capped at Rs 500
    const registrationFee = Math.min(propertyValue * 0.01, 500);

    // GST: only on under-construction properties
    // 1% for affordable housing (<= 45 L), 5% otherwise; 0% for ready-to-move
    let gst = 0;
    let gstRate = 0;
    if (status === 'under_construction') {
      if (propertyValue <= 4500000) {
        gstRate = 0.01;
      } else {
        gstRate = 0.05;
      }
      gst = propertyValue * gstRate;
    }

    const totalCost = propertyValue + stampDuty + registrationFee + gst;

    return {
      stampDuty,
      stampDutyRate,
      registrationFee,
      gst,
      gstRate,
      totalCost,
    };
  }, [propertyValue, gender, status]);

  // Breakdown items for chart + legend
  const breakdown = [
    {
      label: 'Property Value',
      value: propertyValue,
      color: 'bg-slate-800',
      icon: Landmark,
    },
    {
      label: 'Stamp Duty',
      value: calc.stampDuty,
      color: 'bg-gold-500',
      icon: Calculator,
    },
    {
      label: 'Registration',
      value: calc.registrationFee,
      color: 'bg-gold-400',
      icon: Wallet,
    },
    {
      label: 'GST',
      value: calc.gst,
      color: 'bg-gold-300',
      icon: TrendingUp,
    },
  ];

  // Chart scales against the largest single component (property value)
  const maxValue = Math.max(...breakdown.map((b) => b.value), 1);

  // Out-of-pocket registration cost (excludes property value)
  const registrationCost = calc.stampDuty + calc.registrationFee + calc.gst;

  return (
    <div className={compact ? '' : 'bg-slate-50 rounded-2xl p-6'}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
          <Calculator className="w-5 h-5 text-gold-400" />
        </div>
        <div>
          <h3 className="text-xl font-serif text-slate-900">Stamp Duty Calculator</h3>
          <p className="text-xs text-slate-500">Haryana state rates &amp; fees</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Property Value — slider + input */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-slate-800">Property Value</label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">
                {formatCurrency(propertyValue)}
              </span>
            </div>
          </div>
          <input
            type="range"
            min={MIN_VALUE}
            max={MAX_VALUE}
            step="100000"
            value={propertyValue}
            onChange={(e) => setPropertyValue(Number(e.target.value))}
            className="w-full accent-slate-800"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Rs 10 L</span>
            <span>Rs 10 Cr</span>
          </div>
          {/* Numeric input for precise entry */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-slate-500">Rs</span>
            <input
              type="number"
              min={MIN_VALUE}
              max={MAX_VALUE}
              step="100000"
              value={propertyValue}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (!Number.isNaN(v)) {
                  setPropertyValue(Math.min(Math.max(v, MIN_VALUE), MAX_VALUE));
                }
              }}
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none transition-all text-sm text-slate-900"
              placeholder="Enter property value"
            />
          </div>
        </div>

        {/* Gender toggle */}
        <div>
          <label className="text-sm font-medium text-slate-800 mb-2 block">
            Buyer Gender
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['male', 'female'] as Gender[]).map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`py-2.5 px-4 rounded-lg border-2 text-sm font-medium capitalize transition-all ${
                  gender === g
                    ? 'border-slate-900 bg-slate-50 text-slate-900'
                    : 'border-slate-100 text-slate-500 hover:border-slate-300'
                }`}
              >
                {g === 'female' ? 'Female (1% off)' : 'Male'}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gold-500" />
            Haryana offers a 1% stamp duty reduction for female buyers.
          </p>
        </div>

        {/* Property status toggle */}
        <div>
          <label className="text-sm font-medium text-slate-800 mb-2 block">
            Property Status
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setStatus('under_construction')}
              className={`py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                status === 'under_construction'
                  ? 'border-slate-900 bg-slate-50 text-slate-900'
                  : 'border-slate-100 text-slate-500 hover:border-slate-300'
              }`}
            >
              Under Construction
            </button>
            <button
              onClick={() => setStatus('ready_to_move')}
              className={`py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                status === 'ready_to_move'
                  ? 'border-slate-900 bg-slate-50 text-slate-900'
                  : 'border-slate-100 text-slate-500 hover:border-slate-300'
              }`}
            >
              Ready to Move
            </button>
          </div>
          {status === 'under_construction' && (
            <p className="text-xs text-slate-500 mt-2 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gold-500" />
              GST: 1% for affordable (≤ Rs 45 L), 5% otherwise.
            </p>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="mt-6 bg-white rounded-xl p-5 border border-slate-100">
        {/* Prominent total cost of registration */}
        <div className="text-center mb-6 pb-5 border-b border-slate-100">
          <p className="text-sm text-slate-600 mb-1">Total Cost of Registration</p>
          <p className="text-3xl font-serif font-bold text-slate-900">
            {formatCurrency(registrationCost)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Over &amp; above the property value of {formatCurrency(propertyValue)}
          </p>
        </div>

        {/* CSS bar chart — horizontal bars */}
        <div className="space-y-3 mb-5">
          {breakdown.map((item) => {
            const Icon = item.icon;
            const widthPct = (item.value / maxValue) * 100;
            return (
              <div key={item.label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-600 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                    {item.label}
                  </span>
                  <span className="text-xs font-semibold text-slate-900">
                    {formatCurrency(item.value)}
                  </span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color} transition-all duration-500 ease-out`}
                    style={{ width: `${Math.max(widthPct, 2)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Rate summary grid */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500">Stamp Duty Rate</p>
            <p className="text-sm font-semibold text-slate-900">
              {(calc.stampDutyRate * 100).toFixed(0)}%
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500">GST Rate</p>
            <p className="text-sm font-semibold text-slate-900">
              {calc.gstRate > 0 ? `${(calc.gstRate * 100).toFixed(0)}%` : 'Nil'}
            </p>
          </div>
        </div>

        {/* Grand total */}
        <div className="mt-5 pt-5 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-gold-500" />
            <span className="text-sm font-medium text-slate-700">All-Inclusive Total</span>
          </div>
          <span className="text-lg font-serif font-bold text-slate-900">
            {formatCurrency(calc.totalCost)}
          </span>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-slate-400 mt-4 flex items-start gap-1.5 leading-relaxed">
        <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        Estimates based on Haryana state rates. Actual charges may vary; consult a
        legal advisor for precise figures.
      </p>
    </div>
  );
}
