# Tempu Task

<div align="center">
  <img src="/public/icons/logo.svg" alt="Tempu Task Logo" width="120"/>
  
  **AI-Powered Productivity & Time Tracking**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
</div>

## 📋 Overview

Tempu Task is an innovative application designed to help you take control of your time with cutting-edge AI technology. Whether you're a freelancer, student, or professional, Tempu Task empowers you to track tasks, identify distractions, and unlock powerful insights to optimize your workday.

## ✨ Key Features

- **🤖 AI-Driven Insights**: Analyze your work patterns and receive personalized recommendations to improve efficiency
- **🎯 Focus Mode**: Enjoy distraction-free sessions with customizable timers to boost concentration
- **📊 Comprehensive Reports**: Generate detailed productivity reports, export timesheets, and simplify client billing
- **📅 Advanced Scheduling**: Get an optimized daily plan based on your unique productivity patterns
- **🎁 Free Trial**: Start with a 30-day free trial, no credit card required


## 🛠️ Tech Stack

- **Frontend**
  - React with Next.js
  - Tailwind CSS for styling
  - React Context API for state management
- **Backend**
  - Supabase for authentication and database
  - Node.js
- **Authentication**
  - Custom auth system integrated with `AuthContext`
- **Components**
  - Custom-built feature carousel
  - Reports showcase
  - Focus timer
  - Analytics dashboard

## 🚀 Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm 7.x or higher
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MfFischer/Temputask.git
   cd Temputask
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your environment variables in `.env.local`

4. Start the development server:
   ```bash
   npm run dev
   ```

## 📦 Project Structure

```
tempos-ai/
├── packages/
│   ├── frontend/     # Next.js frontend application
│   ├── shared/       # Shared utilities and types
│   └── extension/    # Browser extension
├── .env.example      # Example environment variables
└── package.json      # Root package.json
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape Tempu Task
- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

## 📧 Contact

- Project Link: [https://github.com/MfFischer/Temputask](https://github.com/MfFischer/Temputask)
- Website: [https://temputask.com](https://temputask.com)