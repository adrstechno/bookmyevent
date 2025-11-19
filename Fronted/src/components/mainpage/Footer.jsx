import React from "react";
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-[#1b2d2f] to-[#264043] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* About */}
        <div>
<h3 className="flex items-center justify-start gap-2 text-2xl font-bold mb-4">
  <img
    src="/mobilelogo.png"
    alt="Festyfi Logo"
    className="w-8 h-8 object-contain hover:scale-110 transition-transform duration-300"
  />
  <span className="text-[#f9a826]">Festyfi</span>
</h3>



          <p className="text-gray-300 text-sm leading-relaxed">
            Festyfi helps you create extraordinary experiences — from weddings to corporate events.
            Connect with trusted vendors, venues, and planners — all in one place.
          </p>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-xl font-semibold mb-4">Services</h4>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="hover:text-[#f9a826] transition">Wedding Management</li>
            <li className="hover:text-[#f9a826] transition">Corporate Events</li>
            <li className="hover:text-[#f9a826] transition">Birthday Parties</li>
            <li className="hover:text-[#f9a826] transition">Concerts & Festivals</li>
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
              <span>Andheri East, Mumbai, India</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={18} className="text-[#f9a826]" />
              <span>+91 9820039162</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={18} className="text-[#f9a826]" />
              <span>support@celebria.in</span>
            </li>
          </ul>

          {/* Social Icons */}
          <div className="flex gap-4 mt-6">
            {[Facebook, Instagram, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-400 hover:border-[#f9a826] hover:text-[#f9a826] transition"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 border-t border-gray-600 pt-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Festyfi | Crafted with ❤️ for unforgettable events.
      </div>
    </footer>
  );
};

export default Footer;
