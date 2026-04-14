import { getCouples } from "@/app/actions/admin";
import { CreateCoupleForm } from "@/components/create-couple-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function CouplesPage() {
  const result = await getCouples();

  const couples = result.success ? result.couples ?? [] : [];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Couples</h2>

      <div className="max-w-md">
        <CreateCoupleForm />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Existing Couples</h3>

        {couples.length === 0 ? (
          <p className="text-muted-foreground">No couples yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Display Name</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {couples.map((couple) => (
                <TableRow key={couple.id}>
                  <TableCell className="font-medium">
                    {couple.display_name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(couple.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
