import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDriver extends Document {
  name: string;
  licenseNo: string;
  licenseCategory: string;
  licenseExpiry: Date;
  contactNumber: string;
  safetyScore: number;
  tripCompletionPct: number;
  status: 'Available' | 'OnTrip' | 'OffDuty' | 'Suspended';
}

const DriverSchema = new Schema<IDriver>(
  {
    name: { type: String, required: true },
    licenseNo: { type: String, required: true, unique: true },
    licenseCategory: { type: String, required: true },
    licenseExpiry: { type: Date, required: true },
    contactNumber: { type: String, required: true },
    safetyScore: { type: Number, required: true, default: 100 },
    tripCompletionPct: { type: Number, required: true, default: 100 },
    status: {
      type: String,
      enum: ['Available', 'OnTrip', 'OffDuty', 'Suspended'],
      default: 'Available',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Driver: Model<IDriver> =
  mongoose.models.Driver || mongoose.model<IDriver>('Driver', DriverSchema);
