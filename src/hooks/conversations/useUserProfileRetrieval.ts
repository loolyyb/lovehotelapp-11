
import { useState, useEffect, useCallback } from "react";
import { useProfileState } from "@/hooks/useProfileState";
import { useLogger } from "@/hooks/useLogger";

export const useUserProfileRetrieval = () => {
  const {
    profileId: currentProfileId,
    isLoading,
    error,
    isInitialized,
    refreshProfile: getUserProfile
  } = useProfileState();
  
  const logger = useLogger("useUserProfileRetrieval");
  
  // For compatibility with existing code
  const [isProfileInitializing, setIsProfileInitializing] = useState(true);
  
  useEffect(() => {
    if (isInitialized) {
      setIsProfileInitializing(false);
      logger.info("Profile initialization complete", { profileId: currentProfileId });
    }
  }, [isInitialized, currentProfileId, logger]);
  
  return {
    currentProfileId,
    setCurrentProfileId: () => {}, // No-op, profile is managed by useProfileState
    isLoading: isLoading || isProfileInitializing,
    error,
    getUserProfile
  };
};
