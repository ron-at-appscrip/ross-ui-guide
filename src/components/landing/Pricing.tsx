
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const tiers = [
  {
    name: "Solo Practitioner",
    price: "$199",
    description: "For individual lawyers and small practices.",
    features: ["1 User", "AI Legal Assistant", "Practice Management", "Basic Analytics"],
    isMostPopular: false,
  },
  {
    name: "Small Firm",
    price: "$499",
    description: "For growing firms that need more power.",
    features: ["Up to 10 Users", "Advanced AI Features", "Client Portal", "Predictive Analytics"],
    isMostPopular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large firms with custom needs.",
    features: ["Unlimited Users", "Dedicated Support", "Custom Integrations", "On-premise Option"],
    isMostPopular: false,
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-20 lg:py-28 bg-background relative overflow-hidden">
      {/* Clean Monotone Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-primary/4"></div>
        
        {/* Minimal Floating Elements */}
        <div className="absolute top-24 left-24 w-26 h-26 bg-primary/6 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-28 right-28 w-22 h-22 bg-primary/4 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="container relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold">Flexible Pricing for Every Firm</h2>
          <p className="mt-4 text-lg text-muted-foreground">Choose the plan that's right for you. Full pricing details available.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {tiers.map((tier) => (
            <Card key={tier.name} className={`flex flex-col h-full ${tier.isMostPopular ? 'border-primary ring-2 ring-primary' : ''}`}>
              {tier.isMostPopular && (
                <div className="bg-primary text-primary-foreground text-xs font-bold text-center py-1 rounded-t-lg">MOST POPULAR</div>
              )}
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.price.startsWith('$') && <span className="text-muted-foreground">/month</span>}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="w-5 h-5 text-accent mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link to={tier.name === 'Enterprise' ? '/contact' : '/signup'} className="w-full">
                  <Button className="w-full" variant={tier.isMostPopular ? "default" : "outline"}>
                    {tier.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link to="/pricing">
            <Button variant="secondary" size="lg">See Full Pricing</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
