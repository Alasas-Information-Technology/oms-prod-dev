const fs = require('fs');

const file = 'lib/dashboard/fixtures.ts';
let code = fs.readFileSync(file, 'utf8');

// I will just parse the file and reorder the bands array for each persona.
// The easiest way is to find the bounds of each persona's band array and reorder the elements.
// Since the arrays are formatted with spaces, we can split by '{ \n        band: "' and reassemble.

const newOrder = {
  requestor: ['B', 'B2', 'A', 'C1', 'C2', 'D'],
  hod: ['B', 'B2', 'D', 'A', 'C1', 'C2', 'C3'],
  hr: ['B', 'B2', 'D', 'A', 'C1', 'C2', 'C3'],
  finance: ['B', 'B2', 'D', 'A', 'C1', 'C2', 'C3'],
  systemAdmin: ['B', 'E1', 'E2', 'E3', 'E4', 'D', 'A', 'C']
};

for (const [persona, order] of Object.entries(newOrder)) {
  const regex = new RegExp(`(${persona}:\\s*\\{[\\s\\S]*?bands:\\s*\\[)([\\s\\S]*?)(\\]\\s*,\\s*updatedAt:)`, 'g');
  const match = regex.exec(code);
  
  if (match) {
    const pre = match[1];
    const bandsStr = match[2];
    const post = match[3];
    
    // Extract individual bands
    const bandRegex = /\{\s*band:\s*"([^"]+)"[\s\S]*?(?=\n\s*\{|\s*$)/g;
    let bandMatch;
    const bandsMap = {};
    
    while ((bandMatch = bandRegex.exec(bandsStr)) !== null) {
      let bStr = bandMatch[0].trim();
      if (bStr.endsWith(',')) {
        bStr = bStr.slice(0, -1); // remove trailing comma if present
      }
      bandsMap[bandMatch[1]] = bStr;
    }
    
    // Reassemble
    const newBandsStr = '\n' + order.map(b => '      ' + bandsMap[b] + ',').join('\n') + '\n    ';
    
    code = code.substring(0, match.index) + pre + newBandsStr + post + code.substring(match.index + match[0].length);
  }
}

fs.writeFileSync(file, code, 'utf8');
console.log('Reordered bands successfully.');
