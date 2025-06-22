# Language Learning App - Architecture Overview

## Overview

This is a full-stack language learning application built with React on the frontend and Express.js on the backend. The app provides an interactive platform for users to learn multiple languages through structured lessons, gamification elements, and social features. It follows a modern web architecture with TypeScript throughout, utilizing Drizzle ORM for database operations and shadcn/ui for the component library.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query (@tanstack/react-query) for server state management
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with bcrypt for password hashing
- **API Design**: RESTful endpoints with consistent error handling

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Migration**: Drizzle Kit for schema migrations
- **Connection**: Neon Database serverless PostgreSQL
- **Schema**: Comprehensive relational design supporting users, languages, lessons, progress tracking, and social features

## Key Components

### Authentication System
- User registration and login with email/username support
- Password hashing using bcrypt
- Session management for maintaining user state
- Email verification workflow (placeholder implementation)

### Learning Management
- Multi-language support with structured level progression
- Lesson content with various question types (flashcards, multiple choice, drag-drop, fill-blanks)
- Progress tracking per user per language
- XP system and streak tracking for gamification

### Social Features
- Friend system for connecting with other learners
- Trading system for virtual items
- Achievement system with user progress tracking
- Leaderboards for competitive learning

### Gamification Elements
- Hearts system limiting daily attempts
- Virtual shop with purchasable items using earned currency
- Streak tracking with freeze protection for premium users
- Achievement badges and progress milestones

### User Interface
- Responsive design optimized for both desktop and mobile
- Dark/light theme support through CSS variables
- Consistent component library using shadcn/ui
- Interactive learning components with animations and feedback

## Data Flow

### User Authentication Flow
1. User submits credentials through login/signup forms
2. Frontend validates input using Zod schemas
3. Backend processes authentication, hashes passwords, creates sessions
4. User context is updated and stored in localStorage
5. Protected routes redirect based on authentication state

### Learning Session Flow
1. User selects language and lesson from structured curriculum
2. Frontend fetches lesson content and user progress from API
3. Interactive lesson components present questions with various formats
4. User responses are validated and progress is tracked
5. Completion updates user stats (XP, streak, hearts, progress percentages)

### Data Synchronization
- React Query manages server state with automatic caching and synchronization
- Optimistic updates for immediate UI feedback
- Error boundaries handle API failures gracefully
- Background refetching ensures data consistency

## External Dependencies

### Core Dependencies
- **Database**: Neon Database for serverless PostgreSQL hosting
- **Payment Processing**: PayPal SDK integration for premium subscriptions
- **Development Tools**: Replit environment with automatic deployment

### UI and Styling
- **Component Library**: Radix UI primitives for accessible components
- **Icons**: Lucide React for consistent iconography
- **Styling**: Tailwind CSS with PostCSS processing
- **Animations**: Class Variance Authority for dynamic styling

### Development and Build
- **TypeScript**: Full type safety across frontend and backend
- **ESBuild**: Fast bundling for production builds
- **Vite**: Development server with hot module replacement
- **TSX**: TypeScript execution for server development

## Deployment Strategy

### Development Environment
- Replit-hosted development with live reloading
- Automatic PostgreSQL database provisioning
- Environment-based configuration with NODE_ENV detection

### Production Build
- Frontend: Vite builds optimized static assets to `dist/public`
- Backend: ESBuild bundles server code to `dist/index.js`
- Database: Drizzle migrations ensure schema consistency

### Hosting Configuration
- Single-port deployment on port 5000 with Express serving both API and static files
- Vite development middleware in development mode
- Static file serving in production mode
- Auto-scaling deployment target for production

## Changelog

- January 22, 2025: Migration to Replit completed
  - Removed French and Italian languages per user request
  - Updated to 7 languages: Japanese, Chinese, Serbo-Croatian, Spanish, Korean, Russian, German
  - Connected real Supabase data instead of mock data
  - Added lesson system with JSON files (50 lessons per language created)
  - Implemented sound effects for learning interactions
  - Added lesson settings overlay with configurable exercise types
  - Created API endpoints for real progress tracking

## User Preferences

Preferred communication style: Simple, everyday language.
UI Style: Modern, Duolingo-inspired design with app-like feel
Data: Real Supabase integration, no mock data
Lessons: 200 lessons per language (currently 50 created, need 150 more)