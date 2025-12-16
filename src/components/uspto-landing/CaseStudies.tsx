import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Shield, Scale } from "lucide-react";

const caseStudies = [
  {
    icon: <Lightbulb className="h-8 w-8 text-blue-600" />,
    title: "Tech Startup Patent Portfolio",
    company: "AI Startup (Series B)",
    challenge: "Rapid patent filing for 50+ AI innovations",
    result: "90% faster filing, $500K cost savings",
    metrics: ["50+ Patents Filed", "90% Time Reduction", "$500K Saved"]
  },
  {
    icon: <Shield className="h-8 w-8 text-green-600" />,
    title: "Fashion Brand Protection",
    company: "Global Fashion Brand",
    challenge: "Trademark monitoring across 80+ countries",
    result: "24/7 monitoring prevented 15 conflicts",
    metrics: ["80+ Countries", "15 Conflicts Prevented", "99.9% Uptime"]
  },
  {
    icon: <Scale className="h-8 w-8 text-purple-600" />,
    title: "Pharmaceutical Litigation",
    company: "BigPharma Corp",
    challenge: "Patent validity analysis for $2B drug",
    result: "Comprehensive prior art analysis in 2 hours",
    metrics: ["2 Hour Analysis", "50M+ Patents", "$2B Case Value"]
  }
];

const CaseStudies = () => {
  return (
    <section className="py-20 lg:py-28 bg-slate-50">
      <div className="container">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-100">
            Success Stories
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Client Success Stories
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            See how leading organizations use Ross AI to transform their IP operations.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {caseStudies.map((study, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="p-3 rounded-full bg-blue-100 w-fit mb-4">
                  {study.icon}
                </div>
                <CardTitle className="text-xl">{study.title}</CardTitle>
                <p className="text-muted-foreground text-sm">{study.company}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Challenge</h4>
                  <p className="text-sm text-muted-foreground">{study.challenge}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm mb-2">Result</h4>
                  <p className="text-sm text-muted-foreground">{study.result}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {study.metrics.map((metric, metricIndex) => (
                    <Badge key={metricIndex} variant="secondary" className="text-xs">
                      {metric}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CaseStudies;