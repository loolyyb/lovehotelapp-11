import { InstallPrompt } from "@/components/pwa/InstallPrompt";

const RideauxOuverts = () => {
  return (
    <div className="w-full h-[calc(100vh-4.5rem)] bg-cream relative">
      <iframe
        src="https://lovehotelaparis.fr/rideaux-ouverts/"
        className="w-full h-full border-none"
        title="Rideaux Ouverts"
      />
      <InstallPrompt />
    </div>
  );
};

export default RideauxOuverts;