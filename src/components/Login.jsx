import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode]     = useState("login"); // "login" | "signup"
  const [email, setEmail]   = useState("");
  const [pass, setPass]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [info, setInfo]     = useState("");

  const handle = async () => {
    setError(""); setInfo("");
    if (!email || !pass) return setError("Preencha e-mail e senha.");
    setLoading(true);
    try {
      if (mode === "login") {
        const { error: err } = await signIn(email, pass);
        if (err) throw err;
      } else {
        const { error: err } = await signUp(email, pass);
        if (err) throw err;
        setInfo("Conta criada! Verifique seu e-mail para confirmar, depois faça login.");
        setMode("login");
      }
    } catch (err) {
      setError(err.message || "Erro ao entrar. Verifique seus dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100svh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px", maxWidth: 430, margin: "0 auto" }}>
      {/* Logo */}
      <div style={{ marginBottom: 40, textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: 22, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 14px", boxShadow: "0 8px 32px var(--shadow-accent)" }}>
          💰
        </div>
        <p style={{ margin: 0, fontSize: 30, fontWeight: 900, color: "var(--text-1)", letterSpacing: "-1px" }}>Lifenance</p>
        <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--text-2)" }}>Controle financeiro em casal</p>
      </div>

      {/* Card */}
      <div style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 24, padding: "28px 24px" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, background: "var(--surface-2)", borderRadius: 12, padding: 4, marginBottom: 24 }}>
          {[["login", "Entrar"], ["signup", "Criar conta"]].map(([m, label]) => (
            <button key={m} onClick={() => { setMode(m); setError(""); setInfo(""); }} style={{ flex: 1, background: mode === m ? "var(--accent)" : "transparent", color: mode === m ? "var(--accent-fg)" : "var(--text-2)", border: "none", borderRadius: 9, padding: "10px", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
              {label}
            </button>
          ))}
        </div>

        {error && <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 14, fontWeight: 500, background: "rgba(239,68,68,0.08)", padding: "10px 12px", borderRadius: 10 }}>{error}</p>}
        {info  && <p style={{ color: "var(--green)", fontSize: 13, marginBottom: 14, fontWeight: 500, background: "rgba(74,222,128,0.08)", padding: "10px 12px", borderRadius: 10 }}>{info}</p>}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input className="lf-input" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handle()} />
          <input className="lf-input" type="password" placeholder="Senha" value={pass} onChange={(e) => setPass(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handle()} />
          <button
            onClick={handle}
            disabled={loading}
            style={{ background: "var(--accent)", color: "var(--accent-fg)", border: "none", borderRadius: 14, padding: "15px", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, marginTop: 4, boxShadow: "0 4px 20px var(--shadow-accent)" }}
          >
            {loading ? "Aguarde..." : mode === "login" ? "Entrar →" : "Criar conta →"}
          </button>
        </div>
      </div>

      {mode === "login" && (
        <p style={{ marginTop: 16, fontSize: 12, color: "var(--text-3)", textAlign: "center" }}>
          Sua esposa entra com e-mail diferente e os dois podem ver os gastos juntos.
        </p>
      )}
    </div>
  );
}
