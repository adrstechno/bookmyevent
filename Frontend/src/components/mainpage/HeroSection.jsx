
node:internal/modules/esm/resolve:275
    throw new ERR_MODULE_NOT_FOUND(
          ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/opt/render/project/src/Event_backend/Services/EmailService.js' imported from /opt/render/project/src/Event_backend/Controllers/UserController.js
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:860:10)
    at defaultResolve (node:internal/modules/esm/resolve:984:11)
    at ModuleLoader.defaultResolve (node:internal/modules/esm/loader:780:12)
    at #cachedDefaultResolve (node:internal/modules/esm/loader:704:25)
    at ModuleLoader.resolve (node:internal/modules/esm/loader:687:38)
    at ModuleLoader.getModuleJobForImport (node:internal/modules/esm/loader:305:38)
    at ModuleJob._link (node:internal/modules/esm/module_job:137:49) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///opt/render/project/src/Event_backend/Services/EmailService.js'
}
Node.js v22.16.0
==> Exited with status 1
==> Common ways to troubleshoot your deploy: https://render.com/docs/troubleshooting-deploysimport { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import HexCollage from "./HexCollage";

const bgImages = [
  "/images/herobg.jpg",
  "/images/herobg1.jpg",
  "/images/herobg2.jpg",
  "/images/herobg3.jpg",
];

const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Auto-slide background every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bgImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle explore vendors click based on auth status
  const handleExploreVendors = () => {
    if (user) {
      // User is logged in, scroll to services section on current page
      const servicesSection = document.getElementById('services-section');
      if (servicesSection) {
        servicesSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      } else {
        // Fallback: navigate to home and then scroll
        navigate('/home');
        setTimeout(() => {
          const section = document.getElementById('services-section');
          if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    } else {
      // User not logged in, navigate to register
      navigate('/register');
    }
  };

  return (
    <section className="relative text-white overflow-hidden">
      {/* Background Carousel */}
      <div className="absolute inset-0">
        {bgImages.map((img, index) => (
          <motion.div
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
            style={{ backgroundImage: `url(${img})` }}
            animate={{ scale: index === currentIndex ? 1.1 : 1 }}
            transition={{ duration: 5, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Gradient overlay for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/30 to-[#284b63]/30"></div>

      {/* Foreground Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 md:px-12 py-24 flex flex-col md:flex-row items-center justify-between gap-10">
        {/* Left Text Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="md:w-[45%] space-y-6 backdrop-blur-[2px] bg-black/30 p-8 rounded-2xl shadow-lg md:ml-[-30px]"
        >
          <h1 className="text-5xl font-bold leading-tight drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]">
            Plan Your <span className="text-[#f9a826]">Perfect Event</span> with Celebria
          </h1>

          <p className="text-lg text-gray-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
            {user 
              ? `Welcome back, ${user.name || 'User'}! Discover the best venues, vendors, and services for your next celebration.`
              : "Discover the best venues, vendors, and services — all in one place. Let's make your celebration unforgettable."
            }
            Let’s make your celebration unforgettable.
          </p>

          <div className="flex gap-4 pt-2">
           <Link to="/category/weddings" className="inline-block">
             <motion.button 
               whileHover={{ 
                 scale: 1.05,
                 boxShadow: "0 10px 30px rgba(249, 168, 38, 0.4)"
               }}
               whileTap={{ scale: 0.95 }}
               className="px-8 py-3 bg-[#f9a826] text-black rounded-full font-semibold hover:bg-[#f7b733] transition-all duration-300 shadow-lg relative overflow-hidden group"
             >
               <span className="relative z-10">
                 Explore Our Works
               </span>
               <motion.div
                 className="absolute inset-0 bg-gradient-to-r from-[#f7b733] to-[#f9a826]"
                 initial={{ x: "-100%" }}
                 whileHover={{ x: "0%" }}
                 transition={{ duration: 0.3 }}
               />
             </motion.button>
           </Link>

            <motion.button 
              whileHover={{ 
                scale: 1.05,
                backgroundColor: "rgba(255, 255, 255, 1)",
                color: "#3c6e71",
                boxShadow: "0 10px 30px rgba(255, 255, 255, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExploreVendors}
              className="px-8 py-3 border-2 border-white rounded-full font-semibold transition-all duration-300 relative overflow-hidden group"
              title={user ? 'Browse available vendors and services' : 'Sign up to explore vendors'}
            >
              <span className="relative z-10">
                {user ? 'Explore Vendors' : 'Join Us Today'}
              </span>
              <motion.div
                className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          </div>
        </motion.div>

        {/* Right Side Collage */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="md:w-[48%] flex justify-center md:justify-end"
        >
          <HexCollage />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
