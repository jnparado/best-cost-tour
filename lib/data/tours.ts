import type { Tour } from "@/lib/types";

export const tours: Tour[] = [
  {
    id: "T001",
    name: "LA City Tour",
    basePricePerPerson: 120,
    duration: "6 hours",
    description: "Explore Hollywood, Santa Monica Pier, and downtown LA landmarks.",
  },
  {
    id: "T002",
    name: "Wine Country Tour",
    basePricePerPerson: 150,
    duration: "8 hours",
    description: "Visit premium wineries in Temecula and Santa Barbara.",
  },
  {
    id: "T003",
    name: "Coastal Highway Tour",
    basePricePerPerson: 180,
    duration: "10 hours",
    description: "Scenic drive along Pacific Coast Highway with photo stops.",
  },
  {
    id: "T004",
    name: "Disneyland Express",
    basePricePerPerson: 95,
    duration: "12 hours",
    description: "Round-trip transport and park guidance for Disneyland.",
  },
  {
    id: "T005",
    name: "Hollywood Night Tour",
    basePricePerPerson: 110,
    duration: "5 hours",
    description: "Evening tour of Hollywood Boulevard, Griffith Observatory, and city lights.",
  },
];

export function getTourById(id: string): Tour | undefined {
  return tours.find((t) => t.id === id);
}
