import { useState, useEffect } from 'react';
import React from 'react';
import CircularGallery from './CircularGallery';
import { useNavigate } from 'react-router-dom';

// Error Boundary Component for CircularGallery
class CircularGalleryErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CircularGallery Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8">
            <p className="text-gray-600 mb-4">
              Unable to load 3D gallery. Your browser may not support WebGL.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="bg-[#284b63] text-white px-6 py-2 rounded-lg hover:bg-[#3c6e71] transition"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

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
  { image: "/images/event/event1.jpg", text: "DJ Show" },
  { image: "/images/event/event2.jpg", text: "Exhibition" },
  { image: "/images/event/event3.jpg", text: "Catering" },
  { image: "/images/event/event4.jpg", text: "Cafe Events" },
  { image: "/images/event/event5.jpg", text: "Dinner Party"},
  { image: "/images/event/event6.jpg", text: "College Event"},
  { image: "/images/event/event7.jpg", text: "School Function"},
  { image: "/images/event/event8.jpg", text: "Traditional Event" },
  { image: "/images/event/event9.jpg", text: "DJ Night"},
  { image: "/images/event/event10.jpg", text: "Fashion Show", route: "/category/fashion-shows" },
];

const ShowcaseSection = () => {
  const navigate = useNavigate();
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });
  const [isLoading, setIsLoading] = useState(true);
  const [webGLError, setWebGLError] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Check WebGL support
    const checkWebGLSupport = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
          setWebGLError(true);
          setIsLoading(false);
          return false;
        }
        return true;
      } catch (e) {
        setWebGLError(true);
        setIsLoading(false);
        return false;
      }
    };

    // Simulate loading time for WebGL initialization
    const timer = setTimeout(() => {
      if (checkWebGLSupport()) {
        setIsLoading(false);
      }
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
        {!isLoading && !webGLError && (
          <CircularGalleryErrorBoundary>
            <CircularGallery 
              items={categoryImages}
              bend={gallerySettings.bend} 
              textColor="#3C6E71" 
              borderRadius={0.05} 
              scrollEase={gallerySettings.scrollEase}
              scrollSpeed={gallerySettings.scrollSpeed}
              onItemClick={handleCategoryClick}
            />
          </CircularGalleryErrorBoundary>
        )}
        {webGLError && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <p className="text-gray-600 mb-4">
                3D Gallery requires WebGL support. Showing grid view instead.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Category Grid - Also shown when WebGL fails */}
      <div className={`mt-8 mobile-category-grid ${!webGLError ? 'block sm:hidden' : 'block'}`}>
        <h3 className="text-lg font-semibold text-[#284b63] mb-4 text-center">
          Explore Categories
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto px-4">
          {categoryImages.map((item, index) => (
            <button
              key={index}
              onClick={() => handleCategoryClick(item.route)}
              className="mobile-category-item relative bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 overflow-hidden h-40"
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
            {webGLError ? 'Click any category to explore our services' : 'Tap any category to explore our services'}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ShowcaseSection;
