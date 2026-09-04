import { useState, useMemo } from 'react';

interface EMICalculatorProps {
  defaultPrice?: number;
  compact?: boolean;
}

export default function EMICalculator({ defaultPrice = 4500000, compact = false }: EMICalculatorProps) {
  const [loanAmount, setLoanAmount] = useState(defaultPrice * 0.8);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const { emi, totalInterest, totalPayable, principal } = useMemo(() => {
    const r = interestRate / 12 / 100;
    const n = tenure * 12;
    const emiValue = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = emiValue * n;
    return {
      principal: loanAmount,
      emi: emiValue,
      totalInterest: total - loanAmount,
      totalPayable: total,
    };
  }, [loanAmount, interestRate, tenure]);

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toFixed(0)}`;
  };

  const principalPercent = (principal / totalPayable) * 100;

  return (
    <div className={compact ? '' : 'bg-slate-50 rounded-2xl p-6'}>
      {!compact && (
        <h3 className="text-xl font-serif text-slate-900 mb-4">EMI Calculator</h3>
      )}

      <div className="space-y-5">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-slate-800">Loan Amount</label>
            <span className="text-sm font-semibold text-slate-900">{formatCurrency(loanAmount)}</span>
          </div>
          <input
            type="range"
            min="100000"
            max="100000000"
            step="100000"
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            className="w-full accent-slate-800"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>₹1 L</span>
            <span>₹1 Cr</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-slate-800">Interest Rate</label>
            <span className="text-sm font-semibold text-slate-900">{interestRate}% p.a.</span>
          </div>
          <input
            type="range"
            min="6"
            max="15"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full accent-slate-800"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>6%</span>
            <span>15%</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-slate-800">Loan Tenure</label>
            <span className="text-sm font-semibold text-slate-900">{tenure} years</span>
          </div>
          <input
            type="range"
            min="5"
            max="30"
            step="1"
            value={tenure}
            onChange={(e) => setTenure(Number(e.target.value))}
            className="w-full accent-slate-800"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>5 yrs</span>
            <span>30 yrs</span>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl p-5 border border-slate-100">
        <div className="text-center mb-4">
          <p className="text-sm text-slate-600 mb-1">Your Monthly EMI</p>
          <p className="text-3xl font-serif font-bold text-slate-900">{formatCurrency(emi)}</p>
        </div>

        <div className="h-3 rounded-full overflow-hidden flex mb-4">
          <div className="bg-slate-800" style={{ width: `${principalPercent}%` }} />
          <div className="bg-gold-400" style={{ width: `${100 - principalPercent}%` }} />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs sm:text-sm">
          <div>
            <p className="text-xs text-slate-500">Principal</p>
            <p className="text-sm font-semibold text-slate-900">{formatCurrency(principal)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Interest</p>
            <p className="text-sm font-semibold text-gold-600">{formatCurrency(totalInterest)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Payable</p>
            <p className="text-sm font-semibold text-slate-900">{formatCurrency(totalPayable)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
