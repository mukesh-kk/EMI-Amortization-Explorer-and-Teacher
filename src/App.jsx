import { useState, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

const CORAL   = "#E8633A";
const TEAL    = "#2CC99A";
const AMBER   = "#F5A623";
const BG      = "#0F1117";
const SURFACE = "#181C27";
const CARD    = "#1E2336";
const BORDER  = "#2A3050";
const MUTED   = "#6B7599";
const TEXT    = "#E8EAF4";

const fmt = (n) =>
  n >= 1e7
    ? "₹" + (n / 1e7).toFixed(2) + " Cr"
    : n >= 1e5
    ? "₹" + (n / 1e5).toFixed(2) + " L"
    : "₹" + Math.round(n).toLocaleString("en-IN");

const fmtEMI = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

function calcAmort(P, annualR, years) {
  const R = annualR / 12 / 100;
  const N = years * 12;
  const pow = Math.pow(1 + R, N);
  const EMI = (P * R * pow) / (pow - 1);
  let bal = P;
  const months = [];
  for (let i = 1; i <= N; i++) {
    const interest  = bal * R;
    const principal = EMI - interest;
    bal = Math.max(0, bal - principal);
    months.push({ month: i, interest, principal, pct: (interest / EMI) * 100, balance: bal });
  }
  return { EMI, months, N };
}

function sample(arr, maxPts = 60) {
  if (arr.length <= maxPts) return arr;
  const step = Math.floor(arr.length / maxPts);
  return arr.filter((_, i) => i % step === 0).slice(0, maxPts);
}

function Slider({ label, id, min, max, step, value, onChange, display }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <label style={{ fontSize: 12, color: MUTED, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {label}
        </label>
        <span style={{ fontSize: 14, fontWeight: 600, color: AMBER, fontFamily: "'DM Mono', monospace" }}>
          {display}
        </span>
      </div>
      <input
        type="range" id={id} min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: AMBER, cursor: "pointer" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
        <span style={{ fontSize: 10, color: BORDER }}>{min}</span>
        <span style={{ fontSize: 10, color: BORDER }}>{max}</span>
      </div>
    </div>
  );
}

function MetricCard({ label, value, accent, sub }) {
  return (
    <div style={{
      background: CARD, border: `1px solid ${BORDER}`,
      borderRadius: 12, padding: "16px 20px",
      borderTop: `3px solid ${accent}`
    }}>
      <p style={{ fontSize: 11, color: MUTED, margin: "0 0 6px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        {label}
      </p>
      <p style={{ fontSize: 22, fontWeight: 700, margin: 0, color: TEXT, fontFamily: "'DM Mono', monospace" }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: 11, color: MUTED, margin: "4px 0 0" }}>{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#252A3D", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 14px" }}>
      <p style={{ fontSize: 11, color: MUTED, margin: "0 0 6px" }}>Month {label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: 13, color: p.color, margin: "2px 0", fontFamily: "'DM Mono', monospace" }}>
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

const PctTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#252A3D", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 14px" }}>
      <p style={{ fontSize: 11, color: MUTED, margin: "0 0 4px" }}>Month {label}</p>
      <p style={{ fontSize: 13, color: CORAL, margin: 0, fontFamily: "'DM Mono', monospace" }}>
        Interest: {Number(payload[0]?.value).toFixed(1)}%
      </p>
      <p style={{ fontSize: 13, color: TEAL, margin: 0, fontFamily: "'DM Mono', monospace" }}>
        Principal: {(100 - payload[0]?.value).toFixed(1)}%
      </p>
    </div>
  );
};

function FormulaSection({ P, R, N, EMI }) {
  const r = (R / 12 / 100).toFixed(5);
  const pow = Math.pow(1 + R / 12 / 100, N).toFixed(3);

  const rules = [
    {
      title: "The Front-load Trap",
      icon: "⚠",
      color: CORAL,
      body: "In the first 1/3 of your tenure, ~70–80% of every EMI is pure interest. You're renting money, not owning more home.",
    },
    {
      title: "Rule of 72 (Debt Edition)",
      icon: "72",
      color: AMBER,
      body: `At ${R}% p.a., your unpaid interest doubles in ≈ ${(72 / R).toFixed(1)} years if you miss payments. Never skip an EMI.`,
    },
    {
      title: "Prepay in Year 1–5",
      icon: "↓",
      color: TEAL,
      body: "₹1 prepaid in Year 1 saves ~3–4× more interest than ₹1 prepaid in Year 15. Time of prepayment is as critical as amount.",
    },
    {
      title: "1% Rate Drop = Big Saving",
      icon: "1%",
      color: "#9B8FFF",
      body: "A 1% reduction in rate on a ₹2Cr 20yr loan saves ≈ ₹27–30L in total interest. Always negotiate your rate.",
    },
    {
      title: "Tenure vs EMI Trade-off",
      icon: "⇄",
      color: "#5BC4F0",
      body: "Adding 5 yrs to tenure reduces EMI by ~12% but increases total interest by ~35–40%. Shorter tenure is always cheaper.",
    },
    {
      title: "Tenure vs EMI Trade-off",
      icon: "⇄",
      color: "#5BC4F0",
      body: "Long tenure = comfort now, pain  in the ass later",
    }
  ];

  return (
    <div style={{ marginTop: 32 }}>

      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 14px" }}>
          EMI Formula
        </p>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "18px 22px" }}>
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: 14, color: AMBER,
            textAlign: "center", lineHeight: 2.2, letterSpacing: "0.03em"
          }}>
            <div style={{ fontSize: 16, color: TEXT, marginBottom: 8 }}>
              EMI = <span style={{ color: AMBER }}>P × R × (1 + R)ᴺ</span>
              <span style={{ color: MUTED }}> / </span>
              <span style={{ color: TEAL }}>(1 + R)ᴺ − 1</span>
            </div>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 14
            }}>
              {[
                { sym: "P", val: fmt(P * 1e5), lbl: "Principal" },
                { sym: "R", val: r, lbl: "Monthly rate" },
                { sym: "N", val: N, lbl: "No. of months" },
              ].map(x => (
                <div key={x.sym} style={{
                  background: SURFACE, borderRadius: 8, padding: "10px 12px",
                  border: `1px solid ${BORDER}`
                }}>
                  <div style={{ fontSize: 18, color: AMBER, fontWeight: 700 }}>{x.sym}</div>
                  <div style={{ fontSize: 12, color: TEXT, marginTop: 2 }}>{x.val}</div>
                  <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>{x.lbl}</div>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: 14, background: SURFACE, borderRadius: 8,
              padding: "12px 16px", border: `1px solid ${BORDER}`, textAlign: "center"
            }}>
              <span style={{ fontSize: 11, color: MUTED }}>Solving → </span>
              <span style={{ fontSize: 16, color: TEAL, fontWeight: 700 }}>EMI = {fmtEMI(EMI)} / month</span>
            </div>
          </div>
        </div>
      </div>

      <p style={{ fontSize: 11, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 12px" }}>
        Rules of thumb — the amortization trap
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {rules.map((r, i) => (
          <div
            key={i}
            style={{
              background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10,
              padding: "14px 16px", borderLeft: `3px solid ${r.color}`,
              gridColumn: i === 4 ? "1 / -1" : "auto"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, color: r.color,
                background: r.color + "22", borderRadius: 5,
                padding: "2px 7px", fontFamily: "'DM Mono', monospace"
              }}>
                {r.icon}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{r.title}</span>
            </div>
            <p style={{ fontSize: 12, color: MUTED, margin: 0, lineHeight: 1.6 }}>{r.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [principal, setPrincipal] = useState(200);
  const [rate, setRate]           = useState(8.7);
  const [years, setYears]         = useState(20);
  const [view, setView]           = useState("stacked");

  const { EMI, months, N } = useMemo(
    () => calcAmort(principal * 1e5, rate, years),
    [principal, rate, years]
  );

  const totalInterest  = useMemo(() => months.reduce((s, m) => s + m.interest, 0), [months]);
  const totalPrincipal = principal * 1e5;
  const breakeven      = months.findIndex(m => m.principal >= m.interest);
  const sampled        = useMemo(() => sample(months, 60), [months]);

  const chartData = sampled.map(m => ({
    month:     m.month,
    Interest:  Math.round(m.interest),
    Principal: Math.round(m.principal),
    pct:       parseFloat(m.pct.toFixed(1)),
  }));

  const tickFmt = (v) =>
    v >= 1e5 ? `${(v / 1e5).toFixed(0)}L` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v;

  return (
    <div style={{ background: BG, minHeight: "100vh", color: TEXT, fontFamily: "'DM Sans', sans-serif", padding: "0 0 60px" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;600&display=swap" rel="stylesheet" />

      <div style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, padding: "18px 28px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `linear-gradient(135deg, ${CORAL}, ${AMBER})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "'DM Mono', monospace"
        }}>₹</div>
        <div>
          <h1 style={{ fontSize: 17, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>EMI Amortization Explorer</h1>
          <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>Interest vs Principal skewness visualizer</p>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}>

          <div>
            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
              <p style={{ fontSize: 11, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 18px" }}>
                Loan Parameters
              </p>
              <Slider label="Principal (₹ Lakhs)" id="p" min={10} max={500} step={5}
                value={principal} onChange={setPrincipal}
                display={principal >= 100 ? `${(principal / 100).toFixed(2)} Cr` : `${principal} L`}
              />
              <Slider label="Interest Rate (% p.a.)" id="r" min={6} max={15} step={0.1}
                value={rate} onChange={setRate} display={`${rate.toFixed(1)}%`}
              />
              <Slider label="Tenure (Years)" id="t" min={5} max={30} step={1}
                value={years} onChange={setYears} display={`${years} yrs`}
              />
            </div>

            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20 }}>
              <p style={{ fontSize: 11, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 14px" }}>
                Composition
              </p>
              {[
                { label: "Total Principal", val: totalPrincipal, color: TEAL },
                { label: "Total Interest", val: totalInterest, color: CORAL },
                { label: "Total Outflow", val: totalPrincipal + totalInterest, color: AMBER },
              ].map(x => (
                <div key={x.label} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: MUTED }}>{x.label}</span>
                    <span style={{ fontSize: 13, color: x.color, fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>
                      {fmt(x.val)}
                    </span>
                  </div>
                  <div style={{ background: BORDER, borderRadius: 4, height: 4 }}>
                    <div style={{
                      background: x.color, borderRadius: 4, height: 4,
                      width: `${Math.min(100, (x.val / (totalPrincipal + totalInterest)) * 100)}%`,
                      transition: "width 0.4s ease"
                    }} />
                  </div>
                </div>
              ))}
              <div style={{
                marginTop: 16, background: CARD, borderRadius: 8,
                padding: "10px 12px", border: `1px solid ${BORDER}`
              }}>
                <p style={{ fontSize: 11, color: MUTED, margin: "0 0 2px" }}>Interest-to-Principal ratio</p>
                <p style={{ fontSize: 18, fontWeight: 700, margin: 0, color: CORAL, fontFamily: "'DM Mono', monospace" }}>
                  {(totalInterest / totalPrincipal).toFixed(2)}×
                </p>
                <p style={{ fontSize: 11, color: MUTED, margin: "3px 0 0" }}>
                  You pay {((totalInterest / totalPrincipal) * 100).toFixed(0)}% extra as interest
                </p>
              </div>
            </div>
          </div>

          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
              <MetricCard label="Monthly EMI" value={fmtEMI(EMI)} accent={AMBER}
                sub={`${years * 12} total payments`} />
              <MetricCard label="Total Interest" value={fmt(totalInterest)} accent={CORAL}
                sub={`${((totalInterest / totalPrincipal) * 100).toFixed(0)}% of principal`} />
              <MetricCard
                label="Break-even Month"
                value={breakeven >= 0 ? `Month ${breakeven + 1}` : "N/A"}
                accent={TEAL}
                sub={breakeven >= 0 ? `Year ${Math.ceil((breakeven + 1) / 12)} of ${years}` : ""}
              />
            </div>

            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <p style={{ fontSize: 11, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
                  EMI Breakdown over time
                </p>
                <div style={{ display: "flex", gap: 6 }}>
                  {[["stacked", "Stacked"], ["pct", "% Split"]].map(([k, l]) => (
                    <button key={k} onClick={() => setView(k)} style={{
                      fontSize: 11, padding: "4px 10px", borderRadius: 6, cursor: "pointer",
                      border: `1px solid ${view === k ? AMBER : BORDER}`,
                      background: view === k ? AMBER + "22" : "transparent",
                      color: view === k ? AMBER : MUTED, transition: "all 0.2s"
                    }}>{l}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 16, marginBottom: 10, fontSize: 12 }}>
                {[["Interest", CORAL], ["Principal", TEAL]].map(([name, color]) => (
                  <span key={name} style={{ display: "flex", alignItems: "center", gap: 5, color: MUTED }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: "inline-block" }} />
                    {name}
                  </span>
                ))}
              </div>

              {view === "stacked" ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                    <XAxis dataKey="month" tick={{ fill: MUTED, fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={tickFmt} tick={{ fill: MUTED, fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="Interest"  stackId="1" stroke={CORAL} fill={CORAL} fillOpacity={0.7} />
                    <Area type="monotone" dataKey="Principal" stackId="1" stroke={TEAL}  fill={TEAL}  fillOpacity={0.7} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                    <XAxis dataKey="month" tick={{ fill: MUTED, fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fill: MUTED, fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip content={<PctTooltip />} />
                    <Area type="monotone" dataKey="pct" stroke={CORAL} fill={CORAL} fillOpacity={0.3}
                      name="Interest %" dot={false} />
                    <line x1="0%" y1="50%" x2="100%" y2="50%" stroke={BORDER} strokeDasharray="4 4" />
                  </AreaChart>
                </ResponsiveContainer>
              )}

              {breakeven >= 0 && (
                <div style={{
                  marginTop: 12, background: TEAL + "15", border: `1px solid ${TEAL}44`,
                  borderRadius: 8, padding: "8px 12px", fontSize: 12, color: TEAL
                }}>
                  ✓ Principal overtakes interest at <strong>Month {breakeven + 1}</strong> (Year {Math.ceil((breakeven + 1) / 12)}).
                  Before this, every EMI is &gt;50% interest.
                </div>
              )}
            </div>
          </div>
        </div>

        <FormulaSection P={principal} R={rate} N={N} EMI={EMI} />
      </div>
    </div>
  );
}