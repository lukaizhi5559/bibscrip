import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExpandableTextProps {
  text: string;
  maxLength?: number;
  className?: string;
  textClassName?: string;
  expandButtonClassName?: string;
  renderContent?: (text: string) => React.ReactNode;
}

export const ExpandableText: React.FC<ExpandableTextProps> = ({
  text,
  maxLength = 300,
  className = "",
  textClassName = "",
  expandButtonClassName = "",
  renderContent
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Don't add expand functionality if text is shorter than maxLength
  if (text.length <= maxLength) {
    return (
      <div className={className}>
        {renderContent ? renderContent(text) : (
          <div className={textClassName}>{text}</div>
        )}
      </div>
    );
  }
  
  const toggleExpand = () => setIsExpanded(!isExpanded);
  const displayText = isExpanded ? text : text.slice(0, maxLength) + '...';
  
  return (
    <div className={className}>
      {renderContent ? renderContent(displayText) : (
        <div className={textClassName}>{displayText}</div>
      )}
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={toggleExpand}
        className={`mt-2 flex items-center ${expandButtonClassName}`}
      >
        <span className="mr-1">{isExpanded ? 'Show Less' : 'Show More'}</span>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>
    </div>
  );
};
