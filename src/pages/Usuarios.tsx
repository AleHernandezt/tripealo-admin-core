import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { UsersTable } from "@/components/usuarios/UsersTable";
import { mockUsers } from "@/components/usuarios/mockData";

const Usuarios = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return mockUsers;
    
    const query = searchQuery.toLowerCase().trim();
    return mockUsers.filter(
      (user) =>
        user.nombre.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.estado.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold">Gestión de Usuarios</h1>

        <div className="flex items-center justify-between gap-4">
          <p className="text-muted-foreground">
            {filteredUsers.length} {filteredUsers.length === 1 ? "usuario encontrado" : "usuarios encontrados"}
          </p>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email o estado..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <UsersTable users={filteredUsers} />
      </div>
    </MainLayout>
  );
};

export default Usuarios;
