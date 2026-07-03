import { getTourById } from "@/lib/data/tours";
import { formatCurrency } from "@/lib/calculations/booking-cost";
import { getBookingRevenue } from "@/lib/calculations/profit";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { StatusSelect } from "@/components/admin/status-select";
import type { Booking } from "@/lib/types";

export function BookingsTable({ bookings }: { bookings: Booking[] }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-3 font-medium text-slate-500">Booking ID</th>
              <th className="px-6 py-3 font-medium text-slate-500">Customer</th>
              <th className="px-6 py-3 font-medium text-slate-500">Tour</th>
              <th className="px-6 py-3 font-medium text-slate-500">Date</th>
              <th className="px-6 py-3 font-medium text-slate-500">Guests</th>
              <th className="px-6 py-3 font-medium text-slate-500">Vehicle</th>
              <th className="px-6 py-3 font-medium text-slate-500">Total</th>
              <th className="px-6 py-3 font-medium text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bookings.map((booking) => {
              const tour = getTourById(booking.tourId);
              return (
                <tr key={booking.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono text-xs font-medium text-sky-600">
                    {booking.id}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">
                      {booking.customer}
                    </p>
                    <p className="text-xs text-slate-500">{booking.email}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {tour?.name ?? booking.tourId}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {formatDate(booking.date)}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {booking.passengers}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {booking.vehicleType}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {formatCurrency(getBookingRevenue(booking))}
                  </td>
                  <td className="px-6 py-4">
                    <StatusSelect bookingId={booking.id} status={booking.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
