export const ALL_KEGIATAN_QUERY = `
  query AllKegiatan {
    allKegiatans(orderBy: _createdAt_DESC) {
      id
      title
      description
      dateStart
      dateEnd
      location
      slug
      statusKegiatan
      image {
        url
      }
    }
  }
`;

export const KEGIATAN_DETAIL_QUERY = `
  query KegiatanDetailBySlug($slug: String!) {
    kegiatan(filter: { slug: { eq: $slug } }) {
      id
      title
      description
      dateStart
      dateEnd
      location
      statusKegiatan
      image {
        url
      }
      registrationFee
      tshirtPriceS
      tshirtPriceM
      tshirtPriceL
      tshirtPriceXxxl
      tshirtPriceXxl
      tshirtPriceXl
      accomodationName
      accomodationPriceSingle
      accomodationPriceSharing
      attachment {
        url
      }
    }
  }
`;