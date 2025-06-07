"use client";

import React, { useState, useEffect, useRef } from 'react';
import { vectorService } from '@/utils/vector-service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, RefreshCw, ArrowLeft, Database } from 'lucide-react';
import Link from 'next/link';
import AddVerse from '@/components/add-verse';
import VectorDBStatus from '@/components/vector-db-status';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

export default function VectorDatabaseAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{type: 'success' | 'error' | 'info', text: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Simulate admin check - in production, use your auth system
  useEffect(() => {
    // Mock admin check - replace with your actual authentication logic
    const checkAdmin = async () => {
      try {
        // In a real app, make an API call to verify admin status
        // For now, we'll just set it to true for demonstration
        setIsAdmin(true);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
      setMessage({
        type: 'info',
        text: `File "${e.target.files[0].name}" selected. Click "Upload Bible Data" to start processing.`
      });
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      setMessage({ type: 'error', text: 'Please select a file first.' });
      return;
    }

    try {
      setIsUploading(true);
      setMessage({ type: 'info', text: 'Processing file...' });

      // Read file as text
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (!e.target || typeof e.target.result !== 'string') {
          throw new Error('Failed to read file');
        }

        try {
          // Parse JSON content
          const bibleData = JSON.parse(e.target.result);
          
          if (!bibleData.verses || !Array.isArray(bibleData.verses)) {
            throw new Error('Invalid file format. Expected { verses: [...] }');
          }

          setMessage({ 
            type: 'info', 
            text: `Found ${bibleData.verses.length} verses. Starting upload...` 
          });

          // Process in batches
          const batchSize = 50;
          const totalBatches = Math.ceil(bibleData.verses.length / batchSize);
          
          for (let i = 0; i < bibleData.verses.length; i += batchSize) {
            const batch = bibleData.verses.slice(i, i + batchSize).map((verse: any) => ({
              text: verse.text,
              metadata: {
                reference: verse.reference,
                translation: verse.translation || 'Unknown',
                book: verse.book,
                chapter: verse.chapter,
                verse: verse.verse
              }
            }));
            
            // Update progress
            const progress = Math.round(((i + batch.length) / bibleData.verses.length) * 100);
            setUploadProgress(progress);
            setMessage({ 
              type: 'info', 
              text: `Processing batch ${Math.floor(i/batchSize) + 1}/${totalBatches} (${progress}%)` 
            });
            
            // Upload batch
            await vectorService.storeBatch(batch, 'bible-verses');
            
            // Add a small delay to avoid overwhelming the API
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
          setMessage({ 
            type: 'success', 
            text: `Successfully uploaded ${bibleData.verses.length} verses to the vector database.` 
          });
        } catch (error) {
          console.error('Processing error:', error);
          setMessage({ 
            type: 'error', 
            text: error instanceof Error ? error.message : 'Failed to process file' 
          });
        }
      };
      
      reader.onerror = () => {
        setMessage({ type: 'error', text: 'Failed to read file' });
      };
      
      reader.readAsText(uploadFile);
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'An unknown error occurred' 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const runPopulationScript = async () => {
    setMessage({ type: 'info', text: 'Running database population script...' });
    setIsUploading(true);
    
    try {
      // In a production app, this would call an API endpoint 
      // that triggers the script on the server
      const response = await fetch('/api/admin/populate-vector-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to run population script');
      }
      
      setMessage({ 
        type: 'success', 
        text: 'Population script started successfully. This may take several minutes to complete.' 
      });
    } catch (error) {
      console.error('Script error:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to run population script' 
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTitle>Unauthorized Access</AlertTitle>
          <AlertDescription>
            You do not have permission to access this page.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-6 w-6" />
            Vector Database Administration
          </h1>
          <p className="text-muted-foreground">Manage semantic search functionality</p>
        </div>
        <div className="flex items-center gap-4">
          <VectorDBStatus />
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to App
            </Link>
          </Button>
        </div>
      </div>
      
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'} 
          className="mb-6">
          <AlertTitle>
            {message.type === 'error' ? 'Error' : 
             message.type === 'success' ? 'Success' : 'Information'}
          </AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add Bible Verses</CardTitle>
            <CardDescription>Add individual verses to the vector database</CardDescription>
          </CardHeader>
          <CardContent>
            <AddVerse />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Bulk Database Operations</CardTitle>
            <CardDescription>Populate or update the vector database</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="bibleFile">Upload Bible Data File (JSON format)</Label>
              <div className="flex mt-2">
                <Input 
                  id="bibleFile" 
                  type="file" 
                  accept=".json" 
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  disabled={isUploading}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                File should contain a JSON object with a "verses" array
              </p>
            </div>
            
            {isUploading && (
              <Progress value={uploadProgress} className="w-full" />
            )}
            
            <div className="flex flex-col space-y-2">
              <Button 
                className="w-full" 
                onClick={handleUpload}
                disabled={!uploadFile || isUploading}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Bible Data
              </Button>
              
              <Button 
                className="w-full" 
                variant="outline"
                onClick={runPopulationScript}
                disabled={isUploading}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Run Database Population Script
              </Button>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50 flex justify-between text-xs text-muted-foreground">
            <span>Last updated: {new Date().toLocaleString()}</span>
            <span>Admin mode</span>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
