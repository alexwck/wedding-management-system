"use client";

import React, { useState } from "react";
import {
  ITEM_CATALOG,
  type CatalogEntry,
} from "@/lib/floor-plan/constants";
import type { ItemType } from "@/types/floor-plan";
import { PanelLeftClose } from "lucide-react";

export type AvailabilityKey = string;

interface ItemCatalogProps {
  onSelectItem: (type: ItemType, sizeVariant?: number) => void;
  disabled?: boolean;
  unavailableItems?: Set<AvailabilityKey>;
  collapsible?: boolean;
  onToggle?: (visible: boolean) => void;
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

/* Small shape previews for catalog items */
function ShapePreview({ type }: { type: ItemType; size?: number }) {
  if (type === "round_table") {
    return (
      <div className="flex items-center justify-center w-10 h-10">
        <div className="rounded-full border-2 border-slate-400 bg-white/50" style={{ width: 24, height: 24 }} />
      </div>
    );
  }
  if (type === "long_table") {
    return (
      <div className="flex items-center justify-center w-10 h-10">
        <div className="rounded-full border-2 border-slate-400 bg-white/50" style={{ width: 28, height: 12 }} />
      </div>
    );
  }
  if (type === "stage") {
    return (
      <div className="flex items-center justify-center w-10 h-10">
        <div className="rounded border-2 border-slate-400 bg-white/50" style={{ width: 24, height: 18 }} />
      </div>
    );
  }
  if (type === "pillar") {
    return (
      <div className="flex items-center justify-center w-10 h-10">
        <div className="rounded-sm bg-slate-400" style={{ width: 10, height: 10 }} />
      </div>
    );
  }
  if (type === "walkway") {
    return (
      <div className="flex items-center justify-center w-10 h-10">
        <div className="border-t-2 border-dashed border-slate-400" style={{ width: 26, height: 0 }} />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center w-10 h-10">
      <div className="rotate-45 border-2 border-slate-400 bg-white/50" style={{ width: 14, height: 14 }} />
    </div>
  );
}

export function ItemCatalog({ onSelectItem, disabled = false, unavailableItems, collapsible = true, onToggle }: ItemCatalogProps) {
  const [collapsed, setCollapsed] = useState(false);

  const isUnavailable = (entry: CatalogEntry) =>
    unavailableItems?.has(entryKey(entry)) ?? false;

  const CatalogItem = ({ entry }: { entry: CatalogEntry }) => {
    const unavailable = isUnavailable(entry);
    const size = entry.type === "round_table" ? entry.diameter : entry.type === "long_table" ? entry.length : undefined;
    
    const label = entry.type === "round_table"
      ? `${entry.diameter}ft`
      : entry.type === "long_table"
        ? `${entry.length}ft`
        : OTHER_ITEM_LABELS[entry.type] ?? entry.type;

    return (
      <button
        type="button"
        onClick={() => size !== undefined ? onSelectItem(entry.type, size) : onSelectItem(entry.type)}
        disabled={disabled || unavailable}
        aria-disabled={unavailable || disabled}
        tabIndex={unavailable ? -1 : 0}
        aria-label={`${label}${unavailable ? " — No space available" : ""}`}
        className={`
          flex flex-col items-center gap-1 p-2 rounded-xl border transition-all
          ${unavailable
            ? "opacity-40 cursor-not-allowed border-white/10 bg-white/10"
            : "border-white/20 bg-white/20 hover:bg-white/40 hover:shadow-md active:scale-95 cursor-pointer"
          }
        `}
      >
        <ShapePreview type={entry.type} size={size} />
        <span className="text-[10px] font-medium text-slate-600 leading-tight text-center">{label}</span>
      </button>
    );
  };

  return (
    <aside className="w-60 p-3 flex flex-col gap-3 overflow-y-auto bg-[#f5f7fc] shadow-lg border border-slate-200/60 rounded-xl relative">
      {/* Inline header */}
      <div className="flex items-center justify-between shrink-0">
        <h3 className="text-sm font-semibold text-slate-700">Catalog</h3>
        {collapsible && (
          <button
            type="button"
            onClick={() => onToggle ? onToggle(false) : setCollapsed(!collapsed)}
            className="p-1.5 rounded hover:bg-white/20 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
            aria-label={onToggle ? "Hide catalog" : (collapsed ? "Expand catalog" : "Collapse catalog")}
          >
            <PanelLeftClose className="h-4 w-4 text-slate-500" />
          </button>
        )}
      </div>

      {!collapsed && (
        <>
          {/* Round Tables */}
          <div className="space-y-1">
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Round Tables</p>
            <div className="grid grid-cols-3 gap-1.5">
              {ROUND_TABLES.map((entry) => (
                <CatalogItem key={`round-${entry.diameter}`} entry={entry} />
              ))}
            </div>
          </div>

          {/* Long Tables */}
          <div className="space-y-1">
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Long Tables</p>
            <div className="grid grid-cols-3 gap-1.5">
              {LONG_TABLES.map((entry) => (
                <CatalogItem key={`long-${entry.length}`} entry={entry} />
              ))}
            </div>
          </div>

          {/* Other Items */}
          <div className="space-y-1">
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Other</p>
            <div className="grid grid-cols-3 gap-1.5">
              {OTHER_ITEMS.map((entry) => (
                <CatalogItem key={entry.type} entry={entry} />
              ))}
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
