'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "../../components";
const ChangePasswordClient = ({ userPhoneNumber }) => {
  const router = useRouter();

  // State untuk data flow
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // State untuk UI dan Error
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmNewPasswordError, setConfirmNewPasswordError] = useState('');

  const resetAllErrors = () => {
    setGeneralError('');
    setNewPasswordError('');
    setConfirmNewPasswordError('');
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
        body: JSON.stringify({ phoneNumber: userPhoneNumber, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal mereset password.');
      }

      alert('Password berhasil diubah!');
      router.push('/login');

    } catch (err) {
      setGeneralError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

    return (
    <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center w-full max-w-xl p-8 rounded-xl shadow-lg"> {/* Kurangi padding */}
        <h1 className="text-h1 font-semibold text-center text-white mb-12">Ubah Password</h1> {/* Kurangi margin */}
        <form onSubmit={handleSetNewPassword} className="flex flex-col gap-8 w-full"> {/* Kurangi gap */}
            {generalError && <p className="text-red-500 text-sm text-center">{generalError}</p>}
            <div>
            <label htmlFor="newPassword" className="block text-b1 text-white mb-2"> {/* Kurangi margin */}
                Password Baru
            </label>
            <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onFocus={resetAllErrors}
                className={`w-full bg-transparent py-1 border-b-1 ${newPasswordError ? 'border-red-600' : 'border-gray-200'} text-white text-sh1 font-medium placeholder:font-normal focus:outline-none focus:border-white focus:border-b-2`}
            />
            {newPasswordError && <p className="text-red-600 text-xs mt-1">{newPasswordError}</p>}
            </div>
            <div>
            <label htmlFor="confirmNewPassword" className="block text-b1 text-white mb-2"> {/* Kurangi margin */}
                Konfirmasi Password Baru
            </label>
            <input
                id="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                onFocus={resetAllErrors}
                className={`w-full bg-transparent py-1 border-b-1 ${confirmNewPasswordError ? 'border-red-600' : 'border-gray-200'} text-white text-sh1 font-medium placeholder:font-normal focus:outline-none focus:border-white focus:border-b-2`}
            />
            {confirmNewPasswordError && <p className="text-red-600 text-xs mt-1">{confirmNewPasswordError}</p>}
            </div>
            <Button
            type="submit"
            label={isLoading ? "Menyimpan..." : "Simpan Password"}
            isLoading={isLoading}
            disabled={isLoading}
            />
        </form>
        </div>
    </div>
    );
};
export default ChangePasswordClient;