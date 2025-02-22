
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface AnnouncementContentProps {
  content: string;
  imageUrl: string | null;
  additionalImages?: { id: string; image_url: string; }[];
}

export function AnnouncementContent({
  content,
  imageUrl,
  additionalImages = []
}: AnnouncementContentProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const allImages = [
    ...(imageUrl ? [{ id: 'main', image_url: imageUrl }] : []),
    ...additionalImages
  ];
  
  const hasMultipleImages = allImages.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="mt-2">
      <p className="text-zinc-50">{content}</p>
      {allImages.length > 0 && (
        <div className="relative mt-4">
          <img 
            src={allImages[currentImageIndex].image_url} 
            alt={`Image ${currentImageIndex + 1} de l'annonce`} 
            className="rounded-lg max-h-96 object-cover w-full"
          />
          
          {hasMultipleImages && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                onClick={previousImage}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                onClick={nextImage}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 px-2 py-1 rounded-full text-white text-sm">
                {currentImageIndex + 1} / {allImages.length}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
