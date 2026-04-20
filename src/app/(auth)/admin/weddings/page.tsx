import Link from "next/link";
import { getAllWeddings } from "@/app/actions/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function WeddingListPage() {
  const result = await getAllWeddings();

  if (!result.success) {
    return <p className="text-destructive">Failed to load weddings.</p>;
  }

  const weddings = result.weddings ?? [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Weddings</h2>

      {weddings.length === 0 ? (
        <p className="text-muted-foreground">No weddings yet.</p>
      ) : (
        <div className="glass-panel rounded-xl p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Couple Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Template</TableHead>
              <TableHead>Wedding Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {weddings.map((wedding) => (
              <TableRow key={wedding.id}>
                <TableCell>
                  <Link
                    href={`/admin/weddings/${wedding.id}`}
                    className="font-medium hover:underline"
                  >
                    {wedding.couple_name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{wedding.slug}</TableCell>
                <TableCell>
                  {wedding.template_image_url ? (
                    <Badge variant="default">Uploaded</Badge>
                  ) : (
                    <Badge variant="secondary">Missing</Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {wedding.wedding_date
                    ? new Date(wedding.wedding_date).toLocaleDateString()
                    : "Not set"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      )}
    </div>
  );
}
