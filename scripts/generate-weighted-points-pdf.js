const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const outputPath = path.join(process.cwd(), 'weighted-points-explanation.pdf');

const doc = new PDFDocument({
  margin: 48,
  size: 'A4',
  info: {
    Title: 'Weighted Points Calculation',
    Author: 'Faculty Achievement Dashboard',
    Subject: 'Scoring rubric for weighted points',
  },
});

doc.pipe(fs.createWriteStream(outputPath));

doc.font('Helvetica-Bold').fontSize(18).text('Weighted Points Calculation');
doc.moveDown(0.5);
doc.font('Helvetica').fontSize(10).fillColor('#555').text('Generated on March 13, 2026');
doc.moveDown(1);

doc.fillColor('#000').font('Helvetica-Bold').fontSize(12).text('How it is calculated');
doc.moveDown(0.4);
doc.font('Helvetica').fontSize(11).text('Weighted points are computed per approved activity record, then summed for each faculty and department.');
doc.moveDown(0.8);

doc.font('Helvetica-Bold').fontSize(12).text('Scoring Rubric');
doc.moveDown(0.4);

const rules = [
  '1. Patent Granted: International = 50, otherwise National = 40',
  '2. Patent Published: International = 30, otherwise National = 20',
  '3. Patent Filed: 10 (any level)',
  '4. Paper Presentation: International = 5, otherwise National = 3',
  '5. Guest Lecture: International/National = 5, State/Institute/Others = 2',
  '6. Online Course: Premium providers (NPTEL/SWAYAM/AICTE/MOOC/IBM/GOOGLE/CISCO/edX etc.) = 3, others = 2',
  '7. Events Organized: International/National = 3, State = 2, Institute/Others = 1',
  '8. Events Attended: FDP/STTP/NPTEL-FDP/Certificate/Exchange/AICTE variants = 2, others = 1',
];

for (const line of rules) {
  doc.font('Helvetica').fontSize(10.5).text(line, { lineGap: 2 });
}

doc.moveDown(0.8);
doc.font('Helvetica-Bold').fontSize(12).text('Formulas');
doc.moveDown(0.4);
doc.font('Helvetica').fontSize(10.5).text('Faculty Weighted Points = Sum of score(record) across all approved records for that faculty.');
doc.moveDown(0.3);
doc.text('Department Total Points = Sum of Faculty Weighted Points for all faculty in that department.');

doc.moveDown(0.8);
doc.font('Helvetica-Bold').fontSize(12).text('Example');
doc.moveDown(0.4);
doc.font('Helvetica').fontSize(10.5).text('If one faculty has: 2 international patent grants, 1 national paper, 3 premium online courses, and 4 FDP attended events:');
doc.moveDown(0.3);
doc.text('Points = (2 x 50) + (1 x 3) + (3 x 3) + (4 x 2) = 120');

doc.moveDown(1);
doc.font('Helvetica-Oblique').fontSize(9.5).fillColor('#555').text('Source implementation: lib/csv-loader.ts (scoring functions and aggregation pipeline).');

doc.end();

console.log('PDF generated:', outputPath);
