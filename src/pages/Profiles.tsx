import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProfileCard } from "@/components/profiles/ProfileCard";
import { ProfilesFilter, FilterCriteria } from "@/components/profiles/ProfilesFilter";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";

type ProfileWithPreferences = {
  profile: Tables<"profiles">;
  preferences: Tables<"preferences"> | null;
};

export default function Profiles() {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<ProfileWithPreferences[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<ProfileWithPreferences[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchProfiles();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    }
  };

  const fetchProfiles = async () => {
    try {
      console.log("Début du chargement des profils...");
      setLoading(true);
      
      // Récupération des profils avec debug - uniquement les vrais profils (user_id not null)
      console.log("Envoi de la requête pour récupérer les profils...");
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .not('user_id', 'is', null); // Only get real user profiles

      if (profilesError) {
        console.error("Erreur lors de la récupération des profils:", profilesError);
        throw profilesError;
      }

      console.log("Profils bruts reçus:", profilesData);
      console.log("Nombre de profils récupérés:", profilesData?.length);

      if (!profilesData) {
        throw new Error("Aucun profil n'a été retourné");
      }

      // Récupération des préférences avec debug
      console.log("Envoi de la requête pour récupérer les préférences...");
      const { data: preferencesData, error: preferencesError } = await supabase
        .from("preferences")
        .select("*")
        .not('user_id', 'is', null); // Only get preferences for real users

      if (preferencesError) {
        console.error("Erreur lors de la récupération des préférences:", preferencesError);
        throw preferencesError;
      }

      console.log("Préférences brutes reçues:", preferencesData);
      console.log("Nombre de préférences récupérées:", preferencesData?.length);

      // Combinaison des profils avec leurs préférences
      const profilesWithPreferences = profilesData.map(profile => {
        const preferences = preferencesData?.find(pref => pref.user_id === profile.user_id) || null;
        console.log(`Association pour le profil ${profile.id}:`, { 
          profile_user_id: profile.user_id,
          found_preferences: preferences ? 'oui' : 'non'
        });
        return {
          profile,
          preferences
        };
      });

      console.log("Nombre total de profils avec préférences:", profilesWithPreferences.length);
      console.log("Profils finaux:", profilesWithPreferences);

      setProfiles(profilesWithPreferences);
      setFilteredProfiles(profilesWithPreferences);
    } catch (error: any) {
      console.error("Erreur complète:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les profils. Veuillez réessayer.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (criteria: FilterCriteria) => {
    let filtered = [...profiles];

    // Filter by search term (name, bio, location)
    if (criteria.searchTerm) {
      const searchLower = criteria.searchTerm.toLowerCase();
      filtered = filtered.filter(({ profile, preferences }) => 
        profile.full_name?.toLowerCase().includes(searchLower) ||
        profile.bio?.toLowerCase().includes(searchLower) ||
        preferences?.location?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by location
    if (criteria.location) {
      filtered = filtered.filter(({ preferences }) => 
        preferences?.location?.toLowerCase() === criteria.location?.toLowerCase()
      );
    }

    // Filter by status
    if (criteria.status) {
      filtered = filtered.filter(({ profile }) => 
        profile.status === criteria.status
      );
    }

    // Filter by orientation
    if (criteria.orientation) {
      filtered = filtered.filter(({ profile }) => 
        profile.sexual_orientation === criteria.orientation
      );
    }

    // Filter by membership type
    if (criteria.membershipType && criteria.membershipType.length > 0) {
      filtered = filtered.filter(({ profile }) => 
        (criteria.membershipType?.includes("love_hotel") && profile.is_love_hotel_member) ||
        (criteria.membershipType?.includes("loolyb") && profile.is_loolyb_holder)
      );
    }

    // Filter by open curtains preference
    if (criteria.openCurtains) {
      filtered = filtered.filter(({ preferences }) => preferences?.open_curtains === true);
    }

    setFilteredProfiles(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-pink-50 to-rose-100 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-burgundy" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-r from-pink-50 to-rose-100">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-4xl font-cormorant text-burgundy text-center mb-8 animate-fadeIn">
          Découvrez des profils
        </h1>
        
        <ProfilesFilter onFilterChange={handleFilterChange} />
        
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProfiles.map(({ profile, preferences }) => (
            <div key={profile.id} className="animate-fadeIn">
              <ProfileCard profile={profile} preferences={preferences} />
            </div>
          ))}
        </div>

        {filteredProfiles.length === 0 && (
          <div className="text-center py-12 text-burgundy">
            Aucun profil ne correspond à vos critères de recherche.
          </div>
        )}
      </div>
    </main>
  );
}