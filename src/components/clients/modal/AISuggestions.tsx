
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Plus } from 'lucide-react';

interface AISuggestionsProps {
  generateAISuggestions: () => void;
  aiSuggestions: string[];
  addSuggestionToTags: (suggestion: string) => void;
  isGenerationDisabled: boolean;
}

const AISuggestions: React.FC<AISuggestionsProps> = ({
  generateAISuggestions,
  aiSuggestions,
  addSuggestionToTags,
  isGenerationDisabled,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Practice Area Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={generateAISuggestions}
            disabled={isGenerationDisabled}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Suggestions
          </Button>

          {aiSuggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Suggested practice areas based on client profile:
              </p>
              <div className="flex flex-wrap gap-2">
                {aiSuggestions.map((suggestion) => (
                  <Badge
                    key={suggestion}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => addSuggestionToTags(suggestion)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AISuggestions;
