# Service Images Structure

## Folder Structure
```
public/images/services/
├── wedding/
│   ├── entrance-gate.jpg
│   ├── mandap.jpg
│   ├── reception.jpg
│   ├── entry.jpg
│   ├── haldi-mehendi.jpg
│   ├── photo-booth.jpg
│   ├── dj-sound.jpg
│   ├── led-wall.jpg
│   └── flowers.jpg
│
├── exhibition/
│   ├── stall-design.jpg
│   ├── fabrication.jpg
│   ├── branding.jpg
│   ├── lighting.jpg
│   ├── display-units.jpg
│   ├── led-wall.jpg
│   ├── reception.jpg
│   ├── brochure-stands.jpg
│   └── logistics.jpg
│
├── concert/
│   ├── stage-truss.jpg
│   ├── led-wall.jpg
│   ├── sound-system.jpg
│   ├── lighting.jpg
│   ├── artist-management.jpg
│   ├── backstage.jpg
│   ├── security.jpg
│   ├── ticketing.jpg
│   └── special-effects.jpg
│
├── birthday/
│   ├── theme-decoration.jpg
│   ├── balloon-decor.jpg
│   ├── cake-table.jpg
│   ├── kids-activities.jpg
│   ├── tattoo-artist.jpg
│   ├── mascot.jpg
│   ├── dj-music.jpg
│   ├── photo-booth.jpg
│   └── return-gifts.jpg
│
├── corporate/
│   ├── conference.jpg
│   ├── product-launch.jpg
│   ├── annual-day.jpg
│   ├── awards.jpg
│   ├── brand-activation.jpg
│   ├── seminar.jpg
│   ├── stage.jpg
│   ├── led-av.jpg
│   └── lighting.jpg
│
└── fashion/
    ├── runway.jpg
    ├── designer-coordination.jpg
    ├── model-management.jpg
    ├── lighting.jpg
    ├── music-show.jpg
    ├── backstage.jpg
    ├── green-room.jpg
    ├── branding.jpg
    └── led-visual.jpg
```

## Image Requirements
- **Format**: JPG or PNG
- **Size**: Recommended 800x600px or higher
- **Aspect Ratio**: 4:3 or 16:9
- **Quality**: High quality, clear images
- **File Size**: Optimized (under 500KB per image)

## How It Works
1. Each category page now uses an array of objects with `name` and `image` properties
2. If an image fails to load, it will fallback to the category banner image
3. Images are displayed in a responsive grid with hover effects
4. Each service card shows the image with a gradient overlay and service name

## Example Usage
```javascript
services={[
  { name: "Service Name", image: "/images/services/category/service-image.jpg" },
  // ... more services
]}
```

## Notes
- Make sure all image paths are correct
- Images should be placed in the `public/images/services/` folder
- The folder structure helps organize images by category
- If you don't have specific images yet, the system will use the category banner as fallback
