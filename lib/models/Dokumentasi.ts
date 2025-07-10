import mongoose, { Schema, model, models } from 'mongoose';
import { Dokumentasi } from '@/types';

const dokumentasiSchema = new Schema<Dokumentasi>(
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
    year: {
      type: Number,
      required: true,
      min: [1900, 'Year cannot be before 1900'],
      max: [new Date().getFullYear() + 10, 'Year cannot be too far in the future'],
    },
    type: {
      type: String,
      required: true,
      enum: ['document', 'video', 'image', 'link'],
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    fileSize: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    isPublic: {
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

// Indexes for better query performance
dokumentasiSchema.index({ year: -1 });
dokumentasiSchema.index({ type: 1 });
dokumentasiSchema.index({ category: 1 });
dokumentasiSchema.index({ isPublic: 1 });

// Static methods
dokumentasiSchema.statics.findPublic = function () {
  return this.find({ isPublic: true }).sort({ year: -1, createdAt: -1 });
};

dokumentasiSchema.statics.findByYear = function (year: number) {
  return this.find({ year, isPublic: true }).sort({ createdAt: -1 });
};

dokumentasiSchema.statics.findByType = function (type: string) {
  return this.find({ type, isPublic: true }).sort({ year: -1, createdAt: -1 });
};

dokumentasiSchema.statics.getYears = function () {
  return this.distinct('year', { isPublic: true }).sort(-1);
};

export const DokumentasiModel = models.Dokumentasi || model<Dokumentasi>('Dokumentasi', dokumentasiSchema);