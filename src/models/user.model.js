import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
  googleId: {
    type: String,
    required: true,
    unique: true,
    index: true, // Index for faster lookups
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
  // Tokens for Google API access (e.g., Calendar Sync)
  // These are sensitive and should be handled with care.
  accessToken: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
    // A refresh token is crucial for maintaining long-term, offline access 
    // to Google APIs like Calendar without requiring the user to log in again.
    // It's typically only provided by Google on the very first authorization consent.
  },
  familyId: {
    type: Schema.Types.ObjectId,
    ref: 'Family',
    // This is not required initially, as a user might create a family 
    // or be invited to one after their account is created.
  },
  // User-specific color for calendar events, lists, etc.
  // Can be assigned by the family organizer.
  color: {
    type: String,
    trim: true,
  },
}, {
  // Automatically adds createdAt and updatedAt timestamps
  timestamps: true 
});

const User = mongoose.model('User', userSchema);

export default User;
