import CategoryTemplate from "./CategoryTemplate";

const BirthdayParties = () => {
  return (
    <CategoryTemplate
      bannerImage="/images/Birthday.jpg"
      categoryTitle="Birthday Parties"
      categorySlug="birthday-parties"
      description1="Make birthdays unforgettable with joyful themes, vibrant decor, and beautiful party arrangements."
      description2="From cake setups to music, games, photography and return gifts — we handle every detail for kids and adults alike."
      hotelList={[
        "Banquet Halls",
        "Theme Party Lounges",
        "Outdoor Garden Venues",
      ]}
      services={[
        { name: "Theme Decoration", image: "https://theorganizedmomlife.com/wp-content/uploads/2020/07/lucasparty9-1.jpg" },
        { name: "Balloon & Floral Decor", image: "https://i.pinimg.com/originals/91/ff/6e/91ff6e75e8ff0ae80365dcd8af14718e.jpg" },
        { name: "Cake Table Setup", image: "https://cdn001.cakecentral.com/gallery/2015/03/900_935144worW_21-st-birthday-cake-table-cakes-cupcakes-and-styling-all-by-me.jpg" },
        { name: "Kids Activities", image: "https://vgpcyberkingdom.in/wp-content/uploads/2024/08/kids-birthday-party-500x500.png" },
        { name: "Mascot Characters", image: "https://atneventstaffing.com/wp-content/uploads/2018/05/1208646_10153235325550263_138185923_n-768x768.jpg" },
        { name: "DJ Music", image: "https://picjumbo.com/wp-content/uploads/party-dj-in-dance-music-club-free-photo.jpg" },
       
      ]}
    />
  );
};

export default BirthdayParties;
