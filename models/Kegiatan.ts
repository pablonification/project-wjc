import { Schema, model, models } from "mongoose";

export interface IKegiatan {
  title: string;
  description: string;
  date: string; // ISO date range or plain string per design
  location: string;
  status: "Mendatang" | "Sedang Berlangsung" | "Selesai";
  slug: string;
  attachments?: string[]; // URLs
  createdAt?: Date;
  updatedAt?: Date;
}

const KegiatanSchema = new Schema<IKegiatan>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true },
    location: { type: String, required: true },
    status: { type: String, enum: ["Mendatang", "Sedang Berlangsung", "Selesai"], required: true },
    slug: { type: String, unique: true, required: true },
    attachments: [{ type: String }],
  },
  { timestamps: true }
);

export const KegiatanModel =
  (models.Kegiatan as ReturnType<typeof model<IKegiatan>>) || model<IKegiatan>("Kegiatan", KegiatanSchema);