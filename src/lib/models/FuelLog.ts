import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFuelLog extends Document {
  vehicleId: mongoose.Types.ObjectId;
  date: Date;
  liters: number;
  cost: number;
}

const FuelLogSchema = new Schema<IFuelLog>(
  {
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    date: { type: Date, required: true },
    liters: { type: Number, required: true },
    cost: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

export const FuelLog: Model<IFuelLog> =
  mongoose.models.FuelLog || mongoose.model<IFuelLog>('FuelLog', FuelLogSchema);
