import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: list all orders for user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "User ID diperlukan" },
        { status: 400 }
      );
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        merchandise: true,
        address: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data pesanan" },
      { status: 500 }
    );
  }
}

// POST: create new order (manual bank transfer)
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId,
      merchandiseId,
      addressId,
      quantity,
      shippingMethod,
      courierService,
      shippingCost,
    } = body;

    if (!userId || !merchandiseId || !quantity || !shippingMethod) {
      return NextResponse.json(
        { message: "Data pesanan tidak lengkap" },
        { status: 400 }
      );
    }

    if (shippingMethod === "DELIVERY" && !addressId) {
      return NextResponse.json(
        { message: "Alamat pengiriman diperlukan untuk metode delivery" },
        { status: 400 }
      );
    }

    const merchandise = await prisma.merchandise.findUnique({
      where: { id: merchandiseId },
    });
    if (!merchandise) {
      return NextResponse.json(
        { message: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    const unitPrice = merchandise.price;
    const subtotal = unitPrice * quantity;
    const finalShippingCost =
      shippingMethod === "PICKUP" ? 0 : shippingCost || 0;
    const total = subtotal + finalShippingCost;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // Generate a 5-digit order code and avoid rare collisions
    async function generateUniqueOrderCode() {
      let attempt = 0;
      while (attempt < 5) {
        const code = String(Math.floor(10000 + Math.random() * 90000));
        const exists = await prisma.order.findFirst({ where: { orderCode: code } });
        if (!exists) return code;
        attempt += 1;
      }
      return String(Date.now()).slice(-5);
    }

    const orderCode = await generateUniqueOrderCode();

    const order = await prisma.order.create({
      data: {
        userId,
        merchandiseId,
        addressId: shippingMethod === "DELIVERY" ? addressId : null,
        quantity,
        unitPrice,
        subtotal,
        shippingCost: finalShippingCost,
        total,
        shippingMethod,
        courierService: shippingMethod === "DELIVERY" ? courierService : null,
        status: "PENDING",
        orderCode,
      },
      include: {
        merchandise: true,
        address: true,
      },
    });

    // For manual transfer, immediately return the created order
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { message: "Gagal membuat pesanan" },
      { status: 500 }
    );
  }
}
