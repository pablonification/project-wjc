import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: fetch a single berita by slug
export async function GET(request, { params }) {
  try {
    const { slug } = params;
    if (!slug) {
      return NextResponse.json({ message: "Slug required" }, { status: 400 });
    }

    const berita = await prisma.berita.findUnique({ where: { slug } });
    if (!berita) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(berita, { status: 200 });
  } catch (error) {
    console.error("Error fetching berita:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// PUT: update berita by slug
export async function PUT(request, { params }) {
  try {
    const { slug } = params;
    const body = await request.json();
    const { title, category, content, imageUrl } = body;

    if (!title || !content) {
      return NextResponse.json(
        { message: "Title dan content wajib diisi" },
        { status: 400 }
      );
    }

    const updatedBerita = await prisma.berita.update({
      where: { slug },
      data: {
        title,
        category,
        content,
        imageUrl,
      },
    });

    return NextResponse.json(updatedBerita, { status: 200 });
  } catch (error) {
    console.error("Error updating berita:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "Berita yang akan diupdate tidak ditemukan." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Gagal mengupdate berita." },
      { status: 500 }
    );
  }
}

// DELETE: remove berita by slug
export async function DELETE(request, { params }) {
  try {
    const { slug } = params;

    await prisma.berita.delete({
      where: { slug },
    });

    return NextResponse.json(
      { message: "Berita berhasil dihapus" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting berita:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "Berita yang akan dihapus tidak ditemukan." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Gagal menghapus berita" },
      { status: 500 }
    );
  }
}
