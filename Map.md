# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

The main application is located in the `quiz/` directory. Navigate there for all development tasks:

```bash
cd quiz
```

### Essential Commands
- **Development server**: `npm run dev` - Starts Vite dev server on localhost:5173
- **Build**: `npm run build` - Creates production build in `dist/`
- **Lint**: `npm run lint` - Runs ESLint on all JS/JSX files
- **Preview build**: `npm run preview` - Preview production build locally
- **Install dependencies**: `npm ci --legacy-peer-deps` (required due to peer dependency conflicts)

### Environment Setup
- Requires Node.js 20.x (specified in package.json engines)
- Uses `--legacy-peer-deps` for npm installs due to dependency conflicts
- Environment variables are stored in `.env` files (not tracked in git)

### Testing & Validation
- Pre-build validation: `npm run prebuild` - Runs case sensitivity checks
- Case sensitivity check: `node scripts/check-case-sensitivity.cjs`

## Architecture Overview

### Technology Stack
- **Frontend**: React 18 with Vite as build tool
- **UI Library**: Material-UI (MUI) with custom theming
- **Routing**: React Router DOM with lazy-loaded components
- **Authentication**: Firebase Auth with Google OAuth
- **Database**: Firestore for user data, quiz results, and settings
- **State Management**: Context API (AuthContext) + local component state
- **File Processing**: PDF.js, Mammoth (DOCX), OCR.Space API
- **Deployment**: Vercel with specific build configuration

### Project Structure
```
quiz/
├── src/
│   ├── components/          # Organized by feature domains
│   │   ├── Auth/           # Authentication components
│   │   ├── FileUpload/     # File processing & upload
│   │   ├── Engine/         # Quiz engine & gameplay
│   │   ├── Results/        # Results display & analysis
│   │   ├── Dashboard/      # User dashboard
│   │   ├── Admin/          # Admin-only features
│   │   └── Layout/         # Header, navigation
│   ├── context/            # React Context providers
│   ├── utils/              # Core utilities & services
│   ├── App.jsx            # Main app with route-based code splitting
│   ├── theme.js           # MUI theme configuration
│   └── firebaseConfig.js   # Firebase initialization
```

### Core Application Flow
1. **Landing** → **Authentication** → **Dashboard**
2. **File Upload** → **AI Processing** → **Quiz Engine** → **Results**
3. **Admin Dashboard** (for mizuka886@gmail.com only)

### Key Architectural Patterns

#### Code Splitting & Performance
- Lazy-loaded components with React.lazy() and Suspense
- Route-based splitting for optimal bundle sizes
- Firebase operations are cached and optimized
- Manual chunks configured in Vite for vendor libraries

#### Authentication & Authorization
- Firebase Auth with Google OAuth only
- Role-based access: regular users vs admin (mizuka886@gmail.com)
- Credit system for non-premium users (5 credits/day, resets daily)
- Admin users get unlimited credits and access to admin panel

#### File Processing Pipeline
- Multi-format support: PDF, DOCX, images (JPG, PNG, etc.)
- PDF processing: text extraction → OCR fallback for scanned PDFs
- DOCX processing: Mammoth.js for text extraction
- Image processing: OCR.Space API with multiple retry strategies
- Error handling with user-friendly messages via FileProcessingError class

#### AI Integration
- Gemini API for question generation (configurable via admin)
- Fallback to manual question entry if AI fails
- API key management through Firebase settings collection
- Content trimming to respect API limits (MAX_CHARS constant)

### Firebase Schema
- `users/{uid}`: User profiles, credits, premium status, statistics
- `settings/apiConfig`: Global API configuration (admin-only)
- `users/{uid}/chats`: Chat history (with auto-cleanup)
- `quizzes/`: Quiz results and analytics

### Component Architecture Principles
- Each major feature has its own directory with sub-components
- Styled components using MUI's styled() API
- Custom hooks for complex logic (e.g., useFileProcessor)
- Context providers for shared state (AuthContext)
- Error boundaries and loading states throughout

### Environment Variables (Required)
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_DEFAULT_API_KEY= (fallback Gemini key)
VITE_DEFAULT_BASE_URL= (Gemini API endpoint)
```

### Deployment Configuration
- Vercel deployment with custom build command and legacy peer deps
- SPA routing configuration in vercel.json
- Production optimizations: esbuild minification, chunk splitting
- Cache headers configured for optimal performance

## Development Guidelines

### Working with Components
- Use TypeScript-style prop validation in JSX components
- Follow MUI theming patterns for consistent styling
- Implement proper loading states and error handling
- Use lazy loading for route-level components

### File Processing Development
- Test with various file types and sizes (max 50MB)
- Handle OCR fallbacks gracefully for scanned documents
- Implement progress indicators for long-running operations
- Validate extracted content before passing to AI services

### State Management
- Use AuthContext for user-related state
- Local state for component-specific data
- Firebase for persistent data storage
- Cache API responses where appropriate (see firebaseService.js)

### Error Handling
- Use FileProcessingError class for file-related errors
- Implement user-friendly error messages
- Log technical details for debugging while showing simple messages to users
- Handle network failures gracefully with retries where appropriate

### Performance Considerations
- Lazy load components to reduce initial bundle size
- Use React.memo for expensive components
- Implement virtualization for large lists
- Optimize Firebase queries with proper indexing
!
Product of mizuka.vercel.app