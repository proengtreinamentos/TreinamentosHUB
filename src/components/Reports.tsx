import React, { useState, useMemo } from 'react';
import { Training, Instructor, Location } from '../types';
import { formatDateString, formatTimeString } from '../utils/dateUtils';
import { Printer } from 'lucide-react';

interface ReportsProps {
  trainings: Training[];
  instructors: Instructor[];
  locations: Location[];
}

export default function Reports({ trainings, instructors, locations }: ReportsProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedInstructor, setSelectedInstructor] = useState<string>('all');
  
  const instructorsMap = useMemo(() => new Map(instructors.map(i => [i.id, i])), [instructors]);
  const locationsMap = useMemo(() => new Map(locations.map(l => [l.id, l])), [locations]);

  // Extract unique months from trainings for filter
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    trainings.forEach(t => {
      // YYYY-MM
      months.add(t.startDate.substring(0, 7));
    });
    return Array.from(months).sort();
  }, [trainings]);

  const filteredTrainings = useMemo(() => {
    return trainings.filter(t => {
      const monthMatch = selectedMonth === 'all' || t.startDate.startsWith(selectedMonth);
      const instructorMatch = selectedInstructor === 'all' || t.instructorId === selectedInstructor;
      return monthMatch && instructorMatch;
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [trainings, selectedMonth, selectedInstructor]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto print:bg-white print:overflow-visible">
      {/* Controls Area (Hidden on Print) */}
      <div className="p-4 md:p-8 print:hidden border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-end justify-between">
          
          <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Filtrar por Mês</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Todos os Meses</option>
                {availableMonths.map(m => {
                  const [y, mo] = m.split('-');
                  return <option key={m} value={m}>{`${mo}/${y}`}</option>;
                })}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Filtrar por Instrutor</label>
              <select
                value={selectedInstructor}
                onChange={(e) => setSelectedInstructor(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Todos os Instrutores</option>
                {instructors.map(i => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Printer className="h-5 w-5" />
            Imprimir Relatório
          </button>
        </div>
      </div>

      {/* Print View Area */}
      <div className="p-4 md:p-8 print:p-0 print:m-0 w-full max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 print:border-none print:shadow-none print:p-0">
          
          {/* Print Header */}
          <div className="mb-8 border-b pb-4 print:border-black">
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 print:text-black">
              PRO<span className="text-red-600 print:text-black">ENG</span>
            </h1>
            <h2 className="text-xl font-bold text-slate-700 mt-2 print:text-black">Relatório de Treinamentos</h2>
            <div className="text-sm text-slate-500 mt-1 print:text-black">
              {selectedMonth !== 'all' ? `Referência: ${selectedMonth.split('-').reverse().join('/')}` : 'Período Completo'}
              {selectedInstructor !== 'all' && ` | Instrutor: ${instructorsMap.get(selectedInstructor)?.name}`}
            </div>
            <div className="text-sm text-slate-500 print:text-black mt-1">
              Total de Registros: {filteredTrainings.length}
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-left border-collapse print:text-xs">
              <thead>
                <tr className="border-b-2 border-slate-200 print:border-black">
                  <th className="pb-3 pt-2 px-2 font-bold text-slate-700 uppercase text-xs print:text-black">Data/Hora</th>
                  <th className="pb-3 pt-2 px-2 font-bold text-slate-700 uppercase text-xs print:text-black">Treinamento</th>
                  <th className="pb-3 pt-2 px-2 font-bold text-slate-700 uppercase text-xs print:text-black">Instrutor</th>
                  <th className="pb-3 pt-2 px-2 font-bold text-slate-700 uppercase text-xs print:text-black">Local</th>
                  <th className="pb-3 pt-2 px-2 font-bold text-slate-700 uppercase text-xs print:text-black">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 print:divide-black/20">
                {filteredTrainings.map(t => {
                  const inst = t.instructorId ? instructorsMap.get(t.instructorId) : undefined;
                  const loc = t.locationId ? locationsMap.get(t.locationId) : undefined;
                  
                  return (
                    <tr key={t.id} className="hover:bg-slate-50 print:hover:bg-transparent">
                      <td className="py-3 px-2 align-top print:py-1">
                        <div className="font-medium text-slate-900 print:text-black whitespace-nowrap">{formatDateString(t.startDate)}</div>
                        <div className="text-xs text-slate-500 print:text-black whitespace-nowrap">{formatTimeString(t.startDate)} - {formatTimeString(t.endDate)}</div>
                      </td>
                      <td className="py-3 px-2 align-top print:py-1">
                        <div className="font-semibold text-slate-800 print:text-black">{t.title}</div>
                        {t.description && <div className="text-xs text-slate-500 print:text-black line-clamp-1">{t.description}</div>}
                      </td>
                      <td className="py-3 px-2 align-top print:py-1 text-sm text-slate-700 print:text-black">
                        {inst ? inst.name : 'N/A'}
                      </td>
                      <td className="py-3 px-2 align-top print:py-1 text-sm text-slate-700 print:text-black">
                        {loc ? loc.name : 'N/A'}
                      </td>
                      <td className="py-3 px-2 align-top print:py-1 text-sm print:text-black">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium 
                          ${t.status === 'confirmado' ? 'bg-emerald-50 text-emerald-700 print:bg-transparent print:border print:border-black' : 
                            t.status === 'aguardando' ? 'bg-amber-50 text-amber-700 print:bg-transparent print:border print:border-black' : 
                            'bg-red-50 text-red-700 print:bg-transparent print:border print:border-black'}`}
                        >
                          {t.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filteredTrainings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 print:text-black">
                      Nenhum treinamento encontrado para os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Print Footer */}
          <div className="hidden print:block mt-8 pt-4 border-t border-black text-xs text-center">
            Gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')} pelo sistema PROENG.
          </div>

        </div>
      </div>
    </div>
  );
}
