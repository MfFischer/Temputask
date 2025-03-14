const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('Verifying static export for Amplify deployment...');

// Define the output directory
const outDir = path.join(__dirname, 'out');

// Check if the output directory exists
if (!fs.existsSync(outDir)) {
  console.error('❌ Error: out directory does not exist');
  process.exit(1);
}

// Check critical files
console.log('\n📁 Checking critical files...');
const criticalFiles = [
  'index.html',
  '_next/static/chunks/main.js',
  '_next/static/chunks/pages/_app.js',
  '_next/static/chunks/pages/index.js',
  'rewrite-rules.json',
  'amplify.json'
];

let allCriticalFilesExist = true;

criticalFiles.forEach(file => {
  const filePath = path.join(outDir, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${file} exists (${stats.size} bytes)`);
  } else {
    console.log(`❌ ${file} is missing`);
    allCriticalFilesExist = false;
  }
});

if (!allCriticalFilesExist) {
  console.log('\n⚠️ Some critical files are missing. Run the enhance-static-export.js script to create them.');
}

// Analyze the index.html file
console.log('\n🔍 Analyzing index.html...');
const indexPath = path.join(outDir, 'index.html');
if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Check for important elements
  const checks = [
    { name: 'Next.js data configuration', regex: /__NEXT_DATA__/, critical: true },
    { name: 'Main JS import', regex: /_next\/static\/chunks\/main\.js/, critical: true },
    { name: 'App JS import', regex: /_next\/static\/chunks\/pages\/_app\.js/, critical: true },
    { name: 'Index JS import', regex: /_next\/static\/chunks\/pages\/index\.js/, critical: true },
    { name: 'HTML lang attribute', regex: /<html\s+lang=/, critical: false },
    { name: 'Viewport meta tag', regex: /<meta\s+name="viewport"/, critical: false }
  ];
  
  checks.forEach(check => {
    const exists = check.regex.test(indexContent);
    console.log(`${exists ? '✅' : (check.critical ? '❌' : '⚠️')} ${check.name}: ${exists ? 'Present' : 'Missing'}`);
  });
  
  // Try to extract and display the Next.js data config
  try {
    const nextDataMatch = indexContent.match(/window\.__NEXT_DATA__\s*=\s*({[^<]*});/);
    if (nextDataMatch && nextDataMatch[1]) {
      console.log('\n📊 __NEXT_DATA__ configuration:');
      try {
        const nextData = JSON.parse(nextDataMatch[1]);
        console.log(JSON.stringify(nextData, null, 2));
      } catch (e) {
        console.log('   Could not parse __NEXT_DATA__ as JSON');
        console.log('   Raw data:', nextDataMatch[1]);
      }
    }
  } catch (e) {
    console.log('Error extracting Next.js data:', e.message);
  }
}

// Check HTML files for consistent paths
console.log('\n🔍 Checking HTML files for consistent paths...');
const htmlFiles = glob.sync('**/*.html', { cwd: outDir });
console.log(`Found ${htmlFiles.length} HTML files`);

// Sample a few HTML files to check paths
const samplesToCheck = Math.min(5, htmlFiles.length);
console.log(`Checking ${samplesToCheck} sample HTML files...`);

for (let i = 0; i < samplesToCheck; i++) {
  const file = htmlFiles[i];
  const filePath = path.join(outDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if JS paths are correct
  const relativePrefix = file.split('/').length > 1 ? '../'.repeat(file.split('/').length - 1) : './';
  const expectedPathPrefix = relativePrefix + '_next/';
  
  const jsPathMatch = content.match(/(src=["'])(\.\/|\.\.|\/)?_next\//);
  if (jsPathMatch) {
    const actualPath = jsPathMatch[1] + (jsPathMatch[2] || '') + '_next/';
    const correctPath = jsPathMatch[1] + expectedPathPrefix;
    console.log(`${file}: JS path ${actualPath === correctPath ? '✅ correct' : '❌ incorrect'} (expected: ${correctPath})`);
  } else {
    console.log(`${file}: ❌ No _next/ JS paths found`);
  }
}

// Check Amplify configuration files
console.log('\n🔧 Checking Amplify configuration files...');
const amplifyFiles = [
  { name: 'rewrite-rules.json', critical: true },
  { name: 'amplify.json', critical: true },
  { name: 'rewrite-config.json', critical: false },
  { name: '_redirects', critical: false },
  { name: '.htaccess', critical: false }
];

amplifyFiles.forEach(file => {
  const filePath = path.join(outDir, file.name);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file.name} exists`);
    if (file.name.endsWith('.json')) {
      try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        console.log(`   Content: ${JSON.stringify(content)}`);
      } catch (e) {
        console.log(`   ⚠️ Invalid JSON: ${e.message}`);
      }
    }
  } else {
    console.log(`${file.critical ? '❌' : '⚠️'} ${file.name} is missing`);
  }
});

console.log('\n✨ Static export verification completed!');
console.log('If any critical issues were found, run the enhance-static-export.js script to fix them.');