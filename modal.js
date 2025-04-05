function createComposeModal(onSubmit) {
  // Remove existing modal if already added
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
