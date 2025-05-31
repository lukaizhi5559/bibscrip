import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Book, Brain } from 'lucide-react';

interface Commentary {
  id: string;
  name: string;
  shortName: string;
  description: string;
  years: string;
  enabled: boolean;
}

interface CommentaryToggleProps {
  passage?: string;
  onCommentaryChange?: (enabledCommentaries: string[]) => void;
  initialCommentaries?: Commentary[];
}

/**
 * Component that allows users to toggle which Biblical commentaries to include
 */
export function CommentaryToggle({
  passage,
  onCommentaryChange,
  initialCommentaries,
}: CommentaryToggleProps) {
  // Default list of available commentaries
  const defaultCommentaries: Commentary[] = [
    {
      id: 'matthew-henry',
      name: 'Matthew Henry Commentary',
      shortName: 'Matthew Henry',
      description: 'Complete commentary from the 17th-18th century',
      years: '1708-1710',
      enabled: true,
    },
    {
      id: 'john-gill',
      name: 'John Gill\'s Exposition',
      shortName: 'John Gill',
      description: 'Verse by verse exposition with Hebrew/Greek insights',
      years: '1746-1763',
      enabled: false,
    },
    {
      id: 'geneva-bible',
      name: 'Geneva Bible Notes',
      shortName: 'Geneva Bible',
      description: 'Protestant reformation study notes',
      years: '1560',
      enabled: false,
    },
    {
      id: 'albert-barnes',
      name: 'Barnes\' Notes on the Bible',
      shortName: 'Albert Barnes',
      description: 'Comprehensive study notes for students & pastors',
      years: '1834-1885',
      enabled: false,
    },
    {
      id: 'ai-balanced',
      name: 'AI-Generated Balanced View',
      shortName: 'AI Balanced',
      description: 'Modern synthesis using large language models',
      years: 'Current',
      enabled: true,
    },
  ];
  
  const [commentaries, setCommentaries] = useState<Commentary[]>(
    initialCommentaries || defaultCommentaries
  );
  const [expanded, setExpanded] = useState(false);
  
  // Toggle a specific commentary on/off
  const toggleCommentary = (id: string) => {
    const updatedCommentaries = commentaries.map(commentary => 
      commentary.id === id 
        ? { ...commentary, enabled: !commentary.enabled } 
        : commentary
    );
    
    setCommentaries(updatedCommentaries);
    
    // Call the callback with the IDs of enabled commentaries
    if (onCommentaryChange) {
      const enabledIds = updatedCommentaries
        .filter(c => c.enabled)
        .map(c => c.id);
      
      onCommentaryChange(enabledIds);
    }
  };
  
  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <Book className="h-5 w-5" />
            Commentary Sources
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setExpanded(!expanded)}
            className="h-8 w-8 p-0"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        <CardDescription>
          Select which Bible commentaries to include in your results
        </CardDescription>
      </CardHeader>
      
      <CardContent className={`pt-0 ${expanded ? 'block' : 'hidden'}`}>
        <div className="space-y-3">
          {commentaries.map(commentary => (
            <div 
              key={commentary.id} 
              className="flex items-center justify-between py-2 border-b border-muted last:border-0"
            >
              <div>
                <div className="flex items-center gap-2">
                  {commentary.id === 'ai-balanced' ? (
                    <Brain className="h-4 w-4 text-primary" />
                  ) : (
                    <Book className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Label 
                    htmlFor={`toggle-${commentary.id}`}
                    className="font-medium cursor-pointer"
                  >
                    {commentary.shortName}
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  {commentary.description} ({commentary.years})
                </p>
              </div>
              
              <Switch
                id={`toggle-${commentary.id}`}
                checked={commentary.enabled}
                onCheckedChange={() => toggleCommentary(commentary.id)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
