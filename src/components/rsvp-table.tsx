import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface RSVPGuest {
  id: number;
  guestName: string;
  status: "attending" | "declining";
  dietaryNotes: string | null;
  isVegetarian: boolean;
  needsBabyChair: boolean;
  createdAt: string;
}

interface RSVPTableProps {
  rsvps: RSVPGuest[];
}

export function RSVPTable({ rsvps }: RSVPTableProps) {
  if (rsvps.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No RSVPs yet. Share your wedding link with guests!
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Guest</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="hidden md:table-cell">Dietary Notes</TableHead>
          <TableHead className="hidden sm:table-cell">Vegetarian</TableHead>
          <TableHead className="hidden sm:table-cell">Baby Chair</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rsvps.map((rsvp) => (
          <TableRow key={rsvp.id}>
            <TableCell className="font-medium">{rsvp.guestName}</TableCell>
            <TableCell>
              {rsvp.status === "attending" ? (
                <Badge variant="default">Attending</Badge>
              ) : (
                <Badge variant="destructive">Declining</Badge>
              )}
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {rsvp.dietaryNotes || "—"}
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              {rsvp.isVegetarian ? "Yes" : "No"}
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              {rsvp.needsBabyChair ? "Yes" : "No"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
