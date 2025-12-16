import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus, Settings, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { LEDESConfiguration, LEDESFormat, UTBMSActivityCode, LEDESValidationRule } from '@/types/ledes';
import { LEDESBillingService } from '@/services/ledesBillingService';

interface LEDESConfigurationModalProps {
  open: boolean;
  onClose: () => void;
  configuration?: LEDESConfiguration | null;
  onSave?: (config: LEDESConfiguration) => void;
}

const LEDESConfigurationModal: React.FC<LEDESConfigurationModalProps> = ({
  open,
  onClose,
  configuration,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<LEDESConfiguration>>({
    clientName: '',
    format: 'LEDES1998B',
    version: '1.0',
    isActive: true
  });
  const [utbmsMapping, setUtbmsMapping] = useState<Map<string, UTBMSActivityCode>>(new Map());
  const [validationRules, setValidationRules] = useState<LEDESValidationRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const activityTypes = [
    { key: 'legal_research', label: 'Legal Research' },
    { key: 'document_review', label: 'Document Review' },
    { key: 'document_drafting', label: 'Document Drafting' },
    { key: 'client_meeting', label: 'Client Meeting' },
    { key: 'court_appearance', label: 'Court Appearance' },
    { key: 'correspondence', label: 'Correspondence' },
    { key: 'phone_call', label: 'Phone Call' },
    { key: 'general_work', label: 'General Work' }
  ];

  const utbmsActivities = LEDESBillingService.getUTBMSActivities();

  useEffect(() => {
    if (configuration) {
      setFormData({
        clientId: configuration.clientId,
        clientName: configuration.clientName,
        format: configuration.format,
        version: configuration.version,
        isActive: configuration.isActive
      });
      setUtbmsMapping(new Map(configuration.utbmsMapping as any));
      setValidationRules([...configuration.validationRules]);
    } else {
      // Reset form for new configuration
      setFormData({
        clientName: '',
        format: 'LEDES1998B',
        version: '1.0',
        isActive: true
      });
      setUtbmsMapping(new Map([
        ['legal_research', 'L300'],
        ['document_review', 'L400'],
        ['document_drafting', 'L500'],
        ['client_meeting', 'L110'],
        ['general_work', 'L110']
      ]));
      setValidationRules([
        {
          id: Date.now().toString(),
          field: 'description',
          ruleType: 'required',
          value: true,
          errorMessage: 'Description is required',
          isActive: true
        }
      ]);
    }
  }, [configuration, open]);

  const handleSave = async () => {
    if (!formData.clientName || !formData.format) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const configData = {
        clientId: formData.clientId || `client-${Date.now()}`,
        clientName: formData.clientName,
        format: formData.format as LEDESFormat,
        version: formData.version || '1.0',
        utbmsMapping: {
          activityCodes: utbmsMapping,
          expenseCodes: new Map(),
          taskCodes: new Map(),
          matterCategories: new Map(),
          defaultActivityCode: 'L110' as UTBMSActivityCode,
          defaultExpenseCode: 'E100' as any
        },
        validationRules,
        customFields: [],
        isActive: formData.isActive ?? true
      };

      let savedConfig: LEDESConfiguration;
      if (configuration?.id) {
        savedConfig = await LEDESBillingService.updateConfiguration(configuration.id, configData);
      } else {
        savedConfig = await LEDESBillingService.createConfiguration(configData);
      }

      toast({
        title: "Configuration Saved",
        description: `LEDES configuration for ${formData.clientName} has been saved successfully.`
      });

      onSave?.(savedConfig);
      onClose();
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Error",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMappingChange = (activityType: string, utbmsCode: UTBMSActivityCode) => {
    const newMapping = new Map(utbmsMapping);
    newMapping.set(activityType, utbmsCode);
    setUtbmsMapping(newMapping);
  };

  const addValidationRule = () => {
    const newRule: LEDESValidationRule = {
      id: Date.now().toString(),
      field: 'description',
      ruleType: 'required',
      value: true,
      errorMessage: 'Field is required',
      isActive: true
    };
    setValidationRules([...validationRules, newRule]);
  };

  const updateValidationRule = (id: string, updates: Partial<LEDESValidationRule>) => {
    setValidationRules(rules => 
      rules.map(rule => rule.id === id ? { ...rule, ...updates } : rule)
    );
  };

  const removeValidationRule = (id: string) => {
    setValidationRules(rules => rules.filter(rule => rule.id !== id));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-primary" />
            <span>{configuration ? 'Edit' : 'New'} LEDES Configuration</span>
          </DialogTitle>
          <DialogDescription>
            Configure LEDES billing format settings and UTBMS code mappings for client compliance.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Settings</TabsTrigger>
            <TabsTrigger value="mapping">UTBMS Mapping</TabsTrigger>
            <TabsTrigger value="validation">Validation Rules</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="basic" className="space-y-6 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Configuration Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="clientName">Client Name *</Label>
                      <Input
                        id="clientName"
                        value={formData.clientName}
                        onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                        placeholder="Enter client name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="format">LEDES Format *</Label>
                      <Select 
                        value={formData.format} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, format: value as LEDESFormat }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LEDES1998B">LEDES 1998B</SelectItem>
                          <SelectItem value="LEDES2.0">LEDES 2.0</SelectItem>
                          <SelectItem value="LEDESXML">LEDES XML</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="version">Version</Label>
                      <Input
                        id="version"
                        value={formData.version}
                        onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                        placeholder="1.0"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                      />
                      <Label>Active Configuration</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Format Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {formData.format === 'LEDES1998B' && (
                    <div className="space-y-2">
                      <Badge variant="outline">Standard Format</Badge>
                      <p className="text-sm text-muted-foreground">
                        The original LEDES format with 24 required fields. Widely supported by most e-billing systems.
                      </p>
                      <ul className="text-xs text-muted-foreground list-disc list-inside">
                        <li>Compatible with most corporate clients</li>
                        <li>CSV format with standardized field order</li>
                        <li>UTBMS task and activity codes required</li>
                      </ul>
                    </div>
                  )}
                  {formData.format === 'LEDES2.0' && (
                    <div className="space-y-2">
                      <Badge variant="outline">Enhanced Format</Badge>
                      <p className="text-sm text-muted-foreground">
                        Extended LEDES format with additional fields for detailed billing information.
                      </p>
                      <ul className="text-xs text-muted-foreground list-disc list-inside">
                        <li>Includes additional client and matter fields</li>
                        <li>Enhanced expense tracking capabilities</li>
                        <li>Support for adjustments and discounts</li>
                      </ul>
                    </div>
                  )}
                  {formData.format === 'LEDESXML' && (
                    <div className="space-y-2">
                      <Badge variant="outline">XML Format</Badge>
                      <p className="text-sm text-muted-foreground">
                        XML-based LEDES format for advanced e-billing platforms.
                      </p>
                      <ul className="text-xs text-muted-foreground list-disc list-inside">
                        <li>Structured XML format</li>
                        <li>Enhanced metadata support</li>
                        <li>Better integration with modern systems</li>
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mapping" className="space-y-6 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">UTBMS Activity Code Mapping</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Map your internal activity types to standardized UTBMS activity codes.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activityTypes.map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{label}</div>
                          <div className="text-sm text-muted-foreground">Internal: {key}</div>
                        </div>
                        <div className="w-48">
                          <Select
                            value={utbmsMapping.get(key) || 'L110'}
                            onValueChange={(value) => handleMappingChange(key, value as UTBMSActivityCode)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {utbmsActivities.map(activity => (
                                <SelectItem key={activity.code} value={activity.code}>
                                  <div>
                                    <div className="font-medium">{activity.code}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {activity.description}
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="validation" className="space-y-6 mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Validation Rules</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Define validation rules to ensure data quality and compliance.
                      </p>
                    </div>
                    <Button onClick={addValidationRule} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Rule
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {validationRules.map((rule) => (
                      <div key={rule.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                        <div className="flex-1 grid grid-cols-4 gap-3">
                          <div>
                            <Label className="text-xs">Field</Label>
                            <Select
                              value={rule.field}
                              onValueChange={(value) => updateValidationRule(rule.id, { field: value })}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="description">Description</SelectItem>
                                <SelectItem value="hours">Hours</SelectItem>
                                <SelectItem value="rate">Rate</SelectItem>
                                <SelectItem value="amount">Amount</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Rule Type</Label>
                            <Select
                              value={rule.ruleType}
                              onValueChange={(value) => updateValidationRule(rule.id, { ruleType: value as any })}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="required">Required</SelectItem>
                                <SelectItem value="format">Format</SelectItem>
                                <SelectItem value="range">Range</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Error Message</Label>
                            <Input
                              value={rule.errorMessage}
                              onChange={(e) => updateValidationRule(rule.id, { errorMessage: e.target.value })}
                              className="h-8"
                              placeholder="Error message"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={rule.isActive}
                                onCheckedChange={(checked) => updateValidationRule(rule.id, { isActive: checked })}
                              />
                              {rule.isActive ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeValidationRule(rule.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {validationRules.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No validation rules configured.</p>
                        <p className="text-sm">Click "Add Rule" to create validation rules.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Configuration'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LEDESConfigurationModal;