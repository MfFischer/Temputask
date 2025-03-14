const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('Starting static export enhancement...');

// Define the output directory
const outDir = path.join(__dirname, 'out');

// Check if the output directory exists
if (!fs.existsSync(outDir)) {
  console.error('Error: out directory does not exist');
  process.exit(1);
}

// 1. Find all HTML files and enhance them if needed
const htmlFiles = glob.sync('**/*.html', { cwd: outDir });
console.log(`Found ${htmlFiles.length} HTML files to process`);

htmlFiles.forEach(file => {
  const filePath = path.join(outDir, file);
  const stats = fs.statSync(filePath);
  console.log(`${file}: ${stats.size} bytes`);
  
  // If file is small, it might be a shell HTML - enhance it
  if (stats.size < 5000 || !fs.readFileSync(filePath, 'utf8').includes('__NEXT_DATA__')) {
    console.log(`Enhancing HTML file: ${file}`);
    
    // Read the original HTML
    let html = fs.readFileSync(filePath, 'utf8');
    
    // Check if it's missing key components
    if (!html.includes('__NEXT_DATA__')) {
      console.log(`Adding missing Next.js data hooks to ${file}`);
      
      // Create a basic HTML structure with Next.js required elements
      html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tempu Task</title>
  <link rel="stylesheet" href="/_next/static/css/main.css" />
  <script>
    // Detect static hosting and enable SPA routing
    window.__NEXT_DATA__ = {
      props: { pageProps: {} },
      page: "${file === 'index.html' ? '/' : '/' + file.replace('.html', '')}",
      query: {},
      buildId: "static-export",
      assetPrefix: "",
      runtimeConfig: {},
      nextExport: true,
      autoExport: true,
      isFallback: false
    };
  </script>
</head>
<body>
  <div id="__next">
    <div id="app-loading">Loading Tempu Task...</div>
  </div>
  <script src="/_next/static/chunks/main.js" defer></script>
  <script src="/_next/static/chunks/pages/${file === 'index.html' ? 'index' : file.replace('.html', '')}.js" defer></script>
</body>
</html>`;
      
      // Write the enhanced HTML
      fs.writeFileSync(filePath, html);
      console.log(`Enhanced ${file}`);
    }
  }
});

// 2. Create _redirects file for Netlify and other hosts
const redirectsContent = `
# Handle client-side routing in SPA
/*    /index.html   200
`;
fs.writeFileSync(path.join(outDir, '_redirects'), redirectsContent);
console.log('Created _redirects file');

// 3. Create .htaccess for Apache servers
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

// 4. Create amplify redirects file
const amplifyRedirectsContent = `[
  {
    "source": "/<*>",
    "target": "/index.html",
    "status": "200",
    "condition": null
  }
]`;
fs.writeFileSync(path.join(outDir, '_redirects.json'), amplifyRedirectsContent);
console.log('Created _redirects.json for Amplify');

// 5. Create a rewrite-config.json file for AWS Amplify
const rewriteConfigContent = `{
  "rewrites": [
    { "source": "/<*>", "target": "/index.html", "status": "200" }
  ]
}`;
fs.writeFileSync(path.join(outDir, 'rewrite-config.json'), rewriteConfigContent);
console.log('Created rewrite-config.json for AWS Amplify');

// 6. Create an echo file for Amplify to discover the app
fs.writeFileSync(path.join(outDir, 'static-app-indicator.html'), 'This is a static app');

// 7. Create fallback pages for common routes
const indexHtml = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8');
const commonRoutes = [
  '404.html',
  'dashboard.html',
  'projects.html',
  'companies.html',
  'settings.html'
];

// Create auth directory if it doesn't exist
const authDir = path.join(outDir, 'auth');
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}

// Add auth routes
commonRoutes.push('auth/login.html', 'auth/signup.html');

commonRoutes.forEach(route => {
  const routePath = path.join(outDir, route);
  const routeDir = path.dirname(routePath);
  
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }
  
  if (!fs.existsSync(routePath)) {
    fs.writeFileSync(routePath, indexHtml);
    console.log(`Created fallback page: ${route}`);
  }
});

console.log('Static export enhancement completed!');