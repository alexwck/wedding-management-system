"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { signOut } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/client";

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
    const supabase = createClient();
    await Promise.all([
      supabase.auth.signOut(),
      signOut(),
    ]);
    router.push("/auth/login");
  }

  return (
    <button
      data-testid="logout-button"
      onClick={handleLogout}
      className="block w-full text-left rounded-md px-3 py-2 text-sm text-destructive hover:bg-accent"
    >
      Logout
    </button>
  );
}

export function Nav({ title, items }: NavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-muted/50 p-6">
        <h1 className="text-lg font-semibold mb-6">{title}</h1>
        <nav className="space-y-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
            >
              {item.label}
            </Link>
          ))}
          <LogoutButton />
        </nav>
      </aside>

      {/* Mobile header with hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center border-b bg-background px-4 py-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="outline" size="icon" aria-label="Open menu" />
            }
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-6">
            <SheetTitle className="text-lg font-semibold mb-6">{title}</SheetTitle>
            <nav className="space-y-2">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
                >
                  {item.label}
                </Link>
              ))}
              <LogoutButton />
            </nav>
          </SheetContent>
        </Sheet>
        <span className="ml-3 text-lg font-semibold">{title}</span>
      </div>
    </>
  );
}
