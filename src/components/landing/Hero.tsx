
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden">
      {/* Clean Gradient Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Simple Two-Tone Gradient */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08) 0%, hsl(var(--background)) 60%)'
        }}></div>
        
        {/* Subtle Floating Shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/3 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-primary/2 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="container px-4 py-20 lg:py-32 text-center relative z-10">
        <p className="mb-4 font-semibold text-primary tracking-widest uppercase">
          Where Legal Intelligence Meets Practice Excellence
        </p>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-6">
          The AI-Powered Legal Platform That Transforms Your Practice
        </h1>
        <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
          Combine advanced AI capabilities with comprehensive practice management in one unified platform.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <Link to="/signup">
            <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-3 transform transition-all duration-200 hover:scale-105 hover:shadow-lg">
              Start Free Trial
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-primary/20 hover:border-primary/40">
            Watch Demo
          </Button>
        </div>
        
        {/* AI Demonstration Video */}
        <div className="max-w-4xl mx-auto">
          <div className="aspect-video rounded-xl overflow-hidden shadow-lg border border-gray-200/50">
            <video 
              className="w-full h-full object-cover"
              autoPlay 
              muted 
              loop 
              playsInline
            >
              <source 
                src="/11904058_1280_720_30fps.mp4" 
                type="video/mp4" 
              />
              Your browser does not support the video tag.
            </video>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Experience the power of AI-driven legal intelligence in action
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
