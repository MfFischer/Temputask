const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Define the output directory
const outDir = path.join(__dirname, 'out');

console.log('Checking HTML files for __NEXT_DATA__...');

// Find all HTML files
const htmlFiles = glob.sync('**/*.html', { cwd: outDir });
console.log(`Found ${htmlFiles.length} HTML files to process`);

// Process each HTML file
htmlFiles.forEach(file => {
  const filePath = path.join(outDir, file);
  
  try {
    let html = fs.readFileSync(filePath, 'utf8');
    
    // Check if __NEXT_DATA__ is missing
    if (!html.includes('__NEXT_DATA__')) {
      console.log(`Adding __NEXT_DATA__ to ${file}`);
      
      // Get the route name from the file path
      let routeName = file === 'index.html' ? '/' : `/${file.replace('.html', '')}`;
      
      // Create the __NEXT_DATA__ script
      const nextDataScript = `<script>
window.__NEXT_DATA__ = {
  "props": { "pageProps": {} },
  "page": "${routeName}",
  "query": {},
  "buildId": "static-export-${Date.now()}",
  "assetPrefix": "",
  "runtimeConfig": {},
  "nextExport": true,
  "autoExport": true,
  "isFallback": false
};
</script>`;
      
      // Insert before </head>
      html = html.replace('</head>', `${nextDataScript}</head>`);
      
      // Make sure script paths are absolute
      html = html.replace(/src="\.\/_next\//g, 'src="/_next/');
      html = html.replace(/href="\.\/_next\//g, 'href="/_next/');
      
      // Write the updated HTML
      fs.writeFileSync(filePath, html);
      console.log(`Fixed ${file}`);
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log('HTML file check complete!');