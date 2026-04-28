import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const App = () => {
  const [principal, setPrincipal] = useState(500000);
  const [loanInterest, setLoanInterest] = useState(9);
  const [sipReturn, setSipReturn] = useState(12);
  const [inflationRate, setInflationRate] = useState(6); 
  const [tenureYears, setTenureYears] = useState(5);

  const { emi, chartData } = useMemo(() => {
    const totalMonths = tenureYears * 12;
    const monthlyLoanRate = loanInterest / 12 / 100;
    const monthlySipRate = sipReturn / 12 / 100;

    // EMI Calculation (Fixed for the life of the loan)
    const emiValue = (principal * monthlyLoanRate * Math.pow(1 + monthlyLoanRate, totalMonths)) / 
                     (Math.pow(1 + monthlyLoanRate, totalMonths) - 1);

    let data = [];
    let remainingPrincipal = principal;

    for (let i = 1; i <= totalMonths; i++) {
      // 1. Loan Amortization (Must be iterative as it depends on previous balance)
      const interestPayment = remainingPrincipal * monthlyLoanRate;
      const principalPayment = emiValue - interestPayment;
      remainingPrincipal -= principalPayment;

      // 2. SIP Calculation using the Direct Annuity Due Formula
      // Formula: M = P * (((1 + i)^n - 1) / i) * (1 + i)
      const currentCorpus = emiValue * ((Math.pow(1 + monthlySipRate, i) - 1) / monthlySipRate) * (1 + monthlySipRate);

      // 3. Real Value Adjustments (Inflation)
      const inflationFactor = Math.pow(1 + inflationRate / 100, i / 12);
      const inflationAdjustedDebt = principal / inflationFactor;
      const realValueCorpus = currentCorpus / inflationFactor;

      // Push to chart data
      if (i === 1 || i % 6 === 0 || i === totalMonths) {
        data.push({
          month: i,
          debtBalance: Math.max(0, Math.round(remainingPrincipal)),
          investmentCorpus: Math.round(currentCorpus),
          realValueDebt: Math.round(inflationAdjustedDebt),
          realValueCorpus: Math.round(realValueCorpus),
        });
      }
    }
    return { emi: emiValue, chartData: data };
  }, [principal, loanInterest, sipReturn, inflationRate, tenureYears]);

  const currencyFormatter = (value) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Debt vs. SIP Calculator (Annuity Due)</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        <div><label>Loan Principal: </label><input type="number" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} style={{ width: '100%' }} /></div>
        <div><label>Loan Interest (%): </label><input type="number" value={loanInterest} onChange={(e) => setLoanInterest(Number(e.target.value))} style={{ width: '100%' }} /></div>
        <div><label>SIP Return (%): </label><input type="number" value={sipReturn} onChange={(e) => setSipReturn(Number(e.target.value))} style={{ width: '100%' }} /></div>
        <div><label>Inflation (%): </label><input type="number" value={inflationRate} onChange={(e) => setInflationRate(Number(e.target.value))} style={{ width: '100%' }} /></div>
        <div><label>Tenure (Years): </label><input type="number" value={tenureYears} onChange={(e) => setTenureYears(Number(e.target.value))} style={{ width: '100%' }} /></div>
      </div>

      <div style={{ background: '#f4f4f4', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <strong>Monthly EMI / SIP Amount:</strong> {currencyFormatter(emi)}
      </div>

      <div style={{ height: '400px', width: '100%' }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottom', offset: -5 }} />
            <YAxis tickFormatter={(val) => `₹${val >= 100000 ? (val / 100000).toFixed(1) + 'L' : (val / 1000).toFixed(0) + 'k'}`} />
            <Tooltip formatter={(value) => currencyFormatter(value)} />
            <Legend />
            <Line type="monotone" dataKey="debtBalance" name="Remaining Debt" stroke="#ff7300" strokeWidth={2} />
            <Line type="monotone" dataKey="investmentCorpus" name="Investment Corpus" stroke="#8884d8" strokeWidth={2} />
            <Line type="monotone" dataKey="realValueDebt" name="Real Value of Debt" stroke="#28a745" strokeDasharray="3 3" strokeWidth={2} />
            <Line type="monotone" dataKey="realValueCorpus" name="Real Value of Corpus" stroke="#007bff" strokeDasharray="3 3" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default App;