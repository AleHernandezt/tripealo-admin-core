import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { date: "1 Nov", agencias: 4, usuarios: 23 },
  { date: "5 Nov", agencias: 6, usuarios: 31 },
  { date: "10 Nov", agencias: 5, usuarios: 42 },
  { date: "15 Nov", agencias: 8, usuarios: 56 },
  { date: "20 Nov", agencias: 12, usuarios: 68 },
  { date: "25 Nov", agencias: 15, usuarios: 89 },
  { date: "30 Nov", agencias: 18, usuarios: 104 },
];

export const TrendChart = () => {
  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-lg font-semibold mb-6">Tendencia de Registros (Últimos 30 días)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "hsl(var(--card))", 
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
          />
          <Legend 
            wrapperStyle={{ 
              color: "hsl(var(--muted-foreground))"
            }}
          />
          <Line 
            type="monotone" 
            dataKey="agencias" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            name="Nuevas Agencias"
            dot={{ fill: "hsl(var(--primary))" }}
          />
          <Line 
            type="monotone" 
            dataKey="usuarios" 
            stroke="hsl(var(--chart-2))" 
            strokeWidth={2}
            name="Nuevos Usuarios"
            dot={{ fill: "hsl(var(--chart-2))" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};
