import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET all orders (admin only)
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      // Mengambil semua pesanan, tidak hanya yang lunas
      include: {
        merchandise: true,
        user: {
          select: { id: true, name: true, phoneNumber: true }
        },
        address: true
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data pesanan" },
      { status: 500 }
    );
  }
}