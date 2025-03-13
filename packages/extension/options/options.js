// DOM Elements
const userIdInput = document.getElementById('userIdInput');
const authTokenInput = document.getElementById('authTokenInput');
const apiUrlInput = document.getElementById('apiUrlInput');
const dashboardUrlInput = document.getElementById('dashboardUrlInput');
const enableTrackingCheckbox = document.getElementById('enableTrackingCheckbox');
const trackIncognitoCheckbox = document.getElementById('trackIncognitoCheckbox');
const syncIntervalSelect = document.getElementById('syncIntervalSelect');
const idleThresholdSelect = document.getElementById('idleThresholdSelect');
const ignoreDomainInput = document.getElementById('ignoreDomainInput');
const addIgnoreDomainBtn = document.getElementById('addIgnoreDomainBtn');
const ignoredDomainsList = document.getElementById('ignoredDomainsList');
const clearDataBtn = document.getElementById('clearDataBtn');
const exportDataBtn = document.getElementById('exportDataBtn');
const restoreDefaultsBtn = document.getElementById('restoreDefaultsBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const statusMessage = document.getElementById('statusMessage');

// Default settings
const defaultSettings = {
  userId: '',
  authToken: '',
  apiUrl: 'https://api.temposai.app',
  dashboardUrl: 'https://app.temposai.com',
  isTracking: true,
  trackIncognito: false,
  syncInterval: 5,
  idleThreshold: 300,
  ignoredDomains: []
};

// Current settings
let currentSettings = { ...defaultSettings };

// Initialize options page
async function initializeOptions() {
  try {
    // Load settings from storage
    const settings = await chrome.storage.sync.get(Object.keys(defaultSettings));
    
    // Merge with defaults
    currentSettings = { ...defaultSettings, ...settings };
    
    // Update UI with current settings
    updateUI();
    
  } catch (error) {
    showMessage('Error loading settings: ' + error.message, 'error');
  }
}

// Update UI with current settings
function updateUI() {
  userIdInput.value = currentSettings.userId || '';
  authTokenInput.value = currentSettings.authToken || '';
  apiUrlInput.value = currentSettings.apiUrl || defaultSettings.apiUrl;
  dashboardUrlInput.value = currentSettings.dashboardUrl || defaultSettings.dashboardUrl;
  enableTrackingCheckbox.checked = currentSettings.isTracking !== false;
  trackIncognitoCheckbox.checked = currentSettings.trackIncognito === true;
  
  // Set select values
  const syncInterval = currentSettings.syncInterval || defaultSettings.syncInterval;
  for (const option of syncIntervalSelect.options) {
    if (parseInt(option.value) === syncInterval) {
      option.selected = true;
      break;
    }
  }
  
  const idleThreshold = currentSettings.idleThreshold || defaultSettings.idleThreshold;
  for (const option of idleThresholdSelect.options) {
    if (parseInt(option.value) === idleThreshold) {
      option.selected = true;
      break;
    }
  }
  
  // Update ignored domains list
  updateIgnoredDomainsList();
}

// Update the ignored domains list
function updateIgnoredDomainsList() {
  ignoredDomainsList.innerHTML = '';
  
  if (!currentSettings.ignoredDomains || currentSettings.ignoredDomains.length === 0) {
    const emptyItem = document.createElement('div');
    emptyItem.className = 'domain-item';
    emptyItem.textContent = 'No domains added';
    ignoredDomainsList.appendChild(emptyItem);
    return;
  }
  
  currentSettings.ignoredDomains.forEach(domain => {
    const domainItem = document.createElement('div');
    domainItem.className = 'domain-item';
    
    const domainText = document.createElement('span');
    domainText.textContent = domain;
    
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.className = 'secondary-button';
    removeButton.onclick = () => removeDomain(domain);
    
    domainItem.appendChild(domainText);
    domainItem.appendChild(removeButton);
    ignoredDomainsList.appendChild(domainItem);
  });
}

// Add a domain to ignore list
function addDomain() {
  const domain = ignoreDomainInput.value.trim().toLowerCase();
  
  if (!domain) {
    showMessage('Please enter a domain', 'error');
    return;
  }
  
  // Simple domain validation
  if (!/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/.test(domain)) {
    showMessage('Please enter a valid domain (e.g., example.com)', 'error');
    return;
  }
  
  // Check if domain already exists
  if (currentSettings.ignoredDomains && currentSettings.ignoredDomains.includes(domain)) {
    showMessage('Domain already in the list', 'error');
    return;
  }
  
  // Add domain to list
  if (!currentSettings.ignoredDomains) {
    currentSettings.ignoredDomains = [];
  }
  
  currentSettings.ignoredDomains.push(domain);
  
  // Clear input and update UI
  ignoreDomainInput.value = '';
  updateIgnoredDomainsList();
}

// Remove a domain from ignore list
function removeDomain(domain) {
  if (!currentSettings.ignoredDomains) return;
  
  currentSettings.ignoredDomains = currentSettings.ignoredDomains.filter(d => d !== domain);
  updateIgnoredDomainsList();
}

// Save settings
async function saveSettings() {
  try {
    // Get values from UI
    const settings = {
      userId: userIdInput.value.trim(),
      authToken: authTokenInput.value.trim(),
      apiUrl: apiUrlInput.value.trim() || defaultSettings.apiUrl,
      dashboardUrl: dashboardUrlInput.value.trim() || defaultSettings.dashboardUrl,
      isTracking: enableTrackingCheckbox.checked,
      trackIncognito: trackIncognitoCheckbox.checked,
      syncInterval: parseInt(syncIntervalSelect.value),
      idleThreshold: parseInt(idleThresholdSelect.value),
      ignoredDomains: currentSettings.ignoredDomains || []
    };
    
    // Validate settings
    if (settings.userId && !settings.authToken) {
      showMessage('Auth Token is required when User ID is provided', 'error');
      return;
    }
    
    // Save to storage
    await chrome.storage.sync.set(settings);
    
    // Update current settings
    currentSettings = settings;
    
    // Notify background script
    await chrome.runtime.sendMessage({
      action: 'setCredentials',
      userId: settings.userId,
      authToken: settings.authToken,
      apiUrl: settings.apiUrl
    });
    
    // Update idle detection interval
    await chrome.idle.setDetectionInterval(settings.idleThreshold);
    
    // Update sync alarm
    await chrome.alarms.clear('syncData');
    await chrome.alarms.create('syncData', { periodInMinutes: settings.syncInterval });
    
    showMessage('Settings saved successfully', 'success');
  } catch (error) {
    showMessage('Error saving settings: ' + error.message, 'error');
  }
}

// Restore default settings
function restoreDefaults() {
  if (!confirm('Are you sure you want to restore default settings? This will not affect your account connection.')) {
    return;
  }
  
  // Keep user credentials
  const userId = currentSettings.userId;
  const authToken = currentSettings.authToken;
  
  // Reset to defaults
  currentSettings = { ...defaultSettings, userId, authToken };
  
  // Update UI
  updateUI();
  
  showMessage('Default settings restored', 'success');
}

// Clear cached data
async function clearData() {
  if (!confirm('Are you sure you want to clear all cached data? This will not delete data already sent to the server.')) {
    return;
  }
  
  try {
    // Send message to background script
    await chrome.runtime.sendMessage({ action: 'clearData' });
    
    // Clear local storage
    await chrome.storage.local.clear();
    
    showMessage('Cached data cleared successfully', 'success');
  } catch (error) {
    showMessage('Error clearing data: ' + error.message, 'error');
  }
}

// Export collected data
async function exportData() {
  try {
    // Get site activities from local storage
    const { siteActivities } = await chrome.storage.local.get(['siteActivities']);
    
    // Create download link
    const data = JSON.stringify(siteActivities || {}, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tempos_ai_data_export.json';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    showMessage('Error exporting data: ' + error.message, 'error');
  }
}

// Show status message
function showMessage(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `message ${type}`;
  statusMessage.classList.remove('hidden');
  
  // Hide message after 3 seconds
  setTimeout(() => {
    statusMessage.classList.add('hidden');
  }, 3000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', initializeOptions);
saveSettingsBtn.addEventListener('click', saveSettings);
restoreDefaultsBtn.addEventListener('click', restoreDefaults);
clearDataBtn.addEventListener('click', clearData);
exportDataBtn.addEventListener('click', exportData);
addIgnoreDomainBtn.addEventListener('click', addDomain);

// Add domain on Enter key
ignoreDomainInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    addDomain();
  }
});