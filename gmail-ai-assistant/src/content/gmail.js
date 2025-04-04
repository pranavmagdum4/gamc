// Gmail Interface Integration with Gemini API
console.log('Atom Mind - Gmail interface integration loaded');

// Main class to handle Gmail integration
class GmailIntegration {
  constructor() {
    this.initialized = false;
    this.composeObserver = null;
    this.emailObserver = null;
    this.geminiService = null;
  }

  // Initialize the integration
  async init() {
    if (this.initialized) return;
    
    console.log("Initializing Gmail integration...");
    
    try {
      // Load the Gemini service
      await this.loadGeminiService();
      
      // Wait for Gmail to load
      await this.waitForGmailToLoad();
      
      console.log("Gmail loaded, setting up observers...");
      this.setupComposeObserver();
      this.setupEmailObserver();
      this.initialized = true;
    } catch (error) {
      console.error("Error initializing Gmail integration:", error);
    }
  }
  
  // Load Gemini service
  async loadGeminiService() {
    try {
      // Check if API key is stored
      const storage = await new Promise((resolve) => {
        chrome.storage.local.get(['geminiApiKey'], resolve);
      });
      
      // If no API key stored, ask for it
      if (!storage.geminiApiKey) {
        const apiKey = prompt("Please enter your Gemini API key to enable AI features:");
        if (apiKey) {
          await new Promise((resolve) => {
            chrome.storage.local.set({ geminiApiKey: apiKey }, resolve);
          });
        }
      }
      
      // Initialize Gemini service
      this.geminiService = await window.GeminiService.initialize();
      console.log("Gemini service initialized:", this.geminiService.hasApiKey());
    } catch (error) {
      console.error("Error loading Gemini service:", error);
    }
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
  async handleDraftEmail(composeBox) {
    try {
      // Check settings and API key
      if (!this.geminiService || !this.geminiService.hasApiKey()) {
        alert("Please set your Gemini API key in extension settings.");
        return;
      }
      
      // Create a simple form to collect email context
      const formHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; width: 500px;">
          <h2 style="margin-top: 0;">Draft Email with AI</h2>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Topic:</label>
            <input id="email-topic" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" placeholder="What's this email about?">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Recipient:</label>
            <input id="email-recipient" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" placeholder="Who are you writing to?">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Purpose:</label>
            <input id="email-purpose" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" placeholder="What do you want to achieve?">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Key Points:</label>
            <textarea id="email-points" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; height: 80px;" placeholder="What are the main points to include?"></textarea>
          </div>
          
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Tone:</label>
            <select id="email-tone" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
              <option value="Professional">Professional</option>
              <option value="Friendly">Friendly</option>
              <option value="Formal">Formal</option>
              <option value="Casual">Casual</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
          
          <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button id="cancel-draft" style="padding: 8px 16px; background: #f1f3f4; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
            <button id="generate-draft" style="padding: 8px 16px; background: #1a73e8; color: white; border: none; border-radius: 4px; cursor: pointer;">Generate Draft</button>
          </div>
        </div>
      `;
      
      // Create dialog container
      const dialog = document.createElement('div');
      dialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      `;
      dialog.innerHTML = formHtml;
      document.body.appendChild(dialog);
      
      // Handle form interactions
      document.getElementById('cancel-draft').addEventListener('click', () => {
        document.body.removeChild(dialog);
      });
      
      document.getElementById('generate-draft').addEventListener('click', async () => {
        try {
          const context = {
            topic: document.getElementById('email-topic').value,
            recipient: document.getElementById('email-recipient').value,
            purpose: document.getElementById('email-purpose').value,
            keyPoints: document.getElementById('email-points').value,
            tone: document.getElementById('email-tone').value
          };
          
          // Show loading state
          document.getElementById('generate-draft').textContent = 'Generating...';
          document.getElementById('generate-draft').disabled = true;
          
          // Generate email draft using Gemini API
          const emailContent = await this.geminiService.generateEmailDraft(context);
          
          // Insert the generated content into the compose box
          composeBox.innerHTML = emailContent;
          
          // Close the dialog
          document.body.removeChild(dialog);
        } catch (error) {
          alert(`Error generating draft: ${error.message}`);
          console.error('Draft generation error:', error);
        }
      });
    } catch (error) {
      console.error('Error handling draft email:', error);
      alert(`Error: ${error.message}`);
    }
  }

  // Handler for improving emails
  async handleImproveEmail(composeBox) {
    try {
      // Check settings and API key
      if (!this.geminiService || !this.geminiService.hasApiKey()) {
        alert("Please set your Gemini API key in extension settings.");
        return;
      }
      
      // Get current email content
      const currentText = composeBox.innerHTML;
      
      if (!currentText.trim()) {
        alert("Please write some email content first.");
        return;
      }
      
      // Show loading indicator
      const loadingIndicator = document.createElement('div');
      loadingIndicator.className = 'atom-mind-loading';
      loadingIndicator.textContent = 'Improving your email...';
      loadingIndicator.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 10px;
        text-align: center;
        z-index: 100;
      `;
      composeBox.parentNode.appendChild(loadingIndicator);
      
      // Generate improved content
      try {
        const improvedContent = await this.geminiService.improveEmail(currentText);
        
        // Replace the email content
        composeBox.innerHTML = improvedContent;
      } catch (error) {
        alert(`Error improving email: ${error.message}`);
        console.error('Email improvement error:', error);
      } finally {
        // Remove loading indicator
        composeBox.parentNode.removeChild(loadingIndicator);
      }
    } catch (error) {
      console.error('Error handling improve email:', error);
      alert(`Error: ${error.message}`);
    }
  }

  // Handler for generating replies
  async handleGenerateReply(emailContent, replyType) {
    try {
      // Check settings and API key
      if (!this.geminiService || !this.geminiService.hasApiKey()) {
        alert("Please set your Gemini API key in extension settings.");
        return;
      }
      
      // Get email content
      const emailText = emailContent.textContent;
      
      if (!emailText.trim()) {
        alert("Cannot extract email content.");
        return;
      }
      
      // Show loading dialog
      const loadingDialog = document.createElement('div');
      loadingDialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      `;
      loadingDialog.innerHTML = `
        <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
          <p>Generating ${replyType} Reply...</p>
          <div style="width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; margin: 10px auto; animation: spin 1s linear infinite;"></div>
          <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
        </div>
      `;
      document.body.appendChild(loadingDialog);
      
      try {
        // Generate reply using Gemini API
        const replyContent = await this.geminiService.generateReply(emailText, replyType);
        
        // Find and click the reply button
        const replyButtons = Array.from(document.querySelectorAll('[role="button"][aria-label*="Reply"]'));
        const replyButton = replyButtons.find(el => el.offsetParent !== null);
        
        if (replyButton) {
          replyButton.click();
          
          // Wait for the compose box to appear
          setTimeout(() => {
            const replyBox = document.querySelector('.Am.Al.editable');
            if (replyBox) {
              replyBox.innerHTML = replyContent;
            } else {
              alert(`Reply generated but couldn't find the reply box. Here's your reply:\n\n${replyContent}`);
            }
          }, 1000);
        } else {
          // Show the reply in an alert if can't find reply button
          alert(`Generated ${replyType} Reply:\n\n${replyContent}`);
        }
      } catch (error) {
        alert(`Error generating reply: ${error.message}`);
        console.error('Reply generation error:', error);
      } finally {
        // Remove loading dialog
        document.body.removeChild(loadingDialog);
      }
    } catch (error) {
      console.error('Error handling generate reply:', error);
      alert(`Error: ${error.message}`);
    }
  }
}

// Wait for Gemini service to be loaded
const checkGeminiService = () => {
  if (window.GeminiService) {
    // Initialize integration when content script loads
    const gmailIntegration = new GmailIntegration();
    gmailIntegration.init();
  } else {
    // Wait for Gemini service to be available
    setTimeout(checkGeminiService, 100);
  }
};

// Start checking
checkGeminiService();