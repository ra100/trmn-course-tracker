# TRMN Course Tracker

An interactive React TypeScript application that visualizes TRMN (The Royal Manticoran Navy) course prerequisites as an RPG-style skill tree. Track your completed courses, see what's available to take next, and monitor your progress through the educational system.

## Features

### Interactive Skill Tree

- **Visual Course Grid**: Interactive grid layout showing all courses organized by section
- **Color-coded Status**:
  - 🟢 Green: Completed courses
  - 🔵 Blue: Available courses (prerequisites met)
  - 🔴 Red: Selected course (highlighted)
  - ⚪ Gray: Locked courses (prerequisites not met)
- **Click to Select**: Click any course to view detailed information
- **Double-click to Complete**: Mark courses as completed with a double-click

### Alternative Prerequisites (OR Conditions)

- **OR Logic Support**: Full support for alternative prerequisites using "or" conditions
- **Examples**:
  - `SIA-RMN-0005 or GPU-ALC-0009` - Either prerequisite satisfies the requirement
  - `SIA-RMN-0103 or GPU-ALC-0010` - Choose your path through the skill tree
- **Smart Parsing**: Automatically detects and handles OR conditions in course data
- **Eligibility Engine**: Real-time evaluation of alternative paths to course completion
- **UI Display**: Clear indication of alternative prerequisites in course details

### Progress Tracking

- **Real-time Updates**: Course availability updates automatically as you complete prerequisites
- **Progress Statistics**:
  - Overall completion percentage
  - Section-level progress tracking
  - Achievement milestones
- **Local Storage**: Your progress is saved locally and persists between sessions

### Advanced Filtering

- **Section Filtering**: Filter courses by department (e.g., Engineering, Tactical, Medical)
- **Level Filtering**: Filter by course level (A, C, D, W courses)
- **Completion Status**: Show all, completed, available, or locked courses
- **Search**: Real-time search across course names and codes

### Course Information

- **Detailed Prerequisites**: View all required prerequisite courses with OR alternatives clearly marked
- **Unlocked Courses**: See what courses become available after completing current selection
- **Course Metadata**: Section, subsection, course level, and full descriptions
- **Space Warfare Pin**: Special tracking for OSWP/ESWP qualification requirements

## Technical Architecture

### Frontend Stack

- **React 18** with TypeScript for type safety and modern hooks
- **Styled Components** for CSS-in-JS styling with theme support
- **Local State Management** using React hooks and Context API
- **Custom Hook Architecture** for reusable stateful logic

### Data Processing

- **Markdown Parser**: Custom parser that extracts structured course data from markdown tables
- **Alternative Prerequisites Engine**: Advanced parsing of OR conditions with regex pattern matching
- **Dependency Graph**: Builds course relationship graph for prerequisite tracking
- **Eligibility Engine**: Real-time evaluation of course availability with OR logic support

### Testing

- **Vitest**: Modern test runner with TypeScript support
- **Comprehensive Test Suite**:
  - Alternative prerequisites parsing tests
  - Eligibility engine logic tests
  - Course relationship tests
  - OR condition edge case coverage
- **Test Coverage**: Parser, eligibility engine, and alternative prerequisite logic

### Type System

```typescript
// Enhanced prerequisite types supporting alternatives
export interface Prerequisite {
  type: PrerequisiteType
  code?: string
  description?: string
  required: boolean
  alternativePrerequisites?: Prerequisite[] // NEW: OR condition support
}

export type PrerequisiteType = 'course' | 'complex' | 'department_choice' | 'level_requirement' | 'alternative_group' // NEW: For OR conditions
```

## Course Categories

**Basic Training**

- Enlisted Training Center (SIA-RMN-0001 through 0006)
- Officer Training Center (SIA-RMN-0101 through 0106)
- War College (SIA-RMN-1001 through 1005)
- GPU Advanced Leadership College (GPU-ALC series) with OR prerequisites

**Technical Specialties**

- Command Department (Boatswain, Master-at-Arms, Operations, Intelligence)
- Administration (Personnelman, Yeoman, Navy Counselor)
- Logistics (Storekeeper, Disbursing Clerk, Ship's Serviceman, Steward)
- Tactical (Fire Control, Electronic Warfare, Tracking, Sensor, Weapons)
- Engineering (Propulsion, Environmental Systems)
- Communications (Data Systems, Electronics, Communications)
- Astrogation (Flight Operations, Helmsman, Plotting, Quartermaster)
- Medical (Corpsman, Sick Berth Attendant, Surgeon)

**Special Qualifications**

- Space Warfare Pin (OSWP/ESWP) with complex multi-path requirements

## Alternative Prerequisites Examples

The system now supports complex prerequisite relationships found in the GPU Advanced Leadership College:

```markdown
| Course Name         | Course Number | Prerequisites                |
| ------------------- | ------------- | ---------------------------- |
| Intro to Leadership | GPU-ALC-0010  | SIA-RMN-0005 or GPU-ALC-0009 |
| Advanced Management | GPU-ALC-0113  | SIA-RMN-0103 or GPU-ALC-0010 |
```

This allows for multiple valid paths through the course progression, giving users flexibility in their educational journey.

## Getting Started

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd trmn-course-tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run tests**

   ```bash
   npm test        # Interactive test mode
   npm run test:run # Single test run
   npm run test:ui  # Test UI interface
   ```

4. **Start development server**

   ```bash
   npm start
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Data Flow

1. **Markdown Parsing**: Course data loaded from `Courses.md` with OR condition detection
2. **Dependency Graph**: Built from parsed prerequisites including alternative paths
3. **State Management**: User progress tracked with Set-based completed courses
4. **Eligibility Calculation**: Real-time evaluation of available courses using OR logic
5. **UI Updates**: Components re-render when progress changes, showing new available courses

## Future Enhancements

- **Import/Export**: Save and share progress data
- **Achievement System**: Badges for reaching milestones
- **Recommendation Engine**: Suggest optimal course paths
- **Social Features**: Compare progress with peers
- **Advanced Analytics**: Detailed progress reports and statistics
- **Complex OR Combinations**: Support for mixed AND/OR prerequisite expressions
- **Prerequisite Visualization**: Graph view of course dependencies

## Contributing

This project uses TypeScript for type safety and Vitest for testing. All new features should include comprehensive tests, especially for alternative prerequisite logic.

## License

MIT License - Feel free to use this for your own course tracking needs!

## Acknowledgments

- **TRMN**: For providing the comprehensive course structure
- **Course Data**: Based on official TRMN training materials
- **Community**: Thanks to all TRMN members who provided feedback and suggestions

---

_This application transforms complex course prerequisites into an intuitive, gamified learning experience, making it easier for TRMN members to track their educational progress and plan their career advancement._
