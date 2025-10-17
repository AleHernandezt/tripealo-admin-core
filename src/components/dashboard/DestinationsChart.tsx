import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const data = [
  { name: "Falcón (Morrocoy)", value: 412 },
  { name: "Sucre (Mochima)", value: 298 },
  { name: "Mérida", value: 256 },
  { name: "Bolívar (Canaima)", value: 189 },
  { name: "Otros", value: 90 },
];

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export const DestinationsChart = () => {
  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-lg font-semibold mb-6">Destinos Más Populares</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "hsl(var(--card))", 
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
          />
          <Legend 
            wrapperStyle={{ 
              color: "hsl(var(--muted-foreground))",
              fontSize: "12px"
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};
