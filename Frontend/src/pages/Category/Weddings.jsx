import CategoryTemplate from "./CategoryTemplate";

const Weddings = () => {
  return (
    <CategoryTemplate
      bannerImage="/images/Wedding.jpg"
      categoryTitle="Weddings"
      categorySlug="weddings"
      description1="Celebrate your beautiful day with emotions, elegance, and breathtaking decor. Whether traditional or contemporary, every ceremony is curated thoughtfully."
      description2="From mandap setup to reception themes, guest hospitality and logistics — our team ensures every wedding experience is smooth, heartfelt, and truly memorable."
      hotelList={[
        "Vivanta by Taj President",
        "Hotel Four Seasons",
        "The Lalit",
        "NESCO",
        "Grand Hyatt",
        "ITC Maratha",
      ]}
      services={[
        { name: "Entrance Gate", image: "https://png.pngtree.com/background/20230325/original/pngtree-wedding-interior-scene-beautiful-background-picture-image_2166924.jpg" },
        { name: "Vidhi Mandap", image: "https://i.pinimg.com/originals/2b/96/3b/2b963b11a7de12f84afd853c87c1988e.jpg" },
        { name: "Reception Stage", image: "https://getethnic.com/wp-content/uploads/2020/09/207007-AmitaSPhotography-0084-orig.jpg" },
        { name: "Special Entry", image: "https://png.pngtree.com/background/20250103/original/pngtree-new-hd-wedding-background-wall-photo-image-picture-image_15750991.jpg" },
        { name: "Haldi & Mehendi Setup", image: "https://static.vecteezy.com/system/resources/previews/012/002/539/large_2x/traditional-wedding-ceremony-beautiful-culture-of-india-or-decorated-for-haldi-ceremony-photo.jpg" },
        { name: "Photo Booth", image: "https://img.fixthephoto.com/blog/UserFiles/Image/222/wedding-photography-booth-ideas_640x640.jpg" },
        { name: "DJ & Sound", image: "http://empireentertainmentdj.weebly.com/uploads/5/0/4/5/50459339/published/djs-setup.jpg?1582710018" },
        { name: "LED Wall", image: "https://www.eagerled.com/wp-content/uploads/2024/10/Wedding-LED-Screen-3.jpg" },
        { name: "Flower Decoration", image: "http://www.bloggeron.net/wp-content/uploads/2020/10/Wedding-Flower-Decorations.jpg" },
      ]}
    />
  );
};

export default Weddings;
