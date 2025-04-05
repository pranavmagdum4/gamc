// Function to inject the AI Compose button into the compose box
function injectAIComposeButton(composeBox) {
  const parent = composeBox.closest('div'); // scope to parent of composeBox
  if (!parent || parent.querySelector('#atom-ai-compose-btn')) return; // check only within this scope

  const btn = document.createElement('button');
  btn.id = 'atom-ai-compose-btn';
  btn.innerText = '✨ Compose with AI';
  btn.style.margin = '10px';
  btn.style.padding = '6px 12px';
  btn.style.backgroundColor = '#4f46e5';
  btn.style.color = 'white';
  btn.style.border = 'none';
  btn.style.borderRadius = '6px';
  btn.style.cursor = 'pointer';
  btn.style.zIndex = '9999';

  btn.addEventListener('click', () => {
      createComposeModal(async ({ prompt, tone }) => {
          console.log("🧠 Sending to Gemini:", prompt, "Tone:", tone);
          const aiDraft = await generateWithGemini(prompt, tone);
          console.log("📩 AI Draft Received:", aiDraft);

          const newComposeBox = document.querySelector('div[aria-label="Message Body"][role="textbox"]');
          if (newComposeBox) {
              newComposeBox.innerText = aiDraft;
          } else {
              console.warn("⚠ Could not find compose box to insert AI draft.");
          }
      });
  });

  parent.insertBefore(btn, composeBox);
  console.log("✅ AI Compose button injected");
}

// Observer for detecting the compose box
function observeForComposeBox() {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      const composeBox = document.querySelector('div[aria-label="Message Body"][role="textbox"]');
      if (composeBox) {
        console.log("✅ Compose box detected by observer");
        injectAIComposeButton(composeBox);
        observer.disconnect(); // Stop observing once found
        break;
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  console.log("👀 MutationObserver set up to watch for compose box...");
}

function observeForReplyBox() {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      const replyBox = document.querySelector('div[aria-label="Message Body"][role="textbox"]');
      if (replyBox && !document.getElementById('atom-ai-reply-btn')) {
        console.log("💬 Reply box detected by observer");
        injectAIReplyButton(replyBox);
        break;
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  console.log("👀 MutationObserver set up for reply box...");
}

// Function to call Gemini API for AI draft generation
async function generateWithGemini(prompt, tone) {
  const apiKey = window.CONFIG.GEMINI_API_KEY;
  const fullPrompt = `Write a ${tone} email about: ${prompt}`;

  const body = {
    contents: [
      {
        parts: [{ text: fullPrompt }],
      },
    ],
  };

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const result = await response.json();
    console.log("Gemini API result:", result);

    return result.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ Gemini failed to respond.";
  } catch (err) {
    console.error("Gemini error:", err);
    return "⚠️ Gemini failed to respond (network or key error).";
  }
}

function injectAIReplyButton(replyBox) {
  // Avoid duplicate
  if (document.getElementById('atom-ai-reply-btn')) return;

  // Create Reply with AI button
  const btn = document.createElement('button');
  btn.id = 'atom-ai-reply-btn';
  btn.innerText = '💬 Reply with AI';
  btn.style.margin = '10px 0';
  btn.style.padding = '6px 12px';
  btn.style.backgroundColor = '#10b981';
  btn.style.color = 'white';
  btn.style.border = 'none';
  btn.style.borderRadius = '6px';
  btn.style.cursor = 'pointer';
  btn.style.zIndex = '9999';

  btn.addEventListener('click', () => {
    createComposeModal(async ({ prompt, tone }) => {
      console.log("📨 Generating AI reply...");

      const threadText = getVisibleThreadText(); // Next step
      const fullPrompt = 'Reply to the following conversation in a ${tone} tone:\n\n${threadText}\n\nInclude this input if relevant: ${prompt}';

      const aiDraft = await generateWithGemini(fullPrompt, tone);
      replyBox.innerText = aiDraft;
      console.log("✅ AI reply inserted");
    });
  });

  // ⛓ Inject button into stable container above replyBox
  const stableContainer = replyBox.closest('div[role="textbox"]').parentElement?.parentElement;

  if (stableContainer) {
    stableContainer.insertBefore(btn, stableContainer.firstChild);
    console.log("✅ AI Reply button safely injected");
  } else {
    console.warn("⚠ Could not find stable container for AI reply button.");
  }
}

function getVisibleThreadText() {
  const messages = document.querySelectorAll('div.adn');

  let threadText = "";

  messages.forEach((msg) => {
    try {
      const senderElement = msg.querySelector('.gD'); // sender name
      const bodyElement = msg.querySelector('.a3s');  // message body

      const sender = senderElement ? senderElement.innerText.trim() : "Unknown Sender";
      const body = bodyElement ? bodyElement.innerText.trim() : "";

      if (body.length > 0) {
        threadText += 'From: ${sender}\n${body}\n\n------------------\n\n';
      }
    } catch (err) {
      console.warn("⚠ Failed to parse one message:", err);
    }
  });

  return threadText || "No previous messages found.";
}


// Function to call Gemini API for text refinement based on an instruction
async function generateWithGeminiPrompt(input, instruction) {
  const apiKey = window.CONFIG.GEMINI_API_KEY;
  const fullPrompt = `
You are a helpful writing assistant. Rewrite the following text with the instruction: "${instruction}". 
Only return the improved version. Do not add explanations or multiple options.

Text: "${input}"
`;

  const body = {
    contents: [{ parts: [{ text: fullPrompt }] }],
  };

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || input;
  } catch (err) {
    console.error("Gemini API Error:", err);
    return input;
  }
}

// Function to replace the currently selected text with new text
function replaceSelectedText(newText) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  range.deleteContents();
  range.insertNode(document.createTextNode(newText));
}

// Start observing for the compose box on page load
observeForComposeBox();
observeForReplyBox();

console.log("✅ Content script loaded");

// Listen for messages from the background script for text refinement
chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  if (msg.action === "REFINE_TEXT" && msg.text && msg.instruction) {
    console.log("📩 Refining:", msg.text, "| Instruction:", msg.instruction);

    const refined = await generateWithGeminiPrompt(msg.text, msg.instruction);
    replaceSelectedText(refined);
  }
});
