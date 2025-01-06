import { InstallPrompt } from "@/components/pwa/InstallPrompt";

const RideauxOuverts = () => {
  return (
    <div className="w-full min-h-[calc(100vh-4.5rem)] bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-cormorant mb-8">Rideaux Ouverts</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-center text-gray-600">
            Page en construction
          </p>
        </div>
      </div>
      <InstallPrompt />
    </div>
  );
};

export default RideauxOuverts;