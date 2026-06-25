/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Instructor, Training } from '../types';
import { Plus, Edit3, Trash2, Mail, Phone, Award, Calendar, Users } from 'lucide-react';

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
  
  // Calculate how many trainings are assigned to each instructor
  const getTrainingCount = (instId: string) => {
    return trainings.filter((t) => t.instructorId === instId).length;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* View Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Cadastro de Instrutores
          </h1>
          <p className="text-sm text-slate-500">
            Gerencie o corpo docente, especialidades e cores de visualização do calendário.
          </p>
        </div>
        <button
          id="mgmt-add-instructor-btn"
          onClick={onAddInstructorClick}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-100 hover:bg-blue-700 hover:shadow-blue-200 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5 stroke-[2.5]" />
          Novo Instrutor
        </button>
      </div>

      {/* Quick Statistics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total de Instrutores</span>
            <span className="text-xl font-black text-slate-800">{instructors.length}</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Especialidades Ativas</span>
            <span className="text-xl font-black text-slate-800">
              {new Set(instructors.map((i) => i.specialty)).size}
            </span>
          </div>
        </div>
      </div>

      {/* Instructors Grid */}
      {instructors.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
          <div className="rounded-full bg-slate-100 p-4 text-slate-400 mb-3">
            <Users className="h-8 w-8" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">Nenhum instrutor cadastrado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Adicione instrutores ao sistema para poder vinculá-los às sessões de treinamentos.
          </p>
          <button
            id="empty-add-instructor-btn"
            onClick={onAddInstructorClick}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer"
          >
            Adicionar Primeiro Instrutor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {instructors.map((inst) => {
            const count = getTrainingCount(inst.id);
            return (
              <div
                key={inst.id}
                id={`instructor-card-${inst.id}`}
                className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                {/* Accent Color Band */}
                <div 
                  style={{ backgroundColor: inst.color }}
                  className="h-1.5 w-full"
                />

                {/* Card Content */}
                <div className="p-5 flex-1">
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="truncate">
                      <h3 className="font-extrabold text-slate-900 text-base truncate flex items-center gap-2">
                        <span 
                          style={{ backgroundColor: inst.color }}
                          className="h-3 w-3 rounded-full flex-shrink-0"
                        />
                        {inst.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-semibold">
                        <Award className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{inst.specialty}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact details */}
                  <div className="space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                    {inst.email ? (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <span className="truncate font-medium">{inst.email}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-400 italic">
                        <Mail className="h-4 w-4 text-slate-300 flex-shrink-0" />
                        <span>E-mail não cadastrado</span>
                      </div>
                    )}

                    {inst.phone ? (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <span className="font-medium">{inst.phone}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-400 italic">
                        <Phone className="h-4 w-4 text-slate-300 flex-shrink-0" />
                        <span>Telefone não cadastrado</span>
                      </div>
                    )}

                    {/* Stats inside card */}
                    <div className="flex items-center gap-2 border-t border-slate-100 pt-3 mt-1.5 text-xs">
                      <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <span className="font-semibold text-slate-700">
                        {count === 0 
                          ? 'Sem treinamentos agendados' 
                          : `${count} ${count === 1 ? 'treinamento associado' : 'treinamentos associados'}`
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 flex items-center justify-end gap-2.5">
                  <button
                    id={`edit-inst-${inst.id}`}
                    onClick={() => onEditInstructorClick(inst)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Editar
                  </button>
                  <button
                    id={`delete-inst-${inst.id}`}
                    onClick={() => {
                      if (confirm(`Tem certeza de que deseja excluir o instrutor "${inst.name}"? Isso não removerá os treinamentos, mas eles perderão o vínculo.`)) {
                        onDeleteInstructor(inst.id);
                      }
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Excluir
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
