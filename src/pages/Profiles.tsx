import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ProfilesFilter, FilterCriteria } from "@/components/profiles/ProfilesFilter";
import { ProfilesGrid } from "@/components/profiles/ProfilesGrid";
import { useProfiles } from "@/hooks/useProfiles";
import { Loader } from "lucide-react";
import { useState } from "react";

export default function Profiles() {
  const navigate = useNavigate();
  const { profiles, loading } = useProfiles();
  const [filteredProfiles, setFilteredProfiles] = useState(profiles);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    setFilteredProfiles(profiles);
  }, [profiles]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    }
  };

  const handleFilterChange = (criteria: FilterCriteria) => {
    let filtered = [...profiles];

    if (criteria.searchTerm) {
      const searchLower = criteria.searchTerm.toLowerCase();
      filtered = filtered.filter(({ profile, preferences }) => 
        profile.full_name?.toLowerCase().includes(searchLower) ||
        profile.bio?.toLowerCase().includes(searchLower) ||
        preferences?.location?.toLowerCase().includes(searchLower)
      );
    }

    if (criteria.location) {
      filtered = filtered.filter(({ preferences }) => 
        preferences?.location?.toLowerCase() === criteria.location?.toLowerCase()
      );
    }

    if (criteria.status) {
      filtered = filtered.filter(({ profile }) => 
        profile.status === criteria.status
      );
    }

    if (criteria.orientation) {
      filtered = filtered.filter(({ profile }) => 
        profile.sexual_orientation === criteria.orientation
      );
    }

    if (criteria.membershipType && criteria.membershipType.length > 0) {
      filtered = filtered.filter(({ profile }) => 
        (criteria.membershipType?.includes("love_hotel") && profile.is_love_hotel_member) ||
        (criteria.membershipType?.includes("loolyb") && profile.is_loolyb_holder)
      );
    }

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
        <ProfilesGrid profiles={filteredProfiles} />
      </div>
    </main>
  );
}