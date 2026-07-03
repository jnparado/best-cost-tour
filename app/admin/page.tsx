import { getAllBookings } from "@/lib/db/queries";
import { getAnalyticsSummary } from "@/lib/calculations/profit";
import { formatCurrency } from "@/lib/calculations/booking-cost";
import { formatPercent } from "@/lib/utils";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { BookingsTable } from "@/components/admin/bookings-table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default function AdminDashboard() {
  const bookings = getAllBookings();
  const analytics = getAnalyticsSummary(bookings);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of bookings, revenue, and tour operations"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Bookings"
          value={String(analytics.totalBookings)}
          subtext={`${analytics.activeBookings} active`}
        />
        <StatCard
          label="Total Revenue"
          value={formatCurrency(analytics.totalRevenue)}
          subtext="From active bookings"
          trend="up"
        />
        <StatCard
          label="Total Profit"
          value={formatCurrency(analytics.totalProfit)}
          subtext={`${formatPercent(analytics.avgMargin)} avg margin`}
          trend={analytics.totalProfit > 0 ? "up" : "down"}
        />
        <StatCard
          label="Operating Costs"
          value={formatCurrency(analytics.totalOperatingCost)}
          subtext="Fuel, labor, vehicle wear"
        />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <Card title="Booking Status" className="lg:col-span-1">
          <div className="space-y-3">
            {Object.entries(analytics.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <Badge status={status} />
                <span className="text-sm font-semibold text-slate-900">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Quick Actions"
          description="Common admin tasks"
          className="lg:col-span-2"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                href: "/admin/calculator",
                label: "Calculate Quote",
                desc: "Generate booking cost estimate",
                icon: "🧮",
              },
              {
                href: "/admin/routes",
                label: "Route Planning",
                desc: "Compute travel & transport costs",
                icon: "🗺️",
              },
              {
                href: "/admin/availability",
                label: "Check Availability",
                desc: "Tour dates, vehicles & guides",
                icon: "📅",
              },
              {
                href: "/admin/planner",
                label: "AI Tour Planner",
                desc: "Generate itinerary & quote from text",
                icon: "🤖",
              },
            ].map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="flex items-start gap-3 rounded-lg border border-slate-200 p-4 transition-colors hover:border-sky-300 hover:bg-sky-50"
              >
                <span className="text-xl">{action.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {action.label}
                  </p>
                  <p className="text-xs text-slate-500">{action.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </Card>
      </div>

      <PageHeader title="Recent Bookings" />
      <BookingsTable bookings={bookings} />
    </>
  );
}
