/**
 * StatsTab Component
 * 
 * Displays comprehensive statistics and metrics about the platform, including user interests,
 * event participation, daily activities, and top motivations.
 */
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatisticsOverview } from "./stats/StatisticsOverview";
import { InterestStatistics } from "./stats/InterestStatistics";
import { MotivationsChart } from "./stats/MotivationsChart";
import { DetailedStatsTable } from "./stats/DetailedStatsTable";

type ProfileWithPreferences = {
  id: string;
  relationship_type: string[];
  preferences: 
    | {
        open_curtains_interest: boolean;
        speed_dating_interest: boolean;
        libertine_party_interest: boolean;
      }
    | { error: boolean };
};

type ValidPreferences = {
  open_curtains_interest: boolean;
  speed_dating_interest: boolean;
  libertine_party_interest: boolean;
};

type RelationshipTypeCount = {
  [key: string]: number;
};

export function StatsTab() {
  // Fetch users and their preferences
  const { data: rawData } = useQuery({
    queryKey: ['admin-users-preferences'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, relationship_type, user_id');
      
      if (profilesError) throw profilesError;

      // Fetch preferences separately and join them in JavaScript
      const { data: preferences, error: preferencesError } = await supabase
        .from('preferences')
        .select('user_id, open_curtains_interest, speed_dating_interest, libertine_party_interest');

      if (preferencesError) throw preferencesError;

      // Join the data
      return profiles.map(profile => {
        const userPreferences = preferences.find(p => p.user_id === profile.user_id);
        return {
          id: profile.id,
          relationship_type: profile.relationship_type,
          preferences: userPreferences ? {
            open_curtains_interest: userPreferences.open_curtains_interest,
            speed_dating_interest: userPreferences.speed_dating_interest,
            libertine_party_interest: userPreferences.libertine_party_interest
          } : { error: true }
        };
      });
    }
  });

  // Transform data with fallback for missing preferences
  const usersWithPreferences = (rawData || []).map(profile => {
    const preferences = profile.preferences?.error 
      ? {
          open_curtains_interest: false,
          speed_dating_interest: false,
          libertine_party_interest: false
        }
      : profile.preferences;

    // Log preferences state for debugging
    if ('error' in preferences) {
      console.warn("Erreur : les préférences sont indisponibles pour l'utilisateur", profile.id);
    } else {
      console.log('Valid preferences found:', {
        open_curtains_interest: preferences.open_curtains_interest,
        speed_dating_interest: preferences.speed_dating_interest,
        libertine_party_interest: preferences.libertine_party_interest
      });
    }

    return {
      id: profile.id,
      relationship_type: profile.relationship_type,
      preferences
    };
  }) as ProfileWithPreferences[];

  // Fetch events and participations
  const { data: eventsData } = useQuery({
    queryKey: ['admin-events-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_participants (*)
        `);
      
      if (error) throw error;
      return data;
    }
  });

  // Helper function to check if preferences are valid
  const isValidPreferences = (prefs: ProfileWithPreferences['preferences']): prefs is ValidPreferences => {
    return !('error' in prefs);
  };

  // Calculate statistics
  const stats = {
    totalUsers: usersWithPreferences?.length || 0,
    openCurtainsInterested: usersWithPreferences?.filter(u => isValidPreferences(u.preferences) && u.preferences.open_curtains_interest)?.length || 0,
    speedDatingInterested: usersWithPreferences?.filter(u => isValidPreferences(u.preferences) && u.preferences.speed_dating_interest)?.length || 0,
    libertinePartyInterested: usersWithPreferences?.filter(u => isValidPreferences(u.preferences) && u.preferences.libertine_party_interest)?.length || 0,
    totalEvents: eventsData?.length || 0,
    totalParticipations: eventsData?.reduce((acc, event) => acc + (event.event_participants?.length || 0), 0) || 0,
  };

  // Calculate relationship type distribution with explicit typing
  const relationshipTypes = usersWithPreferences?.reduce((acc: RelationshipTypeCount, user) => {
    if (user.relationship_type) {
      user.relationship_type.forEach((type: string) => {
        acc[type] = (acc[type] || 0) + 1;
      });
    }
    return acc;
  }, {});

  // Prepare data for the chart with explicit number typing
  const chartData = relationshipTypes ? Object.entries(relationshipTypes).map(([name, value]) => ({
    name,
    value: value as number
  })) : [];

  // Sort chart data by value for top 10
  chartData.sort((a, b) => b.value - a.value);
  const top10Motivations = chartData.slice(0, 10);

  return (
    <div className="space-y-6">
      <StatisticsOverview 
        totalUsers={stats.totalUsers}
        totalEvents={stats.totalEvents}
        totalParticipations={stats.totalParticipations}
      />
      
      <InterestStatistics 
        openCurtainsInterested={stats.openCurtainsInterested}
        speedDatingInterested={stats.speedDatingInterested}
        libertinePartyInterested={stats.libertinePartyInterested}
      />
      
      <MotivationsChart data={top10Motivations} />
      
      <DetailedStatsTable 
        data={chartData}
        totalUsers={stats.totalUsers}
      />
    </div>
  );
}