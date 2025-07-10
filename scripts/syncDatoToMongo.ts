#!/usr/bin/env ts-node

import "dotenv/config";
import { connectMongo } from "../lib/mongodb";
import { datoRequest } from "../lib/datocms";
import { KegiatanModel } from "../models/Kegiatan";
import { BeritaModel } from "../models/Berita";
import { DokumentasiModel } from "../models/Dokumentasi";

async function main() {
  await connectMongo();

  // 1. Sync Kegiatan
  const kegiatanQuery = /* GraphQL */ `
    query AllKegiatan {
      allKegiatans {
        id
        title
        description
        date
        location
        status
        slug
        attachments { url }
      }
    }`;
  type KegiatanGql = {
    allKegiatans: Array<{ id: string; title: string; description: string; date: string; location: string; status: string; slug: string; attachments: Array<{ url: string }> }>;
  };
  const kegiatanData = await datoRequest<KegiatanGql>(kegiatanQuery);
  await Promise.all(
    kegiatanData.allKegiatans.map((k) =>
      KegiatanModel.updateOne(
        { slug: k.slug },
        {
          title: k.title,
          description: k.description,
          date: k.date,
          location: k.location,
          status: k.status,
          slug: k.slug,
          attachments: k.attachments?.map((a) => a.url) || [],
        },
        { upsert: true }
      )
    )
  );

  // 2. Sync Berita
  const beritaQuery = /* GraphQL */ `
    query AllBerita {
      allBeritas {
        id
        category
        date
        title
        slug
        description
        content
        coverImage { url }
      }
    }`;
  type BeritaGql = {
    allBeritas: Array<{ id: string; category: string; date: string; title: string; slug: string; description: string; content: string; coverImage?: { url: string } }>;
  };
  const beritaData = await datoRequest<BeritaGql>(beritaQuery);
  await Promise.all(
    beritaData.allBeritas.map((b) =>
      BeritaModel.updateOne(
        { slug: b.slug },
        {
          category: b.category,
          date: b.date,
          title: b.title,
          slug: b.slug,
          description: b.description,
          content: b.content,
          coverImage: b.coverImage?.url,
        },
        { upsert: true }
      )
    )
  );

  // 3. Sync Dokumentasi
  const dokQuery = /* GraphQL */ `
    query AllDokumentasi {
      allDokumentasis {
        id
        title
        year
        link
      }
    }`;
  type DokGql = {
    allDokumentasis: Array<{ id: string; title: string; year: number; link: string }>;
  };
  const dokData = await datoRequest<DokGql>(dokQuery);
  await Promise.all(
    dokData.allDokumentasis.map((d) =>
      DokumentasiModel.updateOne(
        { title: d.title, year: d.year },
        { title: d.title, year: d.year, link: d.link },
        { upsert: true }
      )
    )
  );

  console.log("Sync completed");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});