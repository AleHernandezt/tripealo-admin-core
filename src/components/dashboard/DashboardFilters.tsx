import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

const venezuelanStates = [
  "Todos los Estados",
  "Lara",
  "Carabobo",
  "Miranda",
  "Zulia",
  "Falcón",
  "Aragua",
  "Mérida",
  "Bolívar",
  "Sucre",
  "Anzoátegui",
];

export const DashboardFilters = () => {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      <Button variant="outline" className="gap-2">
        <Calendar className="h-4 w-4" />
        Últimos 30 días
      </Button>
      
      <Select defaultValue="all">
        <SelectTrigger className="w-[240px]">
          <SelectValue placeholder="Filtrar por Estado" />
        </SelectTrigger>
        <SelectContent>
          {venezuelanStates.map((state) => (
            <SelectItem key={state} value={state.toLowerCase().replace(/\s+/g, '-')}>
              {state}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
