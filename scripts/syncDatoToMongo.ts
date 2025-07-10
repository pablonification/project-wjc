#!/usr/bin/env tsx

import { config } from 'dotenv';
import {
  fetchAllKegiatan,
  fetchAllBerita,
  fetchAllDokumentasi,
  transformKegiatanFromDatoCMS,
  transformBeritaFromDatoCMS,
  transformDokumentasiFromDatoCMS,
  testDatoCMSConnection,
} from '../lib/datocms';
import connectToDatabase from '../lib/mongodb';
import { KegiatanModel } from '../lib/models/Kegiatan';
import { BeritaModel } from '../lib/models/Berita';
import { DokumentasiModel } from '../lib/models/Dokumentasi';

// Load environment variables
config();

interface SyncStats {
  kegiatan: { created: number; updated: number; errors: number };
  berita: { created: number; updated: number; errors: number };
  dokumentasi: { created: number; updated: number; errors: number };
  total: { created: number; updated: number; errors: number };
}

const initStats = (): SyncStats => ({
  kegiatan: { created: 0, updated: 0, errors: 0 },
  berita: { created: 0, updated: 0, errors: 0 },
  dokumentasi: { created: 0, updated: 0, errors: 0 },
  total: { created: 0, updated: 0, errors: 0 },
});

const syncKegiatan = async (stats: SyncStats) => {
  console.log('🔄 Syncing Kegiatan...');
  
  try {
    const datoKegiatan = await fetchAllKegiatan();
    console.log(`Found ${datoKegiatan.length} kegiatan in DatoCMS`);
    
    for (const datoItem of datoKegiatan) {
      try {
        const transformedData = transformKegiatanFromDatoCMS(datoItem);
        
        // Use upsert to create or update
        const result = await KegiatanModel.findOneAndUpdate(
          { datoId: datoItem.id },
          transformedData,
          { 
            new: true, 
            upsert: true, 
            runValidators: true,
            setDefaultsOnInsert: true,
          }
        );
        
        // Check if this was a new document
        const isNew = !await KegiatanModel.findOne({ 
          datoId: datoItem.id,
          _id: { $ne: result._id }
        });
        
        if (isNew) {
          stats.kegiatan.created++;
          stats.total.created++;
          console.log(`✅ Created kegiatan: ${transformedData.title}`);
        } else {
          stats.kegiatan.updated++;
          stats.total.updated++;
          console.log(`🔄 Updated kegiatan: ${transformedData.title}`);
        }
      } catch (error) {
        stats.kegiatan.errors++;
        stats.total.errors++;
        console.error(`❌ Error syncing kegiatan "${datoItem.title}":`, error);
      }
    }
  } catch (error) {
    console.error('❌ Error fetching kegiatan from DatoCMS:', error);
    throw error;
  }
};

const syncBerita = async (stats: SyncStats) => {
  console.log('🔄 Syncing Berita...');
  
  try {
    const datoBerita = await fetchAllBerita();
    console.log(`Found ${datoBerita.length} berita in DatoCMS`);
    
    for (const datoItem of datoBerita) {
      try {
        const transformedData = transformBeritaFromDatoCMS(datoItem);
        
        const result = await BeritaModel.findOneAndUpdate(
          { datoId: datoItem.id },
          transformedData,
          { 
            new: true, 
            upsert: true, 
            runValidators: true,
            setDefaultsOnInsert: true,
          }
        );
        
        const isNew = !await BeritaModel.findOne({ 
          datoId: datoItem.id,
          _id: { $ne: result._id }
        });
        
        if (isNew) {
          stats.berita.created++;
          stats.total.created++;
          console.log(`✅ Created berita: ${transformedData.title}`);
        } else {
          stats.berita.updated++;
          stats.total.updated++;
          console.log(`🔄 Updated berita: ${transformedData.title}`);
        }
      } catch (error) {
        stats.berita.errors++;
        stats.total.errors++;
        console.error(`❌ Error syncing berita "${datoItem.title}":`, error);
      }
    }
  } catch (error) {
    console.error('❌ Error fetching berita from DatoCMS:', error);
    throw error;
  }
};

const syncDokumentasi = async (stats: SyncStats) => {
  console.log('🔄 Syncing Dokumentasi...');
  
  try {
    const datoDokumentasi = await fetchAllDokumentasi();
    console.log(`Found ${datoDokumentasi.length} dokumentasi in DatoCMS`);
    
    for (const datoItem of datoDokumentasi) {
      try {
        const transformedData = transformDokumentasiFromDatoCMS(datoItem);
        
        const result = await DokumentasiModel.findOneAndUpdate(
          { datoId: datoItem.id },
          transformedData,
          { 
            new: true, 
            upsert: true, 
            runValidators: true,
            setDefaultsOnInsert: true,
          }
        );
        
        const isNew = !await DokumentasiModel.findOne({ 
          datoId: datoItem.id,
          _id: { $ne: result._id }
        });
        
        if (isNew) {
          stats.dokumentasi.created++;
          stats.total.created++;
          console.log(`✅ Created dokumentasi: ${transformedData.title}`);
        } else {
          stats.dokumentasi.updated++;
          stats.total.updated++;
          console.log(`🔄 Updated dokumentasi: ${transformedData.title}`);
        }
      } catch (error) {
        stats.dokumentasi.errors++;
        stats.total.errors++;
        console.error(`❌ Error syncing dokumentasi "${datoItem.title}":`, error);
      }
    }
  } catch (error) {
    console.error('❌ Error fetching dokumentasi from DatoCMS:', error);
    throw error;
  }
};

const printStats = (stats: SyncStats, duration: number) => {
  console.log('\n📊 Sync Statistics:');
  console.log('═'.repeat(50));
  console.log(`🎯 Kegiatan    | Created: ${stats.kegiatan.created.toString().padStart(3)} | Updated: ${stats.kegiatan.updated.toString().padStart(3)} | Errors: ${stats.kegiatan.errors.toString().padStart(3)}`);
  console.log(`📰 Berita      | Created: ${stats.berita.created.toString().padStart(3)} | Updated: ${stats.berita.updated.toString().padStart(3)} | Errors: ${stats.berita.errors.toString().padStart(3)}`);
  console.log(`📄 Dokumentasi | Created: ${stats.dokumentasi.created.toString().padStart(3)} | Updated: ${stats.dokumentasi.updated.toString().padStart(3)} | Errors: ${stats.dokumentasi.errors.toString().padStart(3)}`);
  console.log('─'.repeat(50));
  console.log(`📈 Total       | Created: ${stats.total.created.toString().padStart(3)} | Updated: ${stats.total.updated.toString().padStart(3)} | Errors: ${stats.total.errors.toString().padStart(3)}`);
  console.log('═'.repeat(50));
  console.log(`⏱️  Duration: ${duration}ms`);
  
  if (stats.total.errors > 0) {
    console.log(`⚠️  Warning: ${stats.total.errors} errors occurred during sync`);
  } else {
    console.log('✅ Sync completed successfully with no errors');
  }
};

const main = async () => {
  const startTime = Date.now();
  const stats = initStats();
  
  console.log('🚀 Starting DatoCMS to MongoDB Sync');
  console.log('═'.repeat(50));
  
  try {
    // Test connections
    console.log('🔗 Testing connections...');
    
    const datoTest = await testDatoCMSConnection();
    if (!datoTest.success) {
      throw new Error(`DatoCMS connection failed: ${datoTest.error}`);
    }
    console.log('✅ DatoCMS connection successful');
    
    await connectToDatabase();
    console.log('✅ MongoDB connection successful');
    
    // Perform sync operations
    await syncKegiatan(stats);
    await syncBerita(stats);
    await syncDokumentasi(stats);
    
    const duration = Date.now() - startTime;
    printStats(stats, duration);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Sync failed:', error);
    const duration = Date.now() - startTime;
    printStats(stats, duration);
    process.exit(1);
  }
};

// Handle CLI arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isVerbose = args.includes('--verbose');

if (isDryRun) {
  console.log('🧪 DRY RUN MODE - No changes will be made to the database');
}

if (isVerbose) {
  console.log('📢 VERBOSE MODE - Detailed logging enabled');
}

// Run the sync
main().catch((error) => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});