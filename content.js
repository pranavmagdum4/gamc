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

    // btn.addEventListener('click', () => {
    //   alert("🧠 AI Compose clicked!");
    // });
    btn.addEventListener('click', () => {
        createComposeModal(async ({ prompt, tone }) => {
            console.log("🧠 Sending to Gemini:", prompt, "Tone:", tone);

            // Call Gemini API
            const aiDraft = await generateWithGemini(prompt, tone);
            console.log("📩 AI Draft Received:", aiDraft);

            // Insert into Gmail compose box
            const composeBox = document.querySelector('div[aria-label="Message Body"][role="textbox"]');
            if (composeBox) {
                composeBox.innerText = aiDraft;
                console.log("✅ Draft inserted into Gmail");
            } else {
                console.warn("⚠️ Could not find compose box to insert AI draft.");
            }
        });
    });


    // Insert the button before the compose box
    composeBox.parentNode.insertBefore(btn, composeBox);
    console.log("✅ AI Compose button injected");
}

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

async function generateWithGemini(prompt, tone) {
    const apiKey = "AIzaSyC-e3RXDhoKx-3-TRkdYE7ELnxfwf00zUs";
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
        // "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + apiKey,
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key="+ apiKey,
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
  


// Run observer on page load
observeForComposeBox();

console.log("✅ Content script loaded");

chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  if (msg.action === "REFINE_TEXT" && msg.text && msg.instruction) {
    console.log("📩 Refining:", msg.text, "| Instruction:", msg.instruction);

    const refined = await generateWithGeminiPrompt(msg.text, msg.instruction);
    replaceSelectedText(refined);
  }
});

async function generateWithGeminiPrompt(input, instruction) {
  const apiKey = "AIzaSyC-e3RXDhoKx-3-TRkdYE7ELnxfwf00zUs";
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
