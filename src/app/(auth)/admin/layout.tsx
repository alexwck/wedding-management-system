import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex w-64 flex-col border-r bg-muted/50 p-6">
        <h1 className="text-lg font-semibold mb-6">Admin Panel</h1>
        <nav className="space-y-2">
          <Link
            href="/admin"
            className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/weddings"
            className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
          >
            Weddings
          </Link>
          <Link
            href="/admin/couples"
            className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
          >
            Couples
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <div className="md:hidden mb-4">
          <nav className="flex gap-4 text-sm border-b pb-2">
            <Link href="/admin" className="hover:underline">Dashboard</Link>
            <Link href="/admin/weddings" className="hover:underline">Weddings</Link>
            <Link href="/admin/couples" className="hover:underline">Couples</Link>
          </nav>
        </div>
        {children}
      </main>
    </div>
  );
}
