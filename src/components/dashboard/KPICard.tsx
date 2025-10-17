import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface KPICardProps {
  title: string;
  value: number;
  icon: LucideIcon;
}

export const KPICard = ({ title, value, icon: Icon }: KPICardProps) => {
  return (
    <Card className="p-6 bg-card border-border hover:border-primary/30 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground">
            {value.toLocaleString()}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </Card>
  );
};
