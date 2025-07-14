import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import slugify from "slugify";

// GET: list all activities ordered by dateStart desc
export async function GET() {
  try {
    const activities = await prisma.kegiatan.findMany({
      orderBy: { dateStart: "desc" },
    });
    return NextResponse.json(activities, { status: 200 });
  } catch (error) {
    console.error("Error fetching kegiatan:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: create a new activity
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      dateStart,
      dateEnd,
      location,
      status,
      imageUrl,
    } = body;

    if (!title || !description || !dateStart || !location) {
      return NextResponse.json(
        { message: "Field wajib belum lengkap" },
        { status: 400 }
      );
    }

    const slugBase = slugify(title, { lower: true, strict: true });
    let slug = slugBase;
    let counter = 1;
    while (await prisma.kegiatan.findUnique({ where: { slug } })) {
      slug = `${slugBase}-${counter++}`;
    }

    const activity = await prisma.kegiatan.create({
      data: {
        title,
        description,
        dateStart: new Date(dateStart),
        dateEnd: dateEnd ? new Date(dateEnd) : undefined,
        location,
        status,
        imageUrl,
        slug,
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("Error creating kegiatan:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
