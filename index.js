const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const AWS = require('aws-sdk');
const fs = require('fs');
const fontkit = require('@pdf-lib/fontkit');
const content = require('./content');
const { drawJustifiedParagraphWithTags } = require('./utils/contentContstructor');
const { addImage } = require('./utils/imageConstructor');


const s3 = new AWS.S3();

exports.handler = async (event) => {


  try {

    let body = {};
    try {
      body = typeof event.body === "string" ? JSON.parse(event.body) : event.body || {};
      // If body.body exists (frontend wrapped it), unwrap it
      if (body.body) {
        body = typeof body.body === "string" ? JSON.parse(body.body) : body.body;
      }
    } catch (err) {
      console.error("Invalid JSON in event.body:", err);
      return { statusCode: 400, body: "Invalid JSON" };
    }

    const { to, templeDetails, scheduleDetails } = body || {};

    if (!to || !templeDetails || !scheduleDetails) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    
    const bucketName = 'nkm-request-letters';
    const templateKey = 'nkm-letterhead.pdf';

    const templateData = await s3.getObject({ Bucket: bucketName, Key: templateKey }).promise();

    const pdfDoc = await PDFDocument.load(templateData.Body);
    pdfDoc.registerFontkit(fontkit);

    try {
      const fcalbri_regular = fs.readFileSync('./font/OpenSans-Regular.ttf'); // put Calibri font in same folder
      const fcalbri_bold = fs.readFileSync('./font/OpenSans-SemiBold.ttf');
      fontregular = await pdfDoc.embedFont(fcalbri_regular);
      fontbold = await pdfDoc.embedFont(fcalbri_bold);

    } catch (err) {
      console.warn("Calibri font not found, using Helvetica." + err);
    }

    // -----------------------------
    // 3️⃣ Get page and size
    // -----------------------------
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    const rightMargin = 150; // distance from right edge
    const topOffset = 110;   // distance from top edge
    const linecount = 12;
    const leftMargin = 550;


    content.toText.from = content.toText.from.replace(/{{toTitle}}/g, to.toTitle);
    content.toText.title = content.toText.title.replace(/{{addressline1}}/g, to.addressline1);
    content.toText.address = content.toText.address.replace(/{{addressline2}}/g, to.addressline2);

    content.templePassage.passage = content.templePassage.passage
      .replace(/{{godtitile}}/g, templeDetails.godtitile)
      .replace(/{{templeName}}/g, templeDetails.templeName);

    content.schedulePassage.passage = content.schedulePassage.passage.replace(/{{requestedDate}}/g, scheduleDetails.requestedDate);

    const pdfname = `${templeDetails.godtitile}_${scheduleDetails.requestedDate}_${Date.now()}`
    .replace(/\s+/g, "_")
    .replace(/[^\w\-\.]/g, "") + ".pdf";

    let cline = 0;
    firstPage.drawText(content.currentdate.regno, { x: width - rightMargin, y: height - topOffset, size: content.currentdate.fsize, font: fontbold, color: rgb(0, 0, 0), });
    firstPage.drawText(content.currentdate.date, { x: width - rightMargin, y: height - topOffset - content.currentdate.linecount, size: content.currentdate.fsize, font: fontbold, color: rgb(0, 0, 0), });
    cline = height - topOffset - (linecount * 3)

    firstPage.drawText(content.fromText.description, { x: width - leftMargin, y: cline, size: content.fromText.fsize, font: fontbold, color: rgb(0, 0, 0), });
    firstPage.drawText(content.fromText.from, { x: width - leftMargin, y: cline - (content.fromText.linecount), size: content.fromText.fsize, font: fontregular, color: rgb(0, 0, 0), });
    firstPage.drawText(content.fromText.title, { x: width - leftMargin, y: cline - (content.fromText.linecount * 2), size: content.fromText.fsize, font: fontregular, color: rgb(0, 0, 0), });
    firstPage.drawText(content.fromText.address, { x: width - leftMargin, y: cline - (content.fromText.linecount * 3), size: content.fromText.fsize, font: fontregular, color: rgb(0, 0, 0), });
    cline = cline - (content.fromText.linecount * 5)

    firstPage.drawText(content.toText.description, { x: width - leftMargin, y: cline, size: content.toText.fsize, font: fontbold, color: rgb(0, 0, 0), });
    firstPage.drawText(content.toText.from, { x: width - leftMargin, y: cline - (content.toText.linecount), size: content.toText.fsize, font: fontregular, color: rgb(0, 0, 0), });
    firstPage.drawText(content.toText.title, { x: width - leftMargin, y: cline - (content.toText.linecount * 2), size: content.toText.fsize, font: fontregular, color: rgb(0, 0, 0), });
    firstPage.drawText(content.toText.address, { x: width - leftMargin, y: cline - (content.toText.linecount * 3), size: content.toText.fsize, font: fontregular, color: rgb(0, 0, 0), });
    cline = cline - (content.toText.linecount * 5)

    firstPage.drawText(content.introPassage.description, { x: width - leftMargin, y: cline, size: content.introPassage.fsize, font: fontbold, color: rgb(0, 0, 0), });
    cline = cline - (content.introPassage.linecount*2)
    let lines = [];
    cline = drawJustifiedParagraphWithTags(firstPage, content.introPassage.passage, fontregular, fontbold, content.introPassage.fsize, cline, content.introPassage.linecount, 45);


    cline = cline - (content.templePassage.linecount)
    cline = drawJustifiedParagraphWithTags(firstPage, content.templePassage.passage, fontregular, fontbold, content.templePassage.fsize, cline, content.templePassage.linecount, 45);

    cline = cline - (content.schedulePassage.linecount)
    cline = drawJustifiedParagraphWithTags(firstPage, content.schedulePassage.passage, fontregular, fontbold, content.schedulePassage.fsize, cline, content.schedulePassage.linecount, 45);

    cline = cline - (content.contactPassage.linecount)
    cline = drawJustifiedParagraphWithTags(firstPage, content.contactPassage.passage, fontregular, fontbold, content.contactPassage.fsize, cline, content.contactPassage.linecount, 45);

    cline = cline - (content.thanksNote.linecount)
    cline = drawJustifiedParagraphWithTags(firstPage, content.thanksNote.passage, fontregular, fontbold, content.thanksNote.fsize, cline, content.thanksNote.linecount, 45);
    
    cline = 240
    cline = cline - (content.thanksNote.linecount)
    firstPage.drawText(content.regardsNote.passage, { x: width - content.regardsNote.rightMargin, y: cline, size: content.regardsNote.fsize, font: fontbold, color: rgb(0, 0, 0), });

    addImage(firstPage, './image/singnature.png', width - content.regardsNote.rightMargin, cline - (content.thanksNote.linecount * 5), 100, 50, pdfDoc);


    cline = cline - (content.nameNote.linecount * 5)
    firstPage.drawText(content.nameNote.name, { x: width - content.nameNote.rightMargin, y: cline, size: content.regardsNote.fsize, font: fontbold, color: rgb(0, 0, 0), });
    cline = cline - (content.titleNote.linecount)
    firstPage.drawText(content.titleNote.tittle, { x: width - content.titleNote.rightMargin, y: cline, size: content.titleNote.fsize, font: fontbold, color: rgb(0, 0, 0), });

    const pdfBytes = await pdfDoc.save();

    // 6. Upload the new PDF to S3 with a unique name
    //const newKey = `generated-${Date.now()}.pdf`;
    await s3.putObject({
      Bucket: bucketName,
      Key: pdfname,
      Body: Buffer.from(pdfBytes),
      ContentType: 'application/pdf',
    }).promise();

    // 7. Return the S3 URL or presigned URL for download
    const url = s3.getSignedUrl('getObject', {
      Bucket: bucketName,
      Key: pdfname,
      Expires: 60 * 5, // 5 minutes expiry
    });

    // Return as Base64 for download
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};