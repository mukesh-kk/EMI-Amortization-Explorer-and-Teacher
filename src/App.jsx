import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import EMI from "./EMI";
import RealReturns from "./RealReturns";
import Init from './InitailCapitalMatters';
import DebtCost from './DebtCost';

// -- Styles --
const styles = {
  nav: {
    display: "flex",
    gap: "20px",
    padding: "1rem",
    borderBottom: "1px solid #eaeaea",
    backgroundColor: "#f9f9f9",
  },
  link: {
    textDecoration: "none",
    color: "#666",
    fontWeight: "600",
    padding: "8px 12px",
    borderRadius: "4px",
  },
  activeLink: {
    color: "#007bff",
    backgroundColor: "#e7f1ff",
  },
  main: {
    padding: "2rem",
    maxWidth: "1000px",
    margin: "0 auto",
  }
};

export default function App() {
  // Helper to handle active styling
  const getLinkStyle = ({ isActive }) => ({
    ...styles.link,
    ...(isActive ? styles.activeLink : {}),
  });

  return (
    <BrowserRouter>
      <nav style={styles.nav}>
        <NavLink to="/emi" style={getLinkStyle}>Amortization Law</NavLink>
        <NavLink to="/real-returns" style={getLinkStyle}>Real Returns: Fischer Law</NavLink>
        <NavLink to="/init" style={getLinkStyle}>Initial Capital Matters</NavLink>
        <NavLink to="/debt-cost" style={getLinkStyle}>Debt Cost</NavLink>
      </nav>

      <main style={styles.main}>
        <Routes>
          <Route path="/emi" element={<EMI />} />
          <Route path="/real-returns" element={<RealReturns />} />
          <Route path="/init" element={<Init />} />
          <Route path="/debt-cost" element={<DebtCost />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}