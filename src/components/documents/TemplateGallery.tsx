import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  Search, 
  Filter, 
  Star, 
  Clock, 
  Users, 
  Zap, 
  Eye, 
  Download,
  Plus,
  TrendingUp,
  Grid,
  List,
  ChevronRight,
  Building,
  Briefcase,
  Scale,
  Home,
  Heart,
  Shield,
  Globe,
  Gavel,
  FileCheck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  DocumentTemplate, 
  DocumentCategory, 
  DocumentSubtype, 
  TemplateField 
} from '@/types/document';
import { templateService } from '@/services/templateService';
import { cn } from '@/lib/utils';

interface TemplateFilters {
  category?: DocumentCategory;
  subtype?: DocumentSubtype;
  jurisdiction?: string;
  practiceArea?: string;
  search?: string;
  isPopular?: boolean;
}

const TemplateGallery = () => {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<DocumentTemplate[]>([]);
  const [templatesByCategory, setTemplatesByCategory] = useState<Record<DocumentCategory, DocumentTemplate[]>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showUseTemplate, setShowUseTemplate] = useState(false);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState<TemplateFilters>({});
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [templates, filters]);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      
      // Seed mock templates for development
      await templateService.seedMockTemplates();
      
      const [allTemplates, categorizedTemplates] = await Promise.all([
        templateService.getTemplates({ isActive: true }),
        templateService.getTemplatesByCategory()
      ]);

      setTemplates(allTemplates);
      setTemplatesByCategory(categorizedTemplates);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load templates',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = templates;

    if (filters.category) {
      filtered = filtered.filter(t => t.category === filters.category);
    }

    if (filters.subtype) {
      filtered = filtered.filter(t => t.subtype === filters.subtype);
    }

    if (filters.jurisdiction) {
      filtered = filtered.filter(t => t.jurisdiction === filters.jurisdiction);
    }

    if (filters.practiceArea) {
      filtered = filtered.filter(t => t.practiceArea === filters.practiceArea);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchTerm) ||
        t.description.toLowerCase().includes(searchTerm) ||
        t.aiTags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    if (filters.isPopular) {
      filtered = filtered.filter(t => t.isPopular);
    }

    setFilteredTemplates(filtered);
  };

  const handleUseTemplate = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setFieldValues({});
    setShowUseTemplate(true);
  };

  const handlePreviewTemplate = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const handleGenerateDocument = async () => {
    if (!selectedTemplate) return;

    try {
      const validation = await templateService.validateTemplateFields(
        selectedTemplate.id,
        fieldValues
      );

      if (!validation.isValid) {
        toast({
          title: 'Validation Error',
          description: validation.errors.join(', '),
          variant: 'destructive'
        });
        return;
      }

      const generatedContent = await templateService.generateDocumentFromTemplate(
        selectedTemplate.id,
        fieldValues
      );

      // Create a new document with the generated content
      toast({
        title: 'Document Generated',
        description: 'Your document has been created successfully',
      });

      setShowUseTemplate(false);
      setSelectedTemplate(null);
      setFieldValues({});
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate document',
        variant: 'destructive'
      });
    }
  };

  const getCategoryIcon = (category: DocumentCategory) => {
    const iconMap = {
      'corporate_formation': Building,
      'contracts_agreements': FileText,
      'employment_docs': Users,
      'pleadings': Gavel,
      'motions': Scale,
      'discovery': Search,
      'real_estate_purchase': Home,
      'real_estate_lease': Home,
      'real_estate_finance': Home,
      'wills_trusts': FileCheck,
      'powers_of_attorney': FileCheck,
      'healthcare_directives': Heart,
      'divorce_separation': Users,
      'custody_support': Users,
      'prenuptial_postnuptial': Heart,
      'patents': Shield,
      'trademarks': Shield,
      'copyrights': Shield,
      'criminal_law': Gavel,
      'immigration': Globe,
      'bankruptcy': Briefcase,
      'regulatory_compliance': Shield,
      'legal_correspondence': FileText,
      'alternative_dispute_resolution': Scale,
      'contract': FileText,
      'brief': FileText,
      'correspondence': FileText,
      'research': Search,
      'evidence': FileCheck,
      'other': FileText
    };
    return iconMap[category] || FileText;
  };

  const getCategoryColor = (category: DocumentCategory) => {
    const colorMap = {
      'corporate_formation': 'bg-blue-100 text-blue-700 border-blue-200',
      'contracts_agreements': 'bg-green-100 text-green-700 border-green-200',
      'employment_docs': 'bg-purple-100 text-purple-700 border-purple-200',
      'pleadings': 'bg-red-100 text-red-700 border-red-200',
      'motions': 'bg-orange-100 text-orange-700 border-orange-200',
      'discovery': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'real_estate_purchase': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'real_estate_lease': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'real_estate_finance': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'wills_trusts': 'bg-teal-100 text-teal-700 border-teal-200',
      'powers_of_attorney': 'bg-teal-100 text-teal-700 border-teal-200',
      'healthcare_directives': 'bg-pink-100 text-pink-700 border-pink-200',
      'divorce_separation': 'bg-rose-100 text-rose-700 border-rose-200',
      'custody_support': 'bg-rose-100 text-rose-700 border-rose-200',
      'prenuptial_postnuptial': 'bg-pink-100 text-pink-700 border-pink-200',
      'patents': 'bg-cyan-100 text-cyan-700 border-cyan-200',
      'trademarks': 'bg-cyan-100 text-cyan-700 border-cyan-200',
      'copyrights': 'bg-cyan-100 text-cyan-700 border-cyan-200',
      'criminal_law': 'bg-red-100 text-red-700 border-red-200',
      'immigration': 'bg-blue-100 text-blue-700 border-blue-200',
      'bankruptcy': 'bg-gray-100 text-gray-700 border-gray-200',
      'regulatory_compliance': 'bg-green-100 text-green-700 border-green-200',
      'legal_correspondence': 'bg-gray-100 text-gray-700 border-gray-200',
      'alternative_dispute_resolution': 'bg-purple-100 text-purple-700 border-purple-200',
      'contract': 'bg-green-100 text-green-700 border-green-200',
      'brief': 'bg-red-100 text-red-700 border-red-200',
      'correspondence': 'bg-gray-100 text-gray-700 border-gray-200',
      'research': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'evidence': 'bg-orange-100 text-orange-700 border-orange-200',
      'other': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colorMap[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const formatCategoryName = (category: DocumentCategory) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const TemplateCard = ({ template }: { template: DocumentTemplate }) => {
    const CategoryIcon = getCategoryIcon(template.category);
    
    return (
      <Card className="hover:shadow-md transition-all duration-200 h-full group">
        <CardContent className="p-3">
          {/* Header with icon, title, and badges */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-start space-x-2 flex-1 min-w-0">
              <CategoryIcon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-sm leading-tight truncate">{template.name}</h3>
                <Badge variant="outline" className={cn("text-xs mt-1", getCategoryColor(template.category))}>
                  {formatCategoryName(template.category)}
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              {template.isPopular && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  <Star className="h-3 w-3 fill-current" />
                </Badge>
              )}
            </div>
          </div>
          
          {/* Description */}
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
            {template.description}
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>{template.usageCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{template.fields.length}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xs text-muted-foreground">★ {template.rating}</span>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex space-x-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePreviewTemplate(template)}
              className="flex-1 h-7 text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </Button>
            <Button
              size="sm"
              onClick={() => handleUseTemplate(template)}
              className="flex-1 h-7 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Use
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderTemplateField = (field: TemplateField) => {
    const value = fieldValues[field.id] || field.defaultValue || '';
    
    switch (field.type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => setFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))}
            placeholder={field.placeholder}
            required={field.required}
          />
        );
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => setFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))}
            placeholder={field.placeholder}
            required={field.required}
            rows={3}
          />
        );
      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(newValue) => setFieldValues(prev => ({ ...prev, [field.id]: newValue }))}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => setFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))}
            placeholder={field.placeholder}
            required={field.required}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => setFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))}
            required={field.required}
          />
        );
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={value === 'true' || value === true}
              onChange={(e) => setFieldValues(prev => ({ ...prev, [field.id]: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <span className="text-sm">{field.placeholder}</span>
          </div>
        );
      default:
        return (
          <Input
            value={value}
            onChange={(e) => setFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))}
            placeholder={field.placeholder}
            required={field.required}
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Template Gallery</h1>
          <p className="text-muted-foreground mt-1">
            Browse and use professional legal document templates
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="search">Search Templates</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search templates..."
                    value={filters.search || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label>Category</Label>
                <Select
                  value={filters.category || 'all'}
                  onValueChange={(value) => setFilters(prev => ({ 
                    ...prev, 
                    category: value === 'all' ? undefined : value as DocumentCategory 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="contracts_agreements">Contracts & Agreements</SelectItem>
                    <SelectItem value="corporate_formation">Corporate Formation</SelectItem>
                    <SelectItem value="employment_docs">Employment Documents</SelectItem>
                    <SelectItem value="pleadings">Pleadings</SelectItem>
                    <SelectItem value="motions">Motions</SelectItem>
                    <SelectItem value="real_estate_purchase">Real Estate</SelectItem>
                    <SelectItem value="wills_trusts">Wills & Trusts</SelectItem>
                    <SelectItem value="patents">Intellectual Property</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Practice Area</Label>
                <Select
                  value={filters.practiceArea || 'all'}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, practiceArea: value === 'all' ? undefined : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Practice Areas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Practice Areas</SelectItem>
                    <SelectItem value="Contract Law">Contract Law</SelectItem>
                    <SelectItem value="Corporate Law">Corporate Law</SelectItem>
                    <SelectItem value="Employment Law">Employment Law</SelectItem>
                    <SelectItem value="Litigation">Litigation</SelectItem>
                    <SelectItem value="Real Estate Law">Real Estate Law</SelectItem>
                    <SelectItem value="Estate Planning">Estate Planning</SelectItem>
                    <SelectItem value="Intellectual Property">Intellectual Property</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => setFilters({})}
                className="w-full"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Templates Grid */}
        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Templates</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className={cn(
                "grid gap-4",
                viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
              )}>
                {filteredTemplates.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="popular" className="space-y-4">
              <div className={cn(
                "grid gap-4",
                viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
              )}>
                {filteredTemplates.filter(t => t.isPopular).map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recent" className="space-y-4">
              <div className={cn(
                "grid gap-4",
                viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
              )}>
                {filteredTemplates.slice(0, 10).map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Template Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              {selectedTemplate?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className={getCategoryColor(selectedTemplate.category)}>
                  {formatCategoryName(selectedTemplate.category)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {selectedTemplate.fields.length} fields
                </span>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Template Preview</h4>
                <pre className="text-sm whitespace-pre-wrap text-muted-foreground max-h-60 overflow-y-auto">
                  {selectedTemplate.content.substring(0, 1000)}...
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Required Fields</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedTemplate.fields.map((field) => (
                    <div key={field.id} className="text-sm">
                      <span className="font-medium">{field.name}</span>
                      {field.required && <span className="text-red-500">*</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setShowPreview(false);
              if (selectedTemplate) handleUseTemplate(selectedTemplate);
            }}>
              Use Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Use Template Dialog */}
      <Dialog open={showUseTemplate} onOpenChange={setShowUseTemplate}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Use Template: {selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              Fill in the required fields to generate your document
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <ScrollArea className="max-h-96">
              <div className="space-y-4">
                {selectedTemplate.fields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id}>
                      {field.name}
                      {field.required && <span className="text-red-500">*</span>}
                    </Label>
                    {renderTemplateField(field)}
                    {field.validation && (
                      <p className="text-xs text-muted-foreground">
                        {field.validation.pattern && `Pattern: ${field.validation.pattern}`}
                        {field.validation.minLength && ` Min length: ${field.validation.minLength}`}
                        {field.validation.maxLength && ` Max length: ${field.validation.maxLength}`}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUseTemplate(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateDocument}>
              Generate Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplateGallery;