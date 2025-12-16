
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson, Esq.",
    firm: "Innovate Law Group",
    testimonial: "ROSS.AI has been a game-changer for our firm. The AI assistant saves us countless hours on research and drafting, allowing us to focus on high-value client work.",
    avatar: "https://i.pravatar.cc/150?u=sarahjohnson",
  },
  {
    name: "Michael Chen",
    firm: "Chen & Associates",
    testimonial: "As a solo practitioner, efficiency is everything. ROSS.AI's practice management tools have streamlined my entire workflow, from client intake to billing.",
    avatar: "https://i.pravatar.cc/150?u=michaelchen",
  },
  {
    name: "David Rodriguez",
    firm: "Miller & Thompson LLP",
    testimonial: "The predictive analytics are incredibly powerful. We're making more strategic decisions and have seen a noticeable impact on our case outcomes and profitability.",
    avatar: "https://i.pravatar.cc/150?u=davidrodriguez",
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20 lg:py-28 bg-primary/5 relative overflow-hidden">
      {/* Enhanced Base with Clean Overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-primary/6"></div>
        
        {/* Simple Floating Elements */}
        <div className="absolute top-28 left-28 w-22 h-22 bg-primary/8 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-32 right-32 w-18 h-18 bg-primary/6 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="container relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold">Trusted by Leading Law Firms</h2>
          <p className="mt-4 text-lg text-muted-foreground">Hear what our clients have to say about ROSS.AI.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item) => (
            <Card key={item.name} className="flex flex-col bg-card hover:shadow-xl transition-shadow">
              <CardContent className="p-6 flex-grow flex flex-col">
                <div className="flex mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 flex-grow">"{item.testimonial}"</p>
                <div className="flex items-center">
                  <img src={item.avatar} alt={item.name} className="w-12 h-12 rounded-full mr-4 object-cover" />
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.firm}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
