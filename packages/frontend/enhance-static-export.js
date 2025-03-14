const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Output directory
const outDir = path.join(__dirname, 'out');

// Helper function to ensure a directory exists
function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// Helper function to get relative path prefix based on file depth
function getRelativePrefix(filePath) {
  const depth = filePath.split('/').length - 1;
  return depth === 0 ? './' : '../'.repeat(depth);
}

// Helper function to create a proper Next.js data object
function createNextDataObject(routeName = '/') {
  return {
    props: {
      pageProps: {},
      __N_SSG: true
    },
    page: routeName,
    query: {},
    buildId: "static-export-" + Date.now(),
    assetPrefix: "",
    runtimeConfig: {},
    nextExport: true,
    autoExport: true,
    isFallback: false,
    scriptLoader: []
  };
}

console.log('Starting enhanced static export process...');

// Ensure _next directory exists
const nextDir = path.join(outDir, '_next');
ensureDirExists(nextDir);
ensureDirExists(path.join(nextDir, 'static'));
ensureDirExists(path.join(nextDir, 'static', 'chunks'));
ensureDirExists(path.join(nextDir, 'static', 'css'));

// Find all HTML files
const htmlFiles = glob.sync('**/*.html', { cwd: outDir });
console.log(`Found ${htmlFiles.length} HTML files to process`);

// Process each HTML file
htmlFiles.forEach(file => {
  const filePath = path.join(outDir, file);
  const relativePrefix = getRelativePrefix(file);
  
  try {
    console.log(`Processing HTML file: ${file}`);
    
    // Read the original HTML
    let html = fs.readFileSync(filePath, 'utf8');
    
    // Get the route name from the file path
    let routeName = file === 'index.html' ? '/' : `/${file.replace('.html', '')}`;
    
    // Check if it needs enhancement
    if (!html.includes('__NEXT_DATA__') || !html.includes('/_next/static/chunks/main')) {
      console.log(`Enhancing HTML file: ${file}`);
      
      // Create enhanced HTML with proper Next.js data and script references
      html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tempu Task</title>
  <link rel="stylesheet" href="${relativePrefix}_next/static/css/main.css" />
  <script id="__NEXT_DATA__" type="application/json">${JSON.stringify(createNextDataObject(routeName))}</script>
</head>
<body>
  <div id="__next">
    <div id="app-loading" class="flex flex-col items-center justify-center min-h-screen bg-black">
      <div class="text-xl text-white mb-4">Loading Tempu Task...</div>
      <div class="text-sm text-gray-400">Initializing application</div>
    </div>
  </div>
  <script src="${relativePrefix}_next/static/chunks/polyfills.js" defer></script>
  <script src="${relativePrefix}_next/static/chunks/main.js" defer></script>
  <script src="${relativePrefix}_next/static/chunks/pages/_app.js" defer></script>
  <script src="${relativePrefix}_next/static/chunks/pages${routeName === '/' ? '/index' : routeName}.js" defer></script>
</body>
</html>`;
      
      // Write the enhanced HTML
      fs.writeFileSync(filePath, html);
      console.log(`Enhanced ${file} with proper path depth: ${relativePrefix}`);
    } else {
      // If __NEXT_DATA__ exists but we need to update the page property
      if (html.includes('__NEXT_DATA__')) {
        // Try to update the page property in __NEXT_DATA__
        const nextDataRegex = /(window\.__NEXT_DATA__\s*=\s*|\<script id="__NEXT_DATA__" type="application\/json"\>)({[^<]*})(<\/script>)?/;
        const match = html.match(nextDataRegex);
        
        if (match) {
          try {
            const dataStr = match[2];
            const data = JSON.parse(dataStr);
            
            // Update the page property
            if (data.page !== routeName) {
              data.page = routeName;
              
              // Replace the old data with updated data
              const updatedDataStr = JSON.stringify(data);
              html = html.replace(nextDataRegex, `$1${updatedDataStr}$3`);
              
              // Write the updated HTML
              fs.writeFileSync(filePath, html);
              console.log(`Updated __NEXT_DATA__ page property in ${file} to ${routeName}`);
            }
          } catch (err) {
            console.error(`Error parsing __NEXT_DATA__ in ${file}:`, err.message);
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

// Create placeholder JS files if they don't exist
const requiredJsFiles = [
  'static/chunks/polyfills.js',
  'static/chunks/main.js',
  'static/chunks/pages/_app.js',
  'static/chunks/pages/index.js'
];

requiredJsFiles.forEach(jsFile => {
  const filePath = path.join(nextDir, jsFile);
  
  if (!fs.existsSync(filePath)) {
    ensureDirExists(path.dirname(filePath));
    
    let content = '';
    
    if (jsFile === 'static/chunks/polyfills.js') {
      content = `// Polyfills for browser compatibility
console.log("Polyfills loaded");`;
    } else if (jsFile === 'static/chunks/main.js') {
      content = `// Main application initialization
console.log("Tempu Task application initializing...");

// Initialize the app
(function() {
  let appInitialized = false;
  
  function initApp() {
    if (appInitialized) return;
    appInitialized = true;
    
    console.log("Initializing Tempu Task app...");
    
    // Handle SPA navigation
    const handleSpaNavigation = () => {
      const path = window.location.pathname;
      console.log("SPA navigation to:", path);
      
      // Update the __NEXT_DATA__ with the current path
      if (window.__NEXT_DATA__) {
        window.__NEXT_DATA__.page = path === "/" ? "/" : path;
      }
    };
    
    // Listen for navigation events
    window.addEventListener('popstate', handleSpaNavigation);
    
    // Setup loading message
    const loadingElement = document.getElementById('app-loading');
    if (loadingElement) {
      setTimeout(() => {
        loadingElement.style.display = 'none';
      }, 1000);
    }
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
  
  // Expose diagnostic function to window
  window.diagnoseTempuTask = function() {
    console.log("Running Tempu Task diagnostics...");
    console.log("__NEXT_DATA__:", window.__NEXT_DATA__);
    console.log("URL:", window.location.href);
    console.log("Path:", window.location.pathname);
    console.log("Document ready state:", document.readyState);
    
    return {
      nextData: window.__NEXT_DATA__,
      url: window.location.href,
      readyState: document.readyState,
      appInitialized: appInitialized
    };
  };
})();`;
    } else if (jsFile === 'static/chunks/pages/_app.js') {
      content = `// App component implementation
console.log("Loading Tempu Task app component...");

(function() {
  function renderAppShell() {
    const appElement = document.getElementById('__next');
    if (!appElement) return;
    
    // Get data from Next.js
    const pageProps = window.__NEXT_DATA__?.props?.pageProps || {};
    const page = window.__NEXT_DATA__?.page || '/';
    
    console.log("Rendering app shell for page:", page);
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderAppShell);
  } else {
    renderAppShell();
  }
})();`;
    } else if (jsFile === 'static/chunks/pages/index.js') {
      content = `// Index page implementation
console.log("Loading Tempu Task index page...");

(function() {
  // This would normally come from the actual Next.js build
  // but we're creating a placeholder that attempts to work
  console.log("Initializing index page");
  
  // Simulate page loading and then display basic content
  setTimeout(() => {
    const appElement = document.getElementById('__next');
    if (!appElement) return;
    
    // Hide loading indicator
    const loadingElement = document.getElementById('app-loading');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
    
    // Add content
    appElement.innerHTML = \`
      <div class="flex flex-col md:flex-row bg-black text-white h-screen max-h-screen overflow-hidden">
        <header class="md:hidden p-6 flex items-center">
          <div class="mr-3 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">TT</div>
          <span class="text-xl font-bold tracking-wider">Tempu Task</span>
        </header>

        <main class="w-full md:w-2/3 p-8 md:p-16 flex flex-col overflow-y-auto">
          <h1 class="text-3xl font-bold mb-6">Welcome to Tempu Task</h1>
          <p class="mb-4">Your application is running successfully.</p>
          <p>This is a placeholder page. The actual application content will appear here.</p>
        </main>
        
        <aside class="hidden md:flex md:w-1/3 bg-gray-900 p-8 flex-col">
          <div class="flex items-center mb-8">
            <div class="mr-3 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">TT</div>
            <span class="text-xl font-bold tracking-wider">Tempu Task</span>
          </div>
          
          <div class="mt-auto">
            <div class="bg-gray-800 p-6 rounded-lg">
              <h3 class="text-lg font-medium mb-2">Get Started</h3>
              <p class="text-gray-400 mb-4">Sign in to access your dashboard</p>
              <p class="flex space-x-4">
                <button 
                  class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
                >
                  Sign in
                </button>
                <button 
                  class="border border-gray-600 hover:border-gray-500 px-4 py-2 rounded"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </aside>
      </div>
    \`;
  }, 1000);
})();`;
    } else {
      content = `// Implementation for ${jsFile}
console.log("Loading ${jsFile}");`;
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`Created placeholder: ${filePath}`);
  }
});

// Create AWS Amplify specific configuration files
console.log('Creating Amplify-specific configuration files...');

// 1. Create _redirects file for Netlify and other static hosts
const redirectsContent = `
# Handle client-side routing in SPA
/*    /index.html   200
`;
fs.writeFileSync(path.join(outDir, '_redirects'), redirectsContent);
console.log('Created _redirects file');

// 2. Create .htaccess for Apache servers
const htaccessContent = `
# Handle SPA routing
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
`;
fs.writeFileSync(path.join(outDir, '.htaccess'), htaccessContent);
console.log('Created .htaccess file');

// 3. Create rewrite-rules.json for AWS Amplify (most important)
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

// 4. Create amplify.json config
const amplifyJsonContent = {
  "features": {
    "baseDirectory": ".",
    "redirects": true
  }
};
fs.writeFileSync(path.join(outDir, 'amplify.json'), JSON.stringify(amplifyJsonContent, null, 2));
console.log('Created amplify.json for AWS Amplify');

// 5. Create a custom-rewrites.json file (alternative format)
const customRewritesContent = {
  "rewrites": [
    { "source": "/<*>", "target": "/index.html", "status": "200" }
  ]
};
fs.writeFileSync(path.join(outDir, 'custom-rewrites.json'), JSON.stringify(customRewritesContent, null, 2));
console.log('Created custom-rewrites.json for AWS Amplify');

// 6. Create an extra index.html at the root to guarantee one exists
const indexPath = path.join(outDir, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.log('Creating root index.html');
  const basicHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tempu Task</title>
  <script id="__NEXT_DATA__" type="application/json">${JSON.stringify(createNextDataObject("/"))}</script>
</head>
<body>
  <div id="__next">
    <div id="app-loading" class="flex flex-col items-center justify-center min-h-screen bg-black">
      <div class="text-xl text-white mb-4">Loading Tempu Task...</div>
      <div class="text-sm text-gray-400">Initializing application</div>
    </div>
  </div>
  <script>
    // Add a timeout to show a message if the app doesn't load
    setTimeout(function() {
      var loadingElem = document.getElementById('app-loading');
      if (loadingElem) {
        var messageElem = loadingElem.querySelector('.text-sm');
        if (messageElem) {
          messageElem.textContent = 'If this persists, try adding /diagnostic.html to the URL to troubleshoot';
        }
      }
    }, 5000);
  </script>
  <script src="./_next/static/chunks/polyfills.js" defer></script>
  <script src="./_next/static/chunks/main.js" defer></script>
  <script src="./_next/static/chunks/pages/_app.js" defer></script>
  <script src="./_next/static/chunks/pages/index.js" defer></script>
</body>
</html>`;
  
  fs.writeFileSync(indexPath, basicHtml);
}

// Add a diagnostic page
console.log('Creating diagnostic page...');
const diagnosticHtml = `<!DOCTYPE html>
<html>
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
      border-bottom: 1px solid #333;
      padding-bottom: 10px;
    }
    #diagnostics {
      margin-top: 20px;
    }
    .diagnostic-item {
      margin-bottom: 10px;
      padding: 10px;
      background: #111;
      border-radius: 4px;
    }
    .success {
      border-left: 4px solid #4CAF50;
    }
    .error {
      border-left: 4px solid #F44336;
    }
    .warning {
      border-left: 4px solid #FF9800;
    }
    pre {
      background: #222;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
    }
  </style>
  <script id="__NEXT_DATA__" type="application/json">${JSON.stringify(createNextDataObject("/diagnostic"))}</script>
</head>
<body>
  <h1>Tempu Task - Deployment Diagnostics</h1>
  <div>Running diagnostics...</div>
  <div id="diagnostics"></div>
  
  <script>
    function addDiagnostic(message, type) {
      const item = document.createElement('div');
      item.className = 'diagnostic-item' + (type ? ' ' + type : '');
      item.textContent = message;
      document.getElementById('diagnostics').appendChild(item);
    }
    
    function addJson(title, obj) {
      addDiagnostic(title);
      const pre = document.createElement('pre');
      pre.textContent = JSON.stringify(obj, null, 2);
      document.getElementById('diagnostics').appendChild(pre);
    }
    
    // Basic environment info
    addDiagnostic('📱 User Agent: ' + navigator.userAgent);
    addDiagnostic('🌐 URL: ' + window.location.href);
    
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
    checkScript('./_next/static/chunks/polyfills.js');
    checkScript('./_next/static/chunks/main.js');
    checkScript('./_next/static/chunks/pages/_app.js');
    checkScript('./_next/static/chunks/pages/index.js');
    
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
    
    // Try to load a test image
    const img = new Image();
    img.onload = function() {
      addDiagnostic('✅ Test image loaded successfully', 'success');
    };
    img.onerror = function() {
      addDiagnostic('❌ Failed to load test image', 'error');
    };
    img.src = './amplify-test-image.png';
    
    // Check network requests
    addDiagnostic('🔍 Checking network requests (open browser console to see details)');
    console.log('Diagnostic script running - check Network tab for failed requests');
    
    // Check Amplify environment
    if (window.AWS && window.AWS.config) {
      addDiagnostic('✅ Amplify configuration found', 'success');
      addJson('AWS Config:', window.AWS.config);
    } else {
      addDiagnostic('ℹ️ No Amplify configuration found');
    }
    
    // Create a test image
    const testImage = document.createElement('div');
    testImage.style.width = '10px';
    testImage.style.height = '10px';
    testImage.style.background = 'red';
    testImage.style.position = 'absolute';
    testImage.style.bottom = '10px';
    testImage.style.right = '10px';
    document.body.appendChild(testImage);
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(outDir, 'diagnostic.html'), diagnosticHtml);

// Create a test image for diagnostics
const testImagePixels = 'iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwgAADsIBFShKgAAAABl0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC4yMfEgaZUAAAGFSURBVDhPtZTNK0RRGIfHlLKwsbCwUEo+SvlIKQtlY2FjYWFhQT5SlI8SJQtlY2NlYWNhY0P5E/wLEht2bCijeeZ95n3PnXPvnTN35ulX99z3nPs8991z7rmO4zieyvSyE6yAeXAEdsADOAXr4BL8ONzcf9P1eA4OQA1MAaAGPxlbI1jPM9gDU6DkRsDT2kAQg1OtDj5XwRswhxoFzyAJmWCOgRdQoP8GXvMFFVqHlKG9vZIQ4BiYAPlQgbWsRglkKYMkxDiTdkXf3WCFVbCXYVCiDCc2kB2BDmX4zcIjE8i2QeL/WGZhgwlkOaBBGV4tQD5yQ1mjDJdMIBsDH0CkIIrCqtDaKDgHH0CGXXTGlkEUhY/WBrvnAEgD3QQV2sQoivMEtsEGOAZyHZXAC/4ZK5nLmQOvbhB16D9Cz8EoTrACO2KdTrDYGsj1JDcxFbGQI9QUJkz7CnJBBWVfbkNuQ5zKNPkVqL9iLNa5/MkjbOl2gSvwCBrUlsviluKgz5QxOReNF/lbOc4/9JZLHuVbXOAAAAAASUVORK5CYII=';
const testImageBuffer = Buffer.from(testImagePixels, 'base64');
fs.writeFileSync(path.join(outDir, 'amplify-test-image.png'), testImageBuffer);

// 7. Create fallback pages for common routes using the index.html as a template
const commonRoutes = [
  '404.html',
  'dashboard.html',
  'projects.html',
  'companies.html',
  'settings.html',
  'auth/login.html',
  'auth/signup.html'
];

const indexContent = fs.readFileSync(indexPath, 'utf8');

commonRoutes.forEach(route => {
  const routePath = path.join(outDir, route);
  const routeDir = path.dirname(routePath);
  
  // Create directories if they don't exist
  ensureDirExists(routeDir);
  
  // Get the relative path prefix based on directory depth
  const relativePrefix = getRelativePrefix(route);
  
  // Get the route name for __NEXT_DATA__
  const routeName = route === 'index.html' ? '/' : `/${route.replace('.html', '')}`;
  
  // Create a modified version of index.html with adjusted paths
  let routeContent = indexContent
    .replace(/\.\/\_next\//g, `${relativePrefix}_next/`)
    .replace(/"page":\s*"[^"]*"/, `"page": "${routeName}"`)
    .replace(/pages\/index\.js/, routeName === '/' ? 'pages/index.js' : `pages${routeName}.js`);
  
  // Ensure __NEXT_DATA__ exists
  if (!routeContent.includes('__NEXT_DATA__')) {
    const nextDataObject = createNextDataObject(routeName);
    const nextDataScript = `<script id="__NEXT_DATA__" type="application/json">${JSON.stringify(nextDataObject)}</script>`;
    
    // Insert before the closing head tag
    routeContent = routeContent.replace('</head>', `${nextDataScript}\n</head>`);
    
    console.log(`Added missing __NEXT_DATA__ to ${route}`);
  }
  
  fs.writeFileSync(routePath, routeContent);
  console.log(`Created fallback page: ${route} with relative prefix: ${relativePrefix}`);
});

console.log('Improved static export enhancement completed!');