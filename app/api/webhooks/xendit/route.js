import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-callback-token');
    
    // Verify webhook signature (optional but recommended)
    if (process.env.XENDIT_WEBHOOK_TOKEN && signature !== process.env.XENDIT_WEBHOOK_TOKEN) {
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 401 }
      );
    }

    const data = JSON.parse(body);
    
    // Extract order ID from external_id
    const externalId = data.external_id;
    const orderId = externalId.replace('order_', '');

    // Find order in database
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    // Update order status based on Xendit status
    let newStatus = order.status;
    
    switch (data.status) {
      case 'PAID':
        newStatus = 'PAID';
        break;
      case 'EXPIRED':
      case 'FAILED':
        newStatus = 'CANCELLED';
        break;
      default:
        newStatus = 'PENDING';
    }

    // Update order in database
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        xenditStatus: data.status
      }
    });

    return NextResponse.json({ message: "Webhook processed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error processing Xendit webhook:", error);
    return NextResponse.json(
      { message: "Webhook processing failed" },
      { status: 500 }
    );
  }
} 