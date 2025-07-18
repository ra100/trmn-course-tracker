# TRMN Course Tracker

A modern skill tree tracker for The Royal Manticoran Navy (TRMN) course system. This application helps members track their progress through various courses, prerequisites, and career paths.

## Features

- 📊 **Interactive Course Tree**: Visual representation of all TRMN courses
- 🔍 **Smart Filtering**: Filter by section, level, or completion status
- ✅ **Progress Tracking**: Mark courses as completed and track prerequisites
- 🎯 **Eligibility Engine**: Automatically determines which courses are available
- ⚙️ **Customizable Settings**: Toggle visibility of completed/locked courses
- 💾 **Auto-save**: Progress is automatically saved to local storage
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🍪 **GDPR Compliant**: Privacy-first analytics with user consent management
- 🌍 **Multi-language**: Available in English and Czech

## Live Demo

Visit the live application: [TRMN Course Tracker](https://ra100.github.io/trmn-course-tracker)

## Local Development

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/ra100/trmn-course-tracker.git
cd trmn-course-tracker

# Install dependencies
npm install

# Start development server
npm start
```

The application will be available at `http://localhost:3001`.

### Environment Variables

For production builds with analytics, set this environment variable:

```bash
# Google Tag Manager ID (format: GTM-XXXXXXX)
VITE_GTM_ID=GTM-XXXXXXX
```

**Note**: Analytics are automatically disabled in development mode.

### Privacy & Analytics

The application includes GDPR-compliant analytics with the following features:

- **Privacy-first approach**: Analytics are disabled by default
- **User consent**: GDPR consent banner allows users to control analytics
- **Essential cookies only**: Only functional and security cookies are enabled by default
- **Transparent data collection**: Clear information about what data is collected
- **Consent persistence**: User preferences are remembered across sessions
- **Multi-language support**: Consent interface available in English and Czech

Analytics help improve the application by understanding:

- Which courses are most popular
- User navigation patterns
- Performance metrics
- Error tracking for bug fixes

All analytics data is collected anonymously and used solely for improving the user experience.

### Available Scripts

- `npm start` - Start development server
- `npm test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:ui` - Run tests with UI
- `npm run build` - Build for production (includes course data generation)
- `npm run build:courses` - Generate course data JSON from markdown
- `npm run deploy` - Deploy to GitHub Pages (manual)

## Testing

The project uses Vitest and React Testing Library for testing:

```bash
# Run all tests
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI
npm run test:ui
```

Current test coverage includes:

- Course parser functionality (33 tests)
- Course data loader (3 tests)
- Eligibility engine logic (7 tests)
- Component testing (87 tests)
- **Total: 130 tests**

## Deployment

### Automatic Deployment (GitHub Actions)

The project is configured for automatic deployment to GitHub Pages using GitHub Actions. Every push to the `main` branch will:

1. Run all tests
2. Build the production version
3. Deploy to GitHub Pages

### Manual Deployment

You can also deploy manually:

```bash
npm run deploy
```

### GitHub Pages Setup

1. **Enable GitHub Pages**:

   - Go to your repository settings
   - Navigate to "Pages" section
   - Source: "GitHub Actions"

2. **Required Permissions**:
   The GitHub Actions workflow needs these permissions (already configured):

   - `contents: read`
   - `pages: write`
   - `id-token: write`

3. **Branch Protection** (Optional):
   - Protect your main branch
   - Require status checks to pass before merging
   - Include the "test" job from the workflow

## Architecture

### Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Styled Components** - CSS-in-JS styling
- **Vitest** - Testing framework
- **React Testing Library** - Component testing utilities

### Key Components

- **CourseParser** - Parses markdown course data
- **EligibilityEngine** - Determines course availability
- **SkillTreeView** - Main course display component
- **SettingsPanel** - User preferences management
- **FilterPanel** - Course filtering controls

### Data Flow

1. **Build Time**: Course data is parsed from `public/courses.md` and pre-built into `public/courses.json`
2. **Runtime**: Pre-parsed JSON data is loaded directly (no markdown parsing)
3. EligibilityEngine calculates course availability
4. Components render filtered and sorted courses
5. User progress is saved to localStorage

### Course Data Build Process

The application uses a build-time optimization for better performance:

- **Source**: `public/courses.md` - Markdown file with course data
- **Generated**: `public/courses.json` - Pre-parsed JSON (auto-generated)
- **Build Script**: `scripts/buildCourseData.ts` - Converts markdown to JSON

This approach:

- ✅ Eliminates runtime markdown parsing
- ✅ Reduces bundle size and startup time
- ✅ Maintains the same course data structure
- ✅ Automatically runs during `npm run build`

## Course Data Format

The application expects course data in a specific markdown format. See `public/Courses.md` for the complete structure.

Example:

```markdown
## Section Name

### Subsection Name

**Course Code**: Course Name

- **Prerequisites**: PREV-COURSE-001, PREV-COURSE-002
- **Level**: A
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass: `npm run test:run`
6. Commit your changes: `git commit -m 'Add feature'`
7. Push to your branch: `git push origin feature-name`
8. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **The Royal Manticoran Navy** for the course structure and data
- **React and TypeScript communities** for excellent tooling
- **Testing Library** for making component testing enjoyable

---

_This application transforms complex course prerequisites into an intuitive, gamified learning experience, making it easier for TRMN members to track their educational progress and plan their career advancement._
