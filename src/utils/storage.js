const KEYS = {
  expenses: "fl_expenses",
  goals: "fl_goals",
  checkins: "fl_checkins",
  profile: "fl_profile",
};

export const storage = {
  getExpenses: () => JSON.parse(localStorage.getItem(KEYS.expenses) || "[]"),
  saveExpenses: (data) => localStorage.setItem(KEYS.expenses, JSON.stringify(data)),

  getGoals: () => JSON.parse(localStorage.getItem(KEYS.goals) || "[]"),
  saveGoals: (data) => localStorage.setItem(KEYS.goals, JSON.stringify(data)),

  getCheckins: () => JSON.parse(localStorage.getItem(KEYS.checkins) || "[]"),
  saveCheckins: (data) => localStorage.setItem(KEYS.checkins, JSON.stringify(data)),

  getProfile: () =>
    JSON.parse(
      localStorage.getItem(KEYS.profile) ||
        JSON.stringify({ income: 3000, savingGoalPct: 20, name: "Você" })
    ),
  saveProfile: (data) => localStorage.setItem(KEYS.profile, JSON.stringify(data)),
};

export const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

export const today = () => new Date().toISOString().split("T")[0];

export const thisMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export const monthLabel = (ym) => {
  const [y, m] = ym.split("-");
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${months[parseInt(m) - 1]}/${y.slice(2)}`;
};
