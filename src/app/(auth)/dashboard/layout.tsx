import { Nav } from "@/components/nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Nav
        title="Dashboard"
        items={[
          { href: "/dashboard", label: "Overview" },
          { href: "/dashboard/rsvps", label: "RSVPs" },
          { href: "/dashboard/floor-plan", label: "Floor Plan" },
        ]}
      />
      <main className="flex-1 p-6 pt-20 md:pt-6">
        {children}
      </main>
    </div>
  );
}
