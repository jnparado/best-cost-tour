import { calculateBookingCost } from "@/lib/calculations/booking-cost";
import type { Booking, ProfitResult } from "@/lib/types";

export function calculateProfit(
  bookingRevenue: number,
  operatingCost: number
): ProfitResult {
  const profit = bookingRevenue - operatingCost;
  const profitMargin =
    bookingRevenue > 0 ? (profit / bookingRevenue) * 100 : 0;

  return { bookingRevenue, operatingCost, profit, profitMargin };
}

export function getBookingRevenue(booking: Booking): number {
  const cost = calculateBookingCost({
    tourId: booking.tourId,
    passengers: booking.passengers,
    pickupCost: booking.pickupCost,
    addOns: booking.addOns,
    taxRate: booking.taxRate,
  });
  return cost.totalCost;
}

export function getAnalyticsSummary(bookings: Booking[]) {
  const activeBookings = bookings.filter((b) => b.status !== "Cancelled");

  const totalRevenue = activeBookings.reduce(
    (sum, b) => sum + getBookingRevenue(b),
    0
  );
  const totalOperatingCost = activeBookings.reduce(
    (sum, b) => sum + b.operatingCost,
    0
  );
  const totalProfit = totalRevenue - totalOperatingCost;
  const avgMargin =
    totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  const byStatus = bookings.reduce(
    (acc, b) => {
      acc[b.status] = (acc[b.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    totalBookings: bookings.length,
    activeBookings: activeBookings.length,
    totalRevenue,
    totalOperatingCost,
    totalProfit,
    avgMargin,
    byStatus,
  };
}
