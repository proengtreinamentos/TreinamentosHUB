/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Instructor, Training } from '../types';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Mail, 
  Phone, 
  Award, 
  Calendar, 
  Users, 
  LayoutGrid, 
  List, 
  Search, 
  BookOpen
} from 'lucide-react';

interface InstructorsManagementProps {
  instructors: Instructor[];
  trainings: Training[];
  onAddInstructorClick: () => void;
  onEditInstructorClick: (instructor: Instructor) => void;
  onDeleteInstructor: (id: string) => void;
}

export default function InstructorsManagement({
  instructors,
  trainings,
  onAddInstructorClick,
  onEditInstructorClick,
  onDeleteInstructor,
}: InstructorsManagementProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');

  // Calculate training count per instructor
  const getTrainingCount = (instId: string) => {
    return trainings.filter((t) => t.instructorId === instId).length;
  };

  // Filter instructors by search
  const deferredSearch = React.useDeferredValue(search);
  const filteredInstructors = useMemo(() => {
    if (!deferredSearch.trim()) return instructors;
    const q = deferredSearch.toLowerCase();
    return instructors.filter(
      (inst) =>
        inst.name.toLowerCase().includes(q) ||
        inst.specialty.toLowerCase().includes(q) ||
        (inst.email || '').toLowerCase().includes(q) ||
        (inst.phone || '').includes(q)
    );
  }, [instructors, deferredSearch]);

  const totalSpecialties = useMemo(() => {
    return new Set(instructors.map((i) => i.specialty.trim())).size;
  }, [instructors]);

  return (
    <div className="flex flex-col h-full w-full max-w-none p-4 sm:p-6 space-y-6 overflow-y-auto custom-scrollbar">
      {/* View Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Users className="h-7 w-7 text-blue-600" />
            Cadastro de Instrutores
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie o corpo docente, especialidades e paleta de cores do calendário interativo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle Switch */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              id="view-grid-inst-btn"
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span>Blocos</span>
            </button>
            <button
              id="view-list-inst-btn"
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="h-4 w-4" />
              <span>Lista</span>
            </button>
          </div>

          <button
            id="mgmt-add-instructor-btn"
            onClick={onAddInstructorClick}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            Novo Instrutor
          </button>
        </div>
      </div>

      {/* Quick Statistics Row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex items-center gap-4">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider block">Total Cadastrado</span>
            <span className="text-2xl font-black text-slate-800">{instructors.length}</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex items-center gap-4">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider block">Especialidades Ativas</span>
            <span className="text-2xl font-black text-slate-800">{totalSpecialties}</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex items-center gap-4">
          <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider block">Total de Treinamentos</span>
            <span className="text-2xl font-black text-slate-800">{trainings.length}</span>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs flex items-center gap-3">
        <Search className="h-4 w-4 text-slate-400 flex-shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar instrutor por nome, especialidade, e-mail ou telefone..."
          className="w-full text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-xs text-slate-400 hover:text-slate-600 font-bold"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Content Rendering based on viewMode */}
      {filteredInstructors.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
          <div className="rounded-full bg-slate-100 p-4 text-slate-400 mb-3">
            <Users className="h-8 w-8" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">Nenhum instrutor localizado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            {search ? 'Tente ajustar os termos da busca.' : 'Adicione instrutores ao sistema para poder vinculá-los às sessões do calendário.'}
          </p>
          {!search && (
            <button
              id="empty-add-instructor-btn"
              onClick={onAddInstructorClick}
              className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer shadow-md shadow-blue-100"
            >
              Adicionar Primeiro Instrutor
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID / BLOCO VIEW */
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredInstructors.map((inst) => {
            const count = getTrainingCount(inst.id);
            return (
              <div
                key={inst.id}
                id={`instructor-card-${inst.id}`}
                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
              >
                {/* Accent Color Band */}
                <div 
                  style={{ backgroundColor: inst.color }}
                  className="h-2 w-full"
                />

                {/* Card Content */}
                <div className="p-4 flex-1">
                  {/* Name & Specialty Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-slate-900 text-sm truncate flex items-center gap-2" title={inst.name}>
                        <span 
                          style={{ backgroundColor: inst.color }}
                          className="h-3 w-3 rounded-full flex-shrink-0 shadow-xs"
                        />
                        <span className="truncate">{inst.name}</span>
                      </h3>
                      <div className="flex items-center gap-1.5 text-2xs text-slate-500 mt-1 font-semibold" title={inst.specialty}>
                        <Award className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{inst.specialty}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact details */}
                  <div className="space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2 text-2xs">
                      <Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      {inst.email ? (
                        <span className="truncate font-medium text-slate-700" title={inst.email}>{inst.email}</span>
                      ) : (
                        <span className="text-slate-400 italic">E-mail não informado</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-2xs">
                      <Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      {inst.phone ? (
                        <span className="font-medium text-slate-700">{inst.phone}</span>
                      ) : (
                        <span className="text-slate-400 italic">Telefone não informado</span>
                      )}
                    </div>

                    {/* Stats inside card */}
                    <div className="flex items-center gap-2 border-t border-slate-100 pt-2.5 mt-2 text-2xs">
                      <Calendar className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                      <span className="font-bold text-slate-700">
                        {count === 0 
                          ? 'Nenhum treinamento' 
                          : `${count} ${count === 1 ? 'treinamento' : 'treinamentos'}`
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-2.5 flex items-center justify-end gap-2">
                  <button
                    id={`edit-inst-${inst.id}`}
                    onClick={() => onEditInstructorClick(inst)}
                    className="flex items-center gap-1.5 text-2xs font-bold text-slate-600 hover:text-blue-600 transition-colors p-1 rounded-md hover:bg-white cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Editar
                  </button>
                  <button
                    id={`delete-inst-${inst.id}`}
                    onClick={() => onDeleteInstructor(inst.id)}
                    className="flex items-center gap-1.5 text-2xs font-bold text-rose-600 hover:text-rose-800 transition-colors p-1 rounded-md hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST / TABELA VIEW */
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 text-xs font-extrabold uppercase tracking-wider select-none">
                  <th className="px-5 py-3.5">Cor</th>
                  <th className="px-5 py-3.5">Nome do Instrutor</th>
                  <th className="px-5 py-3.5">Especialidades</th>
                  <th className="px-5 py-3.5">E-mail</th>
                  <th className="px-5 py-3.5">Telefone</th>
                  <th className="px-5 py-3.5">Treinamentos</th>
                  <th className="px-5 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInstructors.map((inst) => {
                  const count = getTrainingCount(inst.id);
                  return (
                    <tr 
                      key={inst.id}
                      id={`instructor-row-${inst.id}`}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span 
                          style={{ backgroundColor: inst.color }}
                          className="h-4 w-4 rounded-full block shadow-xs ring-2 ring-white"
                        />
                      </td>

                      <td className="px-5 py-4 font-extrabold text-slate-900 text-sm">
                        {inst.name}
                      </td>

                      <td className="px-5 py-4 text-xs font-semibold text-slate-700 max-w-xs truncate">
                        {inst.specialty}
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-600">
                        {inst.email || <span className="text-slate-300 italic">-</span>}
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-600 whitespace-nowrap">
                        {inst.phone || <span className="text-slate-300 italic">-</span>}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-2xs font-bold text-blue-700">
                          {count}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            id={`edit-inst-list-${inst.id}`}
                            onClick={() => onEditInstructorClick(inst)}
                            title="Editar instrutor"
                            className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors p-1.5 rounded-lg cursor-pointer"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            id={`delete-inst-list-${inst.id}`}
                            onClick={() => onDeleteInstructor(inst.id)}
                            title="Excluir instrutor"
                            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors p-1.5 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
