import CategoryTemplate from "./CategoryTemplate";

const Exhibitions = () => {
  return (
    <CategoryTemplate
      bannerImage="https://d197irk3q85upd.cloudfront.net/catalog/product/3/b/3b6a1130.jpg"
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
        { name: "Lighting Setup", image: "/images/services/exhibition/lightingsetup.jpg" },
        { name: "Product Display Units", image: "/images/services/exhibition/productdisplayunits.jpg" },
        { name: "LED Wall Support", image: "/images/services/exhibition/ledwall.png" },
        { name: "Reception Counter", image: "/images/services/exhibition/receptioncounter.jpg" },
        { name: "Brochure Stands", image: "/images/services/exhibition/broucherstand.jpg" },
        { name: "Dismantling & Logistics", image: "/images/services/exhibition/dismantlingandlogistics.jpg" },
      ]}
    />
  );
};

export default Exhibitions;
