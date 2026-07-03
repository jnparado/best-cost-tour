"use client";

import { useState, useMemo } from "react";
import {
  calculateRouteCost,
  DEFAULT_COST_PER_MILE,
  defaultRouteSegments,
} from "@/lib/calculations/route-cost";
import { formatCurrency } from "@/lib/calculations/booking-cost";
import { Card } from "@/components/ui/card";
import type { RouteSegment } from "@/lib/types";

export function RouteCalculator() {
  const [costPerMile, setCostPerMile] = useState(DEFAULT_COST_PER_MILE);
  const [segments, setSegments] = useState<RouteSegment[]>(defaultRouteSegments);

  const result = useMemo(
    () => calculateRouteCost(segments, costPerMile),
    [segments, costPerMile]
  );

  function updateDistance(id: string, distance: number) {
    setSegments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, distanceMiles: distance } : s))
    );
  }

  function addSegment() {
    setSegments((prev) => [
      ...prev,
      {
        id: `R${Date.now()}`,
        label: `Segment ${prev.length + 1}`,
        distanceMiles: 10,
      },
    ]);
  }

  function removeSegment(id: string) {
    setSegments((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card
        title="Route Segments"
        description="Configure distance for each leg of the journey"
      >
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Cost per Mile ($)
          </label>
          <input
            type="number"
            min={0}
            step={0.1}
            value={costPerMile}
            onChange={(e) => setCostPerMile(Number(e.target.value))}
            className="w-32 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <div className="space-y-3">
          {segments.map((seg) => (
            <div
              key={seg.id}
              className="flex items-center gap-3 rounded-lg border border-slate-200 p-3"
            >
              <div className="flex-1">
                <input
                  type="text"
                  value={seg.label}
                  onChange={(e) =>
                    setSegments((prev) =>
                      prev.map((s) =>
                        s.id === seg.id ? { ...s, label: e.target.value } : s
                      )
                    )
                  }
                  className="w-full border-0 bg-transparent text-sm font-medium text-slate-900 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={seg.distanceMiles}
                  onChange={(e) =>
                    updateDistance(seg.id, Number(e.target.value))
                  }
                  className="w-20 rounded border border-slate-300 px-2 py-1 text-sm text-right"
                />
                <span className="text-xs text-slate-500">mi</span>
                <button
                  onClick={() => removeSegment(seg.id)}
                  className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"
                  aria-label="Remove segment"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addSegment}
          className="mt-4 w-full rounded-lg border-2 border-dashed border-slate-300 py-2 text-sm font-medium text-slate-500 hover:border-sky-400 hover:text-sky-600"
        >
          + Add Segment
        </button>
      </Card>

      <Card title="Travel Cost Result" description="Distance × Cost per Mile">
        <div className="mb-4 rounded-lg bg-sky-50 p-4">
          <p className="text-sm text-sky-700">Formula</p>
          <p className="mt-1 font-mono text-xs text-sky-600">
            Travel Cost = Distance × Cost per Mile
          </p>
        </div>

        <div className="space-y-3">
          {result.segments.map((seg, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div>
                <span className="text-slate-600">{seg.label}</span>
                <span className="ml-2 text-xs text-slate-400">
                  ({seg.distanceMiles} mi)
                </span>
              </div>
              <span className="font-medium text-slate-900">
                {formatCurrency(seg.cost)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-2 border-t border-slate-200 pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Total Distance</span>
            <span className="font-medium">{result.totalDistanceMiles} miles</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Rate</span>
            <span className="font-medium">
              {formatCurrency(result.costPerMile)}/mile
            </span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-base font-semibold text-slate-900">
              Total Transport Cost
            </span>
            <span className="text-2xl font-bold text-sky-600">
              {formatCurrency(result.totalTravelCost)}
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-slate-50 p-3 text-center">
            <p className="text-xs text-slate-500">Fuel</p>
            <p className="text-sm font-semibold text-slate-700">
              {formatCurrency(result.totalTravelCost * 0.4)}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 text-center">
            <p className="text-xs text-slate-500">Driver Labor</p>
            <p className="text-sm font-semibold text-slate-700">
              {formatCurrency(result.totalTravelCost * 0.45)}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 text-center">
            <p className="text-xs text-slate-500">Vehicle Wear</p>
            <p className="text-sm font-semibold text-slate-700">
              {formatCurrency(result.totalTravelCost * 0.15)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
