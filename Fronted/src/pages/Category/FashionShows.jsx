import CategoryTemplate from "./CategoryTemplate";

const FashionShows = () => {
  return (
    <CategoryTemplate
      bannerImage="/images/FashionShow.jpg"
      categoryTitle="Fashion & Shows"
      categorySlug="fashion-shows"
      description1="Runway shows crafted with elegance — lighting, music, stage, and backstage management in complete sync."
      description2="From rehearsals to final walk sequences, we ensure every element enhances the designer's vision."
      hotelList={[
        "Luxury Hotels",
        "Ballroom Venues",
        "Convention Centres",
      ]}
      services={[
        { name: "Runway & Stage Setup", image: "/images/services/fashion/runway.jpg" },
        { name: "Designer Coordination", image: "/images/services/fashion/designer-coordination.jpg" },
        { name: "Model Management", image: "/images/services/fashion/model-management.jpg" },
        { name: "Lighting Arrangement", image: "/images/services/fashion/lighting.jpg" },
        { name: "Music & Show Calling", image: "/images/services/fashion/music-show.jpg" },
        { name: "Backstage Setup", image: "/images/services/fashion/backstage.jpg" },
        { name: "Green Room Setup", image: "/images/services/fashion/green-room.jpg" },
        { name: "Branding & Media Zone", image: "/images/services/fashion/branding.jpg" },
        { name: "LED Visual Support", image: "/images/services/fashion/led-visual.jpg" },
      ]}
    />
  );
};

export default FashionShows;
