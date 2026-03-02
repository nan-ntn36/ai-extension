// ============================================
// Grok Imagine Adapter — Site-specific logic for grok.com/imagine
// Separate page from Grok chat — dedicated image/video generation
// ============================================
// DOM inspected: 2026-03-02
// Key findings:
//   - Prompt: TipTap ProseMirror contenteditable div (class "tiptap ProseMirror")
//   - Send: button aria-label="Gửi" (circular arrow)
//   - Upload: button aria-label="Tải lên hình ảnh"
//   - Video settings: button aria-label="Cài đặt" (text "Video")
//   - File input: input[type="file"][accept="image/*"] class="hidden"
//   - Mode toggle: Hình ảnh / Video buttons in settings popup
//   - Aspect ratios: 2:3, 3:2, 1:1, 9:16, 16:9
//   - Duration: 6s, 10s
//   - Resolution: 480p, 720p
// ============================================

const GrokImagineAdapter = {
  name: 'grok-imagine',

  // ── Selectors ──
  selectors: {
    // TipTap ProseMirror editor
    chatInput: [
      'div.tiptap.ProseMirror[contenteditable="true"]',
      'div.ProseMirror[contenteditable="true"]',
      'div[contenteditable="true"]',
    ],
    sendButton: [
      'button[aria-label="Gửi"]',
      'button[aria-label="Send"]',
    ],
    uploadButton: [
      'button[aria-label="Tải lên hình ảnh"]',
      'button[aria-label="Upload image"]',
    ],
    settingsButton: [
      'button[aria-label="Cài đặt"]',
      'button[aria-label="Settings"]',
    ],
    attachButton: [
      'button[aria-label="Đính kèm"][aria-haspopup="menu"]',
      'button[aria-label="Attach"][aria-haspopup="menu"]',
      'button[aria-label="Đính kèm"]',
      'button[aria-label="Attach"]',
    ],
    fileInput: [
      'input[type="file"][accept="image/*"].hidden',
      'input[type="file"][accept="image/*"]',
    ],
  },

  // ── Find element by selector list ──
  findElement(selectorList) {
    for (const sel of selectorList) {
      try {
        const el = document.querySelector(sel);
        if (el) return el;
      } catch { /* skip */ }
    }
    return null;
  },

  // ── Find prompt input ──
  findPromptInput() {
    return this.findElement(this.selectors.chatInput);
  },

  // ── Type into TipTap editor ──
  typePrompt(text) {
    const input = this.findPromptInput();
    if (!input) return false;
    input.focus();
    // Clear
    input.innerHTML = '';
    // TipTap uses ProseMirror — execCommand works well
    document.execCommand('insertText', false, text);
    // Fallback
    if (!input.textContent.includes(text.slice(0, 20))) {
      input.innerHTML = `<p>${text}</p>`;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    return true;
  },

  // ── Click Send ──
  clickSend() {
    const btn = this.findElement(this.selectors.sendButton);
    if (!btn) return false;
    btn.click();
    return true;
  },

  // ── Upload image via hidden file input ──
  uploadImage(file) {
    // Find the hidden file input (not our extension's)
    const inputs = document.querySelectorAll('input[type="file"][accept="image/*"]');
    for (const input of inputs) {
      if (input.id?.startsWith('gbig-')) continue;
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    return false;
  },

  // ── Open settings popup ──
  openSettings() {
    const btn = this.findElement(this.selectors.settingsButton);
    if (!btn) return false;
    btn.click();
    return true;
  },

  // ── Switch to Video mode ──
  async switchToVideoMode() {
    // Open settings first
    this.openSettings();
    await new Promise(r => setTimeout(r, 500));

    // Find and click "Video" button in the popup
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      const text = btn.textContent.trim();
      // Look for the Video mode toggle (not our extension's)
      if (text === 'Video' && !btn.className.includes('gbig-')) {
        btn.click();
        return true;
      }
    }
    return false;
  },

  // ── Switch to Image mode ──
  async switchToImageMode() {
    this.openSettings();
    await new Promise(r => setTimeout(r, 500));

    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      const text = btn.textContent.trim();
      if ((text === 'Hình ảnh' || text === 'Image') && !btn.className.includes('gbig-')) {
        btn.click();
        return true;
      }
    }
    return false;
  },

  // ── Select aspect ratio in settings popup ──
  async selectAspectRatio(ratio) {
    // Settings popup should already be open
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      const text = btn.textContent.trim();
      if (text === ratio && !btn.className.includes('gbig-')) {
        btn.click();
        return true;
      }
    }
    return false;
  },

  // ── Select video duration ──
  async selectDuration(duration) {
    // duration: '6s' or '10s'
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      const text = btn.textContent.trim();
      if (text === duration && !btn.className.includes('gbig-')) {
        btn.click();
        return true;
      }
    }
    return false;
  },

  // ── Select resolution ──
  async selectResolution(resolution) {
    // resolution: '480p' or '720p'
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      const text = btn.textContent.trim();
      if (text === resolution && !btn.className.includes('gbig-')) {
        btn.click();
        return true;
      }
    }
    return false;
  },

  // ── Close settings popup (click outside or press Escape) ──
  closeSettings() {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  },

  // ── Click Attach button (opens Radix dropdown menu) ──
  clickAttach() {
    // Try specific Radix selector first
    let btn = document.querySelector('button[aria-label="Đính kèm"][aria-haspopup="menu"]') ||
      document.querySelector('button[aria-label="Attach"][aria-haspopup="menu"]');
    if (!btn) {
      btn = this.findElement(this.selectors.attachButton);
    }
    if (!btn) {
      console.error('[GBIG] Attach button not found in DOM');
      return false;
    }
    console.log('[GBIG] Found Attach button:', btn.getAttribute('aria-label'), 'state:', btn.getAttribute('data-state'));
    // Radix needs full pointer event sequence to toggle state
    btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    btn.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    btn.click();
    return true;
  },

  // ── Click "Hoạt hình hóa hình ảnh" menuitem in Radix dropdown ──
  clickAnimateImage() {
    // Menu items are DIVs with role="menuitem" inside role="menu"
    const items = document.querySelectorAll('[role="menuitem"]');
    for (const item of items) {
      const text = item.textContent.trim();
      if (text.includes('Hoạt hình hóa hình ảnh') || text.includes('Animate')) {
        item.click();
        return true;
      }
    }
    return false;
  },

  // ── Click "Chỉnh sửa hình ảnh" menuitem ──
  clickEditImage() {
    const items = document.querySelectorAll('[role="menuitem"]');
    for (const item of items) {
      const text = item.textContent.trim();
      if (text.includes('Chỉnh sửa hình ảnh') || text.includes('Edit')) {
        item.click();
        return true;
      }
    }
    return false;
  },

  // ── Full IMAGE-TO-VIDEO flow ──
  // Uses Grok's native "Hoạt hình hóa hình ảnh" feature
  async generateVideo(file, prompt, options = {}) {
    const ratio = options.ratio || '9:16';
    const duration = options.duration || '6s';
    const resolution = options.resolution || '720p';
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    // Step 1: Click Attach → open dropdown menu
    console.log('[GBIG] Step 1: clicking Attach...');
    const attachClicked = this.clickAttach();
    if (!attachClicked) {
      console.error('[GBIG] ❌ Could not find Attach button');
      return false;
    }
    console.log('[GBIG] ✅ Attach clicked, waiting for dropdown...');

    // Step 2: Wait for Radix dropdown + find "Hoạt hình hóa hình ảnh"
    // Retry up to 3 seconds (Radix animations can be slow)
    let animateClicked = false;
    for (let attempt = 0; attempt < 10; attempt++) {
      await sleep(300);
      const items = document.querySelectorAll('[role="menuitem"]');
      console.log(`[GBIG] Attempt ${attempt + 1}: found ${items.length} menuitems`);
      for (const item of items) {
        const text = item.textContent.trim();
        console.log(`[GBIG]   menuitem: "${text.slice(0, 50)}"`);
        if (text.includes('Hoạt hình') || text.includes('Animate') || text.includes('hình ảnh thành video')) {
          item.click();
          animateClicked = true;
          console.log('[GBIG] ✅ Clicked "Hoạt hình hóa hình ảnh"');
          break;
        }
      }
      if (animateClicked) break;
    }

    if (!animateClicked) {
      console.error('[GBIG] ❌ Could not find "Hoạt hình hóa hình ảnh" after 3s');
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      return false;
    }
    await sleep(800);

    // Step 4: Upload image via file input (triggered by animate option)
    if (file) {
      const uploaded = this.uploadImage(file);
      if (!uploaded) {
        console.error('[GBIG] ❌ Could not upload image');
        return false;
      }
      console.log('[GBIG] ✅ Image uploaded for animation');
      await sleep(2000); // wait for image to process
    }

    // Step 5: Enter prompt
    if (prompt) {
      const typed = this.typePrompt(prompt);
      if (!typed) {
        console.warn('[GBIG] ⚠️ Could not type prompt, may need manual input');
      }
      await sleep(500);
    }

    // Step 6: Click Send
    const sent = this.clickSend();
    if (!sent) {
      console.warn('[GBIG] ⚠️ Could not click Send, may need manual click');
      return false;
    }

    console.log('[GBIG] ✅ Video generation started on Grok Imagine');
    return true;
  },

  // ── Prompts ──
  buildVideoPrompt(actionPrompt, ratio) {
    return `${actionPrompt}. Maintain exact character appearance from the uploaded image. Smooth cinematic motion, professional videography.`;
  },

  buildFrameToVideoPrompt(actionPrompt) {
    return this.buildVideoPrompt(actionPrompt);
  },

  // Grok Imagine — outfit swap prompts
  buildOutfitSwapPrompt(ratio) {
    return `Look at the two images I uploaded. Image 1 is the REAL person. Image 2 shows the outfit.

TASK: Put the outfit from Image 2 onto the REAL person in Image 1.

CRITICAL RULES:
1. The person in the result MUST be the EXACT SAME REAL person from Image 1 — NOT a new person, NOT a recreation, NOT an idealized version. Use their ACTUAL face, ACTUAL body, ACTUAL skin, ACTUAL hair exactly as they appear in the photo.
2. Preserve ALL natural features of the real person — including skin texture, moles, wrinkles, asymmetries, blemishes. Do NOT beautify, smooth, or idealize.
3. The outfit must match Image 2 exactly — same design, color, pattern, fabric, fit.
4. The result should look like a real photograph of THIS specific real person wearing that outfit.
5. Show full body from head to shoes.

Aspect ratio ${ratio || '3:4'}. Generate 1 image.`;
  },

  buildOutfitSwapRetryPrompt(ratio) {
    return `The previous result was WRONG — the person does not look like the REAL person from Image 1. Try again:

- The person MUST be the EXACT same real person from Image 1 — same real face, real skin, real body. NOT a new AI-generated person.
- Preserve natural imperfections — do NOT beautify or smooth the skin
- The outfit must match Image 2 exactly
- Full body head to shoes
- Aspect ratio ${ratio || '3:4'}. Generate 1 image.`;
  },

  // Stubs — not needed for Grok Imagine
  buildSetupPrompt() { return ''; },
  softenLevels() { return []; },
  buildIdentityRef() { return ''; },
};

// Export for content.js
if (typeof window !== 'undefined') {
  window.GBIG_ADAPTERS = window.GBIG_ADAPTERS || {};
  window.GBIG_ADAPTERS['grok-imagine'] = GrokImagineAdapter;
}
