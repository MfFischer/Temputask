// DOM elements
const trackingCheckbox = document.getElementById('trackingCheckbox');
const trackingStatus = document.getElementById('trackingStatus');
const loginState = document.getElementById('loginState');
const tokenInputState = document.getElementById('tokenInputState');
const connectedState = document.getElementById('connectedState');
const userIdInput = document.getElementById('userIdInput');
const tokenInput = document.getElementById('tokenInput');
const userIdDisplay = document.getElementById('userIdDisplay');
const connectionStatus = document.getElementById('connectionStatus');
const siteCount = document.getElementById('siteCount');
const lastSync = document.getElementById('lastSync');

// Buttons
const connectBtn = document.getElementById('connectBtn');
const loginBtn = document.getElementById('loginBtn');
const saveTokenBtn = document.getElementById('saveTokenBtn');
const cancelTokenBtn = document.getElementById('cancelTokenBtn');
const syncNowBtn = document.getElementById('syncNowBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const openOptionsBtn = document.getElementById('openOptionsBtn');
const openDashboardBtn = document.getElementById('openDashboardBtn');

// State variables
let isTracking = true;
let userId = null;
let authToken = null;
let apiUrl = null;
let dashboardUrl = 'https://app.temposai.com';

// Initialize popup
async function initializePopup() {
  // Get status from background script
  const status = await sendMessageToBackground({ action: 'getStatus' });
  
  // Update UI based on status
  isTracking = status.isTracking;
  userId = status.userId;
  authToken = status.authToken;
  
  // Update tracking toggle
  trackingCheckbox.checked = isTracking;
  trackingStatus.textContent = isTracking ? 'Tracking' : 'Paused';
  trackingStatus.style.color = isTracking ? '#10b981' : '#ef4444';
  
  // Show appropriate state
  if (userId && authToken) {
    showConnectedState(status);
  } else {
    showLoginState();
  }
  
  // Load settings
  const settings = await chrome.storage.sync.get(['dashboardUrl']);
  if (settings.dashboardUrl) {
    dashboardUrl = settings.dashboardUrl;
  }
}

// Send message to background script
function sendMessageToBackground(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, response => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

// Show login state
function showLoginState() {
  loginState.classList.remove('hidden');
  tokenInputState.classList.add('hidden');
  connectedState.classList.add('hidden');
}

// Show token input state
function showTokenInputState() {
  loginState.classList.add('hidden');
  tokenInputState.classList.remove('hidden');
  connectedState.classList.add('hidden');
}

// Show connected state
function showConnectedState(status) {
  loginState.classList.add('hidden');
  tokenInputState.classList.add('hidden');
  connectedState.classList.remove('hidden');
  
  // Update connected state UI
  userIdDisplay.textContent = userId ? userId.substring(0, 8) + '...' : 'Not set';
  siteCount.textContent = status.siteCount || 0;
  
  // Get last sync time
  chrome.storage.local.get(['lastSyncTime'], result => {
    if (result.lastSyncTime) {
      const lastSyncDate = new Date(result.lastSyncTime);
      lastSync.textContent = lastSyncDate.toLocaleTimeString();
    } else {
      lastSync.textContent = 'Never';
    }
  });
}

// Toggle tracking status
async function toggleTracking() {
  const response = await sendMessageToBackground({ action: 'toggleTracking' });
  
  isTracking = response.isTracking;
  trackingStatus.textContent = isTracking ? 'Tracking' : 'Paused';
  trackingStatus.style.color = isTracking ? '#10b981' : '#ef4444';
}

// Save credentials
async function saveCredentials() {
  const newUserId = userIdInput.value.trim();
  const newAuthToken = tokenInput.value.trim();
  
  if (!newUserId || !newAuthToken) {
    alert('Please enter both User ID and Auth Token');
    return;
  }
  
  try {
    await sendMessageToBackground({
      action: 'setCredentials',
      userId: newUserId,
      authToken: newAuthToken
    });
    
    // Update local variables
    userId = newUserId;
    authToken = newAuthToken;
    
    // Get updated status
    const status = await sendMessageToBackground({ action: 'getStatus' });
    
    // Show connected state
    showConnectedState(status);
  } catch (error) {
    alert(`Error saving credentials: ${error.message}`);
  }
}

// Disconnect account
async function disconnectAccount() {
  if (!confirm('Are you sure you want to disconnect your account?')) {
    return;
  }
  
  try {
    await sendMessageToBackground({
      action: 'setCredentials',
      userId: null,
      authToken: null
    });
    
    // Clear local variables
    userId = null;
    authToken = null;
    
    // Show login state
    showLoginState();
  } catch (error) {
    alert(`Error disconnecting account: ${error.message}`);
  }
}

// Perform manual sync
async function syncNow() {
  syncNowBtn.textContent = 'Syncing...';
  syncNowBtn.disabled = true;
  
  try {
    const response = await sendMessageToBackground({ action: 'syncNow' });
    
    if (response.success) {
      siteCount.textContent = response.siteCount || 0;
      
      // Update last sync time
      const now = new Date();
      lastSync.textContent = now.toLocaleTimeString();
      
      // Save last sync time
      chrome.storage.local.set({ lastSyncTime: now.getTime() });
    } else {
      alert(`Sync failed: ${response.error}`);
    }
  } catch (error) {
    alert(`Error syncing data: ${error.message}`);
  } finally {
    syncNowBtn.textContent = 'Sync Now';
    syncNowBtn.disabled = false;
  }
}

// Open dashboard
function openDashboard() {
  chrome.tabs.create({ url: dashboardUrl });
}

// Open options page
function openOptions() {
  chrome.runtime.openOptionsPage();
}

// Open setup page
function openSetupPage() {
  chrome.tabs.create({ url: `${dashboardUrl}/extension-setup` });
}

// Event listeners
trackingCheckbox.addEventListener('change', toggleTracking);
connectBtn.addEventListener('click', openSetupPage);
loginBtn.addEventListener('click', showTokenInputState);
saveTokenBtn.addEventListener('click', saveCredentials);
cancelTokenBtn.addEventListener('click', showLoginState);
syncNowBtn.addEventListener('click', syncNow);
disconnectBtn.addEventListener('click', disconnectAccount);
openDashboardBtn.addEventListener('click', openDashboard);
openOptionsBtn.addEventListener('click', openOptions);

// Initialize popup when opened
document.addEventListener('DOMContentLoaded', initializePopup);