// Defines the Mongoose schema for a Reward Store Item.

import mongoose from 'mongoose';

const { Schema } = mongoose;

const storeItemSchema = new Schema({
  name: { type: String, required: [true, 'Item name is required.'], trim: true },
  description: { type: String, trim: true },
  cost: { type: Number, required: [true, 'Cost is required.'], min: [0, 'Cost cannot be negative.'] },
  familyId: { type: Schema.Types.ObjectId, ref: 'Family', required: true, index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const StoreItem = mongoose.model('StoreItem', storeItemSchema);

export default StoreItem;
