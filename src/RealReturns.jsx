import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const App = () => {
  // Added state for initial investment
  const [initialInvestment, setInitialInvestment] = useState(10000);
  const [nominalRate, setNominalRate] = useState(8);
  const [inflationRate, setInflationRate] = useState(3);
  const years = 20;

  // Calculate the exact Real Return (r)
  const realRate = useMemo(() => {
    const R = nominalRate / 100;
    const i = inflationRate / 100;
    const r = ((1 + R) / (1 + i)) - 1;
    return r * 100;
  }, [nominalRate, inflationRate]);

  // Generate data points for the line graph
  // Added initialInvestment to dependency array
  const chartData = useMemo(() => {
    const data = [];
    const R = nominalRate / 100;
    const r = realRate / 100;

    for (let year = 0; year <= years; year++) {
      data.push({
        year: year,
        Nominal: Math.round(initialInvestment * Math.pow(1 + R, year)),
        Real: Math.round(initialInvestment * Math.pow(1 + r, year)),
      });
    }
    return data;
  }, [nominalRate, realRate, initialInvestment]);

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', color: '#fd7803' }}>
        Nominal vs. Real Returns
      </h1>
      
      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', background: '#f4f4f9', padding: '20px', borderRadius: '8px', marginBottom: '20px', gap: '15px' }}>
        
        {/* New Initial Investment Input */}
        <div style={{ width: '30%', minWidth: '200px' }}>
          <label><strong>Initial Investment ($)</strong></label>
          <input
            type="number"
            value={initialInvestment}
            onChange={(e) => setInitialInvestment(Number(e.target.value))}
            style={{ width: '100%', marginTop: '10px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ width: '30%', minWidth: '200px' }}>
          <label><strong>Nominal Return (R): {nominalRate}%</strong></label>
          <input
            type="range"
            min="0"
            max="20"
            step="0.5"
            value={nominalRate}
            onChange={(e) => setNominalRate(parseFloat(e.target.value))}
            style={{ width: '100%', marginTop: '10px' }}
          />
        </div>
        
        <div style={{ width: '30%', minWidth: '200px' }}>
          <label><strong>Inflation Rate (i): {inflationRate}%</strong></label>
          <input
            type="range"
            min="0"
            max="15"
            step="0.5"
            value={inflationRate}
            onChange={(e) => setInflationRate(parseFloat(e.target.value))}
            style={{ width: '100%', marginTop: '10px' }}
          />
        </div>
      </div>

      {/* Math Display */}
      <div style={{ background: '#eef2ff', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
        <p style={{ margin: '0 0 10px 0', fontSize: '1.1em' }}><strong>The Fisher Equation:</strong></p>
        <code style={{ fontSize: '1.2em', background: '#fff', padding: '5px 10px', borderRadius: '4px', color: "black" }}>
          r = ((1 + R) / (1 + i)) - 1
        </code>
        <br/>
        <code style={{ fontSize: '1.2em', background: '#fff', padding: '5px 10px', borderRadius: '4px', color: "black" }}>
          r = ((1 + {nominalRate / 100}) / (1 + {inflationRate / 100})) - 1
        </code>
        <p style={{ margin: '15px 0 0 0', fontSize: '1.2em', color: '#4338ca' }}>
          Exact Real Return (r): <strong>{realRate.toFixed(2)}%</strong>
        </p>
      </div>

      {/* Line Chart */}
      <div style={{ height: '400px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottomRight', offset: -5 }} />
            <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} width={80} />
            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            <Legend verticalAlign="top" height={36}/>
            <Line type="monotone" dataKey="Nominal" stroke="#8884d8" strokeWidth={3} name="Nominal Value" />
            <Line type="monotone" dataKey="Real" stroke="#82ca9d" strokeWidth={3} name="Real Value" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default App;