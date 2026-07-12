import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import { MaintenanceLog } from '@/lib/models/MaintenanceLog';
import { Vehicle } from '@/lib/models/Vehicle';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const logs = await MaintenanceLog.find()
      .populate('vehicleId', 'regNo nameModel status')
      .sort({ date: -1 })
      .lean();
    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sessionAuth = await getServerSession(authOptions);
    if (!sessionAuth || sessionAuth.user.role !== 'FleetManager') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const conn = await dbConnect();
    const session = await conn.startSession();
    session.startTransaction();

    try {
      const log = await MaintenanceLog.create([body], { session });
      
      if (body.status === 'Active') {
        const vehicle = await Vehicle.findById(body.vehicleId).session(session);
        if (vehicle && vehicle.status !== 'Retired') {
          vehicle.status = 'InShop';
          await vehicle.save({ session });
        }
      }

      await session.commitTransaction();
      return NextResponse.json(log[0], { status: 201 });
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

export async function PATCH(req: Request) {
  try {
    const sessionAuth = await getServerSession(authOptions);
    if (!sessionAuth || sessionAuth.user.role !== 'FleetManager') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { logId, status } = body;
    
    const conn = await dbConnect();
    const session = await conn.startSession();
    session.startTransaction();

    try {
      const log = await MaintenanceLog.findById(logId).session(session);
      if (!log) throw new Error('Log not found');

      if (log.status === 'Active' && status === 'Completed') {
        log.status = 'Completed';
        const vehicle = await Vehicle.findById(log.vehicleId).session(session);
        if (vehicle) {
          if (vehicle.status !== 'Retired') {
            vehicle.status = 'Available';
            await vehicle.save({ session });
          }
        }
        await log.save({ session });
      }

      await session.commitTransaction();
      return NextResponse.json(log);
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
