"use client";

import React, { useState } from "react";
import {
  ITEM_CATALOG,
  type CatalogEntry,
} from "@/lib/floor-plan/constants";
import type { ItemType } from "@/types/floor-plan";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeft } from "lucide-react";

export type AvailabilityKey = string;

interface ItemCatalogProps {
  onSelectItem: (type: ItemType, sizeVariant?: number) => void;
  disabled?: boolean;
  unavailableItems?: Set<AvailabilityKey>;
}

function entryKey(entry: CatalogEntry): AvailabilityKey {
  if (entry.type === "round_table") return `round_table-${(entry as CatalogEntry & { diameter: number }).diameter}`;
  if (entry.type === "long_table") return `long_table-${(entry as CatalogEntry & { length: number }).length}`;
  return entry.type;
}

function isRoundTableEntry(
  entry: CatalogEntry,
): entry is CatalogEntry & { type: "round_table"; diameter: number } {
  return entry.type === "round_table";
}

function isLongTableEntry(
  entry: CatalogEntry,
): entry is CatalogEntry & { type: "long_table"; length: number } {
  return entry.type === "long_table";
}

function isGenericEntry(
  entry: CatalogEntry,
): entry is CatalogEntry & {
  type: Exclude<ItemType, "round_table" | "long_table" | "chair">;
} {
  return (
    entry.type !== "round_table" &&
    entry.type !== "long_table" &&
    entry.type !== "chair"
  );
}

const OTHER_ITEM_LABELS: Record<string, string> = {
  stage: "Stage",
  pillar: "Pillar",
  walkway: "Walkway",
  misc: "Misc",
};

const ROUND_TABLES = ITEM_CATALOG.filter(isRoundTableEntry);
const LONG_TABLES = ITEM_CATALOG.filter(isLongTableEntry);
const OTHER_ITEMS = ITEM_CATALOG.filter(isGenericEntry);

export function ItemCatalog({ onSelectItem, disabled = false, unavailableItems }: ItemCatalogProps) {
  const [collapsed, setCollapsed] = useState(false);

  const isUnavailable = (entry: CatalogEntry) =>
    unavailableItems?.has(entryKey(entry)) ?? false;

  return (
    <aside
      className={`${
        collapsed ? "w-12" : "w-64"
      } border-r p-4 flex flex-col gap-4 overflow-y-auto glass-panel shrink-0 relative z-[60] h-[calc(100vh-40px)]`}
    >
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="self-end p-1 rounded hover:bg-accent"
        aria-label={collapsed ? "Expand catalog" : "Collapse catalog"}
      >
        {collapsed ? (
          <PanelLeft className="h-4 w-4" />
        ) : (
          <PanelLeftClose className="h-4 w-4" />
        )}
      </button>

      {!collapsed && (
        <>
          <div className="flex flex-col gap-2 border-b pb-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Round Tables
            </h3>
            {ROUND_TABLES.map((entry) => {
              const unavailable = isUnavailable(entry);
              return (
                <Button
                  key={`round-${entry.diameter}`}
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectItem("round_table", entry.diameter)}
                  disabled={disabled}
                  aria-disabled={unavailable || disabled}
                  tabIndex={unavailable ? -1 : 0}
                  aria-label={`${entry.diameter}ft Round Table${unavailable ? " — No space available" : ""}`}
                  className={unavailable ? "opacity-50 cursor-not-allowed" : undefined}
                >
                  {entry.diameter}ft &middot; {entry.defaultChairs} chairs
                </Button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2 border-b pb-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Long Tables
            </h3>
            {LONG_TABLES.map((entry) => {
              const unavailable = isUnavailable(entry);
              return (
                <Button
                  key={`long-${entry.length}`}
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectItem("long_table", entry.length)}
                  disabled={disabled}
                  aria-disabled={unavailable || disabled}
                  tabIndex={unavailable ? -1 : 0}
                  aria-label={`${entry.length}ft Long Table${unavailable ? " — No space available" : ""}`}
                  className={unavailable ? "opacity-50 cursor-not-allowed" : undefined}
                >
                  {entry.length}ft x {entry.height}ft &middot; {entry.defaultChairs}{" "}
                  chairs
                </Button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Other Items
            </h3>
            {OTHER_ITEMS.map((entry) => {
              const unavailable = isUnavailable(entry);
              return (
                <Button
                  key={entry.type}
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectItem(entry.type)}
                  disabled={disabled}
                  aria-disabled={unavailable || disabled}
                  tabIndex={unavailable ? -1 : 0}
                  aria-label={`${OTHER_ITEM_LABELS[entry.type] ?? entry.type}${unavailable ? " — No space available" : ""}`}
                  className={unavailable ? "opacity-50 cursor-not-allowed" : undefined}
                >
                  {OTHER_ITEM_LABELS[entry.type] ?? entry.type}
                </Button>
              );
            })}
          </div>
        </>
      )}
    </aside>
  );
}
