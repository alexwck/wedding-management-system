import { Nav } from "@/components/nav";
import { Breadcrumbs } from "@/components/breadcrumbs";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Nav
        title="Admin Panel"
        items={[
          { href: "/admin", label: "Dashboard", section: "Overview" },
          { href: "/admin/weddings", label: "Weddings", section: "Management" },
          { href: "/admin/couples", label: "Couples", section: "Management" },
        ]}
      />
      <main className="flex-1 p-6 pt-20 md:pt-6 flex flex-col overflow-x-hidden">
        <Breadcrumbs className="mb-4" />
        {children}
      </main>
    </div>
  );
}
