'use client';

import { useState, useRef, useEffect } from 'react';
import Image from "next/image";
import { MedDocs, Hide, Show } from "../../../public/assets/image";
import { Button } from "../../components";
import { useRouter } from 'next/navigation';

const ForgotPasswordPage = () => {
  const router = useRouter();

  // State untuk data flow
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [currentStep, setCurrentStep] = useState('input_phone');

  // State untuk mengelola box OTP
  const [otpDigits, setOtpDigits] = useState(Array(6).fill(''));
  const otpInputRefs = useRef([]);

  // State untuk UI dan Error
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmNewPasswordError, setConfirmNewPasswordError] = useState('');

  // Fungsi untuk mereset semua error spesifik dan umum
  const resetAllErrors = () => {
    setGeneralError('');
    setPhoneNumberError('');
    setOtpError('');
    setNewPasswordError('');
    setConfirmNewPasswordError('');
  };

  // Fungsi untuk show/hide password
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Kondisi utk memperbarui state 'otp' (string) setiap kali 'otpDigits' berubah
  useEffect(() => {
    setOtp(otpDigits.join(''));
  }, [otpDigits]);

  // Request link reset (mengirim OTP)
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    resetAllErrors();

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textError = await response.text();
        throw new Error(`Server returned non-JSON response: ${response.status} - ${textError.substring(0, 100)}...`);
      }

      if (!response.ok) {
        if (data.message.includes('telepon') || data.message.includes('terdaftar') || data.message.includes('valid')) {
          setPhoneNumberError(data.message);
        }
        setGeneralError(data.message);
        throw new Error(data.message);
      }
      setCurrentStep('verify_otp');
    } catch (err) {
      if (err instanceof SyntaxError || (err.message && err.message.includes('non-JSON response'))) {
        setGeneralError('Terjadi kesalahan pada server. Mohon coba lagi nanti.');
      } else {
        if (!phoneNumberError) {
          setGeneralError(err.message || 'Terjadi kesalahan saat meminta kode reset.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk verifikasi OTP
  const handleVerifyOtpStep = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    resetAllErrors();

    // Validasi: cek semua digit OTP sudah terisi
    if (otp.length !== 6) {
      setOtpError('Kode OTP harus 6 digit.');
      setGeneralError('Kode OTP harus 6 digit.');
      setIsLoading(false);
      return;
    }

    try {
      // Endpoint untuk verifikasi OTP
      const response = await fetch('/api/auth/verify-otp-for-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp }),
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textError = await response.text();
        throw new Error(`Server returned non-JSON response: ${response.status} - ${textError.substring(0, 100)}...`);
      }

      if (!response.ok) {
        if (data.message.includes('OTP')) {
          setOtpError(data.message);
        }
        setGeneralError(data.message);
        throw new Error(data.message);
      }
      setCurrentStep('set_new_password');
    } catch (err) {
      if (err instanceof SyntaxError || (err.message && err.message.includes('non-JSON response'))) {
        setGeneralError('Terjadi kesalahan pada server. Mohon coba lagi nanti.');
      } else {
        if (!otpError) {
          setGeneralError(err.message || 'Verifikasi OTP gagal.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk mengatur password baru
  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    resetAllErrors();

    // Validasi password baru
    if (newPassword.length < 6) {
      setNewPasswordError('Password baru minimal 6 karakter.');
      setGeneralError('Password baru minimal 6 karakter.');
      setIsLoading(false);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setConfirmNewPasswordError('Konfirmasi password tidak cocok.');
      setGeneralError('Konfirmasi password tidak cocok.');
      setIsLoading(false);
      return;
    }

    try {
      // Endpoint untuk reset password
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, newPassword }),
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textError = await response.text();
        throw new Error(`Server returned non-JSON response: ${response.status} - ${textError.substring(0, 100)}...`);
      }

      if (!response.ok) {
        if (data.message.includes('Password')) {
          setNewPasswordError(data.message);
        }
        setGeneralError(data.message);
        throw new Error(data.message);
      }

      router.push('/login');
    } catch (err) {
      if (err instanceof SyntaxError || (err.message && err.message.includes('non-JSON response'))) {
        setGeneralError('Terjadi kesalahan pada server. Mohon coba lagi nanti.');
      } else {
        if (!newPasswordError && !confirmNewPasswordError) {
          setGeneralError(err.message || 'Terjadi kesalahan saat mereset password.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handler untuk setiap input digit OTP
  const handleOtpChange = (index, value) => {
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
      newOtpDigits[index - 1] = '';
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
      setGeneralError('Format OTP tidak valid. Harap masukkan 6 digit angka.');
    }
  };


  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center max-w-xl p-12 rounded-xl shadow-lg">
        <Image
          src={MedDocs}
          alt="logo"
          width={100}
          height={100}
          className="mb-4"
        />
        <h1 className="text-[32px] md:text-display font-medium text-center text-white mb-6">
          Lupa Password MedDocs WJC
        </h1>

        {/* Input Nomor Telepon */}
        {currentStep === 'input_phone' && (
          <form onSubmit={handleRequestReset} className="flex flex-col gap-4 w-full">
            <h2 className="text-xl font-bold text-center text-white mb-2">Lupa Password</h2>
            <p className="text-center text-gray-200 mb-6">Masukkan nomor telepon Anda untuk menerima kode verifikasi.</p>
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
                <p className="text-red-600 text-xs mt-1">{phoneNumberError}</p>
              )}
            </div>
            <Button
              type="submit"
              label="Kirim Kode"
              isLoading={isLoading}
              disabled={isLoading}
            />
          </form>
        )}

        {/* Verifikasi OTP */}
        {currentStep === 'verify_otp' && (
          <form onSubmit={handleVerifyOtpStep} className="flex flex-col gap-4 w-full">
            <h2 className="text-xl font-bold text-center text-white mb-2">Verifikasi Kode OTP</h2>
            <p className="text-center text-gray-200 mb-6">Sebuah kode telah dikirim ke {phoneNumber}.</p>
            <div>
              <label htmlFor="otp" className="sr-only">Kode Verifikasi (OTP)</label>
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
                    required
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
              label="Verifikasi OTP"
              isLoading={isLoading}
              disabled={isLoading}
            />
          </form>
        )}

        {/* Atur Password Baru */}
        {currentStep === 'set_new_password' && (
          <form onSubmit={handleSetNewPassword} className="flex flex-col gap-4 w-full">
            <h2 className="text-xl font-bold text-center text-white mb-2">Atur Password Baru</h2>
            <p className="text-center text-gray-200 mb-6">Masukkan password baru Anda.</p>
            <div>
              <label htmlFor="newPassword" className="block text-b1 text-white mb-1">
                Password Baru
              </label>
              <div className='relative'>
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    resetAllErrors();
                  }}
                  onFocus={() => {
                    resetAllErrors();
                  }}
                  className={`
                    w-full py-1 border-b-1
                    ${newPasswordError ? 'border-red-600' : 'border-gray-200'}
                    text-white text-sh1 font-medium placeholder:font-normal
                    focus:outline-none focus:border-white focus:border-b-2
                    focus:placeholder-transparent
                  `}
                />
                <button
                  type="button"
                  onClick={handleClickShowPassword}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2"
                >
                  <Image
                    src={showPassword ? Hide : Show} 
                    alt={showPassword ? 'Hide password' : 'Show password'}
                    width={24}
                    height={24} 
                  />
                </button>
              </div>
              {newPasswordError && (
                <p className="text-red-600 text-xs mt-1">{newPasswordError}</p>
              )}
            </div>
            <div>
              <label htmlFor="confirmNewPassword" className="block text-b1 text-white mb-1">
                Konfirmasi Password Baru
              </label>
              <div className='relative'>
                <input
                  id="confirmNewPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmNewPassword}
                  onChange={(e) => {
                    setConfirmNewPassword(e.target.value);
                    resetAllErrors();
                  }}
                  onFocus={() => {
                    resetAllErrors();
                  }}
                  className={`
                    w-full py-1 border-b-1
                    ${confirmNewPasswordError ? 'border-red-600' : 'border-gray-200'}
                    text-white text-sh1 font-medium placeholder:font-normal
                    focus:outline-none focus:border-white focus:border-b-2
                    focus:placeholder-transparent
                  `}
                />
                <button
                  type="button"
                  onClick={handleClickShowConfirmPassword}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2"
                >
                  <Image
                    src={showConfirmPassword ? Hide : Show} 
                    alt={showConfirmPassword ? 'Hide password' : 'Show password'}
                    width={24}
                    height={24} 
                  />
                </button>
              </div>
              {confirmNewPasswordError && (
                <p className="text-red-600 text-xs mt-1">{confirmNewPasswordError}</p>
              )}
            </div>
            <Button
              type="submit"
              label="Reset Password"
              isLoading={isLoading}
              disabled={isLoading}
            />
          </form>
        )}

        {/* Link kembali ke halaman login */}
        <p className="text-center text-b2 text-gray-200 mt-8">
          <a href="/login" className="font-medium text-white hover:text-red-600 underline">
            Kembali ke Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;