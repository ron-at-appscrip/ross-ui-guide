import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Search, FileText, BarChart3, Loader2, Hash, FileCheck } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

type SearchType = 'serial' | 'registration';

const USPTOHero = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchNumber, setSearchNumber] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("serial");
  const [isSearching, setIsSearching] = useState(false);

  const handleQuickSearch = async () => {
    if (!searchNumber.trim()) {
      toast({
        title: `${searchType === 'serial' ? 'Serial' : 'Registration'} number required`,
        description: `Please enter a trademark ${searchType} number to search.`,
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    
    try {
      // Clean the search number
      const cleanNumber = searchNumber.replace(/[^\d]/g, '');
      
      if (!cleanNumber) {
        throw new Error("Please enter a valid number");
      }
      
      // Navigate to the trademark detail page with search type
      navigate(`/trademark/${searchType}/${cleanNumber}`);
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Unable to search for trademark. Please try again.",
        variant: "destructive"
      });
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleQuickSearch();
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden">
      {/* Clean Gradient Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08) 0%, hsl(var(--background)) 60%)'
        }}></div>
        
        {/* Subtle Floating Shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/3 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-primary/2 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="container px-4 py-20 lg:py-32 text-center relative z-10">
        {/* USPTO Badge */}
        <div className="flex items-center justify-center mb-6">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/10 px-4 py-2">
            <Shield className="h-4 w-4 mr-2" />
            Official USPTO Integration
          </Badge>
        </div>

        <p className="mb-4 font-semibold text-primary tracking-widest uppercase">
          Comprehensive IP Portfolio Management
        </p>
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-6">
          AI-Powered Patent &<br />
          <span className="text-primary">Trademark Services</span>
        </h1>
        
        <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
          Streamline your intellectual property workflow with intelligent USPTO integration, 
          real-time monitoring, and AI-driven analysis tools.
        </p>

        {/* Quick Search Section */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-background/80 backdrop-blur-sm rounded-lg border border-primary/20 p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Quick Trademark Search</h3>
            
            {/* Search Type Toggle - Using Tabs for better UX */}
            <Tabs value={searchType} onValueChange={(value) => setSearchType(value as SearchType)} className="mb-4">
              <TabsList className="grid w-full grid-cols-2 h-10">
                <TabsTrigger value="serial" className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Serial Number
                </TabsTrigger>
                <TabsTrigger value="registration" className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Registration Number
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder={searchType === 'serial' 
                      ? "Enter serial number (e.g., 87862032)" 
                      : "Enter registration number (e.g., 5776989)"
                    }
                    value={searchNumber}
                    onChange={(e) => setSearchNumber(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 border-primary/30 focus:border-primary"
                    disabled={isSearching}
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {searchType === 'serial' ? <Hash className="h-4 w-4" /> : <FileCheck className="h-4 w-4" />}
                  </div>
                </div>
                <Button
                  onClick={handleQuickSearch}
                  disabled={isSearching || !searchNumber.trim()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {searchType === 'serial' 
                    ? "Use the 8-digit serial number assigned when filing" 
                    : "Use the 7-digit registration number for registered marks"
                  }
                </span>
                <button
                  onClick={() => setSearchType(searchType === 'serial' ? 'registration' : 'serial')}
                  className="text-primary hover:underline"
                >
                  Switch to {searchType === 'serial' ? 'Registration' : 'Serial'} →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Key Stats */}
        <div className="flex flex-wrap justify-center gap-6 mb-10">
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-primary" />
            <span className="font-semibold">95% Search Accuracy</span>
          </div>
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="font-semibold">60% Faster Filing</span>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span className="font-semibold">Real-time Monitoring</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <Link to="/dashboard/uspto">
            <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-3 transform transition-all duration-200 hover:scale-105 hover:shadow-lg">
              Start IP Search
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-primary/20 hover:border-primary/40">
            Schedule Demo
          </Button>
        </div>
        
        {/* USPTO Services Demo */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-gray-200/50 p-6">
            <div className="grid md:grid-cols-3 gap-4 text-left">
              <div className="bg-primary/10 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Search className="h-5 w-5 text-primary mr-2" />
                  <span className="font-semibold text-primary">Patent Search</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  AI-powered prior art search across 100M+ patents
                </p>
              </div>
              
              <div className="bg-primary/10 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Shield className="h-5 w-5 text-primary mr-2" />
                  <span className="font-semibold text-primary">Trademark Watch</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Real-time monitoring for trademark conflicts
                </p>
              </div>
              
              <div className="bg-primary/10 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <FileText className="h-5 w-5 text-primary mr-2" />
                  <span className="font-semibold text-primary">Smart Filing</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Automated form completion and submission
                </p>
              </div>
            </div>
          </div>
          
          <p className="text-center text-sm text-muted-foreground mt-4">
            Trusted by 500+ law firms and IP professionals worldwide
          </p>
        </div>
      </div>
    </section>
  );
};

export default USPTOHero;