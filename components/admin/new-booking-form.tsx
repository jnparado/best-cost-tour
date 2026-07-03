"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { tours } from "@/lib/data/tours";
import { addOns } from "@/lib/data/addons";
import { getVehicleForGroupSize } from "@/lib/data/vehicles";
import { calculateBookingCost, formatCurrency } from "@/lib/calculations/booking-cost";
import { createBooking } from "@/lib/db/actions";
import { Card } from "@/components/ui/card";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500";

export function NewBookingForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [tourId, setTourId] = useState(tours[0].id);
  const [guestCount, setGuestCount] = useState(2);
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupCost, setPickupCost] = useState(50);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const addOnSelections = useMemo(
    () =>
      Object.entries(selected)
        .filter(([, v]) => v)
        .map(([id]) => ({ addOnId: id, quantity: 1, hours: 1 })),
    [selected]
  );

  const estimate = useMemo(
    () =>
      calculateBookingCost({
        tourId,
        passengers: guestCount,
        pickupCost,
        addOns: addOnSelections,
      }),
    [tourId, guestCount, pickupCost, addOnSelections]
  );

  const vehicle = getVehicleForGroupSize(guestCount);

  function submit() {
    setMessage(null);
    startTransition(async () => {
      const result = await createBooking({
        customerName,
        email,
        phone,
        bookingDate,
        tourId,
        guestCount,
        pickupLocation,
        pickupCost,
        addOns: addOnSelections,
      });
      if (result.ok) {
        setMessage(`Booking ${result.bookingId} created — ${formatCurrency(result.totalPrice ?? 0)}`);
        setCustomerName("");
        setEmail("");
        setPhone("");
        setBookingDate("");
        setPickupLocation("");
        setSelected({});
        router.refresh();
      } else {
        setMessage(result.error ?? "Failed to create booking");
      }
    });
  }

  if (!open) {
    return (
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
        >
          + New Booking
        </button>
        {message && (
          <p className="text-sm font-medium text-emerald-600">{message}</p>
        )}
      </div>
    );
  }

  return (
    <Card title="New Booking" description="Creates a Pending booking priced by the cost engine" className="mb-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Customer Name *</label>
          <input className={inputClass} value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Jane Doe" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
          <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@email.com" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone</label>
          <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 310 555 0100" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Tour</label>
          <select className={inputClass} value={tourId} onChange={(e) => setTourId(e.target.value)}>
            {tours.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} — {formatCurrency(t.basePricePerPerson)}/person
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Date *</label>
          <input className={inputClass} type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Guests</label>
          <input
            className={inputClass}
            type="number"
            min={1}
            max={40}
            value={guestCount}
            onChange={(e) => setGuestCount(Number(e.target.value))}
          />
        </div>
        <div className="lg:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Pickup Location</label>
          <input className={inputClass} value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} placeholder="123 Sunset Blvd, Los Angeles" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Pickup Cost ($)</label>
          <input
            className={inputClass}
            type="number"
            min={0}
            value={pickupCost}
            onChange={(e) => setPickupCost(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium text-slate-700">Add-Ons</label>
        <div className="flex flex-wrap gap-2">
          {addOns.map((addon) => (
            <button
              key={addon.id}
              type="button"
              onClick={() => setSelected((prev) => ({ ...prev, [addon.id]: !prev[addon.id] }))}
              className={
                selected[addon.id]
                  ? "rounded-full bg-sky-600 px-3 py-1.5 text-xs font-medium text-white"
                  : "rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 hover:border-sky-300"
              }
            >
              {addon.name} +{formatCurrency(addon.price)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-4">
        <div className="text-sm text-slate-600">
          Vehicle: <span className="font-medium text-slate-900">{vehicle.type}</span>
          <span className="mx-2 text-slate-300">|</span>
          Estimated total:{" "}
          <span className="text-lg font-bold text-sky-600">{formatCurrency(estimate.totalCost)}</span>
        </div>
        <div className="flex items-center gap-3">
          {message && <p className="text-sm font-medium text-red-600">{message}</p>}
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={pending || !customerName.trim() || !bookingDate}
            className="rounded-lg bg-sky-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
          >
            {pending ? "Creating…" : "Create Booking"}
          </button>
        </div>
      </div>
    </Card>
  );
}
