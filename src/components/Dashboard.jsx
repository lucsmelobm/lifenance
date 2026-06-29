import { useMemo } from "react";
import { useTheme } from "../context/ThemeContext";
import { storage, formatCurrency, thisMonth } from "../utils/storage";
import { CATEGORIES } from "../data/tips";

function Blob() {
  return (
    <div style={{ position: "relative", width: 290, height: 190, margin: "0 auto", filter: "drop-shadow(0 24px 48px rgba(100,210,180,0.28))" }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(135deg, #A8E063 0%, #56CCF2 55%, #2D9EE0 100%)",
        borderRadius: "58% 42% 65% 35% / 52% 62% 38% 48%",
        opacity: 0.92,
      }} />
      <div style={{
        position: "absolute",
        top: -12, right: -8,
        width: 180, height: 145,
        background: "linear-gradient(135deg, #2F80ED 0%, #6FCFEB 100%)",
        borderRadius: "42% 58% 32% 68% / 58% 38% 62% 42%",
        opacity: 0.55,
      }} />
      <div style={{
        position: "absolute",
        bottom: -4, left: 24,
        width: 110, height: 88,
        background: "linear-gradient(135deg, #C5F135 0%, #56D0A0 100%)",
        borderRadius: "50% 50% 38% 62% / 62% 44% 56% 38%",
        opacity: 0.48,
      }} />
    </div>
  );
}

function SunIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    </svg>
  );
}

export default function Dashboard({ onAdd, onViewAll }) {
  const { dark, toggle } = useTheme();
  const profile  = storage.getProfile();
  const expenses = storage.getExpenses();
  const month    = thisMonth();

  const monthExpenses = useMemo(
    () => expenses.filter((e) => e.date.startsWith(month)).sort((a, b) => b.date.localeCompare(a.date)),
    [expenses, month]
  );
  const totalSpent = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const available  = profile.income - totalSpent;
  const recentFive = useMemo(
    () => [...expenses].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id).slice(0, 5),
    [expenses]
  );

  const getCat = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES.at(-1);

  return (
    <div style={{ minHeight: "100svh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>

      {/* ── TOP ZONE ── */}
      <div style={{ padding: "56px 24px 0", flexShrink: 0 }}>

        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18,
            }}>
              👤
            </div>
            <div>
              <p style={{ fontSize: 12, color: "var(--text-2)", margin: 0 }}>Bem-vindo de volta</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)", margin: 0 }}>{profile.name}</p>
            </div>
          </div>
          <button
            onClick={toggle}
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              width: 40, height: 40,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-2)",
            }}
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>

        {/* Balance caption */}
        <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-2)", marginBottom: 8, lineHeight: 1.4 }}>
          Você gastou{" "}
          <span style={{ color: "var(--red)", fontWeight: 600 }}>{formatCurrency(totalSpent)}</span>
          {" "}este mês • saldo disponível
        </p>

        {/* Big balance */}
        <p style={{
          textAlign: "center",
          fontSize: available < 0 ? 40 : 52,
          fontWeight: 800,
          letterSpacing: "-2px",
          color: available < 0 ? "var(--red)" : "var(--text-1)",
          lineHeight: 1.05,
          marginBottom: 20,
        }}>
          {formatCurrency(available)}
        </p>

        {/* Blob */}
        <Blob />
      </div>

      {/* ── BOTTOM PANEL ── */}
      <div style={{
        flex: 1,
        background: "var(--surface)",
        borderRadius: "28px 28px 0 0",
        borderTop: "1px solid var(--border)",
        padding: "24px 20px 16px",
        marginTop: 12,
        overflowY: "auto",
      }} className="no-scrollbar">

        {/* Panel header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", margin: 0 }}>
            Transações Recentes
          </p>
          <button
            onClick={onViewAll}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 600,
              color: "var(--accent-fg)",
              background: "var(--accent)",
              padding: "5px 12px",
              borderRadius: 999,
              letterSpacing: "-0.2px",
            }}
          >
            Ver todas →
          </button>
        </div>

        {/* Transaction list */}
        {recentFive.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ fontSize: 40, margin: "0 0 12px" }}>💸</p>
            <p style={{ color: "var(--text-2)", fontWeight: 500, margin: "0 0 4px" }}>Nenhum gasto ainda</p>
            <p style={{ color: "var(--text-3)", fontSize: 13, margin: 0 }}>Toca em "Lançar" para começar</p>
          </div>
        ) : (
          recentFive.map((e, i) => {
            const cat = getCat(e.category);
            return (
              <div
                key={e.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "14px 0",
                  borderBottom: i < recentFive.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <div style={{
                  width: 46, height: 46, borderRadius: 14,
                  background: cat.color + "22",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, flexShrink: 0, marginRight: 14,
                }}>
                  {cat.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--text-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {e.description}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>
                    {cat.label} • {e.date.split("-").reverse().join("/")}
                  </p>
                </div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--red)", flexShrink: 0, marginLeft: 8 }}>
                  -{formatCurrency(e.amount)}
                </p>
              </div>
            );
          })
        )}

        {/* Quick stats */}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <div style={{
            flex: 1, background: "var(--surface-2)",
            borderRadius: 16, padding: "14px 16px",
            border: "1px solid var(--border)",
          }}>
            <p style={{ margin: "0 0 4px", fontSize: 11, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: 0.5 }}>Renda</p>
            <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--green)" }}>{formatCurrency(profile.income)}</p>
          </div>
          <div style={{
            flex: 1, background: "var(--surface-2)",
            borderRadius: 16, padding: "14px 16px",
            border: "1px solid var(--border)",
          }}>
            <p style={{ margin: "0 0 4px", fontSize: 11, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: 0.5 }}>Gastos</p>
            <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--red)" }}>{formatCurrency(totalSpent)}</p>
          </div>
          <div style={{
            flex: 1, background: "var(--surface-2)",
            borderRadius: 16, padding: "14px 16px",
            border: "1px solid var(--border)",
          }}>
            <p style={{ margin: "0 0 4px", fontSize: 11, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: 0.5 }}>Meta</p>
            <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--text-1)" }}>
              {profile.savingGoalPct}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
