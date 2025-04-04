// Popup script for Atom Mind Gmail Extension
console.log('Atom Mind - Popup script loaded');

// Elements
const mainToggle = document.getElementById('main-toggle');
const smartComposeToggle = document.getElementById('smart-compose');
const grammarCheckToggle = document.getElementById('grammar-check');
const replyAssistantToggle = document.getElementById('reply-assistant');
const subjectOptimizerToggle = document.getElementById('subject-optimizer');
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');

// Load settings when popup opens
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  checkStatus();
});

// Load saved settings
function loadSettings() {
  chrome.storage.local.get(['enabled', 'features'], (result) => {
    if (result.enabled !== undefined) {
      mainToggle.checked = result.enabled;
      updateStatusIndicator(result.enabled);
    }
    
    if (result.features) {
      smartComposeToggle.checked = result.features.smartCompose;
      grammarCheckToggle.checked = result.features.grammarCheck;
      replyAssistantToggle.checked = result.features.replyAssistant;
      subjectOptimizerToggle.checked = result.features.subjectOptimizer;
    }
    
    updateFeatureTogglesState(mainToggle.checked);
  });
}

// Save settings when changed
mainToggle.addEventListener('change', () => {
  const enabled = mainToggle.checked;
  chrome.storage.local.set({ enabled });
  updateStatusIndicator(enabled);
  updateFeatureTogglesState(enabled);
});

// Handle feature toggles
[smartComposeToggle, grammarCheckToggle, replyAssistantToggle, subjectOptimizerToggle].forEach(toggle => {
  toggle.addEventListener('change', saveFeatureSettings);
});

// Save feature settings
function saveFeatureSettings() {
  chrome.storage.local.set({
    features: {
      smartCompose: smartComposeToggle.checked,
      grammarCheck: grammarCheckToggle.checked,
      replyAssistant: replyAssistantToggle.checked,
      subjectOptimizer: subjectOptimizerToggle.checked
    }
  });
}

// Update feature toggles state based on main toggle
function updateFeatureTogglesState(enabled) {
  [smartComposeToggle, grammarCheckToggle, replyAssistantToggle, subjectOptimizerToggle].forEach(toggle => {
    toggle.disabled = !enabled;
  });
}

// Update status indicator
function updateStatusIndicator(active) {
  if (active) {
    statusIndicator.className = 'status-active';
    statusText.textContent = 'Atom Mind is active';
  } else {
    statusIndicator.className = 'status-inactive';
    statusText.textContent = 'Atom Mind is disabled';
  }
}

// Check extension status with background script
function checkStatus() {
  chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error checking status:', chrome.runtime.lastError);
      return;
    }
    
    console.log('Status response:', response);
  });
}