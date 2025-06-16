# Deployment Configuration

This project is configured for automatic deployments on Vercel.

## Branch Configuration
- Production Branch: `master`
- Auto Deploy: Enabled

## Environment Variables
The following environment variables are required for deployment:
- `POSTGRES_URL`
- `OPENAI_API_KEY`
- `GOOGLE_API_KEY`
- `GOOGLE_CSE_ID`
- `SERPAPI_API_KEY`
- `TAVILY_API_KEY`

## Build Process
1. Install dependencies: `npm install`
2. Build application: `npm run vercel-build`
3. Deploy to Vercel

## Deployment Status
Last deployment: $(date) 