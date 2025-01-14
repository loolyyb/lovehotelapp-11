import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthError, Session } from "@supabase/supabase-js";
import { NotificationsMenu } from "./header/NotificationsMenu";
import { UserMenu } from "./header/UserMenu";
import { SideMenu } from "./header/SideMenu";
import { Home } from "lucide-react";

interface HeaderProps {
  userProfile?: any;  // Add this interface to accept userProfile prop
}

export function Header({ userProfile }: HeaderProps) {
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      navigate("/");
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
    } catch (error) {
      console.error('Logout error:', error);
      if (error instanceof AuthError) {
        toast({
          variant: "destructive",
          title: "Erreur de déconnexion",
          description: error.message,
        });
      }
    }
  };

  useEffect(() => {
    const fetchProfile = async (session: Session) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session);
      }
    });

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await fetchProfile(session);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        navigate('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Use the passed userProfile if available, otherwise use the fetched profile
  const displayProfile = userProfile || profile;

  if (!displayProfile) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center space-x-4">
          <SideMenu />
          <Link to="/dashboard" className="text-burgundy hover:text-rose-600">
            <Home className="h-6 w-6" />
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <NotificationsMenu />
          <UserMenu
            avatarUrl={displayProfile.avatar_url}
            fullName={displayProfile.full_name}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </header>
  );
}