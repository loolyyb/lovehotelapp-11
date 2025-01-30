import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export const CTA = () => {
  return (
    <section className="py-20 px-4 bg-burgundy/5">
      <div className="max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-4xl font-cormorant font-bold text-gray-900 mb-6">
            Prêt à vivre une expérience unique ?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Rejoignez notre communauté et découvrez un monde de possibilités
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button 
                size="lg"
                className="bg-burgundy hover:bg-burgundy/90 text-white w-full sm:w-auto"
              >
                Commencer l'aventure
              </Button>
            </Link>
            <Link to="/features">
              <Button 
                size="lg"
                variant="outline"
                className="border-burgundy text-burgundy hover:bg-burgundy/5 w-full sm:w-auto"
              >
                En savoir plus
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};