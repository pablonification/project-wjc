"use client"
import Image from 'next/image';
import Link from 'next/link';
import { Location } from '../../public/assets/image';

const KegiatanContainer = (href) => {
  return (
    <Link href={href} className='flex gap-4'>
      <div>Image</div>
      <div>
        <p className='text-sh1'>12-15 Juli 2025</p>
        <p>lorem ipsum dolor sit amet</p>
        <div className='flex gap-2'>
          <Image src={Location} alt='location' width={20} height={20}/>
          <p className='text-gray-200'>Alamat Lokasi</p>
        </div>
      </div>
    </Link>
  )
}

export default KegiatanContainer 