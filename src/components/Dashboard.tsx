import React, { useMemo, useState } from 'react';
import { Training, Instructor, Location } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LabelList,
} from 'recharts';
import { MONTHS_PT } from '../utils/dateUtils';
import { Users, GraduationCap, MapPin, CalendarCheck, TrendingUp, CheckCircle, AlertTriangle, User, Clock } from 'lucide-react';

interface DashboardProps {
  trainings: Training[];
  instructors: Instructor[];
  locations: Location[];
}

export default function Dashboard({ trainings, instructors, locations }: DashboardProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // Extract unique months for filter
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    trainings.forEach(t => {
      months.add(t.startDate.substring(0, 7)); // YYYY-MM
    });
    return Array.from(months).sort().reverse();
  }, [trainings]);

  // Filter trainings by month
  const filteredTrainings = useMemo(() => {
    if (selectedMonth === 'all') return trainings;
    return trainings.filter(t => t.startDate.startsWith(selectedMonth));
  }, [trainings, selectedMonth]);

  // Metrics based on filter
  const totalTrainings = filteredTrainings.length;
  const now = new Date();
  const executedTrainings = filteredTrainings.filter(t => t.status !== 'cancelado' && new Date(t.endDate || t.startDate).getTime() < now.getTime()).length;
  const pendingTrainings = filteredTrainings.filter(t => t.status !== 'cancelado' && new Date(t.endDate || t.startDate).getTime() >= now.getTime()).length;
  const totalAttendees = filteredTrainings.reduce((acc, t) => acc + (t.attendeeCount || 0), 0);
  const totalInstructorsInvolved = new Set(filteredTrainings.map(t => t.instructorId).filter(Boolean)).size;

  const totalHours = useMemo(() => {
    return filteredTrainings.reduce((acc, t) => {
      const start = new Date(t.startDate).getTime();
      const end = new Date(t.endDate).getTime();
      if (!isNaN(start) && !isNaN(end) && end > start) {
        return acc + (end - start) / (1000 * 60 * 60);
      }
      return acc;
    }, 0);
  }, [filteredTrainings]);

  // Status Breakdown
  const statusCounts = useMemo(() => {
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
      { name: 'Pendentes / Agendados', value: pendentes, color: '#f59e0b' },
      { name: 'Cancelados', value: cancelados, color: '#94a3b8' },
    ];
  }, [filteredTrainings]);

  // Trainings per month (for Area Chart) - usually this is for the whole year, but let's keep it all-time/annual context
  const trainingsPerMonth = useMemo(() => {
    const counts = new Array(12).fill(0);
    trainings.forEach(t => {
      // For this chart, let's just show the year's evolution. If they select a month, maybe it's weird to show all? 
      // But "Evolução do Ano" implies all time. Let's use all trainings to show the trend always.
      const d = new Date(t.startDate);
      counts[d.getMonth()]++;
    });
    return counts.map((count, index) => ({
      name: MONTHS_PT[index].substring(0, 3).toUpperCase(),
      quantidade: count
    }));
  }, [trainings]);

  // Trainings per instructor
  const trainingsPerInstructor = useMemo(() => {
    const map = new Map<string, number>();
    filteredTrainings.forEach(t => {
      if (t.instructorId && t.status !== 'cancelado') {
        map.set(t.instructorId, (map.get(t.instructorId) || 0) + 1);
      }
    });
    return Array.from(map.entries())
      .map(([id, count]) => {
        const inst = instructors.find(i => i.id === id);
        return {
          name: inst ? inst.name : 'Desconhecido',
          quantidade: count,
          color: inst ? inst.color : '#8884d8'
        };
      })
      .sort((a, b) => b.quantidade - a.quantidade);
  }, [filteredTrainings, instructors]);

  const COLORS = ['#0ea5e9', '#8b5cf6', '#f43f5e', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#14b8a6'];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-y-auto custom-scrollbar p-5 sm:p-8">
      <div className="max-w-screen-2xl mx-auto w-full space-y-8">
        
        {/* Header and Filter */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 ">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight uppercase">Dashboard Gerencial</h1>
            <p className="text-slate-500 font-medium mt-1">Visão geral, indicadores e métricas de desempenho de treinamentos.</p>
          </div>
          <div className="w-full md:w-64">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mês de Referência</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Todo o Período</option>
              {availableMonths.map(m => {
                const [y, mo] = m.split('-');
                return <option key={m} value={m}>{`${mo}/${y}`}</option>;
              })}
            </select>
          </div>
        </div>

        {/* Top Highlight Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5">
          {/* Total Trainings */}
          <div className="bg-gradient-to-b from-white to-slate-50/50 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 p-6 flex flex-col relative overflow-hidden group hover:shadow-xl transition-shadow">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full transition-transform group-hover:scale-150 z-0" />
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md">
                <CalendarCheck className="h-6 w-6 stroke-[2]" />
              </div>
            </div>
            <div className="relative z-10">
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-black text-slate-900 tracking-tight">{totalTrainings}</p>
              </div>
              <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">Turmas Cadastradas</h3>
            </div>
          </div>

          {/* Executed Trainings */}
          <div className="bg-gradient-to-b from-white to-slate-50/50 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 p-6 flex flex-col relative overflow-hidden group hover:shadow-xl transition-shadow">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full transition-transform group-hover:scale-150 z-0" />
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-md">
                <CheckCircle className="h-6 w-6 stroke-[2]" />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-4xl font-black text-slate-900 tracking-tight">{executedTrainings}</p>
              <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">Acontecidos / Realizados</h3>
            </div>
          </div>

          {/* Pending Trainings */}
          <div className="bg-gradient-to-b from-white to-slate-50/50 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 p-6 flex flex-col relative overflow-hidden group hover:shadow-xl transition-shadow">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full transition-transform group-hover:scale-150 z-0" />
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-500 text-white rounded-xl shadow-md">
                <Clock className="h-6 w-6 stroke-[2]" />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-4xl font-black text-slate-900 tracking-tight">{pendingTrainings}</p>
              <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">Pendentes / Agendados</h3>
            </div>
          </div>

          {/* Total Attendees */}
          <div className="bg-gradient-to-b from-white to-slate-50/50 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 p-6 flex flex-col relative overflow-hidden group hover:shadow-xl transition-shadow">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full transition-transform group-hover:scale-150 z-0" />
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-md">
                <GraduationCap className="h-6 w-6 stroke-[2]" />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-4xl font-black text-slate-900 tracking-tight">{totalAttendees}</p>
              <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">Alunos Treinados</h3>
            </div>
          </div>

          {/* Total Instructors Involved */}
          <div className="bg-gradient-to-b from-white to-slate-50/50 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 p-6 flex flex-col relative overflow-hidden group hover:shadow-xl transition-shadow">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full transition-transform group-hover:scale-150 z-0" />
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="p-3 bg-rose-500 text-white rounded-xl shadow-md">
                <Users className="h-6 w-6 stroke-[2]" />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-4xl font-black text-slate-900 tracking-tight">{totalInstructorsInvolved}</p>
              <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">Instrutores Envolvidos</h3>
            </div>
          </div>

          {/* Total Hours */}
          <div className="bg-gradient-to-b from-white to-slate-50/50 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 p-6 flex flex-col relative overflow-hidden group hover:shadow-xl transition-shadow">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full transition-transform group-hover:scale-150 z-0" />
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-500 text-white rounded-xl shadow-md">
                <Clock className="h-6 w-6 stroke-[2]" />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-4xl font-black text-slate-900 tracking-tight">
                {totalHours > 0 ? (totalHours % 1 === 0 ? totalHours : totalHours.toFixed(1)) : 0}<span className="text-xl">h</span>
              </p>
              <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">Horas de Treinamento</h3>
            </div>
          </div>
        </div>

        {/* Charts Section 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Chart - Trainings over time */}
          <div className="bg-gradient-to-b from-white to-slate-50/50 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 p-6 lg:col-span-2 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-black text-slate-800 uppercase tracking-wide">Evolução de Treinamentos (Ano - Todos)</h3>
            </div>
            <div className="flex-1 min-h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trainingsPerMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTreinamentos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 700}} dy={10} />
                  <YAxis tickLine={false} axisLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 700}} />
                  <Tooltip 
                    cursor={{stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                    itemStyle={{ color: '#0f172a', fontWeight: 900 }}
                  />
                  <Area type="monotone" dataKey="quantidade" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorTreinamentos)" />
                    <LabelList dataKey="quantidade" position="top" fill="#2563eb" fontSize={11} fontWeight="bold" formatter={(value) => value > 0 ? value : ''} />

                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Column: Status Breakdown */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            
            {/* Status Breakdown */}
            <div className="bg-gradient-to-b from-white to-slate-50/50 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 p-6 flex-1">
              <h3 className="text-base font-black text-slate-800 uppercase tracking-wide mb-6">Status ({selectedMonth === 'all' ? 'Geral' : 'do Mês'})</h3>
              <div className="h-48 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusCounts}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusCounts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 800 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text for Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black text-slate-900 leading-none">{totalTrainings}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                </div>
              </div>
              
              {/* Custom Legend */}
              <div className="mt-4 flex flex-col gap-2">
                {statusCounts.map((s) => (
                  <div key={s.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="font-bold text-slate-600">{s.name}</span>
                    </div>
                    <span className="font-black text-slate-900">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Charts Section 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Distribution by Instructor */}
          <div className="bg-gradient-to-b from-white to-slate-50/50 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 p-6">
            <h3 className="text-base font-black text-slate-800 uppercase tracking-wide mb-6">Distribuição por Instrutor ({selectedMonth === 'all' ? 'Geral' : 'no Mês'})</h3>
            <div className="h-64 w-full">
              {trainingsPerInstructor.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trainingsPerInstructor} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" tickLine={false} axisLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                    <YAxis dataKey="name" type="category" width={110} tickLine={false} axisLine={false} tick={{fill: '#475569', fontSize: 11, fontWeight: 700}} />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="quantidade" radius={[0, 4, 4, 0]} barSize={20}>
                    <LabelList dataKey="quantidade" position="right" fill="#64748b" fontSize={11} fontWeight="bold" formatter={(value) => value > 0 ? value : ''} />

                      {trainingsPerInstructor.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm font-semibold">Nenhum dado disponível</div>
              )}
            </div>
          </div>

          {/* Trainings List */}
          <div className="bg-gradient-to-b from-white to-slate-50/50 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-slate-800 uppercase tracking-wide">
                {selectedMonth === 'all' ? 'Próximos Agendamentos' : 'Agendamentos do Mês'}
              </h3>
            </div>
            
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
              {filteredTrainings.length > 0 ? (
                // Only show upcoming in "all" view, or show the month's trainings in month view
                (selectedMonth === 'all' 
                  ? filteredTrainings.filter(t => new Date(t.startDate) >= new Date() && t.status !== 'cancelado').slice(0, 5)
                  : filteredTrainings
                ).map(t => {
                  const date = new Date(t.startDate);
                  const inst = instructors.find(i => i.id === t.instructorId);
                  
                  return (
                    <div key={t.id} className="flex items-center p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                      <div className="bg-blue-100 text-blue-700 font-black text-center rounded-lg p-2 min-w-[50px]">
                        <div className="text-xs uppercase">{MONTHS_PT[date.getMonth()].substring(0,3)}</div>
                        <div className="text-lg leading-none">{date.getDate()}</div>
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate" title={t.title}>{t.title}</h4>
                        <div className="flex items-center text-xs text-slate-500 mt-1 gap-2">
                          <span className="flex items-center gap-1 font-semibold truncate max-w-[120px]">
                            <User className="h-3 w-3" /> {inst ? inst.name : 'ND'}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center gap-1 font-semibold">
                            <Clock className="h-3 w-3" /> 
                            {t.startDate.split('T')[1].substring(0,5)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-2">
                        {t.status === 'cancelado' ? (
                          <AlertTriangle className="h-5 w-5 text-slate-400" />
                        ) : new Date(t.endDate || t.startDate).getTime() < new Date().getTime() ? (
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-amber-500" />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <CalendarCheck className="h-8 w-8 opacity-20" />
                  <p className="text-sm font-semibold">Nenhum treinamento encontrado.</p>
                </div>
              )}
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
