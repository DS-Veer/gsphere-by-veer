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
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            How{" "}
            <span className="text-accent">
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
                <div className="hidden lg:block absolute top-12 left-[calc(50%+32px)] w-[calc(100%-64px)] h-px bg-border" />
              )}
              
              <Card className="relative border hover:border-accent/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-medium">
                <CardContent className="p-6 space-y-4 text-center">
                  {/* Step Number */}
                  <div className="text-5xl font-bold text-muted absolute top-3 right-3 opacity-40">
                    {step.number}
                  </div>
                  
                  {/* Icon */}
                  <div className="relative mx-auto w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center">
                    <step.icon className="w-7 h-7 text-accent" />
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-2 pt-2">
                    <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
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
