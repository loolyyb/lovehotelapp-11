import { InstallPrompt } from "@/components/pwa/InstallPrompt";
const RestaurantDuLove = () => {
  return <div className="w-full min-h-[calc(100vh-4.5rem)] bg-cream relative overflow-hidden p-4 md:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left column - Photos and description */}
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

        {/* Right column - Reservation module */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg h-[800px] overflow-hidden">
          <iframe src="https://widget.thefork.com/edf8e644-6792-4d98-9c4a-5c1ea2f7057f" className="w-full h-full border-none" title="Restaurant du Love Réservation" />
        </div>
      </div>
      <InstallPrompt />
    </div>;
};
export default RestaurantDuLove;