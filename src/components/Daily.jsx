import { useState, useMemo } from "react";
import { storage, today } from "../utils/storage";
import { TIPS } from "../data/tips";

const HABITS = [
  { id: "anotar", label: "Anotei todos meus gastos de hoje", icon: "📝" },
  { id: "nao_impulso", label: "Não fiz compras por impulso", icon: "🛑" },
  { id: "meta", label: "Pensei na minha meta do dia", icon: "🎯" },
  { id: "dica", label: "Li a dica financeira de hoje", icon: "💡" },
];

export default function Daily({ onUpdate }) {
  const [checkins, setCheckins] = useState(storage.getCheckins());
  const [tipIndex, setTipIndex] = useState(() => {
    const d = new Date();
    return (d.getDate() + d.getMonth() * 3) % TIPS.length;
  });
  const [showFullTip, setShowFullTip] = useState(false);

  const todayStr = today();
  const todayCheckin = checkins.find((c) => c.date === todayStr) || { date: todayStr, habits: [] };
  const alreadyCompleted = todayCheckin.habits || [];

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

  const toggleHabit = (id) => {
    const updated = alreadyCompleted.includes(id)
      ? alreadyCompleted.filter((h) => h !== id)
      : [...alreadyCompleted, id];

    const newCheckin = { date: todayStr, habits: updated };
    const newCheckins = [
      ...checkins.filter((c) => c.date !== todayStr),
      newCheckin,
    ];
    storage.saveCheckins(newCheckins);
    setCheckins(newCheckins);
    onUpdate?.();
  };

  const tip = TIPS[tipIndex];
  const completedCount = alreadyCompleted.length;
  const totalHabits = HABITS.length;
  const pct = Math.round((completedCount / totalHabits) * 100);

  const last7 = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const check = checkins.find((c) => c.date === dateStr);
      const weekdays = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
      days.push({
        label: i === 0 ? "Hoje" : weekdays[d.getDay()],
        completed: check ? check.habits.length : 0,
        total: totalHabits,
        date: dateStr,
      });
    }
    return days;
  }, [checkins, totalHabits]);

  return (
    <div className="space-y-4">
      {/* Streak */}
      <div className="card bg-gradient-to-r from-orange-400 to-pink-500 text-white text-center py-5">
        <p className="text-5xl font-black">{streak}</p>
        <p className="text-sm opacity-90 mt-1">
          {streak === 0 ? "Comece hoje sua sequência!" : streak === 1 ? "dia seguido 🔥 Não quebre!" : `dias seguidos 🔥 Incrível!`}
        </p>
      </div>

      {/* Today progress */}
      <div className="card">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-gray-800">Check-in de Hoje</h3>
          <span className="text-sm font-bold text-purple-600">{completedCount}/{totalHabits}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            className="h-3 rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: pct === 100 ? "#2ECC71" : "#6C63FF" }}
          />
        </div>
        <div className="space-y-2">
          {HABITS.map((h) => {
            const done = alreadyCompleted.includes(h.id);
            return (
              <button
                key={h.id}
                onClick={() => toggleHabit(h.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                  done
                    ? "border-green-300 bg-green-50 text-green-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-purple-300"
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  done ? "bg-green-500 border-green-500" : "border-gray-300"
                }`}>
                  {done && <span className="text-white text-xs">✓</span>}
                </div>
                <span className="text-lg">{h.icon}</span>
                <span className="text-sm font-medium">{h.label}</span>
              </button>
            );
          })}
        </div>
        {pct === 100 && (
          <div className="mt-3 p-3 bg-green-50 rounded-xl text-center">
            <p className="text-green-700 font-bold">🎉 Check-in completo! Você arrasoooou hoje!</p>
          </div>
        )}
      </div>

      {/* 7-day view */}
      <div className="card">
        <h3 className="font-bold text-gray-800 mb-3">Últimos 7 Dias</h3>
        <div className="flex gap-1 justify-between">
          {last7.map((d) => {
            const p = d.total > 0 ? d.completed / d.total : 0;
            const isToday = d.label === "Hoje";
            return (
              <div key={d.date} className="flex flex-col items-center gap-1 flex-1">
                <div className="relative w-full flex justify-center">
                  <div className="w-8 bg-gray-100 rounded-full overflow-hidden" style={{ height: 60 }}>
                    <div
                      className="absolute bottom-0 w-full rounded-full transition-all duration-500"
                      style={{
                        height: `${p * 100}%`,
                        backgroundColor: p === 1 ? "#2ECC71" : p > 0.5 ? "#6C63FF" : p > 0 ? "#F39C12" : "#E5E7EB",
                        width: 32,
                      }}
                    />
                  </div>
                </div>
                <p className={`text-xs font-medium ${isToday ? "text-purple-600" : "text-gray-500"}`}>{d.label}</p>
                <p className="text-xs text-gray-400">{d.completed}/{d.total}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily tip */}
      <div className="card border-l-4 border-purple-500">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{tip.icon}</span>
            <div>
              <p className="text-xs text-purple-500 font-medium uppercase tracking-wide">{tip.category}</p>
              <h3 className="font-bold text-gray-800">{tip.title}</h3>
            </div>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            tip.impact === "Crítico" ? "bg-red-100 text-red-600" :
            tip.impact === "Transformador" ? "bg-purple-100 text-purple-600" :
            tip.impact === "Alto" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
          }`}>
            {tip.impact}
          </span>
        </div>

        <p className="text-gray-600 text-sm leading-relaxed">
          {showFullTip ? tip.tip : tip.tip.slice(0, 120) + (tip.tip.length > 120 ? "..." : "")}
        </p>
        {tip.tip.length > 120 && (
          <button
            onClick={() => setShowFullTip(!showFullTip)}
            className="text-purple-500 text-sm mt-1 font-medium"
          >
            {showFullTip ? "Mostrar menos" : "Ler mais"}
          </button>
        )}

        {showFullTip && (
          <div className="mt-3 p-3 bg-purple-50 rounded-xl">
            <p className="text-xs text-purple-600 font-bold uppercase mb-1">Ação de hoje:</p>
            <p className="text-sm text-purple-800">{tip.action}</p>
          </div>
        )}

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => { setTipIndex((tipIndex - 1 + TIPS.length) % TIPS.length); setShowFullTip(false); }}
            className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
          >
            ← Anterior
          </button>
          <button
            onClick={() => { setTipIndex((tipIndex + 1) % TIPS.length); setShowFullTip(false); }}
            className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition"
          >
            Próxima →
          </button>
        </div>
      </div>
    </div>
  );
}
