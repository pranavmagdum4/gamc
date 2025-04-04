// console.log("✅ Atom Mind Extension injected into the page");
// console.log("🚀 Atom Mind Extension: Content script loaded");

// modal.js
function createComposeModal(onSubmit) {
    // Remove if already added
    const existing = document.getElementById("atom-mind-modal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "atom-mind-modal";
    modal.style = `
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
    `;

    const card = document.createElement("div");
    card.style = `
      background: white;
      padding: 20px;
      border-radius: 12px;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      font-family: sans-serif;
    `;

    card.innerHTML = `
      <h2 style="margin-bottom: 10px;">🧠 Compose with AI</h2>
      <textarea id="aiPrompt" rows="4" placeholder="What do you want to say?" style="width: 100%; padding: 8px; margin-bottom: 12px;"></textarea>
      <label for="tone">Tone:</label>
      <select id="aiTone" style="width: 100%; padding: 6px; margin-bottom: 12px;">
        <option value="formal">Formal</option>
        <option value="friendly">Friendly</option>
        <option value="concise">Concise</option>
        <option value="technical">Technical</option>
      </select>
      <div style="display: flex; justify-content: flex-end; gap: 8px;">
        <button id="cancelBtn">Cancel</button>
        <button id="generateBtn" style="background:#4f46e5; color:white; border:none; padding:6px 12px; border-radius:6px;">Generate</button>
      </div>
    `;

    modal.appendChild(card);
    document.body.appendChild(modal);

    document.getElementById("cancelBtn").onclick = () => modal.remove();
    document.getElementById("generateBtn").onclick = () => {
        const prompt = document.getElementById("aiPrompt").value.trim();
        const tone = document.getElementById("aiTone").value;
        if (prompt) {
            modal.remove();
            onSubmit({ prompt, tone });
        }
    };
}


function injectAIComposeButton(composeBox) {
    if (document.getElementById('atom-ai-compose-btn')) return;

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
                observer.disconnect(); // stop once we find it
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

function replaceSelectedText(newText) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  range.deleteContents();
  range.insertNode(document.createTextNode(newText));
}




// yash