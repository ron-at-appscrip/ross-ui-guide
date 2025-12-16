import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Shield, 
  FileText, 
  BarChart3, 
  Globe, 
  AlertTriangle,
  BrainCircuit,
  Clock
} from "lucide-react";

const features = [
  {
    icon: <Search className="w-8 h-8 text-primary" />,
    title: "Patent Search & Analysis",
    description: "AI-powered comprehensive patent landscape analysis with predictive insights",
    metrics: ["100M+ patents searched", "95% accuracy rate", "30-second results"],
    capabilities: [
      "Prior art discovery using machine learning algorithms",
      "Patent landscape visualization and competitive analysis",
      "Semantic search across multiple jurisdictions and languages"
    ]
  },
  {
    icon: <Shield className="w-8 h-8 text-primary" />,
    title: "Trademark Monitoring",
    description: "Real-time trademark watch service with intelligent conflict detection",
    metrics: ["24/7 monitoring", "99.9% uptime", "Instant alerts"],
    capabilities: [
      "Comprehensive trademark database monitoring across 180+ countries",
      "AI-powered similarity detection for visual and phonetic conflicts",
      "Automated opposition and cancellation deadline tracking"
    ]
  },
  {
    icon: <FileText className="w-8 h-8 text-primary" />,
    title: "Smart Filing Assistance",
    description: "Automated patent and trademark application preparation and filing",
    metrics: ["70% faster filing", "90% fewer errors", "Auto-docketing"],
    capabilities: [
      "Intelligent form completion using AI and existing data",
      "USPTO direct filing integration with real-time status updates",
      "Automated document generation using firm templates"
    ]
  },
  {
    icon: <BarChart3 className="w-8 h-8 text-primary" />,
    title: "Portfolio Analytics",
    description: "Comprehensive IP portfolio management with predictive analytics",
    metrics: ["Portfolio optimization", "Cost reduction 40%", "Risk assessment"],
    capabilities: [
      "Portfolio value assessment and optimization recommendations",
      "Renewal deadline management with automated reminders",
      "Competitive intelligence and market trend analysis"
    ]
  },
  {
    icon: <AlertTriangle className="w-8 h-8 text-primary" />,
    title: "Litigation Support",
    description: "Advanced tools for patent and trademark litigation and enforcement",
    metrics: ["Infringement analysis", "Validity studies", "Expert reports"],
    capabilities: [
      "Automated infringement claim charts and analysis",
      "Prior art validation for invalidity defenses",
      "Damages calculation and expert witness support tools"
    ]
  },
  {
    icon: <Globe className="w-8 h-8 text-primary" />,
    title: "International Filing",
    description: "Streamlined PCT and Madrid Protocol applications worldwide",
    metrics: ["180+ countries", "Multi-jurisdiction", "Cost estimates"],
    capabilities: [
      "PCT application management with national phase tracking",
      "Madrid Protocol trademark filing and maintenance",
      "International deadline management and foreign associate coordination"
    ]
  }
];

const USPTOFeatures = () => {
  return (
    <section id="features" className="py-20 lg:py-28 bg-background relative overflow-hidden">
      {/* Background styling */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-primary/4"></div>
        <div className="absolute top-20 right-20 w-24 h-24 bg-primary/6 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-24 left-24 w-20 h-20 bg-primary/4 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="container relative z-10">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
              <BrainCircuit className="h-4 w-4 mr-2" />
              AI-Powered IP Tools
            </Badge>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold">
            Complete Intellectual Property Suite
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            From initial search to global protection, our AI-powered platform delivers 
            comprehensive patent and trademark services with unprecedented speed and accuracy.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card 
              key={feature.title} 
              className="hover:shadow-xl transition-all duration-300 h-full"
            >
              <CardHeader>
                <div className="bg-primary/10 p-4 w-fit mb-4 rounded-lg">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl mb-3">{feature.title}</CardTitle>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Performance Metrics */}
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-primary flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Key Performance Metrics
                  </h4>
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

        {/* Additional CTA */}
        <div className="text-center mt-16">
          <div className="bg-primary text-primary-foreground rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Ready to Transform Your IP Practice?</h3>
            <p className="text-primary-foreground/80 mb-6">
              Join hundreds of law firms already using Ross AI for faster, smarter IP management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-background text-primary hover:bg-background/90 px-6 py-3 rounded-lg font-semibold transition-colors">
                Start Free Trial
              </button>
              <button className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary px-6 py-3 rounded-lg font-semibold transition-colors">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default USPTOFeatures;