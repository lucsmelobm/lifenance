import { useState } from "react";
import { storage, formatCurrency } from "../utils/storage";

const GOAL_ICONS = ["✈️", "🏖️", "🏠", "🚗", "💻", "👗", "🎓", "💍", "🎮", "🌍", "📱", "🏋️"];

export default function Goals({ onUpdate }) {
  const [goals, setGoals] = useState(storage.getGoals());
  const [showForm, setShowForm] = useState(false);
  const [depositGoal, setDepositGoal] = useState(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [form, setForm] = useState({ name: "", target: "", icon: "✈️", deadline: "" });
  const [error, setError] = useState("");

  const save = (list) => {
    storage.saveGoals(list);
    setGoals(list);
    onUpdate?.();
  };

  const handleAdd = () => {
    if (!form.name.trim()) return setError("Dá um nome para a meta!");
    if (!form.target || parseFloat(form.target) <= 0) return setError("Valor inválido.");
    save([
      ...goals,
      { id: Date.now(), name: form.name, target: parseFloat(form.target), saved: 0, icon: form.icon, deadline: form.deadline },
    ]);
    setForm({ name: "", target: "", icon: "✈️", deadline: "" });
    setShowForm(false);
    setError("");
  };

  const handleDeposit = (id) => {
    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) return;
    save(goals.map((g) => g.id === id ? { ...g, saved: g.saved + amt } : g));
    setDepositGoal(null);
    setDepositAmount("");
  };

  const handleDelete = (id) => {
    if (window.confirm("Apagar essa meta?")) save(goals.filter((g) => g.id !== id));
  };

  const daysLeft = (deadline) => {
    if (!deadline) return null;
    const diff = Math.ceil((new Date(deadline + "T12:00:00") - new Date()) / 86400000);
    return diff;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Minhas Metas 🎯</h2>
          <p className="text-sm text-gray-500">Toda viagem começa com uma meta</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold shadow hover:bg-purple-700 transition"
        >
          {showForm ? "×" : "+"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card border-2 border-purple-200">
          <h3 className="font-bold text-gray-700 mb-3">Nova Meta</h3>
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <div className="space-y-3">
            <input
              className="input-field"
              placeholder="Ex: Viagem com a família, Notebook novo..."
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <div className="flex gap-2">
              <input
                className="input-field flex-1"
                placeholder="Valor total (R$)"
                type="number"
                min="0"
                value={form.target}
                onChange={(e) => setForm({ ...form, target: e.target.value })}
              />
              <input
                className="input-field"
                type="date"
                title="Data limite (opcional)"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">Escolha um ícone:</p>
              <div className="flex flex-wrap gap-2">
                {GOAL_ICONS.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setForm({ ...form, icon })}
                    className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center transition-all border-2 ${
                      form.icon === icon ? "border-purple-500 bg-purple-50" : "border-transparent bg-gray-100"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleAdd}
              className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition"
            >
              Criar Meta
            </button>
          </div>
        </div>
      )}

      {/* Goals list */}
      {goals.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-5xl mb-3">✈️</p>
          <p className="text-gray-600 font-medium">Nenhuma meta ainda</p>
          <p className="text-gray-400 text-sm mt-1">Cria sua primeira meta — a viagem de avião com a família!</p>
        </div>
      ) : (
        goals.map((g) => {
          const pct = Math.min(100, (g.saved / g.target) * 100);
          const remaining = g.target - g.saved;
          const days = daysLeft(g.deadline);
          const done = pct >= 100;

          return (
            <div key={g.id} className={`card border-l-4 ${done ? "border-green-500" : "border-purple-500"}`}>
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl">{g.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-gray-800">{g.name}</p>
                    <button onClick={() => handleDelete(g.id)} className="text-gray-300 hover:text-red-400 text-lg ml-2">×</button>
                  </div>
                  {days !== null && (
                    <p className={`text-xs ${days < 0 ? "text-red-500" : days < 30 ? "text-orange-500" : "text-gray-400"}`}>
                      {days < 0 ? `Atrasou ${Math.abs(days)} dias` : days === 0 ? "É hoje! 🎉" : `${days} dias restantes`}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Guardado: <strong className="text-gray-700">{formatCurrency(g.saved)}</strong></span>
                  <span className="text-gray-500">Meta: <strong className="text-gray-700">{formatCurrency(g.target)}</strong></span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-4 rounded-full transition-all duration-700 relative"
                    style={{ width: `${pct}%`, backgroundColor: done ? "#2ECC71" : "#6C63FF" }}
                  >
                    {pct > 15 && (
                      <span className="absolute right-2 top-0 text-xs text-white font-bold leading-4">
                        {Math.round(pct)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {done ? (
                <p className="text-green-600 font-bold text-center py-1">🎉 Meta alcançada! Parabéns!</p>
              ) : (
                <div className="flex items-center gap-2 mt-2">
                  {depositGoal === g.id ? (
                    <>
                      <input
                        className="input-field flex-1 py-2"
                        placeholder="Quanto guardar (R$)"
                        type="number"
                        min="0"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleDeposit(g.id)}
                        autoFocus
                      />
                      <button onClick={() => handleDeposit(g.id)} className="bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-green-600 transition">
                        ✓
                      </button>
                      <button onClick={() => setDepositGoal(null)} className="text-gray-400 px-2 py-2 text-sm">
                        ×
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-gray-500 flex-1">Faltam {formatCurrency(remaining)}</p>
                      <button
                        onClick={() => { setDepositGoal(g.id); setDepositAmount(""); }}
                        className="bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-sm font-bold hover:bg-purple-200 transition"
                      >
                        + Guardar
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
