import prisma from '../../../../../lib/prisma';

export async function GET() {
  // List all banners
  const banners = await prisma.banner.findMany();
  return new Response(JSON.stringify({ banners }), { status: 200 });
}

export async function POST(req) {
  const data = await req.json();
  const { page, enabled, imageUrl, targetUrl } = data;
  if (!page || !imageUrl || !targetUrl) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }
  const banner = await prisma.banner.create({
    data: { page, enabled: !!enabled, imageUrl, targetUrl },
  });
  return new Response(JSON.stringify({ banner }), { status: 201 });
}

export async function PUT(req) {
  const data = await req.json();
  const { id, page, enabled, imageUrl, targetUrl } = data;
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing banner id' }), { status: 400 });
  }
  const banner = await prisma.banner.update({
    where: { id },
    data: { page, enabled, imageUrl, targetUrl },
  });
  return new Response(JSON.stringify({ banner }), { status: 200 });
}

export async function DELETE(req) {
  const data = await req.json();
  const { id } = data;
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing banner id' }), { status: 400 });
  }
  await prisma.banner.delete({ where: { id } });
  return new Response(JSON.stringify({ success: true }), { status: 200 });
} 