import { useState } from "react";
import { storage, formatCurrency } from "../utils/storage";

const ICONS = ["✈️","🏖️","🏠","🚗","💻","👗","🎓","💍","🎮","🌍","📱","🏋️","🎵","📷","🍕"];

function daysLeft(deadline) {
  if (!deadline) return null;
  return Math.ceil((new Date(deadline + "T12:00:00") - new Date()) / 86400000);
}

function GoalForm({ title, values, onChange, onSave, onCancel, error, saveLabel = "Criar Meta" }) {
  return (
    <div style={{ background: "var(--surface)", border: "1.5px solid var(--accent)", borderRadius: 20, padding: "20px", marginBottom: 16 }}>
      <p style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "var(--text-1)" }}>{title}</p>
      {error && <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 12, fontWeight: 500 }}>{error}</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Amount — big */}
        <div style={{ background: "var(--surface-2)", border: "1.5px solid var(--border)", borderRadius: 16, padding: "14px 18px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: "var(--text-2)" }}>R$</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="0,00"
            value={values.target}
            onChange={(e) => onChange({ ...values, target: e.target.value })}
            autoFocus
            style={{ background: "none", border: "none", outline: "none", fontSize: 28, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.5px", flex: 1, width: "100%" }}
          />
        </div>

        {/* Name */}
        <input
          className="lf-input"
          placeholder="Nome da meta (ex: Viagem de avião ✈️)"
          value={values.name}
          onChange={(e) => onChange({ ...values, name: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && onSave()}
        />

        {/* Date */}
        <div>
          <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 600, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: 0.4 }}>Prazo (opcional)</p>
          <input
            className="lf-input"
            type="date"
            value={values.deadline}
            onChange={(e) => onChange({ ...values, deadline: e.target.value })}
          />
        </div>

        {/* Icon picker */}
        <div>
          <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 600, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: 0.4 }}>Ícone</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
            {ICONS.map((icon) => {
              const active = values.icon === icon;
              return (
                <button
                  key={icon}
                  onClick={() => onChange({ ...values, icon })}
                  style={{
                    height: 48, borderRadius: 14, fontSize: 22,
                    background: active ? "var(--accent)" : "var(--surface-2)",
                    border: active ? "none" : "1px solid var(--border)",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.12s",
                    transform: active ? "scale(1.08)" : "scale(1)",
                    boxShadow: active ? "0 2px 10px var(--shadow-accent)" : "none",
                  }}
                >
                  {icon}
                </button>
              );
            })}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          {onCancel && (
            <button
              onClick={onCancel}
              style={{ flex: 1, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 14, padding: "13px", fontSize: 14, fontWeight: 600, cursor: "pointer", color: "var(--text-2)" }}
            >
              Cancelar
            </button>
          )}
          <button
            onClick={onSave}
            style={{ flex: 2, background: "var(--accent)", color: "var(--accent-fg)", border: "none", borderRadius: 14, padding: "13px", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px var(--shadow-accent)" }}
          >
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Goals({ onUpdate }) {
  const [goals, setGoals]       = useState(storage.getGoals);
  const [showForm, setShowForm] = useState(false);
  const [depositId, setDepositId] = useState(null);
  const [depositAmt, setDepositAmt] = useState("");
  const [form, setForm]         = useState({ name: "", target: "", icon: "✈️", deadline: "" });
  const [editId, setEditId]     = useState(null);
  const [editForm, setEditForm] = useState({});
  const [error, setError]       = useState("");

  const save = (list) => { storage.saveGoals(list); setGoals(list); onUpdate?.(); };

  const handleAdd = () => {
    if (!form.name.trim()) return setError("Dá um nome para a meta!");
    if (!form.target || parseFloat(form.target) <= 0) return setError("Digite o valor da meta.");
    save([...goals, { id: Date.now(), ...form, target: parseFloat(form.target), saved: 0 }]);
    setForm({ name: "", target: "", icon: "✈️", deadline: "" });
    setShowForm(false);
    setError("");
  };

  const startEdit = (g) => {
    setEditId(g.id);
    setEditForm({ name: g.name, target: String(g.target), icon: g.icon, deadline: g.deadline || "" });
    setDepositId(null);
  };

  const handleEdit = () => {
    if (!editForm.name.trim() || !editForm.target || parseFloat(editForm.target) <= 0) return;
    save(goals.map((g) => g.id === editId
      ? { ...g, name: editForm.name.trim(), target: parseFloat(editForm.target), icon: editForm.icon, deadline: editForm.deadline }
      : g
    ));
    setEditId(null);
  };

  const handleDeposit = (id) => {
    const amt = parseFloat(depositAmt);
    if (!amt || amt <= 0) return;
    save(goals.map((g) => g.id === id ? { ...g, saved: g.saved + amt } : g));
    setDepositId(null);
    setDepositAmt("");
  };

  const card = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "18px 20px" };

  return (
    <div style={{ minHeight: "100svh", background: "var(--bg)", padding: "56px 20px 24px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--text-1)" }}>Metas 🎯</p>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--text-2)" }}>Cada sonho começa com uma meta</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(""); }}
          style={{
            background: showForm ? "var(--surface-2)" : "var(--accent)",
            color: showForm ? "var(--text-1)" : "var(--accent-fg)",
            border: showForm ? "1px solid var(--border)" : "none",
            borderRadius: 999, width: 44, height: 44,
            fontSize: 24, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: showForm ? "none" : "0 4px 16px var(--shadow-accent)",
          }}
        >
          {showForm ? "×" : "+"}
        </button>
      </div>

      {/* New goal form */}
      {showForm && (
        <GoalForm
          title="Nova Meta"
          values={form}
          onChange={setForm}
          onSave={handleAdd}
          onCancel={() => { setShowForm(false); setError(""); }}
          error={error}
          saveLabel="Criar Meta ✨"
        />
      )}

      {/* Empty state */}
      {goals.length === 0 && !showForm && (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <p style={{ fontSize: 56, margin: "0 0 12px" }}>✈️</p>
          <p style={{ color: "var(--text-1)", fontWeight: 700, fontSize: 17, margin: "0 0 6px" }}>Nenhuma meta ainda</p>
          <p style={{ color: "var(--text-3)", fontSize: 13, margin: "0 0 20px" }}>Sua primeira meta pode ser a viagem de avião com a família!</p>
          <button onClick={() => setShowForm(true)} style={{ background: "var(--accent)", color: "var(--accent-fg)", border: "none", borderRadius: 14, padding: "13px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
            Criar minha primeira meta
          </button>
        </div>
      )}

      {/* Goals list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {goals.map((g) => {
          const pct       = Math.min(100, (g.saved / g.target) * 100);
          const done      = pct >= 100;
          const days      = daysLeft(g.deadline);
          const remaining = Math.max(0, g.target - g.saved);
          const isEditing = editId === g.id;

          return (
            <div key={g.id}>
              {isEditing ? (
                <GoalForm
                  title={`Editar: ${g.name}`}
                  values={editForm}
                  onChange={setEditForm}
                  onSave={handleEdit}
                  onCancel={() => setEditId(null)}
                  saveLabel="Salvar alterações"
                />
              ) : (
                <div style={{ ...card, borderLeft: `4px solid ${done ? "var(--green)" : "var(--accent)"}` }}>

                  {/* Goal header */}
                  <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 16 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 16, background: done ? "rgba(74,222,128,0.12)" : "rgba(197,241,53,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0, marginRight: 14 }}>
                      {g.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--text-1)" }}>{g.name}</p>
                      {days !== null && (
                        <p style={{ margin: "2px 0 0", fontSize: 12, color: days < 0 ? "var(--red)" : days < 30 ? "#F59E0B" : "var(--text-2)" }}>
                          📅 {days < 0 ? `Prazo passou há ${Math.abs(days)} dias` : days === 0 ? "É hoje! 🎉" : `${days} dias restantes`}
                        </p>
                      )}
                    </div>
                    <button onClick={() => startEdit(g)} style={{ background: "none", border: "none", color: "var(--text-2)", fontSize: 16, cursor: "pointer", padding: "4px 6px" }}>✏️</button>
                    <button onClick={() => { if (window.confirm(`Apagar a meta "${g.name}"?`)) save(goals.filter((x) => x.id !== g.id)); }} style={{ background: "none", border: "none", color: "var(--text-3)", fontSize: 22, cursor: "pointer", lineHeight: 1, padding: "0 2px" }}>×</button>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
                      <div>
                        <p style={{ margin: 0, fontSize: 12, color: "var(--text-2)" }}>Guardado</p>
                        <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: done ? "var(--green)" : "var(--text-1)", letterSpacing: "-0.5px" }}>{formatCurrency(g.saved)}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ margin: 0, fontSize: 12, color: "var(--text-2)" }}>Meta</p>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--text-2)" }}>{formatCurrency(g.target)}</p>
                      </div>
                    </div>
                    <div style={{ height: 12, borderRadius: 999, background: "var(--surface-2)", overflow: "hidden", marginBottom: 6 }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: done ? "var(--green)" : "var(--accent)", borderRadius: 999, transition: "width 0.6s ease" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <p style={{ margin: 0, fontSize: 12, color: "var(--text-2)" }}>
                        {done ? "🎉 Meta alcançada!" : `Faltam ${formatCurrency(remaining)}`}
                      </p>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: done ? "var(--green)" : "var(--text-1)" }}>{Math.round(pct)}%</p>
                    </div>
                  </div>

                  {/* Actions */}
                  {done ? (
                    <div style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 12, padding: "12px", textAlign: "center" }}>
                      <p style={{ margin: 0, color: "var(--green)", fontWeight: 700, fontSize: 15 }}>🎉 Parabéns! Sonho realizado!</p>
                    </div>
                  ) : depositId === g.id ? (
                    <div>
                      <p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--text-2)", fontWeight: 600 }}>Quanto guardar agora?</p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <div style={{ flex: 1, background: "var(--surface-2)", border: "1.5px solid var(--accent)", borderRadius: 12, display: "flex", alignItems: "center", padding: "0 12px", gap: 6 }}>
                          <span style={{ color: "var(--text-3)", fontWeight: 700 }}>R$</span>
                          <input
                            type="number"
                            inputMode="decimal"
                            placeholder="0,00"
                            value={depositAmt}
                            onChange={(e) => setDepositAmt(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleDeposit(g.id)}
                            autoFocus
                            style={{ background: "none", border: "none", outline: "none", fontSize: 16, fontWeight: 700, color: "var(--text-1)", flex: 1, padding: "12px 0" }}
                          />
                        </div>
                        <button onClick={() => handleDeposit(g.id)} style={{ background: "var(--green)", color: "#fff", border: "none", borderRadius: 12, padding: "0 18px", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>✓</button>
                        <button onClick={() => setDepositId(null)} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, padding: "0 14px", cursor: "pointer", color: "var(--text-2)", fontSize: 18 }}>×</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setDepositId(g.id); setDepositAmt(""); }}
                      style={{
                        width: "100%",
                        background: "var(--accent)", color: "var(--accent-fg)",
                        border: "none", borderRadius: 14, padding: "13px",
                        fontSize: 14, fontWeight: 700, cursor: "pointer",
                        boxShadow: "0 2px 10px var(--shadow-accent)",
                      }}
                    >
                      + Guardar dinheiro para esta meta
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
