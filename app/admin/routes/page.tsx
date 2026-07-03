import { PageHeader } from "@/components/admin/page-header";
import { RouteCalculator } from "@/components/admin/route-calculator";

export default function RoutesPage() {
  return (
    <>
      <PageHeader
        title="Route Cost Calculator"
        description="Calculate transport costs based on distance — fuel, driver labor, and vehicle wear"
      />
      <RouteCalculator />
    </>
  );
}
