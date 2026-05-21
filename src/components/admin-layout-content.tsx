"use client";

import { usePathname } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb";

interface AdminLayoutContentProps {
  children: React.ReactNode;
  breadcrumbCrumbs: { label: string; href?: string }[];
}

export function AdminLayoutContent({ children, breadcrumbCrumbs }: AdminLayoutContentProps) {
  const pathname = usePathname();
  const isFloorPlan = pathname?.includes("/floor-plan");

  if (isFloorPlan) {
    return (
      <div className="h-full rounded-3xl overflow-hidden">
        {children}
      </div>
    );
  }

  return (
    <div className="glass min-h-full p-8 md:p-10 rounded-glass">
      <Breadcrumb crumbs={breadcrumbCrumbs} />
      {children}
    </div>
  );
}
