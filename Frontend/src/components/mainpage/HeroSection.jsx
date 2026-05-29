import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const HeroSection = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: "/images/event_home.png",
      title: "Best Event Management in Jabalpur",
      subtitle: "Wedding Planner, Shadi Planner & All Event Vendors in Jabalpur, MP",
    },
    {
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&h=600&fit=crop",
      title: "Book Verified Event Vendors in Jabalpur",
      subtitle: "Tent Services, Caterers, Photographers, Mehndi Artists, Pandit Ji & More",
    },
    {
      image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&h=600&fit=crop",
      title: "Complete Event Solutions Near You",
      subtitle: "Birthday Parties, Corporate Events, Sangeet, Mehndi & All Celebrations",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight: 'clamp(400px, 100vh, 800px)' }} aria-label="Event Management Services in Jabalpur">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat w-full h-full"
            style={{ backgroundImage: `url(${slide.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            role="img"
            aria-label={slide.title}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
          </div>

          <div className="relative h-full flex items-center justify-center text-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <motion.h1
                key={`title-${index}`}
                initial={{ opacity: 0, y: 30 }}
                animate={index === currentSlide ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight"
              >
                {slide.title}
              </motion.h1>

              <motion.p
                key={`subtitle-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={index === currentSlide ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed"
              >
                {slide.subtitle}
              </motion.p>
              
              <motion.div
                key={`buttons-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={index === currentSlide ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <Link
                  to="/services"
                  className="group px-8 py-4 bg-gradient-to-r from-[#f9a826] to-[#f7b733] text-white text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 min-w-[200px]"
                >
                  <span className="flex items-center justify-center gap-2">
                    Browse Services
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </Link>

                <Link
                  to="/vendors"
                  className="group px-8 py-4 bg-white/10 backdrop-blur-md text-white text-lg font-semibold rounded-2xl border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 min-w-[200px]"
                >
                  <span className="flex items-center justify-center gap-2">
                    Find Vendors
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      ))}

      {/* Slide Indicators */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 sm:gap-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-white w-8 sm:w-12 shadow-lg"
                : "bg-white/50 w-1.5 sm:w-2 hover:bg-white/75 hover:w-6 sm:hover:w-8"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation Arrows - Hidden on mobile */}
      <button
        onClick={() =>
          setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
        }
        className="hidden sm:flex absolute left-2 sm:left-4 lg:left-8 top-1/2 transform -translate-y-1/2 w-10 sm:w-12 h-10 sm:h-12 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-full transition-all duration-300 z-20 group items-center justify-center"
        aria-label="Previous slide"
      >
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-1 transition-transform duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        className="hidden sm:flex absolute right-2 sm:right-4 lg:right-8 top-1/2 transform -translate-y-1/2 w-10 sm:w-12 h-10 sm:h-12 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-full transition-all duration-300 z-20 group items-center justify-center"
        aria-label="Next slide"
      >
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Scroll Indicator - Hidden on small screens */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-4 sm:bottom-8 right-4 sm:right-8 hidden md:flex flex-col items-center gap-2 text-white/70"
      >
        <span className="text-xs sm:text-sm font-medium rotate-90 origin-center whitespace-nowrap">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-0.5 h-6 sm:h-8 bg-white/50 rounded-full"
        />
      </motion.div>
    </section>
  );
};

export default HeroSection;
