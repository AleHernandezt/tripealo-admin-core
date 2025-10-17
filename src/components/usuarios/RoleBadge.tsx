import { Badge } from "@/components/ui/badge";

interface RoleBadgeProps {
  rol: "usuario" | "agencia" | "admin";
}

export const RoleBadge = ({ rol }: RoleBadgeProps) => {
  const getBadgeStyles = () => {
    switch (rol) {
      case "usuario":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20";
      case "agencia":
        return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-500/20";
      case "admin":
        return "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20";
    }
  };

  const getLabel = () => {
    switch (rol) {
      case "usuario":
        return "Usuario";
      case "agencia":
        return "Agencia";
      case "admin":
        return "Admin";
    }
  };

  return (
    <Badge variant="secondary" className={getBadgeStyles()}>
      {getLabel()}
    </Badge>
  );
};
