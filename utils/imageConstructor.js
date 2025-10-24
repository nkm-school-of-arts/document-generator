const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

/**
 * Adds an image (PNG or JPG) to a specific page in a PDF.
 *
 * @param {PDFPage} page - pdf-lib Page object
 * @param {string} imagePath - local path of image file
 * @param {number} x - X position (from left)
 * @param {number} y - Y position (from bottom)
 * @param {number} width - desired image width
 * @param {number} height - desired image height (optional, keeps ratio if omitted)
 * @param {PDFDocument} pdfDoc - pdf-lib document (used for embedding)
 * @returns {Promise<void>}
 */
async function addImage(page, imagePath, x, y, width, height, pdfDoc) {
  // 1️⃣ Read image file
  const imageBytes = fs.readFileSync(imagePath);

  // 2️⃣ Embed image (auto-detect format)
  let image;
  if (imageBytes[0] === 0x89) {
    image = await pdfDoc.embedPng(imageBytes);
  } else {
    image = await pdfDoc.embedJpg(imageBytes);
  }

  // 3️⃣ Scale the image to preserve aspect ratio if height not specified
  const aspect = image.height / image.width;
  const scaledHeight = height || width * aspect;

  // 4️⃣ Draw the image
  page.drawImage(image, {
    x,
    y,
    width,
    height: scaledHeight,
  });
}

module.exports = { addImage, };
