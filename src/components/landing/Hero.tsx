import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-champagne to-cream px-4">
      <div className="max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <span className="inline-block px-3 py-1 text-sm text-burgundy bg-rose/20 rounded-full">
            Exclusive Dating Experience
          </span>
          <h1 className="text-4xl md:text-6xl font-playfair text-burgundy font-bold leading-tight">
            Where Luxury Meets
            <br /> Romance
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            An exclusive platform for Love Hotels members and LooLyyb holders.
            Experience dating with unprecedented elegance and privacy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button
              size="lg"
              className="bg-burgundy hover:bg-burgundy/90 text-white"
            >
              Join Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-burgundy text-burgundy hover:bg-burgundy/5"
            >
              Learn More
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};