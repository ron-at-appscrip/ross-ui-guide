import React, { useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Settings, 
  Search, 
  Filter, 
  ExternalLink, 
  TrendingUp,
  Users,
  Globe,
  MessageSquare,
  Network,
  Mail,
  Phone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LeadSource, LeadSourceCategory } from '@/types/lead';
import { LeadService } from '@/services/leadService';

interface LeadSourceSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  showCreateButton?: boolean;
  showAnalytics?: boolean;
  compact?: boolean;
}

/**
 * LeadSourceSelector - Comprehensive lead source selection component
 */
export const LeadSourceSelector: React.FC<LeadSourceSelectorProps> = ({
  value,
  onValueChange,
  className,
  placeholder = "Select lead source...",
  disabled = false,
  showCreateButton = true,
  showAnalytics = false,
  compact = false
}) => {
  const [leadSources, setLeadSources] = useState<LeadSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LeadSourceCategory | 'all'>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showManageDialog, setShowManageDialog] = useState(false);

  // Load lead sources on mount
  useEffect(() => {
    loadLeadSources();
  }, []);

  const loadLeadSources = async () => {
    setLoading(true);
    try {
      const sources = await LeadService.getLeadSources();
      setLeadSources(sources);
    } catch (error) {
      console.error('Error loading lead sources:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter sources based on search and category
  const filteredSources = leadSources.filter(source => {
    const matchesSearch = source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         source.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || source.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get icon for category
  const getCategoryIcon = (category: LeadSourceCategory) => {
    switch (category) {
      case 'referral':
        return <Users className="h-4 w-4" />;
      case 'organic':
        return <Globe className="h-4 w-4" />;
      case 'advertising':
        return <TrendingUp className="h-4 w-4" />;
      case 'marketing':
        return <Mail className="h-4 w-4" />;
      case 'social_media':
        return <MessageSquare className="h-4 w-4" />;
      case 'networking':
        return <Network className="h-4 w-4" />;
      default:
        return <Phone className="h-4 w-4" />;
    }
  };

  // Get category color
  const getCategoryColor = (category: LeadSourceCategory) => {
    switch (category) {
      case 'referral':
        return 'text-emerald-600 bg-emerald-50';
      case 'organic':
        return 'text-green-600 bg-green-50';
      case 'advertising':
        return 'text-purple-600 bg-purple-50';
      case 'marketing':
        return 'text-pink-600 bg-pink-50';
      case 'social_media':
        return 'text-sky-600 bg-sky-50';
      case 'networking':
        return 'text-amber-600 bg-amber-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Group sources by category
  const groupedSources = filteredSources.reduce((acc, source) => {
    if (!acc[source.category]) {
      acc[source.category] = [];
    }
    acc[source.category].push(source);
    return acc;
  }, {} as Record<LeadSourceCategory, LeadSource[]>);

  if (compact) {
    return (
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className={cn('w-full', className)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {filteredSources.map(source => (
            <SelectItem key={source.id} value={source.name}>
              <div className="flex items-center gap-2">
                {getCategoryIcon(source.category)}
                <span>{source.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Select value={value} onValueChange={onValueChange} disabled={disabled}>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="w-80">
              <div className="p-2 space-y-2">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search sources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-1">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                  >
                    All
                  </Button>
                  {(['referral', 'organic', 'advertising', 'marketing', 'social_media', 'networking'] as LeadSourceCategory[]).map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="text-xs"
                    >
                      {category.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Sources grouped by category */}
              <div className="max-h-64 overflow-y-auto">
                {Object.entries(groupedSources).map(([category, sources]) => (
                  <div key={category} className="p-2">
                    <div className="flex items-center gap-2 mb-2">
                      {getCategoryIcon(category as LeadSourceCategory)}
                      <span className="text-sm font-medium capitalize">
                        {category.replace('_', ' ')}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {sources.length}
                      </Badge>
                    </div>
                    {sources.map(source => (
                      <SelectItem key={source.id} value={source.name}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              'w-2 h-2 rounded-full',
                              getCategoryColor(source.category).split(' ')[0].replace('text-', 'bg-')
                            )} />
                            <div>
                              <div className="font-medium">{source.name}</div>
                              {source.description && (
                                <div className="text-xs text-gray-500 truncate max-w-48">
                                  {source.description}
                                </div>
                              )}
                            </div>
                          </div>
                          {showAnalytics && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <TrendingUp className="h-3 w-3" />
                              <span>32%</span>
                            </div>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </div>

              {/* Footer Actions */}
              <div className="border-t p-2 flex items-center justify-between">
                {showCreateButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateDialog(true)}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Create Source
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowManageDialog(true)}
                  className="flex items-center gap-1"
                >
                  <Settings className="h-4 w-4" />
                  Manage
                </Button>
              </div>
            </SelectContent>
          </Select>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1">
          {showCreateButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowManageDialog(true)}
            className="flex items-center gap-1"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Create Lead Source Dialog */}
      <CreateLeadSourceDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreated={loadLeadSources}
      />

      {/* Manage Lead Sources Dialog */}
      <ManageLeadSourcesDialog
        open={showManageDialog}
        onOpenChange={setShowManageDialog}
        sources={leadSources}
        onUpdated={loadLeadSources}
      />
    </div>
  );
};

/**
 * CreateLeadSourceDialog - Dialog for creating new lead sources
 */
interface CreateLeadSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const CreateLeadSourceDialog: React.FC<CreateLeadSourceDialogProps> = ({
  open,
  onOpenChange,
  onCreated
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'other' as LeadSourceCategory,
    description: '',
    trackingCode: '',
    costPerLead: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await LeadService.createLeadSource({
        name: formData.name,
        category: formData.category,
        description: formData.description,
        trackingCode: formData.trackingCode || undefined,
        costPerLead: formData.costPerLead ? parseFloat(formData.costPerLead) : undefined,
        isActive: true
      });

      onCreated();
      onOpenChange(false);
      setFormData({
        name: '',
        category: 'other',
        description: '',
        trackingCode: '',
        costPerLead: ''
      });
    } catch (error) {
      console.error('Error creating lead source:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Lead Source</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Source Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., LinkedIn Ads"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as LeadSourceCategory }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="organic">Organic</SelectItem>
                <SelectItem value="advertising">Advertising</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="social_media">Social Media</SelectItem>
                <SelectItem value="networking">Networking</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this lead source..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="trackingCode">Tracking Code</Label>
              <Input
                id="trackingCode"
                value={formData.trackingCode}
                onChange={(e) => setFormData(prev => ({ ...prev, trackingCode: e.target.value }))}
                placeholder="UTM or tracking code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="costPerLead">Cost per Lead</Label>
              <Input
                id="costPerLead"
                type="number"
                step="0.01"
                value={formData.costPerLead}
                onChange={(e) => setFormData(prev => ({ ...prev, costPerLead: e.target.value }))}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Source'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

/**
 * ManageLeadSourcesDialog - Dialog for managing existing lead sources
 */
interface ManageLeadSourcesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sources: LeadSource[];
  onUpdated: () => void;
}

const ManageLeadSourcesDialog: React.FC<ManageLeadSourcesDialogProps> = ({
  open,
  onOpenChange,
  sources,
  onUpdated
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LeadSourceCategory | 'all'>('all');

  const filteredSources = sources.filter(source => {
    const matchesSearch = source.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || source.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: LeadSourceCategory) => {
    switch (category) {
      case 'referral':
        return <Users className="h-4 w-4" />;
      case 'organic':
        return <Globe className="h-4 w-4" />;
      case 'advertising':
        return <TrendingUp className="h-4 w-4" />;
      case 'marketing':
        return <Mail className="h-4 w-4" />;
      case 'social_media':
        return <MessageSquare className="h-4 w-4" />;
      case 'networking':
        return <Network className="h-4 w-4" />;
      default:
        return <Phone className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Lead Sources</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search sources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as LeadSourceCategory | 'all')}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="organic">Organic</SelectItem>
                <SelectItem value="advertising">Advertising</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="social_media">Social Media</SelectItem>
                <SelectItem value="networking">Networking</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sources List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredSources.map(source => (
              <div
                key={source.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  {getCategoryIcon(source.category)}
                  <div>
                    <div className="font-medium">{source.name}</div>
                    {source.description && (
                      <div className="text-sm text-gray-500">{source.description}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {source.category.replace('_', ' ')}
                  </Badge>
                  <Badge variant={source.isActive ? 'default' : 'secondary'} className="text-xs">
                    {source.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadSourceSelector;