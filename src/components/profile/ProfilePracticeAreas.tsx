
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Save, X, Scale } from 'lucide-react';
import MultiSelect from '@/components/wizard/MultiSelect';
import { useToast } from '@/hooks/use-toast';

interface PracticeAreasInfo {
  primaryAreas: string[];
  secondaryAreas: string[];
  specializations: string[];
}

const PRACTICE_AREAS = [
  { value: 'corporate', label: 'Corporate Law' },
  { value: 'litigation', label: 'Litigation' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'employment', label: 'Employment Law' },
  { value: 'intellectual-property', label: 'Intellectual Property' },
  { value: 'tax', label: 'Tax Law' },
  { value: 'criminal', label: 'Criminal Law' },
  { value: 'family', label: 'Family Law' },
  { value: 'immigration', label: 'Immigration Law' },
  { value: 'bankruptcy', label: 'Bankruptcy' },
  { value: 'securities', label: 'Securities' },
  { value: 'mergers-acquisitions', label: 'Mergers & Acquisitions' },
  { value: 'environmental', label: 'Environmental Law' },
  { value: 'healthcare', label: 'Healthcare Law' },
  { value: 'privacy', label: 'Privacy & Data Protection' },
  { value: 'compliance', label: 'Regulatory Compliance' },
  { value: 'contracts', label: 'Contract Law' },
  { value: 'antitrust', label: 'Antitrust' },
  { value: 'white-collar', label: 'White Collar Defense' },
  { value: 'other', label: 'Other' },
];

const SPECIALIZATIONS = [
  { value: 'startup-law', label: 'Startup Law' },
  { value: 'venture-capital', label: 'Venture Capital' },
  { value: 'private-equity', label: 'Private Equity' },
  { value: 'fintech', label: 'FinTech' },
  { value: 'blockchain', label: 'Blockchain & Crypto' },
  { value: 'ai-technology', label: 'AI & Technology' },
  { value: 'biotech', label: 'Biotech & Life Sciences' },
  { value: 'energy', label: 'Energy Law' },
  { value: 'media-entertainment', label: 'Media & Entertainment' },
  { value: 'sports-law', label: 'Sports Law' },
  { value: 'aviation', label: 'Aviation Law' },
  { value: 'maritime', label: 'Maritime Law' },
  { value: 'construction', label: 'Construction Law' },
  { value: 'insurance', label: 'Insurance Law' },
  { value: 'gaming', label: 'Gaming & Gambling' },
  { value: 'nonprofit', label: 'Nonprofit Law' },
  { value: 'government', label: 'Government Relations' },
  { value: 'international', label: 'International Law' },
  { value: 'class-action', label: 'Class Action' },
  { value: 'appellate', label: 'Appellate Practice' },
];

const ProfilePracticeAreas: React.FC = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [practiceAreas, setPracticeAreas] = useState<PracticeAreasInfo>({
    primaryAreas: [],
    secondaryAreas: [],
    specializations: [],
  });
  const [editData, setEditData] = useState<PracticeAreasInfo>({
    primaryAreas: [],
    secondaryAreas: [],
    specializations: [],
  });

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('signup-wizard-data');
    if (savedData) {
      try {
        const wizardData = JSON.parse(savedData);
        if (wizardData.practiceAreas) {
          const areas = wizardData.practiceAreas;
          const loadedAreas = {
            primaryAreas: areas.primaryAreas || [],
            secondaryAreas: areas.secondaryAreas || [],
            specializations: areas.specializations || [],
          };
          setPracticeAreas(loadedAreas);
          setEditData(loadedAreas);
        }
      } catch (error) {
        console.error('Failed to load practice areas:', error);
      }
    }
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...practiceAreas });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({ ...practiceAreas });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state and storage
      setPracticeAreas(editData);
      
      // Update the wizard data in localStorage
      const existingData = localStorage.getItem('signup-wizard-data');
      let wizardData = {};
      if (existingData) {
        try {
          wizardData = JSON.parse(existingData);
        } catch (error) {
          console.error('Failed to parse existing wizard data:', error);
        }
      }
      
      const updatedData = {
        ...wizardData,
        practiceAreas: editData,
      };
      
      localStorage.setItem('signup-wizard-data', JSON.stringify(updatedData));
      
      toast({
        title: "Practice areas updated",
        description: "Your practice areas have been updated successfully.",
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update practice areas. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getLabelForValue = (value: string, options: { value: string; label: string }[]) => {
    return options.find(option => option.value === value)?.label || value;
  };

  const hasData = practiceAreas.primaryAreas.length > 0 || 
                  practiceAreas.secondaryAreas.length > 0 || 
                  practiceAreas.specializations.length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Practice Areas
        </CardTitle>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Primary Practice Areas</label>
              <MultiSelect
                label="Primary Practice Areas"
                placeholder="Select your primary practice areas"
                options={PRACTICE_AREAS}
                value={editData.primaryAreas}
                onChange={(value) => setEditData(prev => ({ ...prev, primaryAreas: value }))}
                maxSelections={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Secondary Practice Areas</label>
              <MultiSelect
                label="Secondary Practice Areas"
                placeholder="Select your secondary practice areas"
                options={PRACTICE_AREAS}
                value={editData.secondaryAreas}
                onChange={(value) => setEditData(prev => ({ ...prev, secondaryAreas: value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Specializations</label>
              <MultiSelect
                label="Specializations"
                placeholder="Select your specializations"
                options={SPECIALIZATIONS}
                value={editData.specializations}
                onChange={(value) => setEditData(prev => ({ ...prev, specializations: value }))}
              />
            </div>
          </>
        ) : (
          <>
            {!hasData ? (
              <p className="text-sm text-muted-foreground italic">
                No practice areas information provided.
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Primary Practice Areas</h4>
                  <div className="flex flex-wrap gap-2">
                    {practiceAreas.primaryAreas.length > 0 ? (
                      practiceAreas.primaryAreas.map((area) => (
                        <Badge key={area} variant="default">
                          {getLabelForValue(area, PRACTICE_AREAS)}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">None specified</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Secondary Practice Areas</h4>
                  <div className="flex flex-wrap gap-2">
                    {practiceAreas.secondaryAreas.length > 0 ? (
                      practiceAreas.secondaryAreas.map((area) => (
                        <Badge key={area} variant="outline">
                          {getLabelForValue(area, PRACTICE_AREAS)}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">None specified</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Specializations</h4>
                  <div className="flex flex-wrap gap-2">
                    {practiceAreas.specializations.length > 0 ? (
                      practiceAreas.specializations.map((spec) => (
                        <Badge key={spec} variant="secondary">
                          {getLabelForValue(spec, SPECIALIZATIONS)}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">None specified</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfilePracticeAreas;
