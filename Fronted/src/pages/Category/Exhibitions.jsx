import CategoryTemplate from "./CategoryTemplate";

const Exhibitions = () => {
  return (
    <CategoryTemplate
      bannerImage="/images/Exivision.jpg"
      categoryTitle="Exhibitions"
      categorySlug="exhibitions"
      description1="We design and fabricate exhibition stalls that enhance product visibility and strengthen brand identity."
      description2="From 3D layouts to final installation, our team ensures clean finish, functional layouts and premium presentation."
      hotelList={[
        "India Expo Centre, Greater Noida",
        "Pragati Maidan, New Delhi",
        "Bombay Exhibition Centre, Mumbai",
        "Bangalore International Exhibition Centre",
        "Chennai Trade Centre",
      ]}
      services={[
        { name: "Stall Designing", image: "/images/services/exhibition/stall-design.jpg" },
        { name: "Fabrication & Setup", image: "/images/services/exhibition/fabrication.jpg" },
        { name: "Branding & Printing", image: "/images/services/exhibition/branding.jpg" },
        { name: "Lighting Setup", image: "/images/services/exhibition/lighting.jpg" },
        { name: "Product Display Units", image: "/images/services/exhibition/display-units.jpg" },
        { name: "LED Wall Support", image: "/images/services/exhibition/led-wall.jpg" },
        { name: "Reception Counter", image: "/images/services/exhibition/reception.jpg" },
        { name: "Brochure Stands", image: "/images/services/exhibition/brochure-stands.jpg" },
        { name: "Dismantling & Logistics", image: "/images/services/exhibition/logistics.jpg" },
      ]}
    />
  );
};

export default Exhibitions;
