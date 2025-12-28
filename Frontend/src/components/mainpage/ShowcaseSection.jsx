

import React from "react";
import CircularGallery from './CircularGallery';

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
          textColor="#3C6E71" 
          borderRadius={0.05} 
          scrollEase={0.02}
        />
      </div>
    </section>
  );
};

export default ShowcaseSection;
