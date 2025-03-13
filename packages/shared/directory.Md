´´´
tempos-ai/                         # Root directory
├── .env                          # Environment variables
├── package.json                  # Root package.json with workspace configuration
├── README.md                     # Project documentation
├── packages/                     # All workspace packages
│   ├── frontend/                 # Next.js frontend application
│   │   ├── package.json          # Frontend package.json
│   │   ├── next.config.js        # Next.js configuration
│   │   ├── tailwind.config.js    # Tailwind CSS configuration
│   │   ├── postcss.config.js     # PostCSS configuration
│   │   ├── public/               # Static assets
│   │   │   ├── icons/            # Icons and SVGs
│   │   │   │   ├── favicon.ico   # Favicon
│   │   │   │   └── logo.svg      # Logo SVG
│   │   │   └── images/           # Images
│   │   │       └── dashboard-preview.png
│   │   └── src/                  # Frontend source code
│   │       ├── components/       # React components
│   │       │   ├── common/       # Common UI components
│   │       │   │   ├── Button.js 
│   │       │   │   ├── Card.js
│   │       │   │   ├── NotificationBell.js 
│   │       │   │   ├── NotificationsList.js
│   │       │   │   └── ConsentPopup.js
│   │       │   ├── layout/       # Layout components
│   │       │   │   ├── Header.js
│   │       │   │   ├── Sidebar.js
│   │       │   │   └── Layout.js
│   │       │   ├── dashboard/    # Dashboard components
│   │       │   │   ├── Dashboard.js
│   │       │   │   ├── TimerWidget.js
│   │       │   │   ├── InsightCard.js
│   │       │   │   ├── DailyReport.js
│   │       │   │   ├── PeakHourCard.js
│   │       │   │   └── AvgTimeCard.js
│   │       │   ├── reports/      # Report components      
│   │       │   │   ├── SiteActivityReport.js
│   │       │   ├── settings/     # Settings components        
│   │       │   │   ├── NotificationSettings.js
│   │       │   ├── insights/      # Insights components
│   │       │   │   ├──DistractionPatterns.js
│   │       │   │   ├── Recommendations.js
│   │       │   ├── projects/     # Project management components
│   │       │   │   ├── ProjectList.js
│   │       │   │   └── AddProjectForm.js
│   │       │   └── focus/        # Focus mode components
│   │       │       ├── FocusTimer.js
│   │       │       └── DistractionPrompt.js
│   │       ├── pages/            # Next.js pages
│   │       │   ├── _app.js
│   │       │   ├── index.js      # Dashboard page
│   │       │   ├── projects.js   # Projects page
│   │       │   ├── insights.js   # Insights page
│   │       │   ├── reports.js   # Reports page
│   │       │   ├── privacy.js    # Privacy policy page
│   │       │   ├── settings.js   # User settings page
│   │       │   ├── extension-setup.js   # Extension setup page
│   │       │   └── auth/         # Authentication pages
│   │       │       ├── login.js
│   │       │       └── signup.js
│   │       ├── hooks/            # Custom React hooks
│   │       │   ├── useTimeTracking.js
│   │       │   ├── useAuth.js
│   │       │   ├── useProjects.js
│   │       │   └── useFocus.js
│   │       ├── utils/            # Utility functions
│   │       │   ├── timeUtils.js
│   │       │   └── chartData.js
│   │       ├── contexts/         # React contexts
│   │       │   ├── AuthContext.js
│   │       │   ├── NotificationContext.js
│   │       │   └── TimeTrackingContext.js
│   │       ├── styles/           # CSS styles
│   │       │   ├── globals.css
│   │       │   └── tailwind.css
│   │       └── api/              # API routes
│   │           ├── timeTracking/
│   │           │   ├── startTimer.js
│   │           │   ├── stopTimer.js
│   │           │   └── logDistraction.js
│   │           ├── projects/
│   │           │   ├── createProject.js
│   │           │   └── getProjects.js
│   │           └── user/
│   │               ├── dataExport.js
│   │               └── deleteData.js
│   ├── backend/                  # Supabase backend
│   │   ├── package.json          # Backend package.json
│   │   ├── migrations/           # Database migrations
│   │   │   ├── 20231001_create_users_table.sql
│   │   │   ├── 20231002_create_projects_table.sql
│   │   │   └── 20231003_create_time_entries_table.sql
│   │   ├── schema.sql            # Database schema
│   │   └── supabase/             # Supabase configuration
│   │       └── functions/        # Edge Functions
│   │           ├── auth/         # Authentication functions
│   │           │   ├── login.js
│   │           │   └── signup.js
│   │           ├── timeTracking/ # Time tracking functions
│   │           │   ├── startTimer.js
│   │           │   ├── stopTimer.js
│   │           │   └── logDistraction.js
│   │           ├── projects/     # Project management functions
│   │           │   ├── createProject.js
│   │           │   └── getProjects.js
│   │           ├── extension/   # Browser extension functions
│   │           │   ├── logSiteActivity.js
│   │           ├── analytics/  # Analytics functions
│   │           │   ├── getDistractionPatterns.js
│   │           ├── scheduled/   # Scheduled functions (e.g., daily summaries)
│   │           │   ├── scheduled/checkInactivity.js
│   │           └── user/         # User data functions
│   │               ├── dataExport.js
│   │               └── deleteData.js
│   └── shared/                  # Shared code and types
│   │    ├── package.json         # Shared package.json
│   │    ├── tsconfig.json        # TypeScript configuration
│   │    ├── dist/                # Compiled output (generated)
│   │    └── src/                 # Source code
│   │        ├── index.ts         # Main exports
│   │        ├── lib/             # Shared utilities
│   │        │   ├── db.js        # Database utilities
│   │        │   ├──analytics.js  # Analytics utilities       
│   │        │   └── time.js      # Time formatting utilities
│   │        └── types/           # TypeScript type definitions
│   │            ├── user.ts      # User types
│   │            ├── project.ts   # Project types
│   │           └── timeEntry.ts # Time entry types
│   └────extension/ 
│      ├── manifest.json
│      ├── background.js
│      ├── popup/
│      │   ├── popup.html
│      │   ├── popup.js
│      │   └── popup.css
│      ├── options/
│      │   ├── options.html
│      │   ├── options.js
│      └── package.json
└── node_modules/                # Dependencies (generated)

´´´