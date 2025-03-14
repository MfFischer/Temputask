const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('Starting improved static export enhancement for AWS Amplify...');

// Define the output directory
const outDir = path.join(__dirname, 'out');

// Check if the output directory exists
if (!fs.existsSync(outDir)) {
  console.error('Error: out directory does not exist');
  process.exit(1);
}

// Function to safely create directories
function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// Ensure _next directory exists
const nextDir = path.join(outDir, '_next');
ensureDirExists(nextDir);
ensureDirExists(path.join(nextDir, 'static'));
ensureDirExists(path.join(nextDir, 'static', 'chunks'));
ensureDirExists(path.join(nextDir, 'static', 'css'));

// Create or update the index.html file
console.log('Creating enhanced index.html file...');
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tempu Task</title>
  <!-- Define __NEXT_DATA__ early in the document -->
  <script>
    window.__NEXT_DATA__ = {
      props: { 
        pageProps: {}, 
        __N_SSG: true 
      },
      page: "/",
      query: {},
      buildId: "static-export-${Date.now()}",
      assetPrefix: "",
      runtimeConfig: {},
      nextExport: true,
      autoExport: true,
      isFallback: false,
      scriptLoader: []
    };
    console.log("__NEXT_DATA__ defined:", window.__NEXT_DATA__);
  </script>
  <style>
    html, body {
      background-color: black;
      margin: 0;
      padding: 0;
      height: 100%;
      overflow: hidden;
      color: white;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #__next {
      height: 100%;
      overflow: hidden;
      background-color: black;
    }
    .container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .header {
      padding: 1.5rem;
      display: flex;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .logo {
      width: 2.5rem;
      height: 2.5rem;
      background: #4f46e5;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 0.75rem;
      font-weight: bold;
    }
    .main {
      flex-grow: 1;
      padding: 2rem;
    }
    h1 {
      font-size: 3rem;
      margin-bottom: 1.5rem;
    }
    .gradient-text {
      background: linear-gradient(to right, #60a5fa, #6366f1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .auth-form {
      max-width: 24rem;
      margin: 3rem auto;
      padding: 2rem;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 0.5rem;
      background: rgba(255,255,255,0.05);
    }
    .form-title {
      text-align: center;
      margin-bottom: I.5rem;
    }
    .input-group {
      margin-bottom: 1rem;
    }
    .input-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      color: rgba(255,255,255,0.7);
    }
    .input-group input {
      width: 100%;
      padding: 0.75rem;
      background: rgba(0,0,0,0.5);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 0.25rem;
      color: white;
    }
    .submit-btn {
      width: 100%;
      padding: 0.75rem;
      background: #4f46e5;
      color: white;
      border: none;
      border-radius: 0.25rem;
      font-weight: 500;
      cursor: pointer;
    }
    .submit-btn:hover {
      background: #4338ca;
    }
    .toggle-auth {
      text-align: center;
      margin-top: 1.5rem;
      color: rgba(255,255,255,0.7);
    }
    .toggle-link {
      color: #818cf8;
      cursor: pointer;
      text-decoration: none;
    }
    .toggle-link:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div id="__next">
    <div id="app-loading" class="flex flex-col items-center justify-center min-h-screen bg-black">
      <div class="text-xl text-white mb-4">Loading Tempu Task...</div>
      <div class="text-sm text-gray-400">Initializing application</div>
    </div>
    <div id="app-content" style="display:none" class="container">
      <header class="header">
        <div class="logo">TT</div>
        <span class="text-xl font-bold">Tempu Task</span>
      </header>
      <main class="main">
        <h1>
          Take Control with<br />
          <span class="gradient-text">AI-Powered Productivity,</span><br />
          Your Way
        </h1>
        <div class="auth-form">
          <h2 class="form-title">Sign in to Tempu Task</h2>
          <form>
            <div class="input-group">
              <label>Email</label>
              <input type="email" placeholder="your@email.com" />
            </div>
            <div class="input-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" />
            </div>
            <button type="button" class="submit-btn">Sign in</button>
          </form>
          <div class="toggle-auth">
            Don't have an account? <a class="toggle-link">Sign up</a>
          </div>
        </div>
      </main>
    </div>
  </div>
  
  <!-- Important: Load scripts with absolute paths rather than relative -->
  <script>
    // Verify that __NEXT_DATA__ is accessible
    console.log("Checking __NEXT_DATA__ before scripts load:", window.__NEXT_DATA__);
    
    // Show content if loading takes too long
    setTimeout(function() {
      console.log("Timeout reached, checking if app has loaded");
      var loadingElement = document.getElementById('app-loading');
      var contentElement = document.getElementById('app-content');
      if (loadingElement && contentElement) {
        console.log("Showing fallback UI");
        loadingElement.style.display = 'none';
        contentElement.style.display = 'block';
      }
    }, 2000);
  </script>
  
  <script src="/_next/static/chunks/polyfills.js"></script>
  <script src="/_next/static/chunks/main.js"></script>
  <script src="/_next/static/chunks/pages/_app.js"></script>
  <script src="/_next/static/chunks/pages/index.js"></script>
</body>
</html>`;

fs.writeFileSync(path.join(outDir, 'index.html'), indexHtml);
console.log('Created enhanced index.html');

// Create improved JS files
console.log('Creating improved JS files...');

// Create polyfills.js
const polyfillsContent = `// Basic polyfills
console.log("Polyfills loaded");

// Check if __NEXT_DATA__ exists
console.log("Checking __NEXT_DATA__ in polyfills.js:", window.__NEXT_DATA__);
`;
fs.writeFileSync(path.join(nextDir, 'static/chunks/polyfills.js'), polyfillsContent);

// Create main.js
const mainJsContent = `// Main application initialization
console.log("Tempu Task application initializing...");
console.log("Checking __NEXT_DATA__ in main.js:", window.__NEXT_DATA__);

// Initialize the app
(function() {
  let appInitialized = false;
  
  function initApp() {
    if (appInitialized) return;
    appInitialized = true;
    
    console.log("Initializing Tempu Task app...");
    
    // Hide loading, show content
    var loadingElement = document.getElementById('app-loading');
    var contentElement = document.getElementById('app-content');
    if (loadingElement && contentElement) {
      loadingElement.style.display = 'none';
      contentElement.style.display = 'block';
    }
    
    // Add interactivity to the auth form
    var emailInput = document.querySelector('input[type="email"]');
    var passwordInput = document.querySelector('input[type="password"]');
    var signInButton = document.querySelector('.submit-btn');
    var toggleLink = document.querySelector('.toggle-link');
    
    if (signInButton) {
      signInButton.addEventListener('click', function() {
        if (!emailInput.value) {
          alert('Please enter your email');
          return;
        }
        if (!passwordInput.value) {
          alert('Please enter your password');
          return;
        }
        
        signInButton.textContent = 'Signing in...';
        signInButton.disabled = true;
        
        // Simulate API call
        setTimeout(function() {
          signInButton.textContent = 'Signed in successfully!';
          signInButton.style.backgroundColor = '#10b981';
        }, 1500);
      });
    }
    
    if (toggleLink) {
      var formTitle = document.querySelector('.form-title');
      var isSignIn = true;
      toggleLink.addEventListener('click', function() {
        isSignIn = !isSignIn;
        if (isSignIn) {
          formTitle.textContent = 'Sign in to Tempu Task';
          signInButton.textContent = 'Sign in';
          toggleLink.textContent = 'Sign up';
          document.querySelector('.toggle-auth').innerHTML = 'Don\\'t have an account? <a class="toggle-link">Sign up</a>';
        } else {
          formTitle.textContent = 'Create your account';
          signInButton.textContent = 'Create account';
          document.querySelector('.toggle-auth').innerHTML = 'Already have an account? <a class="toggle-link">Sign in</a>';
        }
        // Reattach event listener after changing HTML
        document.querySelector('.toggle-link').addEventListener('click', arguments.callee);
      });
    }
  }
  
  // Initialize on DOMContentLoaded or immediately if already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
`;
fs.writeFileSync(path.join(nextDir, 'static/chunks/main.js'), mainJsContent);

// Create _app.js
const appJsContent = `console.log("App component loaded");
console.log("Checking __NEXT_DATA__ in _app.js:", window.__NEXT_DATA__);
`;
fs.writeFileSync(path.join(nextDir, 'static/chunks/pages/_app.js'), appJsContent);

// Create index.js
const indexJsContent = `console.log("Index page loaded");
console.log("Checking __NEXT_DATA__ in index.js:", window.__NEXT_DATA__);
`;
fs.writeFileSync(path.join(nextDir, 'static/chunks/pages/index.js'), indexJsContent);

// Create CSS file
console.log('Creating CSS file...');
const cssContent = `/* Base styles */
html, body { 
  margin: 0; 
  padding: 0; 
  background-color: black; 
  color: white;
  height: 100%;
  overflow: hidden;
}
#__next {
  height: 100%;
  overflow: hidden;
  background-color: black;
}
#app-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: black;
  color: white;
}`;
fs.writeFileSync(path.join(nextDir, 'static/css/main.css'), cssContent);

// Copy index.html to common routes
console.log('Copying index.html to common routes...');
const commonRoutes = [
  '404.html',
  'dashboard.html',
  'projects.html',
  'companies.html',
  'settings.html'
];

// Create auth directory
const authDir = path.join(outDir, 'auth');
ensureDirExists(authDir);
commonRoutes.push('auth/login.html', 'auth/signup.html');

// Copy index.html to all routes
commonRoutes.forEach(route => {
  const routePath = path.join(outDir, route);
  const routeDir = path.dirname(routePath);
  ensureDirExists(routeDir);
  
  // Read index.html content
  let routeContent = indexHtml;
  
  // Update the page path in __NEXT_DATA__
  const routeName = route === 'index.html' ? '/' : `/${route.replace('.html', '')}`;
  routeContent = routeContent.replace(/"page":\s*"[^"]*"/, `"page": "${routeName}"`);
  
  fs.writeFileSync(routePath, routeContent);
  console.log(`Created route: ${route}`);
});

// Create AWS Amplify specific configuration files
console.log('Creating Amplify-specific configuration files...');

// 1. Create _redirects file for Netlify and other static hosts
fs.writeFileSync(path.join(outDir, '_redirects'), '/*    /index.html   200');
console.log('Created _redirects file');

// 2. Create rewrite-rules.json for AWS Amplify
const amplifyRewriteRules = [
  {
    "source": "/<*>",
    "target": "/index.html",
    "status": "200",
    "condition": null
  }
];
fs.writeFileSync(path.join(outDir, 'rewrite-rules.json'), JSON.stringify(amplifyRewriteRules, null, 2));
console.log('Created rewrite-rules.json for AWS Amplify');

// 3. Create amplify.json config
const amplifyJsonContent = {
  "features": {
    "baseDirectory": ".",
    "redirects": true
  }
};
fs.writeFileSync(path.join(outDir, 'amplify.json'), JSON.stringify(amplifyJsonContent, null, 2));
console.log('Created amplify.json for AWS Amplify');

// 4. Create a rewrite-config.json file
const rewriteConfigContent = {
  "rewrites": [
    { "source": "/<*>", "target": "/index.html", "status": "200" }
  ]
};
fs.writeFileSync(path.join(outDir, 'rewrite-config.json'), JSON.stringify(rewriteConfigContent, null, 2));
console.log('Created rewrite-config.json for AWS Amplify');

// Create diagnostic page
console.log('Creating diagnostic page...');
const diagnosticHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tempu Task - Diagnostics</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #000;
      color: #fff;
      padding: 20px;
      line-height: 1.6;
    }
    h1 {
      color: #6366f1;
    }
    .diagnostic-item {
      margin: 8px 0;
      padding: 8px;
      border-left: 3px solid #6366f1;
      background: rgba(255,255,255,0.05);
    }
    .success {
      color: #34d399;
    }
    .error {
      color: #f87171;
    }
    .warning {
      color: #fbbf24;
    }
    pre {
      background: rgba(0,0,0,0.3);
      padding: 10px;
      overflow: auto;
      border-radius: 4px;
    }
    button {
      background: #4f46e5;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 20px;
    }
    button:hover {
      background: #4338ca;
    }
  </style>
  <script>
    // Define __NEXT_DATA__ here to check if it works in the diagnostic page
    window.__NEXT_DATA__ = {
      props: { pageProps: {}, __N_SSG: true },
      page: "/diagnostic",
      query: {},
      buildId: "static-export-diagnostic",
      assetPrefix: "",
      runtimeConfig: {},
      nextExport: true,
      autoExport: true,
      isFallback: false,
      scriptLoader: []
    };
    console.log("Diagnostic: __NEXT_DATA__ defined:", window.__NEXT_DATA__);
  </script>
</head>
<body>
  <h1>Tempu Task - Deployment Diagnostics</h1>
  
  <div id="diagnostics"></div>
  
  <button onclick="runAdditionalTests()">Run Additional Tests</button>
  
  <script>
    // Function to add diagnostic output
    function addDiagnostic(message, type = 'info') {
      const div = document.createElement('div');
      div.className = 'diagnostic-item ' + type;
      div.textContent = message;
      document.getElementById('diagnostics').appendChild(div);
    }

    function addJson(label, obj) {
      const container = document.createElement('div');
      container.className = 'diagnostic-item';
      
      const labelElement = document.createElement('div');
      labelElement.textContent = label;
      container.appendChild(labelElement);
      
      const pre = document.createElement('pre');
      pre.textContent = JSON.stringify(obj, null, 2);
      container.appendChild(pre);
      
      document.getElementById('diagnostics').appendChild(container);
    }
    
    // Start diagnostics
    addDiagnostic('Running diagnostics...', 'info');

    // Environment info
    addDiagnostic('📱 User Agent: ' + navigator.userAgent);
    addDiagnostic('🌐 URL: ' + window.location.href);
    addDiagnostic('⏰ Current Time: ' + new Date().toISOString());
    
    // Check for Next.js data
    try {
      if (window.__NEXT_DATA__) {
        addDiagnostic('✅ __NEXT_DATA__ exists', 'success');
        addJson('__NEXT_DATA__ contents:', window.__NEXT_DATA__);
      } else {
        addDiagnostic('❌ __NEXT_DATA__ is missing', 'error');
      }
    } catch (e) {
      addDiagnostic('❌ Error accessing __NEXT_DATA__: ' + e.message, 'error');
    }
    
    // Try to load JavaScript files
    function checkScript(path) {
      const testScript = document.createElement('script');
      testScript.src = path;
      
      const scriptItem = document.createElement('div');
      scriptItem.className = 'diagnostic-item';
      scriptItem.textContent = '⏳ Testing script: ' + path;
      const diagElement = document.getElementById('diagnostics');
      diagElement.appendChild(scriptItem);
      
      testScript.onload = function() {
        scriptItem.textContent = '✅ Script loaded: ' + path;
        scriptItem.className = 'diagnostic-item success';
      };
      
      testScript.onerror = function() {
        scriptItem.textContent = '❌ Failed to load script: ' + path;
        scriptItem.className = 'diagnostic-item error';
      };
      
      document.body.appendChild(testScript);
    }
    
    // Try loading critical scripts
    checkScript('/_next/static/chunks/polyfills.js');
    checkScript('/_next/static/chunks/main.js');
    checkScript('/_next/static/chunks/pages/_app.js');
    checkScript('/_next/static/chunks/pages/index.js');
    
    // Check if we can access localStorage
    try {
      localStorage.setItem('amplify_test', 'test');
      localStorage.removeItem('amplify_test');
      addDiagnostic('✅ LocalStorage is accessible', 'success');
    } catch (e) {
      addDiagnostic('❌ LocalStorage error: ' + e.message, 'error');
    }
    
    // Check for document readiness
    addDiagnostic('📄 Document readiness: ' + document.readyState);
    
    // Additional testing function
    function runAdditionalTests() {
      addDiagnostic('🔍 Running additional tests...', 'info');
      
      // Test direct window.__NEXT_DATA__ assignment
      try {
        window.__NEXT_DATA__ = window.__NEXT_DATA__ || {};
        window.__NEXT_DATA__.test = 'Direct assignment test';
        addDiagnostic('✅ Direct assignment to __NEXT_DATA__ successful', 'success');
        addJson('Updated __NEXT_DATA__:', window.__NEXT_DATA__);
      } catch(e) {
        addDiagnostic('❌ Direct assignment to __NEXT_DATA__ failed: ' + e.message, 'error');
      }
      
      // Test Object.defineProperty
      try {
        let testData = { test: 'Object.defineProperty test' };
        Object.defineProperty(window, '__NEXT_DATA_TEST', {
          value: testData,
          writable: true,
          enumerable: true,
          configurable: true
        });
        addDiagnostic('✅ Object.defineProperty successful', 'success');
        addJson('__NEXT_DATA_TEST:', window.__NEXT_DATA_TEST);
      } catch(e) {
        addDiagnostic('❌ Object.defineProperty failed: ' + e.message, 'error');
      }
      
      // Test fetch API
      try {
        addDiagnostic('📡 Testing fetch API...', 'info');
        fetch('/amplify-test-image.png')
          .then(response => {
            if (response.ok) {
              addDiagnostic('✅ Fetch API works', 'success');
            } else {
              addDiagnostic('❌ Fetch API failed with status: ' + response.status, 'error');
            }
          })
          .catch(error => {
            addDiagnostic('❌ Fetch API error: ' + error.message, 'error');
          });
      } catch(e) {
        addDiagnostic('❌ Fetch API not available: ' + e.message, 'error');
      }
    }
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(outDir, 'diagnostic.html'), diagnosticHtml);

// Create a test image for diagnostics
console.log('Creating test image...');
const testImagePixels = 'iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwgAADsIBFShKgAAAABl0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC4yMfEgaZUAAAGFSURBVDhPtZTNK0RRGIfHlLKwsbCwUEo+SvlIKQtlY2FjYWFhQT5SlI8SJQtlY2NlYWNhY0P5E/wLEht2bCijeeZ95n3PnXPvnTN35ulX99z3nPs8991z7rmO4zieyvSyE6yAeXAEdsADOAXr4BL8ONzcf9P1eA4OQA1MAaAGPxlbI1jPM9gDU6DkRsDT2kAQg1OtDj5XwRswhxoFzyAJmWCOgRdQoP8GXvMFFVqHlKG9vZIQ4BiYAPlQgbWsRglkKYMkxDiTdkXf3WCFVbCXYVCiDCc2kB2BDmX4zcIjE8i2QeL/WGZhgwlkOaBBGV4tQD5yQ1mjDJdMIBsDH0CkIIrCqtDaKDgHH0CGXXTGlkEUhY/WBrvnAEgD3QQV2sQoivMEtsEGOAZyHZXAC/4ZK5nLmQOvbhB16D9Cz8EoTrACO2KdTrDYGsj1JDcxFbGQI9QUJkz7CnJBBWVfbkNuQ5zKNPkVqL9iLNa5/MkjbOl2gSvwCBrUlsviluKgz5QxOReNF/lbOc4/9JZLHuVbXOAAAAAASUVORK5CYII=';
const testImageBuffer = Buffer.from(testImagePixels, 'base64');
fs.writeFileSync(path.join(outDir, 'amplify-test-image.png'), testImageBuffer);

console.log('Static export enhancement complete! Try accessing /diagnostic.html to troubleshoot if needed.');