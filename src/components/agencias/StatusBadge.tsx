import { Badge } from "@/components/ui/badge";
export const StatusBadge = ({ status }: { status: "activo" | "inactivo" }) => {
  const variants = {
    activo: "bg-green-100 text-green-800 border-green-200",
    inactivo: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <Badge className={variants[status]}>
      {status === "activo" ? "Activo" : "Inactivo"}
    </Badge>
  );
};
