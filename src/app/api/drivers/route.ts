import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import { Driver } from '@/lib/models/Driver';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const licenseValid = searchParams.get('licenseValid');

    const query: any = {};
    if (status && status !== 'All') query.status = status;
    
    // For dispatch dropdowns
    if (licenseValid === 'true') {
      query.licenseExpiry = { $gt: new Date() };
      query.status = { $ne: 'Suspended' };
    }

    await dbConnect();
    const drivers = await Driver.find(query).sort({ licenseExpiry: 1 }).lean();
    return NextResponse.json(drivers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    // Only SafetyOfficer can add drivers
    if (!session || session.user.role !== 'SafetyOfficer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    await dbConnect();

    const existing = await Driver.findOne({ licenseNo: body.licenseNo });
    if (existing) {
      return NextResponse.json({ error: 'License number already exists' }, { status: 409 });
    }

    const driver = await Driver.create(body);
    return NextResponse.json(driver, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
