import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import { Trip } from '@/lib/models/Trip';
import { Vehicle } from '@/lib/models/Vehicle';
import { Driver } from '@/lib/models/Driver';
import mongoose from 'mongoose';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sessionAuth = await getServerSession(authOptions);
    if (!sessionAuth || sessionAuth.user.role !== 'Dispatcher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const conn = await dbConnect();
    const session = await conn.startSession();
    session.startTransaction();

    try {
      const trip = await Trip.findById(id).session(session);
      if (!trip) throw new Error('Trip not found');
      if (trip.status !== 'Draft') throw new Error('Only Draft trips can be dispatched');

      const vehicle = await Vehicle.findById(trip.vehicleId).session(session);
      if (!vehicle || vehicle.status !== 'Available') throw new Error('Vehicle is not available');
      
      if (trip.cargoWeightKg > vehicle.maxCapacityKg) {
        throw new Error(`Capacity exceeded. Cargo: ${trip.cargoWeightKg}kg, Max: ${vehicle.maxCapacityKg}kg`);
      }

      const driver = await Driver.findById(trip.driverId).session(session);
      if (!driver || driver.status !== 'Available') {
        throw new Error('Driver is not available or suspended');
      }
      
      const now = new Date();
      if (new Date(driver.licenseExpiry) < now) {
        throw new Error('Driver license is expired');
      }

      // Update statuses
      trip.status = 'Dispatched';
      vehicle.status = 'OnTrip';
      driver.status = 'OnTrip';

      await trip.save({ session });
      await vehicle.save({ session });
      await driver.save({ session });

      await session.commitTransaction();
      return NextResponse.json(trip);
    } catch (e: any) {
      await session.abortTransaction();
      return NextResponse.json({ error: e.message }, { status: 400 });
    } finally {
      session.endSession();
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
