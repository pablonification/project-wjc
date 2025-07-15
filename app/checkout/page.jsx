"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar, Footer } from "@/app/components";
import Image from "next/image";

const CheckoutPage = () => {
  const router = useRouter();
  const [checkoutData, setCheckoutData] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [shippingMethod, setShippingMethod] = useState("PICKUP");
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  
  // State baru untuk Biteship
  const [destinationPostalCode, setDestinationPostalCode] = useState('');
  const [originPostalCode] = useState('40198'); // Jakarta Pusat sebagai default
  
  const [loading, setLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState(null);

  // Form state untuk alamat baru
  const [addressForm, setAddressForm] = useState({
    namaLengkap: "",
    alamatLengkap: "",
    kodePos: "",
    nomorTelepon: "",
    email: "",
    namaPenerima: "",
    nomorTeleponPenerima: "",
    instruksiKhusus: "",
    provinsi: "",
    kota: "",
    kecamatan: "",
    kelurahan: "",
    isDefault: false
  });

  useEffect(() => {
    const initialize = async () => {
      // Ambil data checkout dari localStorage
      const savedCheckoutData = localStorage.getItem('checkoutData');
      if (!savedCheckoutData) {
        router.push('/merchandise');
        return;
      }
      setCheckoutData(JSON.parse(savedCheckoutData));

      // Ambil profil user
      try {
        const resProfile = await fetch('/api/user/profile');
        if (resProfile.ok) {
          const dataProfile = await resProfile.json();
          setUser(dataProfile.user);
          await loadAddresses(dataProfile.user.id);
        } else {
          // Jika tidak terautentikasi, redirect ke login
          router.push('/login');
          return;
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        router.push('/login');
        return;
      }

      // Hapus pemanggilan loadProvinces()
      setLoading(false);
    };

    initialize();
  }, [router]); // Tambahkan router ke dependency array

  const loadAddresses = async (uid) => {
    try {
      const res = await fetch(`/api/user/addresses?userId=${uid}`);
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
        // Set default address jika ada
        const defaultAddress = data.find(addr => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
          setDestinationPostalCode(defaultAddress.kodePos);
        }
      }
    } catch (error) {
      console.error("Error loading addresses:", error);
    }
  };

  // Hapus fungsi loadProvinces dan loadCities

  const calculateShipping = async () => {
    if (!destinationPostalCode || shippingMethod === "PICKUP" || !checkoutData) {
        setShippingOptions([]);
        return;
    }

    try {
      const items = [{
          name: checkoutData.product.name,
          description: "Merchandise",
          value: checkoutData.product.price,
          weight: 1, // dalam kg, asumsikan berat per item 1kg
          quantity: checkoutData.quantity,
      }];

      const res = await fetch('/api/shipping/cost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin_postal_code: originPostalCode,
          destination_postal_code: destinationPostalCode,
          items,
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setShippingOptions(data);
      } else {
        setShippingOptions([]);
      }

    } catch (error) {
      console.error("Error calculating shipping:", error);
      setShippingOptions([]);
    }
  };

  useEffect(() => {
    if (shippingMethod === 'DELIVERY' && destinationPostalCode && selectedAddress) {
        calculateShipping();
    } else {
        setShippingOptions([]);
        setSelectedShipping(null);
    }
  }, [destinationPostalCode, shippingMethod, checkoutData, selectedAddress]);


  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Hapus blok if name === 'provinsi'
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...addressForm,
          userId: user?.id
        })
      });

      if (res.ok) {
        const newAddress = await res.json();
        setAddresses(prev => [newAddress, ...prev]);
        setSelectedAddress(newAddress);
        
        // Set kode pos dari alamat baru
        setDestinationPostalCode(newAddress.kodePos);

        setShowAddressForm(false);
        setAddressForm({
          namaLengkap: "",
          alamatLengkap: "",
          kodePos: "",
          nomorTelepon: "",
          email: "",
          namaPenerima: "",
          nomorTeleponPenerima: "",
          instruksiKhusus: "",
          provinsi: "",
          kota: "",
          kecamatan: "",
          kelurahan: "",
          isDefault: false
        });
      }
    } catch (error) {
      console.error("Error saving address:", error);
    }
  };

  const handleProceedToPayment = async () => {
    if (!checkoutData) return;

    setIsProcessing(true);
    
    try {
      const shippingCost = shippingMethod === "PICKUP" ? 0 : (selectedShipping?.price || 0);
      
      const orderData = {
        userId: user?.id,
        merchandiseId: checkoutData.product.id,
        // Alamat sekarang tidak wajib karena bisa pickup
        addressId: selectedAddress ? selectedAddress.id : null,
        quantity: checkoutData.quantity,
        shippingMethod,
        // Service sekarang ada di dalam objek pricing
        courierService: shippingMethod === "DELIVERY" ? `${selectedShipping?.company.toUpperCase()} - ${selectedShipping?.type}` : null,
        shippingCost,
        // Tambahkan detail tujuan untuk disimpan di order
        shippingDestination: shippingMethod === "DELIVERY" ? {
            postal_code: destinationPostalCode,
            address_line: selectedAddress ? `${selectedAddress.alamatLengkap}, ${selectedAddress.kecamatan}, ${selectedAddress.kota}` : '',
        } : null,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        const order = await res.json();
        if (order.xenditPaymentUrl) {
          window.location.href = order.xenditPaymentUrl;
        } else {
          // Handle case for pickup or other non-payment scenarios if any
          router.push(`/orders/${order.id}/success`);
        }
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Terjadi kesalahan saat membuat pesanan. Silakan coba lagi.");
    } finally {
      setIsProcessing(false);
    }
  };

  const totalCost = (checkoutData?.product.price || 0) * (checkoutData?.quantity || 1) + (selectedShipping?.price || 0);

  if (loading) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        Memuat...
      </div>
    );
  }

  const subtotal = checkoutData.subtotal;
  const shippingCost = shippingMethod === "PICKUP" ? 0 : (selectedShipping?.price || 0);
  const total = subtotal + shippingCost;

  // Helper function to format courier names
  const formatCourierName = (company, type) => {
    const courierNames = {
      'jne': 'JNE',
      'jnt': 'J&T Express',
      'sicepat': 'SiCepat',
      'anteraja': 'AnterAja',
      'pos': 'Pos Indonesia',
      'tiki': 'TIKI',
      'ninja': 'Ninja Express',
      'wahana': 'Wahana'
    };

    const serviceTypes = {
      'reg': 'Regular',
      'yes': 'Yakin Esok Sampai',
      'oke': 'Ongkos Kirim Ekonomis',
      'jtr': 'Trucking',
      'ctc': 'City Courier',
      'ctcyes': 'City Courier YES',
      'ez': 'Ekonomi',
      'reguler': 'Regular',
      'next_day': 'Next Day',
      'same_day': 'Same Day',
      'instant': 'Instant',
      'express': 'Express'
    };

    const formattedCompany = courierNames[company.toLowerCase()] || company.toUpperCase();
    const formattedType = serviceTypes[type.toLowerCase()] || type.charAt(0).toUpperCase() + type.slice(1);

    return `${formattedCompany} ${formattedType}`;
  };

  return (
    <div className="bg-[#181818] min-h-screen flex flex-col font-manrope">
      <Navbar />
      <main className="flex-grow bg-black text-white">
        <div className="container mx-auto mt-20 px-4 sm:px-6 lg:px-28 py-16">
          <h1 className="text-h1 font-bold mb-8">Checkout</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Shipping Method Selection */}
              <div className="bg-gray-900 p-6 rounded-lg">
                <h2 className="text-h3 font-semibold mb-4">Metode Pengiriman</h2>
                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="PICKUP"
                      checked={shippingMethod === "PICKUP"}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      className="text-red-500"
                    />
                    <span>Ambil di Sekretariat (Gratis)</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="DELIVERY"
                      checked={shippingMethod === "DELIVERY"}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      className="text-red-500"
                    />
                    <span>Dikirim via Ekspedisi</span>
                  </label>
                </div>
              </div>

              {/* Address Selection (only show if DELIVERY) */}
              {shippingMethod === "DELIVERY" && (
                <div className="bg-gray-900 p-6 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-h3 font-semibold">Alamat Pengiriman</h2>
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      Tambah Alamat
                    </button>
                  </div>
                  
                  {addresses.length === 0 ? (
                    <p className="text-gray-400">Belum ada alamat tersimpan.</p>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <label key={address.id} className="flex items-start space-x-3">
                          <input
                            type="radio"
                            name="selectedAddress"
                            value={address.id}
                            checked={selectedAddress?.id === address.id}
                            onChange={() => {
                              setSelectedAddress(address);
                              setDestinationPostalCode(address.kodePos);
                            }}
                            className="text-red-500 mt-1"
                          />
                          <div className="flex-1">
                            <div className="font-semibold">{address.namaLengkap}</div>
                            <div className="text-sm text-gray-400">{address.nomorTelepon}</div>
                            <div className="text-sm text-gray-400">{address.alamatLengkap}</div>
                            <div className="text-sm text-gray-400">
                              {address.kelurahan}, {address.kecamatan}, {address.kota}, {address.provinsi} {address.kodePos}
                            </div>
                            {address.isDefault && (
                              <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">Default</span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Postal Code Info (only show if DELIVERY and address selected) */}
              {shippingMethod === "DELIVERY" && selectedAddress && (
                <div className="bg-gray-900 p-6 rounded-lg hidden">
                  <h2 className="text-h3 font-semibold mb-4">Informasi Pengiriman</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Kode Pos Asal:</span>
                      <span>{originPostalCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Kode Pos Tujuan:</span>
                      <span>{destinationPostalCode}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Shipping Options (only show if DELIVERY and address selected) */}
              {shippingMethod === "DELIVERY" && selectedAddress && destinationPostalCode && shippingOptions.length > 0 && (
                <div className="bg-gray-900 p-6 rounded-lg">
                  <h2 className="text-h3 font-semibold mb-4">Pilih Ekspedisi</h2>
                  <div className="space-y-4">
                    {shippingOptions.map((option, index) => (
                      <label key={index} className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="selectedShipping"
                            value={index}
                            checked={selectedShipping === option}
                            onChange={() => setSelectedShipping(option)}
                            className="text-red-500"
                          />
                          <div>
                            <div className="font-semibold">{formatCourierName(option.company, option.type)}</div>
                            <div className="text-sm text-gray-400">{option.description}</div>
                            <div className="text-sm text-gray-400">Estimasi: {option.duration}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">Rp{new Intl.NumberFormat("id-ID").format(option.price)}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Address Form Modal */}
              {showAddressForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-gray-900 p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                    <h2 className="text-h3 font-semibold mb-4">Tambah Alamat Baru</h2>
                    <form onSubmit={handleAddressSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          name="namaLengkap"
                          value={addressForm.namaLengkap}
                          onChange={handleAddressFormChange}
                          placeholder="Nama Lengkap *"
                          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 w-full"
                          required
                        />
                        <input
                          type="tel"
                          name="nomorTelepon"
                          value={addressForm.nomorTelepon}
                          onChange={handleAddressFormChange}
                          placeholder="Nomor Telepon *"
                          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 w-full"
                          required
                        />
                      </div>
                      
                      <input
                        type="email"
                        name="email"
                        value={addressForm.email}
                        onChange={handleAddressFormChange}
                        placeholder="Email *"
                        className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 w-full"
                        required
                      />
                      
                      <textarea
                        name="alamatLengkap"
                        value={addressForm.alamatLengkap}
                        onChange={handleAddressFormChange}
                        placeholder="Alamat Lengkap *"
                        rows="3"
                        className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 w-full"
                        required
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          name="provinsi"
                          value={addressForm.provinsi}
                          onChange={handleAddressFormChange}
                          placeholder="Provinsi"
                          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 w-full"
                          required
                        />
                        
                        <input
                          type="text"
                          name="kota"
                          value={addressForm.kota}
                          onChange={handleAddressFormChange}
                          placeholder="Kota/Kabupaten"
                          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 w-full"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          name="kecamatan"
                          value={addressForm.kecamatan}
                          onChange={handleAddressFormChange}
                          placeholder="Kecamatan *"
                          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 w-full"
                          required
                        />
                        <input
                          type="text"
                          name="kelurahan"
                          value={addressForm.kelurahan}
                          onChange={handleAddressFormChange}
                          placeholder="Kelurahan *"
                          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 w-full"
                          required
                        />
                      </div>
                      
                      <input
                        type="text"
                        name="kodePos"
                        value={addressForm.kodePos}
                        onChange={handleAddressFormChange}
                        placeholder="Kode Pos *"
                        className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 w-full"
                        required
                      />
                      
                      <div className="border-t border-gray-700 pt-4">
                        <h3 className="text-lg font-semibold mb-2">Data Opsional</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            name="namaPenerima"
                            value={addressForm.namaPenerima}
                            onChange={handleAddressFormChange}
                            placeholder="Nama Penerima (jika berbeda)"
                            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 w-full"
                          />
                          <input
                            type="tel"
                            name="nomorTeleponPenerima"
                            value={addressForm.nomorTeleponPenerima}
                            onChange={handleAddressFormChange}
                            placeholder="Nomor Telepon Penerima"
                            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 w-full"
                          />
                        </div>
                        
                        <textarea
                          name="instruksiKhusus"
                          value={addressForm.instruksiKhusus}
                          onChange={handleAddressFormChange}
                          placeholder="Instruksi Khusus Pengiriman"
                          rows="2"
                          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 w-full mt-4"
                        />
                        
                        <label className="flex items-center space-x-2 mt-4">
                          <input
                            type="checkbox"
                            name="isDefault"
                            checked={addressForm.isDefault}
                            onChange={handleAddressFormChange}
                            className="text-red-500"
                          />
                          <span>Jadikan alamat default</span>
                        </label>
                      </div>
                      
                      <div className="flex space-x-4 pt-4">
                        <button
                          type="submit"
                          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
                        >
                          Simpan Alamat
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
                        >
                          Batal
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Order Summary */}
            <div className="bg-gray-900 p-6 rounded-lg h-fit">
              <h2 className="text-h3 font-semibold mb-4">Ringkasan Pesanan</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  {checkoutData.product.imageUrls && checkoutData.product.imageUrls[0] && (
                    <div className="relative w-16 h-16 bg-gray-800 rounded-lg">
                      <Image
                        src={checkoutData.product.imageUrls[0]}
                        alt={checkoutData.product.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-semibold">{checkoutData.product.name}</div>
                    <div className="text-sm text-gray-400">Qty: {checkoutData.quantity}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">Rp{new Intl.NumberFormat("id-ID").format(subtotal)}</div>
                  </div>
                </div>
                
                <div className="border-t border-gray-700 pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Rp{new Intl.NumberFormat("id-ID").format(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ongkos Kirim</span>
                    <span>Rp{new Intl.NumberFormat("id-ID").format(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t border-gray-700 pt-2">
                    <span>Total</span>
                    <span>Rp{new Intl.NumberFormat("id-ID").format(total)}</span>
                  </div>
                </div>
                
                <button
                  onClick={handleProceedToPayment}
                  disabled={isProcessing || (shippingMethod === "DELIVERY" && (!selectedAddress || !selectedShipping))}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg mt-6"
                >
                  {isProcessing ? "Memproses..." : "Lanjut ke Pembayaran"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage; 