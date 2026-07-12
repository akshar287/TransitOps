import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import { Trip } from '@/lib/models/Trip';
import { Vehicle } from '@/lib/models/Vehicle';
import { getOperationalCost } from '@/lib/aggregations/operationalCost';
import { FuelLog } from '@/lib/models/FuelLog';
import { MaintenanceLog } from '@/lib/models/MaintenanceLog';

const REVENUE_PER_KM = 10; // Simulated revenue metric for the demo

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    // 1. Fuel Efficiency & Revenue
    const completedTrips = await Trip.find({ status: 'Completed' }).lean();
    let totalDistance = 0;
    let totalFuelTrips = 0;
    completedTrips.forEach(t => {
      totalDistance += (t.plannedDistanceKm || 0); // Assuming planned is close to actual for simplicity if finalOdometer not tracked delta
      totalFuelTrips += (t.fuelConsumed || 0);
    });
    
    // Actually compute distance from Trips: (finalOdometer - (initial odometer? we didn't track initial odometer on trip, just planned distance))
    // Let's use plannedDistanceKm for distance.
    const fuelEfficiency = totalFuelTrips > 0 ? (totalDistance / totalFuelTrips).toFixed(1) : 0;
    const totalRevenue = totalDistance * REVENUE_PER_KM;

    // 2. Fleet Utilization
    const allVehicles = await Vehicle.find({ status: { $ne: 'Retired' } }).lean();
    const activeVehicles = allVehicles.filter(v => v.status === 'OnTrip').length;
    const fleetUtilization = allVehicles.length > 0 ? ((activeVehicles / allVehicles.length) * 100).toFixed(0) : 0;

    // 3. Operational Cost
    const opCost = await getOperationalCost();

    // 4. Vehicle ROI
    let totalAcquisition = 0;
    allVehicles.forEach(v => { totalAcquisition += (v.acquisitionCost || 0) });
    const roi = totalAcquisition > 0 
      ? (((totalRevenue - opCost.totalOperationalCost) / totalAcquisition) * 100).toFixed(1) 
      : 0;

    // Charts: Monthly Revenue (Mocked last 6 months for demo visualization based on current month)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonthIndex = new Date().getMonth();
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      let mIndex = currentMonthIndex - i;
      if (mIndex < 0) mIndex += 12;
      // Mocking some variation around the totalRevenue
      monthlyRevenue.push({
        name: monthNames[mIndex],
        revenue: Math.floor((totalRevenue / 6) * (0.8 + Math.random() * 0.4)) // random variation
      });
    }

    // Charts: Top Costliest Vehicles
    const vehicleCostMap: any = {};
    const fuels = await FuelLog.find().populate('vehicleId', 'regNo').lean();
    const maints = await MaintenanceLog.find().populate('vehicleId', 'regNo').lean();
    
    fuels.forEach(f => {
      if (!f.vehicleId) return;
      const regNo = (f.vehicleId as any).regNo;
      vehicleCostMap[regNo] = (vehicleCostMap[regNo] || 0) + (f.cost || 0);
    });
    maints.forEach(m => {
      if (!m.vehicleId) return;
      const regNo = (m.vehicleId as any).regNo;
      vehicleCostMap[regNo] = (vehicleCostMap[regNo] || 0) + (m.cost || 0);
    });

    const costliestVehicles = Object.entries(vehicleCostMap)
      .map(([name, cost]) => ({ name, cost }))
      .sort((a: any, b: any) => b.cost - a.cost)
      .slice(0, 5);

    return NextResponse.json({
      kpis: {
        fuelEfficiency,
        fleetUtilization,
        operationalCost: opCost.totalOperationalCost,
        roi
      },
      charts: {
        monthlyRevenue,
        costliestVehicles
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
