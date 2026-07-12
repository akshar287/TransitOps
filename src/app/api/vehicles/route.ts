import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import { Vehicle } from '@/lib/models/Vehicle';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const q = searchParams.get('q');

    const query: any = {};
    if (status && status !== 'All') query.status = status;
    if (type && type !== 'All') query.type = type;
    if (q) {
      query.$or = [
        { regNo: { $regex: q, $options: 'i' } },
        { nameModel: { $regex: q, $options: 'i' } },
      ];
    }

    await dbConnect();
    const vehicles = await Vehicle.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json(vehicles);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    // Only FleetManager can add vehicles (Financial Analyst can view)
    if (!session || session.user.role !== 'FleetManager') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    await dbConnect();

    const existing = await Vehicle.findOne({ regNo: body.regNo });
    if (existing) {
      return NextResponse.json({ error: 'Registration number already exists' }, { status: 409 });
    }

    const vehicle = await Vehicle.create(body);
    return NextResponse.json(vehicle, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
