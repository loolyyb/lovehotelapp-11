import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

const options = [
  {
    image: "https://lovehotelaparis.fr/wp-content/uploads/2024/11/champagne-chambre.webp",
    title: "Champagne en chambre",
    description: "Profitez d'une coupe de champagne dans votre Love Room"
  },
  {
    image: "https://lovehotelaparis.fr/wp-content/uploads/2024/11/boutique-erotique.webp",
    title: "Boutique érotique",
    description: "Découvrez notre sélection d'accessoires et de lingerie"
  },
  {
    image: "https://lovehotelaparis.fr/wp-content/uploads/2024/11/decoration-romantique.webp",
    title: "Décoration romantique",
    description: "Personnalisez votre Love Room avec notre décoration romantique"
  }
];

export default function Options() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-cormorant font-bold text-burgundy mb-8">Nos Options</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {options.map((option, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <Card className="overflow-hidden bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 h-full">
              <div className="relative overflow-hidden">
                <img
                  src={option.image}
                  alt={option.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-cormorant font-bold text-burgundy mb-2">{option.title}</h3>
                <p className="text-gray-600">{option.description}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      <div className="mt-12 text-center">
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          Retrouvez toutes ces options lors de la réservation de votre Love Room pour personnaliser votre expérience et rendre votre séjour encore plus mémorable.
        </p>
      </div>
    </div>
  );
}