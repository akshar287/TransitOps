import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// For the purpose of the MVP, we will mock the settings in memory.
// In a real app, this would be a Settings collection in MongoDB.
let globalSettings = {
  depotName: 'Gandhinagar Depot #24',
  currency: 'INR (₹)',
  distanceUnit: 'Kilometers'
};

export async function GET() {
  return NextResponse.json(globalSettings);
}

export async function POST(req: Request) {
  try {
    const sessionAuth = await getServerSession(authOptions);
    if (!sessionAuth || sessionAuth.user.role !== 'FleetManager') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    globalSettings = { ...globalSettings, ...body };
    
    return NextResponse.json(globalSettings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
