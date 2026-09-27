const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('.').filter(f => f.endsWith('.tsx'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  const replacements = [
    // Revert the failed gradient to a classy solid card
    {
      target: 'Card className="rounded-xl border border-foreground/10 bg-linear-to-b from-card/90 to-card/50 backdrop-blur-md shadow-lg overflow-hidden"',
      replacement: 'Card className="rounded-xl border border-foreground/15 bg-card shadow-sm overflow-hidden"'
    },
    // Also target the original ones that haven't been changed yet
    {
      target: 'Card className="rounded-md border-border/70 bg-card/70 backdrop-blur-xs shadow-xs"',
      replacement: 'Card className="rounded-xl border border-foreground/15 bg-card shadow-sm overflow-hidden"'
    },
    // Toggles
    {
      target: 'FormItem className="flex flex-row items-center justify-between rounded-xl border border-foreground/10 bg-muted/40 p-4 transition-all hover:bg-muted/60 shadow-xs"',
      replacement: 'FormItem className="flex flex-row items-center justify-between rounded-xl border border-border/50 bg-muted/30 p-4 transition-all hover:bg-muted/50"'
    },
    {
      target: 'FormItem className="flex flex-row items-center justify-between rounded-md border border-border/70 bg-background/50 p-4 transition-all hover:bg-background/80"',
      replacement: 'FormItem className="flex flex-row items-center justify-between rounded-xl border border-border/50 bg-muted/30 p-4 transition-all hover:bg-muted/50"'
    },
    // Inputs
    {
      target: 'className="text-sm h-10 rounded-md sm:max-w-[200px] bg-background shadow-xs border-foreground/15"',
      replacement: 'className="text-sm h-9 rounded-md sm:max-w-[240px] border-border shadow-xs"'
    },
    {
      target: 'className="text-sm h-10 rounded-md"',
      replacement: 'className="text-sm h-9 rounded-md sm:max-w-[240px] border-border shadow-xs"'
    }
  ];

  for (const { target, replacement } of replacements) {
    if (content.includes(target)) {
      content = content.replaceAll(target, replacement);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
}
