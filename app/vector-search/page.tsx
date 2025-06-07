"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SemanticSearch from "@/components/semantic-search";
import AddVerse from "@/components/add-verse";
import VectorDBStatus from "@/components/vector-db-status";
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function VectorSearchPage() {
  return (
    <main className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-1 mb-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">BibScrip Vector Database</h1>
          <p className="text-muted-foreground mt-1">
            Semantic search and management for biblical content
          </p>
        </div>
        <div>
          <VectorDBStatus />
        </div>
      </div>

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="add">Add Verse</TabsTrigger>
        </TabsList>
        
        <TabsContent value="search" className="mt-6">
          <SemanticSearch />
        </TabsContent>
        
        <TabsContent value="add" className="mt-6">
          <AddVerse />
        </TabsContent>
      </Tabs>
    </main>
  );
}
