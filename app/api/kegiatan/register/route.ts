import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { RegistrationModel } from "@/models/Registration";
import { KegiatanModel } from "@/models/Kegiatan";
import { z } from "zod";
import { consumeRateLimit } from "@/lib/rateLimiter";
import bcrypt from "bcryptjs";
import { sendConfirmationEmail } from "@/lib/sendEmail";

const registrationSchema = z.object({
  kegiatanSlug: z.string(),
  name: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(8),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-real-ip") || req.ip || "anonymous";
  const allowed = await consumeRateLimit(ip as string);
  if (!allowed) return NextResponse.json({ message: "Too many requests" }, { status: 429 });

  const body = await req.json();
  const parse = registrationSchema.safeParse(body);
  if (!parse.success) return NextResponse.json({ errors: parse.error.errors }, { status: 400 });

  await connectMongo();
  const kegiatan = await KegiatanModel.findOne({ slug: parse.data.kegiatanSlug });
  if (!kegiatan) return NextResponse.json({ message: "Invalid kegiatan" }, { status: 400 });

  const hash = await bcrypt.hash(parse.data.password, 10);
  const regDoc = await RegistrationModel.create({
    ...parse.data,
    passwordHash: hash,
  });

  // Send email (fire and forget)
  sendConfirmationEmail(parse.data.email, kegiatan.title).catch(console.error);

  return NextResponse.json({ message: "Registered" }, { status: 201 });
}