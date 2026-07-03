import { addOns } from "@/lib/data/addons";
import { formatCurrency } from "@/lib/calculations/booking-cost";
import { PageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";

function unitLabel(unit: string): string {
  switch (unit) {
    case "per_hour":
      return "/hour";
    case "per_person":
      return "/person";
    default:
      return " flat";
  }
}

export default function AddOnsPage() {
  return (
    <>
      <PageHeader
        title="Add-On Pricing"
        description="Manage extras that can be added to any tour booking"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {addOns.map((addon) => (
          <Card key={addon.id}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">{addon.name}</h3>
                <p className="mt-1 text-xs text-slate-500">{addon.description}</p>
              </div>
              <span className="shrink-0 rounded-lg bg-sky-50 px-3 py-1 text-sm font-bold text-sky-700">
                +{formatCurrency(addon.price)}
                {unitLabel(addon.unit)}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {addon.id}
              </span>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 capitalize">
                {addon.unit.replace("_", " ")}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <Card title="Pricing Examples" className="mt-8">
        <div className="space-y-4 text-sm">
          <div className="flex justify-between rounded-lg bg-slate-50 p-4">
            <span className="text-slate-600">Extra stop added to LA Tour</span>
            <span className="font-semibold text-slate-900">+{formatCurrency(40)}</span>
          </div>
          <div className="flex justify-between rounded-lg bg-slate-50 p-4">
            <span className="text-slate-600">2 hours overtime on Wine Tour</span>
            <span className="font-semibold text-slate-900">+{formatCurrency(150)}</span>
          </div>
          <div className="flex justify-between rounded-lg bg-slate-50 p-4">
            <span className="text-slate-600">
              Food package for 6 guests on Coastal Tour
            </span>
            <span className="font-semibold text-slate-900">+{formatCurrency(330)}</span>
          </div>
        </div>
      </Card>
    </>
  );
}
