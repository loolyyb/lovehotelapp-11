import { InstallPrompt } from "@/components/pwa/InstallPrompt";

const RestaurantDuLove = () => {
  return (
    <div className="w-full h-[calc(100vh-4.5rem)] bg-cream relative overflow-hidden">
      <iframe 
        src="https://widget.thefork.com/edf8e644-6792-4d98-9c4a-5c1ea2f7057f"
        className="w-full min-h-[550px] border-none overflow-scroll"
        title="Restaurant du Love Réservation"
      />
      <InstallPrompt />
    </div>
  );
};

export default RestaurantDuLove;