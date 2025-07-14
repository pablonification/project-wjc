"use client";
import Image from "next/image";
import Link from "next/link";

const Button = ({ label, href, img, onClick, type = 'button', disabled, isLoading }) => {
  const buttonContent = (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`py-3 px-4 lg:px-5 bg-red-600 flex items-center gap-2 cursor-pointer font-manrope min-w-[100px] justify-center
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2'}
         shadow-sm text-white font-semibold
      `} 
    >
      <p className="text-white text-b1">
        {isLoading ? 'Memproses...' : label}
      </p>
      {img && (
        <Image src={img} alt={`${label} icon`} width={20} height={20} />
      )}
    </button>
  );

  return href ? <Link href={href}>{buttonContent}</Link> : buttonContent;
};

export default Button;
