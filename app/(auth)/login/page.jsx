'use client';
import Image from "next/image";
import { MedDocs, Hide, Show } from "../../../public/assets/image";
import {Button } from "../../components";
import { useSession } from "../../context/SessionContext";


import { useState } from 'react';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const { fetchSession } = useSession();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const router = useRouter();
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setPhoneNumberError('');
    setPasswordError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, password }),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchSession(); 
        router.push('/dashboard');
      } else {
        if (data.message === 'No. telpon tidak ditemukan.') {
          setPhoneNumberError(data.message);
        } else if (data.message === 'Password salah.') {
          setPasswordError(data.message);
        } else if (data.message === 'Nomor telepon dan password wajib diisi.') {
          setError(data.message);
        } else if (data.message === 'Kredensial tidak valid.') {
          setPhoneNumberError(data.message);
          setError(data.message);  
        } else {
          setError('Terjadi kesalahan yang tidak diketahui.');
        }
      }
    } catch (err) {
      console.error('Network error or unexpected error:', err);
      setError('Terjadi kesalahan pada koneksi atau server.');
    } finally {
      setIsLoading(false);
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
          Login ke MedDocs WJC
        </h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full">
          <div>
            <label htmlFor="phoneNumber" className="block text-b1fsg text-white mb-1">
              Nomor Telepon
            </label>
            <input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
              }}
              onFocus={() => {
                setPhoneNumberError('');
                setError('');
              }}
              placeholder="08123456789"
              className={`w-full py-1 border-b-1 ${
                phoneNumberError ? 'border-red-600' : 'border-gray-200'
              } text-white text-sh1 font-medium placeholder:font-normal focus:outline-none focus:border-white focus:border-b-2 focus:placeholder-transparent`}
            />
            {phoneNumberError && (
              <p className="text-red-500 text-xs mt-1">{phoneNumberError}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-b1 text-white mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                placeholder="********"
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                onFocus={() => {
                  setPasswordError('');
                  setError('');
                }}
                className={`w-full py-1 border-b-1 ${
                  passwordError ? 'border-red-600' : 'border-gray-200'
                } text-white text-sh1 font-medium placeholder:font-normal focus:outline-none focus:border-white focus:border-b-2 focus:placeholder-transparent`}
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
            {passwordError && (
              <p className="text-red-600 text-xs mt-1">{passwordError}</p>
            )}
          </div>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <Button
            type="submit"
            label="Login"
            isLoading={isLoading}
            disabled={isLoading}
          />
        </form>
        
        <div className="flex flex-col gap-4">
          <p className="text-center text-b2 text-gray-200 mt-8">
            Tidak Punya Akun?{' '}
            <a href="/register" className="font-medium text-white hover:text-red-600 underline">
              Daftar
            </a>
          </p>
          <p className="text-center text-b2 text-gray-200">
            Lupa {' '}
            <a href="/forgot-password" className="font-medium text-white hover:text-red-600 underline">
              Kata Sandi?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;