'use client';

import { useState } from 'react';
import { useGeneratePrompt } from '@/hooks/useGeneratePrompt';

export function ExampleGenerator() {
  const [prompt, setPrompt] = useState('');
  const { generate, isLoading, error, result } = useGeneratePrompt();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      await generate(prompt);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
      <h2 className="text-2xl font-bold">Backend Generator Example</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium mb-1">
            Your Prompt
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-2 border rounded-md h-32"
            placeholder="Enter your prompt here..."
            disabled={isLoading}
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Generating...' : 'Generate Response'}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {result && !error && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="font-medium mb-2">Result:</p>
          <div className="p-3 bg-white rounded border">{result}</div>
        </div>
      )}
    </div>
  );
}
