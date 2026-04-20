"use client";

import Link from "next/link";
import { useState } from "react";
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
  Users,
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
  Couples: Users,
};

interface NavItem {
  href: string;
  label: string;
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

function NavLinks({
  items,
  onNavigate,
}: {
  items: NavItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const Icon = NAV_ICONS[item.label];
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
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
        );
      })}
    </nav>
  );
}

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
