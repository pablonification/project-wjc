import { GraphQLClient } from 'graphql-request';
import {
  DatoCMSKegiatan,
  DatoCMSBerita,
  DatoCMSDokumentasi,
  Kegiatan,
  Berita,
  Dokumentasi,
} from '@/types';

const DATOCMS_BASE_URL = process.env.DATOCMS_BASE_URL || 'https://graphql.datocms.com';
const DATOCMS_READONLY_TOKEN = process.env.DATOCMS_READONLY_TOKEN;

if (!DATOCMS_READONLY_TOKEN) {
  console.warn('DATOCMS_READONLY_TOKEN not configured');
}

// Create GraphQL client
export const datoCMSClient = new GraphQLClient(DATOCMS_BASE_URL, {
  headers: {
    Authorization: `Bearer ${DATOCMS_READONLY_TOKEN}`,
  },
});

// GraphQL Queries
export const ALL_KEGIATAN_QUERY = `
  query AllKegiatan {
    allKegiatans {
      id
      title
      description
      content
      slug
      startDate
      endDate
      location
      status
      registrationDeadline
      maxParticipants
      image {
        url
        alt
      }
      category
      _status
      _firstPublishedAt
      _publishedAt
      _createdAt
      _updatedAt
    }
  }
`;

export const ALL_BERITA_QUERY = `
  query AllBerita {
    allBeritas {
      id
      title
      content
      excerpt
      slug
      author
      publishDate
      category
      image {
        url
        alt
      }
      tags
      _status
      _firstPublishedAt
      _publishedAt
      _createdAt
      _updatedAt
    }
  }
`;

export const ALL_DOKUMENTASI_QUERY = `
  query AllDokumentasi {
    allDokumentasis {
      id
      title
      description
      year
      type
      url
      fileSize
      category
      _status
      _firstPublishedAt
      _publishedAt
      _createdAt
      _updatedAt
    }
  }
`;

export const KEGIATAN_BY_ID_QUERY = `
  query KegiatanById($id: ItemId!) {
    kegiatan(filter: { id: { eq: $id } }) {
      id
      title
      description
      content
      slug
      startDate
      endDate
      location
      status
      registrationDeadline
      maxParticipants
      image {
        url
        alt
      }
      category
      _status
      _firstPublishedAt
      _publishedAt
      _createdAt
      _updatedAt
    }
  }
`;

export const BERITA_BY_ID_QUERY = `
  query BeritaById($id: ItemId!) {
    berita(filter: { id: { eq: $id } }) {
      id
      title
      content
      excerpt
      slug
      author
      publishDate
      category
      image {
        url
        alt
      }
      tags
      _status
      _firstPublishedAt
      _publishedAt
      _createdAt
      _updatedAt
    }
  }
`;

export const DOKUMENTASI_BY_ID_QUERY = `
  query DokumentasiById($id: ItemId!) {
    dokumentasi(filter: { id: { eq: $id } }) {
      id
      title
      description
      year
      type
      url
      fileSize
      category
      _status
      _firstPublishedAt
      _publishedAt
      _createdAt
      _updatedAt
    }
  }
`;

// Data fetching functions
export const fetchAllKegiatan = async (): Promise<DatoCMSKegiatan[]> => {
  try {
    const data = await datoCMSClient.request(ALL_KEGIATAN_QUERY) as any;
    return data.allKegiatans;
  } catch (error) {
    console.error('Error fetching kegiatan from DatoCMS:', error);
    throw error;
  }
};

export const fetchAllBerita = async (): Promise<DatoCMSBerita[]> => {
  try {
    const data = await datoCMSClient.request(ALL_BERITA_QUERY) as any;
    return data.allBeritas;
  } catch (error) {
    console.error('Error fetching berita from DatoCMS:', error);
    throw error;
  }
};

export const fetchAllDokumentasi = async (): Promise<DatoCMSDokumentasi[]> => {
  try {
    const data = await datoCMSClient.request(ALL_DOKUMENTASI_QUERY) as any;
    return data.allDokumentasis;
  } catch (error) {
    console.error('Error fetching dokumentasi from DatoCMS:', error);
    throw error;
  }
};

export const fetchKegiatanById = async (id: string): Promise<DatoCMSKegiatan | null> => {
  try {
    const data = await datoCMSClient.request(KEGIATAN_BY_ID_QUERY, { id }) as any;
    return data.kegiatan;
  } catch (error) {
    console.error('Error fetching kegiatan by ID from DatoCMS:', error);
    return null;
  }
};

export const fetchBeritaById = async (id: string): Promise<DatoCMSBerita | null> => {
  try {
    const data = await datoCMSClient.request(BERITA_BY_ID_QUERY, { id }) as any;
    return data.berita;
  } catch (error) {
    console.error('Error fetching berita by ID from DatoCMS:', error);
    return null;
  }
};

export const fetchDokumentasiById = async (id: string): Promise<DatoCMSDokumentasi | null> => {
  try {
    const data = await datoCMSClient.request(DOKUMENTASI_BY_ID_QUERY, { id }) as any;
    return data.dokumentasi;
  } catch (error) {
    console.error('Error fetching dokumentasi by ID from DatoCMS:', error);
    return null;
  }
};

// Transform functions to convert DatoCMS data to MongoDB format
export const transformKegiatanFromDatoCMS = (datoKegiatan: DatoCMSKegiatan): Partial<Kegiatan> => {
  return {
    title: datoKegiatan.title,
    description: datoKegiatan.description,
    content: datoKegiatan.content,
    slug: datoKegiatan.slug,
    startDate: new Date(datoKegiatan.startDate),
    endDate: new Date(datoKegiatan.endDate),
    location: datoKegiatan.location,
    status: datoKegiatan.status as 'Mendatang' | 'Sedang Berlangsung' | 'Selesai',
    registrationDeadline: datoKegiatan.registrationDeadline 
      ? new Date(datoKegiatan.registrationDeadline)
      : undefined,
    maxParticipants: datoKegiatan.maxParticipants,
    image: datoKegiatan.image?.url,
    category: datoKegiatan.category,
    isActive: datoKegiatan._status === 'published',
    datoId: datoKegiatan.id,
  };
};

export const transformBeritaFromDatoCMS = (datoBerita: DatoCMSBerita): Partial<Berita> => {
  return {
    title: datoBerita.title,
    content: datoBerita.content,
    excerpt: datoBerita.excerpt,
    slug: datoBerita.slug,
    author: datoBerita.author,
    publishDate: new Date(datoBerita.publishDate),
    category: datoBerita.category,
    image: datoBerita.image?.url,
    isPublished: datoBerita._status === 'published',
    tags: datoBerita.tags || [],
    datoId: datoBerita.id,
  };
};

export const transformDokumentasiFromDatoCMS = (datoDokumentasi: DatoCMSDokumentasi): Partial<Dokumentasi> => {
  return {
    title: datoDokumentasi.title,
    description: datoDokumentasi.description,
    year: datoDokumentasi.year,
    type: datoDokumentasi.type as 'document' | 'video' | 'image' | 'link',
    url: datoDokumentasi.url,
    fileSize: datoDokumentasi.fileSize,
    category: datoDokumentasi.category,
    isPublic: datoDokumentasi._status === 'published',
    datoId: datoDokumentasi.id,
  };
};

// Test DatoCMS connection
export const testDatoCMSConnection = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    // Simple query to test connection
    const testQuery = `
      query {
        _site {
          globalSeo {
            siteName
          }
        }
      }
    `;
    
    await datoCMSClient.request(testQuery);
    console.log('DatoCMS connection successful');
    return { success: true };
  } catch (error) {
    console.error('DatoCMS connection test failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'DatoCMS connection failed' 
    };
  }
};