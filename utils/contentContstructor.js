const { PDFDocument, rgb } = require('pdf-lib');
/**
 * Draws a justified paragraph and supports <B>...</B> inline bold markup.
 *
 * @param {PDFPage} page - pdf-lib page object
 * @param {string} text - paragraph text (may include <B>...</B>)
 * @param {PDFFont} normalFont - normal font (e.g. Calibri)
 * @param {PDFFont} boldFont - bold font (e.g. Calibri Bold)
 * @param {number} fontSize - font size
 * @param {number} startY - starting y position
 * @param {number} lineHeight - vertical line spacing
 * @param {number} margin - left/right margin
 */
 function drawJustifiedParagraphWithTags(
  page,
  text,
  normalFont,
  boldFont,
  fontSize,
  y,
  lineHeight,
  margin
){
  
  const { width } = page.getSize();
  const maxWidth = width - 2 * margin;

  // --- Parse <B>...</B> segments ---
  const segments = [];
  const regex = /<B>(.*?)<\/B>|([^<]+)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match[1]) {
      segments.push({ text: match[1], bold: true });
    } else if (match[2]) {
      segments.push({ text: match[2], bold: false });
    }
  }

  // --- Build words with spacing ---
  const words = [];
  for (const seg of segments) {
    const font = seg.bold ? boldFont : normalFont;
    const splitWords = seg.text.split(/(\s+)/); // keep spaces as tokens
    for (const w of splitWords) {
      if (w.length > 0) words.push({ text: w, font });
    }
  }

  // --- Word wrapping logic ---
  const lines = [];
  let currentLine = [];
  let currentWidth = 0;

  for (const w of words) {
    const wordWidth = w.font.widthOfTextAtSize(w.text, fontSize);
    if (currentWidth + wordWidth > maxWidth && currentLine.length > 0 && !/^\s+$/.test(w.text)) {
      lines.push(currentLine);
      currentLine = [];
      currentWidth = 0;
    }
    currentLine.push(w);
    currentWidth += wordWidth;
  }
  if (currentLine.length > 0) lines.push(currentLine);

  // --- Draw justified lines ---
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isLastLine = i === lines.length - 1;

    const totalTextWidth = line.reduce(
      (sum, w) => sum + w.font.widthOfTextAtSize(w.text, fontSize),
      0
    );

    const spaceCount = line.filter(w => /^\s+$/.test(w.text)).length;
    const extraSpace = maxWidth - totalTextWidth;
    const normalSpaceWidth = normalFont.widthOfTextAtSize(' ', fontSize);
    const justifySpaceWidth =
      !isLastLine && spaceCount > 0 ? normalSpaceWidth + extraSpace / spaceCount : normalSpaceWidth;

    let x = margin;

    for (const w of line) {
      if (/^\s+$/.test(w.text)) {
        x += justifySpaceWidth; // add dynamic justified spacing
        continue;
      }
      page.drawText(normalizeLigatures(w.text), {
        x,
        y,
        size: fontSize,
        font: w.font,
        color: rgb(0, 0, 0),
      });
      x += w.font.widthOfTextAtSize(w.text, fontSize);
    }
    y -= lineHeight;
  }

  return y;
}

function normalizeLigatures(text) {
  // Replace common ligature glyphs with normal characters
  return text
  .replace(/\ufb00/g, "ff")
  .replace(/\ufb01/g, "fi")
  .replace(/\ufb02/g, "fl")
  .replace(/\ufb03/g, "ffi")
  .replace(/\ufb04/g, "ffl")
}


module.exports = { 
    drawJustifiedParagraphWithTags,
    
};