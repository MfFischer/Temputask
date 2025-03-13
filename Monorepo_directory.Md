tempos-ai/                         # Root directory
├── .env                          # Environment variables
├── package.json                  # Root package.json with workspace configuration
├── README.md                     # Project documentation
├── packages/                     # All workspace packages
│   ├── frontend/                 # Next.js frontend application
│   │   ├── package.json          # Frontend package.json
│   │   ├── .env          
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
│   │       │   │   ├── DistractionPromptModal.js
│   │       │   ├── common/       # Common UI components
│   │       │   │   ├── Button.js 
│   │       │   │   ├── Card.js
│   │       │   │   ├── FeatureCarousel.js
│   │       │   │   ├──ReportsFeatureShowcase.js
│   │       │   │   ├── NotificationBell.js
│   │       │   │   ├── NotificationBell.js
│   │       │   │   ├── NotificationsList.js
│   │       │   │   ├── ThemeToggle.js
│   │       │   │   ├── Modal.js
│   │       │   │   └── ConsentPopup.js
│   │       │   ├── layout/       # Layout components
│   │       │   │   ├── Header.js
│   │       │   │   ├── AppLayout.js
│   │       │   │   ├── Sidebar.js
│   │       │   │   ├── Footer.js
│   │       │   │   ├── LandingLayout.js
│   │       │   │   ├── PublicHeader.js
│   │       │   │   └── Layout.js
│   │       │   ├── dashboard/    # Dashboard components
│   │       │   │   ├── TimerWidget.js
│   │       │   │   ├── DailyReport.js
│   │       │   │   ├── MiniFocusTimer.js
│   │       │   │   ├── Dashboard.js
│   │       │   │   ├── InsightCard.js
│   │       │   │   ├── PeakHourCard.js
│   │       │   │   └── AvgTimeCard.js
│   │       │   ├── projects/     # Project management components
│   │       │   │   ├── ProjectList.js
│   │       │   │   ├── AddProjectForm.js  # UPDATED
│   │       │   │   ├── CompanyList.js     # NEW
│   │       │   │   ├── AddCompanyForm.js  # NEW
│   │       │   │   ├── ActivityList.js    # NEW
│   │       │   │   └── AddActivityForm.js # NEW
│   │       │   ├── insights/     # Insights components   
│   │       │   │   ├── DistractionPatterns.js
│   │       │   │   ├── ContextSwitchingAnalysis.js
│   │       │   │   ├── PeerComparison.js
│   │       │   │   ├── OptimalScheduleGenerator.js
│   │       │   │   ├──FlowStateAnalysis.js
│   │       │   │   └── Recommendations.js
│   │       │   ├── mobile/      
│   │       │   │   ├── QuickStartTimer.js
│   │       │   │   └── MobileTimerControls.js
│   │       │   ├── reports/     # Report components
│   │       │   │   ├── SiteActivityReport.js
│   │       │   │   ├── ReportControls.js        # NEW - Controls for exporting reports
│   │       │   │   ├── ExportModal.js           # NEW - Email export modal
│   │       │   │   ├── DateRangePicker.js       # NEW - Enhanced date range picker
│   │       │   │   ├── TimeDistributionChart.js # NEW - Project time distribution chart
│   │       │   │   ├── ProductivityChart.js     # NEW - Productivity tracking chart
│   │       │   │   ├── ClientReportExportModal.js  # NEW - Client report modal
│   │       │   │   └── ImprovedReportControls.js   # NEW - Enhanced report controls
│   │       │   ├── settings/     # Settings components            
│   │       │   │   ├── NotificationSettings.js
│   │       │   │   ├── CompanyProfile.js         # NEW - Company profile component
│   │       │   │   └── SettingsNavigation.js     # NEW - Settings navigation
│   │       │   └── focus/        # Focus mode components
│   │       │       ├── FocusTimer.js
│   │       │       ├── FocusStats.js
│   │       │       ├── CustomTimerInput.js
│   │       │       └── DistractionPrompt.js
│   │       ├── pages/            # Next.js pages
│   │       │   ├── _app.js
│   │       │   ├── index.js      # Dashboard page
│   │       │   ├── projects.js   # Projects page
│   │       │   ├── companies.js  # NEW - Companies page
│   │       │   ├── terms.js 
│   │       │   ├── upgrade.js  
│   │       │   ├── success.js   
│   │       │   ├── dashboard.js
│   │       │   ├── reports.js    # UPDATED - Now with export features
│   │       │   ├── focus.js     
│   │       │   ├── insights.js      
│   │       │   ├── privacy.js    
│   │       │   ├── settings.js   
│   │       │   ├── settings/     # Settings pages
│   │       │       ├── notifications.js
│   │       │       ├── integrations.js
│   │       │       ├── billing.js
│   │       │       ├── team.js
│   │       │   │   └── company-profile.js     # NEW - Company profile page
│   │       │   ├── extension-setup.js  
│   │       │   ├── api/            
│   │       │   │     ├──  timeTracking/
│   │       │   │     │     ├──startTimer.js
│   │       │   │     │     ├──stopTimer.js
│   │       │   │     │     ├──getTimeEntries.js
│   │       │   │     │     └── logDistraction.js
│   │       │   │     ├──  user/
│   │       │   │     │     ├──dataExport.js
│   │       │   │     │     └── deleteData.js
│   │       │   │     ├── webhooks/
│   │       │   │     │     └── stripe.js
│   │       │   │     ├──  subscriptions/
│   │       │   │     │     ├──getTrialStatus.js
│   │       │   │     │     ├──createCheckoutSession.js
│   │       │   │     │     ├──createCustomerPortalSession.js
│   │       │   │     │     ├──getUserSubscription.js
│   │       │   │     │     └── upgradePlan.js
│   │       │   │     ├──  debug/
│   │       │   │     │     ├──auth-status.js
│   │       │   │     ├──  reports/                # NEW - Report API routes
│   │       │   │     │     └──emailReport.js      # NEW - API endpoint for emailing reports
│   │       │   │     ├── companies/              
│   │       │   │     │     ├──createCompany.js    
│   │       │   │     │     ├──getCompanies.js     
│   │       │   │     │     ├──updateCompany.js    
│   │       │   │     │     └──deleteCompany.js    
│   │       │   │     ├── companyProfiles/         # NEW - Company profile API routes
│   │       │   │     │     ├──getCompanyProfile.js # NEW - Get company profile
│   │       │   │     │     ├──updateCompanyProfile.js # NEW - Update company profile
│   │       │   │     │     └──uploadLogo.js        # NEW - Upload company logo
│   │       │   │     ├── activities/              
│   │       │   │     │     ├──createActivity.js   
│   │       │   │     │     ├──getActivities.js    
│   │       │   │     │     ├──updateActivity.js   
│   │       │   │     │     └──deleteActivity.js   
│   │       │   │     └── projects/
│   │       │   │           ├──createProject.js     
│   │       │   │           ├──updateProject.js     
│   │       │   │           ├──deleteProject.js
│   │       │   │           └──getProjects.js
│   │       │   └── auth/         # Authentication pages
│   │       │       ├── login.js
│   │       │       └── signup.js
│   │       ├── hooks/            # Custom React hooks
│   │       │   ├── useTimeTracking.js
│   │       │   ├── useAuth.js
│   │       │   ├── useProjects.js        
│   │       │   ├── useCompanies.js       
│   │       │   ├── useActivities.js  
│   │       │   ├── useCompanyProfile.js  # NEW - Hook for company profile    
│   │       │   └── useFocus.js
│   │       ├── utils/            # Utility functions
│   │       │   ├── timeUtils.js
│   │       │   ├── chartData.js
│   │       │   └── reportGenerator.js   # NEW - Report generation utilities
│   │       ├── settings/         # User settings components/            
│   │       │   ├── NotificationSettings.js
│   │       ├── reports/          # Report components/            
│   │       │   ├── SiteActivityReport.js
│   │       ├── lib/                 
│   │       │   ├── db.js
│   │       ├── contexts/         # React contexts
│   │       │   ├── AuthContext.js
│   │       │   ├── NotificationContext.js
│   │       │   ├── FocusContext.js
│   │       │   ├── getTodayEntries.js
│   │       │   └── TimeTrackingContext.js
│   │       ├── styles/           # CSS styles
│   │       │   ├── globals.css
│   │       │   ├── dark-mode-fixes.css
│   │       │   └── tailwind.css
│   │       ├── app/             
│   │       │   └── provider.js
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
│   └── shared/                  # Shared code and types
│       ├── package.json         # Shared package.json
│       ├── tsconfig.json        # TypeScript configuration
│       ├── dist/                # Compiled output (generated)
│       └── src/                 # Source code
│           ├── index.ts         # Main exports
│           ├── lib/             # Shared utilities
│           │   ├── db.js        # Database utilities
│           │   ├──analytics.js  # Analytics utilities       
│           │   └── time.js      # Time formatting utilities
│           ├── migrations/      # Database migrations
│           │   ├── 20231001_create_users_table.sql
│           │   ├── 20231002_create_projects_table.sql
│           │   ├── 20231003_create_time_entries_table.sql
│           │   └── company_profiles_table.sql  # NEW - SQL for company profiles table
│           └── types/           # TypeScript type definitions
│               ├── user.ts      # User types
│               ├── project.ts   # Project types
│               ├── companyProfile.ts   # NEW - Company profile types
│               └── timeEntry.ts # Time entry types
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