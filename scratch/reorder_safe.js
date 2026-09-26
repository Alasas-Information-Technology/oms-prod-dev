const fs = require('fs');

let fileContent = fs.readFileSync('lib/dashboard/fixtures.ts', 'utf8');

const newOrder = {
  requestor: ['B', 'B2', 'A', 'C1', 'C2', 'D'],
  hod: ['B', 'B2', 'D', 'A', 'C1', 'C2', 'C3'],
  hr: ['B', 'B2', 'D', 'A', 'C1', 'C2', 'C3'],
  finance: ['B', 'B2', 'D', 'A', 'C1', 'C2', 'C3'],
  systemAdmin: ['B', 'E1', 'E2', 'E3', 'E4', 'D', 'A', 'C']
};

function processBands(code, persona, order) {
  // Find start of persona object
  const pRegex = new RegExp(`^\\s+${persona}:\\s*\\{`, 'm');
  const pMatch = code.match(pRegex);
  if (!pMatch) return code;
  
  const startIndex = pMatch.index;
  // Find the 'bands: [' inside this persona
  const bandsStartRegex = /\n\s+bands:\s*\[\n/g;
  bandsStartRegex.lastIndex = startIndex;
  const match = bandsStartRegex.exec(code);
  
  if (!match) return code;
  
  let pos = bandsStartRegex.lastIndex;
  const bandsArrayStart = match.index;
  const arrayContentStart = pos;
  
  // parse elements in bands array
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
        // Find trailing comma if exists
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
      if (brackets === 0) {
        // Found end of bands array
        break;
      }
    }
  }
  
  const arrayContentEnd = pos;
  
  // Now we have the band objects strings
  const parsedBands = bandObjects.filter(b => b.trim().length > 0).map(str => {
    const bandMatch = str.match(/band:\s*"([^"]+)"/);
    return {
      bandId: bandMatch ? bandMatch[1] : '',
      content: str
    };
  });
  
  // Reorder
  parsedBands.sort((a, b) => {
    return order.indexOf(a.bandId) - order.indexOf(b.bandId);
  });
  
  // Reconstruct
  const newArrayContent = parsedBands.map(b => b.content).join('');
  
  return code.substring(0, arrayContentStart) + newArrayContent + code.substring(arrayContentEnd);
}

for (const [persona, order] of Object.entries(newOrder)) {
  fileContent = processBands(fileContent, persona, order);
}

fs.writeFileSync('lib/dashboard/fixtures.ts', fileContent, 'utf8');
console.log("Successfully reordered bands safely!");
