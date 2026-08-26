import React, { useMemo } from 'react';
import { Training, Instructor, Location } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';
import { MONTHS_PT } from '../utils/dateUtils';
import { Users, GraduationCap, MapPin, CalendarCheck, TrendingUp, CheckCircle, AlertTriangle, XCircle, ChevronRight, User, Clock } from 'lucide-react';

interface DashboardProps {
  trainings: Training[];
  instructors: Instructor[];
  locations: Location[];
}

export default function Dashboard({ trainings, instructors, locations }: DashboardProps) {
  
  // Basic Counts
  const totalTrainings = trainings.length;
  const totalInstructors = instructors.length;
  const totalLocations = locations.length;

  // New: Total Attendees (Alunos/Colaboradores)
  const totalAttendees = useMemo(() => {
    return trainings.reduce((acc, t) => acc + (t.attendeeCount || 0), 0);
  }, [trainings]);

  // Status Breakdown
  const statusCounts = useMemo(() => {
    let confirmado = 0;
    let aguardando = 0;
    let cancelado = 0;
    
    trainings.forEach(t => {
      if (t.status === 'confirmado') confirmado++;
      if (t.status === 'aguardando') aguardando++;
      if (t.status === 'cancelado') cancelado++;
    });
    
    return [
      { name: 'Confirmado', value: confirmado, color: '#10b981' }, // Emerald-500
      { name: 'Aguardando', value: aguardando, color: '#f59e0b' }, // Amber-500
      { name: 'Cancelado', value: cancelado, color: '#94a3b8' },  // Slate-400
    ];
  }, [trainings]);

  // Trainings per month (for Area Chart)
  const trainingsPerMonth = useMemo(() => {
    const counts = new Array(12).fill(0);
    trainings.forEach(t => {
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
    trainings.forEach(t => {
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
  }, [trainings, instructors]);

  // Upcoming trainings (Next 30 days)
  const upcomingTrainings = useMemo(() => {
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setDate(now.getDate() + 30);
    
    return trainings
      .filter(t => {
        if (t.status === 'cancelado') return false;
        const d = new Date(t.startDate);
        return d >= now && d <= nextMonth;
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 5); // Limit to top 5
  }, [trainings]);

  const COLORS = ['#0ea5e9', '#8b5cf6', '#f43f5e', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#14b8a6'];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-y-auto custom-scrollbar p-5 sm:p-8">
      <div className="max-w-screen-2xl mx-auto w-full space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">Dashboard Gerencial</h1>
            <p className="text-slate-500 font-medium mt-1">Visão geral, indicadores e métricas de desempenho de treinamentos.</p>
          </div>
        </div>

        {/* Top Highlight Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Trainings */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 p-5 flex flex-col relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full transition-transform group-hover:scale-150 z-0" />
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md">
                <CalendarCheck className="h-6 w-6 stroke-[2]" />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> All Time
              </span>
            </div>
            <div className="relative z-10">
              <p className="text-4xl font-black text-slate-900 tracking-tight">{totalTrainings}</p>
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mt-1">Total de Turmas</h3>
            </div>
          </div>

          {/* Total Attendees */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 p-5 flex flex-col relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full transition-transform group-hover:scale-150 z-0" />
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-md">
                <GraduationCap className="h-6 w-6 stroke-[2]" />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-4xl font-black text-slate-900 tracking-tight">{totalAttendees}</p>
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mt-1">Alunos Treinados</h3>
            </div>
          </div>

          {/* Total Instructors */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 p-5 flex flex-col relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full transition-transform group-hover:scale-150 z-0" />
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="p-3 bg-rose-500 text-white rounded-xl shadow-md">
                <Users className="h-6 w-6 stroke-[2]" />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-4xl font-black text-slate-900 tracking-tight">{totalInstructors}</p>
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mt-1">Equipe de Instrutores</h3>
            </div>
          </div>

          {/* Total Locations */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 p-5 flex flex-col relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full transition-transform group-hover:scale-150 z-0" />
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-500 text-white rounded-xl shadow-md">
                <MapPin className="h-6 w-6 stroke-[2]" />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-4xl font-black text-slate-900 tracking-tight">{totalLocations}</p>
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mt-1">Locais / Ambientes</h3>
            </div>
          </div>
        </div>

        {/* Charts Section 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Chart - Trainings over time */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 lg:col-span-2 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-black text-slate-800 uppercase tracking-wide">Evolução de Treinamentos (Ano)</h3>
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
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Column: Status Breakdown & Upcoming */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            
            {/* Status Breakdown */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 flex-1">
              <h3 className="text-base font-black text-slate-800 uppercase tracking-wide mb-6">Status dos Agendamentos</h3>
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
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <h3 className="text-base font-black text-slate-800 uppercase tracking-wide mb-6">Distribuição por Instrutor (Realizados)</h3>
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

          {/* Upcoming Trainings List */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-slate-800 uppercase tracking-wide">Próximos Agendamentos (30 dias)</h3>
            </div>
            
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
              {upcomingTrainings.length > 0 ? (
                upcomingTrainings.map(t => {
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
                        {t.status === 'confirmado' ? (
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <CalendarCheck className="h-8 w-8 opacity-20" />
                  <p className="text-sm font-semibold">Nenhum treinamento agendado para os próximos 30 dias.</p>
                </div>
              )}
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
