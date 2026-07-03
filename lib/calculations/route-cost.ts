import type { RouteCostResult, RouteSegment } from "@/lib/types";

export const DEFAULT_COST_PER_MILE = 1.5;

export function calculateRouteCost(
  segments: RouteSegment[],
  costPerMile: number = DEFAULT_COST_PER_MILE
): RouteCostResult {
  const computedSegments = segments.map((seg) => ({
    label: seg.label,
    distanceMiles: seg.distanceMiles,
    cost: seg.distanceMiles * costPerMile,
  }));

  const totalDistanceMiles = computedSegments.reduce(
    (sum, s) => sum + s.distanceMiles,
    0
  );
  const totalTravelCost = computedSegments.reduce((sum, s) => sum + s.cost, 0);

  return {
    segments: computedSegments,
    totalDistanceMiles,
    costPerMile,
    totalTravelCost,
  };
}

export const defaultRouteSegments: RouteSegment[] = [
  { id: "R001", label: "Pickup → Tour start", distanceMiles: 15 },
  { id: "R002", label: "Tour stop 1 → stop 2", distanceMiles: 25 },
  { id: "R003", label: "Stop 2 → stop 3", distanceMiles: 18 },
  { id: "R004", label: "Return trip", distanceMiles: 22 },
];
