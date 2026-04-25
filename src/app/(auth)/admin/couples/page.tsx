import { getCouples } from "@/app/actions/admin";
import { CreateCoupleForm } from "@/components/create-couple-form";
import { LockToggle } from "@/components/lock-toggle";
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
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Couples</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-xl p-4">
          <CreateCoupleForm />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Existing Couples</h3>

          {couples.length === 0 ? (
            <p className="text-muted-foreground">No couples yet.</p>
          ) : (
            <div className="glass-panel rounded-xl p-4">
              <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Display Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {couples.map((couple) => (
                <TableRow key={couple.id}>

                  <TableCell>
                    {couple.display_name}
                  </TableCell>
                  <TableCell>
                    {couple.weddingId ? (
                      <LockToggle weddingId={couple.weddingId} isLocked={couple.isLocked} />
                    ) : (
                      <span className="text-muted-foreground text-xs">No wedding</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(couple.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
