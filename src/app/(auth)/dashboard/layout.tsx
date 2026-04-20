import { Nav } from "@/components/nav";
import { Breadcrumbs } from "@/components/breadcrumbs";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Nav
        title="Dashboard"
        items={[
          { href: "/dashboard", label: "Overview", section: "Planning" },
          { href: "/dashboard/rsvps", label: "RSVPs", section: "Planning" },
          { href: "/dashboard/floor-plan", label: "Floor Plan", section: "Planning" },
        ]}
      />
      <main className="flex-1 p-6 pt-20 md:pt-6">
        <Breadcrumbs className="mb-4" />
        {children}
      </main>
    </div>
  );
}
