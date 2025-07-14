import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: list all news ordered by date desc
export async function GET() {
  try {
    const news = await prisma.news.findMany({
      orderBy: {
        date: "desc",
      },
    });
    return NextResponse.json({ news }, { status: 200 });
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data berita." },
      { status: 500 }
    );
  }
}

// POST: create news
export async function POST(request) {
  try {
    const body = await request.json();
    const { category, date, title, description, content, imageUrl } = body;

    if (!category || !date || !title || !description) {
      return NextResponse.json(
        { message: "Data tidak lengkap." },
        { status: 400 }
      );
    }

    const news = await prisma.news.create({
      data: {
        category,
        date: new Date(date),
        title,
        description,
        content: content || "",
        imageUrl: imageUrl || "",
      },
    });

    return NextResponse.json({ news }, { status: 201 });
  } catch (error) {
    console.error("Error creating news:", error);
    return NextResponse.json(
      { message: "Gagal membuat berita." },
      { status: 500 }
    );
  }
}

// DELETE: delete based on id JSON {id}
export async function DELETE(request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { message: "ID tidak ditemukan." },
        { status: 400 }
      );
    }

    await prisma.news.delete({ where: { id } });
    return NextResponse.json(
      { message: "Berita berhasil dihapus." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting news:", error);
    return NextResponse.json(
      { message: "Gagal menghapus berita." },
      { status: 500 }
    );
  }
}
