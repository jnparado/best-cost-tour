export type BookingStatus =
  | "Pending"
  | "Confirmed"
  | "Paid"
  | "Cancelled"
  | "Completed";

export type VehicleType = "Sedan" | "Van" | "Bus";

export type AvailabilityStatus = "Available" | "Limited" | "Unavailable";

export interface Tour {
  id: string;
  name: string;
  basePricePerPerson: number;
  duration: string;
  description: string;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  unit: "flat" | "per_hour" | "per_person";
  description: string;
}

export interface Vehicle {
  type: VehicleType;
  minGuests: number;
  maxGuests: number;
  rentalCost: number;
  description: string;
}

export interface RouteSegment {
  id: string;
  label: string;
  distanceMiles: number;
}

export interface BookingAddOn {
  addOnId: string;
  quantity: number;
  hours?: number;
}

export interface Booking {
  id: string;
  customer: string;
  email: string;
  tourId: string;
  date: string;
  passengers: number;
  pickupAddress: string;
  pickupCost: number;
  addOns: BookingAddOn[];
  taxRate: number;
  status: BookingStatus;
  vehicleType: VehicleType;
  operatingCost: number;
  notes?: string;
}

export interface TourAvailability {
  tourId: string;
  date: string;
  maxCapacity: number;
  bookedCount: number;
  vehicleAvailable: boolean;
  guideAvailable: boolean;
}

export interface GuideSchedule {
  guideId: string;
  guideName: string;
  date: string;
  available: boolean;
  assignedTourId?: string;
}

export interface CostBreakdown {
  baseTourCost: number;
  pickupCost: number;
  extraPassengerFee: number;
  addOnsCost: number;
  vehicleRentalCost: number;
  taxesAndFees: number;
  subtotal: number;
  totalCost: number;
  lineItems: { label: string; amount: number }[];
}

export interface RouteCostResult {
  segments: { label: string; distanceMiles: number; cost: number }[];
  totalDistanceMiles: number;
  costPerMile: number;
  totalTravelCost: number;
}

export interface ProfitResult {
  bookingRevenue: number;
  operatingCost: number;
  profit: number;
  profitMargin: number;
}
