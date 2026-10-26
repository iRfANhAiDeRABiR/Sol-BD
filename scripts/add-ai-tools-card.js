const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createComposite() {
  const srcPath = 'C:/Users/irfan/.gemini/antigravity/brain/e771a594-cf0b-4660-b672-c2a075805529/.user_uploaded/media_1793014296810_c8d62716.png';
  const { data, info } = await sharp(srcPath).raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  // 1. Inpaint red pixels:
  // For each pixel, if it's red (r > 130 && g < 70 && b < 70), interpolate from nearest non-red pixels
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      if (r > 135 && g < 75 && b < 75) {
        let upY = y - 1;
        while (upY >= 0 && data[(upY * w + x) * 4] > 135 && data[(upY * w + x) * 4 + 1] < 75 && data[(upY * w + x) * 4 + 2] < 75) {
          upY--;
        }
        let downY = y + 1;
        while (downY < h && data[(downY * w + x) * 4] > 135 && data[(downY * w + x) * 4 + 1] < 75 && data[(downY * w + x) * 4 + 2] < 75) {
          downY++;
        }

        let targetR, targetG, targetB;
        if (upY >= 0 && downY < h) {
          const upIdx = (upY * w + x) * 4;
          const downIdx = (downY * w + x) * 4;
          const distUp = y - upY;
          const distDown = downY - y;
          const total = distUp + distDown;
          targetR = Math.round((data[upIdx] * distDown + data[downIdx] * distUp) / total);
          targetG = Math.round((data[upIdx + 1] * distDown + data[downIdx + 1] * distUp) / total);
          targetB = Math.round((data[upIdx + 2] * distDown + data[downIdx + 2] * distUp) / total);
        } else if (upY >= 0) {
          const upIdx = (upY * w + x) * 4;
          targetR = data[upIdx];
          targetG = data[upIdx + 1];
          targetB = data[upIdx + 2];
        } else if (downY < h) {
          const downIdx = (downY * w + x) * 4;
          targetR = data[downIdx];
          targetG = data[downIdx + 1];
          targetB = data[downIdx + 2];
        } else {
          targetR = 12;
          targetG = 11;
          targetB = 27;
        }

        data[idx] = targetR;
        data[idx + 1] = targetG;
        data[idx + 2] = targetB;
      }
    }
  }

  // Also do horizontal pass to eliminate any vertical stroke remnants
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      if (r > 120 && g < 75 && b < 75) {
        let leftX = x - 1;
        while (leftX >= 0 && data[(y * w + leftX) * 4] > 120 && data[(y * w + leftX) * 4 + 1] < 75 && data[(y * w + leftX) * 4 + 2] < 75) {
          leftX--;
        }
        let rightX = x + 1;
        while (rightX < w && data[(y * w + rightX) * 4] > 120 && data[(y * w + rightX) * 4 + 1] < 75 && data[(y * w + rightX) * 4 + 2] < 75) {
          rightX++;
        }
        if (leftX >= 0 && rightX < w) {
          const lIdx = (y * w + leftX) * 4;
          const rIdx = (y * w + rightX) * 4;
          data[idx] = Math.round((data[lIdx] + data[rIdx]) / 2);
          data[idx + 1] = Math.round((data[lIdx + 1] + data[rIdx + 1]) / 2);
          data[idx + 2] = Math.round((data[lIdx + 2] + data[rIdx + 2]) / 2);
        }
      }
    }
  }

  const cleanBase = await sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();

  // 2. SVG overlay for AI Tools card:
  // Card layout matches exact dimensions of Windows (width ~175, height: 82)
  // Placement: x = 118, y = 175, width = 195, height = 82, rx = 20
  const svgOverlay = Buffer.from(`
    <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="cardShadow" x="-25%" y="-25%" width="160%" height="170%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000000" flood-opacity="0.45" />
        </filter>
        <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#191738" stop-opacity="0.75" />
          <stop offset="100%" stop-color="#12112a" stop-opacity="0.68" />
        </linearGradient>
        <linearGradient id="cardBorder" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.14" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.04" />
        </linearGradient>
      </defs>

      <!-- Glass Card Background -->
      <g filter="url(#cardShadow)">
        <rect x="118" y="175" width="195" height="82" rx="20" ry="20" fill="url(#cardBg)" stroke="url(#cardBorder)" stroke-width="1.2" />
      </g>

      <!-- AI / ChatGPT Emerald-Teal Icon -->
      <g transform="translate(138, 198)">
        <!-- Rounded square icon base -->
        <rect x="0" y="0" width="36" height="36" rx="9" fill="#10a37f" />
        <!-- Inner ChatGPT swirl symbol -->
        <path d="M25.8 17.6c-.1-.8-.4-1.6-.9-2.2a4.4 4.4 0 0 0-2.8-1.8 4.5 4.5 0 0 0-4.3-2.3 4.4 4.4 0 0 0-3.2 1.6 4.4 4.4 0 0 0-4 1.9 4.4 4.4 0 0 0-.2 4.6 4.3 4.3 0 0 0 .9 2.2 4.4 4.4 0 0 0 2.8 1.8 4.5 4.5 0 0 0 4.3 2.3 4.4 4.4 0 0 0 3.2-1.6 4.4 4.4 0 0 0 4-1.9 4.4 4.4 0 0 0 .2-4.6zm-7.8 8.1c-1.2 0-2.2-.5-2.8-1.4l1.1-.6a2.6 2.6 0 0 1 2.6.2l1.4-.8v1.7c-.7.6-1.5.9-2.3.9zm-5.4-3.1c-.5-.6-.8-1.4-.7-2.3l1.2.1c.1.9.5 1.6 1.2 2.1l-.8 1.4-1-.1zm-.8-5.8c.3-.8.9-1.5 1.7-1.9l.6 1.1c-.6.3-1 1-1.2 1.7l-1.4-.4.3-.5zm6.6-3.4c1.2 0 2.2.5 2.8 1.4l-1.1.6a2.6 2.6 0 0 1-2.6-.2l-1.4.8v-1.7c.7-.6 1.5-.9 2.3-.9zm3.4 2.3c.6.5 1.1 1.2 1.2 2l-1.2.2a2.6 2.6 0 0 1-1.2-2.1l.8-1.4.4 1.3zm.8 5.7c-.3.9-.9 1.5-1.7 1.9l-.6-1.1c.6-.3 1-1 1.2-1.7l1.4.4-.3.5zm-4.6-1.4a2 2 0 1 1 2-2 2 2 0 0 1-2 2z" fill="#ffffff" />
      </g>

      <!-- Typography: AI Tools -->
      <text x="187" y="224" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="18.5" font-weight="700" fill="#ffffff" letter-spacing="-0.3px">AI Tools</text>
    </svg>
  `);

  const finalImg = await sharp(cleanBase)
    .composite([{ input: svgOverlay, top: 0, left: 0 }])
    .png()
    .toBuffer();

  const outPath1 = 'public/img_content/ai_tools_category_card.png';
  fs.writeFileSync(outPath1, finalImg);
  console.log('Successfully saved to:', outPath1);

  const artifactDir = 'C:/Users/irfan/.gemini/antigravity/brain/e771a594-cf0b-4660-b672-c2a075805529';
  const outPath2 = path.join(artifactDir, 'ai_tools_category_card_clean.png');
  fs.writeFileSync(outPath2, finalImg);
  console.log('Successfully saved to artifact dir:', outPath2);
}

createComposite().catch(console.error);
