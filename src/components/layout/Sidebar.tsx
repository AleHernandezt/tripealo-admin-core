import { Home, Building2, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", path: "/", icon: Home },
  { title: "Agencias", path: "/agencias", icon: Building2 },
  { title: "Usuarios", path: "/usuarios", icon: Users },
];

export const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          TripealoAdmin
        </h1>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                      "hover:bg-secondary/50",
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-muted-foreground hover:text-foreground"
                    )
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.title}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};
