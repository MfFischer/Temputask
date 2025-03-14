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
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tempu Task</title>
  <link rel="stylesheet" href="${relativePrefix}_next/static/css/main.css" />
  <script>
    // Next.js data configuration for static export
    window.__NEXT_DATA__ = {
      props: { 
        pageProps: {}, 
        __N_SSG: true
      },
      page: "${routeName}",
      query: {},
      buildId: "static-export-${Date.now()}",
      assetPrefix: "",
      runtimeConfig: {},
      nextExport: true,
      autoExport: true,
      isFallback: false,
      scriptLoader: []
    };
  </script>
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
      content = '/* Base styles */\nhtml, body { margin: 0; padding: 0; background-color: black; color: white; }';
    } else if (jsFile === 'static/chunks/polyfills.js') {
      content = '// Polyfills placeholder';
    } else if (jsFile === 'static/chunks/main.js') {
      content = '// Main chunk - hydration handling\n' +
        'document.addEventListener("DOMContentLoaded", function() {\n' +
        '  console.log("Hydrating Tempu Task app...");\n' +
        '  // Add fallback redirect handling for SPA\n' +
        '  const params = new URLSearchParams(window.location.search);\n' +
        '  const redirect = params.get("redirect");\n' +
        '  if (redirect) {\n' +
        '    window.history.replaceState({}, "", redirect);\n' +
        '  }\n' +
        '});\n';
    } else {
      content = '// Placeholder for ' + jsFile;
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
  <script>
    window.__NEXT_DATA__ = {
      props: { pageProps: {}, __N_SSG: true },
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
  </script>
</head>
<body>
  <div id="__next">
    <div id="app-loading" class="flex flex-col items-center justify-center min-h-screen bg-black">
      <div class="text-xl text-white mb-4">Loading Tempu Task...</div>
      <div class="text-sm text-gray-400">Initializing application</div>
    </div>
  </div>
  <script src="./_next/static/chunks/polyfills.js" defer></script>
  <script src="./_next/static/chunks/main.js" defer></script>
  <script src="./_next/static/chunks/pages/_app.js" defer></script>
  <script src="./_next/static/chunks/pages/index.js" defer></script>
</body>
</html>`;
  
  fs.writeFileSync(indexPath, basicHtml);
}

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
  
  fs.writeFileSync(routePath, routeContent);
  console.log(`Created fallback page: ${route} with relative prefix: ${relativePrefix}`);
});

console.log('Improved static export enhancement completed!');