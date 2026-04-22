"use client";

interface UnassignedGuestsPanelProps {
  guests: Array<{ id: number; guestName: string }>;
  isLoading: boolean;
}

export function UnassignedGuestsPanel({
  guests,
  isLoading,
}: UnassignedGuestsPanelProps) {
  if (isLoading) {
    return (
      <div className="w-56 shrink-0 border-r glass-panel overflow-y-auto">
        <div className="p-3">
          <p className="text-sm text-muted-foreground">Loading guests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-56 shrink-0 border-r glass-panel overflow-y-auto">
      <div className="p-3">
        <h3 className="text-sm font-semibold mb-2">
          {guests.length === 0
            ? "All guests are seated!"
            : `${guests.length} Unassigned`}
        </h3>

        {guests.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Every attending guest has a seat.
          </p>
        ) : (
          <ul className="space-y-1">
            {guests.map((guest) => (
              <li
                key={guest.id}
                className="text-sm py-1 px-2 rounded hover:bg-white/20 truncate"
              >
                {guest.guestName}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
