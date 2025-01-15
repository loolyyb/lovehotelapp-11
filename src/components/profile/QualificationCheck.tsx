import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QualificationJourney } from "../qualification/QualificationJourney";

interface QualificationCheckProps {
  userId: string;
  children: React.ReactNode;
}

export function QualificationCheck({ userId, children }: QualificationCheckProps) {
  const [needsQualification, setNeedsQualification] = useState<boolean | null>(null);

  useEffect(() => {
    checkQualificationStatus();
  }, [userId]);

  const checkQualificationStatus = async () => {
    try {
      const { data: preferences } = await supabase
        .from('preferences')
        .select('qualification_completed')
        .eq('user_id', userId)
        .single();

      setNeedsQualification(!preferences?.qualification_completed);
    } catch (error) {
      console.error('Error checking qualification status:', error);
      setNeedsQualification(true);
    }
  };

  if (needsQualification === null) {
    return null; // Loading state
  }

  if (needsQualification) {
    return <QualificationJourney />;
  }

  return <>{children}</>;
}