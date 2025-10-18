import { useState, useEffect, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { AgenciasTable } from "@/components/agencias/AgenciasTable";
import { ProApprovalModal } from "@/components/agencias/ProApprovalModal";
import { Agency } from "@/components/agencias/types";
import { supabase } from "@/lib/supabase";

const Agencias = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgenciesSimple = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: agenciesData, error: agenciesError } = await supabase
        .from("agencies")
        .select("*")
        .order("created_at", { ascending: false });

      if (agenciesError) {
        throw agenciesError;
      }

      if (!agenciesData) {
        setAgencies([]);
        return;
      }

      const agenciesWithStates = await Promise.all(
        agenciesData.map(async (agency) => {
          let estados: string[] = [];

          try {
            // Consulta separada para obtener estados de esta agencia
            const { data: statesData, error: statesError } = await supabase
              .from("agencies_states")
              .select(
                `
                state_id,
                states(name)
              `
              )
              .eq("agency_id", agency.id);

            if (!statesError && statesData) {
              estados = statesData
                .map((item) => item.states?.name)
                .filter(Boolean) as string[];
            }
          } catch (error) {
            console.warn(
              `Error fetching states for agency ${agency.id}:`,
              error
            );
          }

          return {
            id: agency.id,
            nombre: agency.name,
            email: agency.email || "Sin email",
            estados: estados || ["Sin estados"],
            mediaViajes: 0,
            status:
              agency.status === "active"
                ? "activo"
                : agency.status === "inactive"
                ? "inactivo"
                : "inactivo",

            tipo:
              agency.type === "featured"
                ? "featured"
                : agency.type === "pending"
                ? "pending"
                : "standard",
            description: agency.description,
            logo_url: agency.logo_url,
            rating: agency.rating,
            review_count: agency.review_count,
            instagram: agency.instagram,
            tiktok: agency.tiktok,
            created_at: agency.created_at,
          };
        })
      );

      setAgencies(agenciesWithStates);
    } catch (err) {
      console.error("Error fetching agencies:", err);
      setError("Error al cargar las agencias");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Prueba primero con la versión simple
    fetchAgenciesSimple();
  }, []);

  const filteredAgencies = useMemo(() => {
    if (!searchQuery.trim()) return agencies;

    const query = searchQuery.toLowerCase().trim();
    return agencies.filter(
      (agency) =>
        agency.nombre.toLowerCase().includes(query) ||
        agency.email.toLowerCase().includes(query) ||
        agency.estados.some((estado) => estado.toLowerCase().includes(query))
    );
  }, [searchQuery, agencies]);

  console.log(filteredAgencies);

  const handleApproveClick = (agency: Agency) => {
    setSelectedAgency(agency);
    setIsModalOpen(true);
  };

  const handleApprovePro = async () => {
    if (!selectedAgency) return;

    try {
      const { error } = await supabase
        .from("agencies")
        .update({ is_premium: true })
        .eq("id", selectedAgency.id);

      if (error) {
        throw error;
      }

      setAgencies((prev) =>
        prev.map((agency) =>
          agency.id === selectedAgency.id
            ? { ...agency, status: "premium" }
            : agency
        )
      );

      setIsModalOpen(false);
      setSelectedAgency(null);
    } catch (err) {
      console.error("Error updating agency:", err);
      setError("Error al actualizar la agencia");
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Cargando agencias...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchAgenciesSimple}>Reintentar</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold">Gestión de Agencias</h1>

        <div className="flex items-center justify-between gap-4">
          <p className="text-muted-foreground">
            {filteredAgencies.length}{" "}
            {filteredAgencies.length === 1
              ? "agencia encontrada"
              : "agencias encontradas"}
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

        <AgenciasTable
          agencies={filteredAgencies}
          onApproveClick={handleApproveClick}
        />

        <ProApprovalModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          agency={selectedAgency}
          onApprove={handleApprovePro}
        />
      </div>
    </MainLayout>
  );
};

export default Agencias;
