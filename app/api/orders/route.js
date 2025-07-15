import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: list all orders for user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
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
        address: true
      },
      orderBy: { createdAt: "desc" }
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

// POST: create new order with Xendit payment link
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
      shippingCost
    } = body;

    // Validasi data wajib
    if (!userId || !merchandiseId || !quantity || !shippingMethod) {
      return NextResponse.json(
        { message: "Data pesanan tidak lengkap" },
        { status: 400 }
      );
    }

    // Validasi jika shipping method adalah DELIVERY, addressId wajib
    if (shippingMethod === 'DELIVERY' && !addressId) {
      return NextResponse.json(
        { message: "Alamat pengiriman diperlukan untuk metode delivery" },
        { status: 400 }
      );
    }

    // Ambil data merchandise
    const merchandise = await prisma.merchandise.findUnique({
      where: { id: merchandiseId }
    });

    if (!merchandise) {
      return NextResponse.json(
        { message: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    // Hitung total
    const unitPrice = merchandise.price;
    const subtotal = unitPrice * quantity;
    const finalShippingCost = shippingMethod === 'PICKUP' ? 0 : (shippingCost || 0);
    const total = subtotal + finalShippingCost;

    // Ambil data user untuk customer info
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // Buat order di database
    const order = await prisma.order.create({
      data: {
        userId,
        merchandiseId,
        addressId: shippingMethod === 'DELIVERY' ? addressId : null,
        quantity,
        unitPrice,
        subtotal,
        shippingCost: finalShippingCost,
        total,
        shippingMethod,
        courierService: shippingMethod === 'DELIVERY' ? courierService : null,
        status: 'PENDING'
      }
    });

    // Buat payment link dengan Xendit
    const xenditPayload = {
      external_id: `order_${order.id}`,
      amount: total,
      description: `Pembelian ${merchandise.name} x${quantity}`,
      invoice_duration: 86400, // 24 jam
      customer: {
        given_names: user.name,
        mobile_number: user.phoneNumber
      },
      customer_notification_preference: {
        invoice_created: ["email", "sms"],
        invoice_reminder: ["email", "sms"],
        invoice_paid: ["email", "sms"]
      },
      success_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/orders/${order.id}/success`,
      failure_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/orders/${order.id}/failed`
    };

    const xenditResponse = await fetch('https://api.xendit.co/v2/invoices', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(process.env.XENDIT_SECRET_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(xenditPayload)
    });

    if (!xenditResponse.ok) {
      throw new Error('Failed to create Xendit payment link');
    }

    const xenditData = await xenditResponse.json();

    // Update order dengan data Xendit
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        xenditPaymentId: xenditData.id,
        xenditPaymentUrl: xenditData.invoice_url,
        xenditStatus: xenditData.status
      },
      include: {
        merchandise: true,
        address: true
      }
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