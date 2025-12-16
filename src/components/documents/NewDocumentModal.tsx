import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Plus, 
  Zap, 
  Search, 
  Star,
  Clock,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DocumentCategory, DocumentSubtype, DocumentTemplate } from '@/types/document';
import { documentService } from '@/services/documentService';
import { templateService } from '@/services/templateService';

interface NewDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDocumentCreated?: () => void;
}

const NewDocumentModal: React.FC<NewDocumentModalProps> = ({
  open,
  onOpenChange,
  onDocumentCreated
}) => {
  const [activeTab, setActiveTab] = useState('template');
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<DocumentTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Blank document form
  const [documentName, setDocumentName] = useState('');
  const [documentCategory, setDocumentCategory] = useState<DocumentCategory>('other');
  const [documentSubtype, setDocumentSubtype] = useState<DocumentSubtype>('other');
  const [documentDescription, setDocumentDescription] = useState('');
  
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open]);

  useEffect(() => {
    applyFilters();
  }, [templates, searchQuery]);

  const loadTemplates = async () => {
    try {
      const popularTemplates = await templateService.getPopularTemplates(12);
      setTemplates(popularTemplates);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load templates',
        variant: 'destructive'
      });
    }
  };

  const applyFilters = () => {
    let filtered = templates;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.aiTags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    setFilteredTemplates(filtered);
  };

  const handleTemplateSelect = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setDocumentName(`${template.name} - ${new Date().toLocaleDateString()}`);
    setDocumentCategory(template.category);
    setDocumentSubtype(template.subtype);
    setDocumentDescription(template.description);
  };

  const handleCreateFromTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      setIsLoading(true);
      
      // Create a new document based on the template
      const newDocument = await documentService.createDocument({
        name: documentName || `${selectedTemplate.name} - ${new Date().toLocaleDateString()}`,
        type: 'docx',
        size: 0,
        category: selectedTemplate.category,
        subtype: selectedTemplate.subtype,
        status: 'draft',
        uploadedBy: 'Current User',
        tags: [...selectedTemplate.aiTags],
        description: documentDescription || selectedTemplate.description,
        url: '', // Will be set when document is saved
        isStarred: false,
        sharedWith: [],
        permissions: {
          canEdit: true,
          canDelete: true,
          canShare: true
        },
        metadata: {
          practiceArea: selectedTemplate.practiceArea,
          extractedText: selectedTemplate.content
        },
        version: 1
      });

      toast({
        title: 'Document created',
        description: `New document "${newDocument.name}" created successfully from template`
      });

      // Reset form
      resetForm();
      onOpenChange(false);
      onDocumentCreated?.();

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create document',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBlank = async () => {
    if (!documentName.trim()) {
      toast({
        title: 'Document name required',
        description: 'Please enter a name for your document',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const newDocument = await documentService.createDocument({
        name: documentName,
        type: 'docx',
        size: 0,
        category: documentCategory,
        subtype: documentSubtype,
        status: 'draft',
        uploadedBy: 'Current User',
        tags: [],
        description: documentDescription,
        url: '',
        isStarred: false,
        sharedWith: [],
        permissions: {
          canEdit: true,
          canDelete: true,
          canShare: true
        },
        metadata: {
          practiceArea: getCategoryPracticeArea(documentCategory)
        },
        version: 1
      });

      toast({
        title: 'Document created',
        description: `New blank document "${newDocument.name}" created successfully`
      });

      // Reset form
      resetForm();
      onOpenChange(false);
      onDocumentCreated?.();

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create document',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setActiveTab('template');
    setSelectedTemplate(null);
    setDocumentName('');
    setDocumentCategory('other');
    setDocumentSubtype('other');
    setDocumentDescription('');
    setSearchQuery('');
  };

  const getCategoryPracticeArea = (category: DocumentCategory): string => {
    const practiceAreaMap: Record<string, string> = {
      'corporate_formation': 'Corporate Law',
      'contracts_agreements': 'Contract Law',
      'employment_docs': 'Employment Law',
      'pleadings': 'Litigation',
      'motions': 'Litigation',
      'discovery': 'Litigation',
      'real_estate_purchase': 'Real Estate Law',
      'real_estate_lease': 'Real Estate Law',
      'real_estate_finance': 'Real Estate Law',
      'wills_trusts': 'Estate Planning',
      'powers_of_attorney': 'Estate Planning',
      'healthcare_directives': 'Estate Planning',
      'other': 'General Practice'
    };
    return practiceAreaMap[category] || 'General Practice';
  };

  const formatCategoryName = (category: DocumentCategory) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create New Document</DialogTitle>
          <DialogDescription>
            Create a new document from a template or start from scratch
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="template" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>From Template</span>
            </TabsTrigger>
            <TabsTrigger value="blank" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Blank Document</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="space-y-4">
            {/* Template Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {filteredTemplates.map((template) => (
                <Card 
                  key={template.id} 
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm">{template.name}</CardTitle>
                      <div className="flex items-center space-x-1">
                        {template.isPopular && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {formatCategoryName(template.category)}
                      </Badge>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{template.usageCount}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{template.fields.length} fields</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Selected Template Details */}
            {selectedTemplate && (
              <div className="space-y-4 border-t pt-4">
                <div>
                  <Label htmlFor="template-name">Document Name</Label>
                  <Input
                    id="template-name"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    placeholder="Enter document name"
                  />
                </div>
                <div>
                  <Label htmlFor="template-description">Description (Optional)</Label>
                  <Textarea
                    id="template-description"
                    value={documentDescription}
                    onChange={(e) => setDocumentDescription(e.target.value)}
                    placeholder="Enter document description"
                    rows={2}
                  />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="blank" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="blank-name">Document Name</Label>
                <Input
                  id="blank-name"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="Enter document name"
                />
              </div>

              <div>
                <Label htmlFor="blank-category">Category</Label>
                <Select value={documentCategory} onValueChange={(value) => setDocumentCategory(value as DocumentCategory)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contracts_agreements">Contracts & Agreements</SelectItem>
                    <SelectItem value="corporate_formation">Corporate Formation</SelectItem>
                    <SelectItem value="employment_docs">Employment Documents</SelectItem>
                    <SelectItem value="pleadings">Pleadings</SelectItem>
                    <SelectItem value="motions">Motions</SelectItem>
                    <SelectItem value="real_estate_purchase">Real Estate</SelectItem>
                    <SelectItem value="wills_trusts">Wills & Trusts</SelectItem>
                    <SelectItem value="patents">Intellectual Property</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="blank-subtype">Subtype</Label>
                <Select value={documentSubtype} onValueChange={(value) => setDocumentSubtype(value as DocumentSubtype)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subtype" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nda">NDA</SelectItem>
                    <SelectItem value="service_agreement">Service Agreement</SelectItem>
                    <SelectItem value="employment_contract">Employment Contract</SelectItem>
                    <SelectItem value="motion_to_dismiss">Motion to Dismiss</SelectItem>
                    <SelectItem value="last_will_testament">Last Will & Testament</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="blank-description">Description (Optional)</Label>
                <Textarea
                  id="blank-description"
                  value={documentDescription}
                  onChange={(e) => setDocumentDescription(e.target.value)}
                  placeholder="Enter document description"
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {activeTab === 'template' ? (
            <Button 
              onClick={handleCreateFromTemplate} 
              disabled={!selectedTemplate || isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create from Template
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={handleCreateBlank} 
              disabled={!documentName.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Blank Document
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewDocumentModal;