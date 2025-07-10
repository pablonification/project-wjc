import { Schema, model, models } from "mongoose";

export interface IDokumentasi {
  title: string;
  year: number;
  link: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const DokumentasiSchema = new Schema<IDokumentasi>(
  {
    title: { type: String, required: true },
    year: { type: Number, required: true },
    link: { type: String, required: true },
  },
  { timestamps: true }
);

export const DokumentasiModel =
  (models.Dokumentasi as ReturnType<typeof model<IDokumentasi>>) ||
  model<IDokumentasi>("Dokumentasi", DokumentasiSchema);