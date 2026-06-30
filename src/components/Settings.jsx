import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { storage, formatCurrency } from "../utils/storage";
import { clearConfig } from "../lib/supabase";
import { getSb } from "../lib/supabase";

function SunIcon()  { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>; }
function MoonIcon() { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>; }

const COLORS = ["#B8F23C","#3DDC68","#60A5FA","#F472B6","#FB923C","#A78BFA","#FACC15","#F87171"];

export default function Settings({ isCloud, onUpdate, onNavigate }) {
  const { dark, toggle } = useTheme();
  const auth = isCloud ? useAuth() : null;
  const [profile, setProfile] = useState(storage.getProfile);
  const [saved,   setSaved]   = useState(false);
  const [coupleCode, setCoupleCode] = useState(auth?.profile?.couple_code || "");
  const [coupleColor, setCoupleColor] = useState(auth?.profile?.color || "#B8F23C");
  const [coupleSaved, setCoupleSaved] = useState(false);

  const handleSaveProfile = async () => {
    storage.saveProfile(profile);
    if (isCloud && auth?.updateProfile) await auth.updateProfile({ name: profile.name, income: profile.income, saving_goal_pct: profile.savingGoalPct });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onUpdate?.();
  };

  const handleSaveCouple = async () => {
    if (isCloud && auth?.updateProfile) {
      await auth.updateProfile({ couple_code: coupleCode.trim(), color: coupleColor });
      setCoupleSaved(true);
      setTimeout(() => setCoupleSaved(false), 2000);
    }
  };

  const handleSignOut = async () => {
    if (auth?.signOut) await auth.signOut();
    clearConfig();
    localStorage.removeItem("lf_mode");
    window.location.reload();
  };

  const savingAmt = profile.income * (profile.savingGoalPct / 100);
  const card = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "20px", marginBottom: 14 };
  const label = { fontSize: 11, fontWeight: 600, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 8 };

  return (
    <div style={{ minHeight: "100svh", background: "var(--bg)", padding: "56px 20px 24px" }}>
      <p style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 800, color: "var(--text-1)" }}>Configurações ⚙️</p>

      {/* Theme */}
      <div style={card}>
        <p style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "var(--text-1)" }}>Aparência</p>
        <button onClick={toggle} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 14, padding: "13px 16px", cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-1)" }}>
            {dark ? <MoonIcon /> : <SunIcon />}
            <span style={{ fontSize: 14, fontWeight: 600 }}>{dark ? "Modo Escuro" : "Modo Claro"}</span>
          </div>
          <div style={{ width: 48, height: 26, background: dark ? "var(--accent)" : "var(--border-strong)", borderRadius: 999, position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
            <div style={{ position: "absolute", top: 3, left: dark ? 22 : 3, width: 20, height: 20, background: dark ? "var(--accent-fg)" : "#fff", borderRadius: "50%", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
          </div>
        </button>
      </div>

      {/* Profile */}
      <div style={card}>
        <p style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "var(--text-1)" }}>Perfil Financeiro</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div><span style={label}>Seu nome</span><input className="lf-input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></div>
          <div><span style={label}>Salário mensal (R$)</span><input className="lf-input" type="number" value={profile.income} onChange={(e) => setProfile({ ...profile, income: parseFloat(e.target.value) || 0 })} /></div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ ...label, margin: 0 }}>Meta de poupança</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>{profile.savingGoalPct}% · {formatCurrency(savingAmt)}/mês</span>
            </div>
            <input type="range" min="5" max="50" step="5" value={profile.savingGoalPct} onChange={(e) => setProfile({ ...profile, savingGoalPct: parseInt(e.target.value) })} style={{ width: "100%", cursor: "pointer" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              {["5% conservador","20% ideal","50% agressivo"].map((t) => <span key={t} style={{ fontSize: 10, color: "var(--text-3)" }}>{t}</span>)}
            </div>
          </div>
          <button onClick={handleSaveProfile} style={{ background: saved ? "var(--green)" : "var(--accent)", color: saved ? "#fff" : "var(--accent-fg)", border: "none", borderRadius: 14, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer", transition: "background 0.2s" }}>
            {saved ? "✓ Salvo!" : "Salvar"}
          </button>
        </div>
      </div>

      {/* Couple mode (only cloud) */}
      {isCloud && (
        <div style={{ ...card, borderColor: "rgba(184,242,60,0.4)" }}>
          <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "var(--text-1)" }}>Modo Casal 💑</p>
          <p style={{ margin: "0 0 14px", fontSize: 12, color: "var(--text-2)" }}>Vocês dois entram com o mesmo código para ver os gastos um do outro com tags de cor.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <span style={label}>Código do casal</span>
              <input className="lf-input" placeholder="Ex: silva2026" value={coupleCode} onChange={(e) => setCoupleCode(e.target.value)} />
              <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--text-3)" }}>Crie um código e os dois digitam o mesmo. Qualquer palavra serve.</p>
            </div>
            <div>
              <span style={label}>Sua cor de identificação</span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {COLORS.map((c) => (
                  <button key={c} onClick={() => setCoupleColor(c)} style={{ width: 36, height: 36, borderRadius: "50%", background: c, border: coupleColor === c ? "3px solid var(--text-1)" : "3px solid transparent", cursor: "pointer", outline: "none" }} />
                ))}
              </div>
            </div>
            <button onClick={handleSaveCouple} style={{ background: coupleSaved ? "var(--green)" : "var(--accent)", color: coupleSaved ? "#fff" : "var(--accent-fg)", border: "none", borderRadius: 14, padding: "13px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              {coupleSaved ? "✓ Código salvo!" : "Salvar código do casal"}
            </button>
          </div>
          {auth?.user && (
            <div style={{ marginTop: 12, padding: "10px 12px", background: "var(--surface-2)", borderRadius: 12 }}>
              <p style={{ margin: 0, fontSize: 11, color: "var(--text-2)" }}>Logado como: <strong style={{ color: "var(--text-1)" }}>{auth.user.email}</strong></p>
            </div>
          )}
        </div>
      )}

      {/* 50/30/20 */}
      <div style={{ ...card, background: dark ? "rgba(184,242,60,0.06)" : "rgba(184,242,60,0.10)", borderColor: "rgba(184,242,60,0.3)" }}>
        <p style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "var(--text-1)" }}>Regra 50/30/20</p>
        {[["Necessidades (50%)", profile.income * 0.5, "var(--green)"], ["Desejos (30%)", profile.income * 0.3, "#F59E0B"], ["Poupança (20%)", profile.income * 0.2, "var(--accent-fg)"]].map(([l, v, c]) => (
          <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: "var(--text-2)" }}>{l}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: c }}>{formatCurrency(v)}</span>
          </div>
        ))}
      </div>

      {/* Diário link */}
      <button onClick={() => onNavigate?.("daily")} style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>✅ Diário & Dicas financeiras</span>
        <span style={{ color: "var(--text-3)" }}>→</span>
      </button>

      {/* Danger */}
      <div style={{ ...card, borderColor: "rgba(229,57,53,0.25)" }}>
        <p style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: "var(--red)" }}>⚠️ Zona de perigo</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {isCloud && (
            <button onClick={handleSignOut} style={{ width: "100%", background: "none", border: "1.5px solid rgba(229,57,53,0.35)", borderRadius: 12, padding: "12px", fontSize: 13, fontWeight: 600, color: "var(--red)", cursor: "pointer" }}>
              Sair da conta
            </button>
          )}
          <button onClick={() => { if (window.confirm("Apagar todos os dados locais?")) { localStorage.clear(); window.location.reload(); } }} style={{ width: "100%", background: "none", border: "1.5px solid rgba(229,57,53,0.25)", borderRadius: 12, padding: "12px", fontSize: 13, fontWeight: 600, color: "var(--red)", cursor: "pointer" }}>
            Apagar dados locais
          </button>
        </div>
      </div>
    </div>
  );
}
