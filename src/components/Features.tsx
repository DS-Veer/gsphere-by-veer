import { Card, CardContent } from "@/components/ui/card";
import { FileText, Brain, BookOpen, TrendingUp } from "lucide-react";
import aiAnalysisImage from "@/assets/ai-analysis.png";
import dashboardImage from "@/assets/dashboard.png";

const features = [
  {
    icon: FileText,
    title: "PDF Upload & Processing",
    description: "Upload daily newspapers in PDF format. Our AI automatically processes and splits them for comprehensive analysis.",
  },
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Advanced LLM reads and summarizes each article in UPSC-style notes with Facts, Issues, and Way Forward.",
  },
  {
    icon: BookOpen,
    title: "GS Paper Mapping",
    description: "Every article is automatically mapped to relevant GS Papers (1-4) and specific syllabus topics.",
  },
  {
    icon: TrendingUp,
    title: "Daily Progress Tracking",
    description: "Track coverage by GS Paper, identify recurring themes, and monitor your preparation progress daily.",
  },
];

const Features = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            Smart Features for{" "}
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              UPSC Success
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to transform newspaper reading into effective UPSC preparation
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="bg-card border-border shadow-medium hover:shadow-strong transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-accent flex items-center justify-center shadow-glow">
                  <feature.icon className="w-6 h-6 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Showcase */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* AI Analysis */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-light border border-accent/20">
              <Brain className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Intelligent Analysis</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold">
              AI That Understands UPSC Requirements
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our advanced AI doesn't just summarize—it analyzes content through the lens of UPSC syllabus, 
              extracting key facts, identifying critical issues, and suggesting potential solutions aligned 
              with exam requirements.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </div>
                <span className="text-muted-foreground">Keyword extraction with contextual definitions</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </div>
                <span className="text-muted-foreground">Links current affairs to static topics</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </div>
                <span className="text-muted-foreground">Structured notes in Facts/Issues/Way Forward format</span>
              </li>
            </ul>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-accent opacity-20 blur-3xl rounded-full" />
            <img 
              src={aiAnalysisImage} 
              alt="AI Analysis Interface" 
              className="relative rounded-2xl shadow-strong"
            />
          </div>

          {/* Dashboard - Reversed Order on Desktop */}
          <div className="relative lg:order-last">
            <div className="absolute inset-0 bg-gradient-hero opacity-20 blur-3xl rounded-full" />
            <img 
              src={dashboardImage} 
              alt="Dashboard Interface" 
              className="relative rounded-2xl shadow-strong"
            />
          </div>
          <div className="space-y-6 lg:order-last">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Progress Tracking</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold">
              Organized Dashboard for Systematic Study
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              View all analyzed articles organized by GS Paper and themes. Track your daily coverage, 
              identify recurring topics, and ensure comprehensive preparation across all subjects.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <span className="text-muted-foreground">Filter by GS Paper, theme, or keyword</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <span className="text-muted-foreground">Mark articles as revised or important</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <span className="text-muted-foreground">Export notes as PDF or Markdown</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
