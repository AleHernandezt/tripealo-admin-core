import { Badge } from "@/components/ui/badge";

interface TypeBadgeProps {
  tipo: "standard" | "pro" | "pendiente";
  onClick?: () => void;
}

export const TypeBadge = ({ tipo, onClick }: TypeBadgeProps) => {
  const getBadgeStyles = () => {
    switch (tipo) {
      case "standard":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20";
      case "pro":
        return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-500/20";
      case "pendiente":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20 cursor-pointer";
    }
  };

  const getLabel = () => {
    switch (tipo) {
      case "standard":
        return "Standard";
      case "pro":
        return "Pro";
      case "pendiente":
        return "Pendiente";
    }
  };

  return (
    <Badge
      variant="secondary"
      className={getBadgeStyles()}
      onClick={tipo === "pendiente" ? onClick : undefined}
    >
      {getLabel()}
    </Badge>
  );
};
