import Image from 'next/image';
import { Hero, ArrowOutward } from '../../public/assets/image';
import { Button } from '../components';

const HeroSection = ({ content }) => {
  return (
    <section className='relative h-screen'>
      <Image
        src={content.heroImageUrl || Hero}
        alt={content.heroTitle || 'Gambar Latar'}
        fill
        className='z-0 object-cover'
        priority
      />
      <div className='absolute bottom-15 lg:bottom-20 left-6 lg:left-18 text-white flex flex-col gap-8 max-w-3/5'>
        <h1 className='text-h1 lg:text-[64px]'>{content.heroTitle}</h1>
        <p className='text-b1 lg:text-[20px]'>{content.heroDescription}</p>
        <Button label={content.heroButton} href="/login" img={ArrowOutward}/>
      </div>
    </section>
  );
}

export default HeroSection;