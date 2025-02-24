
import { ProfilePhotoGallery } from "../ProfilePhotoGallery";
import { WidgetContainer } from "./WidgetContainer";

interface GallerySectionProps {
  photos: string[] | null;
  onUpdate: (updates: any) => void;  // Changed from Promise<void> to void
}

export function GallerySection({ photos, onUpdate }: GallerySectionProps) {
  return (
    <WidgetContainer title="Galerie photos">
      <ProfilePhotoGallery
        photos={photos}
        onPhotosChange={(photos) => onUpdate({ photo_urls: photos })}
      />
    </WidgetContainer>
  );
}
