const fs = require('fs');
const path = require('path');

// Store the current directory
const currentDir = process.cwd();

// Paths to config files
const mainConfigPath = path.join(currentDir, 'next.config.js');
const prodConfigPath = path.join(currentDir, 'next.config.prod.js');
const devConfigPath = path.join(currentDir, 'next.config.dev.js');
const envLocalPath = path.join(currentDir, '.env.local');

// Function to create a development config
function createDevConfig() {
  // Read the production config
  let config = fs.readFileSync(mainConfigPath, 'utf8');
  
  // Comment out the static export options
  config = config.replace(/output: ['"]export['"],?/g, '// output: "export",');
  config = config.replace(/distDir: ['"]out['"],?/g, '// distDir: "out",');
  config = config.replace(/unoptimized: true/g, '// unoptimized: true');
  
  // Write to the dev config file
  fs.writeFileSync(devConfigPath, config);
  
  console.log('✅ Created development config');
}

// Function to create development environment variables
function createDevEnv() {
  const envContent = `# Development environment variables
NEXT_PUBLIC_EXPORT=false
NODE_ENV=development
`;
  fs.writeFileSync(envLocalPath, envContent);
  console.log('✅ Created development environment variables');
}

// Function to start dev mode
function startDevMode() {
  // If we don't already have a dev config, create one
  if (!fs.existsSync(devConfigPath)) {
    createDevConfig();
  }
  
  // Backup the production config
  if (!fs.existsSync(prodConfigPath)) {
    fs.copyFileSync(mainConfigPath, prodConfigPath);
    console.log('✅ Backed up production config');
  }
  
  // Replace main config with dev config
  fs.copyFileSync(devConfigPath, mainConfigPath);
  
  // Create development environment variables
  createDevEnv();
  
  console.log('✅ Switched to development config');
  console.log('🚀 Ready to run "npm run dev"');
}

// Function to restore production mode
function restoreProdMode() {
  // Check if we have a backup of the production config
  if (fs.existsSync(prodConfigPath)) {
    // Restore production config
    fs.copyFileSync(prodConfigPath, mainConfigPath);
    fs.unlinkSync(prodConfigPath);
    console.log('✅ Restored production config');
  } else {
    console.log('⚠️ No production config backup found');
  }
  
  // Remove development environment variables
  if (fs.existsSync(envLocalPath)) {
    fs.unlinkSync(envLocalPath);
    console.log('✅ Removed development environment variables');
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command === 'start') {
  startDevMode();
} else if (command === 'restore') {
  restoreProdMode();
} else {
  console.log('Please specify a command: "start" or "restore"');
  console.log('  - "start": Switch to development config');
  console.log('  - "restore": Restore production config');
}