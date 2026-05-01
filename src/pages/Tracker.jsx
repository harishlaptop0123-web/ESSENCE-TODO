import { BarChart3, CalendarRange, CheckCircle2, Flame, Loader2, Target } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useClarityData } from "@/hooks/useClarityData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, PolarAngleAxis, RadialBar, RadialBarChart, XAxis } from "recharts";

const progressChartConfig = {
  completed: {
    label: "Completed",
    color: "hsl(var(--primary))",
  },
  rate: {
    label: "Rate",
    color: "#22c55e",
  },
};

export default function Tracker() {
  const { currentUser } = useAuth();
  const { tracker, isLoading } = useClarityData(currentUser);

  if (isLoading) {
    return (
      <div className="p-8 max-w-6xl mx-auto min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const cards = [
    {
      label: "Running Tasks",
      value: tracker.runningTasks,
      help: tracker.runningTasks === 0 ? "Clear queue" : "Tasks still open",
      icon: Target,
    },
    {
      label: "Success Tasks",
      value: tracker.successTasks,
      help: `${tracker.overallTaskRate}% task completion`,
      icon: CheckCircle2,
    },
    {
      label: "Habit Success",
      value: `${tracker.completionRate}%`,
      help: `${tracker.todayCompletedHabits} of ${tracker.habits.length} habits done today`,
      icon: BarChart3,
    },
    {
      label: "Best Streak",
      value: tracker.currentBestStreak,
      help: "Current longest active streak",
      icon: Flame,
    },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-playfair text-3xl text-foreground">Tracker</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live habit and task progress connected across your dashboard, habits, and tasks.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-3 text-right min-w-[180px]">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Status</p>
          <p className="text-lg font-semibold text-foreground mt-1">
            {tracker.runningTasks === 0 ? "Clear" : `${tracker.runningTasks} running`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {tracker.runningTasks === 0 ? "You are caught up for now." : "Progress updates as you complete work."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, help, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-5">
            <div className="w-10 h-10 rounded-xl bg-accent text-primary flex items-center justify-center mb-4">
              <Icon size={18} />
            </div>
            <p className="text-3xl font-semibold text-foreground">{value}</p>
            <p className="text-sm text-foreground mt-1">{label}</p>
            <p className="text-xs text-muted-foreground mt-1">{help}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="week" className="space-y-6">
        <TabsList>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="year">Year</TabsTrigger>
        </TabsList>

        <TabsContent value="week" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.8fr] gap-6">
            <section className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-foreground">Weekly habit progress</h2>
                <p className="text-sm text-muted-foreground">Natural progress from daily habit check-ins.</p>
              </div>
              <ChartContainer config={progressChartConfig} className="h-[280px] w-full">
                <AreaChart data={tracker.weekData} margin={{ left: 0, right: 8, top: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="var(--color-completed)"
                    fill="var(--color-completed)"
                    fillOpacity={0.18}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-foreground">Today score</h2>
                <p className="text-sm text-muted-foreground">Completion for the habits scheduled today.</p>
              </div>
              <ChartContainer config={progressChartConfig} className="mx-auto h-[280px] max-w-[280px]">
                <RadialBarChart
                  data={[{ name: "rate", value: tracker.completionRate, fill: "var(--color-rate)" }]}
                  innerRadius="70%"
                  outerRadius="100%"
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar background dataKey="value" cornerRadius={18} />
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground">
                    <tspan className="text-3xl font-semibold">{tracker.completionRate}%</tspan>
                    <tspan x="50%" dy="22" className="fill-muted-foreground text-sm">
                      today
                    </tspan>
                  </text>
                </RadialBarChart>
              </ChartContainer>
            </section>
          </div>

          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-foreground">Habit impact</h2>
              <p className="text-sm text-muted-foreground">Your strongest habits this week and their current streaks.</p>
            </div>
            {tracker.topHabits.length === 0 ? (
              <p className="text-sm text-muted-foreground">No habits yet. Create one in the habits page to start tracking.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {tracker.topHabits.slice(0, 6).map((habit) => (
                  <div key={habit.id} className="rounded-2xl bg-muted/50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{habit.icon} {habit.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {habit.completedThisWeek} checks this week
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-foreground">{habit.streak}</p>
                        <p className="text-[11px] text-muted-foreground">streak</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </TabsContent>

        <TabsContent value="month" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
            <section className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-foreground">Monthly consistency</h2>
                <p className="text-sm text-muted-foreground">
                  {tracker.monthCompleted} completions out of {tracker.monthTarget || 0} possible habit check-ins this month.
                </p>
              </div>
              <ChartContainer config={progressChartConfig} className="h-[300px] w-full">
                <BarChart data={tracker.monthData} margin={{ left: 0, right: 8, top: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="rate" fill="var(--color-rate)" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-accent text-primary flex items-center justify-center mb-4">
                  <CalendarRange size={18} />
                </div>
                <h2 className="text-base font-semibold text-foreground">Month summary</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  A proper tracker should show whether your system is stable over time, not only today.
                </p>
              </div>
              <div className="space-y-4 mt-6">
                <div className="rounded-xl bg-muted/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Consistency</p>
                  <p className="text-3xl font-semibold text-foreground mt-2">{tracker.monthRate}%</p>
                </div>
                <div className="rounded-xl bg-muted/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Notes saved</p>
                  <p className="text-3xl font-semibold text-foreground mt-2">{tracker.notesCount}</p>
                </div>
              </div>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="year" className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-foreground">6-month trend</h2>
              <p className="text-sm text-muted-foreground">Longer-term view of how steady your habits have been across the year.</p>
            </div>
            <ChartContainer config={progressChartConfig} className="h-[320px] w-full">
              <BarChart data={tracker.yearData} margin={{ left: 0, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="completed" fill="var(--color-completed)" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
