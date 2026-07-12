import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExpense extends Document {
  tripId?: mongoose.Types.ObjectId;
  vehicleId?: mongoose.Types.ObjectId;
  toll: number;
  other: number;
  maintenanceLinkedCost: number;
  total: number;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    tripId: { type: Schema.Types.ObjectId, ref: 'Trip' },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    toll: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
    maintenanceLinkedCost: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

export const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);
