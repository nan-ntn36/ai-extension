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
    create: ['arrow_forwardCreate'],  // Main Create button (not the add_2 one)
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

  // ── Find the main Create/Generate button (has arrow_forward icon) ──
  findCreateButton() {
    const buttons = document.querySelectorAll('button');

    // Strategy 1: Find button with <i> icon text "arrow_forward" (most reliable)
    for (const btn of buttons) {
      if (btn.hasAttribute('aria-haspopup')) continue; // skip add_2 button
      const icon = btn.querySelector('i, .google-symbols');
      const iconText = icon?.textContent?.trim() || '';
      if (iconText === 'arrow_forward') {
        console.log('[GBIG] Found Create button via arrow_forward icon');
        return btn;
      }
    }

    // Strategy 2: textContent includes both "arrow_forward" and "Create"
    for (const btn of buttons) {
      if (btn.hasAttribute('aria-haspopup')) continue;
      const text = btn.textContent.trim();
      if (text.includes('arrow_forward') && text.includes('Create')) {
        console.log('[GBIG] Found Create button via text match');
        return btn;
      }
    }

    // Strategy 3: Hidden span with "Create" text, no aria-haspopup
    for (const btn of buttons) {
      if (btn.hasAttribute('aria-haspopup')) continue;
      const spans = btn.querySelectorAll('span');
      for (const span of spans) {
        if (span.textContent.trim() === 'Create') {
          console.log('[GBIG] Found Create button via hidden span');
          return btn;
        }
      }
    }

    // Strategy 4: Any button with "Create" or "Generate" text, no aria-haspopup
    for (const btn of buttons) {
      if (btn.hasAttribute('aria-haspopup')) continue;
      const text = btn.textContent.trim();
      if (text.includes('Create') || text.includes('Generate')) {
        console.log('[GBIG] Found Create button via fallback text');
        return btn;
      }
    }

    console.warn('[GBIG] ⚠️ Create button not found');
    return null;
  },

  // ── Find the "Add Frame" button (add_2 icon, opens popup dialog) ──
  findAddFrameButton() {
    // This button has: aria-haspopup="dialog", icon "add_2", hidden text "Create"
    const buttons = document.querySelectorAll('button[aria-haspopup="dialog"]');
    for (const btn of buttons) {
      const text = btn.textContent.trim();
      const icon = btn.querySelector('i, .google-symbols');
      const iconText = icon?.textContent?.trim() || '';
      if (iconText === 'add_2' || text.includes('add_2')) return btn;
    }
    // Fallback: find by icon content only
    const allBtns = document.querySelectorAll('button');
    for (const btn of allBtns) {
      const icon = btn.querySelector('i, .google-symbols');
      if (icon?.textContent?.trim() === 'add_2') return btn;
    }
    return null;
  },

  // ── Click the "Add Frame" button (opens popup with asset list) ──
  clickAddFrameButton() {
    const btn = this.findAddFrameButton();
    if (!btn) return false;
    btn.click();
    return true;
  },

  // ── Shortcut: Find the Add Media button ──
  findAddMediaButton() {
    return this.findButtonByText(this.buttonText.addMedia);
  },

  // ── Upload a single file to Flow's assets ──
  uploadToAssets(file) {
    return this.uploadImage(file);
  },

  // ── Click "Add Media" button (opens asset upload panel) ──
  clickAddMediaButton() {
    const btn = this.findAddMediaButton();
    if (!btn) return false;
    btn.click();
    return true;
  },

  // ── Find the popup that opened after clicking add_2 button ──
  findOpenPopup() {
    const addBtn = this.findAddFrameButton();

    // Strategy 1: Use aria-controls to find popup by ID (CONFIRMED WORKING)
    if (addBtn) {
      const popupId = addBtn.getAttribute('aria-controls');
      if (popupId) {
        const popup = document.getElementById(popupId);
        if (popup) {
          console.log(`[GBIG] Found popup via aria-controls id="${popupId}"`);
          return popup;
        }
      }
    }

    // Strategy 2: Radix popper content wrapper
    const radixPopper = document.querySelector('[data-radix-popper-content-wrapper]');
    if (radixPopper) {
      // The actual dialog is inside the popper
      const dialog = radixPopper.querySelector('[role="dialog"]');
      if (dialog) return dialog;
      return radixPopper;
    }

    // Strategy 3: role="dialog" with data-state="open"
    const dialog = document.querySelector('[role="dialog"][data-state="open"]');
    if (dialog) return dialog;

    return null;
  },

  // ── Get asset items from the popup (virtuoso list) ──
  getPopupAssetItems(popup) {
    if (!popup) return [];
    // Flow uses Virtuoso virtualized list — items have data-item-index attribute
    const items = popup.querySelectorAll('[data-item-index]');
    if (items.length > 0) {
      console.log(`[GBIG] Found ${items.length} asset items via [data-item-index]`);
      return Array.from(items);
    }
    // Fallback: look for the item container class
    const rows = popup.querySelectorAll('[class*="jUfWAo"], [class*="dbfb6b4a-11"]');
    if (rows.length > 0) {
      console.log(`[GBIG] Found ${rows.length} asset items via class`);
      return Array.from(rows);
    }
    return [];
  },

  // ── Select an asset by index: click add_2 → find popup → click item ──
  async selectAssetByIndex(assetIndex, sleepFn) {
    const sleep = sleepFn || (ms => new Promise(r => setTimeout(r, ms)));

    // Step 1: Click the add_2 button to open popup
    const addBtn = this.findAddFrameButton();
    if (!addBtn) {
      console.warn('[GBIG] ⚠️ add_2 button not found');
      return false;
    }
    addBtn.click();
    console.log('[GBIG] ✅ Clicked add_2 button');

    // Step 2: Wait for popup to render
    await sleep(1500);

    // Step 3: Find the popup
    const popup = this.findOpenPopup();
    if (!popup) {
      console.warn('[GBIG] ⚠️ Popup not found');
      return false;
    }

    // Step 4: Get items from the virtuoso list
    const items = this.getPopupAssetItems(popup);
    console.log(`[GBIG] Popup has ${items.length} items, want index ${assetIndex}`);

    if (items.length === 0) {
      console.warn('[GBIG] ⚠️ No items found in popup');
      return false;
    }

    // Step 5: Click the item at the desired index
    const targetIdx = Math.min(assetIndex, items.length - 1);
    const item = items[targetIdx];

    // Click the item's inner div (the row container) or the item itself
    const innerDiv = item.querySelector('div') || item;
    innerDiv.click();
    console.log(`[GBIG] ✅ Clicked asset item at index ${targetIdx}`);

    await sleep(500);
    return true;
  },

  // Keep selectAssetByName as alias (tries name match in text, falls back to index)
  async selectAssetByName(imageName, sleepFn, assetIndex) {
    const sleep = sleepFn || (ms => new Promise(r => setTimeout(r, ms)));

    // Step 1: Click add_2 button
    const addBtn = this.findAddFrameButton();
    if (!addBtn) {
      console.warn('[GBIG] ⚠️ add_2 button not found');
      return false;
    }
    addBtn.click();
    console.log('[GBIG] ✅ Clicked add_2 button');

    await sleep(1500);

    // Step 2: Find popup
    const popup = this.findOpenPopup();
    if (!popup) {
      console.warn('[GBIG] ⚠️ Popup not found');
      return false;
    }

    // Step 3: Get items
    const items = this.getPopupAssetItems(popup);
    console.log(`[GBIG] Popup has ${items.length} items`);

    if (items.length === 0) {
      console.warn('[GBIG] ⚠️ No items in popup');
      return false;
    }

    // Step 4: Try to find by name (search text content of each item)
    const baseName = imageName.replace(/\.[^.]+$/, '');
    let foundItem = null;
    for (const item of items) {
      const text = item.textContent?.trim() || '';
      const imgs = item.querySelectorAll('img');
      for (const img of imgs) {
        const alt = img.alt || '';
        if (alt.includes(imageName) || alt.includes(baseName) ||
          text.includes(imageName) || text.includes(baseName)) {
          foundItem = item;
          break;
        }
      }
      if (foundItem) break;
    }

    // Step 5: Click found item, or fall back to index
    if (foundItem) {
      const innerDiv = foundItem.querySelector('div') || foundItem;
      innerDiv.click();
      console.log(`[GBIG] ✅ Selected asset "${imageName}" by name`);
    } else {
      // Fallback: use index
      const idx = (assetIndex !== undefined) ? Math.min(assetIndex, items.length - 1) : 0;
      const item = items[idx];
      const innerDiv = item.querySelector('div') || item;
      innerDiv.click();
      console.log(`[GBIG] ✅ Selected asset at index ${idx} (name "${imageName}" not found in text)`);
    }

    await sleep(500);
    return true;
  },

  // ── Find all asset thumbnail count (for upload tracking) ──
  findAssetThumbnails() {
    // These are in the main asset panel, not the popup
    const selectors = [
      'img[src*="blob:"]',
      'img[src*="googleusercontent"]',
      'img[draggable]',
    ];
    const assets = new Set();
    for (const sel of selectors) {
      try {
        document.querySelectorAll(sel).forEach(img => {
          if (img.closest('#gbig-panel')) return;
          const rect = img.getBoundingClientRect();
          if (rect.width > 20 && rect.height > 20) assets.add(img);
        });
      } catch { /* skip */ }
    }
    return Array.from(assets);
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

  // ── Type into the prompt (Slate.js editor) ──
  typePrompt(text) {
    const input = this.findPromptInput();
    if (!input) return false;
    input.focus();

    // Slate.js uses beforeinput events — NOT execCommand
    // Step 1: Select all existing text
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(input);
    selection.removeAllRanges();
    selection.addRange(range);

    // Step 2: Delete selected text via beforeinput
    input.dispatchEvent(new InputEvent('beforeinput', {
      inputType: 'deleteContentBackward',
      bubbles: true,
      cancelable: true,
    }));

    // Step 3: Insert new text via beforeinput (Slate intercepts this)
    input.dispatchEvent(new InputEvent('beforeinput', {
      inputType: 'insertText',
      data: text,
      bubbles: true,
      cancelable: true,
    }));

    // Step 4: Verify — check if Slate picked it up
    const slateSpan = input.querySelector('[data-slate-string="true"]');
    if (slateSpan && slateSpan.textContent.includes(text.slice(0, 20))) {
      console.log('[GBIG] ✅ Prompt entered via Slate beforeinput');
      return true;
    }

    // Fallback: try execCommand
    document.execCommand('selectAll');
    document.execCommand('insertText', false, text);
    if (input.textContent.includes(text.slice(0, 20))) {
      console.log('[GBIG] ✅ Prompt entered via execCommand');
      return true;
    }

    // Last resort: directly set Slate span text
    if (slateSpan) {
      slateSpan.textContent = text;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      console.log('[GBIG] ✅ Prompt entered via direct Slate span');
      return true;
    }

    // Ultra fallback: set textContent
    input.textContent = text;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    console.log('[GBIG] ✅ Prompt entered via textContent');
    return true;
  },

  // ── Upload image file via hidden file input (to assets) ──
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
    // If prompt is already detailed (e.g. from batch file), use as-is
    if (actionPrompt.length > 100) return actionPrompt;
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
