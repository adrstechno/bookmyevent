import React from "react";
import {
  FaWhatsapp,
  FaInstagram,
  FaFacebookF,
  FaLinkedinIn,
} from "react-icons/fa";

const SocialSidebar = () => {
  return (
    <>
      {/* Floating Social Sidebar */}
      <div
        className="
          fixed top-1/2 right-0 z-50 flex flex-col items-center gap-4
          -translate-y-1/2 bg-white/90 backdrop-blur-xl
          px-3 py-5 rounded-l-3xl shadow-xl border border-gray-200
          animate-[float_6s_ease-in-out_infinite]
        "
      >
        {/* WhatsApp (New!) */}
        <SocialIcon
          href="https://wa.me/919201976523?text=Hi!%20I%20am%20interested%20in%20your%20event%20services"
          bg="bg-gradient-to-br from-green-500 to-green-400"
          glow="shadow-green-400/50"
        >
          <FaWhatsapp size={15} />
        </SocialIcon>

        {/* Instagram */}
        <SocialIcon
          href="https://www.instagram.com/goeventify/"
          bg="bg-gradient-to-br from-pink-500 to-orange-400"
          glow="shadow-orange-400/50"
        >
          <FaInstagram size={15} />
        </SocialIcon>

        {/* Facebook */}
        <SocialIcon
          href="https://www.facebook.com/profile.php?id=61585660263887"
          bg="bg-blue-600"
          glow="shadow-blue-400/50"
        >
          <FaFacebookF size={15} />
        </SocialIcon>

        {/* LinkedIn */}
        <SocialIcon
          href="https://www.linkedin.com/in/go-eventify/"
          bg="bg-blue-700"
          glow="shadow-blue-500/50"
        >
          <FaLinkedinIn size={15} />
        </SocialIcon>
      </div>
    </>
  );
};

/* ---- Reusable Social Icon Component ---- */
const SocialIcon = ({ href, children, bg, glow }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`
      relative p-3 rounded-full text-white ${bg}
      shadow-lg hover:shadow-xl
      hover:${glow}
      transition-all duration-300
      hover:scale-125 hover:rotate-6
      group animate-[bounce_3s_ease-in-out_infinite]
    `}
  >
    {/* Glow Ring */}
    <span
      className="
        absolute inset-0 rounded-full opacity-0
        group-hover:opacity-40 blur-xl
        transition-all duration-300
        bg-white
      "
    ></span>

    {/* Icon */}
    <span className="relative z-10">{children}</span>
  </a>
);

export default SocialSidebar;
