import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <section className="relative py-32 md:py-40 overflow-hidden">
      {/* Content */}
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary border border-border">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-foreground">AI-Powered UPSC Preparation</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight text-foreground">
            Transform Newspapers into{" "}
            <span className="text-accent">
              Smart UPSC Notes
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Upload daily newspapers and let AI analyze them into syllabus-mapped notes, 
            keywords, and topic summaries for efficient UPSC preparation.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            {isLoggedIn ? (
              <Button 
                size="lg" 
                className="gap-2" 
                onClick={() => navigate("/dashboard")}
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <>
                <Button 
                  size="lg" 
                  className="gap-2" 
                  onClick={() => navigate("/auth")}
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => navigate("/auth")}
                >
                  Sign In
                </Button>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-16 max-w-2xl mx-auto">
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-foreground">4</div>
              <div className="text-sm text-muted-foreground">GS Papers Covered</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-foreground">AI</div>
              <div className="text-sm text-muted-foreground">Powered Analysis</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-foreground">100%</div>
              <div className="text-sm text-muted-foreground">Syllabus Mapped</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
