import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
const options = [{
  image: "https://lovehotelaparis.fr/wp-content/uploads/2024/11/champagne-chambre.webp",
  title: "Champagne en chambre",
  description: "Profitez d'une coupe de champagne dans votre Love Room"
}, {
  image: "https://lovehotelaparis.fr/wp-content/uploads/2024/11/boutique-erotique.webp",
  title: "Boutique érotique",
  description: "Découvrez notre sélection d'accessoires et de lingerie"
}, {
  image: "https://lovehotelaparis.fr/wp-content/uploads/2024/11/decoration-romantique.webp",
  title: "Décoration romantique",
  description: "Personnalisez votre Love Room avec notre décoration romantique"
}];
export default function Options() {
  const navigate = useNavigate();
  return <div className="container mx-auto px-4 py-8">
      <div className="mb-12 text-center">
        <p className="text-base md:text-lg text-rosey-500 max-w-2xl mx-auto mb-6">
          Retrouvez ces options et bien d'autres lors de la réservation de votre Love Room.
        </p>
        <Button onClick={() => navigate("/reserver-room")} className="bg-[#ce0067] text-white hover:bg-[#ce0067]/90 py-[15px] px-[122px]">
          Réserver
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {options.map((option, index) => <motion.div key={index} initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: index * 0.2
      }}>
            <Card className="overflow-hidden bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 h-full">
              <div className="relative overflow-hidden">
                <img src={option.image} alt={option.title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 border-[0.25px] border-white" />
              </div>
              <div className="p-4 bg-zinc-50">
                <h3 className="text-xl font-cormorant font-bold text-rose-500 mb-2">{option.title}</h3>
                <p className="text-gray-900">{option.description}</p>
              </div>
            </Card>
          </motion.div>)}
      </div>
    </div>;
}