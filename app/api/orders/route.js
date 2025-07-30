import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Midtrans from "midtrans-client";

// Inisialisasi Midtrans Snap
let snap = new Midtrans.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

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

// POST: create new order with Midtrans payment link
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
      },
    });

    let parameter = {
      transaction_details: {
        order_id: `order-${order.id}`,
        gross_amount: total,
      },
      customer_details: {
        first_name: user.name,
        phone: user.phoneNumber,
      },
      item_details: [
        {
          id: merchandise.id,
          price: unitPrice,
          quantity: quantity,
          name: merchandise.name,
        },
      ],
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_BASE_URL}/orders/${order.id}/success`,
        error: `${process.env.NEXT_PUBLIC_BASE_URL}/orders/${order.id}/failed`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/orders/${order.id}/pending`,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        midtransToken: transaction.token,
        midtransRedirectUrl: transaction.redirect_url,
      },
      include: {
        merchandise: true,
        address: true,
      },
    });

    return NextResponse.json(updatedOrder, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { message: "Gagal membuat pesanan" },
      { status: 500 }
    );
  }
}
