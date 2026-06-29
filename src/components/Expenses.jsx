import { useState, useMemo } from "react";
import { storage, formatCurrency, today, thisMonth } from "../utils/storage";
import { CATEGORIES } from "../data/tips";

export default function Expenses({ onUpdate }) {
  const [expenses, setExpenses] = useState(storage.getExpenses());
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState(thisMonth());
  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "alimentacao",
    date: today(),
  });
  const [error, setError] = useState("");

  const save = (list) => {
    storage.saveExpenses(list);
    setExpenses(list);
    onUpdate?.();
  };

  const handleAdd = () => {
    if (!form.description.trim()) return setError("Coloca uma descrição!");
    if (!form.amount || isNaN(form.amount) || parseFloat(form.amount) <= 0)
      return setError("Valor inválido.");
    const newExpense = {
      id: Date.now(),
      description: form.description.trim(),
      amount: parseFloat(form.amount),
      category: form.category,
      date: form.date,
    };
    save([newExpense, ...expenses]);
    setForm({ description: "", amount: "", category: "alimentacao", date: today() });
    setShowForm(false);
    setError("");
  };

  const handleDelete = (id) => {
    if (window.confirm("Apagar este gasto?")) save(expenses.filter((e) => e.id !== id));
  };

  const filtered = useMemo(
    () =>
      expenses
        .filter((e) => e.date.startsWith(filter))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [expenses, filter]
  );

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const getCat = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];

  const months = useMemo(() => {
    const set = new Set(expenses.map((e) => e.date.slice(0, 7)));
    const cur = thisMonth();
    if (!set.has(cur)) set.add(cur);
    return [...set].sort((a, b) => b.localeCompare(a)).slice(0, 6);
  }, [expenses]);

  const monthNames = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const labelMonth = (ym) => {
    const [y, m] = ym.split("-");
    return `${monthNames[parseInt(m) - 1]}/${y.slice(2)}`;
  };

  return (
    <div className="space-y-4">
      {/* Month selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {months.map((m) => (
          <button
            key={m}
            onClick={() => setFilter(m)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium transition-all ${
              filter === m
                ? "bg-purple-600 text-white shadow"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            {labelMonth(m)}
          </button>
        ))}
      </div>

      {/* Total */}
      <div className="card bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex justify-between items-center">
        <div>
          <p className="text-xs opacity-75">Total do período</p>
          <p className="text-2xl font-bold">{formatCurrency(total)}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-white text-purple-600 rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold shadow-lg hover:scale-105 transition-transform"
        >
          {showForm ? "×" : "+"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card border-2 border-purple-200 animate-fade-in">
          <h3 className="font-bold text-gray-700 mb-3">➕ Novo Gasto</h3>
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <div className="space-y-3">
            <input
              className="input-field"
              placeholder="O que foi? (ex: almoço no trabalho)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <div className="flex gap-2">
              <input
                className="input-field flex-1"
                placeholder="Valor (R$)"
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
              <input
                className="input-field"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setForm({ ...form, category: c.id })}
                  className={`flex items-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-all border ${
                    form.category === c.id
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-purple-300"
                  }`}
                >
                  <span>{c.icon}</span>
                  <span className="truncate">{c.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={handleAdd}
              className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors"
            >
              Registrar Gasto
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-4xl mb-2">💰</p>
          <p className="text-gray-500">Nenhum gasto neste período</p>
          <p className="text-gray-400 text-sm">Toca no + para adicionar!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((e) => {
            const cat = getCat(e.category);
            return (
              <div key={e.id} className="card flex items-center gap-3 group">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: cat.color + "30" }}
                >
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-700 truncate">{e.description}</p>
                  <p className="text-xs text-gray-400">{cat.label} • {e.date.split("-").reverse().join("/")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-800">{formatCurrency(e.amount)}</p>
                  <button
                    onClick={() => handleDelete(e.id)}
                    className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-lg leading-none"
                    title="Apagar"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
