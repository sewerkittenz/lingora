# Lingora - Modern Language Learning Platform

A comprehensive language learning application built with React, TypeScript, and Supabase.

## Features

- **Multi-language support**: Japanese, Chinese, Korean, Spanish, French, German, Italian, Russian, Serbo-Croatian
- **Interactive learning modes**: Flashcards, drag-drop, fill-in-blanks, typing exercises
- **Gamification**: XP system, streaks, hearts, achievements
- **Social features**: Friends, trading system, leaderboards
- **Premium subscriptions**: PayPal integration for monthly/yearly plans
- **Modern UI**: Responsive design with dark/light themes

## Quick Start

1. Install dependencies: `npm install`
2. Set up environment variables (see below)
3. Configure Supabase database
4. Run development server: `npm run dev`

## Environment Variables

```env
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
```

## Database Setup

Run the provided SQL script in your Supabase dashboard to create all necessary tables and initial data.

## Deployment

Ready for deployment on Netlify with serverless functions.

## Technology Stack

- Frontend: React, TypeScript, Tailwind CSS, shadcn/ui
- Backend: Express.js, Supabase
- Payments: PayPal
- Deployment: Netlify

## License

MIT