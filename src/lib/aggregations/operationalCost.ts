import dbConnect from '@/lib/db';
import { FuelLog } from '@/lib/models/FuelLog';
import { MaintenanceLog } from '@/lib/models/MaintenanceLog';
import { Expense } from '@/lib/models/Expense';
import mongoose from 'mongoose';

export async function getOperationalCost(vehicleId?: string) {
  await dbConnect();
  
  const matchStage = vehicleId ? { $match: { vehicleId: new mongoose.Types.ObjectId(vehicleId) } } : { $match: {} };

  // Aggregate Fuel Cost
  const fuelResult = await FuelLog.aggregate([
    matchStage,
    { $group: { _id: null, total: { $sum: "$cost" }, liters: { $sum: "$liters" } } }
  ]);
  const totalFuelCost = fuelResult[0]?.total || 0;
  const totalFuelLiters = fuelResult[0]?.liters || 0;

  // Aggregate Maintenance Cost
  const maintResult = await MaintenanceLog.aggregate([
    matchStage,
    { $group: { _id: null, total: { $sum: "$cost" } } }
  ]);
  const totalMaintCost = maintResult[0]?.total || 0;

  // Aggregate Other Expenses (Tolls, etc)
  const expenseResult = await Expense.aggregate([
    matchStage,
    { $group: { _id: null, totalToll: { $sum: "$toll" }, totalOther: { $sum: "$other" } } }
  ]);
  const totalToll = expenseResult[0]?.totalToll || 0;
  const totalOther = expenseResult[0]?.totalOther || 0;

  return {
    fuelCost: totalFuelCost,
    fuelLiters: totalFuelLiters,
    maintenanceCost: totalMaintCost,
    tollCost: totalToll,
    otherCost: totalOther,
    totalOperationalCost: totalFuelCost + totalMaintCost + totalToll + totalOther
  };
}
