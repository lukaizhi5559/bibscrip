"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { exportDocument, ExportFormat, DocumentContent } from '@/lib/document-utils';
import { FileDown, FileType, FileText, Loader2, File, Table } from 'lucide-react';
import { ChatResponseData } from '@/components/chat-response-card';
import { toast } from '@/components/ui/use-toast';

interface DocumentExportProps {
  question: string;
  chatResponse: ChatResponseData | null;
  className?: string;
}

export function DocumentExport({ question, chatResponse, className = '' }: DocumentExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  
  if (!chatResponse) {
    return null;
  }
  
  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    
    try {
      // Format the data for export
      const content: DocumentContent = {
        title: `BibScrip Study: ${question.substring(0, 50)}${question.length > 50 ? '...' : ''}`,
        question,
        answer: chatResponse.aiAnswer,
        verses: chatResponse.referencedVerses.map(verse => ({
          reference: verse.reference,
          text: verse.text,
          translation: verse.translation
        }))
      };
      
      await exportDocument(content, format);
      toast({
        title: "Export successful",
        description: `Your document has been exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isExporting ? (
        <Button variant="outline" disabled>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Exporting...
        </Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <FileDown className="h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => handleExport('pdf')}>
              <File className="h-4 w-4 mr-2" />
              <span>Export as PDF</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('docx')}>
              <FileText className="h-4 w-4 mr-2" />
              <span>Export as Word Document</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('xlsx')}>
              <Table className="h-4 w-4 mr-2" />
              <span>Export as Excel Spreadsheet</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
