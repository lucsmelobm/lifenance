import { useState, useCallback } from "react";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import Dashboard from "./components/Dashboard";
import Expenses from "./components/Expenses";
import Goals from "./components/Goals";
import Daily from "./components/Daily";
import Settings from "./components/Settings";
import AddExpense from "./components/AddExpense";
import "./App.css";

function HomeIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
      <path d="M9 21V12h6v9"/>
    </svg>
  );
}
function GoalsIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  );
}
function DailyIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  );
}

const NAV = [
  { id: "home",     Icon: HomeIcon,     label: "Início" },
  { id: "goals",    Icon: GoalsIcon,    label: "Metas"  },
  null,
  { id: "daily",    Icon: DailyIcon,    label: "Diário" },
  { id: "settings", Icon: SettingsIcon, label: "Config" },
];

function AppInner() {
  const { dark } = useTheme();
  const [tab, setTab]       = useState("home");
  const [showAdd, setShowAdd] = useState(false);
  const [tick, setTick]     = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const s = {
    root: {
      minHeight: "100svh",
      background: "var(--bg)",
      display: "flex",
      flexDirection: "column",
      maxWidth: 430,
      margin: "0 auto",
      position: "relative",
    },
    content: {
      flex: 1,
      overflowY: "auto",
      paddingBottom: 88,
    },
    nav: {
      position: "fixed",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "100%",
      maxWidth: 430,
      background: "var(--nav-bg)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      borderTop: "1px solid var(--border)",
      padding: "10px 8px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-around",
      zIndex: 50,
    },
  };

  return (
    <div style={s.root}>
      <div style={s.content} className="no-scrollbar">
        {tab === "home"     && <Dashboard  key={`h-${tick}`} onAdd={() => setShowAdd(true)} onViewAll={() => setTab("expenses")} onViewGoals={() => setTab("goals")} />}
        {tab === "expenses" && <Expenses   key={`e-${tick}`} onUpdate={refresh} onBack={() => setTab("home")} />}
        {tab === "goals"    && <Goals      key={`g-${tick}`} onUpdate={refresh} />}
        {tab === "daily"    && <Daily      key={`d-${tick}`} onUpdate={refresh} />}
        {tab === "settings" && <Settings   key={`s-${tick}`} onUpdate={refresh} />}
      </div>

      <nav style={s.nav}>
        {NAV.map((item, i) => {
          if (!item) {
            return (
              <button
                key="add"
                onClick={() => setShowAdd(true)}
                style={{
                  background: "var(--accent)",
                  color: "var(--accent-fg)",
                  border: "none",
                  borderRadius: 999,
                  padding: "12px 22px",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  boxShadow: `0 4px 24px var(--shadow-accent)`,
                  transform: "translateY(-10px)",
                  letterSpacing: "-0.2px",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ fontSize: 20, lineHeight: 1, marginTop: -1 }}>+</span>
                Lançar
              </button>
            );
          }

          const { id, Icon, label } = item;
          const active = tab === id;

          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                padding: "4px 10px",
                color: active ? "var(--text-1)" : "var(--text-2)",
                transition: "color 0.2s",
              }}
            >
              <Icon />
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{label}</span>
              {active && (
                <span style={{
                  width: 4, height: 4,
                  borderRadius: "50%",
                  background: "var(--accent)",
                  marginTop: -2,
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {showAdd && (
        <AddExpense onClose={() => { setShowAdd(false); refresh(); }} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
