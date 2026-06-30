import { useState } from "react";
import { configure, SETUP_SQL } from "../lib/supabase";

export default function Setup({ onDone }) {
  const [url, setUrl]       = useState("");
  const [key, setKey]       = useState("");
  const [step, setStep]     = useState(1);
  const [copied, setCopied] = useState(false);
  const [error, setError]   = useState("");

  const handleConnect = async () => {
    setError("");
    let cleanUrl = url.trim().replace(/\/$/, "");
    let cleanKey = key.trim();

    if (!cleanUrl || !cleanKey) return setError("Preencha a URL e a chave.");

    // Auto-corrige URL do dashboard → URL da API
    const dashMatch = cleanUrl.match(/supabase\.com\/dashboard\/project\/([a-z0-9-]+)/);
    if (dashMatch) cleanUrl = `https://${dashMatch[1]}.supabase.co`;

    try {
      configure(cleanUrl, cleanKey);
      onDone();
    } catch (err) {
      setError("Erro: " + (err?.message || "verifique os dados e tente de novo."));
    }
  };

  const copySQL = () => {
    navigator.clipboard.writeText(SETUP_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const s = {
    page: { minHeight: "100svh", background: "var(--bg)", display: "flex", flexDirection: "column", padding: "40px 24px 32px", maxWidth: 430, margin: "0 auto" },
    card: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "20px" },
    step: (active) => ({
      width: 28, height: 28, borderRadius: "50%",
      background: active ? "var(--accent)" : "var(--surface-2)",
      color: active ? "var(--accent-fg)" : "var(--text-2)",
      border: active ? "none" : "1px solid var(--border)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 13, fontWeight: 700, flexShrink: 0,
    }),
  };

  return (
    <div style={s.page}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 900, color: "var(--text-1)" }}>Configurar Lifenance ☁️</p>
        <p style={{ margin: 0, fontSize: 14, color: "var(--text-2)" }}>Conecte ao Supabase para sincronizar com a nuvem e usar em casal</p>
      </div>

      {/* Steps indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
        {[1, 2, 3].map((n) => (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, flex: n < 3 ? 1 : 0 }}>
            <div style={s.step(step >= n)}>{n}</div>
            {n < 3 && <div style={{ flex: 1, height: 2, background: step > n ? "var(--accent)" : "var(--border)", borderRadius: 2 }} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div style={s.card}>
          <p style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700, color: "var(--text-1)" }}>1. Crie um projeto Supabase</p>
          <ol style={{ margin: 0, padding: "0 0 0 18px", display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              "Acesse supabase.com e crie uma conta grátis",
              'Clique em "New Project" e preencha o nome',
              "Aguarde ~1 minuto para o projeto ficar pronto",
            ].map((t, i) => (
              <li key={i} style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.5 }}>{t}</li>
            ))}
          </ol>
          <button onClick={() => setStep(2)} style={{ width: "100%", marginTop: 20, background: "var(--accent)", color: "var(--accent-fg)", border: "none", borderRadius: 14, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
            Projeto criado, próximo →
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={s.card}>
          <p style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700, color: "var(--text-1)" }}>2. Execute o SQL do banco</p>
          <p style={{ margin: "0 0 14px", fontSize: 13, color: "var(--text-2)" }}>No seu projeto Supabase, vá em <strong>SQL Editor → New query</strong>, cole o código abaixo e clique em <strong>Run</strong>.</p>
          <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 14px", fontFamily: "monospace", fontSize: 11, color: "var(--text-2)", maxHeight: 160, overflowY: "auto", marginBottom: 12, lineHeight: 1.5 }} className="no-scrollbar">
            {SETUP_SQL.slice(0, 300)}...
          </div>
          <button onClick={copySQL} style={{ width: "100%", background: copied ? "var(--green)" : "var(--surface-2)", color: copied ? "#fff" : "var(--text-1)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 12, transition: "all 0.2s" }}>
            {copied ? "✓ SQL Copiado!" : "📋 Copiar SQL completo"}
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setStep(1)} style={{ flex: 1, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer", color: "var(--text-2)" }}>← Voltar</button>
            <button onClick={() => setStep(3)} style={{ flex: 2, background: "var(--accent)", color: "var(--accent-fg)", border: "none", borderRadius: 12, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>SQL executado →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={s.card}>
          <p style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 700, color: "var(--text-1)" }}>3. Cole as credenciais</p>

          {/* Instructions box */}
          <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 14, padding: "14px", marginBottom: 14 }}>
            <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>Onde encontrar no Supabase:</p>
            <ol style={{ margin: 0, padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
              <li style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>
                Abra seu projeto no Supabase
              </li>
              <li style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>
                Clique em <strong style={{ color: "var(--text-1)" }}>Settings</strong> (ícone de engrenagem na barra lateral esquerda)
              </li>
              <li style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>
                Clique em <strong style={{ color: "var(--text-1)" }}>Data API</strong> ou <strong style={{ color: "var(--text-1)" }}>API</strong>
              </li>
              <li style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>
                <strong style={{ color: "var(--accent-fg)", background: "var(--accent)", padding: "1px 6px", borderRadius: 6 }}>Project URL</strong> — formato: <code style={{ fontSize: 11 }}>https://xxxxx.supabase.co</code>
              </li>
              <li style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>
                <strong style={{ color: "var(--text-1)" }}>Anon key</strong> — seção "API Keys", copie a chave <strong>anon</strong> / <strong>public</strong>
              </li>
            </ol>
          </div>

          {error && (
            <div style={{ background: "rgba(229,57,53,0.08)", border: "1px solid rgba(229,57,53,0.25)", borderRadius: 12, padding: "10px 14px", marginBottom: 12 }}>
              <p style={{ color: "var(--red)", fontSize: 13, fontWeight: 500, margin: 0, whiteSpace: "pre-line" }}>{error}</p>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: 0.4 }}>Project URL</p>
              <input className="lf-input" placeholder="https://xxxxx.supabase.co" value={url} onChange={(e) => setUrl(e.target.value)} />
              <p style={{ margin: "5px 0 0", fontSize: 11, color: "var(--text-3)" }}>⚠️ Não cole a URL do browser — copie do campo "Project URL" dentro de Settings → API</p>
            </div>
            <div>
              <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: 0.4 }}>Anon Public Key</p>
              <input className="lf-input" placeholder="eyJhbGciOiJ... ou sb_publishable_..." value={key} onChange={(e) => setKey(e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, padding: "13px", fontSize: 14, fontWeight: 600, cursor: "pointer", color: "var(--text-2)" }}>← Voltar</button>
              <button onClick={handleConnect} style={{ flex: 2, background: "var(--accent)", color: "var(--accent-fg)", border: "none", borderRadius: 14, padding: "13px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Conectar ✓</button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => { localStorage.setItem("lf_mode", "local"); onDone(); }}
        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", fontSize: 13, marginTop: 24, textAlign: "center" }}
      >
        Usar sem conta (modo local, sem casal)
      </button>
    </div>
  );
}
