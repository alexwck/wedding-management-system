import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex w-64 flex-col border-r bg-muted/50 p-6">
        <h1 className="text-lg font-semibold mb-6">Dashboard</h1>
        <nav className="space-y-2">
          <Link
            href="/dashboard"
            className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
          >
            Overview
          </Link>
          <Link
            href="/dashboard/rsvps"
            className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
          >
            RSVPs
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <div className="md:hidden mb-4">
          <nav className="flex gap-4 text-sm border-b pb-2">
            <Link href="/dashboard" className="hover:underline">Overview</Link>
            <Link href="/dashboard/rsvps" className="hover:underline">RSVPs</Link>
          </nav>
        </div>
        {children}
      </main>
    </div>
  );
}
