import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import { Trip } from '@/lib/models/Trip';
import { Vehicle } from '@/lib/models/Vehicle';
import { Driver } from '@/lib/models/Driver';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sessionAuth = await getServerSession(authOptions);
    if (!sessionAuth || sessionAuth.user.role !== 'Dispatcher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { cancellationReason } = body;
    
    if (!cancellationReason) {
      return NextResponse.json({ error: 'cancellationReason is required' }, { status: 400 });
    }

    const conn = await dbConnect();
    const session = await conn.startSession();
    session.startTransaction();

    try {
      const trip = await Trip.findById(id).session(session);
      if (!trip) throw new Error('Trip not found');
      if (trip.status !== 'Dispatched' && trip.status !== 'Draft') {
         throw new Error('Only Draft or Dispatched trips can be cancelled');
      }

      trip.status = 'Cancelled';
      trip.cancellationReason = cancellationReason;

      if (trip.vehicleId) {
        const vehicle = await Vehicle.findById(trip.vehicleId).session(session);
        if (vehicle && vehicle.status === 'OnTrip') {
          vehicle.status = 'Available';
          await vehicle.save({ session });
        }
      }

      if (trip.driverId) {
        const driver = await Driver.findById(trip.driverId).session(session);
        if (driver && driver.status === 'OnTrip') {
          driver.status = 'Available';
          await driver.save({ session });
        }
      }

      await trip.save({ session });

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
