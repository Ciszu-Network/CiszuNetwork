const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'shared', 'icons', 'svg', 'outline');
const names = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith('.svg'))
  .map((f) => f.slice(0, -4));

console.log(names.join('\n'));
