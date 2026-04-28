import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const App = () => {
  const [totalPrincipal, setTotalPrincipal] = useState(100000); // 1 Cr
  const [years, setYears] = useState(20);
  const [annualReturn, setAnnualReturn] = useState(22); // 12% standard assumption

  const chartData = useMemo(() => {
    const data = [];
    const R = annualReturn / 100;
    const monthlyRate = R / 12;
    const totalMonths = years * 12;
    const monthlyInstallment = totalPrincipal / totalMonths;

    for (let year = 0; year <= years; year++) {
      const monthsElapsed = year * 12;
      
      // Lump Sum Calculation: P * (1 + R)^t
      const lumpSumValue = Math.round(totalPrincipal * Math.pow(1 + R, year));

      // SIP Calculation (Future Value of Annuity)
      // FV = PMT * [((1 + r)^n - 1) / r] * (1 + r)
      // Where n = months elapsed
      let sipValue = 0;
      if (monthsElapsed > 0) {
        sipValue = Math.round(monthlyInstallment * ((Math.pow(1 + monthlyRate, monthsElapsed) - 1) / monthlyRate) * (1 + monthlyRate));
      }

      data.push({
        year,
        "Lump Sum": lumpSumValue,
        "Installments (SIP)": sipValue,
      });
    }
    return data;
  }, [totalPrincipal, years, annualReturn]);

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', color: '#2563eb' }}>Lump Sum vs. Installments</h1>

      {/* Controls */}
      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <div>
          <label><strong>Total Principal (₹)</strong></label>
          <input type="number" value={totalPrincipal} onChange={(e) => setTotalPrincipal(Number(e.target.value))} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        </div>
        <div>
          <label><strong>Duration (Years): {years}</strong></label>
          <input type="range" min="1" max="40" value={years} onChange={(e) => setYears(Number(e.target.value))} style={{ width: '100%', marginTop: '5px' }} />
        </div>
        <div>
          <label><strong>Expected Return (%): {annualReturn}</strong></label>
          <input type="range" min="1" max="25" step="0.5" value={annualReturn} onChange={(e) => setAnnualReturn(Number(e.target.value))} style={{ width: '100%', marginTop: '5px' }} />
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: '450px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
            <YAxis tickFormatter={(val) => `₹${(val / 1000000).toFixed(1)}M`} />
            <Tooltip formatter={(val) => `₹${val.toLocaleString()}`} />
            <Legend />
            <Line type="monotone" dataKey="Lump Sum" stroke="#2563eb" strokeWidth={3} />
            <Line type="monotone" dataKey="Installments (SIP)" stroke="#16a34a" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <p style={{ fontSize: '0.85em', color: '#64748b', textAlign: 'center', marginTop: '10px' }}>
        *Note: "Installments" assumes the remainder of your principal is held in cash and deployed monthly over the duration.
      </p>
    <div><svg width="100%" height="60" viewBox="0 0 500 60">
    <text x="10" y="35" fontSize="20" fill="#E8EAF4" fontFamily="monospace">
      (SIP returns) M = P x ((1 + r)^n - 1) /r x (1 + r)
    </text>
    </svg>
    </div>
    <div>
        <svg width="100%" height="60" viewBox="0 0 420 60">
        
    <text x="10" y="35" fontSize="20" fill="#E8EAF4" fontFamily="monospace">
     (Lump sum ) M=P x (1 + r)^n
    </text>
  </svg>
    </div>
    </div>
  )
};

export default App;