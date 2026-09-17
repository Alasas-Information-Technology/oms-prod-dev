const fs = require('fs');
const path = require('path');

const dir = 'components/oms/dashboard/widgets';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('<WidgetShell isQuiet')) {
    content = content.replace(/<WidgetShell isQuiet/g, '<WidgetShell');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Reverted', file);
  }
}
