import { useState } from "react";
import { storage, formatCurrency } from "../utils/storage";

export default function Settings({ onUpdate }) {
  const [profile, setProfile] = useState(storage.getProfile());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    storage.saveProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onUpdate?.();
  };

  const handleClearData = () => {
    if (window.confirm("Isso vai apagar TODOS os seus dados. Tem certeza?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const savingAmount = profile.income * (profile.savingGoalPct / 100);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-800">Configurações ⚙️</h2>
        <p className="text-sm text-gray-500">Personalize seu app</p>
      </div>

      <div className="card">
        <h3 className="font-bold text-gray-700 mb-4">Perfil Financeiro</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Seu nome</label>
            <input
              className="input-field"
              placeholder="Como quer ser chamado?"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Renda mensal (R$)</label>
            <input
              className="input-field"
              type="number"
              min="0"
              placeholder="Ex: 3000"
              value={profile.income}
              onChange={(e) => setProfile({ ...profile, income: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Meta de poupança: <strong className="text-purple-600">{profile.savingGoalPct}%</strong>
              <span className="text-gray-400 ml-2">= {formatCurrency(savingAmount)}/mês</span>
            </label>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={profile.savingGoalPct}
              onChange={(e) => setProfile({ ...profile, savingGoalPct: parseInt(e.target.value) })}
              className="w-full accent-purple-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>5% (conservador)</span>
              <span>20% (recomendado)</span>
              <span>50% (agressivo)</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className={`w-full mt-4 py-3 rounded-xl font-bold transition-all ${
            saved ? "bg-green-500 text-white" : "bg-purple-600 text-white hover:bg-purple-700"
          }`}
        >
          {saved ? "✓ Salvo!" : "Salvar Configurações"}
        </button>
      </div>

      {/* How it works */}
      <div className="card bg-purple-50 border border-purple-100">
        <h3 className="font-bold text-purple-800 mb-3">📖 Como usar o app</h3>
        <div className="space-y-2 text-sm text-purple-700">
          <p><strong>🏠 Dashboard</strong> — visão geral dos seus gastos e saúde financeira</p>
          <p><strong>💸 Gastos</strong> — anote cada gasto, por menor que seja</p>
          <p><strong>🎯 Metas</strong> — crie objetivos como a viagem de avião e acompanhe o progresso</p>
          <p><strong>✅ Diário</strong> — check-in e dica financeira nova todo dia</p>
        </div>
      </div>

      <div className="card">
        <h3 className="font-bold text-gray-700 mb-2">A regra de ouro 🥇</h3>
        <p className="text-sm text-gray-600">
          Com {formatCurrency(profile.income)} de renda, você deveria gastar no máximo{" "}
          <strong className="text-green-600">{formatCurrency(profile.income * 0.5)}</strong> em necessidades,{" "}
          <strong className="text-yellow-600">{formatCurrency(profile.income * 0.3)}</strong> em desejos
          e guardar <strong className="text-purple-600">{formatCurrency(profile.income * 0.2)}</strong> todo mês.
        </p>
      </div>

      <div className="card border border-red-100">
        <h3 className="font-bold text-red-500 mb-2">Zona de perigo ⚠️</h3>
        <p className="text-sm text-gray-500 mb-3">
          Apaga todos os dados do app. Não tem como desfazer.
        </p>
        <button
          onClick={handleClearData}
          className="w-full bg-red-50 text-red-500 border border-red-200 py-2 rounded-xl text-sm font-medium hover:bg-red-100 transition"
        >
          Apagar todos os dados
        </button>
      </div>
    </div>
  );
}
