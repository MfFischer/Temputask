// Background service worker for Tempu Task extension
let activeTabId = null;
let activeUrl = null;
let activeDomain = null;
let startTime = null;
let siteActivities = {};
let isTracking = true;
let userId = null;
let authToken = null;
let apiUrl = null;

// Initialize extension
async function initialize() {
  console.log('Initializing Tempu Task extension...');
  
  // Load settings from storage
  const settings = await chrome.storage.sync.get([
    'isTracking',
    'userId',
    'authToken',
    'apiUrl'
  ]);
  
  isTracking = settings.isTracking !== undefined ? settings.isTracking : true;
  userId = settings.userId || null;
  authToken = settings.authToken || null;
  apiUrl = settings.apiUrl || 'https://api.temposai.app';
  
  // Set badge based on tracking status
  updateBadge();
  
  // Set up data sync alarm (every 5 minutes)
  chrome.alarms.create('syncData', { periodInMinutes: 5 });
  
  console.log('Tempu Task extension initialized');
}

// Get domain from URL
function getDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return null;
  }
}

// Handle tab activation
async function handleTabActivated(activeInfo) {
  if (!isTracking || !userId || !authToken) return;
  
  // Save data for previous tab if needed
  await saveCurrentTabData();
  
  // Get tab info
  const tab = await chrome.tabs.get(activeInfo.tabId);
  
  // Don't track chrome:// URLs or extension pages
  if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
    activeTabId = null;
    activeUrl = null;
    activeDomain = null;
    startTime = null;
    return;
  }
  
  // Set active tab info
  activeTabId = tab.id;
  activeUrl = tab.url;
  activeDomain = getDomain(tab.url);
  startTime = Date.now();
}

// Handle tab updating (URL changes)
async function handleTabUpdated(tabId, changeInfo, tab) {
  if (!isTracking || !userId || !authToken) return;
  if (tabId !== activeTabId) return;
  if (!changeInfo.url) return;
  
  // Save data for previous URL
  await saveCurrentTabData();
  
  // Update active URL info
  activeUrl = tab.url;
  activeDomain = getDomain(tab.url);
  startTime = Date.now();
}

// Save current tab data
async function saveCurrentTabData() {
  if (!activeUrl || !activeDomain || !startTime) return;
  
  const now = Date.now();
  const duration = Math.round((now - startTime) / 1000); // Duration in seconds
  
  // Don't record very short visits (less than 5 seconds)
  if (duration < 5) return;
  
  // Add to site activities
  if (!siteActivities[activeDomain]) {
    siteActivities[activeDomain] = {
      domain: activeDomain,
      url: activeUrl,
      duration: duration
    };
  } else {
    // Update existing entry
    siteActivities[activeDomain].duration += duration;
    siteActivities[activeDomain].url = activeUrl; // Update with most recent URL
  }
  
  // Reset timer
  startTime = now;
  
  // Save to storage (in case browser crashes)
  await chrome.storage.local.set({ siteActivities });
}

// Sync data with server
async function syncDataWithServer() {
  if (!userId || !authToken) {
    console.log('Not syncing - missing user credentials');
    return;
  }
  
  // Save current tab data first
  await saveCurrentTabData();
  
  // Skip if no data to sync
  const domains = Object.keys(siteActivities);
  if (domains.length === 0) {
    console.log('No data to sync');
    return;
  }
  
  // Prepare data for API
  const sitesToSync = domains.map(domain => ({
    url: siteActivities[domain].url,
    domain: domain,
    duration: siteActivities[domain].duration
  }));
  
  try {
    // Send data to API
    const response = await fetch(`${apiUrl}/extension/logSiteActivity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Extension-Token': authToken
      },
      body: JSON.stringify({
        user_id: userId,
        sites: sitesToSync
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Synced ${data.count} site activities`);
    
    // Clear synced data
    siteActivities = {};
    await chrome.storage.local.set({ siteActivities });
  } catch (error) {
    console.error('Error syncing data:', error);
    // Keep the data for next sync attempt
  }
}

// Update badge based on tracking status
function updateBadge() {
  const color = isTracking ? '#10B981' : '#EF4444';
  const text = isTracking ? 'ON' : 'OFF';
  
  chrome.action.setBadgeBackgroundColor({ color });
  chrome.action.setBadgeText({ text });
}

// Toggle tracking state
async function toggleTracking() {
  isTracking = !isTracking;
  
  // Update badge
  updateBadge();
  
  // Save setting
  await chrome.storage.sync.set({ isTracking });
  
  // If turning tracking on, start with current tab
  if (isTracking) {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
      const tab = tabs[0];
      activeTabId = tab.id;
      activeUrl = tab.url;
      activeDomain = getDomain(tab.url);
      startTime = Date.now();
    }
  } else {
    // If turning tracking off, save current data
    await saveCurrentTabData();
    
    // Reset current tab tracking
    activeTabId = null;
    activeUrl = null;
    activeDomain = null;
    startTime = null;
  }
}

// Handle messages from popup and options pages
function handleMessage(request, sender, sendResponse) {
  if (request.action === 'getStatus') {
    sendResponse({
      isTracking,
      userId,
      authToken,
      apiUrl,
      siteCount: Object.keys(siteActivities).length
    });
  } else if (request.action === 'toggleTracking') {
    toggleTracking().then(() => {
      sendResponse({ success: true, isTracking });
    });
    return true; // Keep channel open for async response
  } else if (request.action === 'setCredentials') {
    userId = request.userId;
    authToken = request.authToken;
    apiUrl = request.apiUrl || apiUrl;
    
    chrome.storage.sync.set({
      userId,
      authToken,
      apiUrl
    }).then(() => {
      sendResponse({ success: true });
    });
    
    return true; // Keep channel open for async response
  } else if (request.action === 'clearData') {
    siteActivities = {};
    chrome.storage.local.set({ siteActivities }).then(() => {
      sendResponse({ success: true });
    });
    return true; // Keep channel open for async response
  } else if (request.action === 'syncNow') {
    syncDataWithServer().then(() => {
      sendResponse({ 
        success: true, 
        siteCount: Object.keys(siteActivities).length 
      });
    }).catch(error => {
      sendResponse({ 
        success: false, 
        error: error.message 
      });
    });
    return true; // Keep channel open for async response
  }
}

// Handle extension startup
chrome.runtime.onInstalled.addListener(initialize);
chrome.runtime.onStartup.addListener(initialize);

// Listen for tab activation
chrome.tabs.onActivated.addListener(handleTabActivated);

// Listen for URL changes
chrome.tabs.onUpdated.addListener(handleTabUpdated);

// Listen for alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'syncData') {
    syncDataWithServer();
  }
});

// Listen for idle state changes
chrome.idle.onStateChanged.addListener((state) => {
  if (state === 'active') {
    // User is active again, start new session
    chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs.length > 0) {
        const tab = tabs[0];
        activeTabId = tab.id;
        activeUrl = tab.url;
        activeDomain = getDomain(tab.url);
        startTime = Date.now();
      }
    });
  } else {
    // User is idle or locked, save current data
    saveCurrentTabData().then(() => {
      // Reset tracking
      activeTabId = null;
      activeUrl = null;
      activeDomain = null;
      startTime = null;
    });
  }
});

// Listen for messages from popup/options
chrome.runtime.onMessage.addListener(handleMessage);

// Set idle detection for 5 minutes
chrome.idle.setDetectionInterval(300);

// Recovery: load site activities from storage on startup
chrome.storage.local.get(['siteActivities']).then((result) => {
  if (result.siteActivities) {
    siteActivities = result.siteActivities;
  }
});