import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

async function generateUniqueRegistrationCode() {
  let attempt = 0;
  while (attempt < 10) {
    const code = String(Math.floor(10000 + Math.random() * 90000));
    const exists = await prisma.activityRegistration.findFirst({ where: { registrationCode: code } });
    if (!exists) return code;
    attempt += 1;
  }
  return String(Date.now()).slice(-5);
}

export async function POST() {
  try {
    const regs = await prisma.activityRegistration.findMany({
      where: {
        OR: [{ registrationCode: null }, { registrationCode: "" }],
      },
      select: { id: true },
    });

    let updated = 0;
    for (const r of regs) {
      const code = await generateUniqueRegistrationCode();
      await prisma.activityRegistration.update({ where: { id: r.id }, data: { registrationCode: code } });
      updated += 1;
    }

    return NextResponse.json({ updated }, { status: 200 });
  } catch (e) {
    console.error("Backfill registrationCode failed:", e);
    return NextResponse.json({ message: "Backfill failed", error: e.message }, { status: 500 });
  }
}


