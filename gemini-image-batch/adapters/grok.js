// ============================================
// Grok Adapter — Site-specific logic for grok.com
// ============================================

const GrokAdapter = {
  name: 'grok',

  selectors: {
    chatInput: [
      'textarea[placeholder]',
      'div[contenteditable="true"][role="textbox"]',
      'div[contenteditable="true"]',
      'textarea',
    ],
    sendButton: [
      'button[data-testid="send-button"]',
      'button[type="submit"]',
      'button[aria-label*="Send" i]',
      'button[aria-label*="Gửi" i]',
    ],
    uploadButton: [
      'button[aria-label*="Attach" i]',
      'button[aria-label*="Upload" i]',
      'input[type="file"]',
    ],
    responseContainer: [
      '[data-testid="message-content"]',
      '.message-content',
      '.response-text',
    ],
  },

  // Grok describe prompt for identity preservation
  buildDescribePrompt() {
    return `Describe this person in EXTREME detail for me. This is a young Vietnamese/East Asian woman. I need to recreate them in another image. Be very specific about:
- Ethnicity and racial features (Vietnamese/East Asian)
- Face shape, jawline, chin
- Eye shape, color, size, eyelid type (Asian eye features)
- Eyebrow shape and thickness
- Nose shape, bridge, tip
- Lip shape, fullness, color
- Skin tone, texture, complexion
- Hair color, length, style, texture
- Body type, height impression, build
- Any distinctive features or marks
Be as detailed as possible. Emphasize the Vietnamese/Asian features. Just give me the description, no commentary.`;
  },

  buildSetupPrompt(ratio) {
    return `Now generate an artistic portrait photo of this exact young Vietnamese woman you just described. Use ALL the details from your description — especially the Asian/Vietnamese facial features. Professional studio portrait, soft lighting. Aspect ratio ${ratio}. Generate exactly 1 single image only.`;
  },

  buildIdentityPrompt(condensedDesc) {
    if (condensedDesc) {
      return `the exact same young Vietnamese woman you described earlier (${condensedDesc})`;
    }
    return `a young Vietnamese woman from the uploaded image`;
  },

  // ── Grok Outfit Swap: direct 2-image reference (proven to work) ──
  buildOutfitSwapPrompt(ratio) {
    return `Look at the two images I uploaded. Image 1 is the person/model. Image 2 shows the outfit/clothing.

TASK: Generate a FULL BODY photo (head to toe) of the EXACT SAME person from Image 1, wearing the EXACT outfit from Image 2.

CRITICAL — OUTFIT MUST NOT BE DISTORTED OR MODIFIED:
- Copy the outfit from Image 2 PIXEL-PERFECTLY — same proportions, same silhouette, same construction
- Neckline style, collar shape — EXACT match
- Sleeve type, length, and fit — EXACT match
- Overall garment length (mini/midi/maxi/full) — EXACT match
- Pattern, print, color, fabric texture — EXACT match, do NOT change scale or orientation of patterns
- All buttons, zippers, belts, pockets, accessories — EXACT match
- Layering order (if any) — EXACT match
- Do NOT stretch, shrink, redesign, simplify, or reinterpret ANY part of the outfit
- The clothing fit should look natural on the person's body WITHOUT altering the garment's original design
- If the outfit is loose/oversized in Image 2, it must remain loose/oversized — do NOT make it fitted
- If the outfit is fitted/tight in Image 2, it must remain fitted/tight — do NOT make it loose

PERSON REQUIREMENTS:
- DO NOT ALTER THE FACE — keep exact same facial features, identity
- Same body proportions, skin tone, hair from Image 1
- FULL BODY framing — show the entire person from head to shoes

SETTINGS: Professional fashion photography, well-lit, clean background. Aspect ratio ${ratio || '3:4'}. Generate exactly 1 single image only.`;
  },

  buildOutfitSwapRetryPrompt(ratio) {
    return `The previous result was NOT correct. The outfit was DISTORTED or MODIFIED. Please regenerate with these STRICT requirements:

OUTFIT FIX — DO NOT DISTORT:
- The outfit must be an EXACT COPY from Image 2 — same proportions, same silhouette, same construction
- Do NOT stretch, shrink, redesign, or reinterpret the clothing in any way
- Copy every detail: neckline, sleeves, length, pattern, color, fabric, fit, accessories
- The garment shape and design must look IDENTICAL to Image 2

PERSON FIX:
- Show FULL BODY from head to toe (do not crop)
- DO NOT ALTER FACE IN ANY WAY — use EXACT facial features from Image 1
- Maintain identity consistency — same eyes, nose, lips, face shape, skin tone

Generate exactly 1 single FULL BODY fashion photo. Aspect ratio ${ratio || '3:4'}.`;
  },

  // Grok supports image-to-video natively
  buildVideoPrompt(actionPrompt, ratio) {
    return `Generate a video from the uploaded image.

Action: ${actionPrompt}

Requirements:
- Create the actual video, do not describe it in text
- Keep the EXACT same person appearance and Vietnamese/Asian facial features from the image
- Smooth, cinematic motion with natural movement
- Professional videography quality
- Aspect ratio ${ratio || '9:16'}, 5-8 seconds
- Maintain consistent lighting and atmosphere throughout`;
  },

  // Grok-specific: extra artistic reframing for transform
  extraTransforms(prompt) {
    let p = prompt;
    p = p.replace(/\bon (the |a )?beach\b/gi, 'in a sun-kissed coastal setting with golden hour lighting');
    p = p.replace(/\bswimwear\b/gi, 'summer resort fashion collection piece');
    p = p.replace(/\bswimsuit\b/gi, 'resort wear');
    p = p.replace(/\bpool\b/gi, 'serene water garden setting');
    return p;
  },

  // Soften levels for Grok — art gallery framing
  softenLevels(cleaned, ratio) {
    const personRef = 'of this same person, ';
    return [
      `Create a fine art photography portrait ${personRef}${cleaned}. For an art gallery exhibition. Dreamy, ethereal atmosphere with soft natural lighting. Aspect ratio ${ratio}.`,
      `Create a classical photography study ${personRef}${cleaned.split(',')[0]}. Inspired by renaissance portraiture, soft diffused light, artistic composition for a museum collection. Aspect ratio ${ratio}.`,
      `Create a fine art portrait photograph in the style of a renaissance painting. Soft, warm golden light, elegant composition, suitable for a prestigious art gallery. Aspect ratio ${ratio}.`,
    ];
  },
};

// Export for content.js
if (typeof window !== 'undefined') {
  window.GBIG_ADAPTERS = window.GBIG_ADAPTERS || {};
  window.GBIG_ADAPTERS.grok = GrokAdapter;
}
