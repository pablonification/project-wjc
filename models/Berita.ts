import { Schema, model, models } from "mongoose";

export interface IBerita {
  category: string;
  date: string;
  title: string;
  slug: string;
  description: string;
  content: string; // HTML or markdown
  coverImage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const BeritaSchema = new Schema<IBerita>(
  {
    category: { type: String, required: true },
    date: { type: String, required: true },
    title: { type: String, required: true },
    slug: { type: String, unique: true, required: true },
    description: { type: String, required: true },
    content: { type: String, required: true },
    coverImage: { type: String },
  },
  { timestamps: true }
);

export const BeritaModel =
  (models.Berita as ReturnType<typeof model<IBerita>>) || model<IBerita>("Berita", BeritaSchema);