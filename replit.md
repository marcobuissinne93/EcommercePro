# TechStore SA - E-commerce Platform with Root Insurance Integration

## Overview

This is a fullstack e-commerce demo platform designed to showcase how insurance products can be seamlessly embedded into an online store using Root Platform's API. The application allows users to browse mobile devices, add products to cart, select extended warranties and device insurance, and complete purchases with integrated insurance policies.

## System Architecture

### Fullstack Architecture
- **Frontend**: React 18 with Vite build tool
- **Backend**: Node.js with Express server
- **Database**: PostgreSQL with Drizzle ORM (configured for potential expansion)
- **Storage**: In-memory storage with mock data for demonstration
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand for cart state persistence
- **API Communication**: TanStack Query for data fetching and caching

### Project Structure
```
├── client/          # React frontend application
├── server/          # Express backend server
├── shared/          # Shared types and database schema
├── components.json  # shadcn/ui configuration
├── drizzle.config.ts # Database configuration
└── vite.config.ts   # Vite build configuration
```

## Key Components

### Frontend Architecture
- **React Router**: Wouter for lightweight client-side routing
- **Component System**: shadcn/ui components built on Radix UI primitives
- **State Management**: 
  - Zustand store for cart persistence across sessions
  - TanStack Query for server state management
- **Styling**: Tailwind CSS with custom design tokens and dark mode support
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Server Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints for products, quotes, policies, and orders
- **External Integration**: Root Platform API for insurance quotes and policy creation
- **Data Storage**: In-memory storage with interface for future database expansion
- **Middleware**: Request logging, JSON parsing, error handling

### Data Flow
1. **Product Browsing**: Frontend fetches product catalog from backend
2. **Cart Management**: Zustand store manages cart state with local persistence
3. **Insurance Selection**: Modal-based insurance selection with Root API integration
4. **Checkout Process**: Form validation, quote generation, policy creation, and order placement
5. **Order Management**: Backend stores orders and tracks Root policy IDs

## External Dependencies

### Root Platform Integration
- **API Endpoints**: `/quotes` for pricing, `/policies` for policy creation
- **Authentication**: Bearer token authentication via environment variables
- **Data Models**: Product-based insurance with coverage options (comprehensive, theft, accidental damage)

### UI Component Library
- **shadcn/ui**: Pre-built accessible components
- **Radix UI**: Headless UI primitives for complex interactions
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast bundling for production builds
- **Vite**: Development server with hot module replacement

## Deployment Strategy

### Replit Configuration
- **Environment**: Node.js 20 with PostgreSQL 16 module
- **Development**: `npm run dev` starts both frontend and backend
- **Production Build**: Vite builds frontend, ESBuild bundles backend
- **Port Configuration**: Backend serves on port 5000, frontend proxied in development

### Build Process
1. **Development**: Vite dev server with Express backend
2. **Production**: Static frontend build served by Express
3. **Database**: Drizzle migrations for PostgreSQL schema management

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `ROOT_API_KEY`: Root Platform API authentication
- `ROOT_BASE_URL`: Root Platform API endpoint

## Recent Changes
```
✓ June 25, 2025 - Initial setup with product catalog and cart functionality
✓ June 25, 2025 - Implemented WhatsApp insurance payment link system
✓ June 25, 2025 - Added South African phone number validation (+27 format)
✓ June 25, 2025 - Separated insurance costs from cart total (debit order approach)
✓ June 25, 2025 - Enhanced WhatsApp message formatting with payment links
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
```