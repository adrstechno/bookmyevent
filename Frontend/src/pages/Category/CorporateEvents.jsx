import CategoryTemplate from "./CategoryTemplate";

const CorporateEvents = () => {
  return (
    <CategoryTemplate
      bannerImage="/images/Corporate-event.jpg"
      categoryTitle="Corporate Events"
      categorySlug="corporate-events"
      description1="We deliver structured, professional corporate event solutions that elevate your brand identity."
      description2="From conferences to product launches, every event is executed with precision, branding consistency, and powerful coordination."
      hotelList={[
        "Business & Convention Centers",
        "Premium Banquet Venues",
        "Corporate Auditoriums",
      ]}
      services={[
        { name: "Conference Management", image: "/images/services/corporate/conference.jpg" },
        { name: "Product Launch", image: "/images/services/corporate/product-launch.jpg" },
        { name: "Annual Day Events", image: "/images/services/corporate/annual-day.jpg" },
        { name: "Award Ceremonies", image: "/images/services/corporate/awards.jpg" },
        { name: "Brand Activations", image: "/images/services/corporate/brand-activation.jpg" },
        { name: "Seminars & Workshops", image: "/images/services/corporate/seminar.jpg" },
        { name: "Stage Design & Setup", image: "/images/services/corporate/stage.jpg" },
        { name: "LED Wall & AV System", image: "/images/services/corporate/led-av.jpg" },
        { name: "Professional Lighting", image: "/images/services/corporate/lighting.jpg" },
      ]}
    />
  );
};

export default CorporateEvents;
