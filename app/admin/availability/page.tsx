import { getAvailabilityStatus } from "@/lib/data/availability";
import { getTourAvailability, getGuideSchedules } from "@/lib/db/queries";
import { getTourById } from "@/lib/data/tours";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const availabilityColors: Record<string, string> = {
  Available: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Limited: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Unavailable: "bg-red-50 text-red-700 ring-red-600/20",
};

export const dynamic = "force-dynamic";

export default function AvailabilityPage() {
  const tourAvailability = getTourAvailability();
  const guideSchedules = getGuideSchedules();

  return (
    <>
      <PageHeader
        title="Availability Management"
        description="Control tour dates, vehicle availability, and guide schedules"
      />

      <Card title="Tour Date Availability" className="mb-8 overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-3 font-medium text-slate-500">Tour</th>
                <th className="px-6 py-3 font-medium text-slate-500">Date</th>
                <th className="px-6 py-3 font-medium text-slate-500">Capacity</th>
                <th className="px-6 py-3 font-medium text-slate-500">Booked</th>
                <th className="px-6 py-3 font-medium text-slate-500">Vehicle</th>
                <th className="px-6 py-3 font-medium text-slate-500">Guide</th>
                <th className="px-6 py-3 font-medium text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tourAvailability.map((entry, i) => {
                const tour = getTourById(entry.tourId);
                const status = getAvailabilityStatus(entry);
                return (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {tour?.name ?? entry.tourId}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {formatDate(entry.date)}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {entry.maxCapacity}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-sky-500"
                            style={{
                              width: `${(entry.bookedCount / entry.maxCapacity) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">
                          {entry.bookedCount}/{entry.maxCapacity}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {entry.vehicleAvailable ? (
                        <span className="text-emerald-600">✓</span>
                      ) : (
                        <span className="text-red-500">✕</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {entry.guideAvailable ? (
                        <span className="text-emerald-600">✓</span>
                      ) : (
                        <span className="text-red-500">✕</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${availabilityColors[status]}`}
                      >
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Guide Schedules" className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-3 font-medium text-slate-500">Guide</th>
                <th className="px-6 py-3 font-medium text-slate-500">Date</th>
                <th className="px-6 py-3 font-medium text-slate-500">
                  Assigned Tour
                </th>
                <th className="px-6 py-3 font-medium text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {guideSchedules.map((guide, i) => {
                const tour = guide.assignedTourId
                  ? getTourById(guide.assignedTourId)
                  : null;
                return (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {guide.guideName}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {formatDate(guide.date)}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {tour?.name ?? "—"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        status={guide.available ? "Confirmed" : "Cancelled"}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
