/**
 * Mengonversi string layanan kurir menjadi kode kurir standar Biteship.
 * @param {string} courierService - String layanan kurir dari database (mis: "J&T EXPRESS - EZ").
 * @returns {string|null} Kode kurir dalam format lowercase (mis: "jnt") atau null jika tidak ditemukan.
 */
export function getBiteshipCourierCode(courierService) {
    if (!courierService) return null;
  
    const service = courierService.toLowerCase();
  
    const courierMap = {
      'jne': 'jne',
      'j&t': 'jnt',
      'jnt': 'jnt',
      'sicepat': 'sicepat',
      'anteraja': 'anteraja',
      'pos': 'pos',
      'tiki': 'tiki',
      'ninja': 'ninja',
      'wahana': 'wahana',
    };
  
    for (const key in courierMap) {
      if (service.includes(key)) {
        return courierMap[key];
      }
    }
  
    return service.split(' ')[0];
  }
  
  /**
   * Memformat nama perusahaan kurir dan tipe layanan dari data Biteship.
   * @param {string} company - Kode perusahaan dari Biteship (mis: "jne").
   * @param {string} type - Kode layanan dari Biteship (mis: "reg").
   * @returns {string} Nama yang telah diformat (mis: "JNE Regular").
   */
  export const formatCourierName = (company, type) => {
      const courierNames = {
        jne: "JNE",
        jnt: "J&T Express",
        sicepat: "SiCepat",
        anteraja: "AnterAja",
        pos: "Pos Indonesia",
        tiki: "TIKI",
        ninja: "Ninja Express",
        wahana: "Wahana",
      };
  
      const serviceTypes = {
        reg: "Regular",
        yes: "Yakin Esok Sampai",
        oke: "Ongkos Kirim Ekonomis",
        jtr: "Trucking",
        ctc: "City Courier",
        ctcyes: "City Courier YES",
        ez: "Ekonomi",
        reguler: "Regular",
        next_day: "Next Day",
        same_day: "Same Day",
        instant: "Instant",
        express: "Express",
      };
  
      const formattedCompany = courierNames[company.toLowerCase()] || company.toUpperCase();
      const formattedType = serviceTypes[type.toLowerCase()] || type;
  
      return `${formattedCompany} ${formattedType}`;
  };
  
  /**
   * Memformat nama layanan kurir dari string yang tersimpan di database.
   * @param {string} courierService - String layanan kurir (mis: "JNE - REG").
   * @returns {string} Nama yang telah diformat (mis: "JNE Regular").
   */
  export function formatCourierDisplayName(courierService) {
      if (!courierService) return "Tidak Diketahui";
      
      const parts = courierService.split(' - ');
      const company = parts[0]?.trim() || '';
      const type = parts[1]?.trim() || '';
  
      return formatCourierName(company, type);
  }