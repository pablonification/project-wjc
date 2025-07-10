import mongoose, { Schema, model, models } from 'mongoose';
import slugify from 'slugify';
import { Berita } from '@/types';

const beritaSchema = new Schema<Berita>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Excerpt cannot be more than 500 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    publishDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
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
beritaSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// Indexes for better query performance
beritaSchema.index({ isPublished: 1, publishDate: -1 });
beritaSchema.index({ category: 1 });
beritaSchema.index({ tags: 1 });
beritaSchema.index({ author: 1 });
beritaSchema.index({ 
  title: 'text', 
  content: 'text', 
  excerpt: 'text' 
}, {
  weights: {
    title: 10,
    excerpt: 5,
    content: 1
  }
});

// Static methods
beritaSchema.statics.findPublished = function () {
  return this.find({ isPublished: true }).sort({ publishDate: -1 });
};

beritaSchema.statics.findByCategory = function (category: string) {
  return this.find({ category, isPublished: true }).sort({ publishDate: -1 });
};

beritaSchema.statics.findByTag = function (tag: string) {
  return this.find({ tags: tag, isPublished: true }).sort({ publishDate: -1 });
};

beritaSchema.statics.search = function (query: string) {
  return this.find(
    { 
      $text: { $search: query },
      isPublished: true 
    },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } });
};

export const BeritaModel = models.Berita || model<Berita>('Berita', beritaSchema);