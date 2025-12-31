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
        { name: "Runway & Stage Setup", image: "/images/services/fashion/Runway&StageSetup.jpg" },
        { name: "Designer Coordination", image: "/images/services/fashion/designercoordination.jpg" },
        { name: "Model Management", image: "/images/services/fashion/modelmanagement.jpg" },
        { name: "Lighting Arrangement", image: "/images/services/fashion/professionallighting.jpg" },
        { name: "Music & Show Calling", image: "/images/services/fashion/musicandshowcalling.jpg" },
        { name: "Backstage Setup", image: "/images/services/fashion/backstagesetup.jpg" },
        { name: "Green Room Setup", image: "/images/services/fashion/greenrooms.jpg" },
        { name: "Branding & Media Zone", image: "/images/services/fashion/brandingandmediazone.jpg" },
        { name: "LED Visual Support", image: "/images/services/fashion/backstageledjpg.png" },
      ]}
    />
  );
};

export default FashionShows;
