import { useMemo } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import { storage, formatCurrency, thisMonth, monthLabel } from "../utils/storage";
import { CATEGORIES } from "../data/tips";

const RADIAN = Math.PI / 180;
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function Dashboard() {
  const profile = storage.getProfile();
  const expenses = storage.getExpenses();
  const checkins = storage.getCheckins();
  const goals = storage.getGoals();
  const month = thisMonth();

  const monthExpenses = useMemo(
    () => expenses.filter((e) => e.date.startsWith(month)),
    [expenses, month]
  );

  const totalMonth = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const savingTarget = profile.income * (profile.savingGoalPct / 100);
  const available = profile.income - totalMonth;
  const savingPct = Math.max(0, Math.min(100, (available / savingTarget) * 100));

  const byCategory = useMemo(() => {
    const map = {};
    monthExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return CATEGORIES.filter((c) => map[c.id]).map((c) => ({
      name: c.label,
      value: map[c.id],
      color: c.color,
      icon: c.icon,
    }));
  }, [monthExpenses]);

  const last6Months = useMemo(() => {
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const total = expenses
        .filter((e) => e.date.startsWith(ym))
        .reduce((s, e) => s + e.amount, 0);
      result.push({ name: monthLabel(ym), gastos: total, renda: profile.income });
    }
    return result;
  }, [expenses, profile.income]);

  const streak = useMemo(() => {
    if (!checkins.length) return 0;
    const sorted = [...checkins].sort((a, b) => b.date.localeCompare(a.date));
    let count = 0;
    let cursor = new Date();
    for (const c of sorted) {
      const cDate = new Date(c.date + "T12:00:00");
      const diff = Math.round((cursor - cDate) / 86400000);
      if (diff <= 1) { count++; cursor = cDate; }
      else break;
    }
    return count;
  }, [checkins]);

  const healthScore = useMemo(() => {
    let score = 0;
    if (totalMonth <= profile.income * 0.5) score += 30;
    else if (totalMonth <= profile.income * 0.8) score += 15;
    if (available >= savingTarget) score += 30;
    else if (available > 0) score += 15;
    score += Math.min(30, streak * 2);
    if (goals.some((g) => g.saved >= g.target)) score += 10;
    return Math.min(100, score);
  }, [totalMonth, profile.income, available, savingTarget, streak, goals]);

  const scoreColor = healthScore >= 70 ? "#2ECC71" : healthScore >= 40 ? "#F39C12" : "#E74C3C";
  const scoreLabel = healthScore >= 70 ? "Ótimo! 🚀" : healthScore >= 40 ? "Melhorando 💪" : "Atenção! 🔥";

  return (
    <div className="space-y-4">
      {/* Header cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card bg-gradient-to-br from-purple-600 to-purple-800 text-white">
          <p className="text-xs opacity-75">Renda mensal</p>
          <p className="text-xl font-bold">{formatCurrency(profile.income)}</p>
        </div>
        <div className={`card text-white ${totalMonth > profile.income ? "bg-gradient-to-br from-red-500 to-red-700" : "bg-gradient-to-br from-indigo-500 to-indigo-700"}`}>
          <p className="text-xs opacity-75">Gastos do mês</p>
          <p className="text-xl font-bold">{formatCurrency(totalMonth)}</p>
        </div>
        <div className={`card text-white ${available < 0 ? "bg-gradient-to-br from-red-500 to-red-700" : "bg-gradient-to-br from-emerald-500 to-emerald-700"}`}>
          <p className="text-xs opacity-75">Disponível agora</p>
          <p className="text-xl font-bold">{formatCurrency(available)}</p>
        </div>
        <div className="card bg-gradient-to-br from-amber-500 to-orange-600 text-white">
          <p className="text-xs opacity-75">Meta poupança</p>
          <p className="text-xl font-bold">{formatCurrency(savingTarget)}</p>
        </div>
      </div>

      {/* Health score */}
      <div className="card">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-gray-700">Saúde Financeira</h3>
          <span className="text-sm font-bold" style={{ color: scoreColor }}>{scoreLabel}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-1">
          <div
            className="h-4 rounded-full transition-all duration-700"
            style={{ width: `${healthScore}%`, backgroundColor: scoreColor }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{healthScore}/100 pts</span>
          <span>🔥 {streak} dias seguidos</span>
        </div>
      </div>

      {/* Saving progress */}
      <div className="card">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-gray-700">Meta de Poupança ({profile.savingGoalPct}%)</h3>
          <span className="text-sm text-gray-500">{Math.round(savingPct)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="h-3 rounded-full transition-all duration-700"
            style={{ width: `${savingPct}%`, backgroundColor: savingPct >= 100 ? "#2ECC71" : "#6C63FF" }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {available >= savingTarget
            ? `✅ Você pode poupar ${formatCurrency(available)} este mês!`
            : `Faltam ${formatCurrency(savingTarget - available)} para atingir a meta`}
        </p>
      </div>

      {/* Pie chart */}
      {byCategory.length > 0 && (
        <div className="card">
          <h3 className="font-bold text-gray-700 mb-3">Gastos por Categoria</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={byCategory}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                labelLine={false}
                label={renderLabel}
              >
                {byCategory.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {byCategory.map((c) => (
              <div key={c.name} className="flex items-center gap-1 text-xs text-gray-600">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                <span>{c.icon} {c.name}</span>
                <span className="ml-auto font-medium">{formatCurrency(c.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bar chart */}
      <div className="card">
        <h3 className="font-bold text-gray-700 mb-3">Últimos 6 Meses</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={last6Months} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v/1000}k`} />
            <Tooltip formatter={(v) => formatCurrency(v)} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="renda" fill="#6C63FF" name="Renda" radius={[3, 3, 0, 0]} />
            <Bar dataKey="gastos" fill="#FF6B6B" name="Gastos" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {byCategory.length === 0 && (
        <div className="card text-center py-8">
          <p className="text-4xl mb-3">💸</p>
          <p className="text-gray-500 font-medium">Nenhum gasto registrado este mês</p>
          <p className="text-gray-400 text-sm mt-1">Vá em "Gastos" e adicione seu primeiro lançamento!</p>
        </div>
      )}
    </div>
  );
}
