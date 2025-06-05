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

### Available Scripts

- `npm start` - Start development server
- `npm test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:ui` - Run tests with UI
- `npm run build` - Build for production
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

- Course parser functionality (20 tests)
- Eligibility engine logic (7 tests)
- Settings panel component (12 tests)
- **Total: 39 tests**

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

1. Course data is loaded from `public/Courses.md`
2. CourseParser converts markdown to structured data
3. EligibilityEngine calculates course availability
4. Components render filtered and sorted courses
5. User progress is saved to localStorage

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
