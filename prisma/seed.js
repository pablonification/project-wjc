// File: prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Memulai proses seeding...');

  // --- 1. Definisikan Data Admin ---
  const adminPhoneNumber = '+628123456789'; // Ganti dengan nomor admin asli (format E.164)
  const adminPassword = '123456'; // Ganti dengan password yang kuat
  const adminName = 'Admin WJC';

  // --- 2. Pastikan Nomor Admin Ada di Whitelist ---
  // Jalankan aplikasi dan tambahkan nomor ini ke whitelist melalui dashboard admin Anda terlebih dahulu
  // atau tambahkan secara manual di MongoDB Atlas.
  const whitelistEntry = await prisma.whitelist.findUnique({
    where: { phoneNumber: adminPhoneNumber },
  });

  if (!whitelistEntry) {
    console.error(`❌ Error: Nomor telepon admin (${adminPhoneNumber}) tidak ditemukan di whitelist.`);
    console.error('Harap tambahkan nomor tersebut ke whitelist terlebih dahulu sebelum menjalankan seed.');
    return;
  }

  // --- 3. Cek Apakah Admin Sudah Ada ---
  const existingAdmin = await prisma.user.findUnique({
    where: { phoneNumber: adminPhoneNumber },
  });

  if (existingAdmin) {
    console.log('✅ Akun admin sudah ada. Proses seeding dilewati.');
    return;
  }

  // --- 4. Buat Akun Admin Baru ---
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.user.create({
    data: {
      name: adminName,
      phoneNumber: adminPhoneNumber,
      password: hashedPassword,
      role: 'ADMIN', // Set role secara eksplisit menjadi ADMIN
      whitelistId: whitelistEntry.id,
    },
  });

  console.log('✅ Akun admin berhasil dibuat!');

  // Seed WhatsApp numbers for kegiatan and merchandise
  await prisma.settings.upsert({
    where: { key: 'wa_kegiatan' },
    update: { value: '6285155347701' },
    create: { key: 'wa_kegiatan', value: '6285155347701' },
  });
  await prisma.settings.upsert({
    where: { key: 'wa_merch' },
    update: { value: '6285155347701' },
    create: { key: 'wa_merch', value: '6285155347701' },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
