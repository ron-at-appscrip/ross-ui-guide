import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, Building } from "lucide-react";
import { Link } from "react-router-dom";

const pricingTiers = [
  {
    name: "Starter",
    icon: <Zap className="h-6 w-6" />,
    price: "$299",
    description: "Perfect for solo practitioners and small firms",
    features: [
      "10 patent searches per month",
      "5 trademark searches per month",
      "Basic portfolio management",
      "Email support",
      "USPTO direct filing",
      "Standard templates"
    ],
    isMostPopular: false,
    color: "blue"
  },
  {
    name: "Professional",
    icon: <Crown className="h-6 w-6" />,
    price: "$799",
    description: "Ideal for growing IP practices and mid-size firms",
    features: [
      "Unlimited patent & trademark searches",
      "Advanced portfolio analytics",
      "AI-powered risk assessment",
      "Priority support",
      "Custom templates",
      "Watch services included",
      "Team collaboration tools",
      "API access"
    ],
    isMostPopular: true,
    color: "purple"
  },
  {
    name: "Enterprise",
    icon: <Building className="h-6 w-6" />,
    price: "Custom",
    description: "For large firms and corporations with complex needs",
    features: [
      "Everything in Professional",
      "Dedicated account manager",
      "Custom integrations",
      "On-premise deployment option",
      "Advanced security features",
      "Custom reporting",
      "SLA guarantees",
      "Training & onboarding"
    ],
    isMostPopular: false,
    color: "slate"
  }
];

const USPTOPricing = () => {
  return (
    <section className="py-20 lg:py-28 bg-background relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-primary/4"></div>
        <div className="absolute top-20 right-20 w-24 h-24 bg-primary/6 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-20 h-20 bg-primary/4 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      <div className="container relative z-10">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/10">
            Simple Pricing
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Choose Your USPTO Services Plan
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Flexible pricing designed for IP professionals at every stage. 
            All plans include direct USPTO integration and AI-powered tools.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {pricingTiers.map((tier) => (
            <Card 
              key={tier.name} 
              className={`relative h-full ${
                tier.isMostPopular 
                  ? 'border-2 border-primary ring-2 ring-primary/20 scale-105' 
                  : 'border hover:border-primary/20'
              } transition-all duration-300`}
            >
              {tier.isMostPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground hover:bg-primary">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-6">
                <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                  <div className="text-primary">
                    {tier.icon}
                  </div>
                </div>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription className="text-base">{tier.description}</CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.price !== 'Custom' && <span className="text-muted-foreground">/month</span>}
                </div>
              </CardHeader>

              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Link to={tier.name === 'Enterprise' ? '/contact' : '/signup'} className="w-full">
                  <Button 
                    className={`w-full ${
                      tier.isMostPopular || tier.name === 'Enterprise'
                        ? 'bg-primary hover:bg-primary/90'
                        : 'bg-primary hover:bg-primary/90'
                    } text-primary-foreground`}
                  >
                    {tier.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Additional Information */}
        <div className="mt-16 text-center">
          <div className="bg-blue-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-primary">
              All Plans Include
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center justify-center text-primary">
                <Check className="w-4 h-4 mr-2 text-primary" />
                Direct USPTO Filing
              </div>
              <div className="flex items-center justify-center text-primary">
                <Check className="w-4 h-4 mr-2 text-primary" />
                AI-Powered Search
              </div>
              <div className="flex items-center justify-center text-primary">
                <Check className="w-4 h-4 mr-2 text-primary" />
                Real-time Monitoring
              </div>
              <div className="flex items-center justify-center text-primary">
                <Check className="w-4 h-4 mr-2 text-primary" />
                24/7 System Access
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Questions about pricing? Need a custom solution?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/5">
              View Detailed Pricing
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Schedule Consultation
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default USPTOPricing;