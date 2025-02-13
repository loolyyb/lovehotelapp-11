
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { MatchingFilter } from "@/components/matching/MatchingFilter";
import { MatchingResults } from "@/components/matching/MatchingResults";
import { useMatchingProfiles, InterestType, StatusType } from "@/components/matching/hooks/useMatchingProfiles";

export default function MatchingScores() {
  const [selectedInterest, setSelectedInterest] = useState<InterestType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<StatusType>("all");
  const [orientation, setOrientation] = useState("");
  const [membershipTypes, setMembershipTypes] = useState<string[]>([]);
  const [openCurtains, setOpenCurtains] = useState(false);
  const navigate = useNavigate();

  const { profiles, loading } = useMatchingProfiles({
    selectedInterest,
    searchTerm,
    status,
    orientation,
    membershipTypes,
    openCurtains
  });

  const handleMessageClick = (profileId: string) => {
    navigate(`/messages?profile=${profileId}`);
  };

  const handleProfileClick = (profileId: string) => {
    navigate(`/profile/${profileId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-champagne via-rose-50 to-cream flex items-center justify-center">
        <div className="animate-pulse text-burgundy">Chargement...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-champagne via-rose-50 to-cream">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-cormorant text-burgundy text-center mb-8 animate-fadeIn">
          Rencontres
        </h1>

        <div className="mb-12">
          <MatchingFilter 
            selectedInterest={selectedInterest}
            onInterestChange={setSelectedInterest}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            status={status}
            onStatusChange={setStatus}
            orientation={orientation}
            onOrientationChange={setOrientation}
            membershipTypes={membershipTypes}
            onMembershipTypesChange={setMembershipTypes}
            openCurtains={openCurtains}
            onOpenCurtainsChange={setOpenCurtains}
          />
        </div>

        <MatchingResults 
          profiles={profiles}
          onProfileClick={handleProfileClick}
          onMessageClick={handleMessageClick}
        />
      </div>
    </main>
  );
}
