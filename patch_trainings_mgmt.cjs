const fs = require('fs');
let code = fs.readFileSync('src/components/TrainingsManagement.tsx', 'utf8');

// Insert headers in CSV
code = code.replace(/const headers = \['Titulo', 'Instrutor', 'Especialidade', 'Local', 'Tipo Local', 'Data Inicio', 'Hora Inicio', 'Hora Termino', 'Status', 'Descricao'\];/, "const headers = ['Titulo', 'Instrutor', 'Especialidade', 'Local', 'Tipo Local', 'Data Inicio', 'Hora Inicio', 'Hora Termino', 'Participantes', 'Status', 'Descricao'];");

// Insert row map in CSV
code = code.replace(/timeParts\[1\] \|\| '',\n\s+t\.status,\n\s+t\.description \|\| ''/g, "timeParts[1] || '',\n        t.attendeeCount ?? '',\n        t.status,\n        t.description || ''");

// Insert column header
code = code.replace(/<th className="px-5 py-3\.5">Status<\/th>/, '<th className="px-5 py-3.5">Participantes</th>\n                  <th className="px-5 py-3.5">Status</th>');

// Insert cell
code = code.replace(/\{\/\* Status \*\/\}/, `{/* Participantes */}
                      <td className="px-5 py-4 whitespace-nowrap text-center text-sm font-medium text-slate-700">
                        {t.attendeeCount ? (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200">
                            <Users className="h-3.5 w-3.5 text-slate-400" />
                            {t.attendeeCount}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                      {/* Status */}`);

fs.writeFileSync('src/components/TrainingsManagement.tsx', code);
console.log("Patched trainings mgmt");
