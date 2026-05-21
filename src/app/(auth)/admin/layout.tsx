import { Nav } from "@/components/nav";
import { AdminLayoutContent } from "@/components/admin-layout-content";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden p-6 gap-6">
      <Nav
        title="Admin Panel"
        items={[
          { href: "/admin", label: "Overview", section: "Overview" },
          { href: "/admin/weddings", label: "Weddings", section: "Management" },
          { href: "/admin/couples", label: "Couples", section: "Management" },
        ]}
      />
      <main className="flex-1 overflow-y-auto rounded-3xl">
        <AdminLayoutContent
          breadcrumbCrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Dashboard" },
          ]}
        >
          {children}
        </AdminLayoutContent>
      </main>
    </div>
  );
}
