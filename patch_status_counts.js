const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');
code = code.replace(/const statusCounts = useMemo\(\(\) => {[\s\S]*?\}, \[filteredTrainings\]\);/, `const statusCounts = useMemo(() => {
    let realizados = 0;
    let pendentes = 0;
    let cancelados = 0;
    
    const now = new Date();
    
    filteredTrainings.forEach(t => {
      if (t.status === 'cancelado') {
        cancelados++;
      } else {
        const endDate = new Date(t.endDate || t.startDate);
        if (endDate.getTime() < now.getTime()) {
          realizados++;
        } else {
          pendentes++;
        }
      }
    });
    
    return [
      { name: 'Realizados', value: realizados, color: '#10b981' },
      { name: 'Pendentes/Agendados', value: pendentes, color: '#f59e0b' },
      { name: 'Cancelados', value: cancelados, color: '#94a3b8' },
    ];
  }, [filteredTrainings]);`);
fs.writeFileSync('src/components/Dashboard.tsx', code);
