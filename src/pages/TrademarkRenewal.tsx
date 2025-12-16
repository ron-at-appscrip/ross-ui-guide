import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  ArrowRight,
  Search,
  Clock,
  DollarSign,
  FileText,
  Upload,
  Shield,
  User,
  Building,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
  Loader2,
  CreditCard,
  Download,
  RefreshCw,
  Scale,
  XCircle
} from "lucide-react";
import { USPTOService } from "@/services/usptoService";
import { TrademarkResult } from "@/types/uspto";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import PricingSidebar from "@/components/renewal/PricingSidebar";
import StripeCheckout from "@/components/renewal/StripeCheckout";

interface RenewalFormData {
  processingSpeed: 'standard' | 'rush';
  section8Use: boolean;
  originalGoodsServices: string;
  editedGoodsServices: string;
  removedGoodsServices: string;
  approveModifiedDescription: boolean;
  specimenUpload: File | null;
  specimenFromWeb: 'yes' | 'no' | '';
  section15: boolean;
  section15Continuous: 'yes' | 'no' | '';
  section15Challenged: 'yes' | 'no' | '';
  ownerChanged: boolean;
  addressChanged: boolean;
  hasAssignmentAgreement: boolean;
  newOwnerCountry: string;
  newOwnerEntityType: string;
  newOwnerInfo: {
    name: string;
    address: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  signatory: {
    name: string;
    title: string;
    email: string;
    phone: string;
    hasAuthority: boolean;
  };
  agreementAccepted: boolean;
  termsAccepted: boolean;
  signature: string;
  paymentMethod: 'credit' | 'google' | 'apple';
}

// Helper function to determine next step based on form data
const getNextStep = (currentStepNum: number, formData: RenewalFormData) => {
  if (currentStepNum === 3 && formData.section8Use) {
    // If trademark IS in use, skip the removal step and go to step 5 (specimen upload)
    return 5;
  }
  if (currentStepNum === 3 && !formData.section8Use) {
    // If trademark is NOT in use, go to step 4 (removal step)
    return 4;
  }
  if (currentStepNum === 4) {
    // From removal step, go to step 5 (specimen upload)
    return 5;
  }
  return currentStepNum + 1;
};

const RENEWAL_STEPS = [
  { id: 1, title: "Search", description: "Find your trademark" },
  { id: 2, title: "Processing Speed", description: "Select renewal speed" },
  { id: 3, title: "Section 8", description: "Declaration of use" },
  { id: 4, title: "Remove Services", description: "Remove unused goods/services" },
  { id: 5, title: "Specimen", description: "Upload proof of use" },
  { id: 6, title: "Section 15", description: "Incontestability (optional)" },
  { id: 7, title: "Owner Info", description: "Confirm ownership" },
  { id: 8, title: "Signatory", description: "Authorized representative" },
  { id: 9, title: "Review", description: "Review information" },
  { id: 10, title: "Agreement", description: "Legal terms" },
  { id: 11, title: "Payment", description: "Submit payment" },
  { id: 12, title: "Confirmation", description: "Receipt and next steps" }
];

// Common entity types globally acknowledged
const ENTITY_TYPES = [
  "Corporation",
  "Limited Liability Company (LLC)",
  "Partnership",
  "Limited Partnership (LP)",
  "Limited Liability Partnership (LLP)",
  "Sole Proprietorship",
  "Joint Venture",
  "Trust",
  "Estate",
  "Cooperative",
  "Non-Profit Organization",
  "Association",
  "Public Limited Company (PLC)",
  "Private Limited Company (Ltd)",
  "Gesellschaft mit beschränkter Haftung (GmbH)",
  "Société Anonyme (SA)",
  "Société à Responsabilité Limitée (SARL)",
  "Besloten Vennootschap (BV)",
  "Naamloze Vennootschap (NV)",
  "Sociedad Anónima (S.A.)",
  "Sociedad de Responsabilidad Limitada (S.R.L.)",
  "Kabushiki Kaisha (KK)",
  "Yugen Kaisha (YK)",
  "Individual",
  "Government Entity",
  "Other"
];

// Comprehensive list of countries
const COUNTRIES = [
  "United States",
  "Canada",
  "Mexico",
  "United Kingdom",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Netherlands",
  "Belgium",
  "Switzerland",
  "Austria",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Poland",
  "Czech Republic",
  "Ireland",
  "Portugal",
  "Greece",
  "Russia",
  "Ukraine",
  "Turkey",
  "Israel",
  "United Arab Emirates",
  "Saudi Arabia",
  "India",
  "China",
  "Japan",
  "South Korea",
  "Taiwan",
  "Hong Kong",
  "Singapore",
  "Malaysia",
  "Thailand",
  "Indonesia",
  "Philippines",
  "Vietnam",
  "Australia",
  "New Zealand",
  "Brazil",
  "Argentina",
  "Chile",
  "Colombia",
  "Peru",
  "Venezuela",
  "South Africa",
  "Egypt",
  "Nigeria",
  "Kenya",
  "Morocco",
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Armenia",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cambodia",
  "Cameroon",
  "Cape Verde",
  "Central African Republic",
  "Chad",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Ethiopia",
  "Fiji",
  "Gabon",
  "Gambia",
  "Georgia",
  "Ghana",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "Iraq",
  "Ivory Coast",
  "Jamaica",
  "Jordan",
  "Kazakhstan",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Macedonia",
  "Madagascar",
  "Malawi",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Nicaragua",
  "Niger",
  "North Korea",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Qatar",
  "Romania",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Swaziland",
  "Syria",
  "Tajikistan",
  "Tanzania",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Yemen",
  "Zambia",
  "Zimbabwe"
];

const TrademarkRenewal = () => {
  const { serialNumber } = useParams<{ serialNumber: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [trademark, setTrademark] = useState<TrademarkResult | null>(location.state?.trademark || null);
  const [loading, setLoading] = useState(false);
  const [searchSerial, setSearchSerial] = useState(serialNumber || '');
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const termsScrollRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState<RenewalFormData>({
    processingSpeed: 'standard',
    section8Use: false,
    originalGoodsServices: '',
    editedGoodsServices: '',
    removedGoodsServices: '',
    approveModifiedDescription: false,
    specimenUpload: null,
    specimenFromWeb: 'no',
    section15: false,
    section15Continuous: '',
    section15Challenged: '',
    ownerChanged: false,
    addressChanged: false,
    hasAssignmentAgreement: false,
    newOwnerCountry: 'United States',
    newOwnerEntityType: '',
    newOwnerInfo: {
      name: '',
      address: '',
      address2: '',
      city: '',
      state: '',
      zip: '',
      country: 'United States'
    },
    signatory: {
      name: '',
      title: '',
      email: '',
      phone: '',
      hasAuthority: false
    },
    agreementAccepted: false,
    termsAccepted: false,
    signature: '',
    paymentMethod: 'credit'
  });

  useEffect(() => {
    // If we have a serial number but no trademark data, fetch it
    if (serialNumber && !trademark) {
      fetchTrademarkData();
    } else if (trademark) {
      // Skip search step and initialize goods/services if we already have trademark data
      const goodsServicesDesc = trademark.description || 
        (trademark.internationalClasses && trademark.internationalClasses.length > 0 
          ? trademark.internationalClasses[0].description || ''
          : '');
      setFormData(prev => ({
        ...prev,
        originalGoodsServices: goodsServicesDesc,
        editedGoodsServices: goodsServicesDesc,
        removedGoodsServices: goodsServicesDesc
      }));
      setCurrentStep(2);
    }
  }, [serialNumber, trademark]);

  const fetchTrademarkData = async () => {
    setLoading(true);
    try {
      const xmlResponse = await USPTOService.getTrademarkXML(searchSerial);
      if (xmlResponse.success && xmlResponse.content) {
        const parsedTrademark = USPTOService.parseTrademarkXML(xmlResponse.content, searchSerial);
        if (parsedTrademark) {
          setTrademark(parsedTrademark);
          // Initialize goods/services description from trademark data
          const goodsServicesDesc = parsedTrademark.description || 
            (parsedTrademark.internationalClasses && parsedTrademark.internationalClasses.length > 0 
              ? parsedTrademark.internationalClasses[0].description || ''
              : '');
          setFormData(prev => ({
            ...prev,
            originalGoodsServices: goodsServicesDesc,
            editedGoodsServices: goodsServicesDesc,
            removedGoodsServices: goodsServicesDesc
          }));
          setCurrentStep(2);
        } else {
          throw new Error("Failed to parse trademark data");
        }
      } else {
        throw new Error(xmlResponse.error || "Failed to fetch trademark data");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Unable to load trademark",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateFees = () => {
    const isRush = formData.processingSpeed === 'rush';
    const jmrFee = 200;
    const rushFee = isRush ? 500 : 0;
    const usptoSection8 = 225;
    const usptoGracePeriod = 100;
    const usptoSection15 = formData.section15 ? 200 : 0;
    
    const standardTotal = jmrFee + usptoSection8 + usptoGracePeriod + usptoSection15;
    const rushTotal = standardTotal + rushFee;
    
    return {
      jmrFee,
      rushFee,
      usptoSection8,
      usptoGracePeriod,
      usptoSection15,
      standardTotal,
      rushTotal,
      currentTotal: isRush ? rushTotal : standardTotal
    };
  };

  const handleNext = () => {
    // Reset scroll state when leaving step 10
    if (currentStep === 10) {
      setHasScrolledToEnd(false);
    }
    
    // Validation logic for each step
    switch (currentStep) {
      case 1:
        if (!trademark) {
          toast({
            title: "Search required",
            description: "Please search for a trademark first",
            variant: "destructive"
          });
          return;
        }
        break;
      case 3:
        if (!formData.editedGoodsServices.trim()) {
          toast({
            title: "Description required",
            description: "Please provide a description of goods and services",
            variant: "destructive"
          });
          return;
        }
        break;
      case 4:
        if (!formData.approveModifiedDescription) {
          toast({
            title: "Approval required",
            description: "Please approve the modified trademark description",
            variant: "destructive"
          });
          return;
        }
        break;
      case 8:
        if (!formData.signatory.name || !formData.signatory.email || !formData.signatory.hasAuthority) {
          toast({
            title: "Information required",
            description: "Please complete all signatory fields",
            variant: "destructive"
          });
          return;
        }
        break;
    }
    
    if (currentStep < RENEWAL_STEPS.length) {
      const nextStep = getNextStep(currentStep, formData);
      setCurrentStep(nextStep);
    }
  };

  const handleBack = () => {
    // Reset scroll state when going back to step 10
    if (currentStep === 11) {
      setHasScrolledToEnd(false);
    }
    
    // If we're on step 1 (search results) and have trademark data and serialNumber,
    // navigate back to the trademark details page
    if (currentStep === 1 && trademark && serialNumber) {
      navigate(`/trademark/${serialNumber}`);
    } else if (currentStep > 1) {
      // Handle conditional step logic for going back
      if (currentStep === 5 && !formData.section8Use) {
        // If coming from specimen upload and we have removal step, go to step 4
        setCurrentStep(4);
      } else if (currentStep === 5 && formData.section8Use) {
        // If coming from specimen upload and no removal step, go to step 3
        setCurrentStep(3);
      } else {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Simulate submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Success!",
        description: "Your trademark renewal has been submitted",
      });
      
      setCurrentStep(12);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit renewal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Ready to Renew Your U.S. Trademark?</CardTitle>
              <CardDescription>
                Search by trademark serial or registration number
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input
                  placeholder="Enter serial or registration number"
                  value={searchSerial}
                  onChange={(e) => setSearchSerial(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && fetchTrademarkData()}
                />
                <Button onClick={fetchTrademarkData} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Search
                </Button>
              </div>
              
              {trademark && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>1 trademark found</strong><br />
                    USPTO Serial #: {trademark.serialNumber}<br />
                    Reg #: {trademark.registrationNumber}<br />
                    Mark Name: {trademark.mark}<br />
                    Owner: {trademark.owner}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>How Quickly Do You Need Your Trademark Renewed?</CardTitle>
              <CardDescription>
                Please choose how quickly you'd like your renewal processed. Standard renewals are completed within ~2 weeks, 
                rush filings typically in 2 business days for an extra fee.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup
                value={formData.processingSpeed}
                onValueChange={(value) => setFormData({...formData, processingSpeed: value as 'standard' | 'rush'})}
              >
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent">
                  <RadioGroupItem value="standard" id="standard" />
                  <Label htmlFor="standard" className="cursor-pointer flex-1">
                    <div className="font-semibold">Standard Processing</div>
                    <div className="text-sm text-muted-foreground">About 2 weeks</div>
                    <div className="text-sm">Complete processing timeline and detailed fee breakdown shown on the right</div>
                  </Label>
                </div>
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent">
                  <RadioGroupItem value="rush" id="rush" />
                  <Label htmlFor="rush" className="cursor-pointer flex-1">
                    <div className="font-semibold">Rush Processing</div>
                    <div className="text-sm text-muted-foreground">About 2 days</div>
                    <div className="text-sm">Priority processing with expedited fee - see pricing breakdown on the right</div>
                  </Label>
                </div>
              </RadioGroup>

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-medium">Processing Timeline</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formData.processingSpeed === 'rush' 
                    ? 'Rush processing typically completes within 2 business days of submission.' 
                    : 'Standard processing typically completes within 2 weeks of submission.'}
                </p>
                {formData.processingSpeed === 'rush' && (
                  <p className="text-sm text-amber-600 mt-2">
                    <strong>Note:</strong> Rush processing includes an additional $500 fee for expedited handling.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Section 8 Declaration of Use</CardTitle>
              <CardDescription>
                We need to file a Declaration of Use or Excusable Non-Use under Section 8 to maintain your registration.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Class Information */}
              {trademark?.internationalClasses && trademark.internationalClasses.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-base font-semibold">International Class Information</Label>
                  <div className="flex flex-wrap gap-2">
                    {trademark.internationalClasses.map((classInfo, index) => (
                      <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                        Class {classInfo.classNumber}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Goods and Services Description */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Description of Goods and Services</Label>
                <div className="space-y-2">
                  <Textarea
                    placeholder="Enter the description of goods and services for this trademark..."
                    value={formData.editedGoodsServices}
                    onChange={(e) => setFormData({...formData, editedGoodsServices: e.target.value})}
                    className="min-h-32 resize-y"
                  />
                  {formData.originalGoodsServices && 
                   formData.editedGoodsServices !== formData.originalGoodsServices && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Changes detected:</strong> You have modified the original description. 
                        Make sure the changes accurately reflect your current use of the trademark.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              {/* Toggle for in-use question */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-semibold">
                      Is the trademark currently in use on all goods/services listed?
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle to indicate whether your trademark is currently in use for all listed goods and services.
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Label htmlFor="section8-use-toggle" className="text-sm text-muted-foreground">
                      No
                    </Label>
                    <Switch
                      id="section8-use-toggle"
                      checked={formData.section8Use}
                      onCheckedChange={(checked) => setFormData({...formData, section8Use: checked})}
                    />
                    <Label htmlFor="section8-use-toggle" className="text-sm font-medium">
                      Yes
                    </Label>
                  </div>
                </div>
              </div>
              
              {!formData.section8Use && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    If the trademark is not in use, you may need to provide an explanation for excusable non-use 
                    or consider abandoning certain classes of goods/services.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Remove Goods and/or Services Not Currently In Use</CardTitle>
              <CardDescription>
                Please remove the goods and/or services that are no longer being offered/sold:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Class Information */}
              {trademark?.internationalClasses && trademark.internationalClasses.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">Class {trademark.internationalClasses[0].classNumber}</Label>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setFormData({...formData, removedGoodsServices: formData.originalGoodsServices})}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Reset
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => setFormData({...formData, removedGoodsServices: ''})}
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Remove All
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Editable Description */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <Textarea
                    placeholder="Edit the description by removing goods/services no longer in use..."
                    value={formData.removedGoodsServices}
                    onChange={(e) => setFormData({...formData, removedGoodsServices: e.target.value})}
                    className="min-h-32 resize-y"
                  />
                </div>
              </div>

              {/* Approval Toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-semibold">
                      I approve the trademark identification listed (as edited if appropriate); it describes my current use.
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Label htmlFor="approve-modified-toggle" className="text-sm text-muted-foreground">
                      No
                    </Label>
                    <Switch
                      id="approve-modified-toggle"
                      checked={formData.approveModifiedDescription}
                      onCheckedChange={(checked) => setFormData({...formData, approveModifiedDescription: checked})}
                    />
                    <Label htmlFor="approve-modified-toggle" className="text-sm font-medium">
                      Yes
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Demonstrate Trademark Use (Specimen Upload)</CardTitle>
              <CardDescription>
                Are you using this trademark in sales or for online services? 
                Acceptable specimens include tags, product labels, ads, screenshots, etc.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="text-base font-semibold">Do you want us to attempt to find specimens from web/social?</Label>
                <RadioGroup
                  value={formData.specimenFromWeb}
                  onValueChange={(value) => setFormData({...formData, specimenFromWeb: value as 'yes' | 'no'})}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="specimen-yes" />
                    <Label htmlFor="specimen-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="specimen-no" />
                    <Label htmlFor="specimen-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Show content when "No" is selected */}
              {formData.specimenFromWeb === 'no' && (
                <>
                  {/* Specimen Information */}
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm leading-relaxed">
                        <strong>A specimen is an example of how the trademark is used.</strong>
                      </p>
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">Examples of acceptable specimens include:</p>
                        <ul className="text-sm space-y-1 ml-4">
                          <li>• tags/labels affixed to goods</li>
                          <li>• advertisements for services</li>
                        </ul>
                      </div>
                      <p className="text-sm mt-3">
                        Please upload a photo (specimen) that demonstrates how your trademark is being used on or in association with the goods and/or in marketing material for your services:
                      </p>
                    </div>
                  </div>

                  {/* Class Information */}
                  {trademark?.internationalClasses && trademark.internationalClasses.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-lg font-semibold">
                        Class {trademark.internationalClasses[0].classNumber}
                      </Label>
                    </div>
                  )}

                  {/* Goods and Services Description (Read-only) */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Goods and Services Description</Label>
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm leading-relaxed">
                        {formData.removedGoodsServices || formData.editedGoodsServices || formData.originalGoodsServices || 'No description available'}
                      </p>
                    </div>
                  </div>

                  {/* Upload Specimen */}
                  <div className="space-y-3">
                    <Label>Upload Specimen Image</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <Button variant="outline">
                        Upload Photo(s)
                      </Button>
                      <p className="text-sm text-muted-foreground mt-2">
                        PNG, JPG up to 10MB
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Show content when "Yes" is selected */}
              {formData.specimenFromWeb === 'yes' && (
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm leading-relaxed">
                      We will locate trademark specimens from your website or social media
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <Label>Website or Social Media URL</Label>
                    <Input
                      placeholder="Enter URL of Website, or social media handle"
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 6:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Would you also like to file a Section 15 Declaration of Incontestability?
                <div className="bg-orange-100 text-orange-800 rounded-full p-1">
                  <span className="text-xs">?</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Button-style Selection */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, section15: true})}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    formData.section15 
                      ? 'bg-gray-800 text-white border-gray-800' 
                      : 'bg-white text-gray-800 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold text-lg mb-2">Yes</div>
                    <div className="text-sm opacity-90">$200 per class</div>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData({...formData, section15: false})}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    !formData.section15 
                      ? 'bg-gray-100 text-gray-800 border-gray-300' 
                      : 'bg-white text-gray-800 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold text-lg">No Thanks</div>
                  </div>
                </button>
              </div>

              {formData.section15 && (
                <>
                  {/* Continuous Use Question */}
                  <div className="space-y-4">
                    <p className="text-base">
                      Since your registration date, has your mark been used continuously on <strong>all</strong> the 
                      goods and/or services listed in your registration certificate?
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">No</span>
                      <div className="flex items-center space-x-3">
                        <Switch
                          id="continuous-use-toggle"
                          checked={formData.section15Continuous === 'yes'}
                          onCheckedChange={(checked) => 
                            setFormData({...formData, section15Continuous: checked ? 'yes' : 'no'})
                          }
                        />
                        <span className="font-medium">Yes</span>
                      </div>
                    </div>
                    {formData.section15Continuous === 'no' && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          If your mark has not been used continuously, it is not eligible for filing a Declaration of Incontestability.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Ownership Challenge Question */}
                  <div className="space-y-4">
                    <p className="text-base">
                      Has your mark's ownership ever been challenged at the USPTO or in court?
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">No</span>
                      <div className="flex items-center space-x-3">
                        <Switch
                          id="ownership-challenge-toggle"
                          checked={formData.section15Challenged === 'yes'}
                          onCheckedChange={(checked) => 
                            setFormData({...formData, section15Challenged: checked ? 'yes' : 'no'})
                          }
                        />
                        <span className="font-medium">Yes</span>
                      </div>
                    </div>
                    {formData.section15Challenged === 'yes' && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          If your mark's ownership has ever been challenged, it is not eligible for filing a Declaration of Incontestability.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        );

      case 7:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Owner/Assignment/Address Confirmation</CardTitle>
              <CardDescription>
                Please confirm or update the trademark owner information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {trademark && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-semibold">Current Owner:</p>
                  <p>{trademark.owner}</p>
                  
                  {/* Display owner address information */}
                  {trademark.ownerInformation?.address && (
                    <div className="mt-3 text-sm text-muted-foreground">
                      <p className="font-medium mb-1">Address:</p>
                      {trademark.ownerInformation.address.lines && trademark.ownerInformation.address.lines.length > 0 ? (
                        <>
                          {trademark.ownerInformation.address.lines.map((line: string, index: number) => (
                            <p key={index}>{line}</p>
                          ))}
                          <p>
                            {trademark.ownerInformation.address.city && `${trademark.ownerInformation.address.city}, `}
                            {trademark.ownerInformation.address.state && `${trademark.ownerInformation.address.state} `}
                            {trademark.ownerInformation.address.postalCode}
                          </p>
                          {trademark.ownerInformation.address.country && trademark.ownerInformation.address.country !== 'US' && (
                            <p>{trademark.ownerInformation.address.country}</p>
                          )}
                        </>
                      ) : (
                        <p>Address information not available</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                {/* Owner Change Toggle */}
                <div>
                  <p className="text-sm text-muted-foreground mb-3">
                    The owner of the mark.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Remains the same</span>
                    <div className="flex items-center space-x-3">
                      <Switch
                        id="owner-changed-toggle"
                        checked={formData.ownerChanged}
                        onCheckedChange={(checked) => setFormData({...formData, ownerChanged: checked})}
                      />
                      <span className="font-medium">Has changed</span>
                    </div>
                  </div>
                </div>

                {/* Address Change Toggle - Always visible */}
                <div>
                  <p className="text-sm text-muted-foreground mb-3">
                    The address of the owner.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Remains the same</span>
                    <div className="flex items-center space-x-3">
                      <Switch
                        id="address-changed-toggle"
                        checked={formData.addressChanged}
                        onCheckedChange={(checked) => setFormData({...formData, addressChanged: checked})}
                      />
                      <span className="font-medium">Has changed</span>
                    </div>
                  </div>
                </div>

                {formData.ownerChanged && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                    <p className="text-sm">
                      There is a $250 JMR Law Group fee for preparing and recording your assignment
                      agreement. If you already have an assignment agreement, there is a $50 JMR Law
                      Group fee for reviewing and recording the assignment. In either case, there is a $40
                      USPTO recordal fee for the first mark and $25 for each additional mark.
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span>Do you have an assignment agreement? (this is highly recommended)</span>
                        <div className="bg-orange-100 text-orange-800 rounded-full p-1">
                          <span className="text-xs">?</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">No</span>
                        <div className="flex items-center space-x-3">
                          <Switch
                            id="assignment-agreement-toggle"
                            checked={formData.hasAssignmentAgreement}
                            onCheckedChange={(checked) => setFormData({...formData, hasAssignmentAgreement: checked})}
                          />
                          <span className="font-medium">Yes</span>
                        </div>
                      </div>

                      {formData.hasAssignmentAgreement && (
                        <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
                          <p>Please upload the assignment agreement.</p>
                          
                          <div className="flex justify-start">
                            <Button variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50">
                              <Upload className="h-4 w-4 mr-2" />
                              Upload
                            </Button>
                          </div>
                        </div>
                      )}

                      {!formData.hasAssignmentAgreement && (
                        <div className="space-y-3 mt-4">
                          <p>Please submit the following information and we will email you an assignment agreement.</p>
                          
                          <div className="space-y-4">
                            <div>
                              <Label className="font-semibold">New Owner (Person Name or Business Entity)</Label>
                              <Input 
                                placeholder="Enter new owner name" 
                                value={formData.newOwnerInfo.name}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  newOwnerInfo: {...formData.newOwnerInfo, name: e.target.value}
                                })}
                                className="mt-1"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Country of Formation</Label>
                                <Select
                                  value={formData.newOwnerCountry}
                                  onValueChange={(value) => setFormData({...formData, newOwnerCountry: value})}
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select Country" />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-[300px]">
                                    {COUNTRIES.map(country => (
                                      <SelectItem key={country} value={country}>
                                        {country}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Type of Entity</Label>
                                <Select
                                  value={formData.newOwnerEntityType}
                                  onValueChange={(value) => setFormData({...formData, newOwnerEntityType: value})}
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select Entity Type" />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-[300px]">
                                    {ENTITY_TYPES.map(entityType => (
                                      <SelectItem key={entityType} value={entityType}>
                                        {entityType}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <div>
                              <Label className="font-semibold">Address [P.O. Boxes, etc. are not accepted by the USPTO]</Label>
                              <Input 
                                placeholder="Address Line 1" 
                                value={formData.newOwnerInfo.address}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  newOwnerInfo: {...formData.newOwnerInfo, address: e.target.value}
                                })}
                                className="mt-1"
                              />
                            </div>
                            
                            <div>
                              <Label>Address 2</Label>
                              <Input 
                                placeholder="Address Line 2 (optional)" 
                                value={formData.newOwnerInfo.address2}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  newOwnerInfo: {...formData.newOwnerInfo, address2: e.target.value}
                                })}
                                className="mt-1"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>City</Label>
                                <Input 
                                  placeholder="Enter city" 
                                  value={formData.newOwnerInfo.city}
                                  onChange={(e) => setFormData({
                                    ...formData,
                                    newOwnerInfo: {...formData.newOwnerInfo, city: e.target.value}
                                  })}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>State</Label>
                                <Input 
                                  placeholder="Enter state" 
                                  value={formData.newOwnerInfo.state}
                                  onChange={(e) => setFormData({
                                    ...formData,
                                    newOwnerInfo: {...formData.newOwnerInfo, state: e.target.value}
                                  })}
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Postal Code</Label>
                                <Input 
                                  placeholder="Enter postal code" 
                                  value={formData.newOwnerInfo.zip}
                                  onChange={(e) => setFormData({
                                    ...formData,
                                    newOwnerInfo: {...formData.newOwnerInfo, zip: e.target.value}
                                  })}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Country</Label>
                                <Input 
                                  placeholder="Enter country" 
                                  value={formData.newOwnerInfo.country}
                                  onChange={(e) => setFormData({
                                    ...formData,
                                    newOwnerInfo: {...formData.newOwnerInfo, country: e.target.value}
                                  })}
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <p>If there were additional trademarks transferred, please list their serial or registration number(s) here.</p>
                              
                              <div>
                                <Label>Serial or Registration Number(s):</Label>
                                <Input 
                                  placeholder="Enter serial or registration numbers" 
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Address Change Form - Shows when address is changed */}
                {formData.addressChanged && !formData.ownerChanged && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                    <p className="text-sm">
                      There is a $50 charge for updating the address.
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="font-semibold">Address [P.O. Boxes, etc. are not accepted by the USPTO]</Label>
                        <div className="border-b border-gray-300 mt-1"></div>
                      </div>
                      
                      <div>
                        <Label>Address 2</Label>
                        <Input 
                          placeholder="" 
                          value={formData.newOwnerInfo.address}
                          onChange={(e) => setFormData({
                            ...formData,
                            newOwnerInfo: {...formData.newOwnerInfo, address: e.target.value}
                          })}
                          className="mt-1"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>City</Label>
                          <Input 
                            placeholder=""
                            value={formData.newOwnerInfo.city}
                            onChange={(e) => setFormData({
                              ...formData,
                              newOwnerInfo: {...formData.newOwnerInfo, city: e.target.value}
                            })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>State</Label>
                          <Input 
                            placeholder=""
                            value={formData.newOwnerInfo.state}
                            onChange={(e) => setFormData({
                              ...formData,
                              newOwnerInfo: {...formData.newOwnerInfo, state: e.target.value}
                            })}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Postal Code</Label>
                          <Input 
                            placeholder=""
                            value={formData.newOwnerInfo.zip}
                            onChange={(e) => setFormData({
                              ...formData,
                              newOwnerInfo: {...formData.newOwnerInfo, zip: e.target.value}
                            })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Country</Label>
                          <Input 
                            placeholder=""
                            value={formData.newOwnerInfo.country}
                            onChange={(e) => setFormData({
                              ...formData,
                              newOwnerInfo: {...formData.newOwnerInfo, country: e.target.value}
                            })}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 8:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Signatory Information</CardTitle>
              <CardDescription>
                Please provide the following information for the authorized signatory
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Full Name"
                  value={formData.signatory.name}
                  onChange={(e) => setFormData({
                    ...formData,
                    signatory: {...formData.signatory, name: e.target.value}
                  })}
                />
                <Input
                  placeholder="Title"
                  value={formData.signatory.title}
                  onChange={(e) => setFormData({
                    ...formData,
                    signatory: {...formData.signatory, title: e.target.value}
                  })}
                />
                <Input
                  type="email"
                  placeholder="Email (secure/personal recommended)"
                  value={formData.signatory.email}
                  onChange={(e) => setFormData({
                    ...formData,
                    signatory: {...formData.signatory, email: e.target.value}
                  })}
                />
                <Input
                  type="tel"
                  placeholder="Phone"
                  value={formData.signatory.phone}
                  onChange={(e) => setFormData({
                    ...formData,
                    signatory: {...formData.signatory, phone: e.target.value}
                  })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="authority"
                  checked={formData.signatory.hasAuthority}
                  onCheckedChange={(checked) => 
                    setFormData({
                      ...formData,
                      signatory: {...formData.signatory, hasAuthority: checked as boolean}
                    })
                  }
                />
                <Label htmlFor="authority">
                  I have authority to sign legally binding documents for this company
                </Label>
              </div>
            </CardContent>
          </Card>
        );

      case 9:
        const reviewFees = calculateFees();
        return (
          <Card>
            <CardHeader>
              <CardTitle>Review Your Information</CardTitle>
              <CardDescription>
                Please review all information carefully before proceeding to payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Trademark Information */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Trademark Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Mark:</span>
                    <p className="font-medium">{trademark?.mark}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Serial Number:</span>
                    <p className="font-medium">#{trademark?.serialNumber}</p>
                  </div>
                  {trademark?.registrationNumber && (
                    <div>
                      <span className="text-muted-foreground">Registration Number:</span>
                      <p className="font-medium">#{trademark.registrationNumber}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Current Owner:</span>
                    <p className="font-medium">{trademark?.owner}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Processing Speed */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Processing Speed
                </h3>
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <span>{formData.processingSpeed === 'rush' ? 'Rush Processing' : 'Standard Processing'}</span>
                  <div className="text-right">
                    <p className="font-medium">
                      {formData.processingSpeed === 'rush' ? '2 business days' : '~2 weeks'}
                    </p>
                    {formData.processingSpeed === 'rush' && (
                      <p className="text-xs text-orange-600">+$500 rush fee</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Section 8 Declaration */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Section 8 Declaration of Use
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Trademark currently in use on all goods/services:</span>
                    <Badge variant={formData.section8Use ? "default" : "secondary"}>
                      {formData.section8Use ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  {formData.editedGoodsServices && (
                    <div>
                      <span className="text-muted-foreground text-sm">Goods & Services Description:</span>
                      <p className="text-sm mt-1 p-2 bg-muted/20 rounded border-l-2 border-primary/20">
                        {formData.editedGoodsServices.substring(0, 200)}
                        {formData.editedGoodsServices.length > 200 && '...'}
                      </p>
                    </div>
                  )}
                  {!formData.section8Use && formData.removedGoodsServices && (
                    <div>
                      <span className="text-muted-foreground text-sm">Modified Description (after removals):</span>
                      <p className="text-sm mt-1 p-2 bg-muted/20 rounded border-l-2 border-orange-300">
                        {formData.removedGoodsServices.substring(0, 200)}
                        {formData.removedGoodsServices.length > 200 && '...'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Specimen Upload */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Specimen Upload
                </h3>
                <div className="flex items-center justify-between">
                  <span>Find specimens from web/social media:</span>
                  <Badge variant={formData.specimenFromWeb === 'yes' ? "default" : "secondary"}>
                    {formData.specimenFromWeb === 'yes' ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Section 15 Declaration */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Scale className="h-4 w-4" />
                  Section 15 Declaration of Incontestability
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>File Section 15 Declaration:</span>
                    <Badge variant={formData.section15 ? "default" : "secondary"}>
                      {formData.section15 ? 'Yes (+$200)' : 'No'}
                    </Badge>
                  </div>
                  {formData.section15 && (
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• Continuous use since registration: {formData.section15Continuous === 'yes' ? '✓ Yes' : '✗ No'}</p>
                      <p>• Ownership challenged: {formData.section15Challenged === 'yes' ? '✗ Yes' : '✓ No'}</p>
                      {(formData.section15Continuous === 'no' || formData.section15Challenged === 'yes') && (
                        <p className="text-red-600 text-xs">⚠ Not eligible for Section 15 - fee excluded</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Owner/Address Changes */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Owner & Address Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Owner has changed:</span>
                    <Badge variant={formData.ownerChanged ? "default" : "secondary"}>
                      {formData.ownerChanged ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Address has changed:</span>
                    <Badge variant={formData.addressChanged ? "default" : "secondary"}>
                      {formData.addressChanged ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  
                  {formData.ownerChanged && (
                    <div className="p-3 bg-muted/20 rounded-lg text-sm space-y-2">
                      <p className="font-medium">New Owner Details:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <span className="text-muted-foreground">Name:</span>
                          <p>{formData.newOwnerInfo.name || 'Not provided'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Entity Type:</span>
                          <p>{formData.newOwnerEntityType || 'Not provided'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Country:</span>
                          <p>{formData.newOwnerCountry || 'Not provided'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Assignment Agreement:</span>
                          <p>{formData.hasAssignmentAgreement ? 'Has existing agreement' : 'Needs new agreement'}</p>
                        </div>
                      </div>
                      {(formData.newOwnerInfo.address || formData.newOwnerInfo.city) && (
                        <div>
                          <span className="text-muted-foreground">Address:</span>
                          <p>{formData.newOwnerInfo.address}</p>
                          {formData.newOwnerInfo.address2 && <p>{formData.newOwnerInfo.address2}</p>}
                          <p>{formData.newOwnerInfo.city}, {formData.newOwnerInfo.state} {formData.newOwnerInfo.zip}</p>
                          <p>{formData.newOwnerInfo.country}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {formData.addressChanged && !formData.ownerChanged && (
                    <div className="p-3 bg-muted/20 rounded-lg text-sm">
                      <p className="font-medium mb-2">Updated Address:</p>
                      <p>{formData.newOwnerInfo.address}</p>
                      {formData.newOwnerInfo.address2 && <p>{formData.newOwnerInfo.address2}</p>}
                      <p>{formData.newOwnerInfo.city}, {formData.newOwnerInfo.state} {formData.newOwnerInfo.zip}</p>
                      <p>{formData.newOwnerInfo.country}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Signatory Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Authorized Signatory
                </h3>
                <div className="p-3 bg-muted/20 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <p className="font-medium">{formData.signatory.name || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Title:</span>
                      <p className="font-medium">{formData.signatory.title || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <p className="font-medium">{formData.signatory.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phone:</span>
                      <p className="font-medium">{formData.signatory.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      {formData.signatory.hasAuthority ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm">
                        {formData.signatory.hasAuthority ? 'Has authority to sign' : 'Authority not confirmed'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Fee Summary */}
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Fee Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>JMR Fee: Section 8 Declaration</span>
                    <span>$200</span>
                  </div>
                  {formData.processingSpeed === 'rush' && (
                    <div className="flex justify-between text-orange-600">
                      <span>JMR Fee: Rush Processing</span>
                      <span>$500</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>USPTO Fee: Section 8 Declaration</span>
                    <span>$225</span>
                  </div>
                  <div className="flex justify-between">
                    <span>USPTO Fee: Grace Period</span>
                    <span>$100</span>
                  </div>
                  {formData.section15 && formData.section15Continuous !== 'no' && formData.section15Challenged !== 'yes' && (
                    <div className="flex justify-between">
                      <span>USPTO Fee: Section 15 Declaration</span>
                      <span>$200</span>
                    </div>
                  )}
                  {formData.addressChanged && !formData.ownerChanged && (
                    <div className="flex justify-between">
                      <span>JMR Fee: Address Update</span>
                      <span>$50</span>
                    </div>
                  )}
                  {formData.ownerChanged && (
                    <>
                      <div className="flex justify-between">
                        <span>JMR Fee: {formData.hasAssignmentAgreement ? 'Recording' : 'Preparing & Recording'} Assignment</span>
                        <span>${formData.hasAssignmentAgreement ? '50' : '250'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>USPTO Fee: Recordal Fee</span>
                        <span>$40</span>
                      </div>
                    </>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount Due</span>
                    <span className="text-primary">${reviewFees.currentTotal}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 10:
        const handleScrollCheck = () => {
          if (termsScrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = termsScrollRef.current;
            const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold
            if (isAtBottom && !hasScrolledToEnd) {
              setHasScrolledToEnd(true);
              toast({
                title: "Terms reviewed",
                description: "You can now accept the agreement",
              });
            }
          }
        };

        return (
          <Card>
            <CardHeader>
              <CardTitle>Engagement Agreement & Terms</CardTitle>
              <CardDescription>
                Please review and accept the terms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!hasScrolledToEnd && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please scroll to the end of the agreement to continue
                  </AlertDescription>
                </Alert>
              )}

              <div 
                ref={termsScrollRef}
                onScroll={handleScrollCheck}
                className="h-96 overflow-y-auto border rounded-lg p-6 text-sm bg-muted/10"
              >
                <h3 className="font-bold text-lg mb-4 text-center">ENGAGEMENT AGREEMENT AND LEGAL TERMS</h3>
                
                <p className="mb-4 text-xs text-muted-foreground text-center">
                  Effective Date: {new Date().toLocaleDateString()}
                </p>

                <h4 className="font-semibold mt-6 mb-3">1. PARTIES TO THIS AGREEMENT</h4>
                <p className="mb-4">
                  This Engagement Agreement ("Agreement") is entered into between the undersigned client 
                  ("Client" or "You") and JMR Legal, LLC, a professional limited liability company organized 
                  under the laws of California ("Firm," "We," or "Us"), for the provision of trademark 
                  renewal services as described herein.
                </p>

                <h4 className="font-semibold mt-6 mb-3">2. SCOPE OF SERVICES</h4>
                <p className="mb-4">
                  The Firm agrees to provide the following services ("Services"):
                </p>
                <ul className="list-disc ml-6 mb-4 space-y-2">
                  <li>Preparation and filing of Section 8 Declaration of Continued Use</li>
                  <li>Preparation and filing of Section 9 Renewal Application (if applicable)</li>
                  <li>Preparation and filing of Section 15 Declaration of Incontestability (if applicable)</li>
                  <li>Review of trademark registration status and deadlines</li>
                  <li>Preparation of specimens of use as required</li>
                  <li>Communication with the United States Patent and Trademark Office (USPTO)</li>
                  <li>Response to routine USPTO correspondence regarding the renewal filing</li>
                </ul>
                <p className="mb-4">
                  The Services do not include: (a) litigation or dispute resolution; (b) trademark searches 
                  or opinions; (c) response to substantive office actions beyond routine administrative 
                  matters; (d) services related to opposition or cancellation proceedings; or (e) any 
                  services not expressly described in this Agreement.
                </p>

                <h4 className="font-semibold mt-6 mb-3">3. ATTORNEY-CLIENT RELATIONSHIP</h4>
                <p className="mb-4">
                  Upon execution of this Agreement and payment of fees, an attorney-client relationship 
                  will be established between Client and Firm solely for the purposes described in this 
                  Agreement. This relationship is limited to the specific trademark renewal matters 
                  identified herein and does not extend to other legal matters unless separately agreed 
                  in writing.
                </p>

                <h4 className="font-semibold mt-6 mb-3">4. FEES AND PAYMENT TERMS</h4>
                <p className="mb-4">
                  Client agrees to pay the following fees:
                </p>
                <ul className="list-disc ml-6 mb-4 space-y-2">
                  <li>Professional service fee for Section 8 Declaration: $200.00</li>
                  <li>Rush processing fee (if selected): $500.00</li>
                  <li>USPTO government fees (pass-through, no markup)</li>
                  <li>Additional services as agreed upon in writing</li>
                </ul>
                <p className="mb-4">
                  All fees are due and payable upon execution of this Agreement. Payment may be made by 
                  credit card, debit card, or electronic payment methods accepted by the Firm. USPTO 
                  government fees are subject to change without notice and Client is responsible for any 
                  fee increases imposed by the USPTO.
                </p>

                <h4 className="font-semibold mt-6 mb-3">5. CLIENT RESPONSIBILITIES</h4>
                <p className="mb-4">
                  Client agrees to:
                </p>
                <ul className="list-disc ml-6 mb-4 space-y-2">
                  <li>Provide complete and accurate information regarding the trademark</li>
                  <li>Respond promptly to requests for information or documentation</li>
                  <li>Review all documents before filing and notify Firm of any errors</li>
                  <li>Maintain current contact information throughout the engagement</li>
                  <li>Provide specimens of use that accurately reflect current use of the mark</li>
                  <li>Inform Firm of any changes in ownership or use of the trademark</li>
                </ul>

                <h4 className="font-semibold mt-6 mb-3">6. REPRESENTATIONS AND WARRANTIES</h4>
                <p className="mb-4">
                  Client represents and warrants that:
                </p>
                <ul className="list-disc ml-6 mb-4 space-y-2">
                  <li>Client has the legal authority to enter into this Agreement</li>
                  <li>All information provided to Firm is true, accurate, and complete</li>
                  <li>The trademark is currently in use in interstate commerce</li>
                  <li>Client is the owner of the trademark or has authority to act on behalf of the owner</li>
                  <li>The specimens provided accurately show the mark as currently used</li>
                  <li>Client has not knowingly made any false statements to the USPTO</li>
                </ul>

                <h4 className="font-semibold mt-6 mb-3">7. DISCLAIMER OF WARRANTIES</h4>
                <p className="mb-4">
                  EXCEPT AS EXPRESSLY SET FORTH IN THIS AGREEMENT, FIRM MAKES NO WARRANTIES, EXPRESS OR 
                  IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OF MERCHANTABILITY OR 
                  FITNESS FOR A PARTICULAR PURPOSE. FIRM DOES NOT GUARANTEE ANY PARTICULAR OUTCOME OR 
                  RESULT. THE USPTO MAKES ALL FINAL DECISIONS REGARDING TRADEMARK RENEWALS.
                </p>

                <h4 className="font-semibold mt-6 mb-3">8. LIMITATION OF LIABILITY</h4>
                <p className="mb-4">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, FIRM'S TOTAL LIABILITY TO CLIENT FOR ANY CLAIMS 
                  ARISING OUT OF OR RELATED TO THIS AGREEMENT SHALL NOT EXCEED THE AMOUNT OF FEES PAID BY 
                  CLIENT TO FIRM UNDER THIS AGREEMENT. IN NO EVENT SHALL FIRM BE LIABLE FOR ANY INDIRECT, 
                  INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION 
                  LOST PROFITS, LOST BUSINESS, OR LOST OPPORTUNITY, EVEN IF FIRM HAS BEEN ADVISED OF THE 
                  POSSIBILITY OF SUCH DAMAGES.
                </p>

                <h4 className="font-semibold mt-6 mb-3">9. INDEMNIFICATION</h4>
                <p className="mb-4">
                  Client agrees to indemnify, defend, and hold harmless Firm and its members, employees, 
                  and agents from and against any and all claims, losses, damages, liabilities, costs, and 
                  expenses (including reasonable attorneys' fees) arising out of or related to: (a) Client's 
                  breach of this Agreement; (b) Client's violation of any law or regulation; (c) any false 
                  or misleading information provided by Client; or (d) Client's use or misuse of the trademark.
                </p>

                <h4 className="font-semibold mt-6 mb-3">10. CONFIDENTIALITY</h4>
                <p className="mb-4">
                  Firm will maintain the confidentiality of all non-public information provided by Client 
                  in connection with this engagement, except as required by law or professional rules. 
                  Client acknowledges that trademark applications and registrations are public records.
                </p>

                <h4 className="font-semibold mt-6 mb-3">11. ELECTRONIC COMMUNICATIONS</h4>
                <p className="mb-4">
                  Client consents to receive communications from Firm electronically, including via email. 
                  Client acknowledges that email communications are not entirely secure and that sensitive 
                  information sent via email may be intercepted by third parties. Client agrees to notify 
                  Firm immediately of any change in email address.
                </p>

                <h4 className="font-semibold mt-6 mb-3">12. TERMINATION</h4>
                <p className="mb-4">
                  Either party may terminate this Agreement upon written notice to the other party. Upon 
                  termination, Client remains responsible for all fees incurred through the date of 
                  termination and for any USPTO government fees that have been paid or committed. Firm will 
                  provide Client with copies of all work product completed through the termination date.
                </p>

                <h4 className="font-semibold mt-6 mb-3">13. GOVERNING LAW AND DISPUTE RESOLUTION</h4>
                <p className="mb-4">
                  This Agreement shall be governed by the laws of the State of California without regard to 
                  its conflict of law provisions. Any dispute arising out of or related to this Agreement 
                  shall be resolved through binding arbitration in accordance with the rules of the American 
                  Arbitration Association. The arbitration shall take place in Los Angeles County, California.
                </p>

                <h4 className="font-semibold mt-6 mb-3">14. ENTIRE AGREEMENT</h4>
                <p className="mb-4">
                  This Agreement constitutes the entire agreement between the parties with respect to the 
                  subject matter hereof and supersedes all prior and contemporaneous agreements and 
                  understandings, whether written or oral. This Agreement may only be modified in writing 
                  signed by both parties.
                </p>

                <h4 className="font-semibold mt-6 mb-3">15. SEVERABILITY</h4>
                <p className="mb-4">
                  If any provision of this Agreement is held to be invalid or unenforceable, the remaining 
                  provisions shall continue in full force and effect.
                </p>

                <h4 className="font-semibold mt-6 mb-3">16. ACKNOWLEDGMENT AND ACCEPTANCE</h4>
                <p className="mb-4">
                  BY CHECKING THE BOXES BELOW AND PROCEEDING WITH PAYMENT, CLIENT ACKNOWLEDGES THAT CLIENT 
                  HAS READ, UNDERSTOOD, AND AGREES TO BE BOUND BY ALL TERMS AND CONDITIONS OF THIS AGREEMENT.
                </p>

                <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                    ⚠️ IMPORTANT: You have reached the end of the agreement. You may now accept the terms below.
                  </p>
                </div>
              </div>

              {hasScrolledToEnd && (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    You have reviewed the entire agreement. Please confirm your acceptance below.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreement"
                    checked={formData.agreementAccepted}
                    disabled={!hasScrolledToEnd}
                    onCheckedChange={(checked) => 
                      setFormData({...formData, agreementAccepted: checked as boolean})
                    }
                  />
                  <Label 
                    htmlFor="agreement"
                    className={!hasScrolledToEnd ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  >
                    I agree to the Engagement Agreement and Legal Terms above
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.termsAccepted}
                    disabled={!hasScrolledToEnd}
                    onCheckedChange={(checked) => 
                      setFormData({...formData, termsAccepted: checked as boolean})
                    }
                  />
                  <Label 
                    htmlFor="terms"
                    className={!hasScrolledToEnd ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  >
                    I declare that all provided information is accurate
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 11:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Electronic Signature & Payment</CardTitle>
              <CardDescription>
                Complete your renewal with electronic signature and secure payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Electronic Signature</Label>
                <Input
                  placeholder="Type your full legal name as your electronic signature"
                  value={formData.signature}
                  onChange={(e) => setFormData({...formData, signature: e.target.value})}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  By typing your name above, you are providing your electronic signature and agreeing that it has the same legal effect as a handwritten signature.
                </p>
              </div>

              <Separator />

              <StripeCheckout
                renewalId={`renewal_${Date.now()}`}
                serialNumber={serialNumber || trademark?.serialNumber || ''}
                userEmail="user@example.com" // This should come from authentication context
                formData={formData}
                trademark={trademark}
                signature={formData.signature}
                disabled={!formData.signature}
              />
            </CardContent>
          </Card>
        );

      case 12:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                Renewal Submitted Successfully!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Your trademark renewal request has been submitted!<br />
                  A confirmation email has been sent to: {formData.signatory.email}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <p><strong>Confirmation Number:</strong> RNW-2024-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                <p><strong>Trademark:</strong> {trademark?.mark}</p>
                <p><strong>Serial Number:</strong> {trademark?.serialNumber}</p>
                <p><strong>Processing Type:</strong> {formData.processingSpeed === 'rush' ? 'Rush' : 'Standard'}</p>
                <p><strong>Total Paid:</strong> ${calculateFees().currentTotal}</p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Next Steps</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>You will receive email updates on your renewal status</li>
                  <li>Processing time: {formData.processingSpeed === 'rush' ? '2 business days' : '2 weeks'}</li>
                  <li>We will contact you if any additional information is needed</li>
                  <li>Once approved, you'll receive your renewal certificate</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Summary
                </Button>
                <Button onClick={() => navigate('/uspto-services')}>
                  Start New Renewal
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold">Trademark Renewal</h2>
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {RENEWAL_STEPS.length}
            </span>
          </div>
          <Progress value={(currentStep / RENEWAL_STEPS.length) * 100} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {RENEWAL_STEPS[currentStep - 1]?.title}: {RENEWAL_STEPS[currentStep - 1]?.description}
          </p>
        </div>

        {/* Step Content */}
        {currentStep === 1 ? (
          <div className="max-w-2xl mx-auto">
            {renderStep()}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {renderStep()}
            </div>
            
            {/* Pricing Sidebar - Only show on steps 2-12 */}
            <div className="lg:col-span-1">
              <PricingSidebar formData={formData} trademark={trademark} />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className={`flex justify-between mt-8 ${currentStep === 1 ? 'max-w-2xl mx-auto' : ''}`}>
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 12 || (currentStep === 1 && (!trademark || !serialNumber))}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentStep === 1 && trademark && serialNumber ? 'Back to Details' : 'Back'}
          </Button>

          {currentStep < 11 ? (
            <Button 
              onClick={handleNext}
              disabled={currentStep === 10 && (!hasScrolledToEnd || !formData.agreementAccepted || !formData.termsAccepted)}
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TrademarkRenewal;