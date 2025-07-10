import mongoose, { Schema, model, models } from 'mongoose';
import { Registration } from '@/types';

const registrationSchema = new Schema<Registration>(
  {
    kegiatanId: {
      type: String,
      required: true,
      ref: 'Kegiatan',
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (email: string) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
        },
        message: 'Please enter a valid email address',
      },
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    accessCode: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate registrations
registrationSchema.index({ kegiatanId: 1, email: 1 }, { unique: true });

// Indexes for better query performance
registrationSchema.index({ kegiatanId: 1, status: 1 });
registrationSchema.index({ email: 1 });
registrationSchema.index({ registrationDate: -1 });

// Static methods
registrationSchema.statics.findByKegiatan = function (kegiatanId: string) {
  return this.find({ kegiatanId }).sort({ registrationDate: -1 });
};

registrationSchema.statics.findConfirmed = function (kegiatanId: string) {
  return this.find({ kegiatanId, status: 'confirmed' });
};

registrationSchema.statics.countByKegiatan = function (kegiatanId: string) {
  return this.countDocuments({ kegiatanId, status: 'confirmed' });
};

// Instance methods
registrationSchema.methods.confirm = function () {
  this.status = 'confirmed';
  return this.save();
};

registrationSchema.methods.cancel = function () {
  this.status = 'cancelled';
  return this.save();
};

export const RegistrationModel = models.Registration || model<Registration>('Registration', registrationSchema);