import { useState, useCallback, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon } from "lucide-react";
import useEmblaCarousel from 'embla-carousel-react';

interface ProfileGalleryProps {
  photos?: string[];
}

export function ProfileGallery({ photos }: ProfileGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel();

  useEffect(() => {
    if (emblaApi) {
      emblaApi.on('select', () => {
        setCurrentIndex(emblaApi.selectedScrollSnap());
      });
    }
  }, [emblaApi]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!emblaApi) return;
    
    switch (event.key) {
      case 'ArrowLeft':
        emblaApi.scrollPrev();
        break;
      case 'ArrowRight':
        emblaApi.scrollNext();
        break;
    }
  }, [emblaApi]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!photos || photos.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Galerie photos</h2>
        <Card className="p-8 flex flex-col items-center justify-center text-gray-500 bg-white/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            <ImageIcon className="w-12 h-12 mb-2" />
          </motion.div>
          <p>Aucune photo disponible</p>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8"
    >
      <h2 className="text-xl font-semibold text-burgundy mb-4">Galerie photos</h2>
      <Card className="p-4 bg-white/80 backdrop-blur-sm">
        <Carousel 
          ref={emblaRef as any}
          className="w-full max-w-xl mx-auto"
        >
          <CarouselContent>
            <AnimatePresence mode="wait">
              {photos.map((photo, index) => (
                <CarouselItem key={index}>
                  <Dialog>
                    <DialogTrigger asChild>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-1 cursor-pointer"
                        layoutId={`photo-${index}`}
                      >
                        <div className="aspect-square relative overflow-hidden rounded-xl group">
                          <img
                            src={photo}
                            alt={`Photo ${index + 1}`}
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder.svg';
                            }}
                          />
                          <motion.div 
                            className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                            initial={false}
                            whileHover={{ opacity: 1 }}
                          >
                            <span className="text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                              Agrandir
                            </span>
                          </motion.div>
                        </div>
                      </motion.div>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl w-full p-1 bg-transparent border-none">
                      <motion.img
                        layoutId={`photo-${index}-full`}
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </DialogContent>
                  </Dialog>
                </CarouselItem>
              ))}
            </AnimatePresence>
          </CarouselContent>
          <div className="absolute -left-4 top-1/2 -translate-y-1/2">
            <CarouselPrevious className="bg-white/80 hover:bg-white transition-colors duration-200" />
          </div>
          <div className="absolute -right-4 top-1/2 -translate-y-1/2">
            <CarouselNext className="bg-white/80 hover:bg-white transition-colors duration-200" />
          </div>
        </Carousel>
        <motion.div 
          className="mt-4 flex justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {photos.map((_, index) => (
            <motion.div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                index === currentIndex ? "bg-burgundy" : "bg-gray-300"
              }`}
              whileHover={{ scale: 1.2 }}
              animate={{
                scale: index === currentIndex ? 1.2 : 1,
                backgroundColor: index === currentIndex ? "rgb(157, 51, 51)" : "rgb(209, 213, 219)"
              }}
            />
          ))}
        </motion.div>
      </Card>
    </motion.div>
  );
}
