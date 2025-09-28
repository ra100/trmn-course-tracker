# Context

## Current Work Focus

The TRMN Course Tracker is a mature, production-ready React application with comprehensive course tracking functionality. The application successfully handles complex course prerequisite chains, provides visual skill tree navigation, and supports multi-language interfaces with an enhanced course aliasing system.

### Core Functionality Status

- ✅ **Course Data Processing**: Robust markdown parser handles complex course formats (SIA-RMN, SIA-SRN, RMACA, MU, LU, GPU-ALC, GPU-TRMN)
- ✅ **Course Aliasing System**: GPU-TRMN-0001 ↔ SIA-RMN-0001 equivalence for introductory courses
- ✅ **Eligibility Engine**: Advanced prerequisite resolution with support for course aliases and complex requirements
- ✅ **Interactive Skill Tree**: Visual course dependency graph with unlock progression
- ✅ **Progress Tracking**: Complete user progress management with localStorage persistence
- ✅ **Multi-language Support**: English and Czech language support with i18n system
- ✅ **Mobile Responsive**: Fully responsive design working on all device sizes
- ✅ **GDPR Compliance**: Privacy-first analytics with user consent management

### Recent Development Activity

- **Course Aliasing System**: Implemented GPU-TRMN course series as equivalents to existing RMN courses
- **Enhanced Type System**: Added branded types and JSDoc documentation for better developer experience
- **End-to-End Testing**: Comprehensive Playwright test suite with 27 test scenarios
- **TRMN Wiki Integration**: Framework for automated course data collection from BuTrain category
- **Dependency Management**: Updated 21 packages across React ecosystem, TypeScript, and development tools

## Recent Changes

### Latest Features

- **Course Aliasing System**: GPU-TRMN-0001, 0002, 0003 series as introductory course equivalents
- **Enhanced Course Data**: Support for course aliases, institution tracking, and introductory course detection
- **TRMN Wiki Integration**: Automated course data collection from TRMN's BuTrain category
- **End-to-End Testing**: Comprehensive browser testing with Playwright across Chrome, Firefox, and WebKit
- **JSDoc Documentation**: Enhanced developer experience with comprehensive interface documentation

### Technical Improvements

- **Type Safety**: Enhanced TypeScript interfaces with branded types and comprehensive JSDoc
- **Build Optimization**: Maintained sub-2s build times despite major version updates (React 19.x, Vite 7.x)
- **Test Coverage**: 369 passing tests including 27 end-to-end browser tests
- **Course Processing**: Enhanced parser to handle course aliases and institution extraction
- **Eligibility Engine**: Updated to recognize course aliases in prerequisite checking

## Next Steps

### Immediate Priorities

1. **JSDoc Documentation**: Add comprehensive documentation to all interfaces and complex business logic
2. **TRMN Wiki Integration**: Implement actual web scraping for automated course data collection
3. **Performance Monitoring**: Track and optimize application performance metrics
4. **Bundle Optimization**: Continue monitoring and optimizing bundle size

### Future Enhancements

1. **Advanced Analytics**: Enhanced progress insights and course recommendations
2. **Course Reminders**: Automated notifications for course availability
3. **Social Features**: Share progress with other TRMN members
4. **Advanced Visualizations**: Enhanced progress charts and department statistics
5. **Offline Sync**: Enable progress synchronization across devices

### Maintenance Tasks

1. **Dependency Updates**: Keep React, TypeScript, and build tools current
2. **Security Audits**: Regular security reviews and updates
3. **Performance Monitoring**: Ongoing bundle size and loading performance tracking
4. **Browser Compatibility**: Ensure compatibility with modern browsers
