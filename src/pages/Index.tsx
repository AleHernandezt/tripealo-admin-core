import { Building2, Users, CheckCircle, XCircle } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { KPICard } from "@/components/dashboard/KPICard";
import { TopStatesChart } from "@/components/dashboard/TopStatesChart";
import { DestinationsChart } from "@/components/dashboard/DestinationsChart";
import { TrendChart } from "@/components/dashboard/TrendChart";

const Index = () => {
  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Dashboard General</h1>
          <DashboardFilters />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard title="Agencias Registradas" value={87} icon={Building2} />
          <KPICard title="Usuarios Totales" value={1245} icon={Users} />
          <KPICard title="Reservas Confirmadas (Mes)" value={312} icon={CheckCircle} />
          <KPICard title="Reservas Canceladas (Mes)" value={21} icon={XCircle} />
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
