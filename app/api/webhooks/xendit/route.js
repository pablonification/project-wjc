// app/api/webhooks/xendit/route.js

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('=== XENDIT WEBHOOK DITERIMA ===');
    console.log('Payload:', JSON.stringify(body, null, 2));

    const signature = request.headers.get('x-callback-token');
    const webhookSecret = process.env.XENDIT_WEBHOOK_TOKEN;

    // --- TAMBAHKAN LOG INI UNTUK DEBUGGING ---
    console.log(`Webhook Secret dari env: ${webhookSecret ? '*** DITEMUKAN ***' : '!!! TIDAK DITEMUKAN !!!'}`);
    
    if (!webhookSecret) {
      console.error('XENDIT_WEBHOOK_TOKEN tidak diatur di environment variables.');
      // Pesan error ini yang Anda lihat
      return NextResponse.json({ message: "Webhook secret not configured." }, { status: 500 });
    }

    if (signature !== webhookSecret) {
        console.error('Token webhook tidak valid.');
        return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
    
    console.log('Token webhook berhasil diverifikasi.');

    // ... sisa logika Anda ...

    // (Kode Anda selanjutnya sudah benar, tidak perlu diubah)
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
        console.log(`Webhook untuk status ${status} diterima, tidak ada tindakan.`);
        return NextResponse.json({ message: "Webhook diproses, tidak ada perubahan status." }, { status: 200 });
    }

    if (external_id.startsWith('order_')) {
      const orderId = external_id.replace('order_', '');
      console.log(`Mengupdate order merchandise ${orderId} ke status ${newStatus}`);
      await prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus, xenditStatus: status }
      });
    } else if (external_id.startsWith('activity-')) {
      console.log(`Mengupdate registrasi kegiatan dengan payment ID ${paymentId} ke status ${newStatus}`);
      await prisma.activityRegistration.updateMany({
        where: { paymentId: paymentId },
        data: { paymentStatus: newStatus }
      });
    } else {
       console.warn(`Webhook diterima untuk format external_id yang tidak dikenal: ${external_id}`);
    }

    return NextResponse.json({ message: "Webhook berhasil diproses" }, { status: 200 });

  } catch (error) {
    console.error("Error memproses webhook Xendit:", error);
    return NextResponse.json(
      { message: "Pemrosesan webhook gagal", error: error.message },
      { status: 500 }
    );
  }
}