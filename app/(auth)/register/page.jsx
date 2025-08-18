'use client';

import { useState, useRef, useEffect } from 'react';
import Image from "next/image";
import { MedDocs, Hide, Show } from "../../../public/assets/image";
import { Button } from "../../components";
import { useRouter } from 'next/navigation';

const RegisterPage = () => {
  const router = useRouter();
  // State untuk data registrasi
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [chapter, setChapter] = useState('Bandung');
  const [password, setPassword] = useState('');
  const [ktpFile, setKtpFile] = useState(null);
  const [ktpUrl, setKtpUrl] = useState('');
  const [ktpPreview, setKtpPreview] = useState('');
  const [showKtpModal, setShowKtpModal] = useState(false);
  const [ktpPublicId, setKtpPublicId] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [nameError, setNameError] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [chapterError, setChapterError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [ktpError, setKtpError] = useState('');

  const [otpDigits, setOtpDigits] = useState(Array(6).fill(''));
  const otpInputRefs = useRef([]);

  // State untuk flow & UI
  const [currentStep, setCurrentStep] = useState('input_phone');
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [resendOtpMessage, setResendOtpMessage] = useState('');
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const resetAllErrors = () => {
    setGeneralError('');
    setPhoneNumberError('');
    setOtpError('');
    setNameError('');
    setNicknameError('');
    setChapterError('');
    setPasswordError('');
    setKtpError('');
  };

  useEffect(() => {
    setOtp(otpDigits.join(''));
  }, [otpDigits]);

  const handleRequestOtp = async (e, isResend = false) => {
    if (e) e.preventDefault();
    
    if (isResend) {
      setIsResendingOtp(true);
      setResendOtpMessage('');
    } else {
      setIsLoading(true);
    }
    resetAllErrors();

    try {
      const response = await fetch('/api/auth/check-whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || 'Gagal mengirim kode.';
        if (isResend) {
            setResendOtpMessage(errorMessage);
        } else {
            setPhoneNumberError(errorMessage);
        }
        if (response.status === 429) {
          const secondsToWait = parseInt(data.message.match(/\d+/)?.[0] || 60);
          setCooldown(secondsToWait);
        }
        throw new Error(errorMessage);
      }
      
      setCooldown(60);

      if (isResend) {
        setResendOtpMessage('Kode OTP berhasil dikirim ulang.');
      } else {
        setCurrentStep('verify_otp');
      }

    } catch (err) {
      if (!isResend && !phoneNumberError) {
        setGeneralError(err.message || 'Tidak bisa melakukan registrasi!');
      }
    } finally {
      if (isResend) {
        setIsResendingOtp(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    resetAllErrors();

    if (otp.length !== 6) {
      setOtpError('Kode OTP harus 6 digit.');
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
        setOtpError(data.message);
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

  const handleKtpUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const res = await fetch(url, { method: 'POST', body: formData });
    const data = await res.json();
    if (data.secure_url && data.public_id) {
      setKtpPublicId(data.public_id);
      return data;
    }
    throw new Error('Gagal upload foto KTP');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    resetAllErrors();

    if (!name || !nickname || !chapter || !password || (!ktpFile && !ktpUrl)) {
      if (!name) setNameError('Nama Lengkap wajib diisi.');
      if (!nickname) setNicknameError('Nama Panggilan wajib diisi.');
      if (!chapter) setChapterError('Asal Chapter wajib diisi.');
      if (!password) setPasswordError('Password wajib diisi.');
      if (!ktpFile && !ktpUrl) setKtpError('Foto KTP wajib diupload.');
      setIsLoading(false);
      return;
    }

    try {
      let uploadedKtpUrl = ktpUrl;
      let uploadedKtpPublicId = ktpPublicId;

      if (!ktpUrl && ktpFile) {
        const data = await handleKtpUpload(ktpFile);
        uploadedKtpUrl = data.secure_url;
        uploadedKtpPublicId = data.public_id;
        setKtpUrl(uploadedKtpUrl);
        setKtpPublicId(uploadedKtpPublicId);
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, nickname, chapter, password, phoneNumber, ktpUrl: uploadedKtpUrl, ktpPublicId: uploadedKtpPublicId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Terjadi error: ${response.status}`);
      }
      
      setTimeout(() => {
        router.push('/login');
      }, 1500);

    } catch (err) {
      setGeneralError(err.message || 'Terjadi kesalahan saat pendaftaran.');
    } finally {
      // setIsLoading(false); 
    }
  };

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

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

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
        {currentStep !== 'verify_otp' && (
          <>
            <Image src={MedDocs} alt="logo" width={100} height={100} className="mb-4" />
            <h1 className="text-[32px] md:text-display font-medium text-center text-white mb-6">Daftar ke MedDocs WJC</h1>
          </>
        )}

        {currentStep === 'input_phone' && (
          <form onSubmit={handleRequestOtp} className="flex flex-col gap-4 w-full">
            <div>
              <label htmlFor="phoneNumber" className="block text-b1 text-white mb-1">Nomor Telepon</label>
              <input id="phoneNumber" type="tel" value={phoneNumber} onChange={(e) => { setPhoneNumber(e.target.value); resetAllErrors(); }} onFocus={resetAllErrors} placeholder="08123456789" required className={`w-full bg-transparent py-1 border-b-1 ${phoneNumberError ? 'border-red-600' : 'border-gray-200'} text-white text-sh1 font-medium placeholder:font-normal focus:outline-none focus:border-white focus:border-b-2 focus:placeholder-transparent`} />
              {phoneNumberError && (<p className="text-red-500 text-xs mt-1">{phoneNumberError}</p>)}
            </div>
            <Button type="submit" label="Kirim Kode OTP" isLoading={isLoading} disabled={isLoading} />
          </form>
        )}

        {currentStep === 'verify_otp' && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col items-stretch justify-center w-full max-w-md mx-auto gap-6 pt-24">
            <h2 className="text-h2 md:text-h1 font-semibold text-center text-white mb-4 leading-snug">
              Masukkan Kode 6-Digit yang<br />dikirim ke {phoneNumber}
            </h2>
            <div className="flex justify-center gap-2 md:gap-4 mb-2">
              {otpDigits.map((digit, index) => (
                <input key={index} id={`otp-${index}`} type="text" maxLength="1" value={digit} onChange={(e) => handleOtpChange(index, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(index, e)} onFocus={resetAllErrors} onPaste={index === 0 ? handleOtpPaste : undefined} ref={(el) => (otpInputRefs.current[index] = el)} className={`w-12 h-12 md:w-14 md:h-14 text-center text-white text-2xl font-medium tracking-widest border border-white bg-transparent ${otpError ? 'border-red-600' : 'border-white'} focus:outline-none focus:border-red-500 transition-all`} style={{ caretColor: 'white', boxShadow: 'none' }} />
              ))}
            </div>
            {otpError && (<p className="text-red-500 text-xs mt-1 text-center">{otpError}</p>)}
            <button type="button" onClick={() => handleRequestOtp(null, true)} disabled={isLoading || isResendingOtp || cooldown > 0} className="text-gray-300 text-sm mb-2 hover:text-white underline disabled:opacity-60 disabled:cursor-not-allowed">
              {isResendingOtp ? 'Mengirim ulang...' : cooldown > 0 ? `Kirim ulang dalam ${cooldown} detik` : 'Kirim ulang kode'}
            </button>
            {resendOtpMessage && (<p className={`text-xs text-center mb-1 ${resendOtpMessage.includes('berhasil') ? 'text-green-400' : 'text-red-500'}`}>{resendOtpMessage}</p>)}
            <Button type="submit" label="Daftar" isLoading={isLoading} disabled={isLoading} className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-md mt-2" />
            <p className="text-center text-b2 text-gray-200 mt-8">
              Sudah punya akun?{' '}
              <a href="/login" className="font-medium text-white hover:text-red-600 underline">Login</a>
            </p>
          </form>
        )}

        {currentStep === 'fill_details' && (
          <form onSubmit={handleRegister} className="flex flex-col gap-4 w-full">
            <h2 className="text-xl font-bold text-center text-white mb-2">Lengkapi Data Diri</h2>
            <p className="text-center text-gray-200 mb-6">Satu langkah terakhir untuk menyelesaikan pendaftaran.</p>
            {generalError && <p className="text-red-500 text-sm text-center mb-4">{generalError}</p>}
            <div>
              <label htmlFor="name" className="block text-b1 text-white mb-1">Nama Lengkap</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} onFocus={resetAllErrors} className={`w-full bg-transparent py-1 border-b-1 ${nameError ? 'border-red-600' : 'border-gray-200'} text-white text-sh1 font-medium focus:outline-none focus:border-white focus:border-b-2`} />
              {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
            </div>
            <div>
              <label htmlFor="nickname" className="block text-b1 text-white mb-1">Nama Panggilan</label>
              <input id="nickname" type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} onFocus={resetAllErrors} className={`w-full bg-transparent py-1 border-b-1 ${nicknameError ? 'border-red-600' : 'border-gray-200'} text-white text-sh1 font-medium focus:outline-none focus:border-white focus:border-b-2`} />
              {nicknameError && <p className="text-red-500 text-xs mt-1">{nicknameError}</p>}
            </div>
            <div>
              <label htmlFor="chapter" className="block text-b1 text-white mb-1">Asal Chapter</label>
              <select id="chapter" value={chapter} onChange={(e) => setChapter(e.target.value)} onFocus={resetAllErrors} className={`w-full bg-black py-1 border-b-1 ${chapterError ? 'border-red-600' : 'border-gray-200'} text-white text-sh1 font-medium focus:outline-none focus:border-white focus:border-b-2`}>
                <option value="Bandung">Bandung</option>
                <option value="Tasik">Tasik</option>
                <option value="Garut">Garut</option>
              </select>
              {chapterError && <p className="text-red-500 text-xs mt-1">{chapterError}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block text-b1 text-white mb-1">Password</label>
              <div className='relative'>
                <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} onFocus={resetAllErrors} className={`w-full bg-transparent py-1 border-b-1 ${passwordError ? 'border-red-600' : 'border-gray-200'} text-white text-sh1 font-medium focus:outline-none focus:border-white focus:border-b-2`} />
                <button type="button" onClick={handleClickShowPassword} className="absolute right-0 top-1/2 -translate-y-1/2 p-2">
                  <Image src={showPassword ? Hide : Show} alt="Toggle visibility" width={24} height={24} />
                </button>
              </div>
              {passwordError && <p className="text-red-600 text-xs mt-1">{passwordError}</p>}
            </div>
            <div>
              <label htmlFor="ktp" className="block text-b1 text-white mb-1">Foto KTP</label>
              <div className="flex items-center gap-4">
                <label htmlFor="ktp" className="px-4 py-2 bg-white text-black cursor-pointer font-semibold border border-gray-300 hover:bg-gray-200 transition">
                  Pilih File
                  <input id="ktp" type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files[0];
                    setKtpFile(file);
                    setKtpUrl('');
                    if (file) {
                      setKtpPreview(URL.createObjectURL(file));
                    }
                  }} className="hidden" />
                </label>
                {ktpFile ? (
                  <button type="button" className="text-blue-400 underline text-sm" onClick={() => setShowKtpModal(true)}>{ktpFile.name}</button>
                ) : (
                  <span className="text-white text-sm">Belum ada file dipilih</span>
                )}
              </div>
              {ktpError && <p className="text-red-500 text-xs mt-1">{ktpError}</p>}
              {showKtpModal && ktpPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={() => setShowKtpModal(false)}>
                  <div className="rounded-lg p-4" onClick={e => e.stopPropagation()}>
                    <img src={ktpPreview} alt="Preview KTP" className="max-h-[80vh] max-w-[90vw] object-contain" />
                    <Button type="button" label="Tutup" onClick={() => setShowKtpModal(false)} className="mt-4" />
                  </div>
                </div>
              )}
            </div>
            <Button type="submit" label="Daftar" isLoading={isLoading} disabled={isLoading} />
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;