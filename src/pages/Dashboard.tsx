import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Session, User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { LogOut, Newspaper, Brain, Map, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import UploadNewspaper from "@/components/dashboard/UploadNewspaper";
import NewspapersList from "@/components/dashboard/NewspapersList";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: error.message,
      });
    } else {
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      navigate("/auth");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-accent flex items-center justify-center shadow-glow">
                  <Newspaper className="w-6 h-6 text-accent-foreground" />
                </div>
                <span className="text-2xl font-bold bg-gradient-accent bg-clip-text text-transparent">
                  GSphere
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/paper-mapping" className="gap-2">
                    <Map className="w-4 h-4" />
                    Paper Mapping
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/progress-tracking" className="gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Progress
                  </Link>
                </Button>
              </nav>
              <Button variant="ghost" onClick={handleSignOut} className="gap-2">
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">
              Welcome back!
            </h1>
            <p className="text-muted-foreground text-lg">
              Upload today's newspaper to start your AI-powered analysis
            </p>
          </div>

          {/* Upload Section */}
          <UploadNewspaper userId={user.id} />

          {/* Newspapers List */}
          <NewspapersList userId={user.id} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
