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
        { name: "Conference Management", image: "/images/services/corporate/conferencemanagement.jpg" },
        { name: "Product Launch", image: "/images/services/corporate/productlaunch.jpg" },
        { name: "Annual Day Events", image: "/images/services/corporate/annualday.jpg" },
        { name: "Award Ceremonies", image: "/images/services/corporate/awardcermony.jpg" },
        { name: "Brand Activations", image: "/images/services/corporate/brandactivation.jpg" },
        { name: "Seminars & Workshops", image: "/images/services/corporate/seminarsandworkshops.jpg" },
        { name: "Stage Design & Setup", image: "/images/services/corporate/stagedesignandsetup.jpg" },
        { name: "LED Wall & AV System", image: "/images/services/corporate/ledwallsandavsystem.jpg" },
        { name: "Professional Lighting", image: "/images/services/corporate/professionallightening.jpg" },
      ]}
    />
  );
};

export default CorporateEvents;
