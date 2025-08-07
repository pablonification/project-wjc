import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    if (!slug)
      return NextResponse.json({ message: "Slug required" }, { status: 400 });
    const data = await prisma.kegiatan.findUnique({ where: { slug } });
    if (!data)
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching kegiatan:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
    try {
        const { slug } = params;
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
            // Accommodation fields
            accommodationName,
            accommodationPriceSharing,
            accommodationPriceSingle,
            // T-shirt pricing fields
            tshirtPriceS,
            tshirtPriceM,
            tshirtPriceL,
            tshirtPriceXL,
            tshirtPriceXXL,
            tshirtPriceXXXL,
            registrationFee,
        } = body;

        if (!title || !description || !dateStart || !location) {
            return NextResponse.json(
                { message: "Field wajib belum lengkap" },
                { status: 400 }
            );
        }

        const updatedKegiatan = await prisma.kegiatan.update({
            where: { slug },
            data: {
                title,
                description,
                dateStart: new Date(dateStart),
                dateEnd: dateEnd ? new Date(dateEnd) : undefined,
                location,
                status,
                imageUrl,
                attachmentUrls: Array.isArray(attachmentUrls) ? attachmentUrls : [],
                registrationFee: registrationFee ? parseInt(registrationFee) : 0,
                // Accommodation fields
                accommodationName: accommodationName || null,
                accommodationPriceSharing: accommodationPriceSharing ? parseInt(accommodationPriceSharing) : null,
                accommodationPriceSingle: accommodationPriceSingle ? parseInt(accommodationPriceSingle) : null,
                // T-shirt pricing fields
                tshirtPriceS: tshirtPriceS ? parseInt(tshirtPriceS) : null,
                tshirtPriceM: tshirtPriceM ? parseInt(tshirtPriceM) : null,
                tshirtPriceL: tshirtPriceL ? parseInt(tshirtPriceL) : null,
                tshirtPriceXL: tshirtPriceXL ? parseInt(tshirtPriceXL) : null,
                tshirtPriceXXL: tshirtPriceXXL ? parseInt(tshirtPriceXXL) : null,
                tshirtPriceXXXL: tshirtPriceXXXL ? parseInt(tshirtPriceXXXL) : null,
            },
        });

        return NextResponse.json(updatedKegiatan, { status: 200 });
    } catch (error) {
        console.error("Error updating kegiatan:", error);
        if (error.code === 'P2025') {
            return NextResponse.json(
                { message: "Kegiatan yang akan diupdate tidak ditemukan." },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { message: "Gagal mengupdate kegiatan." },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const { slug } = params;

        await prisma.kegiatan.delete({
            where: { slug },
        });

        return NextResponse.json(
            { message: "Kegiatan berhasil dihapus" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting kegiatan:", error);
        if (error.code === 'P2025') {
            return NextResponse.json(
                { message: "Kegiatan yang akan dihapus tidak ditemukan." },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { message: "Gagal menghapus kegiatan" },
            { status: 500 }
        );
  }
}
