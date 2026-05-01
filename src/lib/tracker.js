import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
} from "date-fns";

const toDate = (dateString) => new Date(`${dateString}T00:00:00`);

export function isHabitCompletedOnDate(logs, habitId, date) {
  return logs.some(
    (log) => log.habit_id === habitId && log.date === date && log.completed
  );
}

export function getHabitStreak(logs, habitId, today = new Date()) {
  let streak = 0;

  for (let i = 0; i < 365; i += 1) {
    const date = format(subDays(today, i), "yyyy-MM-dd");
    if (isHabitCompletedOnDate(logs, habitId, date)) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

export function buildTrackerSummary({ habits = [], logs = [], todos = [], notes = [] }) {
  const todayDate = new Date();
  const today = format(todayDate, "yyyy-MM-dd");
  const activeHabits = habits.filter((habit) => habit.active !== false);
  const completedTodos = todos.filter((todo) => todo.completed);
  const pendingTodos = todos.filter((todo) => !todo.completed);
  const todayCompletedHabits = activeHabits.filter((habit) =>
    isHabitCompletedOnDate(logs, habit.id, today)
  ).length;

  const completionRate = activeHabits.length
    ? Math.round((todayCompletedHabits / activeHabits.length) * 100)
    : 0;

  const weekDays = Array.from({ length: 7 }, (_, index) =>
    subDays(todayDate, 6 - index)
  );

  const weekData = weekDays.map((day) => {
    const date = format(day, "yyyy-MM-dd");
    const completed = activeHabits.filter((habit) =>
      isHabitCompletedOnDate(logs, habit.id, date)
    ).length;

    return {
      date,
      label: format(day, "EEE"),
      completed,
      target: activeHabits.length,
      rate: activeHabits.length ? Math.round((completed / activeHabits.length) * 100) : 0,
    };
  });

  const currentMonthStart = startOfMonth(todayDate);
  const currentMonthDays = eachDayOfInterval({
    start: currentMonthStart,
    end: todayDate,
  });

  const monthData = currentMonthDays.map((day) => {
    const date = format(day, "yyyy-MM-dd");
    const completed = activeHabits.filter((habit) =>
      isHabitCompletedOnDate(logs, habit.id, date)
    ).length;

    return {
      date,
      label: format(day, "d"),
      completed,
      target: activeHabits.length,
      rate: activeHabits.length ? Math.round((completed / activeHabits.length) * 100) : 0,
    };
  });

  const monthCompleted = monthData.reduce((total, day) => total + day.completed, 0);

  const monthTarget = currentMonthDays.length * activeHabits.length;
  const monthRate = monthTarget ? Math.round((monthCompleted / monthTarget) * 100) : 0;

  const yearData = Array.from({ length: 12 }, (_, index) => {
    const monthDate = subMonths(todayDate, 11 - index);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = isSameMonth(monthDate, todayDate) ? todayDate : endOfMonth(monthDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const completed = days.reduce((total, day) => {
      const date = format(day, "yyyy-MM-dd");
      return (
        total +
        activeHabits.filter((habit) => isHabitCompletedOnDate(logs, habit.id, date)).length
      );
    }, 0);
    const target = days.length * activeHabits.length;

    return {
      label: format(monthDate, "MMM"),
      completed,
      target,
      rate: target ? Math.round((completed / target) * 100) : 0,
    };
  });

  const currentWeekDates = eachDayOfInterval({
    start: startOfWeek(todayDate, { weekStartsOn: 1 }),
    end: endOfWeek(todayDate, { weekStartsOn: 1 }),
  }).map((day) => format(day, "yyyy-MM-dd"));

  const topHabits = activeHabits
    .map((habit) => {
      const streak = getHabitStreak(logs, habit.id, todayDate);
      const completedThisWeek = currentWeekDates.filter((date) =>
        isHabitCompletedOnDate(logs, habit.id, date)
      ).length;

      return {
        ...habit,
        streak,
        completedThisWeek,
        weeklyTarget: habit.frequency === "weekly" ? 1 : 7,
      };
    })
    .sort((a, b) => b.streak - a.streak || b.completedThisWeek - a.completedThisWeek);

  return {
    today,
    notesCount: notes.length,
    habits: activeHabits,
    logs,
    todos,
    pendingTodos,
    completedTodos,
    todayCompletedHabits,
    completionRate,
    runningTasks: pendingTodos.length,
    successTasks: completedTodos.length,
    overallTaskRate: todos.length ? Math.round((completedTodos.length / todos.length) * 100) : 0,
    currentBestStreak: topHabits[0]?.streak || 0,
    weekData,
    monthData,
    monthCompleted,
    monthTarget,
    monthRate,
    yearData,
    topHabits,
  };
}
