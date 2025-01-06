import { InstallPrompt } from "@/components/pwa/InstallPrompt";

const RideauxOuverts = () => {
  return (
    <div className="w-full h-[calc(100vh-4.5rem)] bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-cormorant mb-4">Rideaux Ouverts</h1>
        <p className="text-muted-foreground">Page en construction...</p>
      </div>
      <InstallPrompt />
    </div>
  );
};

export default RideauxOuverts;