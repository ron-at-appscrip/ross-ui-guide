import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Zap, Shield, Globe } from "lucide-react";

const IntegrationShowcase = () => {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-purple-100 text-purple-800 hover:bg-purple-100">
            <Zap className="h-4 w-4 mr-2" />
            Live Integrations
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Direct USPTO Integration
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Seamlessly connect to official USPTO databases and systems for real-time data and filing.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardHeader>
              <Database className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Live USPTO Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Real-time access to patent and trademark databases
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Zap className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-lg">TSDR Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Direct integration with Trademark Status Document Retrieval
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Secure Filing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Encrypted direct filing to USPTO systems
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Globe className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Global Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                International IP database integration
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default IntegrationShowcase;