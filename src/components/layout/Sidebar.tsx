import {
  Home,
  Building2,
  Users,
  Sun,
  Moon,
  Package,
  Plane,
  LogOut,
  Hand,
  ChartBar,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { title: "Dashboard", path: "/", icon: Home, roles: ["admin", "agencia"] },
  { title: "Agencias", path: "/agencias", icon: Building2, roles: ["admin"] },
  { title: "Usuarios", path: "/usuarios", icon: Users, roles: ["admin"] },
  {
    title: "Categorias",
    path: "/categorias",
    icon: ChartBar,
    roles: ["admin"],
  },
  {
    title: "Registrar Agencia",
    path: "/agencia-form",
    icon: Users,
    roles: ["admin"],
  },
  {
    title: "Experiencias",
    path: "/experiencias",
    icon: Package,
    roles: ["agencia"],
  },
  { title: "Viajes", path: "/viajes", icon: Plane, roles: ["agencia"] },
  { title: "Guias", path: "/guides", icon: Hand, roles: ["agencia"] },
];

export const Sidebar = () => {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role || "admin")
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Tripealo
        </h1>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredNavItems.map((item) => {
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

      <div className="p-4 border-t border-border space-y-3">
        <div className="flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full h-10 w-10"
          >
            {theme === "dark" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
        </div>
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </aside>
  );
};
