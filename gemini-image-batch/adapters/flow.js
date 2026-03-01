// ============================================
// Flow Adapter — Site-specific logic for labs.google/flow (Veo 3)
// User handles login + project creation manually.
// Extension automates: prompt entry, image upload, video generation.
// ============================================
// DOM inspected: 2026-03-01
// Key findings:
//   - Prompt: contenteditable DIV with role="textbox" (no aria-label)
//   - Create btn: button text "arrow_forwardCreate" (no aria-label, no data-testid)
//   - File input: input[type="file"][accept="image/*"] (always present in DOM)
//   - Add Media btn: button text "addAdd Media"
//   - Flow uses styled-components → class names are hashed, unreliable
//   - Best strategy: role/attribute selectors first, text-match fallback
// ============================================

const FlowAdapter = {
  name: 'flow',

  // ── Selectors (ordered: most stable → least stable) ──
  selectors: {
    // Prompt input — contenteditable div with role="textbox"
    chatInput: [
      'div[role="textbox"][contenteditable="true"]',
      '[role="textbox"]',
      'div[contenteditable="true"]',
    ],
    // Create/Generate button — no aria-label, find by text content
    // Use findButtonByText() helper below for reliable matching
    sendButton: [],  // empty — use findCreateButton() instead
    // File input for image upload (always in DOM, hidden)
    uploadInput: [
      'input[type="file"][accept="image/*"]',
      'input[type="file"]',
    ],
    // "Add Media" button — triggers file picker dialog
    uploadButton: [],  // empty — use findButtonByText('Add Media') instead
    // Where generated video appears
    responseContainer: [
      'video',
      'video source',
    ],
  },

  // ── Button text patterns (Flow has no aria-labels on buttons) ──
  // Text from DOM includes Material Icon ligature prefix, e.g. "arrow_forwardCreate"
  buttonText: {
    create: ['Create', 'arrow_forwardCreate'],
    addMedia: ['Add Media', 'addAdd Media'],
    scenebuilder: ['Scenebuilder', 'play_moviesScenebuilder'],
    swapFrames: ['Swap first and last frames', 'swap_horizSwap first and last frames'],
  },

  // ── Find button by text content (most reliable for Flow) ──
  findButtonByText(textPatterns) {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      const btnText = btn.textContent.trim();
      for (const pattern of textPatterns) {
        if (btnText === pattern || btnText.includes(pattern)) {
          return btn;
        }
      }
    }
    return null;
  },

  // ── Shortcut: Find the Create/Generate button ──
  findCreateButton() {
    return this.findButtonByText(this.buttonText.create);
  },

  // ── Shortcut: Find the Add Media button ──
  findAddMediaButton() {
    return this.findButtonByText(this.buttonText.addMedia);
  },

  // ── Find element by trying selector list ──
  findElement(selectorList) {
    for (const sel of selectorList) {
      try {
        const el = document.querySelector(sel);
        if (el) return el;
      } catch { /* invalid selector, skip */ }
    }
    return null;
  },

  // ── Get the prompt input ──
  findPromptInput() {
    return this.findElement(this.selectors.chatInput);
  },

  // ── Get the file input for image upload ──
  findFileInput() {
    const inputs = document.querySelectorAll('input[type="file"]');
    for (const input of inputs) {
      // Skip our own extension inputs
      if (input.id?.startsWith('gbig-')) continue;
      return input;
    }
    return null;
  },

  // ── Type into the prompt (contenteditable div) ──
  typePrompt(text) {
    const input = this.findPromptInput();
    if (!input) return false;
    input.focus();
    // Clear existing content
    input.textContent = '';
    // Use execCommand for contenteditable to trigger React/Lit state updates
    document.execCommand('insertText', false, text);
    // Fallback: direct set + dispatch events
    if (!input.textContent.includes(text.slice(0, 20))) {
      input.textContent = text;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
    return true;
  },

  // ── Upload image file via hidden file input ──
  uploadImage(file) {
    const fileInput = this.findFileInput();
    if (!fileInput) return false;
    const dt = new DataTransfer();
    dt.items.add(file);
    fileInput.files = dt.files;
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  },

  // ── Click Create button ──
  clickCreate() {
    const btn = this.findCreateButton();
    if (!btn) return false;
    btn.click();
    return true;
  },

  // ── Flow-specific: Frames to Video prompt ──
  buildFrameToVideoPrompt(actionPrompt) {
    return `${actionPrompt}. Cinematic quality, smooth natural motion, professional videography. Maintain exact character appearance from the uploaded frame. 8 seconds.`;
  },

  buildVideoPrompt(actionPrompt, ratio) {
    return this.buildFrameToVideoPrompt(actionPrompt);
  },

  // ── Flow doesn't need these — it's video-only ──
  buildSetupPrompt() { return ''; },
  buildOutfitSwapPrompt() { return ''; },
  buildOutfitSwapRetryPrompt() { return ''; },
  softenLevels() { return []; },
  buildIdentityRef() { return ''; },
};

// Export for content.js
if (typeof window !== 'undefined') {
  window.GBIG_ADAPTERS = window.GBIG_ADAPTERS || {};
  window.GBIG_ADAPTERS.flow = FlowAdapter;
}
