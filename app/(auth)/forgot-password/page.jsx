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
  const [verificationId, setVerificationId] = useState(null);
  
  // State untuk 4 kotak OTP
  const [otpDigits, setOtpDigits] = useState(Array(4).fill(''));
  const otpInputRefs = useRef([]);

  // State untuk UI dan Error
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmNewPasswordError, setConfirmNewPasswordError] = useState('');
  
  // State untuk Cooldown
  const [cooldown, setCooldown] = useState(0);

  // useEffect untuk timer cooldown
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const resetAllErrors = () => {
    setGeneralError('');
    setPhoneNumberError('');
    setOtpError('');
    setNewPasswordError('');
    setConfirmNewPasswordError('');
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setOtp(otpDigits.join(''));
  }, [otpDigits]);

  // Fungsi gabungan untuk meminta dan mengirim ulang OTP
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    resetAllErrors();

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await response.json();

      if (!response.ok) {
        setPhoneNumberError(data.message);
        if (response.status === 429) {
          const secondsToWait = parseInt(data.message.match(/\d+/)?.[0] || 60);
          setCooldown(secondsToWait);
        }
        throw new Error(data.message);
      }
      
      setVerificationId(data.verificationId);
      setCurrentStep('verify_otp');
      setCooldown(60); // Mulai cooldown 1 menit

    } catch (err) {
      if (!phoneNumberError) {
        setGeneralError(err.message || 'Terjadi kesalahan.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtpStep = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    resetAllErrors();

    if (otp.length !== 4) {
      setOtpError('Kode OTP harus 4 digit.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp, verificationId }),
      });
      const data = await response.json();

      if (!response.ok) {
        setOtpError(data.message);
        throw new Error(data.message);
      }
      setCurrentStep('set_new_password');
    } catch (err) {
      if (!otpError) {
        setGeneralError(err.message || 'Verifikasi OTP gagal.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    resetAllErrors();

    if (newPassword.length < 6) {
      setNewPasswordError('Password baru minimal 6 karakter.');
      setIsLoading(false);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setConfirmNewPasswordError('Konfirmasi password tidak cocok.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, newPassword }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal mereset password.');
      }

      alert('Password berhasil diubah! Silakan login kembali.');
      router.push('/login');
    } catch (err) {
      setGeneralError(err.message || 'Terjadi kesalahan saat mereset password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const newDigit = value.replace(/[^0-9]/g, '').slice(0, 1);
    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = newDigit;
    setOtpDigits(newOtpDigits);
    resetAllErrors();
    if (newDigit && index < 3) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text/plain').trim();
    if (pasteData.length === 4 && /^\d{4}$/.test(pasteData)) {
      const newOtpDigits = pasteData.split('');
      setOtpDigits(newOtpDigits);
      resetAllErrors();
      otpInputRefs.current[3]?.focus();
    } else {
      setOtpError('Format OTP tidak valid. Harap masukkan 4 digit angka.');
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
          <form onSubmit={handleRequestOtp} className="flex flex-col gap-4 w-full">
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
                onFocus={resetAllErrors}
                placeholder="08123456789"
                required
                className={`w-full bg-transparent py-1 border-b-1 ${phoneNumberError ? 'border-red-600' : 'border-gray-200'} text-white text-sh1 font-medium placeholder:font-normal focus:outline-none focus:border-white focus:border-b-2 focus:placeholder-transparent`}
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
          <form onSubmit={handleVerifyOtpStep} className="flex flex-col gap-4 w-full items-center">
            <h2 className="text-xl font-bold text-center text-white mb-2">Verifikasi Kode OTP</h2>
            <p className="text-center text-gray-200 mb-6">Sebuah kode telah dikirim ke {phoneNumber}.</p>
            <div className="flex justify-center gap-4 mb-4">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onFocus={resetAllErrors}
                  onPaste={index === 0 ? handleOtpPaste : undefined}
                  ref={(el) => (otpInputRefs.current[index] = el)}
                  required
                  className={`w-14 h-14 text-center text-white text-2xl font-medium border rounded-md ${otpError ? 'border-red-600' : 'border-gray-200'} bg-transparent focus:outline-none focus:border-white`}
                />
              ))}
            </div>
            {otpError && (
              <p className="text-red-500 text-xs mt-1 text-center">{otpError}</p>
            )}
            
            {/* Tombol Kirim Ulang dengan Cooldown */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => handleRequestOtp()}
                disabled={cooldown > 0 || isLoading}
                className="text-gray-300 text-sm hover:text-white underline disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {cooldown > 0 ? `Kirim ulang dalam ${cooldown} detik` : 'Kirim ulang kode'}
              </button>
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
                  onChange={(e) => setNewPassword(e.target.value)}
                  onFocus={resetAllErrors}
                  className={`w-full bg-transparent py-1 border-b-1 ${newPasswordError ? 'border-red-600' : 'border-gray-200'} text-white text-sh1 font-medium placeholder:font-normal focus:outline-none focus:border-white focus:border-b-2 focus:placeholder-transparent`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2"
                >
                  <Image
                    src={showPassword ? Hide : Show} 
                    alt="Toggle visibility"
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
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  onFocus={resetAllErrors}
                  className={`w-full bg-transparent py-1 border-b-1 ${confirmNewPasswordError ? 'border-red-600' : 'border-gray-200'} text-white text-sh1 font-medium placeholder:font-normal focus:outline-none focus:border-white focus:border-b-2 focus:placeholder-transparent`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2"
                >
                  <Image
                    src={showConfirmPassword ? Hide : Show} 
                    alt="Toggle visibility"
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
