import { GlassCard } from "@/components/glassmorphism/glass-card";

interface RVPSummaryProps {
  summary: {
    total: number;
    attending: number;
    declining: number;
    vegetarian: number;
    babyChairs: number;
  };
}

const cards = [
  { key: "attending" as const, label: "Attending", color: "text-green-600" },
  { key: "declining" as const, label: "Declining", color: "text-red-600" },
  { key: "vegetarian" as const, label: "Vegetarian", color: "" },
  { key: "babyChairs" as const, label: "Baby Chairs", color: "" },
];

export function RVPSummary({ summary }: RVPSummaryProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map(({ key, label, color }) => (
        <GlassCard key={key} variant="default" className="p-4">
          <p className="text-sm font-medium text-muted-foreground">
            {label}
          </p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>
            {summary[key]}
          </p>
        </GlassCard>
      ))}
    </div>
  );
}
