import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: "activo" | "inactivo";
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  return (
    <Badge
      variant={status === "activo" ? "default" : "secondary"}
      className={
        status === "activo"
          ? "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20"
          : "bg-muted text-muted-foreground hover:bg-muted"
      }
    >
      {status === "activo" ? "Activo" : "Inactivo"}
    </Badge>
  );
};
