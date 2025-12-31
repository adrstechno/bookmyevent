import CategoryTemplate from "./CategoryTemplate";

const ConcertsFestivals = () => {
  return (
    <CategoryTemplate
      bannerImage="/images/Concert.jpg"
      categoryTitle="Concerts & Festivals"
      categorySlug="concerts-festivals"
      description1="High-energy concerts and festivals designed with power-packed sound, lighting, and stage arrangements."
      description2="We manage artist coordination, technical production, crowd control, and on-ground operations to ensure flawless performances."
      hotelList={[
        "Open Grounds & Arenas",
        "College Cultural Venues",
        "Convention Auditoriums",
      ]}
      services={[
        { name: "Stage & Truss Setup", image: "/images/services/concert/stageandtrusssetup.png" },
        { name: "LED Wall Setup", image: "/images/services/concert/ledwalls.jpg" },
        { name: "Sound Line Array Systems", image: "/images/services/concert/soundline.jpg" },
        { name: "Architectural Lighting", image: "/images/services/concert/architecturelighting.jpg" },
        { name: "Artist Management", image: "/images/services/concert/artistmanagement.jpg" },
        { name: "Backstage Coordination", image: "/images/services/concert/backstagecoordination.jpg" },
        { name: "Security & Crowd Control", image: "/images/services/concert/securityandcrowd.jpg" },
        { name: "Ticketing Support", image: "/images/services/concert/ticketbooking.jpg" },
        { name: "Special Effects Setup", image: "/images/services/concert/special-effects.jpg" },
      ]}
    />
  );
};

export default ConcertsFestivals;
