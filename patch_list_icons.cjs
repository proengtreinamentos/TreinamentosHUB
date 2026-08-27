const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');
code = code.replace(/<div className="ml-2">\s*\{t\.status === 'confirmado' \? \([\s\S]*?\) : t\.status === 'cancelado' \? \([\s\S]*?\) : \([\s\S]*?\)\}\s*<\/div>/, `<div className="ml-2">
                        {t.status === 'cancelado' ? (
                          <AlertTriangle className="h-5 w-5 text-slate-400" />
                        ) : new Date(t.endDate || t.startDate).getTime() < new Date().getTime() ? (
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-amber-500" />
                        )}
                      </div>`);
fs.writeFileSync('src/components/Dashboard.tsx', code);
