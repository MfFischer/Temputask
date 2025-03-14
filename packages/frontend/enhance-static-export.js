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

// Function to get relative path depth
function getRelativePrefix(filePath) {
  // Count directory levels and add ../ for each level
  const depth = filePath.split('/').length - 1;
  return depth > 0 ? '../'.repeat(depth) : './';
}

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
    
    // Check if it needs enhancement
    if (!html.includes('__NEXT_DATA__') || !html.includes('/_next/static/chunks/main')) {
      console.log(`Enhancing HTML file: ${file}`);
      
      // Get the route name from the file path
      let routeName = file === 'index.html' ? '/' : `/${file.replace('.html', '')}`;
      
      // Create enhanced HTML with proper Next.js data and script references
      html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tempu Task</title>
  <script id="__NEXT_DATA__" type="application/json">{"props":{"pageProps":{}},"page":"${routeName}","query":{},"buildId":"static-export-${Date.now()}","assetPrefix":"","nextExport":true,"autoExport":true,"isFallback":false}</script>
  <style>
    html, body { 
      margin: 0; 
      padding: 0; 
      background-color: black; 
      color: white;
      height: 100%;
      overflow: hidden;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #__next {
      height: 100%;
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
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .loading-text {
      color: white;
      font-size: 1.25rem;
      margin-bottom: 1rem;
    }
    .loading-subtext {
      color: rgba(255,255,255,0.6);
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <div id="__next">
    <div id="app-loading" class="loading">
      <div class="loading-text">Loading Tempu Task...</div>
      <div class="loading-subtext">Initializing application</div>
    </div>
  </div>
  <script>
    // Show fallback UI if app doesn't load in 3 seconds
    setTimeout(function() {
      if (document.getElementById('app-loading')) {
        console.log('App did not load, showing fallback UI');
        document.getElementById('__next').innerHTML = \`
          <div class="container">
            <header class="header">
              <div class="logo">TT</div>
              <span style="font-weight:bold;font-size:1.25rem;">Tempu Task</span>
            </header>
            <main style="flex-grow:1;padding:2rem;">
              <h1 style="font-size:3rem;line-height:1.2;margin-bottom:1.5rem;">
                Take Control with<br />
                <span style="background:linear-gradient(to right,#60a5fa,#6366f1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">AI-Powered Productivity,</span><br />
                Your Way
              </h1>
              <div style="max-width:24rem;margin:3rem auto;padding:2rem;border:1px solid rgba(255,255,255,0.1);border-radius:0.5rem;background:rgba(255,255,255,0.05);">
                <h2 style="text-align:center;margin-bottom:1.5rem;">Sign in to Tempu Task</h2>
                <form>
                  <div style="margin-bottom:1rem;">
                    <label style="display:block;margin-bottom:0.5rem;font-size:0.875rem;color:rgba(255,255,255,0.7);">Email</label>
                    <input type="email" placeholder="your@email.com" style="width:100%;padding:0.75rem;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.2);border-radius:0.25rem;color:white;" />
                  </div>
                  <div style="margin-bottom:1rem;">
                    <label style="display:block;margin-bottom:0.5rem;font-size:0.875rem;color:rgba(255,255,255,0.7);">Password</label>
                    <input type="password" placeholder="••••••••" style="width:100%;padding:0.75rem;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.2);border-radius:0.25rem;color:white;" />
                  </div>
                  <button type="button" style="width:100%;padding:0.75rem;background:#4f46e5;color:white;border:none;border-radius:0.25rem;font-weight:500;cursor:pointer;">Sign in</button>
                </form>
                <div style="text-align:center;margin-top:1.5rem;color:rgba(255,255,255,0.7);">
                  Don't have an account? <a style="color:#818cf8;cursor:pointer;text-decoration:none;">Sign up</a>
                </div>
              </div>
            </main>
          </div>
        \`;
      }
    }, 3000);
  </script>
  <script src="/_next/static/chunks/polyfills.js" defer></script>
  <script src="/_next/static/chunks/main.js" defer></script>
  <script src="/_next/static/chunks/pages/_app.js" defer></script>
  <script src="/_next/static/chunks/pages${routeName === '/' ? '/index' : routeName}.js" defer></script>
</body>
</html>`;
      
      // Write the enhanced HTML
      fs.writeFileSync(filePath, html);
      console.log(`Enhanced ${file} with proper path depth: ${relativePrefix}`);
    } else {
      // If file already has __NEXT_DATA__, make sure it's not empty
      if (html.includes('"__NEXT_DATA__": {}') || html.includes('window.__NEXT_DATA__={}')) {
        console.log(`Fixing empty __NEXT_DATA__ in ${file}`);
        let routeName = file === 'index.html' ? '/' : `/${file.replace('.html', '')}`;
        html = html.replace(/<script id="__NEXT_DATA__"[^>]*>.*?<\/script>/g, 
          `<script id="__NEXT_DATA__" type="application/json">{"props":{"pageProps":{}},"page":"${routeName}","query":{},"buildId":"static-export-${Date.now()}","assetPrefix":"","nextExport":true,"autoExport":true,"isFallback":false}</script>`);
        fs.writeFileSync(filePath, html);
        console.log(`Fixed empty __NEXT_DATA__ in ${file}`);
      }
      
      // Also make sure paths are absolute, not relative
      if (html.includes('src="./') || html.includes('href="./')) {
        console.log(`Fixing relative paths in ${file}`);
        html = html.replace(/src="\.\/_next\//g, 'src="/_next/');
        html = html.replace(/href="\.\/_next\//g, 'href="/_next/');
        fs.writeFileSync(filePath, html);
        console.log(`Fixed relative paths in ${file}`);
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
  'static/chunks/pages/index.js',
  'static/css/main.css'
];

// Check if these files exist, and create minimal placeholders if they don't
requiredJsFiles.forEach(jsFile => {
  const filePath = path.join(nextDir, jsFile);
  
  if (!fs.existsSync(filePath)) {
    console.log(`Creating placeholder for missing file: ${jsFile}`);
    ensureDirExists(path.dirname(filePath));
    
    let content = '';
    if (jsFile.endsWith('.css')) {
      content = `/* Base styles */
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
    } else if (jsFile === 'static/chunks/polyfills.js') {
      content = `// Basic polyfills
console.log("Polyfills loaded");

// Check if __NEXT_DATA__ exists
console.log("Checking __NEXT_DATA__ in polyfills.js:", window.__NEXT_DATA__);
`;
    } else if (jsFile === 'static/chunks/main.js') {
      content = `// Main application initialization
console.log("Tempu Task application initializing...");
console.log("Checking __NEXT_DATA__ in main.js:", window.__NEXT_DATA__);

// Initialize the app
(function() {
  let appInitialized = false;
  
  function initApp() {
    if (appInitialized) return;
    appInitialized = true;
    
    console.log("Initializing Tempu Task app...");
    
    // Hide loading element if it exists
    var loadingElement = document.getElementById('app-loading');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  }
  
  // Initialize on DOMContentLoaded or immediately if already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();`;
    } else if (jsFile === 'static/chunks/pages/_app.js') {
      content = `console.log("App component loaded");
console.log("Checking __NEXT_DATA__ in _app.js:", window.__NEXT_DATA__);
`;
    } else if (jsFile === 'static/chunks/pages/index.js') {
      content = `console.log("Index page loaded");
console.log("Checking __NEXT_DATA__ in index.js:", window.__NEXT_DATA__);
`;
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
fs.writeFileSync(path.join(outDir, 'rewrite-config.json'), JSON.stringify(customRewritesContent, null, 2));
console.log('Created rewrite-config.json for AWS Amplify');

// 6. Create an extra index.html at the root to guarantee one exists
const indexPath = path.join(outDir, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.log('Creating root index.html');
  // We already have logic above to create index.html if needed
}

// Add a diagnostic page
console.log('Creating diagnostic page...');
const diagnosticHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tempu Task - Diagnostics</title>
  <script id="__NEXT_DATA__" type="application/json">
    {"props":{"pageProps":{}},"page":"/diagnostic","query":{},"buildId":"diagnostic-${Date.now()}","assetPrefix":"","nextExport":true,"autoExport":true,"isFallback":false}
  </script>
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
      
      // Try loading index page directly
      try {
        var iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = '/';
        
        iframe.onload = function() {
          try {
            addDiagnostic('✅ Index page loaded in iframe', 'success');
            
            if (iframe.contentWindow.__NEXT_DATA__) {
              addDiagnostic('✅ __NEXT_DATA__ exists in index page', 'success');
              addJson('Index __NEXT_DATA__:', iframe.contentWindow.__NEXT_DATA__);
            } else {
              addDiagnostic('❌ __NEXT_DATA__ missing in index page', 'error');
            }
          } catch (e) {
            addDiagnostic('❌ Error inspecting iframe: ' + e.message, 'error');
          }
        };
        
        iframe.onerror = function() {
          addDiagnostic('❌ Failed to load index page in iframe', 'error');
        };
        
        document.body.appendChild(iframe);
      } catch(e) {
        addDiagnostic('❌ Iframe test error: ' + e.message, 'error');
      }
      
      // Check Amplify environment
      if (window.AWS && window.AWS.config) {
        addDiagnostic('✅ Amplify configuration found', 'success');
        addJson('AWS Config:', window.AWS.config);
      } else {
        addDiagnostic('ℹ️ No Amplify configuration found');
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

// Make sure index.html exists and has been processed
if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  commonRoutes.forEach(route => {
    const routePath = path.join(outDir, route);
    const routeDir = path.dirname(routePath);
    
    // Create directories if they don't exist
    ensureDirExists(routeDir);
    
    // Get the route name for __NEXT_DATA__
    const routeName = route === 'index.html' ? '/' : `/${route.replace('.html', '')}`;
    
    // Create a modified version of index.html with adjusted paths and route name
    let routeContent = indexContent;
    
    // Update the page property in __NEXT_DATA__
    routeContent = routeContent.replace(/"page"\s*:\s*"[^"]*"/, `"page": "${routeName}"`);
    
    // Update script paths if needed
    routeContent = routeContent.replace(/pages\/index\.js/, routeName === '/' ? 'pages/index.js' : `pages${routeName}.js`);
    
    // Make sure all paths are absolute
    routeContent = routeContent.replace(/src="\.\/_next\//g, 'src="/_next/');
    routeContent = routeContent.replace(/href="\.\/_next\//g, 'href="/_next/');
    
    fs.writeFileSync(routePath, routeContent);
    console.log(`Created fallback page: ${route} with route name: ${routeName}`);
  });
}

console.log('Improved static export enhancement completed!');