import { useState, useMemo } from "react";
import { storage, today } from "../utils/storage";
import { TIPS } from "../data/tips";

const HABITS = [
  { id: "anotar",     label: "Anotei todos meus gastos de hoje", icon: "📝" },
  { id: "impulso",    label: "Não fiz compras por impulso",      icon: "🛑" },
  { id: "meta",       label: "Pensei na minha meta do dia",      icon: "🎯" },
  { id: "dica",       label: "Li a dica financeira de hoje",     icon: "💡" },
];

const DAY_NAMES = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

function calcStreak(checkins) {
  if (!checkins.length) return 0;
  const sorted = [...checkins].sort((a, b) => b.date.localeCompare(a.date));
  let count = 0;
  let cursor = new Date();
  for (const c of sorted) {
    const cDate = new Date(c.date + "T12:00:00");
    const diff = Math.round((cursor - cDate) / 86400000);
    if (diff <= 1) { count++; cursor = cDate; } else break;
  }
  return count;
}

export default function Daily({ onUpdate }) {
  const [checkins, setCheckins] = useState(storage.getCheckins);
  const [tipIdx, setTipIdx] = useState(() => (new Date().getDate() + new Date().getMonth() * 3) % TIPS.length);
  const [expanded, setExpanded] = useState(false);

  const todayStr = today();
  const todayData = checkins.find((c) => c.date === todayStr) || { date: todayStr, habits: [] };
  const done = todayData.habits;

  const toggle = (id) => {
    const updated = done.includes(id) ? done.filter((h) => h !== id) : [...done, id];
    const next = [...checkins.filter((c) => c.date !== todayStr), { date: todayStr, habits: updated }];
    storage.saveCheckins(next);
    setCheckins(next);
    onUpdate?.();
  };

  const streak = useMemo(() => calcStreak(checkins), [checkins]);
  const tip = TIPS[tipIdx];
  const pct = Math.round((done.length / HABITS.length) * 100);

  const last7 = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split("T")[0];
      const check = checkins.find((c) => c.date === dateStr);
      return {
        label: i === 6 ? "Hoje" : DAY_NAMES[d.getDay()],
        count: check?.habits.length ?? 0,
        dateStr,
      };
    });
  }, [checkins]);

  const card = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "20px" };

  return (
    <div style={{ minHeight: "100svh", background: "var(--bg)", padding: "56px 20px 24px" }}>
      <p style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 800, color: "var(--text-1)" }}>Diário ✅</p>

      {/* Streak */}
      <div style={{ ...card, background: "linear-gradient(135deg, #FF6B35, #E91E63)", border: "none", textAlign: "center", marginBottom: 16, padding: "28px 20px" }}>
        <p style={{ margin: 0, fontSize: 64, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{streak}</p>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: "rgba(255,255,255,0.85)" }}>
          {streak === 0 ? "Comece hoje — não quebre a sequência!" : streak === 1 ? "dia seguido 🔥 Continue!" : `dias seguidos 🔥 Você está arrasando!`}
        </p>
      </div>

      {/* Check-in */}
      <div style={{ ...card, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-1)" }}>Check-in de Hoje</p>
          <span style={{ fontSize: 13, fontWeight: 700, color: pct === 100 ? "var(--green)" : "var(--text-2)" }}>{done.length}/{HABITS.length}</span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 8, borderRadius: 999, background: "var(--surface-2)", marginBottom: 16, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "var(--green)" : "var(--accent)", borderRadius: 999, transition: "width 0.4s ease" }} />
        </div>

        {HABITS.map((h) => {
          const checked = done.includes(h.id);
          return (
            <button
              key={h.id}
              onClick={() => toggle(h.id)}
              style={{
                width: "100%",
                display: "flex", alignItems: "center", gap: 12,
                padding: "13px 14px",
                background: checked ? "rgba(74,222,128,0.1)" : "var(--surface-2)",
                border: checked ? "1.5px solid var(--green)" : "1.5px solid var(--border)",
                borderRadius: 14,
                cursor: "pointer",
                marginBottom: 8,
                textAlign: "left",
                transition: "all 0.15s",
              }}
            >
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                border: checked ? "none" : "2px solid var(--border-strong)",
                background: checked ? "var(--green)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                {checked && <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>✓</span>}
              </div>
              <span style={{ fontSize: 18 }}>{h.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)" }}>{h.label}</span>
            </button>
          );
        })}

        {pct === 100 && (
          <div style={{ textAlign: "center", padding: "8px 0 0", color: "var(--green)", fontWeight: 700 }}>
            🎉 Check-in completo! Você é incrível!
          </div>
        )}
      </div>

      {/* 7-day chart */}
      <div style={{ ...card, marginBottom: 16 }}>
        <p style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "var(--text-1)" }}>Últimos 7 Dias</p>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end", justifyContent: "space-between" }}>
          {last7.map((d) => {
            const ratio = HABITS.length > 0 ? d.count / HABITS.length : 0;
            const color = ratio === 1 ? "var(--green)" : ratio >= 0.5 ? "var(--accent)" : ratio > 0 ? "#F59E0B" : "var(--surface-2)";
            const isToday = d.label === "Hoje";
            return (
              <div key={d.dateStr} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ width: "100%", height: 52, background: "var(--surface-2)", borderRadius: 8, overflow: "hidden", display: "flex", alignItems: "flex-end" }}>
                  <div style={{ width: "100%", height: `${ratio * 100}%`, background: color, borderRadius: 8, transition: "height 0.5s ease" }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: isToday ? 700 : 400, color: isToday ? "var(--text-1)" : "var(--text-2)" }}>{d.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily tip */}
      <div style={{ ...card, borderLeft: "4px solid var(--accent)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 26 }}>{tip.icon}</span>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: "var(--accent-fg)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, background: "var(--accent)", padding: "2px 8px", borderRadius: 999, display: "inline-block" }}>{tip.category}</p>
              <p style={{ margin: "4px 0 0", fontSize: 15, fontWeight: 700, color: "var(--text-1)" }}>{tip.title}</p>
            </div>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>
          {expanded ? tip.tip : tip.tip.slice(0, 130) + (tip.tip.length > 130 ? "..." : "")}
        </p>

        {tip.tip.length > 130 && (
          <button onClick={() => setExpanded(!expanded)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-1)", fontSize: 13, fontWeight: 600, padding: "6px 0 0" }}>
            {expanded ? "Ver menos" : "Ler mais"}
          </button>
        )}

        {expanded && (
          <div style={{ background: "var(--surface-2)", borderRadius: 12, padding: "12px 14px", marginTop: 10 }}>
            <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase" }}>Ação de hoje:</p>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-1)" }}>{tip.action}</p>
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button onClick={() => { setTipIdx((tipIdx - 1 + TIPS.length) % TIPS.length); setExpanded(false); }} style={{ flex: 1, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, padding: "10px", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "var(--text-1)" }}>← Anterior</button>
          <button onClick={() => { setTipIdx((tipIdx + 1) % TIPS.length); setExpanded(false); }} style={{ flex: 1, background: "var(--accent)", color: "var(--accent-fg)", border: "none", borderRadius: 12, padding: "10px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Próxima →</button>
        </div>
      </div>
    </div>
  );
}
