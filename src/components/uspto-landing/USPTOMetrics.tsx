import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Users, 
  CheckCircle,
  Target,
  Award,
  Zap
} from "lucide-react";

const metrics = [
  {
    icon: <Clock className="h-8 w-8 text-blue-600" />,
    value: "85%",
    label: "Reduction in Search Time",
    description: "From hours to minutes with AI-powered analysis",
    color: "blue"
  },
  {
    icon: <CheckCircle className="h-8 w-8 text-green-600" />,
    value: "70%",
    label: "Fewer Office Actions",
    description: "Higher quality applications with AI assistance",
    color: "green"
  },
  {
    icon: <DollarSign className="h-8 w-8 text-purple-600" />,
    value: "$2M+",
    label: "Client Costs Avoided",
    description: "Early conflict detection prevents costly disputes",
    color: "purple"
  },
  {
    icon: <Users className="h-8 w-8 text-orange-600" />,
    value: "90%",
    label: "Client Satisfaction",
    description: "Consistently high ratings from IP professionals",
    color: "orange"
  }
];

const additionalStats = [
  { label: "Patents Analyzed", value: "100M+", icon: <Target className="h-5 w-5" /> },
  { label: "Law Firms Served", value: "500+", icon: <Award className="h-5 w-5" /> },
  { label: "Countries Covered", value: "180+", icon: <Zap className="h-5 w-5" /> },
  { label: "Success Rate", value: "95.8%", icon: <TrendingUp className="h-5 w-5" /> }
];

const USPTOMetrics = () => {
  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-blue-900 via-indigo-900 to-purple-900 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-400/5 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="container relative z-10">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-800 text-blue-100 hover:bg-blue-800">
            <TrendingUp className="h-4 w-4 mr-2" />
            Proven Results
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Measurable Impact on Your Practice
          </h2>
          <p className="text-lg text-blue-100 max-w-3xl mx-auto">
            Our AI-powered USPTO services deliver quantifiable improvements 
            across every aspect of intellectual property management.
          </p>
        </div>

        {/* Main Metrics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {metrics.map((metric, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className={`p-3 rounded-full bg-${metric.color}-500/20`}>
                    {metric.icon}
                  </div>
                </div>
                <div className="text-4xl font-bold mb-2">{metric.value}</div>
                <div className="font-semibold mb-2">{metric.label}</div>
                <div className="text-sm text-blue-100">{metric.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Statistics */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Platform Statistics</h3>
            <p className="text-blue-100">Comprehensive coverage and proven reliability</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="p-2 rounded-full bg-blue-500/20 text-blue-300">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-blue-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Case Study Highlight */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-white/10 to-white/5 rounded-2xl p-8 border border-white/20">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <Badge className="mb-4 bg-green-800 text-green-100 hover:bg-green-800">
                  Success Story
                </Badge>
                <h3 className="text-2xl font-bold mb-4">
                  Tier-1 Law Firm Results
                </h3>
                <p className="text-blue-100 mb-4">
                  "Ross AI's USPTO integration transformed our IP practice. We've reduced 
                  search times by 90% and increased our patent filing accuracy to 98.5%."
                </p>
                <div className="text-sm text-blue-200">
                  — Managing Partner, AmLaw 100 Firm
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-3xl font-bold text-green-400">90%</div>
                  <div className="text-sm text-blue-200">Time Savings</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-3xl font-bold text-blue-400">98.5%</div>
                  <div className="text-sm text-blue-200">Filing Accuracy</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-3xl font-bold text-purple-400">300%</div>
                  <div className="text-sm text-blue-200">ROI Increase</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-3xl font-bold text-orange-400">50+</div>
                  <div className="text-sm text-blue-200">Attorneys Using</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold mb-4">Ready to See These Results?</h3>
          <p className="text-blue-100 mb-6">
            Join hundreds of IP professionals already transforming their practice with Ross AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold transition-colors duration-300">
              Start Free Trial
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-3 rounded-lg font-semibold transition-colors duration-300">
              Book Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default USPTOMetrics;