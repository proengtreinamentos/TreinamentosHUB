const fs = require('fs');
let code = fs.readFileSync('src/components/InteractiveCalendarView.tsx', 'utf8');

const target = `<span className={\`truncate font-black text-[11px] sm:text-[12px] leading-tight \${
                              isCanceled ? 'line-through text-slate-400' : 'text-slate-900'
                            }\`}>
                              {t.title}
                            </span>
                          </div>`;

const replacement = `<span className={\`truncate font-black text-[11px] sm:text-[12px] leading-tight flex-1 \${
                              isCanceled ? 'line-through text-slate-400' : 'text-slate-900'
                            }\`}>
                              {t.title}
                            </span>
                            {t.attendeeCount && t.attendeeCount > 0 && (
                              <span className="flex-shrink-0 bg-slate-200 text-slate-700 text-[9px] font-black px-1.5 py-0.5 rounded-full border border-slate-300 shadow-2xs" title={\`\${t.attendeeCount} alunos cadastrados\`}>
                                {t.attendeeCount}
                              </span>
                            )}
                          </div>`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/components/InteractiveCalendarView.tsx', code);
    console.log("Patched successfully");
} else {
    console.log("Target not found");
}
