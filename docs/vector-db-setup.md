# Vector Database Integration Setup Guide

## Environment Configuration

To connect BibScrip to the vector database backend, add the following environment variable to your `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

If your backend is hosted elsewhere, replace the URL accordingly.

## Integration Overview

The BibScrip frontend now integrates with a vector database backend for semantic search capabilities. This integration includes:

1. **API Configuration**: Configuration for connecting to backend vector database endpoints
2. **Vector Service**: TypeScript service for interacting with the vector database
3. **UI Components**: React components for searching and managing vector data
4. **Status Indicator**: Live indicator of vector database connectivity

## Available Features

- **Semantic Search**: Find Bible verses by meaning rather than exact keyword matching
- **Add Verses**: Add new verses to the vector database
- **Status Monitoring**: Check the connection status of the vector database

## Usage

The vector database integration can be accessed at `/vector-search` in your application.

## Backend Requirements

For this integration to work properly, the backend should implement the following API endpoints:

- `POST /api/vector/store`: Store a single document in the vector database
- `POST /api/vector/search`: Search for similar documents in the vector database
- `POST /api/vector/batch`: Store multiple documents in a batch
- `DELETE /api/vector`: Delete documents from the vector database
- `GET /api/vector/status`: Check the status of the vector database

Each endpoint should follow the request/response format documented in the vector service implementation.
