import React, { useMemo } from 'react';
import { Training, Instructor, Location } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { MONTHS_PT } from '../utils/dateUtils';

interface DashboardProps {
  trainings: Training[];
  instructors: Instructor[];
  locations: Location[];
}

export default function Dashboard({ trainings, instructors, locations }: DashboardProps) {
  // 1. Trainings per month
  const trainingsPerMonth = useMemo(() => {
    const counts = new Array(12).fill(0);
    trainings.forEach(t => {
      const d = new Date(t.startDate);
      counts[d.getMonth()]++;
    });
    return counts.map((count, index) => ({
      name: MONTHS_PT[index].substring(0, 3), // e.g. "Jan", "Fev"
      quantidade: count
    }));
  }, [trainings]);

  // 2. Trainings per instructor
  const trainingsPerInstructor = useMemo(() => {
    const map = new Map<string, number>();
    trainings.forEach(t => {
      if (t.instructorId) {
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

  // 3. Locations Capacity
  const locationsCapacity = useMemo(() => {
    return locations
      .filter(l => l.capacity && l.capacity > 0)
      .map(l => ({
        name: l.name,
        capacidade: l.capacity || 0
      }))
      .sort((a, b) => b.capacidade - a.capacidade)
      .slice(0, 10); // Top 10 by capacity
  }, [locations]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff7300', '#413ea0', '#f50057'];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto w-full space-y-8">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Gerencial</h1>
            <p className="text-slate-500 mt-1">Visão geral e métricas de treinamentos</p>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Treinamentos</h3>
            <p className="text-4xl font-black text-slate-900">{trainings.length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Instrutores</h3>
            <p className="text-4xl font-black text-slate-900">{instructors.length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Locais</h3>
            <p className="text-4xl font-black text-slate-900">{locations.length}</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Bar Chart - Trainings per month */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Treinamentos por Mês</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trainingsPerMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis tickLine={false} axisLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}} 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="quantidade" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart - Distribution by Instructor */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Distribuição por Instrutor</h3>
            <div className="h-80 w-full">
              {trainingsPerInstructor.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={trainingsPerInstructor}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="quantidade"
                    >
                      {trainingsPerInstructor.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">Nenhum dado disponível</div>
              )}
            </div>
          </div>

          {/* Bar Chart - Top Locations by Capacity */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:col-span-2">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Capacidade dos Principais Locais</h3>
            <div className="h-80 w-full">
              {locationsCapacity.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={locationsCapacity} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" tickLine={false} axisLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <YAxis dataKey="name" type="category" width={150} tickLine={false} axisLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <Tooltip 
                      cursor={{fill: '#f1f5f9'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="capacidade" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">Nenhum local com capacidade informada</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
