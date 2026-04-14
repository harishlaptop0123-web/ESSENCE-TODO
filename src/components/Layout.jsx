import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { LayoutDashboard, CheckSquare, BookOpen, Flame, Sparkles, LogOut, User } from "lucide-react";
import { useState } from "react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/todos", icon: CheckSquare, label: "Tasks" },
  { to: "/habits", icon: Flame, label: "Habits" },
  { to: "/notes", icon: BookOpen, label: "Notes" },
  { to: "/mentor", icon: Sparkles, label: "Mentor" },
];

export default function Layout() {
  const { currentUser } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 flex flex-col bg-[hsl(220,18%,10%)] text-white">
        {/* Logo */}
        <div className="px-6 py-7">
          <h1 className="font-playfair text-xl font-medium tracking-tight text-white">Clarity</h1>
          <p className="text-xs text-white/30 mt-0.5 font-inter">your focused space</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-white/5">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <User size={13} className="text-primary" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-xs font-medium text-white/80 truncate">
                  {currentUser?.full_name || "You"}
                </p>
                <p className="text-[10px] text-white/30 truncate">{currentUser?.email}</p>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-[hsl(220,18%,14%)] border border-white/10 rounded-lg p-1 shadow-lg">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-red-400 hover:bg-white/5 transition-all"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}