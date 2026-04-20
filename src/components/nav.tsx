"use client";

import Link from "next/link";
import { useState, useMemo, memo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { signOut } from "@/app/actions/auth";
import {
  LayoutDashboard,
  UserPlus,
  Grid,
  Heart,
  LogOut,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Overview: LayoutDashboard,
  Dashboard: LayoutDashboard,
  RSVPs: Heart,
  "Floor Plan": Grid,
  Weddings: Grid,
  Couples: UserPlus,
};

interface NavItem {
  href: string;
  label: string;
  section?: string;
}

interface NavProps {
  title: string;
  items: NavItem[];
}

function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push("/auth/login");
  }

  return (
    <button
      data-testid="logout-button"
      onClick={handleLogout}
      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-destructive hover:bg-accent"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </button>
  );
}

const NavLinks = memo(function NavLinks({
  items,
  onNavigate,
}: {
  items: NavItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const grouped = useMemo(() => {
    const result: { showSection: boolean; section?: string; item: NavItem }[] = [];
    let prevSection: string | undefined;
    for (const item of items) {
      const showSection = item.section !== prevSection;
      prevSection = item.section;
      result.push({ showSection, section: item.section, item });
    }
    return result;
  }, [items]);

  return (
    <nav className="space-y-1">
      {grouped.map(({ showSection, section, item }) => {
        const Icon = NAV_ICONS[item.label];
        const isActive = pathname === item.href;

        return (
          <div key={item.href}>
            {showSection && section && (
              <p className="px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section}
              </p>
            )}
            <Link
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-accent",
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {item.label}
            </Link>
          </div>
        );
      })}
    </nav>
  );
});

export function Nav({ title, items }: NavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r glass-panel p-6 h-screen sticky top-0">
        <h1 className="text-lg font-semibold mb-6">{title}</h1>
        <div className="flex-1">
          <NavLinks items={items} />
        </div>
        <div className="border-t pt-4 mt-4">
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile header with hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center glass-panel border-b px-4 py-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="outline" size="icon" aria-label="Open menu" />
            }
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-6 glass-panel">
            <SheetTitle className="text-lg font-semibold mb-6">{title}</SheetTitle>
            <NavLinks items={items} onNavigate={() => setOpen(false)} />
            <div className="border-t pt-4 mt-4">
              <LogoutButton />
            </div>
          </SheetContent>
        </Sheet>
        <span className="ml-3 text-lg font-semibold">{title}</span>
      </div>
    </>
  );
}
