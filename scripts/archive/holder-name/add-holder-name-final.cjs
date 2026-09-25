const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join('E:', 'Ciszu Network', 'projects', 'ciszukoantony', 'website', 'src', 'data', 'certificates.ts');
const content = fs.readFileSync(FILE_PATH, 'utf8');

function processArray(arrayStr) {
  const lines = arrayStr.split('\n');
  const result = [];
  let inCert = false;
  let certLines = [];
  let braceCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!inCert && trimmed.startsWith('{') && lines[i + 1]?.trim().startsWith('id:')) {
      inCert = true;
      certLines = [line];
      braceCount = 1;
      continue;
    }

    if (inCert) {
      certLines.push(line);
      
      for (const ch of line) {
        if (ch === '{') braceCount++;
        if (ch === '}') braceCount--;
      }

      if (braceCount === 0) {
        const certText = certLines.join('\n');
        if (!certText.includes('holderName:')) {
          const lastIdx = certLines.length - 1;
          certLines[lastIdx] = certLines[lastIdx].replace(
            /(\s*\}\s*)([,}]?)\s*$/,
            '    holderName: \'FRANCISCO ANTONIO GARCIA MENOLASCINA\',\n  }$2'
          );
        }
        result.push(...certLines);
        inCert = false;
        certLines = [];
        braceCount = 0;
        continue;
      }
    }

    if (!inCert) {
      result.push(line);
    }
  }

  return result.join('\n');
}

const certStart = content.indexOf('export const CERTIFICATES: Certificate[] = [');
const certEnd = content.indexOf('];', content.indexOf('export const CERTIFICATES: Certificate[] = [')) + 2;
const otherStart = content.indexOf('export const OTHER_DOCS: Certificate[] = [', content.indexOf('export const CERTIFICATES: Certificate[] = ['));
const otherEnd = content.indexOf('];', content.indexOf('export const OTHER_DOCS: Certificate[] = [')) + 2;

if (certStart === -1 || otherStart === -1) {
  console.error('Could not find array boundaries');
  process.exit(1);
}

const certEndIdx = content.indexOf('];', content.indexOf('export const CERTIFICATES: Certificate[] = [')) + 2;
const otherEndIdx = content.indexOf('];', content.indexOf('export const OTHER_DOCS: Certificate[] = [')) + 2;

const beforeCerts = content.substring(0, certStart);
const certsArray = content.substring(certStart, certEnd);
const betweenArrays = content.substring(certEndIdx, otherStart);
const otherDocsArray = content.substring(otherStart, otherEndIdx);
const afterOtherDocs = content.substring(otherEndIdx);

const newCerts = processArray(certsArray);
const newOtherDocs = processArray(otherDocsArray);

const updated = beforeCerts + newCerts + betweenArrays + newOtherDocs + afterOtherDocs;

fs.writeFileSync(FILE_PATH, updated, 'utf8');
console.log('Done adding holderName');