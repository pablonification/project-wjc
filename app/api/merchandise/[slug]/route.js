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

export async function PUT(request, { params }) {
  try {
    const { slug } = params;
    const body = await request.json();
    const { name, price, description, imageUrls } = body;

    if (!name || !price) {
      return NextResponse.json(
        { message: "Nama dan harga wajib diisi" },
        { status: 400 }
      );
    }

    const updatedItem = await prisma.merchandise.update({
      where: { slug },
      data: {
        name,
        price: parseInt(price, 10),
        description,
        imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
      },
    });

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    console.error(`Error updating product with slug ${params.slug}:`, error);
     if (error.code === 'P2025') {
        return NextResponse.json(
            { message: "Produk yang akan diupdate tidak ditemukan." },
            { status: 404 }
        );
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
    try {
        const { slug } = params;

        await prisma.merchandise.delete({
            where: { slug },
        });

        return NextResponse.json(
            { message: "Produk berhasil dihapus" },
            { status: 200 }
        );
    } catch (error) {
        console.error(`Error deleting product with slug ${params.slug}:`, error);
        if (error.code === 'P2025') {
            return NextResponse.json(
                { message: "Produk yang akan dihapus tidak ditemukan." },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { message: "Gagal menghapus produk" },
            { status: 500 }
        );
    }
}
