import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  { key: "total" as const, label: "Total", color: "" },
  { key: "attending" as const, label: "Attending", color: "text-green-600" },
  { key: "declining" as const, label: "Declining", color: "text-red-600" },
  { key: "vegetarian" as const, label: "Vegetarian", color: "" },
  { key: "babyChairs" as const, label: "Baby Chairs", color: "" },
];

export function RVPSummary({ summary }: RVPSummaryProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map(({ key, label, color }) => (
        <Card key={key}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${color}`}>
              {summary[key]}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
