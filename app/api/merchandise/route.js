import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import slugify from "slugify";

// GET: list all merchandise items
export async function GET() {
  try {
    const merchandise = await prisma.merchandise.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(merchandise, { status: 200 });
  } catch (error) {
    console.error("Error fetching merchandise:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: create a new merchandise item
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, price, category, description, imageUrls } = body;

    if (!name || !price || !category) {
      return NextResponse.json(
        { message: "Nama, harga, dan kategori wajib diisi" },
        { status: 400 }
      );
    }

    const slugBase = slugify(name, { lower: true, strict: true });
    let slug = slugBase;
    let counter = 1;
    while (await prisma.merchandise.findUnique({ where: { slug } })) {
      slug = `${slugBase}-${counter++}`;
    }

    const item = await prisma.merchandise.create({
      data: {
        name,
        price: parseInt(price, 10),
        category,
        description,
        imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
        slug,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating merchandise:", error);
    // Handle potential duplicate slug error
    if (error.code === "P2002" && error.meta?.target?.includes("slug")) {
      return NextResponse.json(
        { message: "Produk dengan nama ini sudah ada." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
