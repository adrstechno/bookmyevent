import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { VITE_API_BASE_URL } from "../../utils/api";

const Testimonials = () => {
  const [reviews, setReviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${VITE_API_BASE_URL}/reviews/recent?limit=10`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Reviews API response:", data);
        
        // Transform API data to match component structure
        const transformedReviews = data.reviews?.map(review => ({
          name: review.user_name || "Anonymous User",
          role: "Customer",
          text: review.review_text || "Great service!",
          rating: review.rating || 5,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user_name || "User")}&background=random&color=fff&size=80`,
          vendor: review.vendor_name || "",
          date: new Date(review.created_at).toLocaleDateString()
        })) || [];

        setReviews(transformedReviews.length > 0 ? transformedReviews : getFallbackReviews());
      } else {
        setReviews(getFallbackReviews());
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews(getFallbackReviews());
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackReviews = () => [
    { 
      name: "Sneha Reddy", 
      role: "Customer",
      text: "From start to finish, GoEventify ensured our wedding management was seamless and stress-free. Their dedication and professionalism made our big day truly unforgettable!",
      rating: 5,
      avatar: "https://ui-avatars.com/api/?name=Sneha+Reddy&background=6366f1&color=fff&size=80"
    },
    { 
      name: "Aarav Mehta", 
      role: "Customer",
      text: "GoEventify made our wedding unforgettable. Everything was smooth and perfectly managed! The attention to detail was exceptional.",
      rating: 5,
      avatar: "https://ui-avatars.com/api/?name=Aarav+Mehta&background=8b5cf6&color=fff&size=80"
    },
    { 
      name: "Priya Sharma", 
      role: "Vendor",
      text: "As a vendor, I've gained so many clients. Super easy dashboard and great visibility! The platform has transformed my business.",
      rating: 5,
      avatar: "https://ui-avatars.com/api/?name=Priya+Sharma&background=ec4899&color=fff&size=80"
    }
  ];

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

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3c6e71]"></div>
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1556125574-d7f27ec36a06?w=1920&h=1080&fit=crop&crop=center')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/93 via-gray-50/88 to-white/93" />
      </div>

      {/* Animated Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-[#f9a826]/20 to-transparent rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            y: [0, -30, 0],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute bottom-10 left-10 w-40 h-40 bg-gradient-to-br from-[#3c6e71]/25 to-transparent rounded-full blur-2xl"
        />
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            What Our Customers Say
          </h2>
          <div className="h-1.5 bg-gradient-to-r from-[#f9a826] to-[#f7b733] w-32 mx-auto rounded-full mb-6" />
          <p className="text-gray-600 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
            Real reviews from real customers who made their events unforgettable with us
          </p>
        </motion.div>

        <div className="relative max-w-6xl mx-auto">
          {/* Main testimonial card */}
          <div className="flex items-center justify-center gap-8 lg:gap-16">
            {/* Avatar section - Desktop */}
            <motion.div 
              className="hidden lg:flex flex-col items-center"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-24 h-24 rounded-full overflow-hidden shadow-2xl mb-4 ring-4 ring-white">
                <img 
                  src={reviews[currentIndex].avatar} 
                  alt={reviews[currentIndex].name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{reviews[currentIndex].name}</h3>
              <p className="text-sm text-[#3c6e71] font-semibold uppercase tracking-wide">{reviews[currentIndex].role}</p>
              {reviews[currentIndex].date && (
                <p className="text-xs text-gray-500 mt-1">{reviews[currentIndex].date}</p>
              )}
            </motion.div>

            {/* Testimonial text with animation */}
            <div className="flex-1 max-w-3xl relative overflow-hidden">
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
                  className="bg-white/80 backdrop-blur-sm p-8 lg:p-12 rounded-3xl shadow-2xl border border-gray-100/50"
                >
                  {/* Mobile avatar */}
                  <div className="lg:hidden flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg ring-4 ring-white">
                      <img 
                        src={reviews[currentIndex].avatar} 
                        alt={reviews[currentIndex].name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{reviews[currentIndex].name}</h3>
                      <p className="text-sm text-[#3c6e71] font-semibold uppercase tracking-wide">{reviews[currentIndex].role}</p>
                      {reviews[currentIndex].date && (
                        <p className="text-xs text-gray-500">{reviews[currentIndex].date}</p>
                      )}
                    </div>
                  </div>

                  {/* Quote Icon */}
                  <div className="text-[#f9a826] mb-6">
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                    </svg>
                  </div>

                  <p className="text-gray-700 text-lg lg:text-xl leading-relaxed mb-6 italic">
                    {reviews[currentIndex].text}
                  </p>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-5 h-5 ${i < reviews[currentIndex].rating ? 'text-[#f9a826] fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600 font-semibold">
                      {reviews[currentIndex].rating}/5
                    </span>
                  </div>

                  {reviews[currentIndex].vendor && (
                    <p className="text-sm text-gray-500">
                      Vendor: <span className="font-semibold text-[#3c6e71]">{reviews[currentIndex].vendor}</span>
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation controls */}
          <div className="flex items-center justify-center gap-8 mt-12">
            <button
              onClick={handlePrev}
              className="w-14 h-14 rounded-full bg-white shadow-lg border-2 border-gray-200 flex items-center justify-center hover:border-[#3c6e71] hover:bg-[#3c6e71] hover:text-white transition-all duration-300 group"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform duration-300" />
            </button>

            <div className="flex items-center gap-3 text-gray-600 font-semibold">
              <span className="text-2xl text-[#3c6e71]">{currentIndex + 1}</span>
              <span className="text-gray-400">of</span>
              <span className="text-2xl text-[#3c6e71]">{reviews.length}</span>
            </div>

            <button
              onClick={handleNext}
              className="w-14 h-14 rounded-full bg-white shadow-lg border-2 border-gray-200 flex items-center justify-center hover:border-[#3c6e71] hover:bg-[#3c6e71] hover:text-white transition-all duration-300 group"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform duration-300" />
            </button>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-3 mt-8">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? "w-12 bg-[#3c6e71] shadow-lg" 
                    : "w-3 bg-gray-300 hover:bg-gray-400 hover:w-8"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
