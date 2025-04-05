console.log("🔧 Background service worker running");

// Prevent multiple context menu creations
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "refine_root",
      title: "Refine with AI",
      contexts: ["selection"]
    });

    chrome.contextMenus.create({
      id: "refine_grammar",
      parentId: "refine_root",
      title: "Fix grammar",
      contexts: ["selection"]
    });

    chrome.contextMenus.create({
      id: "refine_concise",
      parentId: "refine_root",
      title: "Make more concise",
      contexts: ["selection"]
    });

    chrome.contextMenus.create({
      id: "refine_friendly",
      parentId: "refine_root",
      title: "Make more friendly",
      contexts: ["selection"]
    });
  });
});

// Prevent duplicate triggering
let lastClickedTime = 0;

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const now = Date.now();
  if (now - lastClickedTime < 500) {
    console.log("⏳ Ignored duplicate click");
    return;
  }
  lastClickedTime = now;

  const instructionMap = {
    refine_grammar: "Fix grammar",
    refine_concise: "Make more concise",
    refine_friendly: "Make more friendly"
  };

  const instruction = instructionMap[info.menuItemId];
  if (instruction && info.selectionText) {
    chrome.tabs.sendMessage(
      tab.id,
      {
        action: "REFINE_TEXT",
        text: info.selectionText,
        instruction: instruction
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.warn("⚠️ Could not connect to content script:", chrome.runtime.lastError.message);
        } else {
          console.log("✅ Message sent to content script");
        }
      }
    );
  }
});
