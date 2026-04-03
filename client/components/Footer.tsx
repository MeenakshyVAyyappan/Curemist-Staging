import { FiPhone, FiMail } from "react-icons/fi";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { Link } from "react-router-dom";

const legalLinks = [
  { label: "Contact Us", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Shipping Information", href: "/shipping-information" },
];

export default function Footer() {
  return (
    <footer className="bg-brand-yellow py-8 md:py-16 relative">
      <div className="container mx-auto px-4 md:px-6 lg:px-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 mb-8 md:mb-12">
          {/* Logo and Address */}
          <div className="lg:col-span-2">
            <img
              src="/Logo/curemist.svg"
              className="h-[50px] md:h-[62px] w-auto mb-4 md:mb-6"
            />
            <div className="space-y-3">
              <div className="flex flex-row gap-16">
                {/* Marketed By Section */}
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-semibold text-black tracking-wide">
                    MARKETED BY
                  </p>
                  <a
                    href="https://www.altuspharma.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block hover:opacity-80 transition-opacity"
                  >
                    <img
                      src="/Marketed&Manufactured/Marketedby.png"
                      alt="Altus Pharma Logo"
                      className="h-12 w-auto object-contain"
                    />
                  </a>
                  <p className="text-xs font-semibold text-black tracking-wide">
                    Address
                  </p>
                  <p className="text-sm text-black font-semibold">
                    13/223 B,C, Sukapuram Complex, <br />
                    Near Chambaramanam Temple, Naduvattom, Sugapuram PO, <br />
                    Edappal, Kerala 679576
                  </p>
                </div>

                {/* Manufactured By Section */}
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-semibold text-black uppercase tracking-wide">
                    MANUFACTURED BY
                  </p>
                  <a
                    href="https://www.arobel.net/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block hover:opacity-80 transition-opacity"
                  >
                    <img
                      src="/Marketed&Manufactured/Manufacturedby.png"
                      alt="Arobel Logo"
                      className="h-12 w-auto object-contain"
                    />
                  </a>
                  <p className="text-xs font-semibold text-black tracking-wide">
                    Address
                  </p>
                  <p className="text-sm text-black font-semibold">
                    Arobel International Pvt Ltd
                    <br />
                    Door No: S-08, Meridian Guruplaza, Bejai, Mangalore- 575004.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-sm md:text-base font-extrabold text-black mb-3 md:mb-4 uppercase tracking-wide">
              Quick Links
            </p>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-xs md:text-sm font-medium text-black hover:underline underline-offset-2 transition-all"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-3 md:gap-4">
              <a
                href="tel:+918848815296"
                className="inline-flex items-center justify-center bg-brand-blue text-white rounded-full p-2"
              >
                <FiPhone size={16} className="md:w-[18px] md:h-[18px]" />
              </a>
              <a
                href="tel:+918848815296"
                className="text-base md:text-lg font-medium text-black"
              >
                +91 88488 15296
              </a>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <a
                href="mailto:contact@altuspharma.in"
                className="inline-flex items-center justify-center bg-brand-blue text-white rounded-full p-2"
              >
                <FiMail size={16} className="md:w-[18px] md:h-[18px]" />
              </a>
              <a
                href="mailto:contact@altuspharma.in"
                className="text-base md:text- font-medium text-black"
              >
                contact@altuspharma.in
              </a>
            </div>
            <div>
              <p className="text-sm md:text-base font-medium text-black mb-2 md:mb-3">
                Follow us :
              </p>
              <div className="flex items-center gap-2 md:gap-3">
                <a
                  href="https://www.facebook.com/share/1aPSJ1o8UQ/?mibextid=wwXIfr"
                  className="hover:opacity-80 transition-opacity"
                >
                  <span className="inline-flex items-center justify-center bg-brand-blue text-white rounded-full p-2">
                    <FaFacebookF size={16} />
                  </span>
                </a>
                <a
                  href="https://www.instagram.com/curemist_official?igsh=YzNqZmtweTR4MWpt&utm_source=qr"
                  className="hover:opacity-80 transition-opacity"
                >
                  <span className="inline-flex items-center justify-center bg-brand-blue text-white rounded-full p-2">
                    <FaInstagram size={16} />
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
        {/* Divider */}
        <div className="h-px bg-[#BE8F00] mb-6 md:mb-8"></div>
        {/* Copyright */}
        <div className="text-center">
          <p className="text-sm md:text-lg font-medium text-black">
            © 2025 CureMist. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
