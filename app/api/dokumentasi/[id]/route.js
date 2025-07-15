import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: get one document based on id
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const doc = await prisma.document.findUnique({
      where: {
        id: id,
      },
    });

    if (!doc) {
      return NextResponse.json({ message: "Dokumen tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json(doc, { status: 200 });
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data dokumen." },
      { status: 500 }
    );
  }
}

// PUT: update one document based on id
export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const body = await request.json();
        const { name, url } = body;

        if (!name || !url) {
            return NextResponse.json(
                { message: "Nama dan URL wajib diisi." },
                { status: 400 }
            );
        }

        const updatedDoc = await prisma.document.update({
            where: {
                id: id,
            },
            data: {
                name,
                url,
            },
        });

        return NextResponse.json(updatedDoc, { status: 200 });
    } catch (error) {
        console.error("Error updating document:", error);
        if (error.code === 'P2025') {
            return NextResponse.json(
                { message: "Dokumen yang akan diupdate tidak ditemukan." },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { message: "Gagal mengupdate dokumen." },
            { status: 500 }
        );
    }
}

// DELETE: delete one document based on id
export async function DELETE(request, { params }) {
    try {
        const { id } = params;

        await prisma.document.delete({
            where: { id },
        });

        return NextResponse.json(
            { message: "Dokumen berhasil dihapus" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting document:", error);
        if (error.code === 'P2025') {
            return NextResponse.json(
                { message: "Dokumen yang akan dihapus tidak ditemukan." },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { message: "Gagal menghapus dokumen" },
            { status: 500 }
        );
    }
} 