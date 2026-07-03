"use client";

import { useState, useMemo } from "react";
import { addOns } from "@/lib/data/addons";
import { tours } from "@/lib/data/tours";
import { calculateBookingCost, formatCurrency } from "@/lib/calculations/booking-cost";
import { getVehicleForGroupSize } from "@/lib/data/vehicles";
import { Card } from "@/components/ui/card";

export function CostCalculator() {
  const [tourId, setTourId] = useState(tours[0].id);
  const [passengers, setPassengers] = useState(4);
  const [pickupCost, setPickupCost] = useState(50);
  const [selectedAddOns, setSelectedAddOns] = useState<
    Record<string, { selected: boolean; quantity: number; hours: number }>
  >({});

  const addOnSelections = useMemo(
    () =>
      Object.entries(selectedAddOns)
        .filter(([, v]) => v.selected)
        .map(([id, v]) => ({
          addOnId: id,
          quantity: v.quantity,
          hours: v.hours,
        })),
    [selectedAddOns]
  );

  const breakdown = useMemo(
    () =>
      calculateBookingCost({
        tourId,
        passengers,
        pickupCost,
        addOns: addOnSelections,
      }),
    [tourId, passengers, pickupCost, addOnSelections]
  );

  const vehicle = getVehicleForGroupSize(passengers);
  const tour = tours.find((t) => t.id === tourId)!;

  function toggleAddOn(id: string) {
    setSelectedAddOns((prev) => ({
      ...prev,
      [id]: prev[id]?.selected
        ? { ...prev[id], selected: false }
        : { selected: true, quantity: 1, hours: 1 },
    }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="Booking Details" description="Configure tour parameters">
        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Tour
            </label>
            <select
              value={tourId}
              onChange={(e) => setTourId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              {tours.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — {formatCurrency(t.basePricePerPerson)}/person
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Passengers
              </label>
              <input
                type="number"
                min={1}
                max={40}
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Pickup Cost ($)
              </label>
              <input
                type="number"
                min={0}
                value={pickupCost}
                onChange={(e) => setPickupCost(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-700">
              Assigned Vehicle: {vehicle.type}
            </p>
            <p className="mt-1 text-xs text-slate-500">{vehicle.description}</p>
            {vehicle.rentalCost > 0 && (
              <p className="mt-1 text-xs font-medium text-sky-600">
                Rental: {formatCurrency(vehicle.rentalCost)}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Add-Ons
            </label>
            <div className="space-y-2">
              {addOns.map((addon) => {
                const sel = selectedAddOns[addon.id];
                return (
                  <label
                    key={addon.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={sel?.selected ?? false}
                      onChange={() => toggleAddOn(addon.id)}
                      className="h-4 w-4 rounded border-slate-300 text-sky-600"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        {addon.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatCurrency(addon.price)}
                        {addon.unit === "per_hour" && "/hr"}
                        {addon.unit === "per_person" && "/person"}
                      </p>
                    </div>
                    {sel?.selected && addon.unit === "per_hour" && (
                      <input
                        type="number"
                        min={1}
                        value={sel.hours}
                        onChange={(e) =>
                          setSelectedAddOns((prev) => ({
                            ...prev,
                            [addon.id]: {
                              ...prev[addon.id],
                              hours: Number(e.target.value),
                            },
                          }))
                        }
                        className="w-16 rounded border border-slate-300 px-2 py-1 text-sm"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      <Card title="Cost Breakdown" description="Automated cost computation">
        <div className="mb-4 rounded-lg bg-sky-50 p-4">
          <p className="text-sm text-sky-700">Formula</p>
          <p className="mt-1 font-mono text-xs text-sky-600">
            Total = (Base × Passengers) + Pickup + Extras + Add-ons + Vehicle + Tax
          </p>
        </div>

        <div className="space-y-3">
          {breakdown.lineItems.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{item.label}</span>
              <span className="font-medium text-slate-900">
                {formatCurrency(item.amount)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-slate-200 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-slate-900">
              Total Cost
            </span>
            <span className="text-2xl font-bold text-sky-600">
              {formatCurrency(breakdown.totalCost)}
            </span>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">
            Example: ({formatCurrency(tour.basePricePerPerson)} × {passengers}) +{" "}
            {formatCurrency(pickupCost)} pickup
            {breakdown.addOnsCost > 0 &&
              ` + ${formatCurrency(breakdown.addOnsCost)} add-ons`}
            {breakdown.vehicleRentalCost > 0 &&
              ` + ${formatCurrency(breakdown.vehicleRentalCost)} vehicle`}
          </p>
        </div>
      </Card>
    </div>
  );
}
