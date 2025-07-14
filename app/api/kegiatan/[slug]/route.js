import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { slug } = params;
    if (!slug)
      return NextResponse.json({ message: "Slug required" }, { status: 400 });
    const data = await prisma.kegiatan.findUnique({ where: { slug } });
    if (!data)
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
