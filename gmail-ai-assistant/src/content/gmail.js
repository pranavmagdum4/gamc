// Gmail Interface Integration
console.log('Atom Mind - Gmail interface integration loaded');

// Main class to handle Gmail integration
class GmailIntegration {
  constructor() {
    this.initialized = false;
    this.composeObserver = null;
    this.emailObserver = null;
  }

  // Initialize the integration
  init() {
    if (this.initialized) return;
    
    console.log("Initializing Gmail integration...");
    this.waitForGmailToLoad()
      .then(() => {
        console.log("Gmail loaded, setting up observers...");
        this.setupComposeObserver();
        this.setupEmailObserver();
        this.initialized = true;
      })
      .catch(error => {
        console.error("Error initializing Gmail integration:", error);
      });
  }

  // Wait for Gmail to fully load
  waitForGmailToLoad() {
    return new Promise((resolve, reject) => {
      const MAX_ATTEMPTS = 20;
      let attempts = 0;
      
      const checkGmailLoaded = () => {
        attempts++;
        console.log(`Checking if Gmail is loaded (attempt ${attempts})...`);
        
        // Check if Gmail's UI elements are available
        if (document.querySelector('.aAy')) {
          console.log("Gmail interface detected");
          resolve();
          return;
        }
        
        if (attempts >= MAX_ATTEMPTS) {
          reject(new Error("Gmail failed to load after multiple attempts"));
          return;
        }
        
        setTimeout(checkGmailLoaded, 1000);
      };
      
      checkGmailLoaded();
    });
  }

  // Setup observer for compose windows
  setupComposeObserver() {
    // Observe for compose window openings
    this.composeObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if this is a compose window
              const composeBox = node.querySelector('.Am.Al.editable');
              if (composeBox) {
                console.log("Compose window detected!");
                this.injectComposeToolbar(composeBox);
              }
            }
          }
        }
      }
    });
    
    // Start observing document body for compose windows
    this.composeObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Setup observer for email reading
  setupEmailObserver() {
    // Observe for email content loading
    this.emailObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if this is an email being viewed
              const emailContent = node.querySelector('.a3s.aiL');
              if (emailContent) {
                console.log("Email content detected!");
                this.injectReplyOptions(emailContent);
              }
            }
          }
        }
      }
    });
    
    // Start observing changes to the main view
    const mainContainer = document.querySelector('.AO');
    if (mainContainer) {
      this.emailObserver.observe(mainContainer, {
        childList: true,
        subtree: true
      });
    }
  }

  // Inject our toolbar into compose windows
  injectComposeToolbar(composeBox) {
    // First check if our toolbar already exists
    if (composeBox.parentNode.querySelector('.atom-mind-toolbar')) {
      return;
    }
    
    // Create toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'atom-mind-toolbar';
    toolbar.style.cssText = `
      padding: 5px 10px;
      background: #f8f9fa;
      border-bottom: 1px solid #dadce0;
      display: flex;
      align-items: center;
      gap: 10px;
    `;
    
    // Create draft button
    const draftButton = document.createElement('button');
    draftButton.textContent = '✍️ Draft Email';
    draftButton.className = 'atom-mind-button';
    draftButton.style.cssText = `
      background-color: #1a73e8;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 6px 12px;
      font-size: 14px;
      cursor: pointer;
    `;
    draftButton.addEventListener('click', () => this.handleDraftEmail(composeBox));
    
    // Create improve button
    const improveButton = document.createElement('button');
    improveButton.textContent = '✨ Improve';
    improveButton.className = 'atom-mind-button';
    improveButton.style.cssText = `
      background-color: #1a73e8;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 6px 12px;
      font-size: 14px;
      cursor: pointer;
    `;
    improveButton.addEventListener('click', () => this.handleImproveEmail(composeBox));
    
    // Add buttons to toolbar
    toolbar.appendChild(draftButton);
    toolbar.appendChild(improveButton);
    
    // Insert toolbar before compose box
    composeBox.parentNode.insertBefore(toolbar, composeBox);
  }

  // Inject reply options for viewed emails
  injectReplyOptions(emailContent) {
    // First check if options already exist
    if (emailContent.parentNode.querySelector('.atom-mind-reply-options')) {
      return;
    }
    
    // Create reply options container
    const replyOptions = document.createElement('div');
    replyOptions.className = 'atom-mind-reply-options';
    replyOptions.style.cssText = `
      margin-top: 10px;
      padding: 8px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #dadce0;
    `;
    
    // Add heading
    const heading = document.createElement('div');
    heading.textContent = 'Atom Mind Replies';
    heading.style.fontWeight = 'bold';
    heading.style.marginBottom = '8px';
    replyOptions.appendChild(heading);
    
    // Add reply options
    const replyTypes = [
      { text: 'Quick Acknowledge', emoji: '👍' },
      { text: 'Detailed Response', emoji: '📝' },
      { text: 'Ask for Clarification', emoji: '❓' }
    ];
    
    replyTypes.forEach(type => {
      const option = document.createElement('button');
      option.textContent = `${type.emoji} ${type.text}`;
      option.className = 'atom-mind-reply-option';
      option.style.cssText = `
        display: block;
        margin: 5px 0;
        background-color: white;
        border: 1px solid #dadce0;
        border-radius: 4px;
        padding: 5px 10px;
        font-size: 13px;
        cursor: pointer;
        width: 100%;
        text-align: left;
      `;
      option.addEventListener('click', () => this.handleGenerateReply(emailContent, type.text));
      replyOptions.appendChild(option);
    });
    
    // Insert after email content
    emailContent.parentNode.insertBefore(replyOptions, emailContent.nextSibling);
  }

  // Handler for drafting new emails
  handleDraftEmail(composeBox) {
    // Placeholder - will connect to Gemini API later
    console.log("Draft email button clicked");
    alert("AI is generating a draft email...\n\nThis will be connected to Gemini API in the next step.");
  }

  // Handler for improving emails
  handleImproveEmail(composeBox) {
    // Placeholder - will connect to Gemini API later
    console.log("Improve email button clicked");
    const currentText = composeBox.textContent;
    alert(`AI will improve your email text:\n\n"${currentText}"\n\nThis will be connected to Gemini API in the next step.`);
  }

  // Handler for generating replies
  handleGenerateReply(emailContent, replyType) {
    // Placeholder - will connect to Gemini API later
    console.log(`Generate ${replyType} reply clicked`);
    alert(`AI will generate a "${replyType}" reply based on the email content.\n\nThis will be connected to Gemini API in the next step.`);
  }
}

// Initialize integration when content script loads
const gmailIntegration = new GmailIntegration();
gmailIntegration.init();