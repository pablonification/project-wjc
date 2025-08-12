import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET bank settings
export async function GET() {
  const [nameSetting, accountSetting, accountNameSetting] = await Promise.all([
    prisma.settings.findUnique({ where: { key: 'bank_name' } }),
    prisma.settings.findUnique({ where: { key: 'bank_account' } }),
    prisma.settings.findUnique({ where: { key: 'bank_account_name' } }),
  ]);
  return NextResponse.json({
    bankName: nameSetting?.value || '',
    bankAccount: accountSetting?.value || '',
    bankAccountName: accountNameSetting?.value || '',
  });
}

// POST to update bank settings
export async function POST(req) {
  const { bankName, bankAccount, bankAccountName } = await req.json();
  if (!bankName || !bankAccount || !bankAccountName) {
    return NextResponse.json({ error: 'Nama bank dan nomor rekening wajib diisi' }, { status: 400 });
  }

  const [nameSetting, accountSetting, accountNameSetting] = await Promise.all([
    prisma.settings.upsert({
      where: { key: 'bank_name' },
      update: { value: bankName },
      create: { key: 'bank_name', value: bankName },
    }),
    prisma.settings.upsert({
      where: { key: 'bank_account' },
      update: { value: bankAccount },
      create: { key: 'bank_account', value: bankAccount },
    }),
    prisma.settings.upsert({
      where: { key: 'bank_account_name' },
      update: { value: bankAccountName },
      create: { key: 'bank_account_name', value: bankAccountName },
    }),
  ]);

  return NextResponse.json({ bankName: nameSetting.value, bankAccount: accountSetting.value, bankAccountName: accountNameSetting.value });
}


