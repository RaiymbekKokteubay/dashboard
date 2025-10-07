# LLM Dashboard

A Next.js dashboard for monitoring LLM interactions stored in Supabase.

## Environment Setup

1. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase credentials in `.env.local`:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (server-only)
   - `SUPABASE_TABLE`: The table name (default: `llm_interactions`)
   - `TZ`: Your timezone (default: `America/New_York`)

3. Get your Supabase credentials:
   - Go to your Supabase project dashboard
   - Navigate to Settings > API
   - Copy the Project URL and Service Role Key

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- View recent LLM interactions
- Detailed interaction analysis
- Duplicate prompt detection
- Metrics dashboard
- Real-time data from Supabase

## Security

- Never commit `.env.local` to version control
- The `.gitignore` file is configured to exclude environment files
- Use service role keys only on the server side
