import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'FleetManager' | 'Dispatcher' | 'SafetyOfficer' | 'FinancialAnalyst';
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['FleetManager', 'Dispatcher', 'SafetyOfficer', 'FinancialAnalyst'],
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
