import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request, { params }) {
  try {
    const { slug } = params;
    const body = await request.json();
    const {
      userId,
      tshirtSize,
      needAccommodation,
      roomType,
      tshirtPrice,
      accommodationPrice,
      totalPrice
    } = body;

    if (!userId || !tshirtSize || totalPrice === undefined) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    const activity = await prisma.kegiatan.findUnique({ where: { slug } });
    if (!activity) {
      return NextResponse.json({ message: "Kegiatan tidak ditemukan" }, { status: 404 });
    }
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    const existingRegistration = await prisma.activityRegistration.findFirst({
      where: { userId, activityId: activity.id }
    });
    if (existingRegistration) {
      return NextResponse.json({ message: "Anda sudah terdaftar untuk kegiatan ini" }, { status: 400 });
    }

    const xenditPayload = {
      external_id: `activity-${activity.id}-${userId}-${Date.now()}`,
      amount: totalPrice,
      description: `Pendaftaran ${activity.title}`,
      invoice_duration: 86400,
      customer: {
        given_names: user.name,
        email: "participant@example.com", // Ganti jika Anda menyimpan email
        mobile_number: user.phoneNumber
      },
      customer_notification_preference: {
        invoice_created: ["email"],
        invoice_reminder: ["email"],
        invoice_paid: ["email"]
      },
      success_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/kegiatan/${slug}/payment/success`,
      failure_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/kegiatan/${slug}/payment/failed`,
      notification_urls: [process.env.XENDIT_CALLBACK_URL] // Mengirim URL Webhook secara dinamis
    };

    const xenditResponse = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(process.env.XENDIT_SECRET_KEY + ":").toString("base64")}`
      },
      body: JSON.stringify(xenditPayload)
    });

    if (!xenditResponse.ok) {
      const errorData = await xenditResponse.json();
      console.error("Xendit error:", errorData);
      return NextResponse.json({ message: "Gagal membuat link pembayaran" }, { status: 500 });
    }

    const xenditData = await xenditResponse.json();

    const registration = await prisma.activityRegistration.create({
      data: {
        userId,
        activityId: activity.id,
        tshirtSize,
        needAccommodation: needAccommodation || false,
        roomType: needAccommodation ? roomType : null,
        tshirtPrice,
        accommodationPrice: accommodationPrice || 0,
        totalPrice,
        paymentStatus: "PENDING",
        paymentId: xenditData.id,
        paymentUrl: xenditData.invoice_url
      }
    });

    return NextResponse.json({
      registration,
      paymentUrl: xenditData.invoice_url,
      paymentId: xenditData.id
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating activity registration:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const kegiatan = await prisma.kegiatan.findMany({
      orderBy: {
        dateStart: "desc", // Mengurutkan dari yang terbaru
      },
    });
    return NextResponse.json(kegiatan, { status: 200 });
  } catch (error) {
    console.error("Error fetching kegiatan:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}