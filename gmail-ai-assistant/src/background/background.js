// Background script for Atom Mind Gmail Extension
console.log('Atom Mind - Background script loaded');

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);
  
  if (message.action === 'getStatus') {
    sendResponse({ status: 'ready' });
  }
  
  // Keep the message channel open for async responses
  return true;
});

// Initialize extension when installed
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed:', details.reason);
  
  // Initialize storage with default settings
  chrome.storage.local.set({
    enabled: true,
    features: {
      smartCompose: true,
      grammarCheck: true,
      replyAssistant: true,
      subjectOptimizer: true
    }
  }, () => {
    console.log('Default settings initialized');
  });
});