import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Midtrans from "midtrans-client";

// Inisialisasi Midtrans Snap
let snap = new Midtrans.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

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
      totalPrice,
    } = body;

    // Validate required fields
    if (
      !userId ||
      !tshirtSize ||
      tshirtPrice === undefined ||
      totalPrice === undefined
    ) {
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    // Get activity by slug
    const activity = await prisma.kegiatan.findUnique({
      where: { slug },
    });

    if (!activity) {
      return NextResponse.json(
        { message: "Kegiatan tidak ditemukan" },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if user already registered for this activity
    const existingRegistration = await prisma.activityRegistration.findFirst({
      where: {
        userId,
        activityId: activity.id,
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { message: "Anda sudah terdaftar untuk kegiatan ini" },
        { status: 400 }
      );
    }

    // Create registration record first to get an ID
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
      },
    });

    // Create Midtrans payment link
    let parameter = {
      transaction_details: {
        order_id: `activity-${registration.id}`,
        gross_amount: totalPrice,
      },
      customer_details: {
        first_name: user.name,
        phone: user.phoneNumber,
      },
      item_details: [
        {
          id: activity.id,
          price: totalPrice,
          quantity: 1,
          name: `Pendaftaran ${activity.title}`,
        },
      ],
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_BASE_URL}/kegiatan/${slug}/payment/success`,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    // Update registration with Midtrans info
    const updatedRegistration = await prisma.activityRegistration.update({
      where: { id: registration.id },
      data: {
        midtransToken: transaction.token,
        midtransRedirectUrl: transaction.redirect_url,
      },
    });

    return NextResponse.json(
      {
        registration: updatedRegistration,
        paymentUrl: transaction.redirect_url, // Kirim URL redirect
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating activity registration:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
