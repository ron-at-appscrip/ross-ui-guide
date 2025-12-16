
import { Clock, TrendingUp, CalendarCheck, ShieldCheck, Settings, Bot } from 'lucide-react';

const benefits = [
  { icon: <Clock className="w-7 h-7" />, text: "Save 10+ hours per week" },
  { icon: <TrendingUp className="w-7 h-7" />, text: "Increase revenue by 40%" },
  { icon: <CalendarCheck className="w-7 h-7" />, text: "Never miss a deadline" },
  { icon: <ShieldCheck className="w-7 h-7" />, text: "Secure & compliant" },
  { icon: <Settings className="w-7 h-7" />, text: "Works with your tools" },
  { icon: <Bot className="w-7 h-7" />, text: "24/7 AI assistance" },
];

const Benefits = () => {
  return (
    <section id="benefits" className="py-20 lg:py-28 bg-primary/5 relative overflow-hidden">
      {/* Simple Two-Color Gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(45deg, hsl(var(--primary) / 0.07) 0%, hsl(var(--primary) / 0.03) 100%)'
        }}></div>
        
        {/* Minimal Floating Elements */}
        <div className="absolute top-20 left-20 w-24 h-24 bg-primary/6 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-24 right-24 w-20 h-20 bg-primary/4 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="container relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold">Unlock Unprecedented Efficiency</h2>
          <p className="mt-4 text-lg text-muted-foreground">The tangible benefits of integrating ROSS.AI into your practice.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {benefits.map((benefit) => (
            <div key={benefit.text} className="flex flex-col items-center text-center p-6 bg-card rounded-lg border hover:shadow-lg transition-shadow">
              <div className="p-3 mb-4 text-primary bg-primary/10 rounded-full">
                {benefit.icon}
              </div>
              <p className="font-semibold">{benefit.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
