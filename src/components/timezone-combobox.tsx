"use client";

import { useState, useRef, useEffect } from "react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from "@/components/ui/command";

interface TimezoneComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

const TIMEZONES = typeof Intl !== "undefined" && Intl.supportedValuesOf
  ? Intl.supportedValuesOf("timeZone")
  : [];

export function TimezoneCombobox({ value, onChange }: TimezoneComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = search
    ? TIMEZONES.filter((tz) => tz.toLowerCase().includes(search.toLowerCase()))
    : TIMEZONES;

  return (
    <div ref={containerRef} className="relative flex-1">
      <input
        type="text"
        value={open ? search : value}
        onChange={(e) => {
          setSearch(e.target.value);
          if (!open) setOpen(true);
        }}
        onFocus={() => {
          setSearch(value);
          setOpen(true);
        }}
        placeholder="Search timezone..."
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />

      {open && (
        <div className="absolute z-50 top-full mt-1 w-full">
          <Command className="rounded-lg border shadow-md">
            <CommandInput
              value={search}
              onValueChange={setSearch}
              placeholder="Search timezone..."
            />
            <CommandList>
              <CommandEmpty>No timezone found.</CommandEmpty>
              {filtered.slice(0, 50).map((tz) => (
                <CommandItem
                  key={tz}
                  value={tz}
                  onSelect={() => {
                    onChange(tz);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  {tz}
                </CommandItem>
              ))}
              {filtered.length > 50 && (
                <div className="px-2 py-1.5 text-xs text-muted-foreground text-center">
                  {filtered.length - 50} more results...
                </div>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
