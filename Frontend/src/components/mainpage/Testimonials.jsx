import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const reviews = [
  { 
    name: "Sneha Reddy", 
    role: "Customer",
    text: "From start to finish, GoEventify ensured our wedding management was seamless and stress-free. Appreciates their dedication and professionalism, making our big day truly unforgettable",
    avatar: "https://ui-avatars.com/api/?name=Sneha+Reddy&background=6366f1&color=fff&size=80"
  },
  { 
    name: "Aarav Mehta", 
    role: "Customer",
    text: "GoEventify made our wedding unforgettable. Everything was smooth and perfectly managed! The attention to detail was exceptional.",
    avatar: "https://ui-avatars.com/api/?name=Aarav+Mehta&background=8b5cf6&color=fff&size=80"
  },
  { 
    name: "Priya Sharma", 
    role: "Vendor",
    text: "As a vendor, I've gained so many clients. Super easy dashboard and great visibility! The platform has transformed my business.",
    avatar: "https://ui-avatars.com/api/?name=Priya+Sharma&background=ec4899&color=fff&size=80"
  },
  { 
    name: "Raj Patel", 
    role: "Customer",
    text: "Booked our corporate event in minutes. Amazing platform and seamless process! Highly recommend for any business event.",
    avatar: "https://ui-avatars.com/api/?name=Raj+Patel&background=14b8a6&color=fff&size=80"
  },
  { 
    name: "Simran Kaur", 
    role: "Customer",
    text: "Loved how fast everything worked. Our birthday event was beautifully organized! The team went above and beyond.",
    avatar: "https://ui-avatars.com/api/?name=Simran+Kaur&background=f59e0b&color=fff&size=80"
  },
  { 
    name: "Kabir Verma", 
    role: "Vendor",
    text: "Vendor onboarding was simple. Got real bookings from day one! The support team is incredibly helpful.",
    avatar: "https://ui-avatars.com/api/?name=Kabir+Verma&background=3b82f6&color=fff&size=80"
  },
  { 
    name: "Neha Gupta", 
    role: "Customer",
    text: "Brilliant experience. GoEventify truly connects the right vendors with real customers. Will definitely use again!",
    avatar: "https://ui-avatars.com/api/?name=Neha+Gupta&background=ef4444&color=fff&size=80"
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-8 font-sans">
      <section className="py-20 w-full max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-5xl text-center font-bold text-gray-900 mb-20">
          Hear from trusted clients
        </h2>

        <div className="relative">
          {/* Main testimonial card */}
          <div className="flex items-center justify-center gap-8 md:gap-16">
            {/* Avatar section */}
            <div className="hidden md:flex flex-col items-center">
              <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg mb-3">
                <img 
                  src={reviews[currentIndex].avatar} 
                  alt={reviews[currentIndex].name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{reviews[currentIndex].name}</h3>
              <p className="text-sm text-gray-500">{reviews[currentIndex].role}</p>
            </div>

            {/* Testimonial text with animation */}
            <div className="flex-1 max-w-2xl relative overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                  className="bg-white p-8 md:p-10 rounded-2xl shadow-lg border border-gray-100"
                >
                  {/* Mobile avatar */}
                  <div className="md:hidden flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full overflow-hidden shadow-md">
                      <img 
                        src={reviews[currentIndex].avatar} 
                        alt={reviews[currentIndex].name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{reviews[currentIndex].name}</h3>
                      <p className="text-sm text-gray-500">{reviews[currentIndex].role}</p>
                    </div>
                  </div>

                  <p className="text-gray-700 text-lg md:text-xl leading-relaxed">
                    "{reviews[currentIndex].text}"
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation controls */}
          <div className="flex items-center justify-center gap-6 mt-12">
            <button
              onClick={handlePrev}
              className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-900 hover:bg-gray-50 transition-all duration-200 group"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600 group-hover:text-gray-900" />
            </button>

            <div className="flex items-center gap-2 text-gray-600 font-medium">
              <span className="text-lg">{currentIndex + 1}</span>
              <span className="text-gray-400">—</span>
              <span className="text-lg">{reviews.length}</span>
            </div>

            <button
              onClick={handleNext}
              className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-900 hover:bg-gray-50 transition-all duration-200 group"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-gray-900" />
            </button>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? "w-8 bg-gray-900" 
                    : "w-2 bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Testimonials;
