import { Card, CardContent } from "@/components/ui/card";
import { Upload, Cpu, BookMarked, Download } from "lucide-react";

const steps = [
  {
    icon: Upload,
    number: "01",
    title: "Upload PDF",
    description: "Upload your daily newspaper PDF (The Hindu, Indian Express, or any other source).",
  },
  {
    icon: Cpu,
    number: "02",
    title: "AI Processing",
    description: "Our AI splits the PDF into chunks and analyzes each article for UPSC relevance.",
  },
  {
    icon: BookMarked,
    number: "03",
    title: "Review Notes",
    description: "Access organized notes mapped to GS Papers with summaries, keywords, and insights.",
  },
  {
    icon: Download,
    number: "04",
    title: "Export & Revise",
    description: "Save important notes, export as PDF, and track your revision progress daily.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            How{" "}
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              GSphere
            </span>{" "}
            Works
          </h2>
          <p className="text-lg text-muted-foreground">
            From newspaper to notes in four simple steps
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line (except last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-20 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5 bg-gradient-to-r from-accent to-primary opacity-30" />
              )}
              
              <Card className="relative bg-card border-border shadow-medium hover:shadow-strong transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-6 space-y-4 text-center">
                  {/* Step Number */}
                  <div className="text-6xl font-bold text-accent/20 absolute top-4 right-4">
                    {step.number}
                  </div>
                  
                  {/* Icon */}
                  <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-accent flex items-center justify-center shadow-glow">
                    <step.icon className="w-8 h-8 text-accent-foreground" />
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-2 pt-4">
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
