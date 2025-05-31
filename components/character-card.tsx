import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, Book, Heart, Users, BarChart, ExternalLink } from 'lucide-react';
import { ReferenceLinks } from '@/components/reference-links';

interface CharacterRelationship {
  name: string;
  relationship: string;
}

interface CharacterVerse {
  reference: string;
  text: string;
  context: string;
}

interface CharacterEvent {
  title: string;
  description: string;
  references: string[];
}

interface CharacterCardProps {
  name: string;
  hebrewName?: string;
  greekName?: string;
  description: string;
  timeline?: string;
  bookAppearances?: string[];
  keyTraits?: string[];
  relationships?: CharacterRelationship[];
  keyVerses?: CharacterVerse[];
  keyEvents?: CharacterEvent[];
}

/**
 * Component that displays a Bible character profile with key information
 */
export function CharacterCard({
  name,
  hebrewName,
  greekName,
  description,
  timeline,
  bookAppearances = [],
  keyTraits = [],
  relationships = [],
  keyVerses = [],
  keyEvents = [],
}: CharacterCardProps) {
  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <User className="h-5 w-5" />
              {name}
            </CardTitle>
            {(hebrewName || greekName) && (
              <CardDescription className="mt-1">
                {hebrewName && `Hebrew: ${hebrewName}`} 
                {hebrewName && greekName && ' • '} 
                {greekName && `Greek: ${greekName}`}
              </CardDescription>
            )}
          </div>
          
          {timeline && (
            <Badge variant="outline" className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {timeline}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Character Description */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p>{description}</p>
        </div>
        
        {/* Key Traits */}
        {keyTraits.length > 0 && (
          <div>
            <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4" />
              Key Traits
            </h3>
            <div className="flex flex-wrap gap-2">
              {keyTraits.map(trait => (
                <Badge key={trait} variant="secondary">
                  {trait}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Relationships */}
        {relationships.length > 0 && (
          <div>
            <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
              <Users className="h-4 w-4" />
              Key Relationships
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {relationships.map(relation => (
                <div 
                  key={relation.name} 
                  className="flex items-center justify-between p-2 border border-muted rounded-md"
                >
                  <span className="font-medium">{relation.name}</span>
                  <Badge variant="outline">{relation.relationship}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Books Where They Appear */}
        {bookAppearances.length > 0 && (
          <div>
            <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
              <Book className="h-4 w-4" />
              Books Where {name} Appears
            </h3>
            <div className="flex flex-wrap gap-2">
              {bookAppearances.map(book => (
                <Badge key={book} variant="outline">
                  {book}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Key Events Timeline */}
        {keyEvents.length > 0 && (
          <div>
            <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
              <BarChart className="h-4 w-4" />
              Key Events
            </h3>
            <div className="space-y-3">
              {keyEvents.map((event, index) => (
                <div key={index} className="relative pl-6 pb-4 border-l-2 border-muted">
                  <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-background border-2 border-primary" />
                  <h4 className="font-medium">{event.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                  
                  {event.references.length > 0 && (
                    <div className="mt-2">
                      {event.references.map(ref => (
                        <Badge key={ref} variant="secondary" className="mr-2 mb-2">
                          {ref}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Key Verses */}
        {keyVerses.length > 0 && (
          <div>
            <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
              <Book className="h-4 w-4" />
              Key Scripture References
            </h3>
            <div className="space-y-3">
              {keyVerses.map(verse => (
                <div key={verse.reference} className="border border-muted rounded-md p-3">
                  <h4 className="font-medium">{verse.reference}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{verse.context}</p>
                  <blockquote className="mt-2 pl-4 border-l-2 border-muted-foreground/30 italic">
                    {verse.text}
                  </blockquote>
                  <div className="mt-2">
                    <ReferenceLinks passage={verse.reference} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-muted">
          <Button variant="secondary">
            Learn More About {name}
          </Button>
          <Button variant="outline">
            <ExternalLink className="h-4 w-4 mr-2" />
            Historical Context
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
