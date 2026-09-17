const fs = require('fs');

let fileContent = fs.readFileSync('lib/dashboard/fixtures.ts', 'utf8');

const originalOrder = {
  requestor: ['A', 'B', 'B2', 'C1', 'C2', 'D'],
  hod: ['A', 'B', 'B2', 'C1', 'C2', 'C3', 'D'],
  hr: ['A', 'B', 'B2', 'C1', 'C2', 'C3', 'D'],
  finance: ['A', 'B', 'B2', 'C1', 'C2', 'C3', 'D'],
  systemAdmin: ['A', 'B', 'E1', 'E2', 'E3', 'E4', 'C', 'D']
};

function processBands(code, persona, order) {
  const pRegex = new RegExp(`^\\s+${persona}:\\s*\\{`, 'm');
  const pMatch = code.match(pRegex);
  if (!pMatch) return code;
  
  const startIndex = pMatch.index;
  const bandsStartRegex = /\n\s+bands:\s*\[\n/g;
  bandsStartRegex.lastIndex = startIndex;
  const match = bandsStartRegex.exec(code);
  
  if (!match) return code;
  
  let pos = bandsStartRegex.lastIndex;
  const arrayContentStart = pos;
  
  let brackets = 1;
  let bandObjects = [];
  let currentStart = pos;
  let braces = 0;
  
  for (; pos < code.length; pos++) {
    const char = code[pos];
    if (char === '{') {
      braces++;
    } else if (char === '}') {
      braces--;
      if (braces === 0) {
        let endObjPos = pos + 1;
        while (code[endObjPos] === ' ' || code[endObjPos] === '\n' || code[endObjPos] === ',') {
          endObjPos++;
        }
        bandObjects.push(code.substring(currentStart, endObjPos));
        currentStart = endObjPos;
        pos = endObjPos - 1;
      }
    } else if (char === '[' && braces === 0) {
      brackets++;
    } else if (char === ']' && braces === 0) {
      brackets--;
      if (brackets === 0) break;
    }
  }
  
  const arrayContentEnd = pos;
  
  const parsedBands = bandObjects.filter(b => b.trim().length > 0).map(str => {
    const bandMatch = str.match(/band:\s*"([^"]+)"/);
    return {
      bandId: bandMatch ? bandMatch[1] : '',
      content: str
    };
  });
  
  parsedBands.sort((a, b) => {
    return order.indexOf(a.bandId) - order.indexOf(b.bandId);
  });
  
  const newArrayContent = parsedBands.map(b => b.content).join('');
  return code.substring(0, arrayContentStart) + newArrayContent + code.substring(arrayContentEnd);
}

for (const [persona, order] of Object.entries(originalOrder)) {
  fileContent = processBands(fileContent, persona, order);
}

fs.writeFileSync('lib/dashboard/fixtures.ts', fileContent, 'utf8');
console.log("Successfully reverted bands order safely!");
