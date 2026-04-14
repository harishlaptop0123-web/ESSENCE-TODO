import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Plus, Pin, Trash2, X, Search } from "lucide-react";
import { format } from "date-fns";

export default function Notes() {
  const { currentUser } = useAuth();
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // null | "new" | note object
  const [form, setForm] = useState({ title: "", content: "", pinned: false });

  useEffect(() => {
    base44.entities.Note.filter({ created_by: currentUser?.email }, "-updated_date").then(setNotes);
  }, []);

  const openNew = () => {
    setForm({ title: "", content: "", pinned: false });
    setEditing("new");
  };

  const openEdit = (note) => {
    setForm({ title: note.title, content: note.content || "", pinned: note.pinned || false });
    setEditing(note);
  };

  const saveNote = async () => {
    if (!form.title.trim() && !form.content.trim()) { setEditing(null); return; }
    if (editing === "new") {
      const newNote = await base44.entities.Note.create({ ...form, title: form.title || "Untitled" });
      setNotes(prev => [newNote, ...prev]);
    } else {
      const updated = await base44.entities.Note.update(editing.id, form);
      setNotes(prev => prev.map(n => n.id === editing.id ? updated : n));
    }
    setEditing(null);
  };

  const deleteNote = async (id, e) => {
    e.stopPropagation();
    await base44.entities.Note.delete(id);
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const togglePin = async (note, e) => {
    e.stopPropagation();
    const updated = await base44.entities.Note.update(note.id, { pinned: !note.pinned });
    setNotes(prev => prev.map(n => n.id === note.id ? updated : n));
  };

  const filtered = notes.filter(n =>
    n.title?.toLowerCase().includes(search.toLowerCase()) ||
    n.content?.toLowerCase().includes(search.toLowerCase())
  );

  const pinned = filtered.filter(n => n.pinned);
  const unpinned = filtered.filter(n => !n.pinned);

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-playfair text-3xl text-foreground">Notes</h1>
          <p className="text-sm text-muted-foreground mt-1">{notes.length} note{notes.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-all"
        >
          <Plus size={16} /> New note
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
          placeholder="Search notes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Note editor */}
      {editing && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={saveNote}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
              <input
                className="flex-1 text-base font-medium bg-transparent outline-none placeholder:text-muted-foreground"
                placeholder="Note title..."
                value={form.title}
                onChange={e => setForm(f => ({...f, title: e.target.value}))}
                autoFocus
              />
              <button onClick={saveNote} className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:opacity-90">Save</button>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
            </div>
            <textarea
              className="w-full min-h-48 p-5 text-sm bg-transparent outline-none placeholder:text-muted-foreground resize-none"
              placeholder="Write something..."
              value={form.content}
              onChange={e => setForm(f => ({...f, content: e.target.value}))}
            />
          </div>
        </div>
      )}

      {/* Notes grid */}
      {notes.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          <p>No notes yet. Create your first one!</p>
        </div>
      ) : (
        <>
          {pinned.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Pinned</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pinned.map(note => <NoteCard key={note.id} note={note} onClick={() => openEdit(note)} onDelete={deleteNote} onPin={togglePin} />)}
              </div>
            </div>
          )}
          {unpinned.length > 0 && (
            <div>
              {pinned.length > 0 && <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">All notes</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {unpinned.map(note => <NoteCard key={note.id} note={note} onClick={() => openEdit(note)} onDelete={deleteNote} onPin={togglePin} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function NoteCard({ note, onClick, onDelete, onPin }) {
  return (
    <div
      onClick={onClick}
      className="group bg-card border border-border rounded-xl p-4 cursor-pointer hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-medium text-foreground truncate">{note.title || "Untitled"}</h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
          <button onClick={e => onPin(note, e)} className={`p-1 rounded hover:bg-muted transition-all ${note.pinned ? "text-primary" : "text-muted-foreground"}`}>
            <Pin size={12} />
          </button>
          <button onClick={e => onDelete(note.id, e)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-all">
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      {note.content && <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{note.content}</p>}
      <p className="text-[10px] text-muted-foreground mt-3">{format(new Date(note.updated_date), "MMM d")}</p>
    </div>
  );
}