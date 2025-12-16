
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Mic, Send, Sparkles, Briefcase, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BillingService } from '@/services/billingService';
import { useToast } from '@/components/ui/use-toast';

const NaturalTimeEntry = () => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [matters, setMatters] = useState<Array<{
    id: string;
    title: string;
    clientName: string;
    practiceArea: string;
    hourlyRate?: number;
  }>>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadMatters();
  }, []);

  const loadMatters = async () => {
    try {
      const mattersList = await BillingService.getMattersForTimeEntry();
      setMatters(mattersList);
    } catch (error) {
      console.error('Error loading matters:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // AI parsing simulation
    const parsed = parseNaturalLanguage(input);
    setSuggestions([parsed]);
    setInput('');
  };

  const parseNaturalLanguage = (text: string) => {
    // Enhanced parsing using real matter data
    const hoursMatch = text.match(/(\d+\.?\d*)\s*(hours?|hrs?|h)/i);
    
    // Try to match against real matter titles and client names
    let bestMatch = null;
    let highestScore = 0;
    
    matters.forEach(matter => {
      const titleWords = matter.title.toLowerCase().split(' ');
      const clientWords = matter.clientName.toLowerCase().split(' ');
      const practiceWords = matter.practiceArea.toLowerCase().split(' ');
      
      let score = 0;
      const inputLower = text.toLowerCase();
      
      // Check for title word matches
      titleWords.forEach(word => {
        if (word.length > 3 && inputLower.includes(word)) {
          score += 3;
        }
      });
      
      // Check for client name matches
      clientWords.forEach(word => {
        if (word.length > 3 && inputLower.includes(word)) {
          score += 2;
        }
      });
      
      // Check for practice area matches
      practiceWords.forEach(word => {
        if (word.length > 3 && inputLower.includes(word)) {
          score += 1;
        }
      });
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = matter;
      }
    });
    
    return {
      description: text,
      hours: hoursMatch ? parseFloat(hoursMatch[1]) : 1,
      matter: bestMatch,
      confidence: highestScore > 0 ? Math.min(0.95, 0.5 + (highestScore * 0.1)) : 0.3,
      matchScore: highestScore
    };
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    // Voice recognition would be implemented here
  };

  const applySuggestion = async (suggestion: any) => {
    if (!suggestion.matter) {
      toast({
        title: "No matter matched",
        description: "Please select a matter manually for this time entry.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await BillingService.createTimeEntry({
        matterId: suggestion.matter.id,
        matterTitle: suggestion.matter.title,
        clientId: '',
        clientName: suggestion.matter.clientName,
        description: suggestion.description,
        hours: suggestion.hours,
        rate: suggestion.matter.hourlyRate || 350,
        amount: suggestion.hours * (suggestion.matter.hourlyRate || 350),
        date: new Date().toISOString().split('T')[0],
        status: 'draft',
        billable: true,
        activityType: 'general_work',
        tags: ['ai-suggested', 'natural-language']
      });
      
      toast({
        title: "Time entry created",
        description: `${suggestion.hours} hours recorded for ${suggestion.matter.title}`
      });
      
      setSuggestions([]);
    } catch (error) {
      console.error('Error creating time entry:', error);
      toast({
        title: "Error creating entry",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span>Natural Language Time Entry</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., 'worked 2.5 hours on Smith contract reviewing terms'"
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={toggleListening}
              className={isListening ? 'bg-red-50 border-red-200' : ''}
            >
              <Mic className={`h-4 w-4 ${isListening ? 'text-red-500' : ''}`} />
            </Button>
            <Button type="submit" disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {isListening && (
            <div className="text-center text-sm text-muted-foreground">
              🎤 Listening... Speak your time entry
            </div>
          )}
        </form>

        {suggestions.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="font-medium">AI Suggestions:</h4>
            {suggestions.map((suggestion, index) => (
              <Card key={index} className="p-4 border border-primary/20">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {Math.round(suggestion.confidence * 100)}% confidence
                      </Badge>
                      <Badge variant="secondary">{suggestion.hours} hours</Badge>
                      {suggestion.matter && (
                        <Badge variant="default">
                          ${suggestion.matter.hourlyRate || 350}/hr
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm">{suggestion.description}</p>
                    {suggestion.matter ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs">
                          <Briefcase className="h-3 w-3" />
                          <Link 
                            to={`/dashboard/matters/${suggestion.matter.id}`}
                            className="font-medium hover:text-primary hover:underline flex items-center gap-1"
                          >
                            {suggestion.matter.title}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Client: {suggestion.matter.clientName} • {suggestion.matter.practiceArea}
                        </p>
                        <p className="text-xs text-green-600">
                          Total: ${(suggestion.hours * (suggestion.matter.hourlyRate || 350)).toFixed(2)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-red-500">
                        No matter matched - please select manually
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => applySuggestion(suggestion)}
                  >
                    Apply
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <h5 className="text-sm font-medium mb-2">Examples:</h5>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• "worked 3 hours on contract review for Acme Corp"</li>
            <li>• "spent 45 minutes in client call about employment matter"</li>
            <li>• "2.5 hours drafting motion for Smith case"</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default NaturalTimeEntry;
