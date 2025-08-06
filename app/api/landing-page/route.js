import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    // Get cache busting parameter
    const { searchParams } = new URL(request.url);
    const timestamp = searchParams.get('t');
    console.log('Fetching landing page content, timestamp:', timestamp);
    
    // Ambil data landing page content dari database untuk public
    let landingPageContent = await prisma.landingPageContent.findFirst();
    
    // default content
    if (!landingPageContent) {
      landingPageContent = await prisma.landingPageContent.create({
        data: {
          heroTitle: "Lorem Ipsum",
          heroDescription: "Lorem ipsum dolor sit amet consectetur. Aliquam aliquam in faucibus pretium sit habitant vitae sollicitudin. Lobortis nisl tristique suscipit urna nullam.",
          heroButton: "Call to action",
          heroImageUrl: null,
          heroImagePublicId: null,
          tentangTitle: "Kami adalah MedDocs WJC",
          tentangDescription: "Lorem ipsum dolor sit amet consectetur. Rhoncus fringilla ipsum tellus semper a eget malesuada. Pulvinar pellentesque urna nunc quis in facilisi est fermentum. Arcu sed quis consectetur risus risus neque vestibulum massa cras. Malesuada ullamcorper non ac gravida aliquam enim nam morbi neque.",
          tentangButton: "Call to Action",
          tentangImageUrl: null,
          tentangImagePublicId: null,
        }
      });
    }

    // Return dengan no-cache headers untuk memastikan fresh data
    const response = NextResponse.json({ 
      success: true, 
      data: landingPageContent,
      timestamp: new Date().toISOString()
    });

    // Set cache headers untuk memastikan fresh data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error) {
    console.error('Error fetching public landing page content:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}