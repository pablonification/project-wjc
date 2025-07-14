import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import slugify from "slugify";

// GET: list all news ordered by createdAt desc
export async function GET() {
  try {
    const news = await prisma.berita.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(news, { status: 200 });
  } catch (error) {
    console.error("Error fetching berita:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: create a new news entry
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, category, content, imageUrl } = body;

    if (!title || !content) {
      return NextResponse.json(
        { message: "Title dan content wajib diisi" },
        { status: 400 }
      );
    }

    const slugBase = slugify(title, { lower: true, strict: true });
    let slug = slugBase;
    let counter = 1;
    while (await prisma.berita.findUnique({ where: { slug } })) {
      slug = `${slugBase}-${counter++}`;
    }

    const berita = await prisma.berita.create({
      data: {
        title,
        category,
        content,
        imageUrl,
        slug,
      },
    });

    return NextResponse.json(berita, { status: 201 });
  } catch (error) {
    console.error("Error creating berita:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
