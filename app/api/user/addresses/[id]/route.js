import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: get single address
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const address = await prisma.address.findUnique({
      where: { id }
    });

    if (!address) {
      return NextResponse.json(
        { message: "Alamat tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(address, { status: 200 });
  } catch (error) {
    console.error("Error fetching address:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data alamat" },
      { status: 500 }
    );
  }
}

// PUT: update address
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
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
    if (!namaLengkap || !alamatLengkap || !kodePos || !nomorTelepon || !email || !provinsi || !kota || !kecamatan || !kelurahan) {
      return NextResponse.json(
        { message: "Data wajib belum lengkap" },
        { status: 400 }
      );
    }

    // Jika ini alamat default, set alamat lain menjadi non-default
    if (isDefault) {
      const currentAddress = await prisma.address.findUnique({
        where: { id }
      });
      
      if (currentAddress) {
        await prisma.address.updateMany({
          where: { 
            userId: currentAddress.userId,
            id: { not: id }
          },
          data: { isDefault: false }
        });
      }
    }

    const updatedAddress = await prisma.address.update({
      where: { id },
      data: {
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

    return NextResponse.json(updatedAddress, { status: 200 });
  } catch (error) {
    console.error("Error updating address:", error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: "Alamat tidak ditemukan" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Gagal mengupdate alamat" },
      { status: 500 }
    );
  }
}

// DELETE: delete address
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    await prisma.address.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: "Alamat berhasil dihapus" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting address:", error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: "Alamat tidak ditemukan" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Gagal menghapus alamat" },
      { status: 500 }
    );
  }
} 