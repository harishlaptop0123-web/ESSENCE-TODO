import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Plus, CheckCircle2, Circle, Trash2, Flame, X } from "lucide-react";
import { format, subDays } from "date-fns";

const EMOJIS = ["⭐","🏃","💧","📚","🧘","🌿","💪","🎯","✍️","🎨"];

export default function Habits() {
  const { currentUser } = useAuth();
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", icon: "⭐", frequency: "daily" });
  const today = format(new Date(), "yyyy-MM-dd");
  const last7 = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), 6 - i), "yyyy-MM-dd"));

  useEffect(() => {
    base44.entities.Habit.filter({ created_by: currentUser?.email, active: true }).then(setHabits);
    base44.entities.HabitLog.filter({ created_by: currentUser?.email }).then(setLogs);
  }, []);

  const toggleHabit = async (habit) => {
    const existingLog = logs.find(l => l.habit_id === habit.id && l.date === today);
    if (existingLog) {
      await base44.entities.HabitLog.delete(existingLog.id);
      setLogs(prev => prev.filter(l => l.id !== existingLog.id));
    } else {
      const newLog = await base44.entities.HabitLog.create({ habit_id: habit.id, date: today, completed: true });
      setLogs(prev => [...prev, newLog]);
    }
  };

  const addHabit = async () => {
    if (!form.name.trim()) return;
    const newHabit = await base44.entities.Habit.create({ ...form, active: true });
    setHabits(prev => [...prev, newHabit]);
    setForm({ name: "", description: "", icon: "⭐", frequency: "daily" });
    setShowForm(false);
  };

  const deleteHabit = async (id) => {
    await base44.entities.Habit.update(id, { active: false });
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const isCompletedOnDate = (habitId, date) => logs.some(l => l.habit_id === habitId && l.date === date && l.completed);
  const getStreak = (habit) => {
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const d = format(subDays(new Date(), i), "yyyy-MM-dd");
      if (isCompletedOnDate(habit.id, d)) streak++;
      else break;
    }
    return streak;
  };

  const completedToday = habits.filter(h => isCompletedOnDate(h.id, today)).length;

  return (
    <div className="p-8 max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-playfair text-3xl text-foreground">Habits</h1>
          <p className="text-sm text-muted-foreground mt-1">{completedToday} of {habits.length} done today</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-all"
        >
          <Plus size={16} /> New habit
        </button>
      </div>

      {/* Add form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-foreground">New Habit</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setForm(f => ({...f, icon: e}))}
                    className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${form.icon === e ? "bg-accent border-2 border-primary" : "bg-muted hover:bg-accent"}`}>
                    {e}
                  </button>
                ))}
              </div>
              <input
                className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
                placeholder="Habit name"
                value={form.name}
                onChange={e => setForm(f => ({...f, name: e.target.value}))}
              />
              <input
                className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
                placeholder="Description (optional)"
                value={form.description}
                onChange={e => setForm(f => ({...f, description: e.target.value}))}
              />
              <select
                className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm outline-none"
                value={form.frequency}
                onChange={e => setForm(f => ({...f, frequency: e.target.value}))}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
              <button
                onClick={addHabit}
                className="w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-medium hover:opacity-90 transition-all"
              >
                Create Habit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Week header */}
      {habits.length > 0 && (
        <div className="flex items-center gap-2 mb-3 pl-0">
          <div className="flex-1" />
          <div className="flex gap-1">
            {last7.map(d => (
              <div key={d} className="w-8 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">{format(new Date(d + "T00:00:00"), "EEE")[0]}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Habits list */}
      {habits.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          <Flame size={32} className="mx-auto mb-3 opacity-20" />
          <p>No habits yet. Start building one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map(habit => {
            const doneToday = isCompletedOnDate(habit.id, today);
            const streak = getStreak(habit);
            return (
              <div key={habit.id} className="group bg-card border border-border rounded-xl px-4 py-3.5 flex items-center gap-4 hover:shadow-sm transition-all">
                <button onClick={() => toggleHabit(habit)} className="flex-shrink-0">
                  {doneToday
                    ? <CheckCircle2 size={20} className="text-primary" />
                    : <Circle size={20} className="text-muted-foreground hover:text-primary transition-colors" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span>{habit.icon}</span>
                    <span className="text-sm font-medium text-foreground truncate">{habit.name}</span>
                    {streak > 0 && (
                      <span className="text-xs text-orange-500 flex items-center gap-0.5 ml-1">
                        <Flame size={11} /> {streak}
                      </span>
                    )}
                  </div>
                </div>
                {/* 7-day tracker */}
                <div className="flex gap-1">
                  {last7.map(d => (
                    <div key={d} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all ${
                      isCompletedOnDate(habit.id, d) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {isCompletedOnDate(habit.id, d) ? "✓" : "·"}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all ml-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}