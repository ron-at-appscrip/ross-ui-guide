import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  BrainCircuit, 
  FileText, 
  Send, 
  BarChart3,
  ArrowRight,
  Clock,
  CheckCircle,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

// Static color mapping to avoid dynamic Tailwind class issues
const colorStyles = {
  blue: {
    bg: "bg-blue-50",
    bgHover: "hover:bg-blue-100",
    border: "border-blue-200",
    text: "text-blue-600",
    badge: "bg-blue-100 text-blue-800",
    icon: "bg-blue-100",
    iconDark: "bg-blue-500"
  },
  purple: {
    bg: "bg-purple-50",
    bgHover: "hover:bg-purple-100",
    border: "border-purple-200",
    text: "text-purple-600",
    badge: "bg-purple-100 text-purple-800",
    icon: "bg-purple-100",
    iconDark: "bg-purple-500"
  },
  green: {
    bg: "bg-green-50",
    bgHover: "hover:bg-green-100",
    border: "border-green-200",
    text: "text-green-600",
    badge: "bg-green-100 text-green-800",
    icon: "bg-green-100",
    iconDark: "bg-green-500"
  },
  orange: {
    bg: "bg-orange-50",
    bgHover: "hover:bg-orange-100",
    border: "border-orange-200",
    text: "text-orange-600",
    badge: "bg-orange-100 text-orange-800",
    icon: "bg-orange-100",
    iconDark: "bg-orange-500"
  },
  indigo: {
    bg: "bg-indigo-50",
    bgHover: "hover:bg-indigo-100",
    border: "border-indigo-200",
    text: "text-indigo-600",
    badge: "bg-indigo-100 text-indigo-800",
    icon: "bg-indigo-100",
    iconDark: "bg-indigo-500"
  }
};

const processSteps = [
  {
    step: 1,
    icon: Search,
    title: "AI-Powered Search & Analysis",
    description: "Comprehensive patent and trademark search across global databases",
    details: [
      "Machine learning algorithms scan 100M+ patents",
      "Semantic analysis for similar prior art",
      "Automated competitive analysis"
    ],
    duration: "30 seconds",
    color: "blue" as keyof typeof colorStyles
  },
  {
    step: 2,
    icon: BrainCircuit,
    title: "Strategy Development",
    description: "AI-generated recommendations and risk assessment",
    details: [
      "Patentability analysis with confidence scores",
      "Filing strategy based on portfolio goals",
      "Risk assessment for potential conflicts"
    ],
    duration: "2 minutes",
    color: "purple" as keyof typeof colorStyles
  },
  {
    step: 3,
    icon: FileText,
    title: "Application Preparation",
    description: "Automated document generation and form completion",
    details: [
      "Smart template selection",
      "Automated form completion",
      "AI-assisted claim drafting"
    ],
    duration: "5 minutes",
    color: "green" as keyof typeof colorStyles
  },
  {
    step: 4,
    icon: Send,
    title: "Filing & Prosecution",
    description: "Direct USPTO integration with real-time updates",
    details: [
      "Secure electronic filing to USPTO",
      "Automated deadline management",
      "Real-time status monitoring"
    ],
    duration: "Instant",
    color: "orange" as keyof typeof colorStyles
  },
  {
    step: 5,
    icon: BarChart3,
    title: "Portfolio Management",
    description: "Ongoing monitoring and optimization",
    details: [
      "Automated renewal management",
      "Portfolio analytics",
      "Continuous infringement monitoring"
    ],
    duration: "Ongoing",
    color: "indigo" as keyof typeof colorStyles
  }
];

const metrics = [
  { value: "95%", label: "Time Reduction", color: "text-blue-600" },
  { value: "99.5%", label: "Accuracy Rate", color: "text-green-600" },
  { value: "8min", label: "Avg Process Time", color: "text-purple-600" },
  { value: "24/7", label: "Availability", color: "text-orange-600" }
];

const USPTOProcess = () => {
  return (
    <section 
      className="py-16 lg:py-24 bg-gradient-to-b from-gray-50 to-white relative"
      aria-labelledby="process-heading"
    >
      {/* Simplified background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-0 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 left-0 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <header className="text-center mb-12 lg:mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary">
            <Zap className="h-3 w-3 mr-1" />
            Streamlined Process
          </Badge>
          <h2 id="process-heading" className="text-3xl lg:text-4xl font-bold mb-4">
            From Idea to Protection in Minutes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform complex IP processes into simple, automated steps that deliver results in minutes instead of weeks.
          </p>
        </header>

        {/* Process Steps - Semantic HTML */}
        <ol className="max-w-5xl mx-auto space-y-8 lg:space-y-12">
          {processSteps.map((step, index) => {
            const styles = colorStyles[step.color];
            const Icon = step.icon;
            
            return (
              <li key={step.step} className="relative">
                {/* Connection line */}
                {index < processSteps.length - 1 && (
                  <div 
                    className="absolute left-8 top-20 w-0.5 h-full bg-gray-200 -z-10 hidden lg:block"
                    aria-hidden="true"
                  />
                )}
                
                <article className="relative flex flex-col lg:flex-row gap-6 lg:gap-8">
                  {/* Step number circle */}
                  <div className="flex-shrink-0">
                    <div className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg",
                      styles.bg,
                      styles.text,
                      "border-2",
                      styles.border
                    )}>
                      {step.step}
                    </div>
                  </div>
                  
                  {/* Content card */}
                  <Card className={cn(
                    "flex-1 border-l-4 transition-all duration-300",
                    styles.border,
                    styles.bgHover
                  )}>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                        {/* Icon */}
                        <div className={cn(
                          "p-3 rounded-lg flex-shrink-0 w-fit",
                          styles.icon
                        )}>
                          <Icon className={cn("h-6 w-6", styles.text)} />
                        </div>
                        
                        {/* Text content */}
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-semibold">{step.title}</h3>
                            <Badge variant="secondary" className={cn("text-xs", styles.badge)}>
                              <Clock className="h-3 w-3 mr-1" />
                              {step.duration}
                            </Badge>
                          </div>
                          
                          <p className="text-muted-foreground">
                            {step.description}
                          </p>
                          
                          <ul className="space-y-2" role="list">
                            {step.details.map((detail, detailIndex) => (
                              <li key={detailIndex} className="flex items-start text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </article>
              </li>
            );
          })}
        </ol>

        {/* Performance Metrics */}
        <div className="mt-16 lg:mt-20">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-center mb-8">
                Process Performance Metrics
              </h3>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, index) => (
                  <div key={index} className="text-center">
                    <div className={cn("text-3xl lg:text-4xl font-bold mb-2", metric.color)}>
                      {metric.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {metric.label}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button size="lg" className="gap-2">
            Start Your IP Process Today
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* SEO: Structured Data */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "USPTO Patent and Trademark Filing Process",
            "description": "5-step automated process for filing patents and trademarks with the USPTO",
            "totalTime": "PT8M",
            "step": processSteps.map((step, index) => ({
              "@type": "HowToStep",
              "position": index + 1,
              "name": step.title,
              "text": step.description,
              "timeRequired": step.duration
            }))
          })
        }}
      />
    </section>
  );
};

export default USPTOProcess;