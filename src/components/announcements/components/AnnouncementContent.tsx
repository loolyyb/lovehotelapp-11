
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
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
    <div className="mt-2 flex flex-col space-y-4">
      {allImages.length > 0 && (
        <div className="relative">
          <img 
            src={allImages[currentImageIndex].image_url} 
            alt={`Image ${currentImageIndex + 1} de l'annonce`} 
            className="rounded-lg w-full object-cover"
            style={{ maxHeight: isMobile ? '300px' : '400px' }}
          />
          
          {hasMultipleImages && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                onClick={previousImage}
              >
                <ChevronLeft className="h-4 w-4 md:h-6 md:w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                onClick={nextImage}
              >
                <ChevronRight className="h-4 w-4 md:h-6 md:w-6" />
              </Button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 px-2 py-1 rounded-full text-white text-xs md:text-sm">
                {currentImageIndex + 1} / {allImages.length}
              </div>
            </>
          )}
        </div>
      )}
      <p className="text-zinc-50 text-sm md:text-base">{content}</p>
    </div>
  );
}
