import { PageHeader } from "@/components/admin/page-header";
import { TripPlanner } from "@/components/admin/trip-planner";

export default function PlannerPage() {
  return (
    <>
      <PageHeader
        title="AI Tour Planner"
        description="Turn a plain-English trip request into an itinerary, route, hotel suggestions, and a booking quote"
      />
      <TripPlanner />
    </>
  );
}
