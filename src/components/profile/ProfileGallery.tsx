import { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { ImageIcon } from "lucide-react";

interface ProfileGalleryProps {
  photos?: string[];
}

export function ProfileGallery({ photos }: ProfileGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  if (!photos || photos.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-burgundy mb-4">Galerie photos</h2>
        <Card className="p-8 flex flex-col items-center justify-center text-gray-500">
          <ImageIcon className="w-12 h-12 mb-2" />
          <p>Aucune photo disponible</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-burgundy mb-4">Galerie photos</h2>
      <Card className="p-4 bg-white/80 backdrop-blur-sm">
        <Carousel className="w-full max-w-xl mx-auto">
          <CarouselContent>
            {photos.map((photo, index) => (
              <CarouselItem key={index}>
                <Dialog>
                  <DialogTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-1 cursor-pointer"
                    >
                      <div className="aspect-square relative overflow-hidden rounded-xl group">
                        <img
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <span className="text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                            Agrandir
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl w-full p-1 bg-transparent border-none">
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </DialogContent>
                </Dialog>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="absolute -left-4 top-1/2 -translate-y-1/2">
            <CarouselPrevious className="bg-white/80 hover:bg-white" />
          </div>
          <div className="absolute -right-4 top-1/2 -translate-y-1/2">
            <CarouselNext className="bg-white/80 hover:bg-white" />
          </div>
        </Carousel>
        <div className="mt-4 flex justify-center gap-2">
          {photos.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                index === 0 ? "bg-burgundy" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}