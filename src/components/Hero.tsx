import { Button } from "@/components/ui/button";
import { Upload, Brain, BarChart } from "lucide-react";
import heroBackground from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroBackground} 
          alt="Educational background" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4 py-20 mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-light border border-accent/20">
            <Brain className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-foreground">AI-Powered UPSC Preparation</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Transform Newspapers into{" "}
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              Smart UPSC Notes
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Upload daily newspapers and let AI analyze them into syllabus-mapped notes, 
            keywords, and topic summaries for efficient UPSC preparation.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button variant="hero" size="xl" className="gap-2">
              <Upload className="w-5 h-5" />
              Upload Newspaper
            </Button>
            <Button variant="outline" size="xl" className="gap-2">
              <BarChart className="w-5 h-5" />
              View Dashboard
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary-glow">4</div>
              <div className="text-sm text-muted-foreground">GS Papers Covered</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary-glow">AI</div>
              <div className="text-sm text-muted-foreground">Powered Analysis</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary-glow">100%</div>
              <div className="text-sm text-muted-foreground">Syllabus Mapped</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
    </section>
  );
};

export default Hero;
