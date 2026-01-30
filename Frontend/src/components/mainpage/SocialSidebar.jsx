import React, { useState } from "react";
import {
  FaWhatsapp,
  FaInstagram,
  FaFacebookF,
  FaLinkedinIn,
  FaComments
} from "react-icons/fa";

const SocialSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Social Icons Container */}
      <div
        className={`
          fixed bottom-24 sm:bottom-28 right-3 sm:right-5 z-50
          flex flex-col items-center
          gap-3 sm:gap-5
          px-2.5 sm:px-4
          py-3 sm:py-5
          rounded-2xl sm:rounded-3xl
          bg-white/80 backdrop-blur-xl
          border border-white/40
          shadow-[0_18px_40px_rgba(0,0,0,0.25)]
          transition-all duration-500 ease-out
          ${isOpen
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-8 scale-95 pointer-events-none"}
        `}
      >
        {/* Instagram */}
        <SocialIcon
          href="https://www.instagram.com/goeventify/"
          bg="from-pink-500 to-orange-400"
        >
          <FaInstagram />
        </SocialIcon>

        {/* Facebook */}
        <SocialIcon
          href="https://www.facebook.com/profile.php?id=61585660263887"
          bg="from-blue-600 to-blue-500"
        >
          <FaFacebookF />
        </SocialIcon>

        {/* LinkedIn */}
        <SocialIcon
          href="https://www.linkedin.com/in/go-eventify/"
          bg="from-blue-700 to-indigo-600"
        >
          <FaLinkedinIn />
        </SocialIcon>

        {/* WhatsApp */}
        <SocialIcon
          href="https://wa.me/919076927464"
          bg="from-emerald-500 to-teal-400"
        >
          <FaWhatsapp />
        </SocialIcon>
      </div>

      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50
          p-3.5 sm:p-5
          rounded-full
          bg-slate-900
          text-white
          shadow-[0_12px_30px_rgba(0,0,0,0.6)]
          hover:scale-110
          transition-all duration-300
        "
        aria-label="Toggle social links"
      >
        <FaComments className="text-base sm:text-lg" />
      </button>
    </>
  );
};

/* Responsive Social Icon Component */
const SocialIcon = ({ href, children, bg }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`
      relative
      flex items-center justify-center
      w-9 h-9 sm:w-12 sm:h-12
      rounded-full
      bg-gradient-to-br ${bg}
      text-white
      text-sm sm:text-xl
      shadow-lg
      transition-all duration-300
      hover:scale-125 hover:-rotate-6
      group
    `}
  >
    {/* Glow Effect */}
    <span
      className="
        absolute inset-0 rounded-full
        opacity-0 group-hover:opacity-40
        blur-xl transition-all duration-300
        bg-white
      "
    />
    <span className="relative z-10">{children}</span>
  </a>
);

export default SocialSidebar;
