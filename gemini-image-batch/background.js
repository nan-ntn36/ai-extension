// ============================================
// AI Batch Image Generator — Background Service Worker
// Handles: image downloads, auto-save, messaging
// ============================================

let downloadCounter = 0;
let lastDownloadTime = 0;
const DEBOUNCE_MS = 500;

// Listen for download requests from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'DOWNLOAD_IMAGE') {
    handleDownloadImage(message, sendResponse);
    return true; // keep channel open for async response
  }
  if (message.type === 'DOWNLOAD_BATCH') {
    handleBatchDownload(message, sendResponse);
    return true;
  }
  if (message.type === 'RESET_COUNTER') {
    downloadCounter = 0;
    sendResponse({ ok: true });
    return true;
  }
});

async function handleDownloadImage(message, sendResponse) {
  const now = Date.now();
  // Debounce — avoid spam downloads
  if (now - lastDownloadTime < DEBOUNCE_MS) {
    await new Promise(r => setTimeout(r, DEBOUNCE_MS));
  }
  lastDownloadTime = Date.now();

  downloadCounter++;
  const { url, prefix, filename } = message;

  // Build filename: prefix/image_001.jpg
  const paddedNum = String(downloadCounter).padStart(3, '0');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const ext = guessExtension(url);
  const finalFilename = filename 
    || `${prefix || 'AI_Generated'}/${timestamp}_${paddedNum}${ext}`;

  try {
    const downloadId = await chrome.downloads.download({
      url: url,
      filename: finalFilename,
      saveAs: false,
    });
    console.log(`[GBIG BG] ✅ Downloaded: ${finalFilename} (ID: ${downloadId})`);
    sendResponse({ ok: true, downloadId, filename: finalFilename });
  } catch (err) {
    console.error('[GBIG BG] ❌ Download failed:', err);
    sendResponse({ ok: false, error: err.message });
  }
}

async function handleBatchDownload(message, sendResponse) {
  const { urls, prefix } = message;
  const results = [];
  for (const url of urls) {
    downloadCounter++;
    const paddedNum = String(downloadCounter).padStart(3, '0');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const ext = guessExtension(url);
    const finalFilename = `${prefix || 'AI_Generated'}/${timestamp}_${paddedNum}${ext}`;

    try {
      const downloadId = await chrome.downloads.download({
        url: url,
        filename: finalFilename,
        saveAs: false,
      });
      results.push({ ok: true, downloadId, filename: finalFilename });
      // Debounce between batch items
      await new Promise(r => setTimeout(r, DEBOUNCE_MS));
    } catch (err) {
      results.push({ ok: false, error: err.message });
    }
  }
  sendResponse({ results });
}

function guessExtension(url) {
  if (!url) return '.png';
  if (url.includes('.jpg') || url.includes('.jpeg')) return '.jpg';
  if (url.includes('.webp')) return '.webp';
  if (url.includes('.gif')) return '.gif';
  if (url.includes('.svg')) return '.svg';
  return '.png';
}
