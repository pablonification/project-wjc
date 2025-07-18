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

// PATCH: update status and resi
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, resi } = body;
    const updateData = {};
    if (status) updateData.status = status;
    if (resi !== undefined) updateData.resi = resi;
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { message: "Gagal update pesanan" },
      { status: 500 }
    );
  }
} 