import mongoose from 'mongoose';

const registrationOtpSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password_hash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['CITIZEN', 'AUTHORITY', 'EMERGENCY', 'ADMIN'],
    },
    department_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    otp: {
      type: String,
      required: true,
    },
    otp_expiry: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

registrationOtpSchema.index({ otp_expiry: 1 }, { expireAfterSeconds: 0 });

export const RegistrationOtp = mongoose.model('RegistrationOtp', registrationOtpSchema);
