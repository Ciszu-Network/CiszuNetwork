const fs = require('fs');
const path = require('path');

const filePath = path.join('E:', 'Ciszu Network', 'projects', 'ciszukoantony', 'website', 'src', 'data', 'certificates.ts');
const content = fs.readFileSync(filePath, 'utf8');

let updated = content;

// Strategy: For each certificate object, add holderName after the last property before the closing brace
// We need to match each certificate object and add holderName before the closing brace

// Pattern to match a certificate entry and add holderName before the closing brace
// Certificates end with }, followed by either , or ] (end of array)

// First, let's handle entries with previewType
updated = updated.replace(
  /(previewType:\s*'(?:pdf|image|document)'\s*,\s*\n\s*\})/g,
  "previewType: '$1',\n    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',\n  }"
);

// For entries without previewType, we need to add holderName before the closing brace
// Match pattern: whitespace + },\n  { (closing one cert and starting another)
// or whitespace + }\n\s*\] (end of array)

updated = updated.replace(
  /(\s+\}\s*,\s*\n\s*\{)/g,
  (match, p1) => '    holderName: \'FRANCISCO ANTONIO GARCIA MENOLASCINA\',\n' + p1
);

// Also handle the last entry in each array (ends with }\n];)
updated = updated.replace(
  /(\s+\}\s*\n\s*\]);/g,
  (match) => match.replace(/\}\s*\n\s*\]/, '    holderName: \'FRANCISCO ANTONIO GARCIA MENOLASCINA\',\n  }\n];')
);

fs.writeFileSync(filePath, updated, 'utf8');
console.log('Done adding holderName');