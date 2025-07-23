import mongoose from 'mongoose';
const { Schema } = mongoose;

const familySchema = new Schema({
  familyName: {
    type: String,
    required: [true, 'Family name is required.'],
    trim: true,
  },
  // The primary user who created the family and has administrative rights.
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // An array of all users who are part of this family, including the owner.
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  // A unique, hard-to-guess code that can be used to invite new members.
  invitationCode: {
    type: String,
    unique: true,
  },
  // --- Monetization & Subscription Module ---
  subscription: {
    tier: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'past_due', 'canceled'],
      default: 'active', // 'active' for free tier, managed by logic for premium
    },
    // Store the customer ID from your payment provider (e.g., Stripe)
    paymentProviderCustomerId: {
      type: String,
    },
    // Store the subscription ID from your payment provider
    paymentProviderSubscriptionId: {
      type: String,
    },
    // The date when the current paid subscription period ends.
    currentPeriodEnd: {
      type: Date,
    },
  },
  // --- Family-wide Settings ---
  settings: {
    // Toggle for the chore rewards system
    rewardsSystemEnabled: {
        type: Boolean,
        default: false,
    },
  }
}, {
  // Automatically add createdAt and updatedAt timestamps
  timestamps: true,
});

// Pre-save hook to ensure the owner is also included in the members array
familySchema.pre('save', function(next) {
  if (this.isNew && !this.members.includes(this.owner)) {
    this.members.push(this.owner);
  }
  next();
});

const Family = mongoose.model('Family', familySchema);

export default Family;
