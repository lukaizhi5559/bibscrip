"use client";

import React, { useState } from 'react';
import { vectorService } from '../utils/vector-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const AddVerse: React.FC = () => {
  const [verse, setVerse] = useState({
    text: '',
    reference: '',
    translation: 'ESV'
  });
  const [status, setStatus] = useState({ loading: false, message: '', error: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verse.text || !verse.reference) return;
    
    setStatus({ loading: true, message: '', error: false });
    try {
      const id = await vectorService.storeDocument({
        text: verse.text,
        metadata: {
          reference: verse.reference,
          translation: verse.translation,
          addedAt: new Date().toISOString()
        }
      });
      
      setStatus({
        loading: false,
        message: `Verse added successfully with ID: ${id}`,
        error: false
      });
      setVerse({ text: '', reference: '', translation: 'ESV' });
    } catch (err) {
      setStatus({
        loading: false,
        message: 'Failed to add verse. Please try again.',
        error: true
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Add Bible Verse to Vector Database</CardTitle>
      </CardHeader>
      
      <CardContent>
        {status.message && (
          <Alert className={`mb-4 ${status.error ? 'bg-destructive/15' : 'bg-primary/15'}`}>
            <AlertDescription className="flex items-center">
              {status.error ? 
                <AlertCircle className="h-4 w-4 mr-2" /> : 
                <CheckCircle className="h-4 w-4 mr-2" />
              }
              {status.message}
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Bible Reference</label>
            <Input
              type="text"
              value={verse.reference}
              onChange={(e) => setVerse({...verse, reference: e.target.value})}
              placeholder="e.g., John 3:16"
              required
            />
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium">Translation</label>
            <Select 
              value={verse.translation} 
              onValueChange={(value) => setVerse({...verse, translation: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a translation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="KJV">KJV</SelectItem>
                <SelectItem value="ESV">ESV</SelectItem>
                <SelectItem value="NLT">NLT</SelectItem>
                <SelectItem value="NASB">NASB</SelectItem>
                <SelectItem value="CSB">CSB</SelectItem>
                <SelectItem value="NIV">NIV</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium">Verse Text</label>
            <Textarea
              value={verse.text}
              onChange={(e) => setVerse({...verse, text: e.target.value})}
              placeholder="Enter the full verse text..."
              className="h-32"
              required
            />
          </div>
          
          <Button
            type="submit"
            disabled={status.loading}
            className="w-full"
          >
            {status.loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : 'Add Verse'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddVerse;
