import fs from 'fs';
import path from 'path';

const filePath = path.join('E:', 'Ciszu Network', 'projects', 'ciszukoantony', 'website', 'src', 'data', 'certificates.ts');
const content = fs.readFileSync(filePath, 'utf8');

let updated = content;

// Add holderName to entries with previewType: 'pdf'
updated = updated.replace(
  /(previewType:\s*'pdf'\s*,\s*\n\s*\})/g,
  "previewType: 'pdf',\n    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',\n  }"
);

updated = updated.replace(
  /(previewType:\s*'image'\s*,\s*\n\s*\})/g,
  "previewType: 'image',\n    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',\n  }"
);

updated = updated.replace(
  /(previewType:\s*'document'\s*,\s*\n\s*\})/g,
  "previewType: 'document',\n    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',\n  }"
);

// For entries without previewType but ending with }, followed by comma and newline and next entry
// Match pattern: }\n  }, (closing a certificate entry)
updated = updated.replace(
  /(\s+\}\s*,\s*\n\s*\{)/g,
  (match, p1) => p1.replace(/(\s+\}\s*,)/, '    holderName: \'FRANCISCO ANTONIO GARCIA MENOLASCINA\',\n$1')
);

fs.writeFileSync(filePath, updated, 'utf8');
console.log('Done adding holderName');