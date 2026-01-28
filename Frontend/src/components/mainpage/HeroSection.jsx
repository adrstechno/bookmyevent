import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

const bgImages = [
  "/images/herobg.jpg",
  "/images/herobg1.jpg",
  "/images/herobg2.jpg",
  "/images/herobg3.jpeg",
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
      const servicesSection = document.getElementById('services-section');
      if (servicesSection) {
        servicesSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      } else {
        navigate('/home');
        setTimeout(() => {
          const section = document.getElementById('services-section');
          if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    } else {
      navigate('/register');
    }
  };

  return (
    <section className="relative text-white overflow-hidden h-screen">
      {/* Background Carousel with Smooth Transitions */}
      <div className="absolute inset-0">
        <AnimatePresence mode="sync">
          {bgImages.map((img, index) => (
            index === currentIndex && (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 1.2 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  transition: { 
                    opacity: { duration: 1.5, ease: "easeInOut" },
                    scale: { duration: 8, ease: "linear" }
                  }
                }}
                exit={{ 
                  opacity: 0,
                  transition: { duration: 1.5, ease: "easeInOut" }
                }}
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${img})` }}
              />
            )
          ))}
        </AnimatePresence>
      </div>

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50"></div>

      {/* Animated particles effect (optional decorative elements) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              x: [null, Math.random() * window.innerWidth],
              opacity: [0, 1, 0],
              scale: [null, Math.random() * 1.5 + 0.5]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full">
          {/* Text Content with Staggered Animations */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl space-y-4 sm:space-y-6 md:space-y-8"
          >
            {/* Main Heading with Letter Animation */}
            <motion.h1 
              className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.2,
                ease: [0.6, -0.05, 0.01, 0.99]
              }}
              style={{
                textShadow: '0 2px 10px rgba(0,0,0,0.8), 0 4px 20px rgba(0,0,0,0.6), 0 8px 40px rgba(0,0,0,0.4), 2px 2px 4px rgba(0,0,0,0.9)'
              }}
            >
              <motion.span
                className="inline-block"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Plan Your
              </motion.span>
              {" "}
              <motion.span 
                className="inline-block text-[#f9a826]"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.8, 
                  delay: 0.5,
                  type: "spring",
                  stiffness: 100
                }}
                style={{
                  textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 4px 20px rgba(249,168,38,0.6), 0 8px 40px rgba(249,168,38,0.4), 2px 2px 6px rgba(0,0,0,1), -1px -1px 0 rgba(0,0,0,0.5)'
                }}
              >
                Perfect Event
              </motion.span>
              {" "}
              <motion.span
                className="inline-block"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                with GoEventify
              </motion.span>
            </motion.h1>

            {/* Description with Fade In */}
            <motion.p 
              className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-100 leading-relaxed max-w-2xl font-medium"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.9,
                ease: "easeOut"
              }}
              style={{
                textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 4px 16px rgba(0,0,0,0.7), 1px 1px 3px rgba(0,0,0,1)'
              }}
            >
              {user 
                ? `Welcome back, ${user.name || 'User'}! Discover the best venues, vendors, and services for your next celebration.`
                : "Discover the best venues, vendors, and services — all in one place. Let's make your celebration unforgettable."
              }
            </motion.p>

            {/* Buttons with Staggered Animation */}
            <motion.div 
              className="flex flex-wrap gap-4 pt-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.8, 
                delay: 1.1,
                ease: "easeOut"
              }}
            >
              <Link to="/category/weddings" className="inline-block">
                <motion.button 
                  whileHover={{ 
                    scale: 1.08,
                    boxShadow: "0 15px 40px rgba(249, 168, 38, 0.5)",
                    y: -3
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 bg-[#f9a826] text-black rounded-full font-bold text-lg hover:bg-[#f7b733] transition-all duration-300 shadow-2xl relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Explore Our Works
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      →
                    </motion.span>
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#f7b733] via-[#ffd700] to-[#f9a826]"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "0%" }}
                    transition={{ duration: 0.4 }}
                  />
                </motion.button>
              </Link>

              <motion.button 
                whileHover={{ 
                  scale: 1.08,
                  backgroundColor: "rgba(255, 255, 255, 1)",
                  color: "#3c6e71",
                  boxShadow: "0 15px 40px rgba(255, 255, 255, 0.4)",
                  y: -3
                }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExploreVendors}
                className="px-10 py-4 border-2 border-white rounded-full font-bold text-lg transition-all duration-300 relative overflow-hidden group backdrop-blur-sm bg-white/10"
                title={user ? 'Browse available vendors and services' : 'Sign up to explore vendors'}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {user ? 'Explore Vendors' : 'Join Us Today'}
                  <motion.span
                    animate={{ rotate: [0, 360] }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    ✨
                  </motion.span>
                </span>
                <motion.div
                  className="absolute inset-0 bg-white"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                />
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="flex flex-col items-center gap-2 cursor-pointer"
          onClick={() => {
            const nextSection = document.querySelector('#services-section, section:nth-of-type(2)');
            if (nextSection) {
              nextSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          <span className="text-sm text-white/80 drop-shadow-lg">Scroll Down</span>
          <svg 
            className="w-6 h-6 text-white/80 drop-shadow-lg" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 14l-7 7m0 0l-7-7m7 7V3" 
            />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
