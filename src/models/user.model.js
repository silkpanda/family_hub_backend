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
  // --- CORRECTED ---
  // The accessToken is no longer required. A placeholder user or an invited user
  // will not have an access token until they log in for the first time.
  accessToken: {
    type: String,
  },
  refreshToken: {
    type: String,
  },
  familyId: {
    type: Schema.Types.ObjectId,
    ref: 'Family',
  },
  onboardingComplete: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true 
});

const User = mongoose.model('User', userSchema);

export default User;
