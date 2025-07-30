import prisma from '../../../lib/prisma';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page');
  if (!page) {
    return new Response(JSON.stringify({ error: 'Missing page parameter' }), { status: 400 });
  }
  const banner = await prisma.banner.findFirst({
    where: { page, enabled: true },
  });
  if (!banner) {
    return new Response(JSON.stringify({ banner: null }), { status: 200 });
  }
  return new Response(JSON.stringify({
    banner: {
      imageUrl: banner.imageUrl,
      targetUrl: banner.targetUrl,
      page: banner.page,
    },
  }), { status: 200 });
} 