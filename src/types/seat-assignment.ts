export interface SeatAssignment {
  id: number;
  weddingId: number;
  rsvpId: number;
  chairItemId: string;
  tableItemId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RsvpWithAssignment {
  id: number;
  weddingId: number;
  guestName: string;
  status: string;
  vegetarian: boolean;
  dietaryNotes: string | null;
  babyChair: boolean;
  submittedAt: string | null;
  seatAssignment: {
    chairItemId: string;
    tableItemId: string;
  } | null;
  tableName: string | null;
  seatLabel: string | null;
}

export type SeatAssignmentMap = Record<
  string,
  {
    guestName: string;
    rsvpId: number;
  }
>;
