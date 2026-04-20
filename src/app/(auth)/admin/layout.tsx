import { Nav } from "@/components/nav";
import { Breadcrumbs } from "@/components/breadcrumbs";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Nav
        title="Admin Panel"
        items={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/weddings", label: "Weddings" },
          { href: "/admin/couples", label: "Couples" },
        ]}
      />
      <main className="flex-1 p-6 pt-20 md:pt-6">
        <Breadcrumbs className="mb-4" />
        {children}
      </main>
    </div>
  );
}
