
import { UploadCloud, Bot, BrainCircuit, Workflow, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: <UploadCloud className="w-10 h-10 text-primary" />,
    title: "Connect Your Files",
    description: "Simply connect your existing files and tools. No complicated setup or data migration needed.",
    details: "ROSS works with what you already have - your emails, documents, and practice management tools. Everything stays secure and organized.",
    timeframe: "Set up in minutes",
    example: "Upload your case files and ROSS automatically sorts them by type and makes them searchable"
  },
  {
    icon: <Bot className="w-10 h-10 text-primary" />,
    title: "ROSS Learns Your Style",
    description: "Your AI assistant learns how you work and what documents you need for different types of cases.",
    details: "The more you use ROSS, the better it gets at understanding your preferences and creating documents that match your style.",
    example: "Need a contract? Just tell ROSS what kind and it creates one using your firm's standard language"
  },
  {
    icon: <BrainCircuit className="w-10 h-10 text-primary" />,
    title: "Get Instant Research & Drafts", 
    description: "Ask questions in plain English and get research, document drafts, and legal insights in seconds.",
    details: "No more hours of research or starting documents from scratch. ROSS finds relevant cases and creates drafts instantly.",
    timeframe: "Answers in seconds, not hours",
    example: "Ask 'Find cases about remote work discrimination in California' and get relevant results with summaries in under a minute"
  },
  {
    icon: <Workflow className="w-10 h-10 text-primary" />,
    title: "Automate the Boring Stuff",
    description: "ROSS handles time tracking, billing, and routine tasks so you can focus on actual legal work.",
    details: "Automatic time entries, invoice generation, and deadline reminders. ROSS takes care of the administrative work you don't want to do.",
    timeframe: "Save hours every day",
    example: "When you sign a new client, ROSS automatically sets up their file, starts tracking time, and schedules follow-ups"
  },
  {
    icon: <TrendingUp className="w-10 h-10 text-primary" />,
    title: "Make Better Decisions",
    description: "Get clear insights about your cases and practice to help you make smarter business decisions.",
    details: "See which types of cases are most profitable, track your success rates, and identify opportunities to grow your practice.",
    timeframe: "Monthly reports and insights",
    example: "Discover that certain case types bring in 40% more revenue, helping you decide where to focus your marketing"
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-primary/5 relative overflow-hidden">
      {/* Enhanced Base with Monotone Overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-primary/6"></div>
        
        {/* Subtle Floating Elements */}
        <div className="absolute top-24 right-24 w-20 h-20 bg-primary/8 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-28 left-28 w-16 h-16 bg-primary/6 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="container relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold">How It Works</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Five comprehensive steps to transform your legal practice with AI-powered automation.
          </p>
        </div>
        
        <div className="space-y-16">
          {steps.map((step, index) => (
            <div key={step.title} className={`flex flex-col lg:flex-row items-center gap-8 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              {/* Icon and Step Number */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="bg-primary/10 p-6 w-24 h-24 flex items-center justify-center border-2 border-primary/20">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                  <p className="text-lg text-muted-foreground">{step.description}</p>
                </div>
                
                <div className="bg-background/80 p-4 border border-primary/10 space-y-3">
                  <p className="text-sm text-muted-foreground">{step.details}</p>
                  
                  {step.timeframe && (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="bg-primary/5 px-3 py-2 border border-primary/20">
                        <span className="text-xs font-semibold text-primary uppercase tracking-wide">Timeline</span>
                        <p className="text-sm font-medium">{step.timeframe}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="border-l-4 border-primary/30 pl-4">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wide">Example</span>
                    <p className="text-sm italic text-muted-foreground">{step.example}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
