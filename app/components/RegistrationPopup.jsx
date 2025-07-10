"use client";
import { useState } from "react";

const EyeIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
    <path
      fillRule="evenodd"
      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
      clipRule="evenodd"
    />
  </svg>
);

const CloseIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const InputField = ({
  label,
  type,
  placeholder,
  name,
  value,
  onChange,
  error,
  isPassword,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-b2 text-gray-200 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={isPassword ? (isPasswordVisible ? "text" : "password") : type}
          id={name}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full bg-transparent border-b text-b1 text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors ${
            error ? "border-red-400" : "border-gray-700"
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400 hover:text-white"
          >
            <EyeIcon className="h-5 w-5" />
          </button>
        )}
      </div>
      {error && <p className="text-red-400 text-b2 mt-1">{error}</p>}
    </div>
  );
};

export default function RegistrationPopup({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-start pt-20 z-50 font-manrope overflow-y-auto">
      <div className="bg-[#1F1F1F] text-white p-8 rounded-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <CloseIcon className="w-6 h-6" />
        </button>
        <h2 className="text-h2 font-bold mb-6">Daftar Kegiatan</h2>
        <form>
          <InputField
            label="Nama Lengkap*"
            type="text"
            placeholder="Contoh: John Doe"
            name="name"
          />
          <InputField
            label="Email*"
            type="email"
            placeholder="Contoh: nama@domain.com"
            name="email"
          />
          <InputField
            label="No. Telpon WA*"
            type="tel"
            placeholder="(+62) 812-3456-7890"
            name="phone"
          />
          <InputField
            label="Password*"
            type="password"
            placeholder="Masukkan password Anda"
            name="password"
            isPassword
          />
          <InputField
            label="Konfirmasi Password*"
            type="password"
            placeholder="Masukkan ulang password Anda"
            name="confirmPassword"
            isPassword
          />
          <InputField
            label="Kode Akses Member*"
            type="text"
            placeholder="arqilasp"
            name="accessCode"
          />
          <div className="flex items-start mt-6 mb-8">
            <input
              type="checkbox"
              id="terms"
              name="terms"
              className="mt-1 h-4 w-4 rounded bg-transparent border-gray-500 text-red-600 focus:ring-red-500"
            />
            <label htmlFor="terms" className="ml-3 block text-b2 text-gray-200">
              Saya telah membaca dan menyetujui Syarat dan Ketentuan ini, serta
              sepenuhnya memahami dan menerima segala kebijakan yang berlaku.
            </label>
          </div>
          <button
            type="submit"
            className="w-full bg-red-600 text-white text-sh1 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Daftar
          </button>
        </form>
      </div>
    </div>
  );
}
