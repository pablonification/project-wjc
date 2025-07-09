"use client";
import Image from "next/image";
import Link from "next/link";

const Button = ({ label, href, img }) => {
  return (
    <Link href={href}>
      <button className="py-2 px-4 bg-red-600 flex items-center gap-2 cursor-pointer font-manrope">
        <p className="text-white">{label}</p>
        {img && (
          <Image src={img} alt={`${label} icon`} width={20} height={20} />
        )}
      </button>
    </Link>
  );
};

export default Button;
