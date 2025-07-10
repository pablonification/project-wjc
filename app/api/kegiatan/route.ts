import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { KegiatanModel } from "@/models/Kegiatan";
import { z } from "zod";
import { verifyJwt } from "@/lib/jwt";
import { consumeRateLimit } from "@/lib/rateLimiter";

const kegiatanSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.string(),
  location: z.string(),
  status: z.enum(["Mendatang", "Sedang Berlangsung", "Selesai"]),
  slug: z.string(),
  attachments: z.array(z.string()).optional(),
});

export async function GET() {
  await connectMongo();
  const kegiatan = await KegiatanModel.find().lean();
  return NextResponse.json(kegiatan);
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-real-ip") || req.ip || "anonymous";
  const allowed = await consumeRateLimit(ip as string);
  if (!allowed) {
    return NextResponse.json({ message: "Too many requests" }, { status: 429 });
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    verifyJwt(authHeader.replace("Bearer ", ""));
  } catch {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  const body = await req.json();
  const parse = kegiatanSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ errors: parse.error.errors }, { status: 400 });
  }

  await connectMongo();
  const data = await KegiatanModel.create(parse.data);
  return NextResponse.json(data, { status: 201 });
}