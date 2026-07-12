import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import { Trip } from '@/lib/models/Trip';
import { Vehicle } from '@/lib/models/Vehicle';
import { Driver } from '@/lib/models/Driver';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const trips = await Trip.find()
      .populate('vehicleId', 'regNo nameModel maxCapacityKg')
      .populate('driverId', 'name licenseNo')
      .sort({ createdAt: -1 })
      .lean();
      
    return NextResponse.json(trips);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'Dispatcher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    await dbConnect();

    // Just creating a Draft trip doesn't require a transaction, but dispatching does.
    // If they want to just save as Draft without dispatching yet:
    const tripCode = `TRP-${Date.now().toString().slice(-6)}`;
    const trip = await Trip.create({
      tripCode,
      ...body,
      status: 'Draft',
    });

    return NextResponse.json(trip, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
