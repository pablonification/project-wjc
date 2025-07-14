'use client';

import { useState, useRef, useEffect } from 'react';
import Image from "next/image";
import { MedDocs } from "../../../public/assets/image";
import { Button } from "../../components";
import { useRouter } from 'next/navigation';

const RegisterPage = () => {
  // State untuk data registrasi
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  // State untuk mengelola 6 kotak OTP
  const [otpDigits, setOtpDigits] = useState(Array(6).fill('')); // Array untuk menyimpan setiap digit
  const otpInputRefs = useRef([]); // Ref untuk setiap input OTP

  // State untuk flow & UI
  const [currentStep, setCurrentStep] = useState('input_phone');
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [nameError, setNameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const router = useRouter();

  // Fungsi untuk mereset semua error spesifik dan umum
  const resetAllErrors = () => {
    setGeneralError('');
    setPhoneNumberError('');
    setOtpError('');
    setNameError('');
    setPasswordError('');
  };

  // Efek samping untuk memperbarui state 'otp' (string) setiap kali 'otpDigits' berubah
  useEffect(() => {
    setOtp(otpDigits.join(''));
  }, [otpDigits]);

  // Fungsi untuk meminta OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    resetAllErrors();

    try {
      const response = await fetch('/api/auth/check-whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.message.includes('telepon') || data.message.includes('whitelist') || data.message.includes('ditemukan') || data.message.includes('terdaftar')) {
          setPhoneNumberError(data.message);
        }
        setGeneralError(data.message);
        throw new Error(data.message);
      }
      setCurrentStep('verify_otp');
    } catch (err) {
      if (!phoneNumberError) {
        setGeneralError(err.message || 'Tidak bisa melakukan registrasi!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // handle verifikasi OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    resetAllErrors();

    // Validasi agar seluruh otp diisi
    if (otp.length !== 6) {
      setOtpError('Kode OTP harus 6 digit.');
      setGeneralError('Kode OTP harus 6 digit.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp }),
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.message.includes('OTP')) {
          setOtpError(data.message);
        }
        setGeneralError(data.message);
        throw new Error(data.message);
      }
      setCurrentStep('fill_details');
    } catch (err) {
      if (!otpError) {
        setGeneralError(err.message || 'Verifikasi OTP gagal.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    resetAllErrors();

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password, phoneNumber }),
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.message.includes('Nama')) {
          setNameError(data.message);
        } else if (data.message.includes('Password')) {
          setPasswordError(data.message);
        }
        setGeneralError(data.message);
        throw new Error(data.message);
      }

      router.push('/login');
    } catch (err) {
      if (!nameError && !passwordError) {
        setGeneralError(err.message || 'Terjadi kesalahan saat pendaftaran.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handler untuk setiap input digit OTP
  const handleOtpChange = (index, value) => {
    // Syarat agar hanya input angka
    const newDigit = value.replace(/[^0-9]/g, '').slice(0, 1);

    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = newDigit;
    setOtpDigits(newOtpDigits);
    resetAllErrors();

    if (newDigit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handler untuk backspace di input digit OTP
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
      const newOtpDigits = [...otpDigits];
      newOtpDigits[index - 1] = ''; // Hapus digit sebelumnya
      setOtpDigits(newOtpDigits);
      resetAllErrors();
    } else if (e.key === 'Backspace' && otpDigits[index]) {
      const newOtpDigits = [...otpDigits];
      newOtpDigits[index] = '';
      setOtpDigits(newOtpDigits);
      resetAllErrors();
    }
  };

  // Handler untuk paste di input digit OTP pertama
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text/plain').trim();
    if (pasteData.length === 6 && /^\d{6}$/.test(pasteData)) {
      const newOtpDigits = pasteData.split('');
      setOtpDigits(newOtpDigits);
      resetAllErrors();
      otpInputRefs.current[5]?.focus();
    } else {
      setOtpError('Format OTP tidak valid. Harap masukkan 6 digit angka.');
    }
  };


  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center max-w-2xl p-12 rounded-xl shadow-lg">
        <Image
          src={MedDocs}
          alt="logo"
          width={100}
          height={100}
          className="mb-4"
        />
        <h1 className="text-[32px] md:text-display font-medium text-center text-white mb-6">
          Daftar ke MedDocs WJC
        </h1>

        {/* Input Nomor Telepon */}
        {currentStep === 'input_phone' && (
          <form onSubmit={handleRequestOtp} className="flex flex-col gap-4 w-full">
            <div>
              <label htmlFor="phoneNumber" className="block text-b1 text-white mb-1">
                Nomor Telepon
              </label>
              <input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  resetAllErrors();
                }}
                onFocus={() => {
                  resetAllErrors();
                }}
                placeholder="08123456789"
                required
                className={`
                  w-full py-1 border-b-1
                  ${phoneNumberError ? 'border-red-600' : 'border-gray-200'}
                  text-white text-sh1 font-medium placeholder:font-normal
                  focus:outline-none focus:border-white focus:border-b-2
                  focus:placeholder-transparent
                `}
              />
              {phoneNumberError && (
                <p className="text-red-500 text-xs mt-1">{phoneNumberError}</p>
              )}
            </div>
            <Button
              type="submit"
              label="Kirim Kode OTP"
              isLoading={isLoading}
              disabled={isLoading}
            />
          </form>
        )}

        {/* Verifikasi OTP - Menggunakan 6 Kotak Input */}
        {currentStep === 'verify_otp' && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4 w-full">
            <h2 className="text-xl font-bold text-center text-white mb-2">Verifikasi Nomor Anda</h2>
            <p className="text-center text-gray-200 mb-6">Masukkan 6 digit kode yang dikirim ke <strong>{phoneNumber}</strong></p>
            <div>
              <label htmlFor="otp" className="sr-only">Kode OTP</label>
              <div className="flex justify-center gap-2 mb-4">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onFocus={() => resetAllErrors()}
                    onPaste={index === 0 ? handleOtpPaste : undefined}
                    ref={(el) => (otpInputRefs.current[index] = el)} 
                    className={`
                      w-10 h-10 text-center text-white text-sh1 font-medium
                      border-1 rounded-md
                      ${otpError ? 'border-red-600' : 'border-gray-200'}
                      bg-transparent focus:outline-none focus:border-white focus:border-b-2
                      focus:placeholder-transparent
                    `}
                    style={{ caretColor: 'white' }}
                  />
                ))}
              </div>
              {otpError && (
                <p className="text-red-500 text-xs mt-1 text-center">{otpError}</p>
              )}
            </div>
            <Button
              type="submit"
              label="Verifikasi"
              isLoading={isLoading}
              disabled={isLoading}
            />
          </form>
        )}

        {/* Lengkapi Data Diri */}
        {currentStep === 'fill_details' && (
          <form onSubmit={handleRegister} className="flex flex-col gap-4 w-full">
            <h2 className="text-xl font-bold text-center text-white mb-2">Lengkapi Data Diri</h2>
            <p className="text-center text-gray-200 mb-6">Satu langkah terakhir untuk menyelesaikan pendaftaran.</p>

            <div>
              <label htmlFor="name" className="block text-b1 text-white mb-1">
                Nama Lengkap
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  resetAllErrors();
                }}
                onFocus={() => {
                  resetAllErrors();
                }}
                className={`
                  w-full py-1 border-b-1
                  ${nameError ? 'border-red-600' : 'border-gray-200'}
                  text-white text-sh1 font-medium placeholder:font-normal
                  focus:outline-none focus:border-white focus:border-b-2
                  focus:placeholder-transparent
                `}
              />
              {nameError && (
                <p className="text-red-500 text-xs mt-1">{nameError}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-b1 text-white mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  resetAllErrors();
                }}
                onFocus={() => {
                  resetAllErrors();
                }}
                className={`
                  w-full py-1 border-b-1
                  ${passwordError ? 'border-red-600' : 'border-gray-200'}
                  text-white text-sh1 font-medium placeholder:font-normal
                  focus:outline-none focus:border-white focus:border-b-2
                  focus:placeholder-transparent
                `}
              />
              {passwordError && (
                <p className="text-red-600 text-xs mt-1">{passwordError}</p>
              )}
            </div>

            {generalError === "Semua field wajib diisi." && <p className="text-red-600 text-sm text-center mb-4">{generalError}</p>}

            <Button
              type="submit"
              label="Daftar"
              isLoading={isLoading}
              disabled={isLoading}
            />
          </form>
        )}

        {/* Link kembali ke halaman login */}
        {currentStep === 'input_phone' && (
          <div>
            <p className="text-center text-b2 text-gray-200 mt-8">
              Sudah punya akun?{' '}
              <a href="/login" className="font-medium text-white hover:text-red-600 underline">
                Login
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
