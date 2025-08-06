
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    let landingPageContent = await prisma.landingPageContent.findFirst();
    
    // Jika belum ada data sama sekali, buat satu record default
    if (!landingPageContent) {
      landingPageContent = await prisma.landingPageContent.create({
        data: {
          heroTitle: "Selamat Datang di Toko Buku Dago",
          heroDescription: "Temukan berbagai macam buku dan kegiatan literasi menarik.",
          heroButton: "Jelajahi Sekarang",
          tentangTitle: "Tentang Toko Buku Dago",
          tentangDescription: "Kami adalah pusat literasi yang menyediakan buku berkualitas dan menyelenggarakan berbagai kegiatan komunitas.",
          tentangButton: "Selengkapnya",
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: landingPageContent 
    });

  } catch (error) {
    console.error('Error fetching landing page content:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();

    // Cari record yang ada untuk diupdate
    const existingContent = await prisma.landingPageContent.findFirst();
    
    if (!existingContent) {
      return NextResponse.json({ message: "Konten tidak ditemukan untuk diupdate." }, { status: 404 });
    }

    // Update data di database
    const updatedContent = await prisma.landingPageContent.update({
      where: { id: existingContent.id },
      data: {
        heroTitle: body.heroTitle !== undefined ? body.heroTitle : existingContent.heroTitle,
        heroDescription: body.heroDescription !== undefined ? body.heroDescription : existingContent.heroDescription,
        heroButton: body.heroButton !== undefined ? body.heroButton : existingContent.heroButton,
        heroImageUrl: body.heroImageUrl !== undefined ? body.heroImageUrl : existingContent.heroImageUrl,
        heroImagePublicId: body.heroImagePublicId !== undefined ? body.heroImagePublicId : existingContent.heroImagePublicId,
        tentangTitle: body.tentangTitle !== undefined ? body.tentangTitle : existingContent.tentangTitle,
        tentangDescription: body.tentangDescription !== undefined ? body.tentangDescription : existingContent.tentangDescription,
        tentangButton: body.tentangButton !== undefined ? body.tentangButton : existingContent.tentangButton,
        tentangImageUrl: body.tentangImageUrl !== undefined ? body.tentangImageUrl : existingContent.tentangImageUrl,
        tentangImagePublicId: body.tentangImagePublicId !== undefined ? body.tentangImagePublicId : existingContent.tentangImagePublicId,
      }
    });

    revalidatePath('/');

    return NextResponse.json({ 
      success: true, 
      message: 'Landing page content berhasil diperbarui',
      data: updatedContent 
    });

  } catch (error) {
    console.error('Error updating landing page content:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}