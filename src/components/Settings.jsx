import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { storage, formatCurrency } from "../utils/storage";

function SunIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
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
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    </svg>
  );
}

export default function Settings({ onUpdate }) {
  const { dark, toggle } = useTheme();
  const [profile, setProfile] = useState(storage.getProfile);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    storage.saveProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onUpdate?.();
  };

  const savingAmount = profile.income * (profile.savingGoalPct / 100);

  const card = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 20,
    padding: "20px",
    marginBottom: 14,
  };

  const label = { fontSize: 12, color: "var(--text-2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 8 };

  return (
    <div style={{ minHeight: "100svh", background: "var(--bg)", padding: "56px 20px 24px" }}>
      <p style={{ margin: "0 0 24px", fontSize: 22, fontWeight: 800, color: "var(--text-1)" }}>Configurações ⚙️</p>

      {/* Theme toggle */}
      <div style={{ ...card }}>
        <p style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: "var(--text-1)" }}>Aparência</p>
        <button
          onClick={toggle}
          style={{
            width: "100%",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "var(--surface-2)", border: "1px solid var(--border)",
            borderRadius: 14, padding: "14px 16px", cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "var(--text-1)" }}>{dark ? <MoonIcon /> : <SunIcon />}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>{dark ? "Modo Escuro" : "Modo Claro"}</span>
          </div>
          {/* Toggle pill */}
          <div style={{
            width: 48, height: 28,
            background: dark ? "var(--accent)" : "var(--border-strong)",
            borderRadius: 999, position: "relative",
            transition: "background 0.2s",
          }}>
            <div style={{
              position: "absolute",
              top: 3, left: dark ? 23 : 3,
              width: 22, height: 22,
              background: dark ? "var(--accent-fg)" : "#fff",
              borderRadius: "50%",
              transition: "left 0.2s",
              boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            }} />
          </div>
        </button>
      </div>

      {/* Profile */}
      <div style={{ ...card }}>
        <p style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "var(--text-1)" }}>Perfil Financeiro</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <span style={label}>Seu nome</span>
            <input
              className="lf-input"
              placeholder="Como quer ser chamado?"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>
          <div>
            <span style={label}>Renda mensal (R$)</span>
            <input
              className="lf-input"
              type="number"
              placeholder="3000"
              value={profile.income}
              onChange={(e) => setProfile({ ...profile, income: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ ...label, margin: 0 }}>Meta de poupança</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>
                {profile.savingGoalPct}% · {formatCurrency(savingAmount)}/mês
              </span>
            </div>
            <input
              type="range" min="5" max="50" step="5"
              value={profile.savingGoalPct}
              onChange={(e) => setProfile({ ...profile, savingGoalPct: parseInt(e.target.value) })}
              style={{ width: "100%", accentColor: "var(--accent)", cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ fontSize: 11, color: "var(--text-3)" }}>5% conservador</span>
              <span style={{ fontSize: 11, color: "var(--text-3)" }}>20% ideal</span>
              <span style={{ fontSize: 11, color: "var(--text-3)" }}>50% agressivo</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleSave}
          style={{
            width: "100%",
            background: saved ? "var(--green)" : "var(--accent)",
            color: saved ? "#fff" : "var(--accent-fg)",
            border: "none", borderRadius: 14,
            padding: "14px", marginTop: 16,
            fontSize: 15, fontWeight: 700, cursor: "pointer",
            transition: "background 0.2s",
          }}
        >
          {saved ? "✓ Salvo!" : "Salvar Configurações"}
        </button>
      </div>

      {/* Rule 50/30/20 */}
      <div style={{ ...card, background: "linear-gradient(135deg, rgba(197,241,53,0.12), rgba(86,208,160,0.08))" }}>
        <p style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 700, color: "var(--text-1)" }}>Regra 50/30/20 🥇</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "Necessidades (50%)", value: profile.income * 0.5, color: "var(--green)" },
            { label: "Desejos (30%)", value: profile.income * 0.3, color: "#F59E0B" },
            { label: "Poupança (20%)", value: profile.income * 0.2, color: "var(--accent-fg)" },
          ].map((r) => (
            <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "var(--text-2)" }}>{r.label}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: r.color }}>{formatCurrency(r.value)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div style={{ ...card, borderColor: "rgba(239,68,68,0.3)" }}>
        <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "var(--red)" }}>⚠️ Zona de perigo</p>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--text-2)" }}>Apaga todos os dados permanentemente.</p>
        <button
          onClick={() => { if (window.confirm("Apagar tudo?")) { localStorage.clear(); window.location.reload(); } }}
          style={{
            width: "100%",
            background: "none",
            border: "1.5px solid rgba(239,68,68,0.4)",
            borderRadius: 12,
            padding: "11px",
            fontSize: 13, fontWeight: 600,
            color: "var(--red)",
            cursor: "pointer",
          }}
        >
          Apagar todos os dados
        </button>
      </div>
    </div>
  );
}
