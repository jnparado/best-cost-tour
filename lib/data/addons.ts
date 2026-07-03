import type { AddOn } from "@/lib/types";

export const addOns: AddOn[] = [
  {
    id: "A001",
    name: "VIP Pickup",
    price: 60,
    unit: "flat",
    description: "Premium door-to-door pickup with meet-and-greet.",
  },
  {
    id: "A002",
    name: "Hotel Dropoff",
    price: 45,
    unit: "flat",
    description: "Return dropoff at your hotel after the tour.",
  },
  {
    id: "A003",
    name: "Wine Tasting",
    price: 80,
    unit: "flat",
    description: "Curated wine tasting at partner vineyards.",
  },
  {
    id: "A004",
    name: "Extra Stop",
    price: 40,
    unit: "flat",
    description: "Add an additional scenic or cultural stop.",
  },
  {
    id: "A005",
    name: "Food Package",
    price: 55,
    unit: "per_person",
    description: "Gourmet lunch or dinner included per guest.",
  },
  {
    id: "A006",
    name: "Overtime",
    price: 75,
    unit: "per_hour",
    description: "Extended tour time beyond scheduled duration.",
  },
];

export function getAddOnById(id: string): AddOn | undefined {
  return addOns.find((a) => a.id === id);
}
