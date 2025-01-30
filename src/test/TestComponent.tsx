import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function TestComponent() {
  console.log('[TestComponent] Starting initialization');
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log('[TestComponent] Setting up auth check');
    
    const checkAuth = async () => {
      console.log('[TestComponent] Checking initial auth state');
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[TestComponent] Session check error:', error);
          setIsAuthenticated(false);
          return;
        }
        
        console.log('[TestComponent] Session status:', !!session);
        setIsAuthenticated(!!session);
      } catch (error) {
        console.error('[TestComponent] Auth check error:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[TestComponent] Auth state changed:', event);
      setIsAuthenticated(!!session);
    });

    return () => {
      console.log('[TestComponent] Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  console.log('[TestComponent] Rendering with auth status:', isAuthenticated);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Test Component</h1>
      <p>Authentication Status: {isAuthenticated ? 'Logged In' : 'Logged Out'}</p>
      <button
        onClick={() => {
          console.log('[TestComponent] Showing test toast');
          toast({
            title: "Test Toast",
            description: "This is a test notification",
          });
        }}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
      >
        Show Toast
      </button>
    </div>
  );
}