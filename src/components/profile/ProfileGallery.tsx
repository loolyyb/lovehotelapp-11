import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";

interface ProfileGalleryProps {
  photos?: string[];
}

export function ProfileGallery({ photos }: ProfileGalleryProps) {
  if (!photos || photos.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-burgundy mb-4">Galerie photos</h2>
      <Card className="p-4">
        <Carousel className="w-full max-w-xl mx-auto">
          <CarouselContent>
            {photos.map((photo, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <div className="aspect-square relative overflow-hidden rounded-xl">
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </Card>
    </div>
  );
}