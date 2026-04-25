"use client";

import { useState, useRef, useEffect } from "react";
import { updateCoupleName } from "@/app/actions/admin";
import { Pencil } from "lucide-react";

interface EditableCoupleNameProps {
  weddingId: number;
  coupleName: string;
  isLocked?: boolean;
}

export function EditableCoupleName({ weddingId, coupleName, isLocked }: EditableCoupleNameProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(coupleName);
  const [saving, setSaving] = useState(false);
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
    } else {
      setValue(coupleName);
    }
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
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
          className="text-2xl font-bold bg-transparent border-b-2 border-primary outline-none w-full max-w-md"
        />
        {saving && <span className="text-sm text-muted-foreground">Saving...</span>}
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
        <h2 className="text-2xl font-bold">{value}</h2>
        {!isLocked && (
          <Pencil className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-0.5">
        This name is shown to guests on the wedding page
      </p>
    </div>
  );
}
