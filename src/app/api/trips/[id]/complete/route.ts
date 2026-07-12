import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import { Trip } from '@/lib/models/Trip';
import { Vehicle } from '@/lib/models/Vehicle';
import { Driver } from '@/lib/models/Driver';
import { FuelLog } from '@/lib/models/FuelLog';
import mongoose from 'mongoose';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sessionAuth = await getServerSession(authOptions);
    if (!sessionAuth || sessionAuth.user.role !== 'Dispatcher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { finalOdometer, fuelConsumedLiters } = body;
    
    if (finalOdometer == null || fuelConsumedLiters == null) {
      return NextResponse.json({ error: 'finalOdometer and fuelConsumedLiters are required' }, { status: 400 });
    }

    const conn = await dbConnect();
    const session = await conn.startSession();
    session.startTransaction();

    try {
      const trip = await Trip.findById(id).session(session);
      if (!trip) throw new Error('Trip not found');
      if (trip.status !== 'Dispatched') throw new Error('Only Dispatched trips can be completed');

      const vehicle = await Vehicle.findById(trip.vehicleId).session(session);
      if (!vehicle) throw new Error('Vehicle not found');

      const driver = await Driver.findById(trip.driverId).session(session);
      if (!driver) throw new Error('Driver not found');

      // Update statuses
      trip.status = 'Completed';
      trip.actualOdometerEnd = finalOdometer;
      trip.fuelConsumed = fuelConsumedLiters;

      vehicle.status = 'Available';
      vehicle.odometer = finalOdometer; // update vehicle odometer

      driver.status = 'Available';

      // Auto-create FuelLog
      // Calculate generic fuel cost based on an assumed price per liter, e.g., $1.50 per liter, 
      // or just log 0 and let Finance update it later. We will log $1.50/L for demo.
      const fuelCost = fuelConsumedLiters * 1.5;
      
      await FuelLog.create([{
        vehicleId: vehicle._id,
        date: new Date(),
        liters: fuelConsumedLiters,
        cost: fuelCost
      }], { session });

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
