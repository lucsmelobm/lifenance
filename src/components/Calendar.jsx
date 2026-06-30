import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { dbExpenses, dbBills, dbIncome } from "../lib/db";
import { storage, formatCurrency } from "../utils/storage";
import { CATEGORIES } from "../data/tips";

const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const WEEKDAYS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

function DayPicker({ value, onChange }) {
  const now = new Date();
  const [open, setOpen]           = useState(false);
  const [viewYear, setViewYear]   = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const goPrev = (e) => { e.stopPropagation(); if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); } else setViewMonth(m => m - 1); };
  const goNext = (e) => { e.stopPropagation(); if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); } else setViewMonth(m => m + 1); };

  const btnBase = { background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 8, color: "var(--text-1)", fontSize: 16 };

  return (
    <div style={{ position: "relative", flex: 1 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%", background: "var(--input-bg)",
          border: `1.5px solid ${open ? "var(--accent)" : "var(--border)"}`,
          borderRadius: 14, padding: "12px 15px", fontSize: 13,
          color: value ? "var(--text-1)" : "var(--text-3)", textAlign: "left",
          cursor: "pointer", boxShadow: open ? "0 0 0 3px rgba(184,242,60,0.15)" : "none",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}
      >
        <span>{value ? `Dia ${value} de cada mês` : "Selecionar dia de vencimento"}</span>
        <span style={{ fontSize: 11, color: "var(--text-3)" }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 200,
          background: "var(--surface)", border: "1.5px solid var(--accent)",
          borderRadius: 18, padding: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
        }}>
          {/* Month/year navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <button style={btnBase} onClick={goPrev}>‹</button>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button style={btnBase} onClick={goNext}>›</button>
          </div>

          {/* Weekday headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 4 }}>
            {WEEKDAYS.map((d) => (
              <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "var(--text-3)", padding: "2px 0" }}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
            {cells.map((d, i) => d ? (
              <button
                key={i}
                type="button"
                onClick={() => { onChange(d); setOpen(false); }}
                style={{
                  aspectRatio: "1", borderRadius: 8, border: "none",
                  background: value === d ? "var(--accent)" : "var(--surface-2)",
                  color: value === d ? "var(--accent-fg)" : "var(--text-1)",
                  fontWeight: value === d ? 800 : 400,
                  fontSize: 12, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >{d}</button>
            ) : <div key={i} />)}
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{ width: "100%", marginTop: 10, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, padding: "8px", fontSize: 12, color: "var(--text-2)", cursor: "pointer", fontWeight: 600 }}
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  );
}

function pad(n) { return String(n).padStart(2, "0"); }
function ymd(y, m, d) { return `${y}-${pad(m + 1)}-${pad(d)}`; }
function toDateParts(date) { const d = new Date(date + "T12:00:00"); return [d.getFullYear(), d.getMonth(), d.getDate()]; }

const CAT_COLORS = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.color]));

export default function Calendar({ isCloud, onAddExpense }) {
  const { user, profile } = useAuth() || {};
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [expenses,  setExpenses]  = useState([]);
  const [bills,     setBills]     = useState([]);
  const [income,    setIncome]    = useState([]);
  const [selDay,    setSelDay]    = useState(null);
  const [showBillForm, setShowBillForm] = useState(false);
  const [showIncForm,  setShowIncForm]  = useState(false);
  const [billForm, setBillForm] = useState({ name: "", amount: "", due_day: "", category: "outros" });
  const [incForm,  setIncForm]  = useState({ description: "", amount: "", date: "" });
  const [loading, setLoading]   = useState(false);
  const [editExpId, setEditExpId] = useState(null);
  const [editExpForm, setEditExpForm] = useState({});

  const monthStr = `${year}-${pad(month + 1)}`;

  const load = useCallback(async () => {
    setLoading(true);
    if (isCloud && user) {
      const [e, b, i] = await Promise.all([
        dbExpenses.list(user.id, true),
        dbBills.list(user.id),
        dbIncome.list(user.id, monthStr),
      ]);
      setExpenses(e.filter((x) => x.date.startsWith(monthStr)));
      setBills(b);
      setIncome(i);
    } else {
      const all = storage.getExpenses();
      setExpenses(all.filter((e) => e.date.startsWith(monthStr)));
      setBills(JSON.parse(localStorage.getItem("lf_fixed_bills") || "[]"));
      setIncome(JSON.parse(localStorage.getItem(`lf_inc_${monthStr}`) || "[]"));
    }
    setLoading(false);
  }, [isCloud, user, monthStr]);

  useEffect(() => { load(); }, [load]);

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); setSelDay(null); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); setSelDay(null); };

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const expByDay = {};
  expenses.forEach((e) => { const [,,d] = toDateParts(e.date); expByDay[d] = [...(expByDay[d] || []), e]; });
  const billsByDay = {};
  bills.forEach((b) => { billsByDay[b.due_day] = [...(billsByDay[b.due_day] || []), b]; });
  const incByDay = {};
  income.forEach((i) => { const [,,d] = toDateParts(i.date); incByDay[d] = [...(incByDay[d] || []), i]; });

  const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  // Selected day data
  const selDateStr = selDay ? ymd(year, month, selDay) : null;
  const selExpenses = selDay ? (expByDay[selDay] || []) : [];
  const selBills    = selDay ? (billsByDay[selDay] || []) : [];
  const selIncome   = selDay ? (incByDay[selDay] || []) : [];

  const addBill = async () => {
    if (!billForm.name || !billForm.amount || !billForm.due_day) return;
    const b = { ...billForm, amount: parseFloat(billForm.amount), due_day: parseInt(billForm.due_day) };
    if (isCloud && user) await dbBills.add(user.id, b);
    else {
      const list = JSON.parse(localStorage.getItem("lf_fixed_bills") || "[]");
      localStorage.setItem("lf_fixed_bills", JSON.stringify([...list, { id: Date.now(), ...b }]));
    }
    setBillForm({ name: "", amount: "", due_day: "", category: "outros" });
    setShowBillForm(false);
    load();
  };

  const removeBill = async (id) => {
    if (!window.confirm("Remover esta fatura fixa?")) return;
    if (isCloud) await dbBills.remove(id);
    else {
      const list = JSON.parse(localStorage.getItem("lf_fixed_bills") || "[]");
      localStorage.setItem("lf_fixed_bills", JSON.stringify(list.filter((b) => b.id !== id)));
    }
    load();
  };

  const addIncome = async () => {
    if (!incForm.description || !incForm.amount) return;
    const inc = { description: incForm.description, amount: parseFloat(incForm.amount), date: incForm.date || selDateStr };
    if (isCloud && user) await dbIncome.add(user.id, inc);
    else {
      const list = JSON.parse(localStorage.getItem(`lf_inc_${monthStr}`) || "[]");
      localStorage.setItem(`lf_inc_${monthStr}`, JSON.stringify([...list, { id: Date.now(), ...inc }]));
    }
    setIncForm({ description: "", amount: "", date: "" });
    setShowIncForm(false);
    load();
  };

  const removeIncome = async (id) => {
    if (isCloud) await dbIncome.remove(id);
    else {
      const list = JSON.parse(localStorage.getItem(`lf_inc_${monthStr}`) || "[]");
      localStorage.setItem(`lf_inc_${monthStr}`, JSON.stringify(list.filter((i) => i.id !== id)));
    }
    load();
  };

  const removeExpense = async (id) => {
    if (!window.confirm("Apagar este gasto?")) return;
    if (isCloud) await dbExpenses.remove(id);
    else {
      const list = storage.getExpenses();
      storage.saveExpenses(list.filter((e) => e.id !== id));
    }
    load();
  };

  const startEditExp = (e) => { setEditExpId(e.id); setEditExpForm({ description: e.description, amount: String(e.amount), category: e.category }); };
  const saveEditExp  = async () => {
    const updates = { description: editExpForm.description, amount: parseFloat(editExpForm.amount), category: editExpForm.category };
    if (isCloud) await dbExpenses.update(editExpId, updates);
    else {
      const list = storage.getExpenses();
      storage.saveExpenses(list.map((e) => e.id === editExpId ? { ...e, ...updates } : e));
    }
    setEditExpId(null);
    load();
  };

  const totalExpMonth = expenses.reduce((s, e) => s + e.amount, 0);
  const totalIncMonth = income.reduce((s, i) => s + i.amount, 0);
  const totalBillsMonth = bills.reduce((s, b) => s + b.amount, 0);

  const card = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18 };

  return (
    <div style={{ minHeight: "100svh", background: "var(--bg)", padding: "52px 0 24px" }}>
      {/* Header */}
      <div style={{ padding: "0 20px 16px" }}>
        <p style={{ margin: "0 0 2px", fontSize: 22, fontWeight: 800, color: "var(--text-1)" }}>Calendário 📅</p>
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)" }}>Faturas, gastos e renda do mês</p>
      </div>

      {/* Month summary */}
      <div style={{ display: "flex", gap: 10, padding: "0 20px 16px", overflowX: "auto" }} className="no-scrollbar">
        {[
          { label: "Gastos", value: totalExpMonth, color: "var(--red)" },
          { label: "Faturas fixas", value: totalBillsMonth, color: "#F59E0B" },
          { label: "Renda extra", value: totalIncMonth, color: "var(--green)" },
        ].map((item) => (
          <div key={item.label} style={{ ...card, padding: "12px 16px", flexShrink: 0 }}>
            <p style={{ margin: "0 0 2px", fontSize: 11, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: 0.4 }}>{item.label}</p>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: item.color }}>{formatCurrency(item.value)}</p>
          </div>
        ))}
      </div>

      {/* Month nav */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px 12px" }}>
        <button onClick={prevMonth} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, width: 36, height: 36, cursor: "pointer", fontSize: 16, color: "var(--text-1)" }}>←</button>
        <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--text-1)" }}>{MONTHS[month]} {year}</p>
        <button onClick={nextMonth} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, width: 36, height: 36, cursor: "pointer", fontSize: 16, color: "var(--text-1)" }}>→</button>
      </div>

      {/* Calendar grid */}
      <div style={{ padding: "0 16px", marginBottom: 16 }}>
        {/* Weekday header */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 4 }}>
          {WEEKDAYS.map((d) => (
            <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: "var(--text-3)", padding: "4px 0" }}>{d}</div>
          ))}
        </div>
        {/* Day cells */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const hasExp  = expByDay[d]?.length > 0;
            const hasBill = billsByDay[d]?.length > 0;
            const hasInc  = incByDay[d]?.length > 0;
            const selected = selDay === d;
            const todayCell = isToday(d);
            return (
              <button
                key={i}
                onClick={() => setSelDay(selected ? null : d)}
                style={{
                  aspectRatio: "1",
                  borderRadius: 10,
                  border: selected ? "2px solid var(--accent)" : todayCell ? "2px solid var(--accent)" : "1px solid var(--border)",
                  background: selected ? "rgba(184,242,60,0.15)" : todayCell ? "rgba(184,242,60,0.08)" : "var(--surface)",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 2,
                  gap: 1,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: todayCell ? 800 : 500, color: todayCell ? "var(--accent)" : "var(--text-1)", lineHeight: 1 }}>{d}</span>
                {(hasExp || hasBill || hasInc) && (
                  <div style={{ display: "flex", gap: 2 }}>
                    {hasExp  && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--red)" }} />}
                    {hasBill && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#F59E0B" }} />}
                    {hasInc  && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green)" }} />}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day panel */}
      {selDay && (
        <div style={{ padding: "0 16px 16px" }}>
          <div style={{ ...card, padding: "18px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-1)" }}>
                {pad(selDay)}/{pad(month + 1)}/{year}
              </p>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setShowIncForm(!showIncForm)} style={{ background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 10, padding: "6px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", color: "var(--green)" }}>+ Renda</button>
                <button onClick={onAddExpense} style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "6px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", color: "var(--red)" }}>+ Gasto</button>
              </div>
            </div>

            {/* Add income form */}
            {showIncForm && (
              <div style={{ background: "var(--surface-2)", borderRadius: 14, padding: "14px", marginBottom: 12, border: "1px solid rgba(74,222,128,0.2)" }}>
                <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "var(--green)" }}>+ Adicionar Renda Extra</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <input className="lf-input" placeholder="Descrição (ex: freela de edição)" value={incForm.description} onChange={(e) => setIncForm({ ...incForm, description: e.target.value })} style={{ fontSize: 13 }} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <input className="lf-input" type="number" placeholder="Valor R$" value={incForm.amount} onChange={(e) => setIncForm({ ...incForm, amount: e.target.value })} style={{ flex: 1, fontSize: 13 }} />
                    <button onClick={addIncome} style={{ background: "var(--green)", color: "#fff", border: "none", borderRadius: 12, padding: "0 16px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>✓</button>
                    <button onClick={() => setShowIncForm(false)} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "0 12px", cursor: "pointer", color: "var(--text-2)" }}>×</button>
                  </div>
                </div>
              </div>
            )}

            {/* Fixed bills on this day */}
            {selBills.map((b) => (
              <div key={b.id} style={{ display: "flex", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(245,158,11,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📄</div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{b.name}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#F59E0B" }}>Fatura fixa · dia {b.due_day}</p>
                </div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#F59E0B" }}>{formatCurrency(b.amount)}</p>
              </div>
            ))}

            {/* Extra income */}
            {selIncome.map((inc) => (
              <div key={inc.id} style={{ display: "flex", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(74,222,128,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💵</div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{inc.description}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "var(--green)" }}>Renda extra</p>
                </div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--green)" }}>+{formatCurrency(inc.amount)}</p>
                <button onClick={() => removeIncome(inc.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", fontSize: 18, lineHeight: 1 }}>×</button>
              </div>
            ))}

            {/* Expenses */}
            {selExpenses.map((e) => {
              const cat = CATEGORIES.find((c) => c.id === e.category) || CATEGORIES.at(-1);
              const isEditing = editExpId === e.id;
              return (
                <div key={e.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  {isEditing ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <input className="lf-input" value={editExpForm.description} onChange={(ev) => setEditExpForm({ ...editExpForm, description: ev.target.value })} style={{ fontSize: 13 }} autoFocus />
                      <div style={{ display: "flex", gap: 6 }}>
                        <input className="lf-input" type="number" value={editExpForm.amount} onChange={(ev) => setEditExpForm({ ...editExpForm, amount: ev.target.value })} style={{ flex: 1, fontSize: 13 }} />
                        <button onClick={saveEditExp} style={{ background: "var(--accent)", color: "var(--accent-fg)", border: "none", borderRadius: 10, padding: "0 14px", fontWeight: 700, cursor: "pointer" }}>✓</button>
                        <button onClick={() => setEditExpId(null)} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, padding: "0 10px", cursor: "pointer", color: "var(--text-2)" }}>×</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: cat.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{cat.icon}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{e.description}</p>
                        <p style={{ margin: 0, fontSize: 11, color: "var(--text-2)" }}>
                          {cat.label}
                          {e.profiles && <span style={{ color: e.profiles.color || "var(--accent)", marginLeft: 6 }}>● {e.profiles.name}</span>}
                        </p>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--red)" }}>-{formatCurrency(e.amount)}</p>
                      <button onClick={() => startEditExp(e)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "var(--text-2)" }}>✏️</button>
                      <button onClick={() => removeExpense(e.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "var(--text-3)", lineHeight: 1 }}>×</button>
                    </div>
                  )}
                </div>
              );
            })}

            {selExpenses.length === 0 && selBills.length === 0 && selIncome.length === 0 && (
              <p style={{ textAlign: "center", color: "var(--text-3)", fontSize: 13, padding: "16px 0 0" }}>Nenhum lançamento neste dia</p>
            )}
          </div>
        </div>
      )}

      {/* Fixed bills management */}
      <div style={{ padding: "0 16px" }}>
        <div style={{ ...card, padding: "18px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-1)" }}>Faturas Fixas 📄</p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--text-2)" }}>Aparecem no calendário todo mês</p>
            </div>
            <button onClick={() => setShowBillForm(!showBillForm)} style={{ background: showBillForm ? "var(--surface-2)" : "var(--accent)", color: showBillForm ? "var(--text-2)" : "var(--accent-fg)", border: showBillForm ? "1px solid var(--border)" : "none", borderRadius: 999, width: 36, height: 36, fontSize: 20, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {showBillForm ? "×" : "+"}
            </button>
          </div>

          {showBillForm && (
            <div style={{ background: "var(--surface-2)", borderRadius: 14, padding: "14px", marginBottom: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input className="lf-input" placeholder="Nome da fatura (ex: Cartão Nubank)" value={billForm.name} onChange={(e) => setBillForm({ ...billForm, name: e.target.value })} style={{ fontSize: 13 }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="lf-input" type="number" placeholder="Valor R$" value={billForm.amount} onChange={(e) => setBillForm({ ...billForm, amount: e.target.value })} style={{ flex: 1, fontSize: 13 }} />
                </div>
                <DayPicker value={billForm.due_day} onChange={(d) => setBillForm({ ...billForm, due_day: d })} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={addBill} style={{ flex: 1, background: "var(--accent)", color: "var(--accent-fg)", border: "none", borderRadius: 12, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Salvar fatura</button>
                  <button onClick={() => setShowBillForm(false)} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 16px", cursor: "pointer", color: "var(--text-2)" }}>×</button>
                </div>
              </div>
            </div>
          )}

          {bills.length === 0 ? (
            <p style={{ color: "var(--text-3)", fontSize: 13, textAlign: "center", padding: "12px 0" }}>Nenhuma fatura fixa cadastrada</p>
          ) : (
            bills.map((b) => (
              <div key={b.id} style={{ display: "flex", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(245,158,11,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📄</div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{b.name}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "var(--text-2)" }}>Vence todo dia {b.due_day}</p>
                </div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#F59E0B" }}>{formatCurrency(b.amount)}</p>
                <button onClick={() => removeBill(b.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", fontSize: 18, lineHeight: 1 }}>×</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
