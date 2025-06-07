"use client";

import React, { useEffect, useState } from 'react';
import { vectorService } from '../utils/vector-service';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const VectorDBStatus: React.FC = () => {
  const [status, setStatus] = useState<{ available: boolean; mode: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const dbStatus = await vectorService.checkStatus();
        setStatus(dbStatus);
      } catch (err) {
        console.error('Failed to check vector DB status:', err);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    
    // Set up periodic status checking every minute
    const intervalId = setInterval(checkStatus, 60000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  if (loading) return <div className="text-sm text-muted-foreground flex items-center">Checking database...</div>;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="text-sm flex items-center cursor-help">
            <span className="mr-2">Vector DB:</span>
            {status ? (
              <>
                <span 
                  className={`inline-block w-2 h-2 rounded-full mr-1 ${
                    status.available ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                ></span>
                <span>{status.available ? 'Connected' : 'Fallback Mode'}</span>
              </>
            ) : (
              <>
                <span className="inline-block w-2 h-2 rounded-full mr-1 bg-red-500"></span>
                <span>Unavailable</span>
              </>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {status 
            ? `Vector database is ${status.available ? 'online' : 'in fallback mode'}. Mode: ${status.mode}`
            : 'Vector database is unavailable. Check backend connection.'
          }
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VectorDBStatus;
