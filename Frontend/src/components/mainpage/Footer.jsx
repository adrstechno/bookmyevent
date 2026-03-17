import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-[#1a2e30] via-[#264043] to-[#1b2d2f] text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 80%, #f9a826 2px, transparent 2px), radial-gradient(circle at 80% 20%, #3c6e71 2px, transparent 2px)',
          backgroundSize: '100px 100px'
        }} />
      </div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* About */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <img
                  src="/logo2.png"
                  alt="GoEventify Logo"
                  className="w-10 h-10 object-contain hover:scale-110 transition-transform duration-300"
                />
                <span className="text-2xl font-bold text-[#f9a826]">GoEventify</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                GoEventify helps you create extraordinary experiences — from weddings to corporate events.
                Connect with trusted vendors, venues, and planners — all in one place.
              </p>
              <div className="flex gap-4">
                <a 
                  href="https://www.facebook.com/profile.php?id=61585660263887" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Facebook" 
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 border border-white/20 hover:border-[#f9a826] hover:bg-[#f9a826] transition-all duration-300 group"
                >
                  <Facebook className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                </a>
                <a 
                  href="https://www.instagram.com/goeventify/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Instagram" 
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 border border-white/20 hover:border-[#f9a826] hover:bg-[#f9a826] transition-all duration-300 group"
                >
                  <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                </a>
                <a 
                  href="https://www.linkedin.com/in/go-eventify/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="LinkedIn" 
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 border border-white/20 hover:border-[#f9a826] hover:bg-[#f9a826] transition-all duration-300 group"
                >
                  <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                </a>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-xl font-bold mb-6 text-white">Services</h4>
              <ul className="space-y-3">
                {[
                  { name: "Wedding Management", path: "/category/weddings" },
                  { name: "Corporate Events", path: "/category/corporate-events" },
                  { name: "Birthday Parties", path: "/category/birthday-parties" },
                  { name: "Birthday & Party", path: "/category/birthday-parties" }
                ].map((service) => (
                  <li key={service.name}>
                    <Link 
                      to={service.path} 
                      className="text-gray-300 text-sm hover:text-[#f9a826] transition-colors duration-300 flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 bg-[#f9a826] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {service.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xl font-bold mb-6 text-white">Quick Links</h4>
              <ul className="space-y-3">
                {[
                  { name: "About Us", path: "/about" },
                  { name: "Vendors", path: "/vendors/:serviceId" },
                  { name: "Gallery", path: "/category/fashion-shows" },
                  { name: "Contact", path: "/contact" }
                ].map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.path} 
                      className="text-gray-300 text-sm hover:text-[#f9a826] transition-colors duration-300 flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 bg-[#f9a826] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-xl font-bold mb-6 text-white">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 group">
                  <div className="w-8 h-8 bg-[#f9a826]/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#f9a826] transition-colors duration-300">
                    <MapPin className="w-4 h-4 text-[#f9a826] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="text-gray-300 text-sm leading-relaxed">
                    71, Dadda Nagar Near Katangi Highway Jabalpur
                  </span>
                </li>
                <li className="flex items-center gap-3 group">
                  <div className="w-8 h-8 bg-[#f9a826]/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#f9a826] transition-colors duration-300">
                    <Phone className="w-4 h-4 text-[#f9a826] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <a 
                    href="tel:+919201976523" 
                    className="text-gray-300 text-sm hover:text-[#f9a826] transition-colors duration-300"
                  >
                    +91 9201976523
                  </a>
                </li>
                <li className="flex items-center gap-3 group">
                  <div className="w-8 h-8 bg-[#f9a826]/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#f9a826] transition-colors duration-300">
                    <Mail className="w-4 h-4 text-[#f9a826] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <a 
                    href="mailto:goeventify@gmail.com" 
                    className="text-gray-300 text-sm hover:text-[#f9a826] transition-colors duration-300"
                  >
                    goeventify@gmail.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-400 text-center md:text-left">
                © {new Date().getFullYear()} GoEventify. All rights reserved.
              </p>
              <p className="text-sm text-gray-400 text-center md:text-right">
                Crafted with <span className="text-red-400">❤️</span> for unforgettable events
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
