const leftPupil = document.getElementById('leftPupil');
const rightPupil = document.getElementById('rightPupil');
const logoSVG = document.getElementById('logoSVG');
const toggleBtn = document.getElementById("toggleBtn");

// Max offset for pupil movement in pixels
const maxOffset = 5;

// Move pupils on mousemove over the SVG
logoSVG.addEventListener('mousemove', (e) => {
  const rect = logoSVG.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // Helper to move a pupil around a given eye center
  function movePupil(eyeCenterX, eyeCenterY, pupil) {
    let dx = mouseX - eyeCenterX;
    let dy = mouseY - eyeCenterY;
    const distance = Math.hypot(dx, dy);
    if (distance > maxOffset) {
      dx = (dx / distance) * maxOffset;
      dy = (dy / distance) * maxOffset;
    }
    pupil.setAttribute('cx', eyeCenterX + dx);
    pupil.setAttribute('cy', eyeCenterY + dy);
  }

  // Left eye center at (75, 60), right eye center at (105, 60)
  movePupil(75, 60, leftPupil);
  movePupil(105, 60, rightPupil);
});

// Reset pupils when mouse leaves the SVG
logoSVG.addEventListener('mouseleave', () => {
  leftPupil.setAttribute('cx', 75);
  leftPupil.setAttribute('cy', 60);
  rightPupil.setAttribute('cx', 105);
  rightPupil.setAttribute('cy', 60);
});

// Toggle button logic
chrome.storage.sync.get("enabled", (data) => {
  const isEnabled = data.enabled !== undefined ? data.enabled : true;
  toggleBtn.innerText = isEnabled ? "🟢 Extension is ON" : "🔴 Extension is OFF";
});

toggleBtn.addEventListener("click", () => {
  chrome.storage.sync.get("enabled", (data) => {
    const wasEnabled = data.enabled !== undefined ? data.enabled : true;
    const isEnabled = !wasEnabled;
    chrome.storage.sync.set({ enabled: isEnabled }, () => {
      toggleBtn.innerText = isEnabled ? "🟢 Extension is ON" : "🔴 Extension is OFF";
    });
  });
});
