import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GuestAssignmentDialog } from "@/components/floor-plan/guest-assignment-dialog";

// -- Mocks ---------------------------------------------------------------

// Radix Dialog primitives are hard to test in isolation; stub them.
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div>{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
}));

// cmdk Command components require extensive DOM API mocking; stub them.
vi.mock("@/components/ui/command", () => ({
  Command: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="command">{children}</div>
  ),
  CommandInput: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input data-testid="command-input" {...props} />
  ),
  CommandList: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="command-list">{children}</div>
  ),
  CommandEmpty: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="command-empty">{children}</div>
  ),
  CommandItem: ({
    children,
    onSelect,
    ...props
  }: {
    children: React.ReactNode;
    onSelect?: () => void;
    disabled?: boolean;
    value?: string;
  }) => (
    <div data-testid="command-item" onClick={onSelect} {...props}>
      {children}
    </div>
  ),
}));

// -- Helpers --------------------------------------------------------------

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  chairItemId: "chair-1",
  tableItemId: "table-1",
  currentGuestName: null as string | null,
  unassignedGuests: [] as { id: number; guestName: string }[],
  onAssign: vi.fn(),
  onUnassign: vi.fn(),
};

function renderDialog(overrides: Partial<typeof defaultProps> = {}) {
  return render(
    <GuestAssignmentDialog {...defaultProps} {...overrides} />,
  );
}

// -- Tests ----------------------------------------------------------------

describe("GuestAssignmentDialog", () => {
  afterEach(cleanup);

  // -- Title ---------------------------------------------------------------

  it('renders "Assign Guest" title for an empty seat', () => {
    renderDialog({ currentGuestName: null });
    expect(screen.getByText("Assign Guest")).toBeInTheDocument();
  });

  it('renders "Seat Assignment" title for an occupied seat', () => {
    renderDialog({ currentGuestName: "Alice" });
    expect(screen.getByText("Seat Assignment")).toBeInTheDocument();
  });

  // -- Occupied seat display -----------------------------------------------

  it("shows the current guest name when the seat is occupied", () => {
    renderDialog({ currentGuestName: "Alice" });
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it('shows "Currently seated" label for an occupied seat', () => {
    renderDialog({ currentGuestName: "Alice" });
    expect(screen.getByText("Currently seated")).toBeInTheDocument();
  });

  it("renders the Unassign button when the seat is occupied", () => {
    renderDialog({ currentGuestName: "Alice" });
    expect(
      screen.getByRole("button", { name: /unassign/i }),
    ).toBeInTheDocument();
  });

  it("does not render the occupied section when the seat is empty", () => {
    renderDialog({ currentGuestName: null });
    expect(screen.queryByText("Currently seated")).not.toBeInTheDocument();
  });

  // -- Guest list ----------------------------------------------------------

  it("renders unassigned guests as selectable items", () => {
    renderDialog({
      currentGuestName: null,
      unassignedGuests: [
        { id: 1, guestName: "Alice" },
        { id: 2, guestName: "Bob" },
      ],
    });
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("renders guests alongside an occupied seat for reassignment", () => {
    renderDialog({
      currentGuestName: "Carol",
      unassignedGuests: [{ id: 1, guestName: "Dave" }],
    });
    expect(screen.getByText("Carol")).toBeInTheDocument();
    expect(screen.getByText("Dave")).toBeInTheDocument();
  });

  // -- Empty state messages ------------------------------------------------

  it('shows "All guests are seated." when empty seat and no unassigned guests', () => {
    renderDialog({
      currentGuestName: null,
      unassignedGuests: [],
    });
    expect(screen.getByText("All guests are seated.")).toBeInTheDocument();
  });

  it('shows "All other guests are seated." when occupied and no other unassigned guests', () => {
    renderDialog({
      currentGuestName: "Alice",
      unassignedGuests: [],
    });
    expect(
      screen.getByText("All other guests are seated."),
    ).toBeInTheDocument();
  });

  // -- Unassign callback ---------------------------------------------------

  it("calls onUnassign and closes dialog on successful unassign", async () => {
    const onUnassign = vi
      .fn()
      .mockResolvedValue({ success: true });
    const onOpenChange = vi.fn();

    renderDialog({
      currentGuestName: "Alice",
      onUnassign,
      onOpenChange,
    });

    await userEvent.click(
      screen.getByRole("button", { name: /unassign/i }),
    );

    expect(onUnassign).toHaveBeenCalledWith("chair-1");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not close dialog when unassign fails", async () => {
    const onUnassign = vi
      .fn()
      .mockResolvedValue({ success: false, error: "fail" });
    const onOpenChange = vi.fn();

    renderDialog({
      currentGuestName: "Alice",
      onUnassign,
      onOpenChange,
    });

    await userEvent.click(
      screen.getByRole("button", { name: /unassign/i }),
    );

    expect(onUnassign).toHaveBeenCalledWith("chair-1");
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  // -- Assign callback -----------------------------------------------------

  it("calls onAssign and closes dialog on successful guest selection", async () => {
    const onAssign = vi
      .fn()
      .mockResolvedValue({ success: true });
    const onOpenChange = vi.fn();

    renderDialog({
      currentGuestName: null,
      unassignedGuests: [{ id: 5, guestName: "Eve" }],
      onAssign,
      onOpenChange,
    });

    // The mocked CommandItem renders the guest name inside a div
    await userEvent.click(screen.getByText("Eve"));

    expect(onAssign).toHaveBeenCalledWith(5, "chair-1", "table-1", "Eve");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not close dialog when assign fails", async () => {
    const onAssign = vi
      .fn()
      .mockResolvedValue({ success: false, error: "fail" });
    const onOpenChange = vi.fn();

    renderDialog({
      currentGuestName: null,
      unassignedGuests: [{ id: 5, guestName: "Eve" }],
      onAssign,
      onOpenChange,
    });

    await userEvent.click(screen.getByText("Eve"));

    expect(onAssign).toHaveBeenCalledWith(5, "chair-1", "table-1", "Eve");
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  // -- Reassignment (occupied + select new guest) --------------------------

  it("unassigns current guest first when selecting a new guest for an occupied seat", async () => {
    const onUnassign = vi
      .fn()
      .mockResolvedValue({ success: true });
    const onAssign = vi
      .fn()
      .mockResolvedValue({ success: true });
    const onOpenChange = vi.fn();

    renderDialog({
      currentGuestName: "Alice",
      unassignedGuests: [{ id: 2, guestName: "Bob" }],
      onUnassign,
      onAssign,
      onOpenChange,
    });

    await userEvent.click(screen.getByText("Bob"));

    // Should unassign first, then assign
    expect(onUnassign).toHaveBeenCalledWith("chair-1");
    expect(onAssign).toHaveBeenCalledWith(2, "chair-1", "table-1", "Bob");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not assign if unassign fails during reassignment", async () => {
    const onUnassign = vi
      .fn()
      .mockResolvedValue({ success: false, error: "fail" });
    const onAssign = vi.fn().mockResolvedValue({ success: true });

    renderDialog({
      currentGuestName: "Alice",
      unassignedGuests: [{ id: 2, guestName: "Bob" }],
      onUnassign,
      onAssign,
    });

    await userEvent.click(screen.getByText("Bob"));

    expect(onUnassign).toHaveBeenCalledWith("chair-1");
    expect(onAssign).not.toHaveBeenCalled();
  });

  // -- Closed state --------------------------------------------------------

  it("renders nothing when open is false", () => {
    renderDialog({ open: false });
    expect(screen.queryByText("Assign Guest")).not.toBeInTheDocument();
    expect(screen.queryByText("Seat Assignment")).not.toBeInTheDocument();
  });
});
