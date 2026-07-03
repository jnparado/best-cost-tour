import { tours } from "@/lib/data/tours";
import { getVehicleForGroupSize } from "@/lib/data/vehicles";
import { calculateBookingCost } from "@/lib/calculations/booking-cost";
import { calculateRouteCost } from "@/lib/calculations/route-cost";
import type { BookingAddOn, Tour, Vehicle } from "@/lib/types";

export interface ParsedTripRequest {
  days: number;
  travelers: number;
  wantsHotel: boolean;
  interests: string[];
  matchedTourIds: string[];
}

export interface PlannedDay {
  day: number;
  tour: Tour;
  addOns: BookingAddOn[];
  addOnLabels: string[];
  routeMiles: number;
  dayCost: number;
  hotelSuggestion?: HotelSuggestion;
}

export interface HotelSuggestion {
  name: string;
  area: string;
  pricePerNight: number;
}

export interface TripPlan {
  parsed: ParsedTripRequest;
  days: PlannedDay[];
  vehicle: Vehicle;
  totalRouteMiles: number;
  transportCost: number;
  toursCost: number;
  hotelCost: number;
  totalEstimate: number;
  quoteId: string;
}

const hotels: HotelSuggestion[] = [
  { name: "The Shoreline Inn", area: "Santa Monica", pricePerNight: 180 },
  { name: "Vineyard Grand Hotel", area: "Santa Barbara", pricePerNight: 220 },
  { name: "Pacific View Resort", area: "Malibu", pricePerNight: 260 },
  { name: "Hollywood Roosevelt-Style Stay", area: "Hollywood", pricePerNight: 195 },
  { name: "Anaheim Parkside Suites", area: "Anaheim", pricePerNight: 165 },
];

// Keyword → tour catalog mapping used to interpret the free-text request.
const interestRules: { keywords: string[]; tourId: string; label: string }[] = [
  { keywords: ["wine", "winery", "vineyard", "tasting"], tourId: "T002", label: "Wine country" },
  { keywords: ["coast", "coastal", "beach", "ocean", "pch", "highway"], tourId: "T003", label: "Coastal scenery" },
  { keywords: ["disney", "disneyland", "theme park", "kids", "family"], tourId: "T004", label: "Theme parks" },
  { keywords: ["night", "nightlife", "lights", "observatory", "evening"], tourId: "T005", label: "Nightlife" },
  { keywords: ["hollywood", "la ", "los angeles", "city", "downtown", "landmark"], tourId: "T001", label: "City sights" },
];

const hotelByTour: Record<string, HotelSuggestion> = {
  T001: hotels[3],
  T002: hotels[1],
  T003: hotels[2],
  T004: hotels[4],
  T005: hotels[3],
};

// Approximate round-trip mileage per tour, used for transport cost.
const milesByTour: Record<string, number> = {
  T001: 45,
  T002: 140,
  T003: 120,
  T004: 60,
  T005: 35,
};

const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
};

function parseNumber(match: string): number {
  const n = Number(match);
  if (!Number.isNaN(n)) return n;
  return NUMBER_WORDS[match.toLowerCase()] ?? 1;
}

export function parseTripRequest(text: string): ParsedTripRequest {
  const lower = ` ${text.toLowerCase()} `;

  const dayMatch = lower.match(/(\d+|one|two|three|four|five|six|seven)[\s-]*(day|night)/);
  const days = Math.min(7, Math.max(1, dayMatch ? parseNumber(dayMatch[1]) : 1));

  const travelerMatch = lower.match(
    /(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*(people|persons?|guests?|travelers?|passengers?|adults?|of us|pax)/
  );
  let travelers = travelerMatch ? parseNumber(travelerMatch[1]) : 2;
  if (/couple|honeymoon|anniversary/.test(lower)) travelers = 2;
  if (/family/.test(lower) && !travelerMatch) travelers = 4;
  travelers = Math.min(40, Math.max(1, travelers));

  const wantsHotel = /hotel|stay|accommodation|lodging|overnight|resort/.test(lower);

  const interests: string[] = [];
  const matchedTourIds: string[] = [];
  for (const rule of interestRules) {
    if (rule.keywords.some((k) => lower.includes(k))) {
      interests.push(rule.label);
      matchedTourIds.push(rule.tourId);
    }
  }

  return { days, travelers, wantsHotel, interests, matchedTourIds };
}

// Default tour order when the request doesn't name enough interests to fill every day.
const fallbackOrder = ["T003", "T001", "T002", "T005", "T004"];

export function generateTripPlan(text: string): TripPlan {
  const parsed = parseTripRequest(text);
  const vehicle = getVehicleForGroupSize(parsed.travelers);

  const tourIds: string[] = [...parsed.matchedTourIds];
  for (const id of fallbackOrder) {
    if (tourIds.length >= parsed.days) break;
    if (!tourIds.includes(id)) tourIds.push(id);
  }

  const days: PlannedDay[] = [];
  let toursCost = 0;
  let hotelCost = 0;
  let totalRouteMiles = 0;

  for (let i = 0; i < parsed.days; i++) {
    const tourId = tourIds[i % tourIds.length];
    const tour = tours.find((t) => t.id === tourId)!;

    const dayAddOns: BookingAddOn[] = [];
    const addOnLabels: string[] = [];

    if (tourId === "T002") {
      dayAddOns.push({ addOnId: "A003", quantity: 1 });
      addOnLabels.push("Wine Tasting");
    }
    if (parsed.wantsHotel) {
      dayAddOns.push({ addOnId: "A002", quantity: 1 });
      addOnLabels.push("Hotel Dropoff");
    }
    if (parsed.travelers >= 6) {
      dayAddOns.push({ addOnId: "A005", quantity: parsed.travelers });
      addOnLabels.push("Food Package");
    }

    const breakdown = calculateBookingCost({
      tourId,
      passengers: parsed.travelers,
      pickupCost: 50,
      addOns: dayAddOns,
    });

    const routeMiles = milesByTour[tourId] ?? 50;
    totalRouteMiles += routeMiles;
    toursCost += breakdown.totalCost;

    const hotelSuggestion = parsed.wantsHotel ? hotelByTour[tourId] : undefined;
    if (hotelSuggestion && i < parsed.days - 1) {
      // Rooms sleep 2; no hotel night after the final day.
      hotelCost += hotelSuggestion.pricePerNight * Math.ceil(parsed.travelers / 2);
    }

    days.push({
      day: i + 1,
      tour,
      addOns: dayAddOns,
      addOnLabels,
      routeMiles,
      dayCost: breakdown.totalCost,
      hotelSuggestion: i < parsed.days - 1 ? hotelSuggestion : undefined,
    });
  }

  const routeResult = calculateRouteCost([
    { id: "trip", label: "Full trip", distanceMiles: totalRouteMiles },
  ]);

  return {
    parsed,
    days,
    vehicle,
    totalRouteMiles,
    transportCost: routeResult.totalTravelCost,
    toursCost,
    hotelCost,
    totalEstimate: toursCost + hotelCost,
    quoteId: `Q${String(Math.floor(1000 + Math.random() * 9000))}`,
  };
}

export const examplePrompts = [
  "I want a 3-day California trip with hotel and wine tour",
  "2 day coastal trip for 6 people with food",
  "Family Disneyland weekend for 5 with hotel stay",
  "One day Hollywood night tour for a couple",
];
