import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import slugify from "slugify";

// GET all activities
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

// POST: Create a new activity
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
      attachmentUrls,
      accommodationName,
      accommodationPriceSharing,
      accommodationPriceSingle,
      registrationFee,
      tshirtPriceS,
      tshirtPriceM,
      tshirtPriceL,
      tshirtPriceXL,
      tshirtPriceXXL,
      tshirtPriceXXXL,
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

    const newKegiatan = await prisma.kegiatan.create({
      data: {
        title,
        slug,
        description,
        dateStart: new Date(dateStart),
        dateEnd: dateEnd ? new Date(dateEnd) : null,
        location,
        status,
        imageUrl,
        attachmentUrls: Array.isArray(attachmentUrls) ? attachmentUrls : [],
        registrationFee: registrationFee ? parseInt(registrationFee) : 0,
        accommodationName: accommodationName || null,
        accommodationPriceSharing: accommodationPriceSharing ? parseInt(accommodationPriceSharing) : null,
        accommodationPriceSingle: accommodationPriceSingle ? parseInt(accommodationPriceSingle) : null,
        tshirtPriceS: tshirtPriceS ? parseInt(tshirtPriceS) : null,
        tshirtPriceM: tshirtPriceM ? parseInt(tshirtPriceM) : null,
        tshirtPriceL: tshirtPriceL ? parseInt(tshirtPriceL) : null,
        tshirtPriceXL: tshirtPriceXL ? parseInt(tshirtPriceXL) : null,
        tshirtPriceXXL: tshirtPriceXXL ? parseInt(tshirtPriceXXL) : null,
        tshirtPriceXXXL: tshirtPriceXXXL ? parseInt(tshirtPriceXXXL) : null,
      },
    });

    return NextResponse.json(newKegiatan, { status: 201 });
  } catch (error) {
    console.error("Error creating kegiatan:", error);
    return NextResponse.json(
      { message: "Gagal membuat kegiatan." },
      { status: 500 }
    );
  }
}