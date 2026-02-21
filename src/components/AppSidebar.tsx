import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { Building2, List, Bookmark, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Companies", path: "/companies", icon: Building2 },
  { title: "Lists", path: "/lists", icon: List },
  { title: "Saved", path: "/saved", icon: Bookmark },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="flex flex-col w-56 min-h-screen bg-sidebar border-r border-sidebar-border shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="text-sm font-semibold text-sidebar-accent-foreground tracking-tight">SourceFlow</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <RouterNavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.title}
            </RouterNavLink>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="mt-auto px-4 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-xs font-medium text-primary">VC</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-sidebar-accent-foreground">Demo Fund</span>
            <span className="text-[11px] text-sidebar-foreground">Free Plan</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
