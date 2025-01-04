import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const CTA = () => {
  return (
    <section className="py-24 bg-burgundy text-white px-4">
      <div className="max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <span className="inline-block px-3 py-1 text-sm bg-white/10 rounded-full">
            Join Today
          </span>
          <h2 className="text-3xl md:text-4xl font-playfair font-bold">
            Start Your Premium Dating Journey
          </h2>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            Join our exclusive community and experience dating like never before.
            Special benefits await Love Hotels members and LooLyyb holders.
          </p>
          <Button
            size="lg"
            className="mt-8 bg-white text-burgundy hover:bg-white/90"
          >
            Create Account
          </Button>
        </motion.div>
      </div>
    </section>
  );
};