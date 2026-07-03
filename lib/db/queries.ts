import { getDb } from "@/lib/db";
import type {
  Booking,
  BookingAddOn,
  BookingStatus,
  GuideSchedule,
  TourAvailability,
  VehicleType,
} from "@/lib/types";

interface BookingRow {
  id: string;
  customer_name: string;
  email: string;
  phone: string;
  booking_date: string;
  tour_id: string;
  guest_count: number;
  pickup_location: string;
  pickup_cost: number;
  tax_rate: number;
  total_price: number;
  status: string;
  vehicle_name: string;
  notes: string | null;
}

interface CostRow {
  booking_id: string;
  fuel_cost: number;
  driver_fee: number;
  mileage_cost: number;
  overtime_fee: number;
}

export interface BookingCosts {
  fuelCost: number;
  driverFee: number;
  mileageCost: number;
  overtimeFee: number;
  total: number;
}

function toBooking(row: BookingRow, addOns: BookingAddOn[], operatingCost: number): Booking {
  return {
    id: row.id,
    customer: row.customer_name,
    email: row.email,
    tourId: row.tour_id,
    date: row.booking_date,
    passengers: row.guest_count,
    pickupAddress: row.pickup_location,
    pickupCost: row.pickup_cost,
    addOns,
    taxRate: row.tax_rate,
    status: row.status as BookingStatus,
    vehicleType: row.vehicle_name as VehicleType,
    operatingCost,
    notes: row.notes ?? undefined,
  };
}

export function getAllBookings(): Booking[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM bookings ORDER BY booking_date")
    .all() as BookingRow[];

  const addOnRows = db
    .prepare("SELECT booking_id, add_on_id, quantity, hours FROM booking_add_ons")
    .all() as { booking_id: string; add_on_id: string; quantity: number; hours: number | null }[];

  const costRows = db.prepare("SELECT * FROM costs").all() as CostRow[];
  const costByBooking = new Map(
    costRows.map((c) => [
      c.booking_id,
      c.fuel_cost + c.driver_fee + c.mileage_cost + c.overtime_fee,
    ])
  );

  const addOnsByBooking = new Map<string, BookingAddOn[]>();
  for (const r of addOnRows) {
    const list = addOnsByBooking.get(r.booking_id) ?? [];
    list.push({ addOnId: r.add_on_id, quantity: r.quantity, hours: r.hours ?? undefined });
    addOnsByBooking.set(r.booking_id, list);
  }

  return rows.map((row) =>
    toBooking(row, addOnsByBooking.get(row.id) ?? [], costByBooking.get(row.id) ?? 0)
  );
}

export function getBookingCosts(bookingId: string): BookingCosts | null {
  const row = getDb()
    .prepare("SELECT * FROM costs WHERE booking_id = ?")
    .get(bookingId) as CostRow | undefined;
  if (!row) return null;
  return {
    fuelCost: row.fuel_cost,
    driverFee: row.driver_fee,
    mileageCost: row.mileage_cost,
    overtimeFee: row.overtime_fee,
    total: row.fuel_cost + row.driver_fee + row.mileage_cost + row.overtime_fee,
  };
}

export function getTourAvailability(): TourAvailability[] {
  const rows = getDb()
    .prepare("SELECT * FROM tour_availability ORDER BY date")
    .all() as {
    tour_id: string;
    date: string;
    max_capacity: number;
    booked_count: number;
    vehicle_available: number;
    guide_available: number;
  }[];

  return rows.map((r) => ({
    tourId: r.tour_id,
    date: r.date,
    maxCapacity: r.max_capacity,
    bookedCount: r.booked_count,
    vehicleAvailable: r.vehicle_available === 1,
    guideAvailable: r.guide_available === 1,
  }));
}

export function getGuideSchedules(): GuideSchedule[] {
  const rows = getDb()
    .prepare("SELECT * FROM guide_schedules ORDER BY date")
    .all() as {
    guide_id: string;
    guide_name: string;
    date: string;
    available: number;
    assigned_tour_id: string | null;
  }[];

  return rows.map((r) => ({
    guideId: r.guide_id,
    guideName: r.guide_name,
    date: r.date,
    available: r.available === 1,
    assignedTourId: r.assigned_tour_id ?? undefined,
  }));
}

export function getNextBookingId(): string {
  const row = getDb()
    .prepare("SELECT id FROM bookings ORDER BY CAST(SUBSTR(id, 2) AS INTEGER) DESC LIMIT 1")
    .get() as { id: string } | undefined;
  const lastNum = row ? Number(row.id.slice(1)) : 0;
  return `B${String(lastNum + 1).padStart(3, "0")}`;
}
