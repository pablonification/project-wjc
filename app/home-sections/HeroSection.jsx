'use client'

import React from 'react'
import Image from 'next/image';
import {Hero, ArrowOutward} from '../../public/assets/image'
import {Button} from '../components'

const HeroSection = () => {
  const heroContent = {
    title: "Lorem Ipsum", 
    description: "Lorem ipsum dolor sit amet consectetur. Aliquam aliquam in faucibus pretium sit habitant vitae sollicitudin. Lobortis nisl tristique suscipit urna nullam.",
    button: "Call to action",
  };
  return (
    <section className='relative h-screen'>
      <Image
        src={Hero}
        alt='hero'
        fill
        className='z-0 object-cover'
      />
      <div className='absolute bottom-32 left-18 text-white flex flex-col gap-8 max-w-3/5'>
        <h1 className='text-h1 lg:text-[64px]'>{heroContent.title}</h1>
        <p className='text-b1 lg:text-[20px]'>{heroContent.description}</p>
        <Button label={heroContent.button} href="/login" img={ArrowOutward}/>
      </div>
    </section>
  )
}

export default HeroSection