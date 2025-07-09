import { Navbar, Footer } from "../components";
import Image from "next/image";
import Link from "next/link";

const DocLink = ({ href, children }) => (
  <Link
    href={href}
    className="flex items-center justify-between py-4 text-h2 text-white group font-manrope"
  >
    <span className="group-hover:text-gray-300 transition-colors font-manrope">
      {children}
    </span>
    <Image
      src="/assets/image/ArrowOutward.png"
      alt="arrow"
      width={28}
      height={28}
      className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
    />
  </Link>
);

const docData = [
  {
    year: "2025",
    links: [
      "Lorem Ipsum Dolor Sit Amet",
      "Consectetur Adipiscing Elit",
      "Sed Do Eiusmod Tempor Incididunt",
      "Ut Labore Et Dolore Magna Aliqua",
      "Consectetur Adipiscing Elit",
      "Sed Do Eiusmod Tempor Incididunt",
      "Ut Labore Et Dolore Magna Aliqua",
      "Quis Odfficiis Consequat Duis Aute",
    ],
  },
  {
    year: "2024",
    links: [
      "Lorem ipsum dolor sit amet",
      "Consectetur adipiscing elit",
      "Sed do eiusmod tempor incididunt",
      "Ut labore et dolore magna aliqua",
      "Ut enim ad minim veniam",
      "Quis nostrud exercitation ullamco laboris",
      "Nisi ut aliquip ex ea commodo consequat",
      "Duis aute irure dolor in reprehenderit",
    ],
  },
];

export default function Dokumentasi() {
  return (
    <div className="bg-[#181818] min-h-screen flex flex-col font-manrope">
      <Navbar />

      <section className="bg-[#1F1F1F]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-28 py-24">
          <h1 className="text-display font-manrope font-bold text-white translate-y-16">
            Dokumentasi
          </h1>
        </div>
      </section>

      <section className="bg-black flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-28 py-24">
          {docData.map((section, sectionIndex) => (
            <div key={section.year} className={sectionIndex > 0 ? "mt-16" : ""}>
              <h2 className="text-h1 font-semibold text-gray-400 mb-6 font-manrope">
                {section.year}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24">
                {section.links.map((link) => (
                  <DocLink key={link} href="#">
                    {link}
                  </DocLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
