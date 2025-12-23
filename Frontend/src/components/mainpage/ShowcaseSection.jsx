

import React from "react";
import CircularGallery from './CircularGallery';

const images = [
  { image: "/images/event/event1.jpg", text: "Event 1" },
  { image: "/images/event/event2.jpg", text: "Event 2" },
  { image: "/images/event/event3.jpg", text: "Event 3" },
  { image: "/images/event/event4.jpg", text: "Event 4" },
  { image: "/images/event/event5.jpg", text: "Event 5" },
  { image: "/images/event/event6.jpg", text: "Event 6" },
  { image: "/images/event/event7.jpg", text: "Event 7" },
  { image: "/images/event/event8.jpg", text: "Event 8" },
  { image: "/images/event/event9.jpg", text: "Event 9" },
  { image: "/images/event/event10.jpg", text: "Event 10" },
];

const ShowcaseSection = () => {
  return (
    <section className="relative py-28 bg-gradient-to-b from-[#f9fafb] to-[#edf3f3] overflow-hidden">
      {/* Title Section */}
      <div className="text-center relative z-10 mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-[#284b63] mb-4">
          Timeless <span className="text-[#f9a826]">Celebrations</span>
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Every image tells a story — experience the creativity and spirit
          behind each event we craft.
        </p>
      </div>

      {/* Circular Gallery */}
      <div style={{ height: '600px', position: 'relative' }}>
        <CircularGallery 
          items={images}
          bend={3} 
          textColor="#ffffff" 
          borderRadius={0.05} 
          scrollEase={0.02}
        />
      </div>
    </section>
  );
};

export default ShowcaseSection;
