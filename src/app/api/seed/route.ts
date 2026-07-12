import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import dbConnect from '@/lib/db';
import { User } from '@/lib/models/User';
import { Vehicle } from '@/lib/models/Vehicle';
import { Driver } from '@/lib/models/Driver';
import { Trip } from '@/lib/models/Trip';
import { MaintenanceLog } from '@/lib/models/MaintenanceLog';
import { FuelLog } from '@/lib/models/FuelLog';
import { Expense } from '@/lib/models/Expense';

export async function GET() {
  try {
    await dbConnect();

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Vehicle.deleteMany({}),
      Driver.deleteMany({}),
      Trip.deleteMany({}),
      MaintenanceLog.deleteMany({}),
      FuelLog.deleteMany({}),
      Expense.deleteMany({}),
    ]);

    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Seed Users (1 per role)
    const users = await User.insertMany([
      { name: 'Alice Manager', email: 'alice@transitops.com', passwordHash, role: 'FleetManager' },
      { name: 'Bob Dispatcher', email: 'bob@transitops.com', passwordHash, role: 'Dispatcher' },
      { name: 'Charlie Safety', email: 'charlie@transitops.com', passwordHash, role: 'SafetyOfficer' },
      { name: 'Diana Finance', email: 'diana@transitops.com', passwordHash, role: 'FinancialAnalyst' },
    ]);

    // 2. Seed 5 Vehicles
    const vehicles = await Vehicle.insertMany([
      { regNo: 'TRK-1001', nameModel: 'Volvo FH16', type: 'Heavy Duty', maxCapacityKg: 40000, odometer: 120000, acquisitionCost: 150000, status: 'Available' },
      { regNo: 'TRK-1002', nameModel: 'Scania R500', type: 'Heavy Duty', maxCapacityKg: 38000, odometer: 85000, acquisitionCost: 140000, status: 'OnTrip' },
      { regNo: 'VAN-2001', nameModel: 'Mercedes Sprinter', type: 'Light Duty', maxCapacityKg: 3500, odometer: 45000, acquisitionCost: 45000, status: 'Available' },
      { regNo: 'TRK-1003', nameModel: 'Volvo FH16', type: 'Heavy Duty', maxCapacityKg: 40000, odometer: 210000, acquisitionCost: 145000, status: 'InShop' },
      { regNo: 'VAN-2002', nameModel: 'Ford Transit', type: 'Light Duty', maxCapacityKg: 2500, odometer: 320000, acquisitionCost: 35000, status: 'Retired' },
    ]);

    // 3. Seed 4 Drivers
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const drivers = await Driver.insertMany([
      { name: 'John Doe', licenseNo: 'DL-99382', licenseCategory: 'CE', licenseExpiry: nextYear, contactNumber: '+1-555-0101', safetyScore: 98, tripCompletionPct: 99, status: 'Available' },
      { name: 'Jane Smith', licenseNo: 'DL-88271', licenseCategory: 'CE', licenseExpiry: nextYear, contactNumber: '+1-555-0102', safetyScore: 92, tripCompletionPct: 95, status: 'OnTrip' },
      { name: 'Mike Johnson', licenseNo: 'DL-77160', licenseCategory: 'C', licenseExpiry: nextYear, contactNumber: '+1-555-0103', safetyScore: 85, tripCompletionPct: 88, status: 'OffDuty' },
      { name: 'Sarah Williams', licenseNo: 'DL-66059', licenseCategory: 'C', licenseExpiry: new Date(Date.now() - 86400000), contactNumber: '+1-555-0104', safetyScore: 70, tripCompletionPct: 80, status: 'Suspended' }, // Expired license
    ]);

    // 4. Seed 6 Trips across lifecycle states
    const trips = await Trip.insertMany([
      // Draft
      { tripCode: 'TRP-001', source: 'New York, NY', destination: 'Boston, MA', vehicleId: vehicles[0]._id, driverId: drivers[0]._id, cargoWeightKg: 15000, plannedDistanceKm: 350, status: 'Draft', etaMinutes: 240 },
      // Dispatched (matches OnTrip vehicle/driver)
      { tripCode: 'TRP-002', source: 'Chicago, IL', destination: 'Detroit, MI', vehicleId: vehicles[1]._id, driverId: drivers[1]._id, cargoWeightKg: 28000, plannedDistanceKm: 450, status: 'Dispatched', etaMinutes: 300 },
      // Completed 1
      { tripCode: 'TRP-003', source: 'Los Angeles, CA', destination: 'Las Vegas, NV', vehicleId: vehicles[0]._id, driverId: drivers[0]._id, cargoWeightKg: 3500, plannedDistanceKm: 430, actualOdometerEnd: 120430, fuelConsumed: 120, status: 'Completed', etaMinutes: 260 },
      // Completed 2
      { tripCode: 'TRP-004', source: 'Seattle, WA', destination: 'Portland, OR', vehicleId: vehicles[2]._id, driverId: drivers[0]._id, cargoWeightKg: 2000, plannedDistanceKm: 280, actualOdometerEnd: 45280, fuelConsumed: 45, status: 'Completed', etaMinutes: 180 },
      // Cancelled
      { tripCode: 'TRP-005', source: 'Miami, FL', destination: 'Orlando, FL', vehicleId: vehicles[0]._id, driverId: drivers[2]._id, cargoWeightKg: 10000, plannedDistanceKm: 380, status: 'Cancelled', etaMinutes: 240 },
      // Draft 2
      { tripCode: 'TRP-006', source: 'Dallas, TX', destination: 'Houston, TX', vehicleId: vehicles[2]._id, driverId: drivers[0]._id, cargoWeightKg: 1200, plannedDistanceKm: 390, status: 'Draft', etaMinutes: 220 },
    ]);

    // 5. Seed Maintenance and Fuel Logs
    await MaintenanceLog.insertMany([
      { vehicleId: vehicles[3]._id, serviceType: 'Engine Overhaul', cost: 4500, date: new Date(), status: 'Active' },
      { vehicleId: vehicles[0]._id, serviceType: 'Oil Change', cost: 250, date: new Date(Date.now() - 86400000 * 5), status: 'Completed' },
    ]);

    await FuelLog.insertMany([
      { vehicleId: vehicles[0]._id, date: new Date(Date.now() - 86400000 * 2), liters: 120, cost: 180 },
      { vehicleId: vehicles[2]._id, date: new Date(Date.now() - 86400000 * 3), liters: 45, cost: 70 },
    ]);

    await Expense.insertMany([
      { tripId: trips[2]._id, vehicleId: vehicles[0]._id, toll: 25, other: 15, maintenanceLinkedCost: 0, total: 40 },
      { tripId: trips[3]._id, vehicleId: vehicles[2]._id, toll: 10, other: 5, maintenanceLinkedCost: 0, total: 15 },
    ]);

    return NextResponse.json({ message: 'Database seeded successfully', success: true });
  } catch (error: any) {
    console.error('Seeding error:', error);
    return NextResponse.json({ error: error.message, success: false }, { status: 500 });
  }
}
