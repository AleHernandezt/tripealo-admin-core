import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

interface User {
  id: string;
  email: string;
  role: "admin" | "agencia";
  agencyName?: string;
  agencyId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      console.log("Stored user from localStorage:", storedUser);

      if (storedUser) {
        const userData = JSON.parse(storedUser);
        console.log("Parsed user data:", userData);
        setUser(userData);
      }
    } catch (error) {
      console.error("Error checking user:", error);
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log("Login attempt with:", email);

      // Login como admin
      if (email === "admin@admin.com" && password === "admin") {
        console.log("Admin login successful");
        const adminUser: User = {
          id: "admin",
          email: "admin@admin.com",
          role: "admin",
        };
        setUser(adminUser);
        localStorage.setItem("user", JSON.stringify(adminUser));
        return { success: true };
      }

      // Login como agencia
      console.log("Attempting agency login");
      const { data: agencies, error } = await supabase
        .from("agencies")
        .select("id, name, email, password, status")
        .eq("email", email.toLowerCase());

      if (error) {
        console.error("Supabase error:", error);
        return { success: false, error: "Error del servidor" };
      }

      if (!agencies || agencies.length === 0) {
        console.log("No agency found");
        return { success: false, error: "Credenciales incorrectas" };
      }

      const agency = agencies[0];
      console.log("Found agency:", agency);

      if (agency.password !== password) {
        console.log("Password mismatch");
        return { success: false, error: "Credenciales incorrectas" };
      }

      if (agency.status !== "active") {
        return { success: false, error: "La agencia no está activa" };
      }

      const agencyUser: User = {
        id: agency.id,
        email: agency.email,
        role: "agencia",
        agencyName: agency.name,
        agencyId: agency.id,
      };

      console.log("Agency login successful, setting user");
      setUser(agencyUser);
      localStorage.setItem("user", JSON.stringify(agencyUser));
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Error en el servidor" };
    }
  };

  const logout = () => {
    console.log("Logging out");
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
