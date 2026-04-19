import type { FloorPlanItem } from "@/types/floor-plan";

function getCorners(item: FloorPlanItem): { x: number; y: number }[] {
  const cx = item.x + item.width / 2;
  const cy = item.y + item.height / 2;
  const hw = item.width / 2;
  const hh = item.height / 2;
  const rad = (item.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  return [
    { x: cx + (-hw * cos - -hh * sin), y: cy + (-hw * sin + -hh * cos) },
    { x: cx + (hw * cos - -hh * sin), y: cy + (hw * sin + -hh * cos) },
    { x: cx + (hw * cos - hh * sin), y: cy + (hw * sin + hh * cos) },
    { x: cx + (-hw * cos - hh * sin), y: cy + (-hw * sin + hh * cos) },
  ];
}

function getAxes(corners: { x: number; y: number }[]): { x: number; y: number }[] {
  const axes: { x: number; y: number }[] = [];
  for (let i = 0; i < corners.length; i++) {
    const next = corners[(i + 1) % corners.length];
    const edge = { x: next.x - corners[i].x, y: next.y - corners[i].y };
    const len = Math.sqrt(edge.x * edge.x + edge.y * edge.y);
    if (len > 0) {
      axes.push({ x: -edge.y / len, y: edge.x / len });
    }
  }
  return axes;
}

function projectOnAxis(
  corners: { x: number; y: number }[],
  axis: { x: number; y: number },
): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  for (const c of corners) {
    const proj = c.x * axis.x + c.y * axis.y;
    if (proj < min) min = proj;
    if (proj > max) max = proj;
  }
  return { min, max };
}

function overlaps(
  a: { min: number; max: number },
  b: { min: number; max: number },
): boolean {
  return a.min < b.max && b.min < a.max;
}

function isCircle(item: FloorPlanItem): boolean {
  return item.type === "round_table";
}

export function rectRectCollision(a: FloorPlanItem, b: FloorPlanItem): boolean {
  const cornersA = getCorners(a);
  const cornersB = getCorners(b);
  const axes = [...getAxes(cornersA), ...getAxes(cornersB)];

  for (const axis of axes) {
    const projA = projectOnAxis(cornersA, axis);
    const projB = projectOnAxis(cornersB, axis);
    if (!overlaps(projA, projB)) return false;
  }
  return true;
}

export function circleCircleCollision(
  a: FloorPlanItem,
  b: FloorPlanItem,
): boolean {
  const rA = a.width / 2;
  const rB = b.width / 2;
  const cxA = a.x + rA;
  const cyA = a.y + rA;
  const cxB = b.x + rB;
  const cyB = b.y + rB;
  const dx = cxB - cxA;
  const dy = cyB - cyA;
  const dist = Math.sqrt(dx * dx + dy * dy);
  return dist < rA + rB;
}

export function circleRectCollision(
  circle: FloorPlanItem,
  rect: FloorPlanItem,
): boolean {
  const r = circle.width / 2;
  const cx = circle.x + r;
  const cy = circle.y + r;

  const corners = getCorners(rect);

  // Check if circle center is inside the polygon
  let inside = false;
  for (let i = 0, j = corners.length - 1; i < corners.length; j = i++) {
    const xi = corners[i].x, yi = corners[i].y;
    const xj = corners[j].x, yj = corners[j].y;
    if ((yi > cy) !== (yj > cy) && cx < (xj - xi) * (cy - yi) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  if (inside) return true;

  // Check distance from circle center to each edge
  let closestDist = Infinity;
  for (let i = 0; i < corners.length; i++) {
    const p1 = corners[i];
    const p2 = corners[(i + 1) % corners.length];
    const edgeX = p2.x - p1.x;
    const edgeY = p2.y - p1.y;
    const edgeLenSq = edgeX * edgeX + edgeY * edgeY;

    let t = ((cx - p1.x) * edgeX + (cy - p1.y) * edgeY) / edgeLenSq;
    t = Math.max(0, Math.min(1, t));
    const closestX = p1.x + t * edgeX;
    const closestY = p1.y + t * edgeY;
    const dx = cx - closestX;
    const dy = cy - closestY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < closestDist) closestDist = dist;
  }

  return closestDist < r;
}

export function isItemOutOfBounds(
  item: FloorPlanItem,
  planWidth: number,
  planHeight: number,
): boolean {
  if (isCircle(item)) {
    const r = item.width / 2;
    const cx = item.x + r;
    const cy = item.y + r;
    return (
      cx - r < 0 ||
      cy - r < 0 ||
      cx + r > planWidth ||
      cy + r > planHeight
    );
  }

  const corners = getCorners(item);
  for (const c of corners) {
    if (c.x < 0 || c.y < 0 || c.x > planWidth || c.y > planHeight) {
      return true;
    }
  }
  return false;
}

export function checkItemCollisions(
  itemId: string,
  items: FloorPlanItem[],
): string[] {
  const target = items.find((i) => i.id === itemId);
  if (!target) return [];

  const collidingIds: string[] = [];

  for (const other of items) {
    if (other.id === itemId) continue;
    if (target.parentItemId === other.id || other.parentItemId === target.id) continue;

    const collision = detectPairCollision(target, other);
    if (collision) collidingIds.push(other.id);
  }

  return collidingIds;
}

function detectPairCollision(
  a: FloorPlanItem,
  b: FloorPlanItem,
): boolean {
  const aIsCircle = isCircle(a);
  const bIsCircle = isCircle(b);

  if (aIsCircle && bIsCircle) return circleCircleCollision(a, b);
  if (aIsCircle && !bIsCircle) return circleRectCollision(a, b);
  if (!aIsCircle && bIsCircle) return circleRectCollision(b, a);
  return rectRectCollision(a, b);
}
