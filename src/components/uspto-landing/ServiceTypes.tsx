import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Shield, 
  Search,
  BarChart3,
  AlertTriangle,
  Globe,
  Calendar,
  Scale,
  Lightbulb,
  Trademark
} from "lucide-react";
import { Link } from "react-router-dom";

const ServiceTypes = () => {
  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-background to-slate-50 relative overflow-hidden">
      <div className="container relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Choose Your IP Service
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Whether you're protecting inventions or building brand identity, 
            our specialized services cover all aspects of intellectual property law.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Patent Services */}
          <Card className="relative overflow-hidden border-2 border-blue-200 hover:border-blue-400 transition-colors duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full w-fit">
                <Lightbulb className="h-12 w-12 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-blue-900">Patent Services</CardTitle>
              <p className="text-muted-foreground">
                Comprehensive patent protection from idea to enforcement
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Service Categories */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Search className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Patentability & Prior Art Search</h4>
                    <p className="text-sm text-muted-foreground">AI-powered searches across global patent databases</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Application Drafting & Filing</h4>
                    <p className="text-sm text-muted-foreground">Smart templates and automated form completion</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Scale className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Prosecution & Office Actions</h4>
                    <p className="text-sm text-muted-foreground">Strategic responses and claim amendments</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <BarChart3 className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Portfolio Analytics</h4>
                    <p className="text-sm text-muted-foreground">Value assessment and optimization strategies</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Litigation Support</h4>
                    <p className="text-sm text-muted-foreground">Infringement analysis and validity studies</p>
                  </div>
                </div>
              </div>

              {/* Key Statistics */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3">Patent Service Metrics</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">50M+</div>
                    <div className="text-xs text-blue-700">Patents Analyzed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">85%</div>
                    <div className="text-xs text-blue-700">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">60%</div>
                    <div className="text-xs text-blue-700">Time Saved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">180+</div>
                    <div className="text-xs text-blue-700">Countries</div>
                  </div>
                </div>
              </div>

              <Link to="/dashboard/uspto" className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Explore Patent Services
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Trademark Services */}
          <Card className="relative overflow-hidden border-2 border-green-200 hover:border-green-400 transition-colors duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
            
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 p-4 bg-green-100 rounded-full w-fit">
                <Shield className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-900">Trademark Services</CardTitle>
              <p className="text-muted-foreground">
                Brand protection from search to global registration
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Service Categories */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Search className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Comprehensive Trademark Search</h4>
                    <p className="text-sm text-muted-foreground">Global database search with similarity analysis</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Application Filing & Strategy</h4>
                    <p className="text-sm text-muted-foreground">Multi-class applications and prosecution strategy</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Opposition & Enforcement</h4>
                    <p className="text-sm text-muted-foreground">Trademark disputes and enforcement actions</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Watch Services</h4>
                    <p className="text-sm text-muted-foreground">24/7 monitoring for trademark conflicts</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Globe className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">International Registration</h4>
                    <p className="text-sm text-muted-foreground">Madrid Protocol and direct national filings</p>
                  </div>
                </div>
              </div>

              {/* Key Statistics */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-3">Trademark Service Metrics</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">10M+</div>
                    <div className="text-xs text-green-700">Marks Searched</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">95%</div>
                    <div className="text-xs text-green-700">Approval Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">24/7</div>
                    <div className="text-xs text-green-700">Monitoring</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">120+</div>
                    <div className="text-xs text-green-700">Jurisdictions</div>
                  </div>
                </div>
              </div>

              <Link to="/dashboard/uspto" className="block">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Explore Trademark Services
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Need Both Patent & Trademark Services?</h3>
            <p className="text-slate-300 mb-6">
              Get comprehensive IP protection with our integrated patent and trademark management platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-white text-slate-900 hover:bg-slate-100">
                View All Services
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-slate-900">
                Contact IP Specialist
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceTypes;