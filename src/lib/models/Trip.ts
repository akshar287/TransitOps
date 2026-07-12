import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITrip extends Document {
  tripCode: string;
  source: string;
  destination: string;
  vehicleId: mongoose.Types.ObjectId;
  driverId: mongoose.Types.ObjectId;
  cargoWeightKg: number;
  plannedDistanceKm: number;
  actualOdometerEnd?: number;
  fuelConsumed?: number;
  cancellationReason?: string;
  status: 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';
  etaMinutes: number;
  createdAt: Date;
}

const TripSchema = new Schema<ITrip>(
  {
    tripCode: { type: String, required: true, unique: true },
    source: { type: String, required: true },
    destination: { type: String, required: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driverId: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
    cargoWeightKg: { type: Number, required: true },
    plannedDistanceKm: { type: Number, required: true },
    actualOdometerEnd: { type: Number },
    fuelConsumed: { type: Number },
    cancellationReason: { type: String },
    status: {
      type: String,
      enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'],
      default: 'Draft',
      index: true,
    },
    etaMinutes: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const Trip: Model<ITrip> =
  mongoose.models.Trip || mongoose.model<ITrip>('Trip', TripSchema);
