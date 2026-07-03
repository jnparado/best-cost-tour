import { getAllBookings } from "@/lib/db/queries";
import { PageHeader } from "@/components/admin/page-header";
import { BookingsTable } from "@/components/admin/bookings-table";
import { NewBookingForm } from "@/components/admin/new-booking-form";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const statuses = [
  { name: "Pending", color: "bg-amber-400", desc: "Awaiting confirmation" },
  { name: "Confirmed", color: "bg-blue-400", desc: "Tour confirmed, payment pending" },
  { name: "Paid", color: "bg-emerald-400", desc: "Payment received" },
  { name: "Cancelled", color: "bg-red-400", desc: "Booking cancelled" },
  { name: "Completed", color: "bg-slate-400", desc: "Tour finished" },
];

export default function BookingsPage() {
  const bookings = getAllBookings();

  return (
    <>
      <PageHeader
        title="Bookings"
        description="View and manage all customer tour bookings — stored in SQLite"
      />

      <NewBookingForm />

      <Card title="Status Legend" className="mb-6">
        <div className="flex flex-wrap gap-4">
          {statuses.map((s) => (
            <div key={s.name} className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${s.color}`} />
              <div>
                <span className="text-sm font-medium text-slate-900">
                  {s.name}
                </span>
                <span className="ml-2 text-xs text-slate-500">{s.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <BookingsTable bookings={bookings} />
    </>
  );
}
