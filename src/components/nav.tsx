"use client";

import Link from "next/link";
import { useState, useMemo, memo, useEffect } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@/components/glassmorphism/glass-panel";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  UserPlus,
  Grid,
  Heart,
  LogOut,
  Menu,
  UserCircle,
  PanelLeftClose,
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
      className="flex w-full items-center gap-3 px-4 py-3 rounded-2xl text-slate-500 hover:bg-white/10 hover:text-slate-800 transition-all"
    >
      <LogOut className="h-5 w-5" />
      <span className="font-medium">Logout</span>
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
              <p className="px-4 pt-4 pb-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                {section}
              </p>
            )}
            <Link
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300",
                isActive
                  ? "glass-light bg-white/40 text-slate-900 shadow-md translate-x-1"
                  : "text-slate-500 hover:bg-white/10 hover:text-slate-800",
              )}
            >
              {Icon && <Icon className="h-5 w-5" />}
              <span className="font-medium">{item.label}</span>
            </Link>
          </div>
        );
      })}
    </nav>
  );
});

export function Nav({ title, items }: NavProps) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const isFloorPlan = pathname?.includes("/floor-plan");

  useEffect(() => {
    const handler = () => setCollapsed(false);
    window.addEventListener("expand-nav", handler);
    return () => window.removeEventListener("expand-nav", handler);
  }, []);

  return (
    <>
      {/* Desktop sidebar — hidden entirely when collapsed on floor-plan */}
      {(!isFloorPlan || !collapsed) && (
        <aside className="hidden md:flex w-64 flex-col shrink-0 transition-all duration-300">
          <GlassPanel variant="light" className="h-full p-6 flex flex-col" padding="none" radius="glass">
            {/* Header with title and collapse toggle */}
            <div className="flex items-center justify-between mb-6 px-2 pt-6">
              <h2 className="text-2xl font-serif text-slate-800">{title}</h2>
              {isFloorPlan && (
                <button
                  type="button"
                  onClick={() => { setCollapsed(true); window.dispatchEvent(new CustomEvent("collapse-nav")); }}
                  className="p-2 rounded hover:bg-white/30 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Collapse navigation"
                >
                  <PanelLeftClose className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="flex-1 px-2">
              <NavLinks items={items} />
            </div>

            <div className="mt-auto pt-6 border-t border-white/20 px-2 pb-6">
              <LogoutButton />
              <div className="flex items-center gap-3 px-2 py-2 mt-4">
                <div className="w-10 h-10 rounded-full bg-slate-200/50 flex items-center justify-center border border-white/30">
                  <UserCircle size={24} className="text-slate-400" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold truncate text-slate-800">Admin User</p>
                  <p className="text-xs text-slate-400 truncate">admin@example.com</p>
                </div>
              </div>
            </div>
          </GlassPanel>
        </aside>
      )}



      {/* Mobile header with hamburger */}
      {!isFloorPlan && (
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center glass border-b px-4 py-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <button className="p-2 rounded-xl glass hover:bg-white/40 transition-all" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </button>
              }
            />
            <SheetContent side="left" className="w-64 p-6 glass border-r-0">
              <SheetTitle className="text-2xl font-serif text-slate-800 mb-10">{title}</SheetTitle>
              <NavLinks items={items} onNavigate={() => setOpen(false)} />
              <div className="mt-auto space-y-4 pt-6 border-t border-white/20">
                <LogoutButton />
                <div className="flex items-center gap-3 px-2 py-2">
                  <div className="w-10 h-10 rounded-full bg-slate-200/50 flex items-center justify-center border border-white/30">
                    <UserCircle size={24} className="text-slate-400" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold truncate text-slate-800">Admin User</p>
                    <p className="text-xs text-slate-400 truncate">admin@example.com</p>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <span className="ml-3 text-lg font-semibold font-serif text-slate-800">{title}</span>
        </div>
      )}
    </>
  );
}
