"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  crumbs: Crumb[];
  className?: string;
}

export function Breadcrumb({ crumbs, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1 text-sm text-slate-500 mb-4", className)}>
      {crumbs.map((crumb, i) => (
        <div key={crumb.label} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
          {crumb.href ? (
            <Link href={crumb.href} className="hover:text-slate-800 hover:underline transition-colors">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-slate-800 font-medium">{crumb.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
