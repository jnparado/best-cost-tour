import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { tours as seedTours } from "@/lib/data/tours";
import { vehicles as seedVehicles } from "@/lib/data/vehicles";
import { addOns as seedAddOns } from "@/lib/data/addons";
import { bookings as seedBookings } from "@/lib/data/bookings";
import {
  tourAvailability as seedAvailability,
  guideSchedules as seedGuides,
} from "@/lib/data/availability";
import { calculateBookingCost } from "@/lib/calculations/booking-cost";

// Vercel's serverless filesystem is read-only except /tmp. The database is
// recreated from seed data on each cold start there (fine for a demo).
// Locally, DATABASE_PATH from .env.local controls where the file lives.
const DB_PATH = process.env.VERCEL
  ? path.join("/tmp", "bestcoasttour-data", "bestcoasttour.db")
  : path.resolve(process.cwd(), process.env.DATABASE_PATH ?? "data/bestcoasttour.db");
const DB_DIR = path.dirname(DB_PATH);

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  fs.mkdirSync(DB_DIR, { recursive: true });
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  createSchema(db);
  seed(db);
  return db;
}

function createSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tours (
      id TEXT PRIMARY KEY,
      tour_name TEXT NOT NULL,
      base_price REAL NOT NULL,
      duration TEXT NOT NULL,
      max_guests INTEGER NOT NULL DEFAULT 40,
      description TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      vehicle_name TEXT PRIMARY KEY,
      min_guests INTEGER NOT NULL,
      capacity INTEGER NOT NULL,
      cost_per_trip REAL NOT NULL,
      description TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS add_ons (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      unit TEXT NOT NULL DEFAULT 'flat',
      description TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      booking_date TEXT NOT NULL,
      tour_id TEXT NOT NULL REFERENCES tours(id),
      guest_count INTEGER NOT NULL,
      pickup_location TEXT NOT NULL DEFAULT '',
      pickup_cost REAL NOT NULL DEFAULT 0,
      tax_rate REAL NOT NULL DEFAULT 0.0875,
      total_price REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Pending',
      vehicle_name TEXT NOT NULL REFERENCES vehicles(vehicle_name),
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS booking_add_ons (
      booking_id TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
      add_on_id TEXT NOT NULL REFERENCES add_ons(id),
      quantity INTEGER NOT NULL DEFAULT 1,
      hours INTEGER,
      PRIMARY KEY (booking_id, add_on_id)
    );

    CREATE TABLE IF NOT EXISTS costs (
      booking_id TEXT PRIMARY KEY REFERENCES bookings(id) ON DELETE CASCADE,
      fuel_cost REAL NOT NULL DEFAULT 0,
      driver_fee REAL NOT NULL DEFAULT 0,
      mileage_cost REAL NOT NULL DEFAULT 0,
      overtime_fee REAL NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS tour_availability (
      tour_id TEXT NOT NULL REFERENCES tours(id),
      date TEXT NOT NULL,
      max_capacity INTEGER NOT NULL,
      booked_count INTEGER NOT NULL DEFAULT 0,
      vehicle_available INTEGER NOT NULL DEFAULT 1,
      guide_available INTEGER NOT NULL DEFAULT 1,
      PRIMARY KEY (tour_id, date)
    );

    CREATE TABLE IF NOT EXISTS guide_schedules (
      guide_id TEXT NOT NULL,
      guide_name TEXT NOT NULL,
      date TEXT NOT NULL,
      available INTEGER NOT NULL DEFAULT 1,
      assigned_tour_id TEXT REFERENCES tours(id),
      PRIMARY KEY (guide_id, date)
    );
  `);
}

// Splits a flat operating cost into the Cost table components.
export function splitOperatingCost(total: number) {
  const fuel = Math.round(total * 0.4 * 100) / 100;
  const driver = Math.round(total * 0.35 * 100) / 100;
  const mileage = Math.round(total * 0.15 * 100) / 100;
  const overtime = Math.round((total - fuel - driver - mileage) * 100) / 100;
  return { fuel, driver, mileage, overtime };
}

const tourMaxGuests: Record<string, number> = {
  T001: 12,
  T002: 8,
  T003: 4,
  T004: 12,
  T005: 40,
};

function seed(db: Database.Database) {
  const insertTour = db.prepare(
    `INSERT OR IGNORE INTO tours (id, tour_name, base_price, duration, max_guests, description)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  const insertVehicle = db.prepare(
    `INSERT OR IGNORE INTO vehicles (vehicle_name, min_guests, capacity, cost_per_trip, description)
     VALUES (?, ?, ?, ?, ?)`
  );
  const insertAddOn = db.prepare(
    `INSERT OR IGNORE INTO add_ons (id, name, price, unit, description)
     VALUES (?, ?, ?, ?, ?)`
  );
  const insertBooking = db.prepare(
    `INSERT OR IGNORE INTO bookings
     (id, customer_name, email, phone, booking_date, tour_id, guest_count,
      pickup_location, pickup_cost, tax_rate, total_price, status, vehicle_name, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertBookingAddOn = db.prepare(
    `INSERT OR IGNORE INTO booking_add_ons (booking_id, add_on_id, quantity, hours)
     VALUES (?, ?, ?, ?)`
  );
  const insertCost = db.prepare(
    `INSERT OR IGNORE INTO costs (booking_id, fuel_cost, driver_fee, mileage_cost, overtime_fee)
     VALUES (?, ?, ?, ?, ?)`
  );
  const insertAvailability = db.prepare(
    `INSERT OR IGNORE INTO tour_availability
     (tour_id, date, max_capacity, booked_count, vehicle_available, guide_available)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  const insertGuide = db.prepare(
    `INSERT OR IGNORE INTO guide_schedules (guide_id, guide_name, date, available, assigned_tour_id)
     VALUES (?, ?, ?, ?, ?)`
  );

  db.transaction(() => {
    for (const t of seedTours) {
      insertTour.run(
        t.id,
        t.name,
        t.basePricePerPerson,
        t.duration,
        tourMaxGuests[t.id] ?? 40,
        t.description
      );
    }
    for (const v of seedVehicles) {
      insertVehicle.run(v.type, v.minGuests, v.maxGuests, v.rentalCost, v.description);
    }
    for (const a of seedAddOns) {
      insertAddOn.run(a.id, a.name, a.price, a.unit, a.description);
    }
    for (const b of seedBookings) {
      const total = calculateBookingCost({
        tourId: b.tourId,
        passengers: b.passengers,
        pickupCost: b.pickupCost,
        addOns: b.addOns,
        taxRate: b.taxRate,
      }).totalCost;

      insertBooking.run(
        b.id,
        b.customer,
        b.email,
        "",
        b.date,
        b.tourId,
        b.passengers,
        b.pickupAddress,
        b.pickupCost,
        b.taxRate,
        Math.round(total * 100) / 100,
        b.status,
        b.vehicleType,
        b.notes ?? null
      );
      for (const item of b.addOns) {
        insertBookingAddOn.run(b.id, item.addOnId, item.quantity, item.hours ?? null);
      }
      const split = splitOperatingCost(b.operatingCost);
      insertCost.run(b.id, split.fuel, split.driver, split.mileage, split.overtime);
    }
    for (const av of seedAvailability) {
      insertAvailability.run(
        av.tourId,
        av.date,
        av.maxCapacity,
        av.bookedCount,
        av.vehicleAvailable ? 1 : 0,
        av.guideAvailable ? 1 : 0
      );
    }
    for (const g of seedGuides) {
      insertGuide.run(g.guideId, g.guideName, g.date, g.available ? 1 : 0, g.assignedTourId ?? null);
    }
  })();
}
