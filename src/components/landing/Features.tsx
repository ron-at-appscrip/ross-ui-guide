
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, BookCopy, BarChart4, FileSearch, Workflow, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: <BrainCircuit className="w-8 h-8 text-primary" />,
    title: "AI-Powered Legal Intelligence",
    description: "Advanced AI assistant trained on legal precedents with multi-modal capabilities",
    metrics: ["75% faster document drafting", "10x faster legal research", "95% citation accuracy"],
    capabilities: [
      "Generate contracts, briefs, and legal correspondence using natural language",
      "Cross-jurisdictional legal analysis with real-time updates",
      "Multi-language support for international firms"
    ]
  },
  {
    icon: <BookCopy className="w-8 h-8 text-primary" />,
    title: "Comprehensive Practice Management",
    description: "Intelligent matter management with automated billing and client communication",
    metrics: ["95% billable time capture", "60% faster billing", "35% improved client satisfaction"],
    capabilities: [
      "AI-enhanced case management with predictive timeline generation",
      "Automated time tracking across all activities and communications",
      "Secure client portal with intelligent response suggestions"
    ]
  },
  {
    icon: <FileSearch className="w-8 h-8 text-primary" />,
    title: "Document Intelligence Hub",
    description: "AI-powered document analysis, generation, and management system",
    metrics: ["100x faster document retrieval", "85% faster document creation", "70% fewer errors"],
    capabilities: [
      "Intelligent document organization with cross-document natural language search",
      "Automated document generation using firm templates and precedents",
      "Real-time collaboration with AI-powered version control"
    ]
  },
  {
    icon: <BarChart4 className="w-8 h-8 text-primary" />,
    title: "Predictive Analytics Engine",
    description: "Data-driven insights for case outcomes and firm performance optimization",
    metrics: ["20% improved case outcomes", "30% faster settlements", "15% revenue growth"],
    capabilities: [
      "Case outcome prediction based on 50,000+ historical cases",
      "Settlement analysis with judge tendencies and preferences",
      "Comprehensive firm performance analytics and growth identification"
    ]
  },
  {
    icon: <Workflow className="w-8 h-8 text-primary" />,
    title: "Intelligent Workflow Automation",
    description: "AI-powered process automation that learns and optimizes firm workflows",
    metrics: ["70% reduction in admin tasks", "90% fewer process errors", "50% more clients handled"],
    capabilities: [
      "Automated workflow learning from firm-specific processes",
      "Seamless integration with 300+ legal and business tools",
      "Exception handling with smart human oversight triggers"
    ]
  },
  {
    icon: <Shield className="w-8 h-8 text-primary" />,
    title: "Enterprise Security & Compliance",
    description: "SOC 2 compliant platform designed for attorney-client privilege protection",
    metrics: ["Zero data retention policy", "99% uptime guarantee", "AES-256 encryption"],
    capabilities: [
      "End-to-end encryption with regional data hosting options",
      "Comprehensive audit trails and regulatory compliance tools",
      "Built-in compliance for GDPR, CCPA, and ABA Model Rules"
    ]
  }
];

const Features = () => {
  return (
    <section id="features" className="py-20 lg:py-28 bg-background relative overflow-hidden">
      {/* Clean Monotone Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-primary/4"></div>
        
        {/* Minimal Floating Elements */}
        <div className="absolute top-20 right-20 w-24 h-24 bg-primary/6 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-24 left-24 w-20 h-20 bg-primary/4 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="container relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold">Key Features</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Comprehensive AI-powered platform delivering 3x faster case resolution and 40% reduction in administrative overhead.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="hover:shadow-xl transition-shadow duration-300 h-full">
              <CardHeader>
                <div className="bg-primary/10 p-4 w-fit mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl mb-3">{feature.title}</CardTitle>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Performance Metrics */}
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-primary">Key Metrics</h4>
                  <div className="flex flex-wrap gap-2">
                    {feature.metrics.map((metric, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {metric}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Core Capabilities */}
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-primary">Core Capabilities</h4>
                  <ul className="space-y-2">
                    {feature.capabilities.map((capability, index) => (
                      <li key={index} className="flex items-start text-sm text-muted-foreground">
                        <span className="text-primary mr-2 mt-1 text-xs">✓</span>
                        <span>{capability}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
