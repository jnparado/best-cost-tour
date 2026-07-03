import type { AvailabilityStatus, GuideSchedule, TourAvailability } from "@/lib/types";

export const tourAvailability: TourAvailability[] = [
  { tourId: "T001", date: "2026-07-10", maxCapacity: 12, bookedCount: 4, vehicleAvailable: true, guideAvailable: true },
  { tourId: "T001", date: "2026-07-11", maxCapacity: 12, bookedCount: 12, vehicleAvailable: true, guideAvailable: true },
  { tourId: "T002", date: "2026-07-12", maxCapacity: 8, bookedCount: 6, vehicleAvailable: true, guideAvailable: true },
  { tourId: "T002", date: "2026-07-13", maxCapacity: 8, bookedCount: 8, vehicleAvailable: false, guideAvailable: true },
  { tourId: "T003", date: "2026-07-15", maxCapacity: 4, bookedCount: 2, vehicleAvailable: true, guideAvailable: true },
  { tourId: "T004", date: "2026-07-18", maxCapacity: 12, bookedCount: 8, vehicleAvailable: true, guideAvailable: false },
  { tourId: "T005", date: "2026-07-20", maxCapacity: 40, bookedCount: 15, vehicleAvailable: true, guideAvailable: true },
  { tourId: "T001", date: "2026-07-22", maxCapacity: 12, bookedCount: 0, vehicleAvailable: true, guideAvailable: true },
  { tourId: "T003", date: "2026-07-25", maxCapacity: 4, bookedCount: 4, vehicleAvailable: true, guideAvailable: true },
];

export const guideSchedules: GuideSchedule[] = [
  { guideId: "G001", guideName: "Maria Santos", date: "2026-07-10", available: true, assignedTourId: "T001" },
  { guideId: "G002", guideName: "James Wilson", date: "2026-07-10", available: true },
  { guideId: "G003", guideName: "Anna Lee", date: "2026-07-12", available: true, assignedTourId: "T002" },
  { guideId: "G001", guideName: "Maria Santos", date: "2026-07-12", available: false },
  { guideId: "G004", guideName: "Carlos Rivera", date: "2026-07-15", available: true, assignedTourId: "T003" },
  { guideId: "G002", guideName: "James Wilson", date: "2026-07-18", available: false },
  { guideId: "G005", guideName: "Sophie Turner", date: "2026-07-20", available: true, assignedTourId: "T005" },
];

export function getAvailabilityStatus(entry: TourAvailability): AvailabilityStatus {
  if (!entry.vehicleAvailable || !entry.guideAvailable) return "Unavailable";
  if (entry.bookedCount >= entry.maxCapacity) return "Unavailable";
  if (entry.bookedCount >= entry.maxCapacity * 0.75) return "Limited";
  return "Available";
}
