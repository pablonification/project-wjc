import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { BeritaModel } from "@/models/Berita";
import { z } from "zod";
import { verifyJwt } from "@/lib/jwt";
import { consumeRateLimit } from "@/lib/rateLimiter";

const beritaSchema = z.object({
  category: z.string(),
  date: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  content: z.string(),
  coverImage: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const page = Number(url.searchParams.get("page") || 1);
  const limit = 9;
  await connectMongo();
  const total = await BeritaModel.countDocuments();
  const data = await BeritaModel.find()
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  return NextResponse.json({ data, total });
}

export async function POST(req: NextRequest) {
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
  const parse = beritaSchema.safeParse(body);
  if (!parse.success) return NextResponse.json({ errors: parse.error.errors }, { status: 400 });

  await connectMongo();
  const berita = await BeritaModel.create(parse.data);
  return NextResponse.json(berita, { status: 201 });
}