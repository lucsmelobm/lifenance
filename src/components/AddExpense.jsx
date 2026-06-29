import { useState } from "react";
import { storage, today } from "../utils/storage";
import { CATEGORIES } from "../data/tips";

export default function AddExpense({ onClose }) {
  const [form, setForm] = useState({
    description: "", amount: "", category: "alimentacao", date: today(),
  });
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!form.description.trim()) return setError("Coloca uma descrição!");
    if (!form.amount || parseFloat(form.amount) <= 0) return setError("Valor inválido.");
    const expenses = storage.getExpenses();
    storage.saveExpenses([
      { id: Date.now(), description: form.description.trim(), amount: parseFloat(form.amount), category: form.category, date: form.date },
      ...expenses,
    ]);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="backdrop-enter"
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          zIndex: 100,
        }}
      />

      {/* Sheet */}
      <div
        className="sheet-enter"
        style={{
          position: "fixed",
          bottom: 0, left: "50%",
          transform: "translateX(-50%)",
          width: "100%", maxWidth: 430,
          background: "var(--surface)",
          borderRadius: "24px 24px 0 0",
          padding: "8px 20px 40px",
          zIndex: 101,
          borderTop: "1px solid var(--border)",
        }}
      >
        {/* Handle */}
        <div style={{ width: 40, height: 4, borderRadius: 4, background: "var(--border-strong)", margin: "8px auto 20px" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-1)" }}>Novo Gasto</p>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "var(--text-2)", lineHeight: 1 }}>×</button>
        </div>

        {error && (
          <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 12, fontWeight: 500 }}>{error}</p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Amount — big and prominent */}
          <div style={{
            background: "var(--surface-2)",
            borderRadius: 18,
            padding: "16px 20px",
            border: "1.5px solid var(--border)",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: "var(--text-2)" }}>R$</span>
            <input
              className="lf-input"
              type="number"
              inputMode="decimal"
              placeholder="0,00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              autoFocus
              style={{
                background: "none", border: "none", padding: 0,
                fontSize: 32, fontWeight: 800, color: "var(--text-1)",
                letterSpacing: "-1px", flex: 1,
              }}
            />
          </div>

          <input
            className="lf-input"
            placeholder="Descrição (ex: almoço no trabalho)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />

          <input
            className="lf-input"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            style={{ colorScheme: "dark" }}
          />

          {/* Category picker */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {CATEGORIES.map((c) => {
              const active = form.category === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setForm({ ...form, category: c.id })}
                  style={{
                    background: active ? c.color + "25" : "var(--surface-2)",
                    border: active ? `1.5px solid ${c.color}` : "1.5px solid var(--border)",
                    borderRadius: 12,
                    padding: "10px 8px",
                    cursor: "pointer",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", gap: 4,
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: 20 }}>{c.icon}</span>
                  <span style={{ fontSize: 10, color: active ? "var(--text-1)" : "var(--text-2)", fontWeight: active ? 600 : 400 }}>
                    {c.label}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSave}
            style={{
              background: "var(--accent)",
              color: "var(--accent-fg)",
              border: "none",
              borderRadius: 16,
              padding: "16px",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              marginTop: 4,
              boxShadow: "0 4px 20px var(--shadow-accent)",
            }}
          >
            Registrar Gasto
          </button>
        </div>
      </div>
    </>
  );
}
