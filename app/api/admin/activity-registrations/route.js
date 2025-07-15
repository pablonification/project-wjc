import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const registrations = await prisma.activityRegistration.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phoneNumber: true
          }
        },
        activity: {
          select: {
            id: true,
            title: true,
            slug: true,
            location: true,
            dateStart: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(registrations, { status: 200 });
  } catch (error) {
    console.error("Error fetching activity registrations:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 