# Technologies and Development Setup

## Technologies Used

### Core Framework

- **React 19.1.0**: Latest React with concurrent features and improved performance
- **TypeScript 5.8.3**: Full type safety and enhanced developer experience
- **Vite 7.0.2**: Fast build tool and development server with HMR

### UI and Styling

- **@ark-ui/react 5.16.0**: Accessible UI component library
- **Panda CSS 0.54.0**: Design system framework with CSS-in-JS capabilities
- **Park UI 0.43.1**: Component library built on Panda CSS
- **Styled Components 6.1.19**: Runtime styling for dynamic theme values
- **PostCSS**: CSS post-processing and optimization

### State Management

- **TanStack React Query 5.81.5**: Server state management and caching
- **React Context**: Global application state management
- **Custom Hooks**: Domain-specific state logic encapsulation

### Development Tools

- **Vitest 3.2.4**: Testing framework with excellent TypeScript support
- **React Testing Library 16.3.0**: Component testing utilities
- **ESLint 9.30.1**: Code quality and consistency enforcement
- **TypeScript ESLint 8.35.1**: TypeScript-specific linting rules

### Build and Deployment

- **Vite**: Fast builds and optimized production bundles
- **GitHub Actions**: Automated testing and deployment pipeline
- **GitHub Pages**: Static site hosting
- **Bundle Analyzer**: Performance monitoring and optimization

### External Integrations

- **UUID 11.1.0**: Unique identifier generation
- **Google Tag Manager**: GDPR-compliant analytics (optional)

## Development Setup

### Prerequisites

- **Node.js 18+**: Modern JavaScript runtime
- **npm/pnpm**: Package management
- **Git**: Version control system

### Installation

```bash
# Clone repository
git clone https://github.com/ra100/trmn-course-tracker.git
cd trmn-course-tracker

# Install dependencies
npm install

# Start development server
npm start
```

### Development Scripts

- `npm start` - Start development server (port 3001)
- `npm test` - Run tests in watch mode
- `npm run test:run` - Run tests once (CI mode)
- `npm run test:ui` - Run tests with interactive UI
- `npm run build` - Production build with course data generation
- `npm run build:courses` - Generate course JSON from markdown
- `npm run bundle:analyze` - Analyze bundle size and dependencies
- `npm run lint` - Check code quality and style
- `npm run type-check` - TypeScript type checking

## Technical Constraints

### Performance Requirements

- **Load Time**: Sub-2-second initial load time
- **Bundle Size**: Optimized for fast loading on various network conditions
- **Runtime Performance**: 60fps animations and smooth interactions
- **Memory Usage**: Efficient state management to prevent memory leaks

### Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (last 2 versions)
- **Mobile Browsers**: iOS Safari, Chrome Mobile, Samsung Internet
- **Progressive Enhancement**: Graceful degradation for older browsers

### Accessibility Requirements

- **WCAG 2.1 AA**: Web Content Accessibility Guidelines compliance
- **Screen Reader Support**: Comprehensive ARIA labels and semantic HTML
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: High contrast ratios for all text elements

### Security Constraints

- **No External Data**: All course data bundled at build time
- **Local Storage Only**: User progress stored locally (no server persistence)
- **GDPR Compliance**: Privacy-first analytics with user consent
- **CSP Compatible**: Content Security Policy compatibility

## Dependencies

### Production Dependencies

- **@ark-ui/react**: Accessible UI component library
- **@tanstack/react-query**: Data fetching and caching
- **react, react-dom**: Core React framework
- **styled-components**: CSS-in-JS styling
- **typescript**: Type safety
- **uuid**: Unique identifier generation

### Development Dependencies

- **@eslint/js**: JavaScript linting
- **@pandacss/dev**: Panda CSS development tools
- **@park-ui/panda-preset**: Park UI Panda CSS preset
- **@tanstack/react-query-devtools**: React Query debugging tools
- **@testing-library/\***: Testing utilities
- **@types/\***: TypeScript type definitions
- **@vitejs/plugin-react**: Vite React plugin
- **eslint**: Code linting
- **eslint-plugin-\***: ESLint plugins
- **globals**: ESLint global variables
- **jsdom**: DOM implementation for testing
- **rollup-plugin-visualizer**: Bundle analysis
- **tsx**: TypeScript execution
- **typescript-eslint**: TypeScript ESLint integration
- **vite**: Build tool
- **vite-tsconfig-paths**: TypeScript path mapping
- **vitest**: Testing framework

## Tool Usage Patterns

### Development Workflow

1. **Feature Development**: Create feature branch from main
2. **Component Development**: Build components with TypeScript and tests
3. **State Management**: Use custom hooks for complex state logic
4. **Styling**: Panda CSS for design system, styled-components for dynamic styles
5. **Testing**: Write tests alongside component development
6. **Code Review**: Ensure type safety and test coverage

### Build Process

1. **Course Data Generation**: `buildCourseData.ts` processes markdown to JSON
2. **TypeScript Compilation**: Vite handles TypeScript compilation
3. **CSS Generation**: Panda CSS generates optimized styles
4. **Bundle Optimization**: Vite optimizes for production
5. **Static Asset Handling**: Images and icons copied to build directory

### Testing Strategy

- **Unit Tests**: Individual functions and utilities
- **Component Tests**: React Testing Library for component behavior
- **Integration Tests**: Full user interaction flows
- **Accessibility Tests**: Automated accessibility validation
- **Performance Tests**: Bundle size and loading performance

### Deployment Process

1. **Automated Testing**: GitHub Actions runs full test suite
2. **Production Build**: Optimized build with course data
3. **Bundle Analysis**: Performance monitoring and optimization
4. **Static Deployment**: GitHub Pages hosting
5. **Cache Invalidation**: Proper cache headers for updates
