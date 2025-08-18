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

    // Generate 5-digit registration code and save
    async function generateUniqueRegistrationCode() {
      let attempt = 0;
      while (attempt < 5) {
        const code = String(Math.floor(10000 + Math.random() * 90000));
        const exists = await prisma.activityRegistration.findFirst({ where: { registrationCode: code } });
        if (!exists) return code;
        attempt += 1;
      }
      return String(Date.now()).slice(-5);
    }
    const registrationCode = await generateUniqueRegistrationCode();
    const savedRegistration = await prisma.activityRegistration.update({
      where: { id: registration.id },
      data: { registrationCode },
    });

    // Manual bank transfer: return registration and let client show instructions
    return NextResponse.json(
      { registration: savedRegistration, redirect: `${process.env.NEXT_PUBLIC_BASE_URL}/kegiatan/${slug}/payment/success` },
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
