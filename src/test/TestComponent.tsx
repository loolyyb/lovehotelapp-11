import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function TestComponent() {
  console.log('TestComponent: Starting component initialization');
  
  console.log('TestComponent: Before useState call');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  console.log('TestComponent: After useState call, initial value:', isAuthenticated);
  
  const { toast } = useToast();
  console.log('TestComponent: useToast hook initialized');

  useEffect(() => {
    console.log('TestComponent: useEffect starting');
    
    // Check initial auth state
    const checkAuth = async () => {
      console.log('TestComponent: checkAuth starting');
      try {
        console.log('TestComponent: Fetching Supabase session');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('TestComponent: Session check error:', error);
          setIsAuthenticated(false);
          return;
        }
        
        console.log('TestComponent: Session status:', !!session);
        setIsAuthenticated(!!session);
      } catch (error) {
        console.error('TestComponent: Auth check error:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    console.log('TestComponent: Setting up auth state listener');
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('TestComponent: Auth state change:', event);
      console.log('TestComponent: New session status:', !!session);
      setIsAuthenticated(!!session);
    });

    return () => {
      console.log('TestComponent: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  console.log('TestComponent: Rendering, auth status:', isAuthenticated);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Test Component</h1>
      <p>Authentication Status: {isAuthenticated ? 'Logged In' : 'Logged Out'}</p>
      <button
        onClick={() => {
          console.log('TestComponent: Toast button clicked');
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