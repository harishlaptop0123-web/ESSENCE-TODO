import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Plus, Circle, CheckCircle2, Trash2, ChevronDown } from "lucide-react";
import { format } from "date-fns";

const PRIORITIES = ["low", "medium", "high"];
const PRIORITY_COLORS = {
  low: "text-sky-500 bg-sky-50",
  medium: "text-amber-500 bg-amber-50",
  high: "text-red-500 bg-red-50",
};

export default function Todos() {
  const { currentUser } = useAuth();
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState("medium");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Todo.filter({ created_by: currentUser?.email }, "-created_date")
      .then(setTodos)
      .finally(() => setLoading(false));
  }, []);

  const addTodo = async () => {
    if (!input.trim()) return;
    const newTodo = await base44.entities.Todo.create({ title: input.trim(), priority, completed: false });
    setTodos(prev => [newTodo, ...prev]);
    setInput("");
  };

  const toggleTodo = async (todo) => {
    const updated = await base44.entities.Todo.update(todo.id, { completed: !todo.completed });
    setTodos(prev => prev.map(t => t.id === todo.id ? updated : t));
  };

  const deleteTodo = async (id) => {
    await base44.entities.Todo.delete(id);
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const filtered = todos.filter(t => {
    if (filter === "active") return !t.completed;
    if (filter === "done") return t.completed;
    return true;
  });

  const completedCount = todos.filter(t => t.completed).length;

  return (
    <div className="p-8 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-playfair text-3xl text-foreground">Tasks</h1>
        <p className="text-sm text-muted-foreground mt-1">{completedCount} of {todos.length} completed</p>
      </div>

      {/* Add input */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6 flex gap-3 items-center">
        <input
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          placeholder="Add a new task..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addTodo()}
        />
        <select
          className="text-xs bg-muted rounded-lg px-2 py-1.5 border-0 outline-none text-muted-foreground"
          value={priority}
          onChange={e => setPriority(e.target.value)}
        >
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <button
          onClick={addTodo}
          className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center hover:opacity-90 transition-all"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 bg-muted rounded-xl p-1 w-fit">
        {["all", "active", "done"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${filter === f ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Todo list */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No tasks here. Add one above!</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(todo => (
            <div
              key={todo.id}
              className="group flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3.5 hover:shadow-sm transition-all"
            >
              <button onClick={() => toggleTodo(todo)} className="flex-shrink-0">
                {todo.completed
                  ? <CheckCircle2 size={18} className="text-primary" />
                  : <Circle size={18} className="text-muted-foreground hover:text-primary transition-colors" />
                }
              </button>
              <span className={`flex-1 text-sm ${todo.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {todo.title}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[todo.priority]}`}>
                {todo.priority}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}