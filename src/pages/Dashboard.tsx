import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Session, User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { LogOut, Newspaper, Brain, Map, TrendingUp, Menu, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import UploadNewspaper from "@/components/dashboard/UploadNewspaper";
import NewspapersList from "@/components/dashboard/NewspapersList";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
        <div className="max-w-[1100px] mx-auto px-4">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-accent flex items-center justify-center shadow-glow">
                  <Newspaper className="w-5 h-5 text-accent-foreground" />
                </div>
                <span className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-accent bg-clip-text text-transparent">
                  GSphere
                </span>
              </Link>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/paper-mapping" className="flex items-center gap-2">
                  <Map className="w-4 h-4" />
                  <span className="hidden lg:inline">Paper Mapping</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/progress-tracking" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden lg:inline">Progress</span>
                </Link>
              </Button>
              <Button variant="ghost" onClick={handleSignOut} className="gap-2 hidden lg:flex">
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </Button>
            </nav>

            {/* Mobile actions */}
            <div className="flex items-center gap-2 md:hidden">
              {/* sign out icon small on mobile, still performs same action */}
              <Button variant="ghost" onClick={handleSignOut} size="icon" aria-label="Sign out">
                <LogOut className="w-5 h-5" />
              </Button>

              {/* mobile menu toggle */}
              <button
                aria-expanded={mobileMenuOpen}
                aria-label="Open menu"
                onClick={() => setMobileMenuOpen((s) => !s)}
                className="p-2 rounded-md hover:bg-accent/10"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile menu dropdown (keeps same links + sign out) */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-2 mb-2 p-3 bg-background border border-border rounded-lg shadow-sm">
              <div className="flex flex-col gap-2">
                <Link to="/paper-mapping" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-2 py-2 rounded hover:bg-accent/5">
                  <Map className="w-4 h-4" />
                  Paper Mapping
                </Link>
                <Link to="/progress-tracking" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-2 py-2 rounded hover:bg-accent/5">
                  <TrendingUp className="w-4 h-4" />
                  Progress
                </Link>
                <button
                  className="flex items-center gap-2 px-2 py-2 rounded hover:bg-accent/5 text-left"
                  onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1100px] mx-auto px-4 py-6">
        <div className="w-full space-y-6">
          {/* Welcome Section */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              Welcome back!
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Upload today's newspaper to start your AI-powered analysis
            </p>
          </div>

          {/* Upload + List stack vertically and are full width on mobile */}
          <div className="flex flex-col gap-6">
            <div className="w-full">
              <UploadNewspaper userId={user.id} />
            </div>
            <div className="w-full">
              <NewspapersList userId={user.id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
