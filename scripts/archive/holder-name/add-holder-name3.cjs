const fs = require('fs');
const path = require('path');

const filePath = path.join('E:', 'Ciszu Network', 'projects', 'ciszukoantony', 'website', 'src', 'data', 'certificates.ts');
const content = fs.readFileSync(filePath, 'utf8');

let updated = content;

// Strategy: 
// 1. Split the content into sections: before CERTIFICATES, CERTIFICATES array, between arrays, OTHER_DOCS array, after
// 2. Only modify the certificate objects in CERTIFICATES and OTHER_DOCS arrays

// Split the content at the array boundaries
const certArrayStart = content.indexOf('export const CERTIFICATES: Certificate[] = [');
const certArrayEnd = content.indexOf('];', certArrayStart) + 2;
const otherDocsArrayStart = content.indexOf('export const OTHER_DOCS: Certificate[] = [', certArrayEnd);
const otherDocsArrayEnd = content.indexOf('];', otherDocsArrayStart) + 2;

if (certArrayStart === -1 || certArrayEnd === -1 || otherDocsArrayStart === -1 || otherDocsArrayEnd === -1) {
  console.error('Could not find array boundaries');
  process.exit(1);
}

const beforeCerts = content.substring(0, certArrayStart);
const certsArray = content.substring(certArrayStart, certArrayEnd);
const betweenArrays = content.substring(certArrayEnd, otherDocsArrayStart);
const otherDocsArray = content.substring(otherDocsArrayStart, otherDocsArrayEnd);
const afterOtherDocs = content.substring(otherDocsArrayEnd);

// Function to add holderName to certificate objects in an array string
function addHolderNameToCerts(arrayStr) {
  // Split by certificate entries - each starts with { and ends with },
  // We need to be careful to only match top-level certificates
  
  // Split by lines to process
  const lines = arrayStr.split('\n');
  let result = [];
  let inCert = false;
  let certLines = [];
  let braceCount = 0;
  let certStartLine = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Detect start of a certificate object (line with 'id:' at the start of an object)
    if (!inCert && trimmed.startsWith('{') && lines[i+1]?.trim().startsWith('id:')) {
      inCert = true;
      certLines = [line];
      braceCount = 1;
      certStartLine = i;
      continue;
    }
    
    if (inCert) {
      certLines.push(line);
      
      // Count braces
      for (const ch of line) {
        if (ch === '{') braceCount++;
        if (ch === '}') braceCount--;
      }
      
      // Certificate ends when braceCount returns to 0
      if (braceCount === 0) {
        // Check if this cert already has holderName
        const certText = certLines.join('\n');
        if (!certText.includes('holderName:')) {
          // Add holderName before the closing brace
          const lastLine = certLines[certLines.length - 1];
          const modifiedLastLine = lastLine.replace(
            /\s*\}\s*(,?)\s*$/,
            '    holderName: \'FRANCISCO ANTONIO GARCIA MENOLASCINA\',\n  }$1'
          );
          certLines[certLines.length - 1] = modifiedLastLine;
        }
        result.push(...certLines);
        inCert = false;
        certLines = [];
        continue;
      }
    }
    
    if (!inCert) {
      result.push(line);
    }
  }
  
  return result.join('\n');
}

const newCertsArray = addHolderNameToCerts(certsArray);
const newOtherDocsArray = addHolderNameToCerts(otherDocsArray);

const updated = beforeCerts + newCertsArray + betweenArrays + newOtherDocsArray + afterOtherDocs;

fs.writeFileSync(filePath, updated, 'utf8');
console.log('Done adding holderName');