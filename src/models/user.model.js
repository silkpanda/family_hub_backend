import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
  googleId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  displayName: {
    type: String,
    required: [true, 'Display name is required.'],
  },
  email: {
    type: String,
    required: [true, 'Email is required.'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  profilePhotoUrl: {
    type: String,
  },
  accessToken: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
  },
  // This link is now established during the new onboarding flow.
  // It is no longer required upon initial user creation.
  familyId: {
    type: Schema.Types.ObjectId,
    ref: 'Family',
  },
  // --- NEW ---
  // This flag tracks if the user has completed the initial setup process
  // (i.e., created or joined a family).
  onboardingComplete: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true 
});

// Note: The 'color' field has been moved to the familyMemberSchema
// inside family.model.js, as the color is specific to a user's role
// within a particular family.

const User = mongoose.model('User', userSchema);

export default User;
