"use client";

import { useState, useRef, useEffect } from "react";
import { updateCoupleName } from "@/app/actions/admin";

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

  if (isLocked || !editing) {
    return (
      <h2
        className={`text-xl font-bold ${!isLocked ? "cursor-pointer hover:text-primary transition-colors" : ""}`}
        onClick={() => !isLocked && setEditing(true)}
        title={!isLocked ? "Click to edit couple name" : undefined}
      >
        {value}
      </h2>
    );
  }

  return (
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
      className="text-xl font-bold bg-transparent border-b-2 border-primary outline-none w-full max-w-md"
    />
  );
}
