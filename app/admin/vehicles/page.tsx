import { vehicles } from "@/lib/data/vehicles";
import { formatCurrency } from "@/lib/calculations/booking-cost";
import { PageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";

export default function VehiclesPage() {
  return (
    <>
      <PageHeader
        title="Vehicle Assignment"
        description="Choose vehicle based on group size — impacts pricing and capacity"
      />

      <div className="mb-8 grid gap-6 md:grid-cols-3">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.type} className="relative overflow-hidden">
            <div className="absolute right-0 top-0 rounded-bl-xl bg-sky-100 px-4 py-1 text-xs font-bold text-sky-700">
              {vehicle.type}
            </div>
            <div className="mb-4 text-4xl">
              {vehicle.type === "Sedan" && "🚗"}
              {vehicle.type === "Van" && "🚐"}
              {vehicle.type === "Bus" && "🚌"}
            </div>
            <h3 className="text-lg font-bold text-slate-900">{vehicle.type}</h3>
            <p className="mt-1 text-sm text-slate-500">{vehicle.description}</p>

            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Guest Range</span>
                <span className="font-medium text-slate-900">
                  {vehicle.minGuests}–{vehicle.maxGuests}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Rental Cost</span>
                <span className="font-medium text-slate-900">
                  {vehicle.rentalCost === 0
                    ? "Included"
                    : formatCurrency(vehicle.rentalCost)}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card title="Assignment Rules">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-3 font-medium text-slate-500">Guests</th>
                <th className="pb-3 font-medium text-slate-500">Vehicle</th>
                <th className="pb-3 font-medium text-slate-500">Rental Fee</th>
                <th className="pb-3 font-medium text-slate-500">Impact on Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 text-slate-700">1–4</td>
                <td className="py-3 font-medium text-slate-900">Sedan</td>
                <td className="py-3 text-slate-700">$0 (included)</td>
                <td className="py-3 text-slate-700">No additional charge</td>
              </tr>
              <tr>
                <td className="py-3 text-slate-700">5–12</td>
                <td className="py-3 font-medium text-slate-900">Van</td>
                <td className="py-3 text-slate-700">+$200</td>
                <td className="py-3 text-slate-700">Added to booking total</td>
              </tr>
              <tr>
                <td className="py-3 text-slate-700">13–40</td>
                <td className="py-3 font-medium text-slate-900">Bus</td>
                <td className="py-3 text-slate-700">+$700</td>
                <td className="py-3 text-slate-700">Added to booking total</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
