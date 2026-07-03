"use client";

import { useState } from "react";
import {
  generateTripPlan,
  examplePrompts,
  type TripPlan,
} from "@/lib/ai/planner";
import { formatCurrency } from "@/lib/calculations/booking-cost";
import { Card } from "@/components/ui/card";

export function TripPlanner() {
  const [request, setRequest] = useState("");
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [thinking, setThinking] = useState(false);

  function handleGenerate(text: string) {
    if (!text.trim()) return;
    setThinking(true);
    setPlan(null);
    // Brief delay so the "generating" state is visible.
    setTimeout(() => {
      setPlan(generateTripPlan(text));
      setThinking(false);
    }, 600);
  }

  return (
    <div className="space-y-6">
      <Card
        title="Describe the trip"
        description="Plain-English request — the planner detects days, group size, interests, and hotel needs"
      >
        <div className="flex gap-3">
          <input
            type="text"
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate(request)}
            placeholder='e.g. "I want a 3-day California trip with hotel and wine tour"'
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <button
            onClick={() => handleGenerate(request)}
            disabled={thinking || !request.trim()}
            className="rounded-lg bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
          >
            {thinking ? "Planning…" : "Generate Plan"}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {examplePrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => {
                setRequest(prompt);
                handleGenerate(prompt);
              }}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
            >
              {prompt}
            </button>
          ))}
        </div>
      </Card>

      {thinking && (
        <Card>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
            Building itinerary, matching tours, and computing the quote…
          </div>
        </Card>
      )}

      {plan && (
        <>
          <Card title="What the planner understood">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 ring-1 ring-inset ring-sky-600/20">
                {plan.parsed.days} day{plan.parsed.days > 1 ? "s" : ""}
              </span>
              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 ring-1 ring-inset ring-sky-600/20">
                {plan.parsed.travelers} traveler
                {plan.parsed.travelers > 1 ? "s" : ""}
              </span>
              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 ring-1 ring-inset ring-sky-600/20">
                Vehicle: {plan.vehicle.type}
              </span>
              {plan.parsed.wantsHotel && (
                <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-600/20">
                  Hotel included
                </span>
              )}
              {plan.parsed.interests.map((interest) => (
                <span
                  key={interest}
                  className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                >
                  {interest}
                </span>
              ))}
              {plan.parsed.interests.length === 0 && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  No specific interests — using top-rated tours
                </span>
              )}
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {plan.days.map((day) => (
                <Card key={day.day}>
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-600 text-sm font-bold text-white">
                      {day.day}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {day.tour.name}
                          </h3>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {day.tour.description}
                          </p>
                        </div>
                        <span className="shrink-0 text-lg font-bold text-sky-600">
                          {formatCurrency(day.dayCost)}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-600">
                          ⏱ {day.tour.duration}
                        </span>
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-600">
                          🗺 ~{day.routeMiles} mi route
                        </span>
                        {day.addOnLabels.map((label) => (
                          <span
                            key={label}
                            className="rounded bg-amber-50 px-2 py-0.5 text-amber-700"
                          >
                            + {label}
                          </span>
                        ))}
                      </div>

                      {day.hotelSuggestion && (
                        <div className="mt-3 rounded-lg bg-violet-50 p-3 text-xs">
                          <span className="font-semibold text-violet-800">
                            🏨 Overnight: {day.hotelSuggestion.name}
                          </span>
                          <span className="ml-2 text-violet-600">
                            {day.hotelSuggestion.area} —{" "}
                            {formatCurrency(day.hotelSuggestion.pricePerNight)}
                            /night per room
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-1">
              <Card
                title={`Booking Quote ${plan.quoteId}`}
                description="Auto-generated estimate"
                className="sticky top-8"
              >
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">
                      Tours ({plan.days.length} day
                      {plan.days.length > 1 ? "s" : ""}, incl. add-ons & tax)
                    </span>
                    <span className="font-medium text-slate-900">
                      {formatCurrency(plan.toursCost)}
                    </span>
                  </div>
                  {plan.hotelCost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Hotel nights</span>
                      <span className="font-medium text-slate-900">
                        {formatCurrency(plan.hotelCost)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-600">
                      Est. transport ({plan.totalRouteMiles} mi)
                    </span>
                    <span className="font-medium text-slate-500">
                      {formatCurrency(plan.transportCost)} (internal cost)
                    </span>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">
                      Total Estimate
                    </span>
                    <span className="text-2xl font-bold text-sky-600">
                      {formatCurrency(plan.totalEstimate)}
                    </span>
                  </div>
                  <p className="mt-1 text-right text-xs text-slate-500">
                    ≈{" "}
                    {formatCurrency(plan.totalEstimate / plan.parsed.travelers)}{" "}
                    per traveler
                  </p>
                </div>

                <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                  Transport cost is the operator&apos;s internal expense
                  (fuel, driver, vehicle wear) and is already covered by tour
                  pricing.
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
