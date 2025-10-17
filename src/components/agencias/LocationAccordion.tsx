import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LocationAccordionProps {
  estados: string[];
}

export const LocationAccordion = ({ estados }: LocationAccordionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (estados.length <= 1) {
    return <span className="text-sm">{estados[0]}</span>;
  }

  return (
    <div className="space-y-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-auto p-1 text-sm font-normal hover:bg-secondary/50"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="h-3 w-3 mr-1" />
            Ocultar
          </>
        ) : (
          <>
            <ChevronDown className="h-3 w-3 mr-1" />
            +{estados.length} estados
          </>
        )}
      </Button>
      {isExpanded && (
        <div className="text-sm text-muted-foreground space-y-0.5">
          {estados.map((estado, index) => (
            <div key={index}>{estado}</div>
          ))}
        </div>
      )}
    </div>
  );
};
