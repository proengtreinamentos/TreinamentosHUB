const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// The area chart label list:
// It previously had `<LabelList dataKey="count"` because I failed to replace correctly.
// Let's just find the Area and Bar and replace them cleanly.

code = code.replace(/<LabelList dataKey="count".*?\/>/g, "");

code = code.replace(/<Area type="monotone" dataKey="quantidade"[^>]+>/, `$&
                    <LabelList dataKey="quantidade" position="top" fill="#2563eb" fontSize={11} fontWeight="bold" formatter={(value) => value > 0 ? value : ''} />
`);

code = code.replace(/<Bar dataKey="quantidade"[^>]*>/, `$&
                    <LabelList dataKey="quantidade" position="right" fill="#64748b" fontSize={11} fontWeight="bold" formatter={(value) => value > 0 ? value : ''} />
`);

fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log("Patched charts");
