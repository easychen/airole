# Contributing to AIRole.net

We welcome contributions to AIRole.net! This document provides guidelines for contributing to the project.

## 🚀 Quick Start

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/easychen/airole.git
   cd airole
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
5. **Make your changes**
6. **Test your changes**
   ```bash
   npm run dev
   ```
7. **Commit and push**
   ```bash
   git commit -m "Add your feature"
   git push origin feature/your-feature-name
   ```
8. **Create a Pull Request**

## 📝 Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow existing code formatting (use Prettier if available)
- Use meaningful variable and function names
- Add comments for complex logic

### Component Structure

- Place components in the `components/` directory
- Use the existing UI component library (shadcn/ui)
- Keep components focused and reusable
- Follow the existing file naming conventions

### API Routes

- Place API routes in `app/api/`
- Use proper HTTP status codes
- Include error handling
- Validate input parameters

## 🐛 Bug Reports

When reporting bugs, please include:

- **Description**: Clear description of the issue
- **Steps to Reproduce**: Detailed steps to reproduce the bug
- **Expected Behavior**: What you expected to happen
- **Actual Behavior**: What actually happened
- **Environment**: Browser, OS, device type
- **Screenshots**: If applicable

## 💡 Feature Requests

For feature requests, please include:

- **Problem**: What problem does this solve?
- **Solution**: Describe your proposed solution
- **Alternatives**: Any alternative solutions you considered
- **Additional Context**: Any other relevant information

## 🔧 Development Setup

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm

### Environment Variables

Create a `.env.local` file for testing (see `env-example.md`):

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=test-secret
# Optional: Google OAuth credentials for testing Google Drive features
```

### Running Tests

Currently, the project doesn't have automated tests, but manual testing is important:

1. Test the main character creation flow
2. Test image upload and analysis
3. Test chat functionality
4. Test export features
5. Test responsive design on mobile

## 📋 Pull Request Process

1. **Update Documentation**: Update README or other docs if needed
2. **Test Thoroughly**: Ensure your changes don't break existing functionality
3. **Keep It Focused**: One feature/fix per PR
4. **Write Clear Commit Messages**
5. **Update Changelog**: Add your changes to the changelog if applicable

### PR Checklist

- [ ] Code follows existing style guidelines
- [ ] Self-review completed
- [ ] Manual testing completed
- [ ] Documentation updated (if needed)
- [ ] No console errors or warnings
- [ ] Mobile responsiveness checked
- [ ] Works without environment variables

## 🎯 Areas for Contribution

We especially welcome contributions in these areas:

### Core Features
- New AI model integrations
- Enhanced character book functionality
- Better mobile experience
- Performance optimizations

### UI/UX Improvements
- Better responsive design
- Accessibility improvements
- Theme enhancements
- Animation improvements

### Internationalization
- New language translations
- Right-to-left language support
- Better language detection

### Documentation
- Better user guides
- API documentation
- Video tutorials
- Code examples

## 🚫 What Not to Contribute

Please avoid:

- Breaking changes without discussion
- Large refactors without prior approval
- Adding heavy dependencies
- Removing existing functionality
- Changes that require a database

## 📞 Getting Help

- **Discord**: Join our community (link TBD)
- **Discussions**: Use GitHub Discussions for questions
- **Issues**: Use GitHub Issues for bugs and feature requests

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- The project README
- Release notes for significant contributions
- Special thanks section

Thank you for contributing to AIRole.net! 🎉 