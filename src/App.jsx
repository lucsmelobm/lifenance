import { useState, useCallback } from "react";
import Dashboard from "./components/Dashboard";
import Expenses from "./components/Expenses";
import Goals from "./components/Goals";
import Daily from "./components/Daily";
import Settings from "./components/Settings";
import "./App.css";

const TABS = [
  { id: "dashboard", label: "Início", icon: "🏠" },
  { id: "expenses", label: "Gastos", icon: "💸" },
  { id: "goals", label: "Metas", icon: "🎯" },
  { id: "daily", label: "Diário", icon: "✅" },
  { id: "settings", label: "Config", icon: "⚙️" },
];

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm font-black">LF</span>
        </div>
        <div>
          <h1 className="font-black text-gray-800 leading-none">Lifenance</h1>
          <p className="text-xs text-gray-400">Controle. Liberdade. Sonhos.</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 pb-24 max-w-lg mx-auto w-full">
        {tab === "dashboard" && <Dashboard key={`dash-${tick}`} />}
        {tab === "expenses" && <Expenses key={`exp-${tick}`} onUpdate={refresh} />}
        {tab === "goals" && <Goals key={`goals-${tick}`} onUpdate={refresh} />}
        {tab === "daily" && <Daily key={`daily-${tick}`} onUpdate={refresh} />}
        {tab === "settings" && <Settings key={`settings-${tick}`} onUpdate={refresh} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-10">
        <div className="flex max-w-lg mx-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex flex-col items-center py-2 px-1 transition-all ${
                tab === t.id ? "text-purple-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className={`text-xl transition-transform ${tab === t.id ? "scale-110" : ""}`}>
                {t.icon}
              </span>
              <span className={`text-xs mt-0.5 font-medium ${tab === t.id ? "text-purple-600" : ""}`}>
                {t.label}
              </span>
              {tab === t.id && (
                <span className="w-1 h-1 bg-purple-600 rounded-full mt-0.5" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
