<<<<<<< HEAD
# 🤖 Lexer - AI Code Tutor

**Your personal AI-powered programming tutor that makes learning to code intuitive, interactive, and fun.**

Lexer is a comprehensive educational platform that combines AI-powered tutoring with gamified learning experiences. Whether you're exploring existing codebases, learning new programming concepts, or studying any subject, Lexer adapts to your learning style and pace.

## ✨ Features

### 🔍 **Code Explainer**
- Navigate file structures with a VS Code-inspired interface
- Get AI-powered explanations for any code snippet
- Generate comprehensive file summaries
- Receive intelligent suggestions for code improvements
- Test your understanding with automatically generated quizzes

### 📚 **Topic Tutor**
- Learn any programming concept from scratch
- Structured lessons with clear explanations and examples
- Interactive code demonstrations
- Hands-on exercises to reinforce learning
- Progress tracking and skill assessment

### 🧠 **Universal AI Tutor**
- Multi-subject learning beyond just programming
- Adaptive teaching methods (analogies, deep dives, examples)
- Gamified experience with XP, levels, and achievements
- Interactive quizzes and activities
- Personalized learning paths

### 🎮 **Gamification System**
- Earn XP for completing lessons and quizzes
- Unlock badges for various achievements
- Level progression system
- Daily usage tracking with limits
- Progress visualization

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB database
- Google AI API key (for Genkit integration)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ai-code-tutor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/ai-code-tutor

   # Authentication
   JWT_SECRET=your-super-secret-jwt-key-here

   # Google AI (for Genkit)
   GOOGLE_API_KEY=your-google-ai-api-key

   # Redis (optional, for caching)
   REDIS_URL=redis://localhost:6379
   DISABLE_CACHE=false

   # Node Environment
   NODE_ENV=development
   ```

4. **Set up the database**
   
   Make sure MongoDB is running and accessible. The application will automatically create the necessary collections.

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Start the AI development server** (in a separate terminal)
   ```bash
   npm run genkit:dev
   ```

7. **Open your browser**
   
   Navigate to `http://localhost:9002` to access the application.

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons
- **React Hook Form** - Form management

### Backend
- **Next.js API Routes** - Backend API endpoints
- **MongoDB** - Document database
- **Redis** - Caching layer (optional)
- **bcryptjs** - Password hashing
- **jose** - JWT token handling

### AI Integration
- **Google Genkit** - AI flow orchestration
- **Google AI** - Large language model integration
- **Zod** - Schema validation for AI inputs/outputs

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── explainer/         # Code explainer interface
│   ├── tutor/             # Topic tutor interface
│   └── universal-tutor/   # Universal tutor interface
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── auth/             # Authentication components
│   └── ai/               # AI-specific components
├── ai/                    # AI flows and logic
│   └── flows/            # Genkit AI flows
├── lib/                   # Utility libraries
├── models/               # Data models and types
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
└── services/             # External service integrations
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server on port 9002
npm run genkit:dev       # Start Genkit AI development server
npm run genkit:watch     # Start Genkit with file watching

# Production
npm run build            # Build the application
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript type checking
```

## 🌟 Key Features Explained

### AI-Powered Learning
Leveraging Google's Genkit framework, Lexer provides sophisticated AI tutoring capabilities:
- **Contextual Code Explanations**: Understands code context and provides relevant explanations
- **Adaptive Lesson Generation**: Creates personalized lessons based on your topic interests
- **Intelligent Q&A**: Answers questions about your learning material using Socratic methods

### Gamification System
- **XP System**: Earn experience points for learning activities
- **Achievement Badges**: Unlock badges for milestones and accomplishments  
- **Progress Tracking**: Visual progress indicators and learning analytics
- **Daily Limits**: Responsible AI usage with daily interaction limits

### Modern UI/UX
- **Dark Mode**: Eye-friendly dark theme for coding sessions
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Accessibility**: Built with accessibility-first principles using Radix UI
- **VS Code-inspired**: Familiar interface for developers

## 🔒 Authentication & Security

- **JWT-based Authentication**: Secure token-based user sessions
- **Password Hashing**: bcryptjs for secure password storage
- **Password Reset**: Email-based password recovery system
- **Protected Routes**: Secure API endpoints with authentication middleware

## 📊 Data Models

### User Model
- Profile information (name, email)
- Gamification data (XP, level, badges)
- Learning progress tracking
- AI usage limits and tracking

### Lesson Model
- Structured lesson content
- Code examples and explanations
- Assessment quizzes
- Progress indicators

## 🚀 Deployment

### Environment Setup
1. Set up a MongoDB Atlas cluster or self-hosted MongoDB instance
2. Configure Redis for caching (optional but recommended)
3. Obtain Google AI API credentials
4. Set up your production environment variables

### Deployment Platforms
- **Vercel** (recommended) - seamless Next.js deployment
- **Netlify** - alternative hosting platform  
- **Docker** - containerized deployment
- **Self-hosted** - on your own servers

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues, feature requests, or pull requests.

### Development Guidelines
1. Follow TypeScript best practices
2. Use the existing component patterns
3. Maintain accessibility standards
4. Add tests for new features
5. Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Genkit** - AI orchestration framework
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Utility-first CSS framework
- **Next.js** - React framework
- **Vercel** - Deployment platform

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Contact our support team through the app
- Check our documentation and FAQ

---

**Happy Learning! 🎉**

Built with ❤️ for developers who love to learn and teach.
=======
