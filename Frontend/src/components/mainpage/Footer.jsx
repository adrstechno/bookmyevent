import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-[#1b2d2f] to-[#264043] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* About */}
        <div>
<h3 className="flex items-center justify-start gap-2 text-2xl font-bold mb-4">
  <img
    src="/logo2.png"
    alt="GoEventify Logo"
    className="w-8 h-8 object-contain hover:scale-110 transition-transform duration-300"
  />
  <span className="text-[#f9a826]">GoEventify</span>
</h3>



          <p className="text-gray-300 text-sm leading-relaxed">
           GoEventify helps you create extraordinary experiences — from weddings to corporate events.
            Connect with trusted vendors, venues, and planners — all in one place.
          </p>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-xl font-semibold mb-4">Services</h4>
         
<ul className="space-y-2 text-gray-300 text-sm">
  <li>
    <Link to="/category/weddings" className="hover:text-[#f9a826] transition">
      Wedding Management
    </Link>
  </li>

  <li>
    <Link to="/category/corporate-events" className="hover:text-[#f9a826] transition">
      Corporate Events
    </Link>
  </li>

  <li>
    <Link to="/category/birthday-parties" className="hover:text-[#f9a826] transition">
      Birthday Parties
    </Link>
  </li>

  <li>
    <Link to="/category/birthday-parties" className="hover:text-[#f9a826] transition">
       Birthday & Party
    </Link>
  </li>
</ul>
        </div>

        {/* Pages */}
        <div>
          <h4 className="text-xl font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="hover:text-[#f9a826] transition">About Us</li>
            <li className="hover:text-[#f9a826] transition">Vendors</li>
            <li className="hover:text-[#f9a826] transition">Gallery</li>
            <li className="hover:text-[#f9a826] transition">Contact</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-xl font-semibold mb-4">Contact Us</h4>
          <ul className="space-y-3 text-gray-300 text-sm">
            <li className="flex items-start gap-2">
              <MapPin size={18} className="text-[#f9a826]" />
              <span> 71,Dadda Nagar Near Katangi Highway jabalpur </span>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={18} className="text-[#f9a826]" />
              <a href="tel:+919201976523" className="hover:underline">9201976523</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={18} className="text-[#f9a826]" />
              <a href="mailto:goeventify@gmail.com" className="hover:underline">goeventify@gmail.com</a>
            </li>
          </ul>

          {/* Social Icons */}
          <div className="flex gap-4 mt-6">
            <a href="https://www.facebook.com/profile.php?id=61585660263887" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-400 hover:border-[#f9a826] hover:text-[#f9a826] transition">
              <Facebook size={18} />
            </a>
            <a href="https://www.instagram.com/goeventify/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-400 hover:border-[#f9a826] hover:text-[#f9a826] transition">
              <Instagram size={18} />
            </a>
            <a href="https://www.linkedin.com/in/go-eventify/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-400 hover:border-[#f9a826] hover:text-[#f9a826] transition">
              <Linkedin size={18} />
            </a>
          </div>
        </div>
      </div>

      <div className="mt-10 border-t border-gray-600 pt-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} GoEventify | Crafted with ❤️ for unforgettable events.
      </div>
    </footer>
  );
};

export default Footer;
