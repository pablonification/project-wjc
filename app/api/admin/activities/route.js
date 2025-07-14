import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET all activities
export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      orderBy: {
        dateStart: "desc",
      },
    });
    return NextResponse.json({ activities }, { status: 200 });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data kegiatan." },
      { status: 500 }
    );
  }
}

// POST create activity
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, description, dateStart, dateEnd, location, status } = body;

    if (
      !title ||
      !description ||
      !dateStart ||
      !dateEnd ||
      !location ||
      !status
    ) {
      return NextResponse.json(
        { message: "Data tidak lengkap." },
        { status: 400 }
      );
    }

    const activity = await prisma.activity.create({
      data: {
        title,
        description,
        dateStart: new Date(dateStart),
        dateEnd: new Date(dateEnd),
        location,
        status,
      },
    });

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json(
      { message: "Gagal membuat kegiatan." },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { message: "ID tidak ditemukan." },
        { status: 400 }
      );
    }

    await prisma.activity.delete({ where: { id } });
    return NextResponse.json(
      { message: "Kegiatan berhasil dihapus." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting activity:", error);
    return NextResponse.json(
      { message: "Gagal menghapus kegiatan." },
      { status: 500 }
    );
  }
}
