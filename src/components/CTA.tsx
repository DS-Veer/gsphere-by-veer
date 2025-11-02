import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const CTA = () => {
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
    <section className="py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            Ready to Transform Your UPSC Preparation?
          </h2>

          {/* Description */}
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of aspirants who are saving hours daily with AI-powered newspaper analysis. 
            Start making smarter notes today.
          </p>

          {/* CTA Button */}
          <div className="pt-4">
            <Button 
              size="lg" 
              className="gap-2"
              onClick={() => navigate(isLoggedIn ? "/dashboard" : "/auth")}
            >
              {isLoggedIn ? "Go to Dashboard" : "Get Started Free"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Trust Indicators */}
          {!isLoggedIn && (
            <div className="flex flex-wrap justify-center gap-8 pt-6 text-muted-foreground text-sm">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span>AI-Powered Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span>Daily Updates</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CTA;
