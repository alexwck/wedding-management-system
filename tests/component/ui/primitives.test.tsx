import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupInput, InputGroupTextarea } from "@/components/ui/input-group";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

describe("UI Primitives smoke tests", () => {
  beforeEach(() => cleanup());
  afterEach(() => cleanup());

  it("Badge renders without crashing", () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText("Test Badge")).toBeInTheDocument();
  });

  it("Button renders without crashing", () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });

  it("InputGroup with InputGroupInput renders without crashing", () => {
    render(
      <InputGroup>
        <InputGroupInput placeholder="Enter text" />
      </InputGroup>
    );
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("InputGroup with InputGroupTextarea renders without crashing", () => {
    render(
      <InputGroup>
        <InputGroupTextarea placeholder="Enter description" />
      </InputGroup>
    );
    expect(screen.getByPlaceholderText("Enter description")).toBeInTheDocument();
  });

  it("Tabs render without crashing", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );
    expect(screen.getByText("Tab 1")).toBeInTheDocument();
    expect(screen.getByText("Tab 2")).toBeInTheDocument();
  });

  it("Textarea renders without crashing", () => {
    render(<Textarea placeholder="Type here" />);
    expect(screen.getByPlaceholderText("Type here")).toBeInTheDocument();
  });
});
