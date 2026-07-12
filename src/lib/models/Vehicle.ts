import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVehicle extends Document {
  regNo: string;
  nameModel: string;
  type: string;
  maxCapacityKg: number;
  odometer: number;
  acquisitionCost: number;
  status: 'Available' | 'OnTrip' | 'InShop' | 'Retired';
}

const VehicleSchema = new Schema<IVehicle>(
  {
    regNo: { type: String, required: true, unique: true, index: true },
    nameModel: { type: String, required: true },
    type: { type: String, required: true },
    maxCapacityKg: { type: Number, required: true },
    odometer: { type: Number, required: true, default: 0 },
    acquisitionCost: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Available', 'OnTrip', 'InShop', 'Retired'],
      default: 'Available',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Vehicle: Model<IVehicle> =
  mongoose.models.Vehicle || mongoose.model<IVehicle>('Vehicle', VehicleSchema);
