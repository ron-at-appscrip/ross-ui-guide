import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Shield, Search, Loader2, Hash } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { euipoService } from "@/services/euipoService";

const EUIPOHero = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [applicationNumber, setApplicationNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleQuickSearch = async () => {
    if (!applicationNumber.trim()) {
      toast({
        title: "Application number required",
        description: "Please enter a EUIPO trademark application number to search.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    
    try {
      // Clean the application number (remove spaces and special characters except leading zeros)
      const cleanNumber = applicationNumber.trim().replace(/\s+/g, '');
      
      if (!cleanNumber) {
        throw new Error("Please enter a valid application number");
      }

      // Try to fetch the trademark directly
      const trademark = await euipoService.getTrademarkByApplicationNumber(cleanNumber);
      
      if (trademark) {
        // Navigate to a detail page (we'll create this later)
        navigate(`/euipo/trademark/${cleanNumber}`, { state: { trademark } });
      } else {
        toast({
          title: "Trademark not found",
          description: `No trademark found with application number: ${cleanNumber}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "Unable to search for trademark. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleQuickSearch();
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-background to-background overflow-hidden">
      {/* EU-themed Gradient Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, rgba(0, 51, 153, 0.08) 0%, hsl(var(--background)) 60%)'
        }}></div>
        
        {/* EU Stars Pattern (subtle) */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-yellow-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="container px-4 py-20 lg:py-32 text-center relative z-10">
        {/* EUIPO Badge */}
        <div className="flex items-center justify-center mb-6">
          <Badge className="bg-blue-600/10 text-blue-700 hover:bg-blue-600/10 px-4 py-2">
            <Shield className="h-4 w-4 mr-2" />
            Official EUIPO Integration
          </Badge>
        </div>

        <p className="mb-4 font-semibold text-blue-700 tracking-widest uppercase">
          European Union Intellectual Property Office
        </p>
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-6">
          EU Trademark &<br />
          <span className="text-blue-700">Design Services</span>
        </h1>
        
        <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
          Access comprehensive European Union trademark data with intelligent EUIPO integration, 
          real-time monitoring, and AI-powered analysis for all 27 EU member states.
        </p>

        {/* Quick Search Section */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-background/80 backdrop-blur-sm rounded-lg border border-blue-600/20 p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Quick EUIPO Trademark Search</h3>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Hash className="h-4 w-4" />
                </div>
                <Input
                  type="text"
                  placeholder="Enter EUIPO application number (e.g., 000274084)"
                  value={applicationNumber}
                  onChange={(e) => setApplicationNumber(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 h-12 text-base"
                  disabled={isSearching}
                />
              </div>
              <Button
                onClick={handleQuickSearch}
                disabled={isSearching}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
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
            
            <p className="text-sm text-muted-foreground mt-3">
              Search over 2.3 million EU trademarks across all member states
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="h-6 w-6 text-blue-700" />
            </div>
            <h3 className="font-semibold mb-1">27 Member States</h3>
            <p className="text-sm text-muted-foreground">
              Single registration valid across all EU countries
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="h-6 w-6 text-blue-700" />
            </div>
            <h3 className="font-semibold mb-1">Real-time Data</h3>
            <p className="text-sm text-muted-foreground">
              Direct integration with EUIPO databases
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Hash className="h-6 w-6 text-blue-700" />
            </div>
            <h3 className="font-semibold mb-1">Multi-language</h3>
            <p className="text-sm text-muted-foreground">
              Support for all 24 official EU languages
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EUIPOHero;