import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { WorkflowTemplate, WorkflowCategory, WorkflowFilters } from '@/types/workflow';
import { workflowService } from '@/services/workflowService';
import { 
  Search, 
  Clock, 
  Play, 
  Eye,
  FileText,
  Users,
  Briefcase,
  DollarSign,
  Shield,
  ChevronRight,
  Workflow,
  Upload,
  Download,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowGalleryProps {
  onLaunchWorkflow: (template: WorkflowTemplate) => void;
  onPreviewWorkflow: (template: WorkflowTemplate) => void;
  className?: string;
}

const getCategoryIcon = (category: WorkflowCategory) => {
  switch (category) {
    case 'general':
      return <FileText className="h-4 w-4" />;
    case 'transactional':
      return <Briefcase className="h-4 w-4" />;
    case 'litigation':
      return <Users className="h-4 w-4" />;
    case 'financial':
      return <DollarSign className="h-4 w-4" />;
    case 'compliance':
      return <Shield className="h-4 w-4" />;
    default:
      return <Workflow className="h-4 w-4" />;
  }
};

const getCategoryColor = (category: WorkflowCategory) => {
  switch (category) {
    case 'general':
      return 'text-muted-foreground bg-muted border-border';
    case 'transactional':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'litigation':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'financial':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'compliance':
      return 'text-purple-600 bg-purple-50 border-purple-200';
    default:
      return 'text-muted-foreground bg-muted border-border';
  }
};

const getComplexityColor = (complexity: string) => {
  switch (complexity) {
    case 'simple':
      return 'text-green-700 bg-green-100';
    case 'moderate':
      return 'text-yellow-700 bg-yellow-100';
    case 'complex':
      return 'text-red-700 bg-red-100';
    default:
      return 'text-muted-foreground bg-muted';
  }
};

const getStepTypeIcon = (type: string) => {
  switch (type) {
    case 'upload':
      return <Upload className="h-3 w-3" />;
    case 'analysis':
      return <Search className="h-3 w-3" />;
    case 'generation':
      return <FileText className="h-3 w-3" />;
    case 'review':
      return <CheckCircle className="h-3 w-3" />;
    default:
      return <FileText className="h-3 w-3" />;
  }
};

export const WorkflowGallery: React.FC<WorkflowGalleryProps> = ({
  onLaunchWorkflow,
  onPreviewWorkflow,
  className,
}) => {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<WorkflowTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<WorkflowCategory | 'all'>('all');
  const [selectedComplexity, setSelectedComplexity] = useState<string | 'all'>('all');

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [templates, searchQuery, selectedCategory, selectedComplexity]);

  const loadTemplates = () => {
    const allTemplates = workflowService.getTemplates();
    setTemplates(allTemplates);
  };

  const applyFilters = () => {
    const filters: WorkflowFilters = {};
    
    if (searchQuery) {
      filters.search = searchQuery;
    }
    
    if (selectedCategory !== 'all') {
      filters.category = selectedCategory as WorkflowCategory;
    }
    
    if (selectedComplexity !== 'all') {
      filters.complexity = selectedComplexity as 'simple' | 'moderate' | 'complex';
    }

    const filtered = workflowService.getTemplates(filters);
    setFilteredTemplates(filtered);
  };

  const handleLaunch = (template: WorkflowTemplate) => {
    onLaunchWorkflow(template);
  };

  const handlePreview = (template: WorkflowTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    onPreviewWorkflow(template);
  };

  const categories: Array<{ value: WorkflowCategory | 'all'; label: string; count: number }> = [
    { value: 'all', label: 'All Workflows', count: templates.length },
    { value: 'general', label: 'General Work', count: templates.filter(t => t.category === 'general').length },
    { value: 'transactional', label: 'Transactional', count: templates.filter(t => t.category === 'transactional').length },
    { value: 'litigation', label: 'Litigation', count: templates.filter(t => t.category === 'litigation').length },
    { value: 'financial', label: 'Financial Services', count: templates.filter(t => t.category === 'financial').length },
    { value: 'compliance', label: 'Compliance', count: templates.filter(t => t.category === 'compliance').length },
  ];

  if (templates.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <Workflow className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Workflows Available</h3>
        <p className="text-muted-foreground">
          Workflow templates will appear here when they are created.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <Workflow className="h-8 w-8 text-primary" />
        </div>
        
        <h1 className="text-3xl font-bold text-foreground">
          Legal Workflow Assistant
        </h1>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose from our library of proven legal workflows to streamline your practice. 
          Each workflow guides you step-by-step through complex legal processes.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workflows..."
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <Button
              key={category.value}
              size="sm"
              variant={selectedCategory === category.value ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.value)}
              className="gap-2"
            >
              {category.value !== 'all' && getCategoryIcon(category.value as WorkflowCategory)}
              {category.label}
              <Badge variant="secondary" className="ml-1 text-xs">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>

        <div className="flex gap-2 justify-center">
          <Button
            size="sm"
            variant={selectedComplexity === 'all' ? "default" : "outline"}
            onClick={() => setSelectedComplexity('all')}
          >
            All Complexity
          </Button>
          {['simple', 'moderate', 'complex'].map((complexity) => (
            <Button
              key={complexity}
              size="sm"
              variant={selectedComplexity === complexity ? "default" : "outline"}
              onClick={() => setSelectedComplexity(complexity)}
              className="capitalize"
            >
              {complexity}
            </Button>
          ))}
        </div>
      </div>

      {/* Workflow Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/30 flex flex-col h-full"
            onClick={() => handleLaunch(template)}
          >
            <CardContent className="p-6 flex flex-col flex-1">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge 
                      variant="outline" 
                      className={cn('text-xs px-2.5 py-1 rounded-full', getCategoryColor(template.category))}
                    >
                      {getCategoryIcon(template.category)}
                      <span className="ml-1.5 capitalize">{template.category}</span>
                    </Badge>
                    
                    <Badge 
                      variant="secondary" 
                      className={cn('text-xs px-2.5 py-1 rounded-full', getComplexityColor(template.complexity))}
                    >
                      {template.complexity}
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-3 line-clamp-2 leading-tight">
                    {template.title}
                  </h3>
                  
                  <p className="text-base text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                    {template.description}
                  </p>
                </div>
              </div>

              {/* Workflow Info */}
              <div className="space-y-4 mb-5 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">{template.estimatedTotalTime}</span>
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {template.steps.length} step{template.steps.length !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Step Preview */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Workflow Steps
                  </div>
                  <div className="space-y-2">
                    {template.steps.slice(0, 3).map((step, index) => (
                      <div key={step.id} className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          {getStepTypeIcon(step.type)}
                          <span className="font-medium">{index + 1}.</span>
                        </div>
                        <span className="text-foreground truncate">{step.name}</span>
                      </div>
                    ))}
                    {template.steps.length > 3 && (
                      <div className="text-sm text-muted-foreground pl-7 font-medium">
                        +{template.steps.length - 3} more step{template.steps.length - 3 !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              {template.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {template.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs px-2.5 py-1 rounded-full">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs px-2.5 py-1 rounded-full">
                      +{template.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Actions - Properly contained within card */}
              <div className="flex gap-3 pt-5 mt-auto border-t">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLaunch(template);
                  }}
                  className="flex-1 gap-2"
                  size="default"
                >
                  <Play className="h-4 w-4" />
                  Launch Workflow
                </Button>
                
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreview(template, e);
                  }}
                  variant="outline"
                  className="gap-2"
                  size="default"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredTemplates.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium text-foreground mb-2">No workflows found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or filters to find relevant workflows.
          </p>
        </div>
      )}
    </div>
  );
};