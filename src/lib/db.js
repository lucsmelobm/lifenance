import { getSb } from "./supabase";

// ── EXPENSES ──────────────────────────────────────────────
export const dbExpenses = {
  list: async (userId, partnerMode = false) => {
    const q = getSb().from("expenses").select("*, profiles(name,color)").order("date", { ascending: false });
    if (!partnerMode) q.eq("user_id", userId);
    const { data } = await q;
    return data || [];
  },
  add: async (userId, e) => {
    const { data } = await getSb().from("expenses").insert({ ...e, user_id: userId }).select().single();
    return data;
  },
  update: async (id, updates) => {
    await getSb().from("expenses").update(updates).eq("id", id);
  },
  remove: async (id) => {
    await getSb().from("expenses").delete().eq("id", id);
  },
};

// ── GOALS ─────────────────────────────────────────────────
export const dbGoals = {
  list: async (userId) => {
    const { data } = await getSb().from("goals").select("*").eq("user_id", userId).order("id");
    return data || [];
  },
  add: async (userId, g) => {
    const { data } = await getSb().from("goals").insert({ ...g, user_id: userId }).select().single();
    return data;
  },
  update: async (id, updates) => {
    await getSb().from("goals").update(updates).eq("id", id);
  },
  remove: async (id) => {
    await getSb().from("goals").delete().eq("id", id);
  },
};

// ── FIXED BILLS ───────────────────────────────────────────
export const dbBills = {
  list: async (userId) => {
    const { data } = await getSb().from("fixed_bills").select("*").eq("user_id", userId).order("due_day");
    return data || [];
  },
  add: async (userId, b) => {
    const { data } = await getSb().from("fixed_bills").insert({ ...b, user_id: userId }).select().single();
    return data;
  },
  update: async (id, updates) => {
    await getSb().from("fixed_bills").update(updates).eq("id", id);
  },
  remove: async (id) => {
    await getSb().from("fixed_bills").delete().eq("id", id);
  },
};

// ── EXTRA INCOME ──────────────────────────────────────────
export const dbIncome = {
  list: async (userId, month) => {
    const { data } = await getSb().from("extra_income").select("*").eq("user_id", userId).gte("date", month + "-01").lte("date", month + "-31").order("date");
    return data || [];
  },
  add: async (userId, inc) => {
    const { data } = await getSb().from("extra_income").insert({ ...inc, user_id: userId }).select().single();
    return data;
  },
  remove: async (id) => {
    await getSb().from("extra_income").delete().eq("id", id);
  },
};

// ── CHECKINS ──────────────────────────────────────────────
export const dbCheckins = {
  list: async (userId) => {
    const { data } = await getSb().from("checkins").select("*").eq("user_id", userId).order("date", { ascending: false }).limit(60);
    return data || [];
  },
  upsert: async (userId, date, habits) => {
    await getSb().from("checkins").upsert({ user_id: userId, date, habits }, { onConflict: "user_id,date" });
  },
};
