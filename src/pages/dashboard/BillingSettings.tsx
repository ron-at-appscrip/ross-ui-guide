import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  CreditCard, 
  DollarSign, 
  Download, 
  Mail, 
  Plus, 
  Trash2, 
  Edit3,
  CheckCircle,
  TrendingUp,
  Users,
  HardDrive,
  Zap,
  Calendar,
  Building,
  Receipt
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Plan {
  name: string;
  price: number;
  features: string[];
  current: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  description: string;
}

const BillingSettings = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  const [plans] = useState<Plan[]>([
    {
      name: 'Starter',
      price: 49,
      features: ['5 matters', '3 users', '5GB storage', 'Basic support'],
      current: false,
    },
    {
      name: 'Professional',
      price: 99,
      features: ['Unlimited matters', '10 users', '20GB storage', 'Priority support', 'Advanced features'],
      current: true,
    },
    {
      name: 'Enterprise',
      price: 199,
      features: ['Unlimited everything', 'Unlimited users', '100GB storage', '24/7 support', 'Custom integrations'],
      current: false,
    },
  ]);

  const [paymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      last4: '1234',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
    },
    {
      id: '2',
      type: 'card',
      last4: '5678',
      brand: 'Mastercard',
      expiryMonth: 8,
      expiryYear: 2026,
      isDefault: false,
    },
  ]);

  const [invoices] = useState<Invoice[]>([
    { id: '1', date: '2024-07-01', amount: 99, status: 'paid', description: 'Professional Plan - July 2024' },
    { id: '2', date: '2024-06-01', amount: 99, status: 'paid', description: 'Professional Plan - June 2024' },
    { id: '3', date: '2024-05-01', amount: 99, status: 'paid', description: 'Professional Plan - May 2024' },
    { id: '4', date: '2024-04-01', amount: 49, status: 'paid', description: 'Starter Plan - April 2024' },
  ]);

  const [billingInfo, setBillingInfo] = useState({
    email: 'billing@lawfirm.com',
    company: 'Doe & Associates',
    taxId: '123456789',
    address: '123 Legal Street, New York, NY 10001',
  });

  const currentPlan = plans.find(plan => plan.current);
  const usageData = {
    users: { current: 5, limit: 10 },
    storage: { current: 8, limit: 20 },
    apiCalls: { current: 12000, limit: 50000 },
  };

  const handleUpgrade = (planName: string) => {
    toast({
      title: "Plan Upgrade",
      description: `Upgrading to ${planName} plan...`,
    });
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast({
      title: "Download Started",
      description: "Your invoice PDF is being downloaded.",
    });
  };

  const handleAddPaymentMethod = () => {
    toast({
      title: "Add Payment Method",
      description: "Payment method setup would be initiated here.",
    });
  };

  const handleRemovePaymentMethod = (methodId: string) => {
    toast({
      title: "Payment Method Removed",
      description: "The payment method has been removed successfully.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Paid</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'overdue':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-heading-1 font-bold">Billing Settings</h1>
        <p className="text-body text-muted-foreground">
          Manage your subscription, payment methods, and billing information.
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Subscription
          </CardTitle>
          <CardDescription>
            Your current plan and billing cycle information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentPlan && (
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
              <div>
                <h3 className="text-lg font-semibold">{currentPlan.name} Plan</h3>
                <p className="text-2xl font-bold text-primary">${currentPlan.price}/month</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Next billing: January 1, 2025
                </p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mb-2">
                  Active
                </Badge>
                <div className="space-y-1">
                  {currentPlan.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Usage Summary
          </CardTitle>
          <CardDescription>
            Track your current usage against plan limits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Users</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{usageData.users.current} of {usageData.users.limit}</span>
                  <span>{Math.round((usageData.users.current / usageData.users.limit) * 100)}%</span>
                </div>
                <Progress value={(usageData.users.current / usageData.users.limit) * 100} className="h-2" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Storage</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{usageData.storage.current}GB of {usageData.storage.limit}GB</span>
                  <span>{Math.round((usageData.storage.current / usageData.storage.limit) * 100)}%</span>
                </div>
                <Progress value={(usageData.storage.current / usageData.storage.limit) * 100} className="h-2" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">API Calls</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{usageData.apiCalls.current.toLocaleString()} of {usageData.apiCalls.limit.toLocaleString()}</span>
                  <span>{Math.round((usageData.apiCalls.current / usageData.apiCalls.limit) * 100)}%</span>
                </div>
                <Progress value={(usageData.apiCalls.current / usageData.apiCalls.limit) * 100} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>
            Upgrade or downgrade your plan to match your needs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-6 rounded-lg border ${
                  plan.current ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                {plan.current && (
                  <Badge className="absolute -top-2 left-4 bg-primary">Current Plan</Badge>
                )}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <p className="text-2xl font-bold">${plan.price}<span className="text-sm font-normal">/month</span></p>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.current ? "outline" : "default"}
                    className="w-full"
                    onClick={() => handleUpgrade(plan.name)}
                    disabled={plan.current}
                  >
                    {plan.current ? "Current Plan" : "Upgrade"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Methods
            </CardTitle>
            <CardDescription>
              Manage your payment methods and billing information.
            </CardDescription>
          </div>
          <Button onClick={handleAddPaymentMethod} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Method
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <CreditCard className="h-8 w-8 text-muted-foreground" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{method.brand} •••• {method.last4}</span>
                    {method.isDefault && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRemovePaymentMethod(method.id)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Billing Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Billing Information
            </CardTitle>
            <CardDescription>
              Update your billing contact information and tax details.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2"
          >
            <Edit3 className="h-4 w-4" />
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billingEmail">Billing Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="billingEmail"
                  value={billingInfo.email}
                  onChange={(e) => setBillingInfo(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID / VAT Number</Label>
              <Input
                id="taxId"
                value={billingInfo.taxId}
                onChange={(e) => setBillingInfo(prev => ({ ...prev, taxId: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company Name</Label>
            <Input
              id="company"
              value={billingInfo.company}
              onChange={(e) => setBillingInfo(prev => ({ ...prev, company: e.target.value }))}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Billing Address</Label>
            <Input
              id="address"
              value={billingInfo.address}
              onChange={(e) => setBillingInfo(prev => ({ ...prev, address: e.target.value }))}
              disabled={!isEditing}
            />
          </div>
          {isEditing && (
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsEditing(false)}>
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Invoice History
          </CardTitle>
          <CardDescription>
            Download and manage your billing invoices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date
                  </TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {new Date(invoice.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{invoice.description}</TableCell>
                    <TableCell className="font-medium">${invoice.amount}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadInvoice(invoice.id)}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingSettings; 