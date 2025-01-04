import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProfileCard } from "@/components/profiles/ProfileCard";
import { ProfilesFilter, FilterCriteria } from "@/components/profiles/ProfilesFilter";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

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
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      if (profilesError) throw profilesError;

      const { data: preferencesData, error: preferencesError } = await supabase
        .from("preferences")
        .select("*");

      if (preferencesError) throw preferencesError;

      const profilesWithPreferences = profilesData.map(profile => ({
        profile,
        preferences: preferencesData.find(pref => pref.user_id === profile.user_id) || null
      }));

      setProfiles(profilesWithPreferences);
      setFilteredProfiles(profilesWithPreferences);
    } catch (error: any) {
      console.error("Error fetching profiles:", error);
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

    setFilteredProfiles(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-pink-50 to-rose-100 flex items-center justify-center">
        <div className="animate-pulse text-burgundy">Chargement...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-r from-pink-50 to-rose-100 pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-playfair text-burgundy text-center mb-8 animate-fadeIn">
          Découvrez des profils
        </h1>
        
        <ProfilesFilter onFilterChange={handleFilterChange} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProfiles.map(({ profile, preferences }) => (
            <div key={profile.id} className="animate-fadeIn">
              <ProfileCard profile={profile} preferences={preferences} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}