import { useState } from "react";
import { storage, formatCurrency } from "../utils/storage";

const ICONS = ["✈️","🏖️","🏠","🚗","💻","👗","🎓","💍","🎮","🌍","📱","🏋️","🎵","📷","🍕"];

function daysLeft(deadline) {
  if (!deadline) return null;
  return Math.ceil((new Date(deadline + "T12:00:00") - new Date()) / 86400000);
}

export default function Goals({ onUpdate }) {
  const [goals, setGoals] = useState(storage.getGoals);
  const [showForm, setShowForm]   = useState(false);
  const [depositId, setDepositId] = useState(null);
  const [depositAmt, setDepositAmt] = useState("");
  const [form, setForm] = useState({ name: "", target: "", icon: "✈️", deadline: "" });
  const [editId, setEditId]   = useState(null);
  const [editForm, setEditForm] = useState({});
  const [error, setError] = useState("");

  const save = (list) => { storage.saveGoals(list); setGoals(list); onUpdate?.(); };

  const handleAdd = () => {
    if (!form.name.trim()) return setError("Dá um nome para a meta!");
    if (!form.target || parseFloat(form.target) <= 0) return setError("Valor inválido.");
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
    if (!editForm.name.trim()) return;
    if (!editForm.target || parseFloat(editForm.target) <= 0) return;
    save(goals.map((g) => g.id === editId ? { ...g, name: editForm.name.trim(), target: parseFloat(editForm.target), icon: editForm.icon, deadline: editForm.deadline } : g));
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--text-1)" }}>Metas 🎯</p>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--text-2)" }}>Cada sonho começa com uma meta</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            background: "var(--accent)", color: "var(--accent-fg)",
            border: "none", borderRadius: 999,
            width: 40, height: 40,
            fontSize: 22, fontWeight: 700,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px var(--shadow-accent)",
          }}
        >
          {showForm ? "×" : "+"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ ...card, marginBottom: 16, borderColor: "var(--accent)" }}>
          <p style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: "var(--text-1)" }}>Nova Meta</p>
          {error && <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 10 }}>{error}</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input className="lf-input" placeholder="Nome da meta (ex: Viagem de avião)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <div style={{ display: "flex", gap: 8 }}>
              <input className="lf-input" type="number" placeholder="Valor (R$)" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} style={{ flex: 1 }} />
              <input className="lf-input" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setForm({ ...form, icon })}
                  style={{
                    width: 40, height: 40, borderRadius: 12, fontSize: 20,
                    background: form.icon === icon ? "var(--accent)" : "var(--surface-2)",
                    border: form.icon === icon ? "none" : "1px solid var(--border)",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
            <button
              onClick={handleAdd}
              style={{
                background: "var(--accent)", color: "var(--accent-fg)",
                border: "none", borderRadius: 14, padding: "14px",
                fontSize: 15, fontWeight: 700, cursor: "pointer",
              }}
            >
              Criar Meta
            </button>
          </div>
        </div>
      )}

      {/* Goals list */}
      {goals.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0" }}>
          <p style={{ fontSize: 48, margin: "0 0 12px" }}>✈️</p>
          <p style={{ color: "var(--text-2)", fontWeight: 600, margin: "0 0 4px" }}>Nenhuma meta criada</p>
          <p style={{ color: "var(--text-3)", fontSize: 13 }}>Cria a viagem de avião com a família como primeira meta!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {goals.map((g) => {
            const pct  = Math.min(100, (g.saved / g.target) * 100);
            const done = pct >= 100;
            const days = daysLeft(g.deadline);
            const remaining = g.target - g.saved;

            return (
              <div key={g.id} style={{ ...card, borderLeft: `4px solid ${done ? "var(--green)" : "var(--accent)"}` }}>

                {/* Edit form inline */}
                {editId === g.id ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>Editar meta</p>
                    <input className="lf-input" placeholder="Nome da meta" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} autoFocus />
                    <div style={{ display: "flex", gap: 8 }}>
                      <input className="lf-input" type="number" placeholder="Valor (R$)" value={editForm.target} onChange={(e) => setEditForm({ ...editForm, target: e.target.value })} style={{ flex: 1 }} />
                      <input className="lf-input" type="date" value={editForm.deadline} onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })} />
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {ICONS.map((icon) => (
                        <button key={icon} onClick={() => setEditForm({ ...editForm, icon })} style={{ width: 36, height: 36, borderRadius: 10, fontSize: 18, background: editForm.icon === icon ? "var(--accent)" : "var(--surface-2)", border: editForm.icon === icon ? "none" : "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</button>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={handleEdit} style={{ flex: 1, background: "var(--accent)", color: "var(--accent-fg)", border: "none", borderRadius: 12, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Salvar</button>
                      <button onClick={() => setEditId(null)} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 16px", cursor: "pointer", color: "var(--text-2)", fontWeight: 600 }}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 14 }}>
                  <span style={{ fontSize: 32, marginRight: 12 }}>{g.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--text-1)" }}>{g.name}</p>
                    {days !== null && (
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: days < 0 ? "var(--red)" : days < 30 ? "#F59E0B" : "var(--text-2)" }}>
                        {days < 0 ? `Atrasou ${Math.abs(days)}d` : days === 0 ? "É hoje! 🎉" : `${days} dias restantes`}
                      </p>
                    )}
                  </div>
                  <button onClick={() => startEdit(g)} style={{ background: "none", border: "none", color: "var(--text-2)", fontSize: 14, cursor: "pointer", padding: "2px 6px", marginRight: 4 }} title="Editar">✏️</button>
                  <button onClick={() => save(goals.filter((x) => x.id !== g.id))} style={{ background: "none", border: "none", color: "var(--text-3)", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
                </div>
                )}

                {editId !== g.id && (<>
                {/* Progress */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: "var(--text-2)" }}>Guardado: <strong style={{ color: "var(--text-1)" }}>{formatCurrency(g.saved)}</strong></span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: done ? "var(--green)" : "var(--accent-fg)" }}>{Math.round(pct)}%</span>
                  </div>
                  <div style={{ height: 10, borderRadius: 999, background: "var(--surface-2)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: done ? "var(--green)" : "var(--accent)", borderRadius: 999, transition: "width 0.6s ease" }} />
                  </div>
                  <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--text-2)" }}>Meta: {formatCurrency(g.target)}</p>
                </div>

                {done ? (
                  <p style={{ textAlign: "center", color: "var(--green)", fontWeight: 700, margin: 0 }}>🎉 Meta alcançada! Parabéns!</p>
                ) : depositId === g.id ? (
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      className="lf-input"
                      type="number"
                      placeholder="Quanto guardar (R$)"
                      value={depositAmt}
                      onChange={(e) => setDepositAmt(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleDeposit(g.id)}
                      autoFocus
                      style={{ flex: 1 }}
                    />
                    <button onClick={() => handleDeposit(g.id)} style={{ background: "var(--green)", color: "#fff", border: "none", borderRadius: 12, padding: "0 16px", fontWeight: 700, cursor: "pointer" }}>✓</button>
                    <button onClick={() => setDepositId(null)} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, padding: "0 12px", cursor: "pointer", color: "var(--text-2)" }}>×</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)" }}>Faltam {formatCurrency(remaining)}</p>
                    <button
                      onClick={() => { setDepositId(g.id); setDepositAmt(""); }}
                      style={{
                        background: "var(--accent)", color: "var(--accent-fg)",
                        border: "none", borderRadius: 12, padding: "8px 16px",
                        fontSize: 13, fontWeight: 700, cursor: "pointer",
                      }}
                    >
                      + Guardar
                    </button>
                  </div>
                )}
                </>)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
