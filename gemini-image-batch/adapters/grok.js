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

  // ── Grok Outfit Swap: virtual try-on from 2 reference images ──
  buildOutfitSwapPrompt(ratio) {
    return `Virtual try-on: Combine these 2 images into 1 fashion photo.
- Person/face/body → take from Image 1
- Outfit/clothing → take from Image 2

Keep the same face as Image 1. Keep the exact outfit design, pattern, color, fabric from Image 2.
Full body, standing pose, fashion photography.
Aspect ratio ${ratio || '9:16'}. Generate 1 image.`;
  },

  buildOutfitSwapRetryPrompt(ratio) {
    return `Try again. Combine the 2 uploaded images into 1 photo:
- Face and body from Image 1
- Outfit details (pattern, color, design) from Image 2
Full body standing pose. Aspect ratio ${ratio || '9:16'}. Generate 1 image.`;
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
