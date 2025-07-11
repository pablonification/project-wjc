import Image from 'next/image';
import {ArrowOutward, MedDocs} from '../../public/assets/image'
import {Button} from '../components' 

const TentangSection = () => {
  const tentangContent = {
    title: "Kami adalah MedDocs WJC",
    deskripsi: "Lorem ipsum dolor sit amet consectetur. Rhoncus fringilla ipsum tellus semper a eget malesuada. Pulvinar pellentesque urna nunc quis in facilisi est fermentum. Arcu sed quis consectetur risus risus neque vestibulum massa cras. Malesuada ullamcorper non ac gravida aliquam enim nam morbi neque.",
    button: "Call to Action"
  }
  return (
    <div className='flex flex-col-reverse items-center justify-center lg:flex-row gap-10 lg:px-40 px-5 py-20 bg-[#201F1E]'>
      <div className='flex flex-col gap-4 max-w-4xl'>
        <h1 className='text-[32px] leading-[44px] text-white'>{tentangContent.title}</h1>
        <p className='text-[16px] text-gray-100'>{tentangContent.deskripsi}</p>
        <Button href="/" label={tentangContent.button} img={ArrowOutward}/>
      </div>
      <Image
        src={MedDocs}
        alt='logo'
        width={300}
        height={300}
        className='flex-shrink-0'
      />
    </div>
  )
}

export default TentangSection