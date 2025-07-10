import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { KegiatanModel } from "@/models/Kegiatan";
import { verifyJwt } from "@/lib/jwt";
import { z } from "zod";
import { consumeRateLimit } from "@/lib/rateLimiter";

const kegiatanUpdateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  date: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(["Mendatang", "Sedang Berlangsung", "Selesai"]).optional(),
  attachments: z.array(z.string()).optional(),
});

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  await connectMongo();
  const kegiatan = await KegiatanModel.findOne({ slug: params.slug }).lean();
  if (!kegiatan) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(kegiatan);
}

export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  const ip = req.headers.get("x-real-ip") || req.ip || "anonymous";
  const allowed = await consumeRateLimit(ip as string);
  if (!allowed) return NextResponse.json({ message: "Too many requests" }, { status: 429 });

  const authHeader = req.headers.get("authorization");
  if (!authHeader) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  try {
    verifyJwt(authHeader.replace("Bearer ", ""));
  } catch {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  const body = await req.json();
  const parse = kegiatanUpdateSchema.safeParse(body);
  if (!parse.success) return NextResponse.json({ errors: parse.error.errors }, { status: 400 });

  await connectMongo();
  const updated = await KegiatanModel.findOneAndUpdate({ slug: params.slug }, parse.data, { new: true });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  try {
    verifyJwt(authHeader.replace("Bearer ", ""));
  } catch {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  await connectMongo();
  await KegiatanModel.deleteOne({ slug: params.slug });
  return NextResponse.json({ message: "Deleted" }, { status: 204 });
}