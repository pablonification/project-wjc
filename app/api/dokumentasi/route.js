import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const docs = await prisma.document.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(docs, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { name, url } = await request.json();
    if (!name || !url) {
      return NextResponse.json(
        { message: "Nama dan URL wajib" },
        { status: 400 }
      );
    }
    const doc = await prisma.document.create({ data: { name, url } });
    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
