import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PATCH: update activity registration payment status
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { paymentStatus } = body;

    const allowed = ["PENDING", "PAID", "FAILED", "CANCELLED"];
    if (!paymentStatus || !allowed.includes(paymentStatus)) {
      return NextResponse.json({ message: "Status tidak valid" }, { status: 400 });
    }

    const updated = await prisma.activityRegistration.update({
      where: { id },
      data: { paymentStatus },
      include: {
        user: { select: { id: true, name: true, phoneNumber: true } },
        activity: { select: { id: true, title: true, slug: true, location: true, dateStart: true, imageUrl: true } },
      },
    });
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error updating activity registration:", error);
    return NextResponse.json({ message: "Gagal update pendaftaran" }, { status: 500 });
  }
}


