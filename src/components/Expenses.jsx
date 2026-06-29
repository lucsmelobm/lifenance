import { useState, useMemo } from "react";
import { storage, formatCurrency, thisMonth } from "../utils/storage";
import { CATEGORIES } from "../data/tips";

function BackIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7"/>
    </svg>
  );
}

const MONTH_NAMES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const labelMonth = (ym) => {
  const [y, m] = ym.split("-");
  return `${MONTH_NAMES[parseInt(m) - 1]}/${y.slice(2)}`;
};

export default function Expenses({ onUpdate, onBack }) {
  const [expenses, setExpenses] = useState(storage.getExpenses);
  const [filter, setFilter]     = useState(thisMonth);

  const save = (list) => { storage.saveExpenses(list); setExpenses(list); onUpdate?.(); };

  const handleDelete = (id) => {
    if (window.confirm("Apagar este gasto?")) save(expenses.filter((e) => e.id !== id));
  };

  const months = useMemo(() => {
    const set = new Set(expenses.map((e) => e.date.slice(0, 7)));
    const cur = thisMonth();
    if (!set.has(cur)) set.add(cur);
    return [...set].sort((a, b) => b.localeCompare(a)).slice(0, 8);
  }, [expenses]);

  const filtered = useMemo(
    () => expenses.filter((e) => e.date.startsWith(filter)).sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id),
    [expenses, filter]
  );
  const total = filtered.reduce((s, e) => s + e.amount, 0);
  const getCat = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES.at(-1);

  const byCategory = useMemo(() => {
    const map = {};
    filtered.forEach((e) => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return CATEGORIES.filter((c) => map[c.id]).map((c) => ({ ...c, total: map[c.id] })).sort((a, b) => b.total - a.total);
  }, [filtered]);

  return (
    <div style={{ minHeight: "100svh", background: "var(--bg)", paddingBottom: 24 }}>
      {/* Header */}
      <div style={{ padding: "56px 20px 20px", background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button onClick={onBack} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-1)", flexShrink: 0 }}>
            <BackIcon />
          </button>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--text-1)" }}>Todos os Gastos</p>
        </div>

        {/* Month tabs */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }} className="no-scrollbar">
          {months.map((m) => (
            <button
              key={m}
              onClick={() => setFilter(m)}
              style={{
                flexShrink: 0,
                background: filter === m ? "var(--accent)" : "var(--surface-2)",
                color: filter === m ? "var(--accent-fg)" : "var(--text-2)",
                border: filter === m ? "none" : "1px solid var(--border)",
                borderRadius: 999,
                padding: "7px 16px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {labelMonth(m)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 20px" }}>
        {/* Total */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "18px 20px", marginBottom: 16 }}>
          <p style={{ margin: "0 0 4px", fontSize: 12, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: 0.5 }}>Total no período</p>
          <p style={{ margin: 0, fontSize: 32, fontWeight: 800, color: "var(--red)", letterSpacing: "-1px" }}>{formatCurrency(total)}</p>
        </div>

        {/* By category */}
        {byCategory.length > 0 && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "18px 20px", marginBottom: 16 }}>
            <p style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>Por Categoria</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {byCategory.map((c) => {
                const pct = total > 0 ? (c.total / total) * 100 : 0;
                return (
                  <div key={c.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 13, color: "var(--text-1)", fontWeight: 500 }}>{c.icon} {c.label}</span>
                      <span style={{ fontSize: 13, color: "var(--text-2)", fontWeight: 600 }}>{formatCurrency(c.total)}</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 999, background: "var(--surface-2)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: c.color, borderRadius: 999, transition: "width 0.5s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* List */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <p style={{ fontSize: 40, margin: "0 0 12px" }}>💸</p>
            <p style={{ color: "var(--text-2)", fontWeight: 500, margin: "0 0 4px" }}>Nenhum gasto aqui</p>
            <p style={{ color: "var(--text-3)", fontSize: 13, margin: 0 }}>Toca em "Lançar" para adicionar</p>
          </div>
        ) : (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden" }}>
            {filtered.map((e, i) => {
              const cat = getCat(e.category);
              return (
                <div
                  key={e.id}
                  style={{
                    display: "flex", alignItems: "center",
                    padding: "14px 16px",
                    borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
                    gap: 12,
                  }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: cat.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                    {cat.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.description}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--text-2)" }}>{cat.label} • {e.date.split("-").reverse().join("/")}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--red)" }}>-{formatCurrency(e.amount)}</p>
                    <button onClick={() => handleDelete(e.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", fontSize: 20, lineHeight: 1, padding: 2 }}>×</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
