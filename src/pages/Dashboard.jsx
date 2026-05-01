import { useAuth } from "@/lib/AuthContext";
import { Link } from "react-router-dom";
import { CheckSquare, Flame, BookOpen, TrendingUp, Circle, CheckCircle2, Loader2, ChartColumn } from "lucide-react";
import { format } from "date-fns";
import { useClarityData } from "@/hooks/useClarityData";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { tracker, isLoading } = useClarityData(currentUser);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const pendingTodos = tracker.pendingTodos;

  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const stats = [
    { label: "Pending Tasks", value: pendingTodos.length, icon: CheckSquare, color: "text-violet-500", bg: "bg-violet-50", link: "/todos" },
    { label: "Active Habits", value: tracker.habits.length, icon: Flame, color: "text-orange-500", bg: "bg-orange-50", link: "/habits" },
    { label: "Today's Progress", value: `${tracker.completionRate}%`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50", link: "/tracker" },
    { label: "Notes", value: tracker.notesCount, icon: BookOpen, color: "text-sky-500", bg: "bg-sky-50", link: "/notes" },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <p className="text-sm text-muted-foreground font-medium mb-1">{format(new Date(), "EEEE, MMMM d")}</p>
        <h1 className="font-playfair text-3xl text-foreground">
          {greeting}, {currentUser?.full_name?.split(" ")[0] || "there"}.
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {pendingTodos.length === 0
            ? "You're all caught up. Great work!"
            : `You have ${pendingTodos.length} task${pendingTodos.length > 1 ? "s" : ""} to tackle today.`}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, color, bg, link }) => (
          <Link key={label} to={link} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all group">
            <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-semibold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Habits */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Today's Habits</h2>
            <Link to="/habits" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {tracker.habits.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No habits yet. <Link to="/habits" className="text-primary hover:underline">Add one →</Link></p>
          ) : (
            <div className="space-y-2">
              {tracker.habits.slice(0, 5).map(habit => {
                const done = tracker.logs.some(l => l.habit_id === habit.id && l.date === tracker.today && l.completed);
                return (
                  <div key={habit.id} className="flex items-center gap-3 py-1.5">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${done ? "border-emerald-400 bg-emerald-400" : "border-border"}`}>
                      {done && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                    <span className="text-sm">{habit.icon} {habit.name}</span>
                    <span className={`ml-auto text-xs ${done ? "text-emerald-500" : "text-muted-foreground"}`}>
                      {done ? "Done" : "Pending"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Upcoming Tasks</h2>
            <Link to="/tracker" className="text-xs text-primary hover:underline">Open tracker</Link>
          </div>
          {pendingTodos.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">All done! 🎉</p>
          ) : (
            <div className="space-y-2">
              {pendingTodos.slice(0, 5).map(todo => (
                <div key={todo.id} className="flex items-center gap-3 py-1.5">
                  <Circle size={16} className="text-muted-foreground flex-shrink-0" />
                  <span className="text-sm flex-1 truncate">{todo.title}</span>
                  {todo.priority === "high" && (
                    <span className="text-xs text-red-400 bg-red-50 px-2 py-0.5 rounded-full">high</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-card border border-border rounded-xl p-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Connected progress tracking</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Your habits, tasks, and streaks now feed the tracker page automatically.
          </p>
        </div>
        <Link
          to="/tracker"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-all"
        >
          <ChartColumn size={16} />
          View Tracker
        </Link>
      </div>
    </div>
  );
}