import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { DokumentasiModel } from "@/models/Dokumentasi";
import { z } from "zod";
import { verifyJwt } from "@/lib/jwt";
import { consumeRateLimit } from "@/lib/rateLimiter";

const dokSchema = z.object({
  title: z.string(),
  year: z.number(),
  link: z.string().url(),
});

export async function GET() {
  await connectMongo();
  const docs = await DokumentasiModel.find().lean();
  return NextResponse.json(docs);
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
  const parse = dokSchema.safeParse(body);
  if (!parse.success) return NextResponse.json({ errors: parse.error.errors }, { status: 400 });

  await connectMongo();
  const doc = await DokumentasiModel.create(parse.data);
  return NextResponse.json(doc, { status: 201 });
}