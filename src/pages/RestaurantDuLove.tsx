
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";

const RestaurantDuLove = () => {
  return <div className="w-full min-h-[calc(100vh-4.5rem)] bg-cream relative overflow-hidden p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header section - Description and photos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-4">
              <img src="https://www.dandyhotelparis.com/_novaimg/galleria/1467864.jpg" alt="Restaurant du Love - Interior" className="w-full h-64 object-cover rounded-xl shadow-lg" />
              <img src="https://www.dandyhotelparis.com/_novaimg/galleria/1467863.jpg" alt="Restaurant du Love - Ambiance" className="w-full h-64 object-cover rounded-xl shadow-lg" />
            </div>
            <div className="backdrop-blur-sm p-6 rounded-xl shadow-lg bg-zinc-50">
              <h2 className="text-2xl font-cormorant font-semibold mb-4 text-[#ce0067]">
                Le Restaurant du Love
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Découvrez notre restaurant intimiste au cœur de Paris. Un lieu unique où la gastronomie 
                française rencontre une ambiance romantique et raffinée. Notre chef vous propose une 
                carte soigneusement élaborée pour une expérience culinaire inoubliable en tête-à-tête.
              </p>
            </div>
          </div>

          {/* Offers section */}
          <div className="space-y-4">
            <img 
              src="https://lovehotelaparis.fr/wp-content/uploads/2025/01/petit-dejeuner-et-love-room-V2-1.webp" 
              alt="Petit déjeuner et Love Room" 
              className="w-full rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            />
            <img 
              src="https://lovehotelaparis.fr/wp-content/uploads/2025/01/lunch-et-love-room-v2.jpg" 
              alt="Lunch et Love Room" 
              className="w-full rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            />
            <img 
              src="https://lovehotelaparis.fr/wp-content/uploads/2025/01/drink-et-love-room-v2-1.webp" 
              alt="Drink et Love Room" 
              className="w-full rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            />
            <img 
              src="https://lovehotelaparis.fr/wp-content/uploads/2025/01/eat-et-love-room-v2-1.webp" 
              alt="Eat et Love Room" 
              className="w-full rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            />
          </div>
        </div>

        {/* Reservation section */}
        <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 flex flex-col items-center space-y-6">
          <h3 className="text-2xl font-cormorant font-semibold text-[#ce0067] text-center">
            Réservation
          </h3>
          <p className="text-gray-700 text-center text-lg space-y-2">
            <span className="block">Pour réserver directement, contactez-nous par téléphone</span>
            <span className="block text-base mt-4">
              Petit déjeuner : 7h30 - 10h30<br />
              Déjeuner et Dîner<br />
              Brunch du Dimanche jusqu'à 16h
            </span>
          </p>
          <Button 
            className="text-lg py-6"
            asChild
          >
            <a href="tel:+33144826305" className="flex items-center gap-3">
              <Phone className="w-6 h-6" />
              +33 1 44 82 63 05
            </a>
          </Button>
        </div>
      </div>
      <InstallPrompt />
    </div>;
};

export default RestaurantDuLove;
