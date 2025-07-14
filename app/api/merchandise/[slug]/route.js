import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { message: "Slug produk diperlukan" },
        { status: 400 }
      );
    }

    const product = await prisma.merchandise.findUnique({
      where: { slug },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error(`Error fetching product with slug ${params.slug}:`, error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
