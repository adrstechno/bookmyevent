

import { useState, useEffect } from 'react';
import CircularGallery from './CircularGallery';

import { useNavigate } from 'react-router-dom';


const images = [
  { image: "/images/event/event1.jpg", text: "Dj Show" },
  { image: "/images/event/event2.jpg", text: "Exivision" },
  { image: "/images/event/event3.jpg", text: "Caterings" },
  { image: "/images/event/event4.jpg", text: "Cafe" },
  { image: "/images/event/event5.jpg", text: "Dinner" },
  { image: "/images/event/event6.jpg", text: "College Event" },
  { image: "/images/event/event7.jpg", text: "School Function" },
  { image: "/images/event/event8.jpg", text: "Old Function" },
  { image: "/images/event/event9.jpg", text: "Dj Night" },
  { image: "/images/event/event10.jpg", text: "Late Night Show" },
];

const categoryImages = [
  { image: "/images/event/event1.jpg", text: "DJ Show", route: "/category/concerts-festivals" },
  { image: "/images/event/event2.jpg", text: "Exhibition", route: "/category/exhibitions" },
  { image: "/images/event/event3.jpg", text: "Catering", route: "/category/corporate-events" },
  { image: "/images/event/event4.jpg", text: "Cafe Events", route: "/category/corporate-events" },
  { image: "/images/event/event5.jpg", text: "Dinner Party", route: "/category/birthday-parties" },
  { image: "/images/event/event6.jpg", text: "College Event", route: "/category/corporate-events" },
  { image: "/images/event/event7.jpg", text: "School Function", route: "/category/corporate-events" },
  { image: "/images/event/event8.jpg", text: "Traditional Event", route: "/category/weddings" },
  { image: "/images/event/event9.jpg", text: "DJ Night", route: "/category/concerts-festivals" },
  { image: "/images/event/event10.jpg", text: "Fashion Show", route: "/category/fashion-shows" },
];

const ShowcaseSection = () => {
  const navigate = useNavigate();
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Simulate loading time for WebGL initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  // Handle category navigation
  const handleCategoryClick = (route) => {
    if (route) {
      navigate(route);
    }
  };

  // Responsive gallery settings based on screen size
  const getGallerySettings = () => {
    if (screenSize.width < 768) {
      return {
        bend: 1.5,
        scrollEase: 0.04,
        scrollSpeed: 1.5
      };
    } else if (screenSize.width < 1024) {
      return {
        bend: 2.5,
        scrollEase: 0.03,
        scrollSpeed: 1.8
      };
    } else {
      return {
        bend: 3,
        scrollEase: 0.02,
        scrollSpeed: 2
      };
    }
  };

  const gallerySettings = getGallerySettings();

  return (
    <section className="relative py-12 sm:py-16 md:py-20 lg:py-28 bg-gradient-to-b from-[#f9fafb] to-[#edf3f3] overflow-hidden">
      {/* Title Section */}
      <div className="text-center relative z-10 mb-8 sm:mb-12 md:mb-16 px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#284b63] mb-3 sm:mb-4 leading-tight">
          Timeless <span className="text-[#f9a826]">Celebrations</span>
        </h2>
        <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-xs sm:max-w-lg md:max-w-2xl mx-auto px-2">
          Every image tells a story — experience the creativity and spirit
          behind each event we craft. <span className="hidden sm:inline text-[#f9a826] font-medium">Click on any category to explore more.</span>
        </p>
      </div>

      {/* Circular Gallery */}
      <div className="h-64 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px] relative showcase-gallery">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#f9fafb] to-[#edf3f3] z-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f9a826]"></div>
          </div>
        )}
        <CircularGallery 
          items={categoryImages}
          bend={gallerySettings.bend} 
          textColor="#3C6E71" 
          borderRadius={0.05} 
          scrollEase={gallerySettings.scrollEase}
          scrollSpeed={gallerySettings.scrollSpeed}
          onItemClick={handleCategoryClick}
        />
      </div>

      {/* Mobile Category Grid - Fallback for devices that don't support WebGL well */}
      <div className="block sm:hidden mt-8 mobile-category-grid">
        <h3 className="text-lg font-semibold text-[#284b63] mb-4 text-center">
          Explore Categories
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {categoryImages.slice(0, 6).map((item, index) => (
            <button
              key={index}
              onClick={() => handleCategoryClick(item.route)}
              className="mobile-category-item relative bg-white shadow-md hover:shadow-lg transition-all duration-300 active:scale-95"
            >
              <img
                src={item.image}
                alt={item.text}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end justify-center p-3">
                <span className="text-white text-sm font-semibold text-center leading-tight">
                  {item.text}
                </span>
              </div>
            </button>
          ))}
        </div>
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Tap any category to explore our services
          </p>
        </div>
      </div>
    </section>
  );
};

export default ShowcaseSection;
