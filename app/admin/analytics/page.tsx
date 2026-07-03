import { getAllBookings } from "@/lib/db/queries";
import { getTourById } from "@/lib/data/tours";
import {
  getAnalyticsSummary,
  getBookingRevenue,
  calculateProfit,
} from "@/lib/calculations/profit";
import { formatCurrency } from "@/lib/calculations/booking-cost";
import { formatDate, formatPercent } from "@/lib/utils";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default function AnalyticsPage() {
  const bookings = getAllBookings();
  const analytics = getAnalyticsSummary(bookings);
  const activeBookings = bookings.filter((b) => b.status !== "Cancelled");

  return (
    <>
      <PageHeader
        title="Revenue & Profit"
        description="Track booking revenue, operating costs, and profit margins"
      />

      <div className="mb-4 rounded-lg bg-sky-50 p-4">
        <p className="text-sm font-medium text-sky-800">Profit Formula</p>
        <p className="mt-1 font-mono text-sm text-sky-700">
          Profit = Booking Revenue − Operating Cost
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(analytics.totalRevenue)}
          subtext="Customer payments"
          trend="up"
        />
        <StatCard
          label="Operating Costs"
          value={formatCurrency(analytics.totalOperatingCost)}
          subtext="Fuel, labor, vehicle"
        />
        <StatCard
          label="Net Profit"
          value={formatCurrency(analytics.totalProfit)}
          subtext={`${formatPercent(analytics.avgMargin)} margin`}
          trend={analytics.totalProfit > 0 ? "up" : "down"}
        />
        <StatCard
          label="Avg Revenue/Booking"
          value={formatCurrency(
            analytics.activeBookings > 0
              ? analytics.totalRevenue / analytics.activeBookings
              : 0
          )}
          subtext={`${analytics.activeBookings} bookings`}
        />
      </div>

      <Card title="Per-Booking Profit Analysis" className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-3 font-medium text-slate-500">ID</th>
                <th className="px-6 py-3 font-medium text-slate-500">Customer</th>
                <th className="px-6 py-3 font-medium text-slate-500">Tour</th>
                <th className="px-6 py-3 font-medium text-slate-500">Date</th>
                <th className="px-6 py-3 font-medium text-slate-500">Revenue</th>
                <th className="px-6 py-3 font-medium text-slate-500">Expenses</th>
                <th className="px-6 py-3 font-medium text-slate-500">Profit</th>
                <th className="px-6 py-3 font-medium text-slate-500">Margin</th>
                <th className="px-6 py-3 font-medium text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeBookings.map((booking) => {
                const tour = getTourById(booking.tourId);
                const revenue = getBookingRevenue(booking);
                const profitResult = calculateProfit(
                  revenue,
                  booking.operatingCost
                );

                return (
                  <tr key={booking.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono text-xs text-sky-600">
                      {booking.id}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {booking.customer}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {tour?.name}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {formatDate(booking.date)}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {formatCurrency(revenue)}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {formatCurrency(booking.operatingCost)}
                    </td>
                    <td
                      className={`px-6 py-4 font-semibold ${profitResult.profit >= 0 ? "text-emerald-600" : "text-red-600"}`}
                    >
                      {formatCurrency(profitResult.profit)}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {formatPercent(profitResult.profitMargin)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={booking.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Example Calculation" className="mt-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-4 text-center">
            <p className="text-xs text-slate-500">Customer Paid</p>
            <p className="mt-1 text-xl font-bold text-slate-900">$800</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4 text-center">
            <p className="text-xs text-slate-500">Expenses</p>
            <p className="mt-1 text-xl font-bold text-slate-900">$450</p>
          </div>
          <div className="rounded-lg bg-emerald-50 p-4 text-center">
            <p className="text-xs text-emerald-600">Profit</p>
            <p className="mt-1 text-xl font-bold text-emerald-700">$350</p>
          </div>
        </div>
      </Card>
    </>
  );
}
