
// Wait for YouTube video player to be ready
function waitForElement(selector) {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(mutations => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}

// Initialize fact checker
async function initializeFactChecker() {
  // Wait for video player
  const videoPlayer = await waitForElement('.html5-video-player');
  
  // Create container for our overlay
  const overlayContainer = document.createElement('div');
  overlayContainer.id = 'fact-checker-overlay';
  overlayContainer.style.position = 'relative';
  overlayContainer.style.zIndex = '2000';
  
  // Insert overlay next to video player
  videoPlayer.parentElement.appendChild(overlayContainer);

  // Initialize React app in the container
  const root = document.createElement('div');
  root.id = 'fact-checker-root';
  overlayContainer.appendChild(root);

  // Load React app
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('index.js');
  script.type = 'module';
  document.body.appendChild(script);
}

// Start when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFactChecker);
} else {
  initializeFactChecker();
}
