import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('=== XENDIT WEBHOOK RECEIVED ===');
    console.log('Payload:', JSON.stringify(body, null, 2));

    const signature = request.headers.get('x-callback-token');
    const webhookSecret = process.env.XENDIT_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('XENDIT_WEBHOOK_SECRET is not set in environment variables.');
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ message: "Webhook secret not configured." }, { status: 500 });
      }
    } else {
        if (signature !== webhookSecret) {
            console.error('Invalid webhook token.');
            console.log('Received:', signature);
            console.log('Expected:', webhookSecret);
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }
        console.log('Webhook token verified successfully.');
    }

    const { external_id, status, id: paymentId } = body;
    let newStatus;

    switch (status) {
      case 'PAID':
        newStatus = 'PAID';
        break;
      case 'EXPIRED':
      case 'FAILED':
        newStatus = 'CANCELLED';
        break;
      default:
        console.log(`Webhook for status ${status} received, no action taken.`);
        return NextResponse.json({ message: "Webhook processed, no status change required." }, { status: 200 });
    }

    if (external_id.startsWith('order_')) {
      const orderId = external_id.replace('order_', '');
      console.log(`Updating merchandise order ${orderId} to status ${newStatus}`);
      await prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus, xenditStatus: status }
      });
    } else if (external_id.startsWith('activity-')) {
      console.log(`Updating activity registration with payment ID ${paymentId} to status ${newStatus}`);
      await prisma.activityRegistration.updateMany({
        where: { paymentId: paymentId },
        data: { paymentStatus: newStatus }
      });
    } else {
       console.warn(`Webhook received for unknown external_id format: ${external_id}`);
    }

    return NextResponse.json({ message: "Webhook processed successfully" }, { status: 200 });

  } catch (error) {
    console.error("Error processing Xendit webhook:", error);
    return NextResponse.json(
      { message: "Webhook processing failed", error: error.message },
      { status: 500 }
    );
  }
}