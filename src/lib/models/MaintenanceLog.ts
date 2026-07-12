import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMaintenanceLog extends Document {
  vehicleId: mongoose.Types.ObjectId;
  serviceType: string;
  cost: number;
  date: Date;
  status: 'Active' | 'Completed';
}

const MaintenanceLogSchema = new Schema<IMaintenanceLog>(
  {
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    serviceType: { type: String, required: true },
    cost: { type: Number, required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ['Active', 'Completed'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

export const MaintenanceLog: Model<IMaintenanceLog> =
  mongoose.models.MaintenanceLog || mongoose.model<IMaintenanceLog>('MaintenanceLog', MaintenanceLogSchema);
