# 📧 Atom Mind – AI-Powered Email Assistant

Atom Mind is an intelligent Chrome Extension designed for the Atom Mail platform. It leverages Google's Gemini AI to enhance email productivity by automating email composition, replies, and content refinement.

---

## 🚀 Features

### 1. ✨ Smart Compose
- Quickly compose emails using AI.
- Generates content based on user input and selected tone.

### 2. 💬 Smart Reply
- Automatically generates context-aware replies to email threads.
- Considers previous conversation content.

### 3. 🛠️ Text Refinement
- Refines selected text within emails based on user instructions.
- Easily accessible from the context menu.

### 4. ⚙️ User-friendly Popup UI
- Set your preferred writing tone.
- Securely store your Gemini API key.
- Shortcut to quickly access Atom Mail.

---

## 📂 Project Structure

```bash
atom-mind-extension/
├── .git/
├── icons/
├── popup/
│   ├── popup.css
│   ├── popup.html
│   └── popup.js
├── .gitignore
├── background.js
├── config.js
├── content.js
├── manifest.json
├── modal.js
└── README.md
```

---

## 🛠️ Installation & Setup

1. **Clone Repository**

```bash
git clone https://github.com/your-repo/atom-mind-extension.git
```

2. **Chrome Extension Installation**

- Open `chrome://extensions/`
- Enable `Developer mode`
- Click `Load unpacked` and select the cloned repository folder

3. **Setup Gemini API Key**

- Click the extension icon and open `Settings`
- Enter your Gemini API Key (obtained from Google Gemini API dashboard)

---

## 🎯 Usage

### Smart Compose
- Open Atom Mail, click `Compose`.
- Click the injected `✨ Compose with AI` button.
- Enter a prompt and select tone (formal, friendly, etc.).

### Smart Reply
- Open an email thread.
- Click the injected `💬 Reply with AI` button.
- AI generates a reply considering the conversation context.

### Text Refinement
- Select text in Atom Mail compose or reply.
- Right-click and choose `Refine text with Atom Mind` from context menu.
- Provide refinement instructions (e.g., make concise, more formal).

---

## 💻 Technical Details

### manifest.json
- Chrome extension manifest file.
- Defines permissions, content scripts, background scripts, popup UI.

### background.js
- Handles extension-level events, messaging between popup/content.
- Manages context menu actions for text refinement.

### content.js
- Injects AI buttons into Atom Mail compose and reply UI.
- Manages MutationObservers to detect compose/reply elements.
- Calls Gemini API to generate AI-based content.

### modal.js
- Provides a modal popup UI for entering AI prompts and selecting tone.
- Interfaces directly with content.js.

### popup/
- UI for extension settings:
  - Gemini API key configuration.
  - Default writing tone preference.
  - Shortcut button for opening Atom Mail.
  - Help/About page.

### config.js
- Handles secure storage/retrieval of user-configured API key and tone.
- Shared config accessed by content, background, and popup scripts.

### icons/
- Folder containing extension icons (e.g., icon.png for browser toolbar).

---



