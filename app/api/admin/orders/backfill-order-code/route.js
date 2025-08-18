import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

async function generateUniqueOrderCode() {
  let attempt = 0;
  while (attempt < 10) {
    const code = String(Math.floor(10000 + Math.random() * 90000));
    const exists = await prisma.order.findFirst({ where: { orderCode: code } });
    if (!exists) return code;
    attempt += 1;
  }
  return String(Date.now()).slice(-5);
}

export async function POST() {
  try {
    const orders = await prisma.order.findMany({
      where: {
        OR: [{ orderCode: null }, { orderCode: "" }],
      },
      select: { id: true },
    });

    let updated = 0;
    for (const o of orders) {
      const code = await generateUniqueOrderCode();
      await prisma.order.update({ where: { id: o.id }, data: { orderCode: code } });
      updated += 1;
    }

    return NextResponse.json({ updated }, { status: 200 });
  } catch (e) {
    console.error("Backfill orderCode failed:", e);
    return NextResponse.json({ message: "Backfill failed", error: e.message }, { status: 500 });
  }
}


