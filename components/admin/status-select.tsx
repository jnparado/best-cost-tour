"use client";

import { useTransition } from "react";
import { updateBookingStatus } from "@/lib/db/actions";
import type { BookingStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const statuses: BookingStatus[] = [
  "Pending",
  "Confirmed",
  "Paid",
  "Cancelled",
  "Completed",
];

const statusStyles: Record<BookingStatus, string> = {
  Pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Confirmed: "bg-blue-50 text-blue-700 ring-blue-600/20",
  Paid: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Cancelled: "bg-red-50 text-red-700 ring-red-600/20",
  Completed: "bg-slate-100 text-slate-700 ring-slate-600/20",
};

export function StatusSelect({
  bookingId,
  status,
}: {
  bookingId: string;
  status: BookingStatus;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value;
        startTransition(async () => {
          await updateBookingStatus(bookingId, next);
        });
      }}
      className={cn(
        "cursor-pointer appearance-none rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset focus:outline-none",
        statusStyles[status],
        pending && "opacity-50"
      )}
    >
      {statuses.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
