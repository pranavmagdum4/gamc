// Gemini API Service for Atom Mind

class GeminiService {
    constructor(apiKey) {
      this.apiKey = apiKey;
      this.apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    }
  
    // Initialize the service with API key
    static async initialize() {
      return new Promise((resolve, reject) => {
        chrome.storage.local.get(['geminiApiKey'], (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
            return;
          }
          
          const service = new GeminiService(result.geminiApiKey || '');
          resolve(service);
        });
      });
    }
  
    // Set API key
    setApiKey(apiKey) {
      this.apiKey = apiKey;
      return chrome.storage.local.set({ geminiApiKey: apiKey });
    }
  
    // Check if API key is set
    hasApiKey() {
      return !!this.apiKey;
    }
  
    // Make a request to Gemini API
    async generateContent(prompt) {
      if (!this.hasApiKey()) {
        throw new Error('Gemini API key not set');
      }
  
      const url = `${this.apiEndpoint}?key=${this.apiKey}`;
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
        }
  
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
      } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw error;
      }
    }
  
    // Generate draft email
    async generateEmailDraft(context) {
      const prompt = `
        Write a professional email based on the following information:
        
        Topic: ${context.topic || 'N/A'}
        To: ${context.recipient || 'N/A'}
        Purpose: ${context.purpose || 'N/A'}
        Key points: ${context.keyPoints || 'N/A'}
        Tone: ${context.tone || 'Professional'}
        
        Write a complete, well-structured email with a subject line, greeting, body, and closing.
        Format the email properly as it will be inserted directly into an email client.
      `;
      
      return this.generateContent(prompt);
    }
  
    // Improve existing email
    async improveEmail(emailContent, improvements = ['grammar', 'clarity', 'tone']) {
      const prompt = `
        Improve the following email:
        
        "${emailContent}"
        
        Focus on improving: ${improvements.join(', ')}
        
        Keep the same information and intent but make the email more professional, clear, and effective.
        Return only the improved email text without any explanation or additional commentary.
      `;
      
      return this.generateContent(prompt);
    }
  
    // Generate email reply
    async generateReply(emailContent, replyType) {
      let prompt;
      
      switch (replyType) {
        case 'Quick Acknowledge':
          prompt = `
            Write a brief, professional acknowledgment reply to the following email:
            
            "${emailContent}"
            
            Keep it concise but polite and professional. Include a thank you and any appropriate next steps.
            Return only the reply text.
          `;
          break;
          
        case 'Detailed Response':
          prompt = `
            Write a detailed, thorough response to the following email:
            
            "${emailContent}"
            
            Address all points raised in the original email. Be professional, helpful, and comprehensive.
            Include appropriate next steps or questions where relevant.
            Return only the reply text.
          `;
          break;
          
        case 'Ask for Clarification':
          prompt = `
            Write a professional reply asking for clarification to the following email:
            
            "${emailContent}"
            
            Identify aspects that need clarification and ask specific, helpful questions.
            Be polite and professional. Express willingness to help once clarification is received.
            Return only the reply text.
          `;
          break;
          
        default:
          prompt = `
            Write a professional reply to the following email:
            
            "${emailContent}"
            
            Be polite, helpful, and professional. Address the key points in the original email.
            Return only the reply text.
          `;
      }
      
      return this.generateContent(prompt);
    }
  
    // Optimize subject line
    async optimizeSubject(subject, emailContent) {
      const prompt = `
        Improve the following email subject line to be more engaging, specific, and effective:
        
        Original subject: "${subject}"
        
        Email content: "${emailContent}"
        
        Return ONLY the improved subject line, with no additional explanation or text.
      `;
      
      return this.generateContent(prompt);
    }
  }
  
  // Export the service
  window.GeminiService = GeminiService;