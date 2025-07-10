import { Schema, model, models } from "mongoose";

export interface IRegistration {
  kegiatanSlug: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const RegistrationSchema = new Schema<IRegistration>(
  {
    kegiatanSlug: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export const RegistrationModel =
  (models.Registration as ReturnType<typeof model<IRegistration>>) ||
  model<IRegistration>("Registration", RegistrationSchema);