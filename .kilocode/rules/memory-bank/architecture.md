# Architecture

## System Architecture

### High-Level Architecture

The TRMN Course Tracker follows a modern React single-page application (SPA) architecture with build-time optimization and client-side state management. The application is designed as a progressive web app with offline capabilities.

### Core Layers

1. **Build Layer**: Course data processing and optimization
2. **Data Layer**: Course data management and eligibility calculation
3. **State Layer**: User progress and application state management
4. **Presentation Layer**: React components with responsive UI
5. **Styling Layer**: Panda CSS with TRMN brand theming

## Source Code Paths

### Core Application Structure

```
src/
├── App.tsx                 # Main application component
├── main.tsx               # React application entry point
├── index.css              # Global styles
├── components/            # React components
│   ├── CourseDetails/     # Course detail view components
│   ├── CourseNode/        # Individual course node components
│   ├── DebugPanel/        # Development debugging tools
│   ├── ErrorBoundary/     # Error handling components
│   ├── FilterPanel/       # Course filtering interface
│   ├── GDPRConsentBanner/ # Privacy consent management
│   ├── MedusaImport/      # External data import functionality
│   ├── ProgressPanel/     # Progress tracking and achievements
│   ├── SettingsPanel/     # User preferences management
│   ├── SkillTreeView/     # Main course visualization
│   ├── TRMNHeader/        # Application header component
│   ├── TRMNLogo/          # Branding components
│   ├── WaitingGradeAlert/ # Grade notification system
│   └── ui/                # Reusable UI components
├── config/                # Application configuration
├── hooks/                 # Custom React hooks
├── i18n/                  # Internationalization system
├── styles/                # Generated CSS from Panda
├── theme/                 # Theme configuration
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions and business logic
└── test-setup.ts          # Test configuration
```

### Build System Structure

```
scripts/
├── buildCourseData.ts     # Course data processing script
├── checkBundleSize.ts     # Bundle analysis utilities
└── updateCourseDataFromWiki.ts # TRMN wiki data integration

public/
├── courses.md             # Source course data (markdown)
├── courses.json           # Generated course data (JSON)
└── favicon.png           # Application icons
```

## Key Technical Decisions

### Build-Time Course Processing

- **Decision**: Parse markdown course data at build time rather than runtime
- **Rationale**: Eliminates runtime parsing overhead, reduces bundle size, improves loading performance
- **Implementation**: Custom build script processes `public/courses.md` into `public/courses.json`
- **Benefits**: Sub-2-second load times, no runtime markdown dependencies

### Client-Side State Management

- **Decision**: Use React Query for server state, React Context for global state
- **Rationale**: Separates server state (course data) from client state (user progress)
- **Implementation**: Custom hooks for progress management, React Query for course data
- **Benefits**: Predictable state updates, optimistic updates, caching

### Component Architecture

- **Decision**: Feature-based component organization with shared UI components
- **Rationale**: Improves maintainability and reusability
- **Implementation**: Feature folders contain related components, hooks, and styles
- **Benefits**: Clear separation of concerns, easier testing, better developer experience

### Styling Strategy

- **Decision**: Panda CSS with styled-components for dynamic styling
- **Rationale**: Combines design system benefits with runtime styling capabilities
- **Implementation**: Panda for static styles, styled-components for dynamic theme values
- **Benefits**: Type-safe styling, consistent design tokens, runtime theme switching

## Design Patterns in Use

### Custom Hooks Pattern

- **useCourseData**: Manages course data loading and caching
- **useUserProgress**: Handles progress state and persistence
- **useCourseManagement**: Encapsulates course operations (toggle, status changes)
- **useFilterState**: Manages filtering logic and state
- **useMobileNavigation**: Handles responsive navigation behavior

### Render Props Pattern

- **CourseDetails**: Accepts render prop for custom course information display
- **FilterPanel**: Uses render props for filter option customization
- **ProgressPanel**: Render props for achievement display variations

### Compound Components Pattern

- **SkillTreeView**: Main tree component with sub-components (CourseSection, CourseNode)
- **CourseDetails**: Header, Description, Prerequisites sections as compound components
- **SettingsPanel**: Preference toggles and language selector as compound components

### Higher-Order Components (HOC)

- **withErrorBoundary**: Wraps components with error handling capabilities
- **withGDPRConsent**: Handles analytics consent requirements
- **withMobileLayout**: Provides mobile-specific layout behaviors

## Component Relationships

### Data Flow Architecture

```
User Actions → Components → Custom Hooks → State Updates → UI Re-render
     ↓              ↓            ↓            ↓            ↓
Course Selection → CourseDetails → useCourseManagement → Progress Update → SkillTree Refresh
Filter Changes → FilterPanel → useFilterState → Filtered Results → Course List Update
Settings Changes → SettingsPanel → useUserSettings → Theme/Layout Change → Visual Update
```

### Dependency Chain

- **App.tsx**: Root component orchestrating all major systems
- **SkillTreeView**: Main visualization consuming course data and user progress
- **CourseDetails**: Detailed view of individual courses with prerequisite information
- **ProgressPanel**: Achievement tracking and statistics display
- **FilterPanel**: Course filtering and search functionality
- **SettingsPanel**: User preferences and configuration management

### Critical Implementation Paths

#### Course Data Loading

1. **Build Time**: `buildCourseData.ts` processes markdown → JSON
2. **Runtime**: `useCourseData` hook loads pre-parsed JSON
3. **Eligibility**: `EligibilityEngine` calculates course availability
4. **Rendering**: `SkillTreeView` displays courses with status indicators

#### Progress Tracking

1. **User Action**: Click course completion toggle
2. **State Update**: `useCourseManagement` updates progress
3. **Persistence**: `useUserProgress` saves to localStorage
4. **Eligibility Recalculation**: `EligibilityEngine` updates available courses
5. **UI Update**: Components re-render with new progress state

#### Mobile Navigation

1. **Breakpoint Detection**: CSS media queries trigger mobile layout
2. **State Management**: `useMobileNavigation` tracks layout state
3. **Touch Interactions**: Overlay clicks and gesture handling
4. **Responsive Rendering**: Conditional component rendering based on screen size

## Integration Points

### External Systems

- **TRMN Wiki**: Source of course data via markdown export
- **Medusa System**: TRMN's course management system for data import
- **Google Tag Manager**: GDPR-compliant analytics tracking

### Development Tools

- **Vitest**: Testing framework with React Testing Library
- **ESLint**: Code quality and consistency enforcement
- **TypeScript**: Type safety and developer experience
- **Vite**: Fast build tool and development server
- **Panda CSS**: Design system and styling framework

### Deployment Pipeline

- **GitHub Actions**: Automated testing and deployment
- **GitHub Pages**: Static site hosting
- **Bundle Analysis**: Performance monitoring and optimization
