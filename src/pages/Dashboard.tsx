
import { motion } from "framer-motion";
import { BedDouble, Calendar, Heart, Info, Theater, Utensils, UserRound } from "lucide-react";
import { DashboardWidget } from "@/components/dashboard/DashboardWidget";
import { useAuthSession } from "@/hooks/useAuthSession";

// Maintenance notification component for the dashboard
const MaintenanceNotification = () => (
  <div className="bg-[#f3ebad]/10 backdrop-blur-sm border border-[#f3ebad]/20 rounded-lg p-4 mb-4 mx-4 flex items-start gap-3">
    <Info className="text-[#f3ebad] w-5 h-5 mt-0.5 flex-shrink-0" />
    <p className="text-[#f3ebad]/90 text-sm">
      
    </p>
  </div>
);

const Dashboard = () => {
  const {
    userProfile
  } = useAuthSession();

  const widgets = [
    {
      icon: Heart,
      title: "Rencontres",
      to: "/profiles"
    },
    {
      icon: Calendar,
      title: "Agenda",
      to: "/events"
    },
    {
      icon: BedDouble,
      title: "Love Room",
      to: "/reserver-room"
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

  return <div className="min-h-screen flex flex-col bg-[linear-gradient(135deg,#1E1E1E_0%,#CD0067_100%)]">
      {/* Background patterns */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(205,0,103,0.2),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(30,30,30,0.3),transparent_40%)]" />
      </div>

      {/* Content */}
      <main className="flex-grow w-full px-2 sm:px-4 relative z-10 flex flex-col items-center h-[calc(100vh-8rem)]">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl sm:text-3xl font-cormorant font-bold mt-4 mb-6 text-[#f3ebad]"
        >
          Bonjour {userProfile?.full_name?.split(' ')[0] || 'Lover'}
        </motion.h1>
        
        {/* Maintenance notification now appears here, on the dashboard for logged-in users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <MaintenanceNotification />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 gap-2 sm:gap-4 w-full max-w-5xl mx-auto mb-6"
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="w-full max-w-5xl mx-auto px-4 py-6 rounded-xl backdrop-blur-sm border border-[#f3ebad]/20 bg-[#40192C]/80"
        >
          <p className="text-[#f3ebad] text-sm sm:text-base leading-relaxed text-center">
            Sur notre plateforme de rencontres, la prostitution est strictement interdite. Tout profil proposant des prestations tarifées sera immédiatement banni du site ainsi que des Love Hôtels partenaires. Un système avancé d'alertes basé sur des mots-clés et une modération à plusieurs niveaux sont mis en place pour détecter et bloquer ces activités illégales, garantissant ainsi un espace sécurisé et respectueux pour tous les utilisateurs.
          </p>
        </motion.div>
      </main>
    </div>;
};

export default Dashboard;
