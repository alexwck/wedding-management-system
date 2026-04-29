import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ResponsiveTable } from "@/components/responsive-table";

interface TestRow {
  id: number;
  name: string;
  status: string;
}

const columns = [
  { key: "name", header: "Name", cell: (row: TestRow) => row.name },
  { key: "status", header: "Status", cell: (row: TestRow) => row.status },
];

const data: TestRow[] = [
  { id: 1, name: "Alice", status: "Attending" },
  { id: 2, name: "Bob", status: "Declining" },
];

describe("ResponsiveTable", () => {
  beforeEach(() => {
    cleanup();
  });

  it("renders desktop table with headers and rows", () => {
    render(
      <ResponsiveTable
        columns={columns}
        data={data}
        keyExtractor={(row) => row.id}
      />
    );

    // In jsdom both desktop and mobile render, so use getAllByText
    expect(screen.getAllByText("Name").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Status").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Alice").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Bob").length).toBeGreaterThanOrEqual(1);
  });

  it("renders mobile cards with key-value pairs", () => {
    render(
      <ResponsiveTable
        columns={columns}
        data={data}
        keyExtractor={(row) => row.id}
      />
    );

    // Mobile cards use dt/dd layout
    const dts = screen.getAllByText("Name").filter((el) => el.tagName === "DT");
    expect(dts.length).toBeGreaterThanOrEqual(1);
  });

  it("shows empty message when no data", () => {
    render(
      <ResponsiveTable
        columns={columns}
        data={[]}
        keyExtractor={(row) => row.id}
        emptyMessage="No guests found."
      />
    );

    expect(screen.getByText("No guests found.")).toBeInTheDocument();
  });

  it("uses custom empty message when provided", () => {
    render(
      <ResponsiveTable
        columns={columns}
        data={[]}
        keyExtractor={(row) => row.id}
        emptyMessage="Custom empty state"
      />
    );

    expect(screen.getByText("Custom empty state")).toBeInTheDocument();
  });

  it("applies column className to cells", () => {
    const colsWithClass = [
      { key: "name", header: "Name", cell: (row: TestRow) => row.name, className: "text-primary" },
    ];

    render(
      <ResponsiveTable
        columns={colsWithClass}
        data={data}
        keyExtractor={(row) => row.id}
      />
    );

    // Find the first td with text-primary class
    const cells = screen.getAllByText("Alice");
    const tdCell = cells.find((el) => el.closest("td"));
    expect(tdCell?.closest("td")).toHaveClass("text-primary");
  });
});
