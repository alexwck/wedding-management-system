"use client";

import React, { useState } from "react";
import {
  ITEM_CATALOG,
  type CatalogEntry,
} from "@/lib/floor-plan/constants";
import type { ItemType } from "@/types/floor-plan";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeft } from "lucide-react";

interface ItemCatalogProps {
  onSelectItem: (type: ItemType, sizeVariant?: number) => void;
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

export function ItemCatalog({ onSelectItem }: ItemCatalogProps) {
  const [collapsed, setCollapsed] = useState(false);
  const roundTables = ROUND_TABLES;
  const longTables = LONG_TABLES;
  const otherItems = OTHER_ITEMS;

  return (
    <aside
      className={`${
        collapsed ? "w-12" : "w-64"
      } border-r p-4 flex flex-col gap-4 overflow-y-auto overflow-hidden glass-panel shrink-0 h-[calc(100vh-40px)]`}
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
            {roundTables.map((entry) => (
              <Button
                key={`round-${entry.diameter}`}
                variant="outline"
                size="sm"
                onClick={() => onSelectItem("round_table", entry.diameter)}
              >
                {entry.diameter}ft &middot; {entry.defaultChairs} chairs
              </Button>
            ))}
          </div>

          <div className="flex flex-col gap-2 border-b pb-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Long Tables
            </h3>
            {longTables.map((entry) => (
              <Button
                key={`long-${entry.length}`}
                variant="outline"
                size="sm"
                onClick={() => onSelectItem("long_table", entry.length)}
              >
                {entry.length}ft x {entry.height}ft &middot; {entry.defaultChairs}{" "}
                chairs
              </Button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Other Items
            </h3>
            {otherItems.map((entry) => (
              <Button
                key={entry.type}
                variant="outline"
                size="sm"
                onClick={() => onSelectItem(entry.type)}
              >
                {OTHER_ITEM_LABELS[entry.type] ?? entry.type}
              </Button>
            ))}
          </div>
        </>
      )}
    </aside>
  );
}
