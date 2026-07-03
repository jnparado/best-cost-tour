import { getAddOnById } from "@/lib/data/addons";
import { getTourById } from "@/lib/data/tours";
import { getVehicleForGroupSize } from "@/lib/data/vehicles";
import type { BookingAddOn, CostBreakdown } from "@/lib/types";

const INCLUDED_PASSENGERS = 4;
const EXTRA_PASSENGER_FEE = 25;

export interface CalculateBookingCostInput {
  tourId: string;
  passengers: number;
  pickupCost: number;
  addOns: BookingAddOn[];
  taxRate?: number;
}

function calculateAddOnCost(addOns: BookingAddOn[], passengers: number): number {
  return addOns.reduce((total, item) => {
    const addOn = getAddOnById(item.addOnId);
    if (!addOn) return total;

    switch (addOn.unit) {
      case "flat":
        return total + addOn.price * item.quantity;
      case "per_person":
        return total + addOn.price * item.quantity;
      case "per_hour":
        return total + addOn.price * (item.hours ?? 1) * item.quantity;
      default:
        return total;
    }
  }, 0);
}

export function calculateBookingCost(input: CalculateBookingCostInput): CostBreakdown {
  const tour = getTourById(input.tourId);
  if (!tour) {
    throw new Error(`Tour not found: ${input.tourId}`);
  }

  const taxRate = input.taxRate ?? 0.0875;
  const baseTourCost = tour.basePricePerPerson * input.passengers;
  const extraPassengers = Math.max(0, input.passengers - INCLUDED_PASSENGERS);
  const extraPassengerFee = extraPassengers * EXTRA_PASSENGER_FEE;
  const addOnsCost = calculateAddOnCost(input.addOns, input.passengers);
  const vehicle = getVehicleForGroupSize(input.passengers);
  const vehicleRentalCost = vehicle.rentalCost;

  const subtotal =
    baseTourCost +
    input.pickupCost +
    extraPassengerFee +
    addOnsCost +
    vehicleRentalCost;

  const taxesAndFees = subtotal * taxRate;
  const totalCost = subtotal + taxesAndFees;

  const lineItems: { label: string; amount: number }[] = [
    {
      label: `${tour.name} ($${tour.basePricePerPerson}/person × ${input.passengers})`,
      amount: baseTourCost,
    },
    { label: "Pickup surcharge", amount: input.pickupCost },
  ];

  if (extraPassengerFee > 0) {
    lineItems.push({
      label: `Extra passenger fee (${extraPassengers} × $${EXTRA_PASSENGER_FEE})`,
      amount: extraPassengerFee,
    });
  }

  if (vehicleRentalCost > 0) {
    lineItems.push({
      label: `${vehicle.type} rental`,
      amount: vehicleRentalCost,
    });
  }

  for (const item of input.addOns) {
    const addOn = getAddOnById(item.addOnId);
    if (!addOn) continue;

    let amount = 0;
    if (addOn.unit === "per_hour") {
      amount = addOn.price * (item.hours ?? 1) * item.quantity;
    } else {
      amount = addOn.price * item.quantity;
    }
    lineItems.push({ label: addOn.name, amount });
  }

  lineItems.push({
    label: `Taxes & fees (${(taxRate * 100).toFixed(2)}%)`,
    amount: taxesAndFees,
  });

  return {
    baseTourCost,
    pickupCost: input.pickupCost,
    extraPassengerFee,
    addOnsCost,
    vehicleRentalCost,
    taxesAndFees,
    subtotal,
    totalCost,
    lineItems,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
