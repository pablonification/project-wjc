import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

// GET: list all addresses for logged-in user
export async function GET(request) {
  try {
    // TODO: Implement proper authentication
    // For now, we'll get userId from query params or headers
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { message: "User ID diperlukan" },
        { status: 400 }
      );
    }

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "desc" }
      ]
    });

    return NextResponse.json(addresses, { status: 200 });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data alamat" },
      { status: 500 }
    );
  }
}

// POST: create new address
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId,
      namaLengkap,
      alamatLengkap,
      kodePos,
      nomorTelepon,
      email,
      namaPenerima,
      nomorTeleponPenerima,
      instruksiKhusus,
      provinsi,
      kota,
      kecamatan,
      kelurahan,
      isDefault
    } = body;

    // Validasi data wajib
    if (!userId || !namaLengkap || !alamatLengkap || !kodePos || !nomorTelepon || !email || !provinsi || !kota || !kecamatan || !kelurahan) {
      return NextResponse.json(
        { message: "Data wajib belum lengkap" },
        { status: 400 }
      );
    }

    // Jika ini alamat default, set alamat lain menjadi non-default
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        namaLengkap,
        alamatLengkap,
        kodePos,
        nomorTelepon,
        email,
        namaPenerima,
        nomorTeleponPenerima,
        instruksiKhusus,
        provinsi,
        kota,
        kecamatan,
        kelurahan,
        isDefault: isDefault || false
      }
    });

    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    console.error("Error creating address:", error);
    return NextResponse.json(
      { message: "Gagal membuat alamat" },
      { status: 500 }
    );
  }
} 