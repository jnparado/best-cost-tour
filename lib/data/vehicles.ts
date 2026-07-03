import type { Vehicle, VehicleType } from "@/lib/types";

export const vehicles: Vehicle[] = [
  {
    type: "Sedan",
    minGuests: 1,
    maxGuests: 4,
    rentalCost: 0,
    description: "Included for groups of 1–4 guests.",
  },
  {
    type: "Van",
    minGuests: 5,
    maxGuests: 12,
    rentalCost: 200,
    description: "Mercedes Sprinter van for medium groups.",
  },
  {
    type: "Bus",
    minGuests: 13,
    maxGuests: 40,
    rentalCost: 700,
    description: "Full-size coach for large groups and events.",
  },
];

export function getVehicleForGroupSize(passengers: number): Vehicle {
  const match = vehicles.find(
    (v) => passengers >= v.minGuests && passengers <= v.maxGuests
  );
  return match ?? vehicles[vehicles.length - 1];
}

export function getVehicleByType(type: VehicleType): Vehicle | undefined {
  return vehicles.find((v) => v.type === type);
}
