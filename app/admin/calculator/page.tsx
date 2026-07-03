import { PageHeader } from "@/components/admin/page-header";
import { CostCalculator } from "@/components/admin/cost-calculator";

export default function CalculatorPage() {
  return (
    <>
      <PageHeader
        title="Cost Calculator"
        description="Compute total booking cost with base price, pickup, add-ons, vehicle rental, and taxes"
      />
      <CostCalculator />
    </>
  );
}
