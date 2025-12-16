import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, DollarSign } from "lucide-react";
import { TrademarkResult } from "@/types/uspto";

interface RenewalFormData {
  processingSpeed: 'standard' | 'rush';
  section8Use: boolean;
  section15: boolean;
  section15Continuous: string;
  section15Challenged: string;
  addressChanged: boolean;
  ownerChanged: boolean;
  hasAssignmentAgreement: boolean;
  [key: string]: any;
}

interface PricingSidebarProps {
  formData: RenewalFormData;
  trademark: TrademarkResult | null;
}

const PricingSidebar: React.FC<PricingSidebarProps> = ({ formData, trademark }) => {
  const calculateFees = () => {
    const isRush = formData.processingSpeed === 'rush';
    const jmrFee = 200;
    const rushFee = isRush ? 500 : 0;
    const usptoSection8 = 225;
    const usptoGracePeriod = 100;
    
    // Section 15 eligibility check
    const isSection15Eligible = formData.section15 && 
                               formData.section15Continuous !== 'no' && 
                               formData.section15Challenged !== 'yes';
    const usptoSection15 = isSection15Eligible ? 200 : 0;
    
    const jmrAddressUpdate = formData.addressChanged && !formData.ownerChanged ? 50 : 0;
    
    // Owner change fees
    const jmrAssignmentFee = formData.ownerChanged ? 
      (formData.hasAssignmentAgreement ? 50 : 250) : 0;
    const usptoRecordalFee = formData.ownerChanged ? 40 : 0;
    
    const standardTotal = jmrFee + usptoSection8 + usptoGracePeriod + usptoSection15 + 
                         jmrAddressUpdate + jmrAssignmentFee + usptoRecordalFee;
    const rushTotal = standardTotal + rushFee;
    
    return {
      jmrFee,
      rushFee,
      usptoSection8,
      usptoGracePeriod,
      usptoSection15,
      isSection15Eligible,
      jmrAddressUpdate,
      jmrAssignmentFee,
      usptoRecordalFee,
      standardTotal,
      rushTotal,
      currentTotal: isRush ? rushTotal : standardTotal
    };
  };

  const fees = calculateFees();
  const isRush = formData.processingSpeed === 'rush';

  return (
    <div className="sticky top-8">
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="h-5 w-5" />
            Pricing Summary
          </CardTitle>
          {trademark && (
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-medium">{trademark.mark}</p>
              <p>Serial #{trademark.serialNumber}</p>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Processing Speed */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              {isRush ? (
                <>
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span>Rush Processing (2 days)</span>
                  <Badge variant="secondary" className="ml-auto">Selected</Badge>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Standard Processing (2 weeks)</span>
                  <Badge variant="secondary" className="ml-auto">Selected</Badge>
                </>
              )}
            </div>
          </div>

          <Separator />

          {/* Fee Breakdown */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Fee Breakdown</h4>
            
            {/* JMR Base Fee */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">JMR Fee: Section 8 Declaration</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">1 class</span>
                <span className="font-medium">${fees.jmrFee}</span>
              </div>
            </div>

            {/* Rush Fee - Only show if rush is selected */}
            {isRush && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">JMR Fee: Rush Renewal</span>
                <span className="font-medium">${fees.rushFee}</span>
              </div>
            )}

            {/* USPTO Section 8 */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">USPTO Fee: Section 8 Declaration of Use/Excusable Non-Use</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">1 class</span>
                <span className="font-medium">${fees.usptoSection8}</span>
              </div>
            </div>

            {/* USPTO Grace Period */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">USPTO Fee: Grace Period</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">1 class</span>
                <span className="font-medium">${fees.usptoGracePeriod}</span>
              </div>
            </div>

            {/* USPTO Section 15 - Only show if selected and eligible */}
            {fees.isSection15Eligible && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">USPTO Fee: Section 15 Declaration of Incontestability</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">1 class</span>
                  <span className="font-medium">${fees.usptoSection15}</span>
                </div>
              </div>
            )}

            {/* JMR Address Update - Only show if address changed (and owner hasn't changed) */}
            {formData.addressChanged && !formData.ownerChanged && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">JMR Fee: Updating Address with USPTO</span>
                <span className="font-medium">${fees.jmrAddressUpdate}</span>
              </div>
            )}

            {/* Owner Change Fees - Only show if owner changed */}
            {formData.ownerChanged && (
              <>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    {formData.hasAssignmentAgreement 
                      ? 'JMR Fee: Recording Assignment' 
                      : 'JMR Fee: Preparing and Recording Assignment'}
                  </span>
                  <span className="font-medium">${fees.jmrAssignmentFee}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">USPTO Fee: Recordal Fee</span>
                  <span className="font-medium">${fees.usptoRecordalFee}</span>
                </div>
              </>
            )}
          </div>

          <Separator />

          {/* Total */}
          <div className="bg-primary/10 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total Amount Due</span>
              <span className="text-2xl font-bold text-primary">
                ${fees.currentTotal}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Processing: {isRush ? '2 business days' : '~2 weeks'}
            </p>
          </div>

          {/* Optional Services Notice */}
          {!fees.isSection15Eligible && (
            <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
              <p className="font-medium mb-1">Optional Services:</p>
              <p>Section 15 Declaration (+$200) can be added to strengthen your trademark rights.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingSidebar;