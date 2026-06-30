import { useMemo, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { storage, formatCurrency, thisMonth, today } from "../utils/storage";
import { CATEGORIES } from "../data/tips";
import { dbIncome } from "../lib/db";
import { getSb } from "../lib/supabase";

const PHRASES = [
  "Cada real guardado é um passo para a liberdade 💪",
  "Controle hoje, viagem de avião amanhã ✈️",
  "Você está construindo o futuro da sua família ❤️",
  "Disciplina financeira é o maior presente que você pode dar aos seus filhos 🌟",
  "Um gasto anotado é um gasto consciente 📝",
  "Pequenos passos todos os dias constroem grandes sonhos 🚀",
];

function SunIcon() {
  return (
    <svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
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
    <svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    </svg>
  );
}

function GoalProgressCard({ goal, onNavigate }) {
  const pct      = Math.min(100, (goal.saved / goal.target) * 100);
  const done     = pct >= 100;
  const remaining = goal.target - goal.saved;

  return (
    <div
      onClick={onNavigate}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 18,
        padding: "16px 18px",
        cursor: "pointer",
        transition: "transform 0.15s",
        flexShrink: 0,
        width: 220,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 28 }}>{goal.icon}</span>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{goal.name}</p>
          <p style={{ margin: 0, fontSize: 11, color: done ? "var(--green)" : "var(--text-2)", marginTop: 1 }}>
            {done ? "✓ Meta alcançada!" : `Faltam ${formatCurrency(remaining)}`}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 8, borderRadius: 999, background: "var(--surface-2)", overflow: "hidden", marginBottom: 6 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: done ? "var(--green)" : "var(--accent)", borderRadius: 999 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: "var(--text-2)" }}>{formatCurrency(goal.saved)}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: done ? "var(--green)" : "var(--text-1)" }}>{Math.round(pct)}%</span>
      </div>
    </div>
  );
}

export default function Dashboard({ isCloud, onAdd, onViewAll, onViewGoals }) {
  const { dark, toggle } = useTheme();
  const auth     = isCloud ? useAuth() : null;
  const profile  = storage.getProfile();
  const expenses = storage.getExpenses();
  const goals    = storage.getGoals();
  const month    = thisMonth();

  const [showIncModal, setShowIncModal] = useState(false);
  const [incForm, setIncForm]           = useState({ description: "", amount: "" });
  const [incSaving, setIncSaving]       = useState(false);
  const [extraIncome, setExtraIncome]   = useState(() => {
    try { return JSON.parse(localStorage.getItem(`lf_inc_${thisMonth()}`) || "[]"); } catch { return []; }
  });

  const phrase = useMemo(() => PHRASES[new Date().getDay() % PHRASES.length], []);

  const monthExpenses = useMemo(
    () => expenses.filter((e) => e.date.startsWith(month)),
    [expenses, month]
  );
  const totalSpent      = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const totalExtraInc   = extraIncome.reduce((s, i) => s + i.amount, 0);
  const available       = profile.income + totalExtraInc - totalSpent;
  const savingGoal      = profile.income * (profile.savingGoalPct / 100);

  const handleAddIncome = async () => {
    if (!incForm.description || !incForm.amount) return;
    setIncSaving(true);
    const entry = { description: incForm.description, amount: parseFloat(incForm.amount), date: today() };
    if (isCloud && auth?.user) {
      await dbIncome.add(auth.user.id, entry);
    } else {
      const list = JSON.parse(localStorage.getItem(`lf_inc_${month}`) || "[]");
      const updated = [...list, { id: Date.now(), ...entry }];
      localStorage.setItem(`lf_inc_${month}`, JSON.stringify(updated));
      setExtraIncome(updated);
    }
    setIncForm({ description: "", amount: "" });
    setShowIncModal(false);
    setIncSaving(false);
  };

  const recentFive = useMemo(
    () => [...expenses].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id).slice(0, 5),
    [expenses]
  );
  const getCat = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES.at(-1);

  const card = (extra = {}) => ({
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 20,
    ...extra,
  });

  return (
    <div style={{ minHeight: "100svh", background: "var(--bg)", paddingBottom: 16 }}>

      {/* ── HEADER ── */}
      <div style={{ padding: "52px 20px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              👤
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: "var(--text-2)" }}>Bem-vindo de volta</p>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-1)" }}>{profile.name}</p>
            </div>
          </div>
          <button onClick={toggle} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-2)" }}>
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>

      {/* ── BALANCE CARD ── */}
      <div style={{ padding: "0 20px 16px" }}>
        <div style={{
          ...card(),
          padding: "22px 22px",
          background: dark
            ? "linear-gradient(135deg, #1a2200 0%, #0e1a00 100%)"
            : "linear-gradient(135deg, #e8f9b0 0%, #d4f56a 100%)",
          border: "none",
          position: "relative",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <p style={{ margin: "0 0 4px", fontSize: 12, color: dark ? "rgba(197,241,53,0.6)" : "#5a7a00", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>
              Saldo disponível este mês
            </p>
            <button
              onClick={() => setShowIncModal(true)}
              title="Adicionar renda extra"
              style={{
                background: dark ? "rgba(184,242,60,0.15)" : "rgba(45,90,0,0.10)",
                border: dark ? "1px solid rgba(184,242,60,0.3)" : "1px solid rgba(45,90,0,0.15)",
                borderRadius: 10, width: 32, height: 32, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, color: dark ? "#C5F135" : "#2d5a00", flexShrink: 0,
              }}
            >+</button>
          </div>
          <p style={{ margin: "0 0 16px", fontSize: 40, fontWeight: 900, letterSpacing: "-1.5px", color: available < 0 ? "var(--red)" : dark ? "#C5F135" : "#2d5a00", lineHeight: 1.1 }}>
            {formatCurrency(available)}
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: dark ? "rgba(255,255,255,0.4)" : "#5a7a00" }}>Renda</p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: dark ? "var(--green)" : "#1a5200" }}>{formatCurrency(profile.income)}</p>
            </div>
            {totalExtraInc > 0 && <>
              <div style={{ width: 1, background: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }} />
              <div>
                <p style={{ margin: 0, fontSize: 11, color: dark ? "rgba(255,255,255,0.4)" : "#5a7a00" }}>Renda extra</p>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: dark ? "var(--green)" : "#1a5200" }}>+{formatCurrency(totalExtraInc)}</p>
              </div>
            </>}
            <div style={{ width: 1, background: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }} />
            <div>
              <p style={{ margin: 0, fontSize: 11, color: dark ? "rgba(255,255,255,0.4)" : "#5a7a00" }}>Gastos</p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--red)" }}>{formatCurrency(totalSpent)}</p>
            </div>
            <div style={{ width: 1, background: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }} />
            <div>
              <p style={{ margin: 0, fontSize: 11, color: dark ? "rgba(255,255,255,0.4)" : "#5a7a00" }}>Meta poupança</p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: dark ? "#C5F135" : "#2d5a00" }}>{formatCurrency(savingGoal)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL RENDA EXTRA ── */}
      {showIncModal && (
        <>
          <div
            onClick={() => setShowIncModal(false)}
            className="backdrop-enter"
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100 }}
          />
          <div
            className="sheet-enter"
            style={{
              position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
              width: "100%", maxWidth: 430, background: "var(--surface)",
              borderRadius: "24px 24px 0 0", padding: "24px 20px 40px", zIndex: 101,
            }}
          >
            <div style={{ width: 36, height: 4, borderRadius: 99, background: "var(--border-strong)", margin: "0 auto 20px" }} />
            <p style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "var(--text-1)" }}>+ Adicionar Renda</p>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--text-2)" }}>Valor extra que entrou além do salário</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: 0.4 }}>Descrição</p>
                <input
                  className="lf-input"
                  placeholder="Ex: Freela, venda, presente..."
                  value={incForm.description}
                  onChange={(e) => setIncForm({ ...incForm, description: e.target.value })}
                  autoFocus
                />
              </div>
              <div>
                <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: 0.4 }}>Valor (R$)</p>
                <input
                  className="lf-input"
                  type="number"
                  placeholder="0,00"
                  value={incForm.amount}
                  onChange={(e) => setIncForm({ ...incForm, amount: e.target.value })}
                />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button
                  onClick={() => setShowIncModal(false)}
                  style={{ flex: 1, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 14, padding: "14px", fontSize: 15, fontWeight: 600, cursor: "pointer", color: "var(--text-2)" }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddIncome}
                  disabled={incSaving}
                  style={{ flex: 2, background: "var(--accent)", color: "var(--accent-fg)", border: "none", borderRadius: 14, padding: "14px", fontSize: 15, fontWeight: 800, cursor: "pointer" }}
                >
                  {incSaving ? "Salvando..." : "Adicionar ✓"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── FRASE MOTIVACIONAL ── */}
      <div style={{ padding: "0 20px 16px" }}>
        <div style={{ ...card(), padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 26, flexShrink: 0 }}>💬</span>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)", lineHeight: 1.5, fontStyle: "italic" }}>
            "{phrase}"
          </p>
        </div>
      </div>

      {/* ── METAS ── */}
      <div style={{ padding: "0 0 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px", marginBottom: 12 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-1)" }}>Suas Metas 🎯</p>
          <button onClick={onViewGoals} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--text-2)" }}>
            Ver todas →
          </button>
        </div>

        {goals.length === 0 ? (
          <div style={{ padding: "0 20px" }}>
            <button
              onClick={onViewGoals}
              style={{
                width: "100%", background: "var(--surface)", border: "2px dashed var(--border)", borderRadius: 18,
                padding: "24px", cursor: "pointer", textAlign: "center",
              }}
            >
              <p style={{ margin: "0 0 4px", fontSize: 28 }}>✈️</p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--text-2)" }}>Crie sua primeira meta</p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-3)" }}>Ex: viagem de avião com a família</p>
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 12, overflowX: "auto", padding: "0 20px 4px" }} className="no-scrollbar">
            {goals.map((g) => (
              <GoalProgressCard key={g.id} goal={g} onNavigate={onViewGoals} />
            ))}
          </div>
        )}
      </div>

      {/* ── TRANSAÇÕES RECENTES ── */}
      <div style={{ padding: "0 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-1)" }}>Transações Recentes</p>
          <button onClick={onViewAll} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--text-2)" }}>
            Ver todas →
          </button>
        </div>

        <div style={{ ...card(), overflow: "hidden" }}>
          {recentFive.length === 0 ? (
            <div style={{ textAlign: "center", padding: "36px 20px" }}>
              <p style={{ fontSize: 36, margin: "0 0 8px" }}>💸</p>
              <p style={{ margin: 0, color: "var(--text-2)", fontWeight: 500 }}>Nenhum gasto ainda</p>
              <p style={{ margin: "4px 0 0", color: "var(--text-3)", fontSize: 13 }}>Toca em "Lançar" para começar</p>
            </div>
          ) : (
            recentFive.map((e, i) => {
              const cat = getCat(e.category);
              return (
                <div key={e.id} style={{ display: "flex", alignItems: "center", padding: "13px 16px", borderBottom: i < recentFive.length - 1 ? "1px solid var(--border)" : "none", gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 13, background: cat.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                    {cat.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.description}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--text-2)" }}>{cat.label} • {e.date.split("-").reverse().join("/")}</p>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--red)", flexShrink: 0 }}>-{formatCurrency(e.amount)}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
