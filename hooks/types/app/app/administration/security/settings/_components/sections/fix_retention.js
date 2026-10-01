const fs = require('fs');

let content = fs.readFileSync('RetentionPolicyCard.tsx', 'utf8');

const regex = /<div className="flex items-center justify-between">\s*<FormLabel className="([^"]+)">\s*<([^>]+)>\s*<span>([^<]+)<\/span>\s*<\/FormLabel>\s*<span className="([^"]+)">\s*~\{\(field\.value \/ 365\)\.toFixed\(1\)\} yrs\s*<\/span>\s*<\/div>\s*<FormControl>\s*<Input\s*type="number"\s*min=\{1\}\s*max=\{3650\}\s*\{\.\.\.field\}\s*onChange=\{\(e\) => field\.onChange\(parseInt\(e\.target\.value, 10\) \|\| 0\)\}\s*className="text-sm h-9 rounded-md sm:max-w-\[240px\] border-border shadow-xs"\s*\/>\s*<\/FormControl>\s*<div className="flex items-center gap-1 pt-1">\s*\{PRESETS\.map\(\(p\) => \(\s*<Button\s*key=\{p\.label\}\s*type="button"\s*variant=\{field\.value === p\.days \? "default" : "outline"\}\s*size="sm"\s*onClick=\{\(\) => field\.onChange\(p\.days\)\}\s*className="h-6 px-2 text-\[10px\] rounded-md"\s*>\s*\{p\.label\}\s*<\/Button>\s*\)\)\}\s*<\/div>/g;

content = content.replace(regex, (match, labelClass, iconTag, labelText, spanClass) => {
  return `<div className="flex items-center justify-between mb-2">
                  <FormLabel className="${labelClass}">
                    <${iconTag}>
                    <span>${labelText}</span>
                  </FormLabel>
                  <span className="${spanClass}">
                    ~{(field.value / 365).toFixed(1)} yrs
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={3650}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                      className="text-sm h-9 rounded-md w-24 border-border shadow-xs"
                    />
                  </FormControl>
                  <div className="flex items-center gap-1">
                    {PRESETS.map((p) => (
                      <Button
                        key={p.label}
                        type="button"
                        variant={field.value === p.days ? "default" : "outline"}
                        size="sm"
                        onClick={() => field.onChange(p.days)}
                        className="h-8 px-2.5 text-xs rounded-md font-medium shadow-xs"
                      >
                        {p.label}
                      </Button>
                    ))}
                  </div>
                </div>`;
});

fs.writeFileSync('RetentionPolicyCard.tsx', content);
console.log('Fixed RetentionPolicyCard');
