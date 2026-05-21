"use client";

import { useState, useRef, useEffect } from "react";
import { updateCoupleName } from "@/app/actions/admin";
import { Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";

interface EditableCoupleNameProps {
  weddingId: number;
  coupleName: string;
  isLocked?: boolean;
}

export function EditableCoupleName({ weddingId, coupleName, isLocked }: EditableCoupleNameProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(coupleName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(coupleName);
  }, [coupleName]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  async function save() {
    setError(null);
    const trimmed = value.trim();
    if (!trimmed || trimmed === coupleName) {
      setValue(coupleName);
      setEditing(false);
      return;
    }

    setSaving(true);
    const result = await updateCoupleName(weddingId, trimmed);
    setSaving(false);

    if (result.success) {
      setValue(result.coupleName);
      setEditing(false);
    } else {
      setError(result.error ?? "Failed to save couple name.");
      setValue(coupleName);
      setEditing(false);
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") {
              setValue(coupleName);
              setEditing(false);
            }
          }}
          disabled={saving}
          maxLength={100}
          className="text-2xl font-bold bg-transparent border-0 border-b-2 border-primary rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary w-full max-w-md"
        />
        {saving && <span className="text-sm text-slate-500">Saving...</span>}
      </div>
    );
  }

  return (
    <div
      className={`group ${!isLocked ? "cursor-pointer" : ""}`}
      onClick={() => !isLocked && setEditing(true)}
      title={!isLocked ? "Click to edit couple name" : undefined}
    >
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold text-slate-800">{value}</h2>
        {!isLocked && (
          <Pencil className="h-4 w-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
      <p className="text-xs text-slate-500 mt-0.5">
        This name is shown to guests on the wedding page
      </p>
      {error && (
        <p className="text-xs text-rose-600 mt-0.5">{error}</p>
      )}
    </div>
  );
}
