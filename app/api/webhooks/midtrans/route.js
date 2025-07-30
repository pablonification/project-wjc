// app/api/webhooks/midtrans/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Midtrans from "midtrans-client";

// Inisialisasi Midtrans Core API
let coreApi = new Midtrans.CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

export async function POST(request) {
  try {
    const notificationJson = await request.json();
    console.log("=== MIDTRANS WEBHOOK DITERIMA ===");
    console.log("Payload:", JSON.stringify(notificationJson, null, 2));

    // Verifikasi notifikasi dari Midtrans
    const statusResponse = await coreApi.transaction.notification(
      notificationJson
    );
    let orderId = statusResponse.order_id;
    let transactionStatus = statusResponse.transaction_status;
    let fraudStatus = statusResponse.fraud_status;

    console.log(
      `Verifikasi berhasil. Order ID: ${orderId}, Status Transaksi: ${transactionStatus}, Status Fraud: ${fraudStatus}`
    );

    let newPaymentStatus;

    if (transactionStatus == "capture") {
      if (fraudStatus == "accept") {
        newPaymentStatus = "PAID";
      }
    } else if (transactionStatus == "settlement") {
      newPaymentStatus = "PAID";
    } else if (
      transactionStatus == "cancel" ||
      transactionStatus == "deny" ||
      transactionStatus == "expire"
    ) {
      newPaymentStatus = "CANCELLED";
    } else if (transactionStatus == "pending") {
      newPaymentStatus = "PENDING";
    }

    if (newPaymentStatus) {
      console.log(`Status baru terdeteksi: ${newPaymentStatus}`);
      if (orderId.startsWith("order-")) {
        const dbOrderId = orderId.replace("order-", "");
        console.log(`Mencari pesanan merchandise dengan ID: ${dbOrderId}`);
        await prisma.order.update({
          where: { id: dbOrderId },
          data: { status: newPaymentStatus, midtransStatus: transactionStatus },
        });
        console.log(
          `SUCCESS: Status pesanan ${dbOrderId} berhasil diupdate ke ${newPaymentStatus}`
        );
      } else if (orderId.startsWith("activity-")) {
        const registrationId = orderId.replace("activity-", "");
        console.log(
          `Mencari pendaftaran kegiatan dengan ID: ${registrationId}`
        );
        await prisma.activityRegistration.update({
          where: { id: registrationId },
          data: { paymentStatus: newPaymentStatus },
        });
        console.log(
          `SUCCESS: Status pendaftaran ${registrationId} berhasil diupdate ke ${newPaymentStatus}`
        );
      } else {
        console.warn(`Format Order ID tidak dikenal: ${orderId}`);
      }
    } else {
      console.log(
        "Tidak ada perubahan status yang perlu diupdate ke database."
      );
    }

    return NextResponse.json(
      { message: "Webhook berhasil diproses" },
      { status: 200 }
    );
  } catch (error) {
    console.error("ERROR: Gagal memproses webhook Midtrans:", error);
    return NextResponse.json(
      { message: "Pemrosesan webhook gagal", error: error.message },
      { status: 500 }
    );
  }
}
