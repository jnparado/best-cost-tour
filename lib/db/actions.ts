"use server";

import { revalidatePath } from "next/cache";
import { getDb, splitOperatingCost } from "@/lib/db";
import { getNextBookingId } from "@/lib/db/queries";
import { calculateBookingCost } from "@/lib/calculations/booking-cost";
import { getVehicleForGroupSize } from "@/lib/data/vehicles";
import type { BookingStatus } from "@/lib/types";

const VALID_STATUSES: BookingStatus[] = [
  "Pending",
  "Confirmed",
  "Paid",
  "Cancelled",
  "Completed",
];

function revalidateBookingPages() {
  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/analytics");
}

export async function updateBookingStatus(bookingId: string, status: string) {
  if (!VALID_STATUSES.includes(status as BookingStatus)) {
    return { ok: false, error: "Invalid status" };
  }

  const result = getDb()
    .prepare("UPDATE bookings SET status = ? WHERE id = ?")
    .run(status, bookingId);

  if (result.changes === 0) {
    return { ok: false, error: "Booking not found" };
  }

  revalidateBookingPages();
  return { ok: true };
}

export interface CreateBookingInput {
  customerName: string;
  email: string;
  phone: string;
  bookingDate: string;
  tourId: string;
  guestCount: number;
  pickupLocation: string;
  pickupCost: number;
  addOns: { addOnId: string; quantity: number; hours?: number }[];
  notes?: string;
}

export async function createBooking(input: CreateBookingInput) {
  if (!input.customerName.trim()) return { ok: false, error: "Customer name is required" };
  if (!input.bookingDate) return { ok: false, error: "Booking date is required" };
  if (input.guestCount < 1 || input.guestCount > 40) {
    return { ok: false, error: "Guest count must be between 1 and 40" };
  }

  const db = getDb();
  const tour = db.prepare("SELECT id FROM tours WHERE id = ?").get(input.tourId);
  if (!tour) return { ok: false, error: "Unknown tour" };

  const breakdown = calculateBookingCost({
    tourId: input.tourId,
    passengers: input.guestCount,
    pickupCost: input.pickupCost,
    addOns: input.addOns,
  });
  const vehicle = getVehicleForGroupSize(input.guestCount);
  const id = getNextBookingId();

  // Estimate operating cost at ~55% of pre-tax revenue until actuals are recorded.
  const estimatedOperatingCost = Math.round(breakdown.subtotal * 0.55 * 100) / 100;
  const split = splitOperatingCost(estimatedOperatingCost);

  db.transaction(() => {
    db.prepare(
      `INSERT INTO bookings
       (id, customer_name, email, phone, booking_date, tour_id, guest_count,
        pickup_location, pickup_cost, tax_rate, total_price, status, vehicle_name, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?)`
    ).run(
      id,
      input.customerName.trim(),
      input.email.trim(),
      input.phone.trim(),
      input.bookingDate,
      input.tourId,
      input.guestCount,
      input.pickupLocation.trim(),
      input.pickupCost,
      0.0875,
      Math.round(breakdown.totalCost * 100) / 100,
      vehicle.type,
      input.notes?.trim() || null
    );

    const insertAddOn = db.prepare(
      `INSERT INTO booking_add_ons (booking_id, add_on_id, quantity, hours) VALUES (?, ?, ?, ?)`
    );
    for (const item of input.addOns) {
      insertAddOn.run(id, item.addOnId, item.quantity, item.hours ?? null);
    }

    db.prepare(
      `INSERT INTO costs (booking_id, fuel_cost, driver_fee, mileage_cost, overtime_fee)
       VALUES (?, ?, ?, ?, ?)`
    ).run(id, split.fuel, split.driver, split.mileage, split.overtime);
  })();

  revalidateBookingPages();
  return { ok: true, bookingId: id, totalPrice: breakdown.totalCost };
}
