import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Hash, Building, User, Shield, FileText } from "lucide-react";
import type { EUIPOTrademark } from "@/services/euipoService";

const EUIPOTrademarkDetail = () => {
  const { applicationNumber } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const trademark = location.state?.trademark as EUIPOTrademark | undefined;

  if (!trademark) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              No trademark data available
            </p>
            <Button onClick={() => navigate('/euipo-services')}>
              Return to Search
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'REGISTERED':
        return 'bg-green-100 text-green-800';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      case 'WITHDRAWN':
        return 'bg-gray-100 text-gray-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="container mx-auto p-8">
      <Button
        variant="ghost"
        onClick={() => navigate('/euipo-services')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Search
      </Button>

      <div className="grid gap-6">
        {/* Header Card */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl mb-2">
                  {trademark.wordMarkSpecification?.verbalElement || 'Trademark Details'}
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Hash className="h-4 w-4" />
                    {trademark.applicationNumber}
                  </span>
                  <Badge className={getStatusColor(trademark.status)}>
                    {trademark.status}
                  </Badge>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                {trademark.markBasis}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Main Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Mark Type</p>
                <p>{trademark.markKind}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Mark Feature</p>
                <p>{trademark.markFeature}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Nice Classes</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {trademark.niceClasses.map((cls) => (
                    <Badge key={cls} variant="outline">
                      Class {cls}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Important Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Application Date</p>
                <p>{new Date(trademark.applicationDate).toLocaleDateString()}</p>
              </div>
              {trademark.registrationDate && (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Registration Date</p>
                  <p>{new Date(trademark.registrationDate).toLocaleDateString()}</p>
                </div>
              )}
              {trademark.expiryDate && (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Expiry Date</p>
                  <p>{new Date(trademark.expiryDate).toLocaleDateString()}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Applicants */}
        {trademark.applicants && trademark.applicants.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5" />
                Applicants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trademark.applicants.map((applicant, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Badge variant="outline">{applicant.office}</Badge>
                    <div>
                      <p className="font-medium">{applicant.name || 'Name not available'}</p>
                      <p className="text-sm text-muted-foreground">ID: {applicant.identifier}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Representatives */}
        {trademark.representatives && trademark.representatives.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Representatives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trademark.representatives.map((rep, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Badge variant="outline">{rep.office}</Badge>
                    <div>
                      <p className="font-medium">{rep.name || 'Name not available'}</p>
                      <p className="text-sm text-muted-foreground">ID: {rep.identifier}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => navigate('/euipo-services')}>
                Search Another
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Shield className="h-4 w-4 mr-2" />
                Monitor This Trademark
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EUIPOTrademarkDetail;