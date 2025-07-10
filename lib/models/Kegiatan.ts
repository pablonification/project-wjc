import mongoose, { Schema, model, models } from 'mongoose';
import slugify from 'slugify';
import { Kegiatan } from '@/types';

const kegiatanSchema = new Schema<Kegiatan>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    content: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (this: Kegiatan, value: Date) {
          return value >= this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Mendatang', 'Sedang Berlangsung', 'Selesai'],
      default: 'Mendatang',
    },
    registrationDeadline: {
      type: Date,
    },
    maxParticipants: {
      type: Number,
      min: [1, 'Max participants must be at least 1'],
    },
    currentParticipants: {
      type: Number,
      default: 0,
      min: [0, 'Current participants cannot be negative'],
    },
    image: {
      type: String,
    },
    category: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    datoId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create slug from title before saving
kegiatanSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// Update status based on dates
kegiatanSchema.pre('save', function (next) {
  const now = new Date();
  
  if (this.endDate < now) {
    this.status = 'Selesai';
  } else if (this.startDate <= now && this.endDate >= now) {
    this.status = 'Sedang Berlangsung';
  } else {
    this.status = 'Mendatang';
  }
  
  next();
});

// Indexes for better query performance
kegiatanSchema.index({ status: 1, startDate: -1 });
kegiatanSchema.index({ category: 1 });
kegiatanSchema.index({ isActive: 1 });

// Static methods
kegiatanSchema.statics.findActive = function () {
  return this.find({ isActive: true });
};

kegiatanSchema.statics.findByStatus = function (status: string) {
  return this.find({ status, isActive: true });
};

// Instance methods
kegiatanSchema.methods.canRegister = function () {
  const now = new Date();
  return (
    this.isActive &&
    this.status === 'Mendatang' &&
    (!this.registrationDeadline || this.registrationDeadline > now) &&
    (!this.maxParticipants || this.currentParticipants < this.maxParticipants)
  );
};

export const KegiatanModel = models.Kegiatan || model<Kegiatan>('Kegiatan', kegiatanSchema);