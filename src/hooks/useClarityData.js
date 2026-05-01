import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { buildTrackerSummary } from "@/lib/tracker";

export function useClarityData(currentUser) {
  const userEmail = currentUser?.email;

  const query = useQuery({
    queryKey: ["clarity-data", userEmail],
    enabled: Boolean(userEmail),
    queryFn: async () => {
      const [todos, habits, logs, notes] = await Promise.all([
        base44.entities.Todo.filter({ created_by: userEmail }, "-created_date"),
        base44.entities.Habit.filter({ created_by: userEmail, active: true }),
        base44.entities.HabitLog.filter({ created_by: userEmail }),
        base44.entities.Note.filter({ created_by: userEmail }),
      ]);

      return {
        todos,
        habits,
        logs,
        notes,
      };
    },
  });

  const data = query.data || {
    todos: [],
    habits: [],
    logs: [],
    notes: [],
  };

  return {
    ...query,
    ...data,
    tracker: buildTrackerSummary(data),
  };
}
