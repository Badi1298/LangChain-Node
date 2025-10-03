# AI Coding Agent Instructions

## Project Overview

This is a Node.js server for a financial document processing system that uses LangChain, OpenAI, and vector embeddings to analyze structured products. The project is in early development with core infrastructure in place but missing key features.

## Architecture & Key Components

### Core Structure

-   **Entry Point**: `src/app.js` - Basic Express server on port 8002
-   **Services**: `src/services/openaiClient.js` - Singleton OpenAI client with critical error handling
-   **Configuration**: Environment-based config pattern in `src/utils/config.js`
-   **Financial Data**: `stocks.json` contains 27k+ stock records with market data

### Critical Patterns

#### Configuration Management

All external service configs live in `src/utils/config.js`:

```javascript
const config = {
	openai: { apiKey: process.env.OPENAI_API_KEY },
	vectorDimension: 1536, // Matches text-embedding-3-small
};
```

#### Service Initialization

OpenAI client uses singleton pattern with process.exit(1) on initialization failure - this is intentional for fail-fast behavior in production.

#### File Upload Handling

`src/middleware/upload.js` uses multer with:

-   10MB file size limit
-   Timestamp-based filename collision prevention
-   `uploads/` directory (ensure this exists)

### Financial Domain Context

#### Constants Structure

`src/config/constants.js` defines frozen objects for:

-   Issuer IDs (banks like EFG International)
-   Product types (Phoenix Autocall, Reverse Convertible)
-   Frequencies (monthly, quarterly, etc.)
-   Redemption types (cash, physical)

#### Issuer Data

`src/utils/issuerList.js` contains 35+ financial institutions with structured data: name, issuer_code, id. This is likely used for product validation/lookup.

## Development Workflow

### Local Development

```bash
npm start  # Uses nodemon for auto-reload
```

### Docker Development

```bash
docker-compose up  # Uses Dockerfile.dev with volume mounts
```

### Dependencies

-   **LangChain**: Full ecosystem (@langchain/core, @langchain/openai, @langchain/community)
-   **Vector DB**: Pinecone integration ready
-   **PDF Processing**: pdf-parse and pdfjs-dist for document analysis
-   **File Handling**: multer for uploads, body-parser for JSON

## Missing Implementation Areas

1. **Routes/Controllers**: Empty directories suggest API endpoints need implementation
2. **Product Detail Parsing**: `prefillPanelFields.js` references non-existent `../src/services/product-details/parseProductDetails`
3. **Vector Search**: Pinecone and LangChain dependencies suggest RAG system implementation needed

## Key Files to Reference

-   `src/utils/config.js` - For adding new service configurations
-   `src/config/constants.js` - For financial domain constants
-   `stocks.json` - For understanding data structure
-   `src/services/openaiClient.js` - For service initialization patterns

## Environment Setup

Requires `.env` file with:

-   `OPENAI_API_KEY` - Critical for service initialization
-   Likely needs Pinecone credentials for vector operations
