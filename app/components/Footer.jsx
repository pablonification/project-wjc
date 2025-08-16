import Image from "next/image";
import { Instagram, Facebook, Youtube } from "../../public/assets/image";

const Footer = () => {
  return (
    <footer className="p-6 flex flex-col items-center gap-2 bg-black border-t-2 border-gray-700">
      <div className="flex gap-2">
        <a href="https://www.instagram.com/meddocs_wjc/">
          <Image src={Instagram} alt="instagram" />
        </a>
        <a href="https://www.instagram.com/meddocs_wjc/">
          <Image src={Facebook} alt="facebook" />
        </a>
        <a href="https://www.instagram.com/meddocs_wjc/">
          <Image src={Youtube} alt="youtube" />
        </a>
      </div>
      <p className="text-b2 text-gray-200 font-manrope">
        © 2025 MedDocs WJC. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
