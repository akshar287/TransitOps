import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import { FuelLog } from '@/lib/models/FuelLog';
import { getOperationalCost } from '@/lib/aggregations/operationalCost';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const fuelLogs = await FuelLog.find()
      .populate('vehicleId', 'regNo nameModel')
      .sort({ date: -1 })
      .lean();
      
    // Include the operational cost summary in the response for convenience
    const summary = await getOperationalCost();
    
    return NextResponse.json({ fuelLogs, summary });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sessionAuth = await getServerSession(authOptions);
    if (!sessionAuth || sessionAuth.user.role !== 'FinancialAnalyst') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    await dbConnect();
    const log = await FuelLog.create(body);
    return NextResponse.json(log, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
