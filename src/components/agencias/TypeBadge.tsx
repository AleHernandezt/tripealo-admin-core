import { Badge } from "@/components/ui/badge";

export const TypeBadge = ({
  tipo,
  onClick,
}: {
  tipo: "standard" | "pending" | "featured";
  onClick: () => void;
}) => {
  const variants = {
    standard: "bg-gray-100 text-gray-800 border-gray-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    featured: "bg-blue-100 text-blue-800 border-blue-200",
  };

  const texts = {
    standard: "Standard",
    pending: "Pending",
    featured: "Featured",
  };

  return <Badge className={variants[tipo]}>{texts[tipo]}</Badge>;
};
