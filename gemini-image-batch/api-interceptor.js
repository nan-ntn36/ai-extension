// ============================================
// Gemini Batch Image Generator - API Interceptor v4
// Runs in MAIN world — lightweight response listener
// Only detects when Gemini finishes responding + extracts images
// Does NOT modify any requests or consume response bodies
// ============================================

(function () {
  'use strict';

  const originalFetch = window.fetch;

  // ── Gemini API detection ──
  function isGeminiApiCall(url) {
    if (!url || typeof url !== 'string') return false;
    return (
      url.includes('StreamGenerate') ||
      url.includes('BardFrontendService') ||
      url.includes('GenerateContent') ||
      url.includes('_/BardChatUi/data')
    );
  }

  // ── Extract images from API response text ──
  function extractImagesFromResponse(text) {
    const images = new Set();

    const patterns = [
      /https:\/\/lh3\.googleusercontent\.com\/[^\s"'\]\\)]+/gi,
      /https:\/\/(?:encrypted-)?tbn\d*\.gstatic\.com\/[^\s"'\]\\)]+/gi,
      /https:\/\/[^\s"'\]\\)]*?imageproxy[^\s"'\]\\)]+/gi,
      /https:\/\/ai\.google\.dev\/[^\s"'\]\\)]+/gi,
    ];
    patterns.forEach(pat => {
      (text.match(pat) || []).forEach(u => {
        u = u.replace(/\\u003d/g, '=').replace(/\\u0026/g, '&').replace(/\\\//g, '/').replace(/\\"/g, '');
        if (u.length > 60) images.add(u);
      });
    });

    (text.match(/data:image\/[a-z]+;base64,[A-Za-z0-9+\/=]{200,}/g) || []).forEach(b => images.add(b));

    return [...images];
  }

  // ══════════════════════════════════════════
  // Hook window.fetch — LIGHTWEIGHT
  // ONLY intercepts Gemini API calls
  // All other URLs go through originalFetch directly (no wrapping)
  // ══════════════════════════════════════════
  window.fetch = function (...args) {
    let url = '';
    try {
      if (args[0] instanceof Request) {
        url = args[0].url;
      } else {
        url = String(args[0] || '');
      }
    } catch (e) {
      return originalFetch.apply(this, args);
    }

    // NOT a Gemini API call → use originalFetch DIRECTLY (not wrapped!)
    // This avoids CSP errors showing our file as the source
    if (!isGeminiApiCall(url)) {
      return originalFetch.apply(this, args);
    }

    // Gemini API call → pass through but listen to response
    return originalFetch.apply(this, args).then(response => {
      try {
        const clone = response.clone();
        clone.text().then(text => {
          if (text && text.length > 100) {
            const images = extractImagesFromResponse(text);
            window.postMessage({
              type: 'GBIG_RESPONSE_COMPLETE',
              images,
            }, '*');
          }
        }).catch(() => {});
      } catch (e) {}

      return response;
    }).catch(err => {
      // Re-throw the error so Gemini's own error handling works
      throw err;
    });
  };

  console.log('[GBIG] ✅ API Interceptor v4 loaded (lightweight)');
})();
