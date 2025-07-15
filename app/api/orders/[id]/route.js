import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: get single order by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        merchandise: true,
        address: true,
        user: {
          select: {
            name: true,
            phoneNumber: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { message: "Pesanan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data pesanan" },
      { status: 500 }
    );
  }
} 