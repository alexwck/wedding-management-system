import { Nav } from "@/components/nav";
import { AdminLayoutContent } from "@/components/admin-layout-content";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden p-6 gap-6">
      <Nav
        title="Dashboard"
        items={[
          { href: "/dashboard", label: "Overview", section: "Planning" },
          { href: "/dashboard/rsvps", label: "RSVPs", section: "Planning" },
          { href: "/dashboard/floor-plan", label: "Floor Plan", section: "Planning" },
        ]}
      />
      <main className="flex-1 overflow-y-auto rounded-3xl">
        <AdminLayoutContent
          breadcrumbCrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Overview" },
          ]}
        >
          {children}
        </AdminLayoutContent>
      </main>
    </div>
  );
}
