import type { FloorPlanItem } from "@/types/floor-plan";
import {
  DEFAULT_CHAIR_SIZE,
  getMaxChairs,
} from "@/lib/floor-plan/constants";

function generateRoundTableChairs(
  table: FloorPlanItem,
  count: number,
): FloorPlanItem[] {
  const diameter = table.metadata.diameter ?? table.width;
  const radius = diameter / 2;
  const cx = table.x + radius;
  const cy = table.y + radius;
  const offset = radius + 0.75;

  return Array.from({ length: count }, (_, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    return {
      id: crypto.randomUUID(),
      type: "chair" as const,
      label: `Chair ${i + 1}`,
      x: cx + Math.cos(angle) * offset - DEFAULT_CHAIR_SIZE.width / 2,
      y: cy + Math.sin(angle) * offset - DEFAULT_CHAIR_SIZE.height / 2,
      width: DEFAULT_CHAIR_SIZE.width,
      height: DEFAULT_CHAIR_SIZE.height,
      rotation: 0,
      parentItemId: table.id,
      metadata: { chairIndex: i },
    };
  });
}

function generateLongTableChairs(
  table: FloorPlanItem,
  count: number,
): FloorPlanItem[] {
  const chairs: FloorPlanItem[] = [];
  const halfCount = Math.ceil(count / 2);
  const bottomCount = count - halfCount;
  const chairOffset = 0.75;

  const spacing = table.width / halfCount;

  for (let i = 0; i < halfCount; i++) {
    const chairX =
      table.x + spacing * (i + 0.5) - DEFAULT_CHAIR_SIZE.width / 2;
    const chairY = table.y - chairOffset - DEFAULT_CHAIR_SIZE.height;
    chairs.push({
      id: crypto.randomUUID(),
      type: "chair",
      label: `Chair ${chairs.length + 1}`,
      x: chairX,
      y: chairY,
      width: DEFAULT_CHAIR_SIZE.width,
      height: DEFAULT_CHAIR_SIZE.height,
      rotation: 0,
      parentItemId: table.id,
      metadata: { chairIndex: chairs.length },
    });
  }

  const bottomSpacing = table.width / bottomCount;
  for (let i = 0; i < bottomCount; i++) {
    const chairX =
      table.x + bottomSpacing * (i + 0.5) - DEFAULT_CHAIR_SIZE.width / 2;
    const chairY = table.y + table.height + chairOffset;
    chairs.push({
      id: crypto.randomUUID(),
      type: "chair",
      label: `Chair ${chairs.length + 1}`,
      x: chairX,
      y: chairY,
      width: DEFAULT_CHAIR_SIZE.width,
      height: DEFAULT_CHAIR_SIZE.height,
      rotation: 0,
      parentItemId: table.id,
      metadata: { chairIndex: chairs.length },
    });
  }

  return chairs;
}

export function generateChairsForTable(table: FloorPlanItem): FloorPlanItem[] {
  const count = table.metadata.chairCount ?? 0;
  if (count === 0) return [];

  if (table.type === "round_table") {
    return generateRoundTableChairs(table, count);
  }
  if (table.type === "long_table") {
    return generateLongTableChairs(table, count);
  }
  return [];
}

export function redistributeChairs(
  table: FloorPlanItem,
  newCount: number,
): FloorPlanItem[] {
  table.metadata.chairCount = newCount;
  return generateChairsForTable(table);
}

export function getMaxChairCount(table: FloorPlanItem): number {
  const size = table.metadata.diameter ?? table.metadata.length;
  return getMaxChairs(table.type, size) + 1;
}
