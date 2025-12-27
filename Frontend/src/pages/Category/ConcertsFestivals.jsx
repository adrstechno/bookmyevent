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
        { name: "Stage & Truss Setup", image: "/images/services/concert/stage-truss.jpg" },
        { name: "LED Wall Setup", image: "/images/services/concert/led-wall.jpg" },
        { name: "Sound Line Array Systems", image: "/images/services/concert/sound-system.jpg" },
        { name: "Architectural Lighting", image: "/images/services/concert/lighting.jpg" },
        { name: "Artist Management", image: "/images/services/concert/artist-management.jpg" },
        { name: "Backstage Coordination", image: "/images/services/concert/backstage.jpg" },
        { name: "Security & Crowd Control", image: "/images/services/concert/security.jpg" },
        { name: "Ticketing Support", image: "/images/services/concert/ticketing.jpg" },
        { name: "Special Effects Setup", image: "/images/services/concert/special-effects.jpg" },
      ]}
    />
  );
};

export default ConcertsFestivals;
