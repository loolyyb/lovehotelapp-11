
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ProfilesGrid } from "@/components/profiles/ProfilesGrid";
import { useProfiles } from "@/hooks/useProfiles";
import { Loader } from "lucide-react";
import { MatchingFilter } from "@/components/matching/MatchingFilter";

type InterestType = "all" | "casual" | "serious" | "libertine" | "bdsm" | "exhibitionist" | "open_curtains" | "speed_dating";

export default function Profiles() {
  const navigate = useNavigate();
  const { profiles, loading } = useProfiles();
  const [filteredProfiles, setFilteredProfiles] = useState(profiles);
  const [selectedInterest, setSelectedInterest] = useState<InterestType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("");
  const [orientation, setOrientation] = useState("");
  const [membershipTypes, setMembershipTypes] = useState<string[]>([]);
  const [openCurtains, setOpenCurtains] = useState(false);

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

  const handleFilterChange = () => {
    let filtered = [...profiles];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(({ profile, preferences }) => 
        profile.full_name?.toLowerCase().includes(searchLower) ||
        profile.bio?.toLowerCase().includes(searchLower) ||
        preferences?.location?.toLowerCase().includes(searchLower)
      );
    }

    if (location) {
      filtered = filtered.filter(({ preferences }) => 
        preferences?.location?.toLowerCase() === location.toLowerCase()
      );
    }

    if (status) {
      filtered = filtered.filter(({ profile }) => 
        profile.status === status
      );
    }

    if (orientation) {
      filtered = filtered.filter(({ profile }) => 
        profile.sexual_orientation === orientation
      );
    }

    if (membershipTypes.length > 0) {
      filtered = filtered.filter(({ profile }) => 
        (membershipTypes.includes("love_hotel") && profile.is_love_hotel_member) ||
        (membershipTypes.includes("loolyb") && profile.is_loolyb_holder)
      );
    }

    if (openCurtains) {
      filtered = filtered.filter(({ preferences }) => 
        preferences?.open_curtains === true
      );
    }

    if (selectedInterest !== "all") {
      filtered = filtered.filter(({ profile, preferences }) => {
        if (selectedInterest === "open_curtains") {
          return preferences?.open_curtains_interest;
        }
        if (selectedInterest === "speed_dating") {
          return preferences?.speed_dating_interest;
        }
        if (selectedInterest === "libertine") {
          return preferences?.libertine_party_interest;
        }
        return profile.relationship_type?.includes(selectedInterest);
      });
    }

    setFilteredProfiles(filtered);
  };

  useEffect(() => {
    handleFilterChange();
  }, [
    searchTerm,
    location,
    status,
    orientation,
    membershipTypes,
    openCurtains,
    selectedInterest,
    profiles
  ]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-champagne via-rose-50 to-cream flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-burgundy" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-champagne via-rose-50 to-cream">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-4xl font-cormorant text-burgundy text-center mb-8 animate-fadeIn">
          Découvrez des profils
        </h1>
        
        <MatchingFilter 
          selectedInterest={selectedInterest}
          onInterestChange={setSelectedInterest}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          location={location}
          onLocationChange={setLocation}
          status={status}
          onStatusChange={setStatus}
          orientation={orientation}
          onOrientationChange={setOrientation}
          membershipTypes={membershipTypes}
          onMembershipTypesChange={setMembershipTypes}
          openCurtains={openCurtains}
          onOpenCurtainsChange={setOpenCurtains}
        />
        <ProfilesGrid profiles={filteredProfiles} />
      </div>
    </main>
  );
}
