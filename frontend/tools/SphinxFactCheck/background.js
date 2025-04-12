
// Listen for YouTube navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('youtube.com/watch')) {
    chrome.tabs.sendMessage(tabId, {
      type: 'NEW_VIDEO',
      videoId: new URL(tab.url).searchParams.get('v')
    });
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_FACT_CHECK') {
    // Here we would normally call our fact-checking API
    // For now, we'll return mock data
    sendResponse({
      credibilityScore: 85,
      factChecks: [
        {
          timestamp: "0:45",
          claim: "Economic growth statement",
          rating: "Mixed",
          sources: ["BEA", "Federal Reserve"]
        }
      ]
    });
  }
  return true;
});
