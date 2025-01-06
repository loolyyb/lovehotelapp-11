import { motion } from "framer-motion";
import { BedDouble, Calendar, Heart, Theater, Utensils, UserRound } from "lucide-react";
import { DashboardWidget } from "@/components/dashboard/DashboardWidget";
import { DashboardFooter } from "@/components/dashboard/DashboardFooter";

const Dashboard = () => {
  const widgets = [
    {
      icon: BedDouble,
      title: "Love Room",
      to: "/reserver-room"
    },
    {
      icon: Calendar,
      title: "Agenda",
      to: "/events"
    },
    {
      icon: Heart,
      title: "Rencontre",
      to: "/profiles"
    },
    {
      icon: Theater,
      title: "Rideau Ouvert",
      to: "/rideaux-ouverts"
    },
    {
      icon: Utensils,
      title: "Restaurant",
      to: "/restaurant-du-love"
    },
    {
      icon: UserRound,
      title: "Mon Compte",
      to: "/profile"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-champagne via-rose-50 to-cream">
      {/* Background patterns */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,228,230,0.6),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,236,213,0.6),transparent_40%)]" />
      </div>

      {/* Content */}
      <main className="flex-grow container mx-auto px-4 py-8 relative z-10 flex items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 gap-6 max-w-5xl mx-auto w-full"
        >
          {widgets.map((widget, index) => (
            <motion.div
              key={widget.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="h-full"
            >
              <DashboardWidget {...widget} />
            </motion.div>
          ))}
        </motion.div>
      </main>

      <DashboardFooter />
    </div>
  );
};

export default Dashboard;