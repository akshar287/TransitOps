import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import { Driver } from '@/lib/models/Driver';
import { Trip } from '@/lib/models/Trip';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SafetyOfficer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const newStatus = body.status;
    await dbConnect();

    const driver = await Driver.findById(id);
    if (!driver) return NextResponse.json({ error: 'Driver not found' }, { status: 404 });

    // Validate manual transition
    if (newStatus === 'Available' || newStatus === 'OffDuty' || newStatus === 'Suspended') {
      // Check if linked to an active trip
      const activeTrip = await Trip.findOne({ driverId: driver._id, status: 'Dispatched' });
      if (activeTrip && driver.status === 'OnTrip') {
        return NextResponse.json({ error: 'Cannot manually change status while assigned to a Dispatched trip.' }, { status: 400 });
      }
    }

    // Safety Officer cannot manually set "OnTrip"
    if (newStatus === 'OnTrip') {
      return NextResponse.json({ error: 'On Trip status can only be set via Trip Dispatcher.' }, { status: 400 });
    }

    driver.status = newStatus;
    await driver.save();

    return NextResponse.json(driver);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
