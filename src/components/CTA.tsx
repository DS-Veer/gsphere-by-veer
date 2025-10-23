import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-hero opacity-95" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-glow/30 rounded-full blur-3xl" />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-foreground/10 border border-accent-foreground/20">
            <Sparkles className="w-4 h-4 text-accent-foreground" />
            <span className="text-sm font-medium text-accent-foreground">Start Your Journey Today</span>
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-6xl font-bold text-primary-foreground leading-tight">
            Ready to Transform Your UPSC Preparation?
          </h2>

          {/* Description */}
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Join thousands of aspirants who are saving hours daily with AI-powered newspaper analysis. 
            Start making smarter notes today.
          </p>

          {/* CTA Button */}
          <div className="pt-4">
            <Button 
              size="xl" 
              className="bg-accent-foreground text-primary hover:bg-accent-foreground/90 gap-2 shadow-strong"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 pt-8 text-primary-foreground/60">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-foreground" />
              <span className="text-sm">No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-foreground" />
              <span className="text-sm">AI-Powered Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-foreground" />
              <span className="text-sm">Daily Updates</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
