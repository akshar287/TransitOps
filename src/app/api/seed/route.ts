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

    // 2. Generate 50 Vehicles
    const vehiclesData = [];
    for (let i = 1; i <= 50; i++) {
      const isTruck = i % 5 !== 0; // 80% trucks, 20% vans
      const regNo = isTruck ? `TRK-${1000 + i}` : `VAN-${2000 + i}`;
      const nameModel = isTruck 
        ? (i % 3 === 0 ? 'Volvo FH16' : (i % 3 === 1 ? 'Scania R500' : 'MAN TGX'))
        : (i % 2 === 0 ? 'Mercedes Sprinter' : 'Ford Transit');
      const type = isTruck ? 'Heavy Duty' : 'Light Duty';
      const maxCapacityKg = isTruck ? (i % 2 === 0 ? 40000 : 38000) : 3500;
      const odometer = 20000 + (i * 4500);
      const acquisitionCost = isTruck ? 130000 + ((i % 5) * 10000) : 40000 + ((i % 3) * 5000);
      
      // Distribution of statuses: 
      // 1-25 Available, 26-42 OnTrip (17 vehicles), 43-47 InShop (5 vehicles), 48-50 Retired (3 vehicles)
      let status = 'Available';
      if (i > 25 && i <= 42) {
        status = 'OnTrip';
      } else if (i > 42 && i <= 47) {
        status = 'InShop';
      } else if (i > 47) {
        status = 'Retired';
      }

      vehiclesData.push({
        regNo,
        nameModel,
        type,
        maxCapacityKg,
        odometer,
        acquisitionCost,
        status
      });
    }
    const vehicles = await Vehicle.insertMany(vehiclesData);

    // 3. Generate 50 Drivers
    const driversData = [];
    const licenseCategories = ['C', 'CE', 'D', 'DE'];
    const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Jessica', 'William', 'Ashley', 'James', 'Amanda', 'Charles', 'Mary', 'Joseph', 'Patricia', 'Thomas', 'Jennifer', 'Daniel', 'Linda'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

    for (let i = 1; i <= 50; i++) {
      const name = `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`;
      const licenseNo = `DL-${100000 + i * 17}`;
      const licenseCategory = licenseCategories[i % licenseCategories.length];
      
      // 5 expired, others valid (future)
      const isExpired = i <= 5;
      const licenseExpiry = new Date();
      if (isExpired) {
        licenseExpiry.setFullYear(licenseExpiry.getFullYear() - 1);
      } else {
        licenseExpiry.setFullYear(licenseExpiry.getFullYear() + ((i % 3) + 1));
      }

      const contactNumber = `+1-555-${String(i).padStart(4, '0')}`;
      const safetyScore = 60 + (i % 41); // 60 to 100
      const tripCompletionPct = 80 + (i % 21); // 80 to 100
      
      // Match statuses:
      // 1-5 Suspended (expired), 6-25 Available, 26-42 OnTrip (17 drivers), 43-50 OffDuty (8 drivers)
      let status = 'Available';
      if (isExpired) {
        status = 'Suspended';
      } else if (i > 5 && i <= 25) {
        status = 'Available';
      } else if (i > 25 && i <= 42) {
        status = 'OnTrip';
      } else {
        status = 'OffDuty';
      }

      driversData.push({
        name,
        licenseNo,
        licenseCategory,
        licenseExpiry,
        contactNumber,
        safetyScore,
        tripCompletionPct,
        status
      });
    }
    const drivers = await Driver.insertMany(driversData);

    // 4. Generate Trips
    const tripsData = [];
    const sources = ['New York, NY', 'Chicago, IL', 'Los Angeles, CA', 'Seattle, WA', 'Miami, FL', 'Dallas, TX', 'Atlanta, GA', 'Denver, CO', 'Phoenix, AZ', 'San Francisco, CA'];
    const destinations = ['Boston, MA', 'Detroit, MI', 'Las Vegas, NV', 'Portland, OR', 'Orlando, FL', 'Houston, TX', 'Charlotte, NC', 'Salt Lake City, UT', 'San Diego, CA', 'Seattle, WA'];

    // 4a. 17 Dispatched Trips (mapping to OnTrip vehicles [index 25 to 41] and OnTrip drivers [index 25 to 41])
    for (let i = 0; i < 17; i++) {
      tripsData.push({
        tripCode: `TRP-DISP-${100 + i}`,
        source: sources[i % sources.length],
        destination: destinations[i % destinations.length],
        vehicleId: vehicles[25 + i]._id,
        driverId: drivers[25 + i]._id,
        cargoWeightKg: 1000 + (i * 2000),
        plannedDistanceKm: 200 + (i * 35),
        status: 'Dispatched',
        etaMinutes: 180 + (i * 30),
      });
    }

    // 4b. 10 Draft Trips (using Available vehicles [index 0 to 9] and Available drivers [index 5 to 14])
    for (let i = 0; i < 10; i++) {
      tripsData.push({
        tripCode: `TRP-DRFT-${100 + i}`,
        source: sources[(i + 3) % sources.length],
        destination: destinations[(i + 4) % destinations.length],
        vehicleId: vehicles[i]._id,
        driverId: drivers[5 + i]._id,
        cargoWeightKg: 1500 + (i * 1200),
        plannedDistanceKm: 150 + (i * 50),
        status: 'Draft',
        etaMinutes: 120 + (i * 45),
      });
    }

    // 4c. 20 Completed Trips (using various vehicles and drivers)
    for (let i = 0; i < 20; i++) {
      const distance = 100 + (i * 40);
      const fuel = Math.round(distance * (0.2 + (i % 3) * 0.05)); // 20-30 liters per 100km
      tripsData.push({
        tripCode: `TRP-COMP-${100 + i}`,
        source: sources[(i + 6) % sources.length],
        destination: destinations[(i + 7) % destinations.length],
        vehicleId: vehicles[i % 25]._id, // use available ones to avoid breaking state invariants
        driverId: drivers[5 + (i % 20)]._id,
        cargoWeightKg: 2000 + (i * 1000),
        plannedDistanceKm: distance,
        actualOdometerEnd: vehicles[i % 25].odometer + distance,
        fuelConsumed: fuel,
        status: 'Completed',
        etaMinutes: Math.round(distance * 0.8),
      });
    }

    // 4d. 5 Cancelled Trips
    for (let i = 0; i < 5; i++) {
      tripsData.push({
        tripCode: `TRP-CANC-${100 + i}`,
        source: sources[(i + 2) % sources.length],
        destination: destinations[(i + 9) % destinations.length],
        vehicleId: vehicles[i % 25]._id,
        driverId: drivers[5 + (i % 20)]._id,
        cargoWeightKg: 5000,
        plannedDistanceKm: 300,
        status: 'Cancelled',
        cancellationReason: 'Route blocked by weather',
        etaMinutes: 240,
      });
    }

    const trips = await Trip.insertMany(tripsData);

    // 5. Generate Maintenance Logs
    const maintenanceData = [];
    const serviceTypes = ['Oil Change', 'Brake Replacement', 'Tire Rotation', 'Engine Tune-up', 'Transmission Flush', 'AC Repair'];
    
    // 5a. 5 Active Maintenance Logs (for InShop vehicles [index 42 to 46])
    for (let i = 0; i < 5; i++) {
      maintenanceData.push({
        vehicleId: vehicles[42 + i]._id,
        serviceType: serviceTypes[i % serviceTypes.length],
        cost: 200 + (i * 150),
        date: new Date(),
        status: 'Active',
      });
    }

    // 5b. 15 Completed Maintenance Logs
    for (let i = 0; i < 15; i++) {
      maintenanceData.push({
        vehicleId: vehicles[i % 50]._id,
        serviceType: serviceTypes[(i + 2) % serviceTypes.length],
        cost: 150 + (i * 80),
        date: new Date(Date.now() - (86400000 * (i + 1))),
        status: 'Completed',
      });
    }
    const maintenanceLogs = await MaintenanceLog.insertMany(maintenanceData);

    // 6. Generate Fuel Logs (for completed trips & general fueling)
    const fuelData = [];
    const completedTripsOnly = trips.filter(t => t.status === 'Completed');
    
    completedTripsOnly.forEach((trip, index) => {
      fuelData.push({
        vehicleId: trip.vehicleId,
        date: new Date(Date.now() - (86400000 * (index % 5 + 1))),
        liters: trip.fuelConsumed || 50,
        cost: Math.round((trip.fuelConsumed || 50) * 1.5),
      });
    });

    // Add 15 general fuel logs
    for (let i = 0; i < 15; i++) {
      fuelData.push({
        vehicleId: vehicles[i % 50]._id,
        date: new Date(Date.now() - (86400000 * (i + 2))),
        liters: 60 + (i * 5),
        cost: Math.round((60 + (i * 5)) * 1.45),
      });
    }
    await FuelLog.insertMany(fuelData);

    // 7. Generate Expenses (linked to Completed Trips)
    const expenseData = [];
    completedTripsOnly.forEach((trip, index) => {
      const toll = 10 + (index * 5);
      const other = 5 + (index * 2);
      expenseData.push({
        tripId: trip._id,
        vehicleId: trip.vehicleId,
        toll,
        other,
        maintenanceLinkedCost: index % 4 === 0 ? 120 : 0, // Mock maintenance linkage cost
        total: toll + other + (index % 4 === 0 ? 120 : 0),
      });
    });
    await Expense.insertMany(expenseData);

    return NextResponse.json({ 
      message: 'Database seeded successfully with 50 vehicles, 50 drivers, and operational logs.', 
      success: true,
      counts: {
        users: users.length,
        vehicles: vehicles.length,
        drivers: drivers.length,
        trips: trips.length,
        maintenanceLogs: maintenanceLogs.length,
        fuelLogs: fuelData.length,
        expenses: expenseData.length
      }
    });
  } catch (error: any) {
    console.error('Seeding error:', error);
    return NextResponse.json({ error: error.message, success: false }, { status: 500 });
  }
}
