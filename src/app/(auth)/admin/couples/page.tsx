import { getCouples } from "@/app/actions/admin";
import { CreateCoupleForm } from "@/components/create-couple-form";
import { LockToggle } from "@/components/lock-toggle";
import { GlassPanel } from "@/components/glassmorphism/glass-panel";
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
      <h1 className="text-3xl font-serif text-slate-800 mb-6">Couples</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassPanel variant="light" padding="md" radius="md">
          <CreateCoupleForm />
        </GlassPanel>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Existing Couples</h3>

          {couples.length === 0 ? (
            <GlassPanel variant="light" className="p-8 text-center">
              <p className="text-slate-500">No couples yet.</p>
            </GlassPanel>
          ) : (
            <GlassPanel variant="light" padding="md" radius="md">
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
                          <span className="text-slate-500 text-xs">No wedding</span>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {new Date(couple.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </GlassPanel>
          )}
        </div>
      </div>
    </div>
  );
}
