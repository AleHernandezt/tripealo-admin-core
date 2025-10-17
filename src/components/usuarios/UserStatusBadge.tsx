import { Badge } from "@/components/ui/badge";

interface UserStatusBadgeProps {
  status: "activo" | "inactivo";
}

export const UserStatusBadge = ({ status }: UserStatusBadgeProps) => {
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
