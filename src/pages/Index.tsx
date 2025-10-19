import { useState, useEffect } from "react";
import {
  Building2,
  Users,
  CheckCircle,
  XCircle,
  DollarSign,
  Wallet,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { TopStatesChart } from "@/components/dashboard/TopStatesChart";
import { DestinationsChart } from "@/components/dashboard/DestinationsChart";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const Index = () => {
  const { user } = useAuth();
  const isAgencia = user?.role === "agencia";

  const [stats, setStats] = useState({
    agenciesCount: 0,
    usersCount: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    commission: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthStart = new Date(currentYear, currentMonth, 1).toISOString();
        const monthEnd = new Date(
          currentYear,
          currentMonth + 1,
          0
        ).toISOString();

        if (isAgencia) {
          // Estadísticas para agencia específica
          const { data: tripsData, error: tripsError } = await supabase
            .from("trips")
            .select("id, price, created_at")
            .eq("agency_id", user?.agencyId)
            .gte("created_at", monthStart)
            .lte("created_at", monthEnd);

          if (tripsError) throw tripsError;

          // En una implementación real, necesitarías una tabla de reservas
          // Por ahora simulo algunas estadísticas basadas en los trips
          const confirmedBookings = tripsData?.length || 0;
          const cancelledBookings = Math.floor(confirmedBookings * 0.07); // 7% de cancelaciones
          const totalRevenue =
            tripsData?.reduce((sum, trip) => sum + (trip.price || 0), 0) || 0;
          const commission = totalRevenue * 0.06; // 6% de comisión

          setStats({
            agenciesCount: 0,
            usersCount: 0,
            confirmedBookings,
            cancelledBookings,
            totalRevenue,
            commission,
          });
        } else {
          // Estadísticas para admin (vista general)

          // Contar agencias
          const { data: agenciesData, error: agenciesError } = await supabase
            .from("agencies")
            .select("id", { count: "exact" });

          if (agenciesError) throw agenciesError;

          // Contar usuarios (asumiendo que tienes una tabla users)
          const { data: usersData, error: usersError } = await supabase
            .from("users")
            .select("id", { count: "exact" });

          if (usersError) throw usersError;

          // Obtener trips del mes actual
          const { data: tripsData, error: tripsError } = await supabase
            .from("trips")
            .select("id, price, created_at")
            .gte("created_at", monthStart)
            .lte("created_at", monthEnd);

          if (tripsError) throw tripsError;

          // Calcular estadísticas de trips
          const confirmedBookings = tripsData?.length || 0;
          const cancelledBookings = Math.floor(confirmedBookings * 0.07); // 7% de cancelaciones
          const totalRevenue =
            tripsData?.reduce((sum, trip) => sum + (trip.price || 0), 0) || 0;
          const commission = totalRevenue * 0.06; // 6% de comisión

          setStats({
            agenciesCount: agenciesData?.length || 0,
            usersCount: usersData?.length || 0,
            confirmedBookings,
            cancelledBookings,
            totalRevenue,
            commission,
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.agencyId, isAgencia]);

  // Formatear números para mostrar
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando estadísticas...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">
            {isAgencia
              ? `Dashboard - ${user?.agencyName}`
              : "Dashboard General"}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {!isAgencia && (
            <KPICard
              title="Agencias Registradas"
              value={stats.agenciesCount}
              icon={Building2}
            />
          )}
          {!isAgencia && (
            <KPICard
              title="Usuarios Totales"
              value={stats.usersCount}
              icon={Users}
            />
          )}
          <KPICard
            title="Reservas Confirmadas (Mes)"
            value={stats.confirmedBookings}
            icon={CheckCircle}
          />
          <KPICard
            title="Reservas Canceladas (Mes)"
            value={stats.cancelledBookings}
            icon={XCircle}
          />
          <KPICard
            title="Dinero Generado (Mes)"
            value={formatCurrency(stats.totalRevenue)}
            icon={DollarSign}
          />
          <KPICard
            title="Comisión (Mes)"
            value={formatCurrency(stats.commission)}
            icon={Wallet}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <TopStatesChart />
          </div>
          <div className="lg:col-span-2">
            <DestinationsChart />
          </div>
        </div>

        <TrendChart />
      </div>
    </MainLayout>
  );
};

export default Index;
