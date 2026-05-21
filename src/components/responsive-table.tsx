"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GlassPanel } from "@/components/glassmorphism/glass-panel";

interface ResponsiveTableColumn<T> {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  className?: string;
}

interface ResponsiveTableProps<T> {
  columns: ResponsiveTableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  emptyMessage?: string;
  className?: string;
  mobileCardClassName?: string;
}

export function ResponsiveTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "No data available.",
  className,
  mobileCardClassName,
}: ResponsiveTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Desktop table */}
      <div className="hidden md:block glass-panel rounded-xl p-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className={cn("min-w-[80px] max-w-[300px]", col.className)}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={keyExtractor(row)}>
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {col.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {data.map((row) => (
          <GlassPanel
            key={keyExtractor(row)}
            variant="medium"
            className={cn("p-4", mobileCardClassName)}
          >
            <dl className="space-y-2">
              {columns.map((col) => (
                <div key={col.key} className="flex justify-between items-start gap-4">
                  <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide shrink-0">
                    {col.header}
                  </dt>
                  <dd className="text-sm text-right">{col.cell(row)}</dd>
                </div>
              ))}
            </dl>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
