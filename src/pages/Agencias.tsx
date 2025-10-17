import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { AgenciasTable } from "@/components/agencias/AgenciasTable";
import { ProApprovalModal } from "@/components/agencias/ProApprovalModal";
import { mockAgencies } from "@/components/agencias/mockData";
import { Agency } from "@/components/agencias/types";

const Agencias = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredAgencies = useMemo(() => {
    if (!searchQuery.trim()) return mockAgencies;
    
    const query = searchQuery.toLowerCase().trim();
    return mockAgencies.filter(
      (agency) =>
        agency.nombre.toLowerCase().includes(query) ||
        agency.email.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleApproveClick = (agency: Agency) => {
    setSelectedAgency(agency);
    setIsModalOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold">Gestión de Agencias</h1>

        <div className="flex items-center justify-between gap-4">
          <p className="text-muted-foreground">
            {filteredAgencies.length} {filteredAgencies.length === 1 ? "agencia encontrada" : "agencias encontradas"}
          </p>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <AgenciasTable 
          agencies={filteredAgencies}
          onApproveClick={handleApproveClick}
        />

        <ProApprovalModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          agency={selectedAgency}
        />
      </div>
    </MainLayout>
  );
};

export default Agencias;
