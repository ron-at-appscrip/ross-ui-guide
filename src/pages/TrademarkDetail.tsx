import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Shield, 
  Calendar, 
  Building, 
  User, 
  FileText,
  MapPin,
  Mail,
  Phone,
  Globe,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ArrowLeft,
  Loader2,
  Scale,
  Tag,
  History,
  Briefcase
} from "lucide-react";
import { USPTOService } from "@/services/usptoService";
import { TrademarkResult } from "@/types/uspto";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const TrademarkDetail = () => {
  const { searchType, number, serialNumber } = useParams<{ 
    searchType?: 'serial' | 'registration';
    number?: string;
    serialNumber?: string; // For backward compatibility
  }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trademark, setTrademark] = useState<TrademarkResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine actual search type and number (backward compatibility)
  const actualSearchType = searchType || 'serial';
  const actualNumber = number || serialNumber;

  useEffect(() => {
    if (actualNumber) {
      fetchTrademarkData();
    }
  }, [actualNumber, actualSearchType]);

  const fetchTrademarkData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching trademark data for ${actualSearchType}: ${actualNumber}`);
      
      // Try to get XML data first
      const xmlResponse = await USPTOService.getTrademarkXML(actualNumber!, actualSearchType);
      
      if (xmlResponse.success && xmlResponse.content) {
        const parsedTrademark = USPTOService.parseTrademarkXML(xmlResponse.content, actualNumber!);
        if (parsedTrademark) {
          setTrademark(parsedTrademark);
        } else {
          throw new Error("Failed to parse trademark data");
        }
      } else {
        throw new Error(xmlResponse.error || "Failed to fetch trademark data");
      }
    } catch (err: any) {
      console.error("Error fetching trademark:", err);
      setError(err.message || "Unable to load trademark information");
      toast({
        title: "Error loading trademark",
        description: err.message || "Unable to load trademark information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('live') || statusLower.includes('registered')) {
      return 'default';
    } else if (statusLower.includes('pending')) {
      return 'secondary';
    } else if (statusLower.includes('dead') || statusLower.includes('cancelled')) {
      return 'destructive';
    }
    return 'outline';
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('live') || statusLower.includes('registered')) {
      return <CheckCircle className="h-4 w-4" />;
    } else if (statusLower.includes('pending')) {
      return <Clock className="h-4 w-4" />;
    } else if (statusLower.includes('dead') || statusLower.includes('cancelled')) {
      return <XCircle className="h-4 w-4" />;
    }
    return <AlertCircle className="h-4 w-4" />;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const handleRenewal = () => {
    navigate(`/trademark/${actualNumber}/renewal`, {
      state: { trademark }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading trademark information...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !trademark) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error || "Trademark not found"}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => navigate('/uspto-services')} 
            className="mt-4"
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to USPTO Services
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          onClick={() => navigate('/uspto-services')} 
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to USPTO Services
        </Button>

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">{trademark.mark}</h1>
              <div className="flex items-center gap-4 mb-4">
                <Badge variant={getStatusBadgeVariant(trademark.status)} className="flex items-center gap-1">
                  {getStatusIcon(trademark.status)}
                  {trademark.status}
                </Badge>
                {actualSearchType === 'serial' ? (
                  <span className="text-muted-foreground">Serial #{actualNumber}</span>
                ) : (
                  <span className="text-muted-foreground">Registration #{actualNumber}</span>
                )}
                {trademark.serialNumber && actualSearchType === 'registration' && (
                  <span className="text-muted-foreground">Serial #{trademark.serialNumber}</span>
                )}
                {trademark.registrationNumber && actualSearchType === 'serial' && (
                  <span className="text-muted-foreground">Reg #{trademark.registrationNumber}</span>
                )}
              </div>
            </div>
            <Button 
              size="lg" 
              onClick={handleRenewal}
              className="bg-primary hover:bg-primary/90"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Renew Trademark
            </Button>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="owner">Owner & Attorney</TabsTrigger>
            <TabsTrigger value="classification">Classification</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Trademark Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Mark</p>
                    <p className="font-semibold">{trademark.mark}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Owner</p>
                    <p className="font-semibold">{trademark.owner}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Filing Date</p>
                    <p className="font-semibold">{formatDate(trademark.filingDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Registration Date</p>
                    <p className="font-semibold">{formatDate(trademark.registrationDate)}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Description</p>
                  <p className="text-sm leading-relaxed">{trademark.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Important Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Important Dates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Filed</p>
                      <p className="font-semibold">{formatDate(trademark.filingDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Registered</p>
                      <p className="font-semibold">{formatDate(trademark.registrationDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <RefreshCw className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Next Renewal</p>
                      <p className="font-semibold">
                        {trademark.registrationDate ? 
                          formatDate(new Date(new Date(trademark.registrationDate).getTime() + (6 * 365 * 24 * 60 * 60 * 1000)).toISOString()) :
                          'N/A'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Owner & Attorney Tab */}
          <TabsContent value="owner" className="space-y-6">
            {/* Owner Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Owner Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
{(() => {
                  // Support both legacy (ownerInformation) and enhanced (owner) structures
                  const owner = trademark.ownerInformation || (trademark as any).owner;
                  const ownerName = owner?.name || trademark.owner;
                  
                  return (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-semibold">{ownerName}</p>
                      </div>
                      {owner?.dbaAkaText && (
                        <div>
                          <p className="text-sm text-muted-foreground">DBA/AKA</p>
                          <p className="font-semibold">{owner.dbaAkaText}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">Entity Type</p>
                        <p className="font-semibold">{owner?.entityType || 'Not specified'}</p>
                      </div>
                      {(owner?.incorporationState || owner?.incorporationCountry) && (
                        <div>
                          <p className="text-sm text-muted-foreground">Incorporation</p>
                          <p className="font-semibold">
                            {owner.incorporationState || 'N/A'}, {owner.incorporationCountry || 'N/A'}
                          </p>
                        </div>
                      )}
                      {owner?.address && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Address</p>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div className="text-sm">
                              {owner.address.lines ? (
                                // Enhanced parser structure
                                <>
                                  {owner.address.lines.map((line: string, i: number) => (
                                    <p key={i}>{line}</p>
                                  ))}
                                  <p>
                                    {owner.address.city && `${owner.address.city}, `}
                                    {owner.address.state && `${owner.address.state} `}
                                    {owner.address.postalCode}
                                  </p>
                                  {owner.address.country && <p>{owner.address.country}</p>}
                                </>
                              ) : (
                                // Legacy parser structure
                                <>
                                  {owner.address.street && <p>{owner.address.street}</p>}
                                  <p>
                                    {owner.address.city && `${owner.address.city}, `}
                                    {owner.address.state && `${owner.address.state} `}
                                    {owner.address.postalCode}
                                  </p>
                                  {owner.address.country && <p>{owner.address.country}</p>}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Attorney Information - Support both legacy and enhanced parser structures */}
            {(trademark.attorneyInformation || (trademark as any).correspondent || (trademark as any).attorney) ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Attorney/Correspondence Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Handle both attorneyInformation (legacy) and correspondent (enhanced) structures */}
                  {(() => {
                    const attorney = trademark.attorneyInformation || 
                                   (trademark as any).correspondent || 
                                   (trademark as any).attorney;
                    
                    // Extract attorney information from the actual structure
                    const attorneyName = attorney?.name;
                    const attorneyFirm = attorney?.firm || attorney?.organization;
                    const attorneyEmail = attorney?.email || attorney?.mainEmail;
                    const attorneyPhone = attorney?.phone;
                    const docketNumber = attorney?.docketNumber;
                    
                    // Handle address structure - check if it's nested or flat
                    const attorneyAddress = attorney?.address?.lines ? attorney.address : (
                      attorney?.address || attorney?.city ? {
                        street: attorney.address || attorney.address2,
                        street2: attorney.address2,
                        city: attorney.city,
                        state: attorney.state,
                        zipCode: attorney.zipCode,
                        country: attorney.country
                      } : null
                    );
                    
                    return (
                      <>
                        {attorneyName && (
                          <div>
                            <p className="text-sm text-muted-foreground">Name</p>
                            <p className="font-semibold">{attorneyName}</p>
                          </div>
                        )}
                        {attorneyFirm && (
                          <div>
                            <p className="text-sm text-muted-foreground">Firm/Organization</p>
                            <p className="font-semibold">{attorneyFirm}</p>
                          </div>
                        )}
                        {docketNumber && (
                          <div>
                            <p className="text-sm text-muted-foreground">Docket Number</p>
                            <p className="font-semibold">{docketNumber}</p>
                          </div>
                        )}
                        {attorneyEmail && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Email</p>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <a href={`mailto:${attorneyEmail}`} className="text-sm text-primary hover:underline">
                                {attorneyEmail}
                              </a>
                            </div>
                          </div>
                        )}
                        {attorneyPhone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Phone</p>
                              <p className="font-semibold">{attorneyPhone}</p>
                            </div>
                          </div>
                        )}
                        {attorneyAddress && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Address</p>
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div className="text-sm">
                                {attorneyAddress.lines ? (
                                  // Enhanced parser structure with lines array
                                  <>
                                    {attorneyAddress.lines.map((line: string, i: number) => (
                                      <p key={i}>{line}</p>
                                    ))}
                                    <p>
                                      {attorneyAddress.city && `${attorneyAddress.city}, `}
                                      {attorneyAddress.state && `${attorneyAddress.state} `}
                                      {attorneyAddress.postalCode}
                                    </p>
                                    {attorneyAddress.country && <p>{attorneyAddress.country}</p>}
                                  </>
                                ) : (
                                  // Flat structure from attorney object
                                  <>
                                    {attorneyAddress.street && <p>{attorneyAddress.street}</p>}
                                    {attorneyAddress.street2 && <p>{attorneyAddress.street2}</p>}
                                    <p>
                                      {attorneyAddress.city && `${attorneyAddress.city}, `}
                                      {attorneyAddress.state && `${attorneyAddress.state} `}
                                      {attorneyAddress.zipCode}
                                    </p>
                                    {attorneyAddress.country && attorneyAddress.country !== 'US' && <p>{attorneyAddress.country}</p>}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Attorney/Correspondence Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">No attorney information available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Classification Tab */}
          <TabsContent value="classification" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  International Classification
                </CardTitle>
                <CardDescription>
                  Nice Classification for goods and services
                </CardDescription>
              </CardHeader>
              <CardContent>
                {trademark.internationalClasses && trademark.internationalClasses.length > 0 ? (
                  <div className="space-y-4">
                    {trademark.internationalClasses.map((classInfo, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">Class {classInfo.classNumber}</Badge>
                          <span className="text-sm font-semibold">{classInfo.title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{classInfo.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No classification information available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Goods and Services</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{trademark.description}</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Prosecution History
                </CardTitle>
                <CardDescription>
                  Timeline of trademark application events
                </CardDescription>
              </CardHeader>
              <CardContent>
                {trademark.prosecutionHistory && trademark.prosecutionHistory.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
                    {trademark.prosecutionHistory.map((event, index) => (
                      <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-b-0">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{event.description}</p>
                            {event.code && (
                              <Badge variant="outline" className="text-xs">
                                {event.code}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(event.date)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No prosecution history available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          <Button 
            size="lg" 
            onClick={handleRenewal}
            className="bg-primary hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Start Renewal Process
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => window.print()}
          >
            <FileText className="h-4 w-4 mr-2" />
            Print Details
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TrademarkDetail;