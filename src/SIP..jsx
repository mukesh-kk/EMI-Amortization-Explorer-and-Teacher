import { useState, useEffect, useRef } from "react";

const INFLATION_RATE = 0.06;

function formatINR(n) {
  if (n >= 1e7) return "₹" + (n / 1e7).toFixed(2) + " Cr";
  if (n >= 1e5) return "₹" + (n / 1e5).toFixed(2) + " L";
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

function SliderField({ label, id, min, max, step, value, onChange, display }) {
  return (
    <div style={styles.field}>
      <div style={styles.fieldRow}>
        <label htmlFor={id} style={styles.label}>{label}</label>
        <input
          style={styles.valueInput}
          type="text"
          value={display}
          onChange={(e) => {
            const raw = parseFloat(e.target.value.replace(/[₹,% a-zA-Z]/g, ""));
            if (!isNaN(raw)) onChange(Math.min(Math.max(raw, min), max));
          }}
        />
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={styles.slider}
      />
      <div style={styles.sliderBounds}>
        <span>{typeof min === "number" && min >= 1000 ? formatINR(min) : min}</span>
        <span>{typeof max === "number" && max >= 1000 ? formatINR(max) : max}</span>
      </div>
    </div>
  );
}

function MetricCard({ label, value, color }) {
  return (
    <div style={styles.metricCard}>
      <div style={styles.metricLabel}>{label}</div>
      <div style={{ ...styles.metricValue, color: color || "#1a1a2e" }}>{value}</div>
    </div>
  );
}

function DonutChart({ invested, returns }) {
  const canvasRef = useRef(null);
  const total = invested + returns;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 10;
    const innerRadius = radius * 0.65;

    ctx.clearRect(0, 0, size, size);

    const slices = [
      { value: invested, color: "#00b386" },
      { value: returns,  color: "#185fa5" },
    ];

    let startAngle = -Math.PI / 2;
    slices.forEach(({ value, color }) => {
      const sweep = (value / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + sweep);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      startAngle += sweep;
    });

    // Donut hole
    ctx.beginPath();
    ctx.arc(cx, cy, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = "#fff";
    ctx.fill();
  }, [invested, returns, total]);

  return (
    <div style={styles.chartWrap}>
      <canvas ref={canvasRef} width={180} height={180} aria-label="Donut chart of invested vs returns" />
      <div style={styles.donutCenter}>
        <div style={styles.donutLabel}>total value</div>
        <div style={styles.donutValue}>{formatINR(total)}</div>
      </div>
    </div>
  );
}

export default function SIPCalculator() {
  const [mode, setMode] = useState("sip");

  // SIP state
  const [sipAmount, setSipAmount] = useState(10000);
  const [sipRate,   setSipRate]   = useState(12);
  const [sipYears,  setSipYears]  = useState(15);

  // Lump sum state
  const [lumpAmount, setLumpAmount] = useState(100000);
  const [lumpRate,   setLumpRate]   = useState(12);
  const [lumpYears,  setLumpYears]  = useState(15);

  const calculate = () => {
    let invested, total, years;
    if (mode === "sip") {
      years = sipYears;
      const n = years * 12;
      const r = sipRate / 100 / 12;
      total    = sipAmount * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
      invested = sipAmount * n;
    } else {
      years = lumpYears;
      total    = lumpAmount * Math.pow(1 + lumpRate / 100, years);
      invested = lumpAmount;
    }
    const returns = total - invested;
    const pv      = total / Math.pow(1 + INFLATION_RATE, years);
    return { invested, returns, total, pv, years };
  };

  const { invested, returns, total, pv, years } = calculate();

  return (
    <div style={styles.wrapper}>
      {/* Tabs */}
      <div style={styles.tabs}>
        {["sip", "lump"].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{ ...styles.tab, ...(mode === m ? styles.tabActive : {}) }}
          >
            {m === "sip" ? "SIP" : "Lump sum"}
          </button>
        ))}
      </div>

      <div style={styles.grid}>
        {/* Left — inputs */}
        <div style={styles.card}>
          {mode === "sip" ? (
            <>
              <SliderField
                label="Monthly investment"
                id="sip-amount"
                min={500} max={200000} step={500}
                value={sipAmount}
                onChange={setSipAmount}
                display={"₹" + Math.round(sipAmount).toLocaleString("en-IN")}
              />
              <SliderField
                label="Expected return (p.a.)"
                id="sip-rate"
                min={1} max={30} step={0.5}
                value={sipRate}
                onChange={setSipRate}
                display={sipRate + "%"}
              />
              <SliderField
                label="Time period"
                id="sip-years"
                min={1} max={40} step={1}
                value={sipYears}
                onChange={setSipYears}
                display={sipYears + " yr"}
              />
            </>
          ) : (
            <>
              <SliderField
                label="Investment amount"
                id="lump-amount"
                min={5000} max={10000000} step={5000}
                value={lumpAmount}
                onChange={setLumpAmount}
                display={"₹" + Math.round(lumpAmount).toLocaleString("en-IN")}
              />
              <SliderField
                label="Expected return (p.a.)"
                id="lump-rate"
                min={1} max={30} step={0.5}
                value={lumpRate}
                onChange={setLumpRate}
                display={lumpRate + "%"}
              />
              <SliderField
                label="Time period"
                id="lump-years"
                min={1} max={40} step={1}
                value={lumpYears}
                onChange={setLumpYears}
                display={lumpYears + " yr"}
              />
            </>
          )}
        </div>

        {/* Right — results */}
        <div style={styles.card}>
          <DonutChart invested={invested} returns={returns} />

          {/* Legend */}
          <div style={styles.legend}>
            <span style={styles.legendItem}>
              <span style={{ ...styles.legendDot, background: "#00b386" }} />
              Invested
            </span>
            <span style={styles.legendItem}>
              <span style={{ ...styles.legendDot, background: "#185fa5" }} />
              Est. returns
            </span>
          </div>

          <MetricCard label="Invested amount" value={formatINR(invested)} color="#00b386" />
          <MetricCard label="Est. returns"    value={formatINR(returns)}  color="#185fa5" />
          <MetricCard label="Total corpus"    value={formatINR(total)} />

          {/* Inflation adjusted PV */}
          <div style={styles.inflationCard}>
            <div style={styles.inflationLabel}>Real value today (6% inflation)</div>
            <div style={styles.inflationValue}>{formatINR(pv)}</div>
            <div style={styles.inflationSub}>
              ₹1 today = ₹{Math.pow(1.06, years).toFixed(2)} after {years} yr
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    maxWidth: 780,
    margin: "0 auto",
    padding: "1.5rem 1rem",
  },
  tabs: {
    display: "flex",
    border: "1px solid #e0e0e0",
    borderRadius: 12,
    overflow: "hidden",
    width: "fit-content",
    marginBottom: "1.5rem",
  },
  tab: {
    padding: "8px 28px",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    background: "transparent",
    border: "none",
    color: "#6b7280",
    transition: "all 0.15s",
  },
  tabActive: {
    background: "#1a1a2e",
    color: "#ffffff",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1.25rem",
  },
  card: {
    background: "#ffffff",
    border: "1px solid #f0f0f0",
    borderRadius: 12,
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  field: {
    marginBottom: "0.75rem",
  },
  fieldRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    color: "#6b7280",
  },
  valueInput: {
    fontSize: 13,
    fontWeight: 500,
    color: "#1a1a2e",
    background: "#f5f6fa",
    border: "1px solid #e0e0e0",
    borderRadius: 6,
    padding: "3px 10px",
    width: 100,
    textAlign: "right",
    outline: "none",
  },
  slider: {
    width: "100%",
    accentColor: "#00b386",
    cursor: "pointer",
  },
  sliderBounds: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 3,
  },
  chartWrap: {
    position: "relative",
    width: 180,
    height: 180,
    margin: "0 auto 0.5rem",
  },
  donutCenter: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    textAlign: "center",
    pointerEvents: "none",
  },
  donutLabel: {
    fontSize: 10,
    color: "#9ca3af",
  },
  donutValue: {
    fontSize: 13,
    fontWeight: 600,
    color: "#1a1a2e",
  },
  legend: {
    display: "flex",
    gap: 16,
    justifyContent: "center",
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
    display: "inline-block",
    flexShrink: 0,
  },
  metricCard: {
    background: "#f5f6fa",
    borderRadius: 8,
    padding: "10px 14px",
  },
  metricLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 19,
    fontWeight: 600,
    color: "#1a1a2e",
  },
  inflationCard: {
    background: "#fff5f0",
    borderRadius: 8,
    padding: "10px 14px",
    borderLeft: "3px solid #e25c2e",
  },
  inflationLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2,
  },
  inflationValue: {
    fontSize: 19,
    fontWeight: 600,
    color: "#c04a22",
  },
  inflationSub: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 3,
  },
};