import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    if (!slug)
      return NextResponse.json({ message: "Slug required" }, { status: 400 });
    const berita = await prisma.berita.findUnique({ where: { slug } });
    if (!berita)
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json(berita, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
