import Image from 'next/image';
import { ArrowOutward, MedDocs } from '../../../public/assets/image';
import { Button } from '../../components';

const TentangSection = ({ content }) => {
  return (
    <div className='flex flex-col-reverse items-center justify-center lg:flex-row gap-10 lg:px-40 px-5 py-10 bg-[#201F1E]'>
      <div className='flex flex-col gap-4 max-w-4xl'>
        <h1 className='text-h2 md:text-[32px] md:leading-[44px] text-white'>{content.tentangTitle}</h1>
        <p className='text-[16px] text-gray-100'>{content.tentangDescription}</p>
        <Button href="/" label={content.tentangButton} img={ArrowOutward}/>
      </div>
      <Image
        src={content.tentangImageUrl || MedDocs}
        alt={content.tentangTitle || 'Logo'}
        width={300}
        height={300}
        className='flex-shrink-0'
      />
    </div>
  );
}

export default TentangSection;