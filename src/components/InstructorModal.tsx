/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Instructor } from '../types';
import { X, Check } from 'lucide-react';

interface InstructorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (instructor: Omit<Instructor, 'id'> & { id?: string }) => void;
  instructor?: Instructor | null;
}

const PRESET_COLORS = [
  '#3b82f6', // Royal Blue
  '#10b981', // Emerald Green
  '#f97316', // Orange
  '#ec4899', // Pink
  '#a855f7', // Purple
  '#0d9488', // Teal
  '#eab308', // Amber
  '#ef4444', // Red
  '#6366f1', // Indigo
  '#14b8a6', // Turquoise
];

export default function InstructorModal({ isOpen, onClose, onSave, instructor }: InstructorModalProps) {
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (instructor) {
      setName(instructor.name);
      setSpecialty(instructor.specialty);
      setColor(instructor.color);
      setEmail(instructor.email || '');
      setPhone(instructor.phone || '');
    } else {
      setName('');
      setSpecialty('');
      setColor(PRESET_COLORS[0]);
      setEmail('');
      setPhone('');
    }
    setError('');
  }, [instructor, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome do instrutor é obrigatório.');
      return;
    }
    if (!specialty.trim()) {
      setError('A especialidade do instrutor é obrigatória.');
      return;
    }

    onSave({
      id: instructor?.id,
      name: name.trim(),
      specialty: specialty.trim(),
      color,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div 
        id="instructor-modal-container"
        className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">
            {instructor ? 'Editar Instrutor' : 'Cadastrar Novo Instrutor'}
          </h3>
          <button 
            id="close-instructor-modal-btn"
            onClick={onClose} 
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-600">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nome Completo <span className="text-rose-500">*</span>
              </label>
              <input
                id="instructor-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Carlos Silva"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                required
              />
            </div>

            {/* Especialidade */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Especialidade <span className="text-rose-500">*</span>
              </label>
              <input
                id="instructor-specialty-input"
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="Ex: Segurança do Trabalho, NR 35"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                E-mail (Opcional)
              </label>
              <input
                id="instructor-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: carlos.silva@empresa.com"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Telefone (Opcional)
              </label>
              <input
                id="instructor-phone-input"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: (11) 99999-9999"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            {/* Seletor de Cores */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Cor de Identificação no Calendário <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2.5 items-center">
                {PRESET_COLORS.map((preset) => (
                  <button
                    key={preset}
                    id={`color-preset-${preset.replace('#', '')}`}
                    type="button"
                    onClick={() => setColor(preset)}
                    style={{ backgroundColor: preset }}
                    className="group relative flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-white shadow-sm transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                  >
                    {color === preset && (
                      <Check className="h-4 w-4 stroke-[3px]" />
                    )}
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 rounded bg-slate-800 px-2 py-0.5 text-2xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100 whitespace-nowrap">
                      {preset}
                    </span>
                  </button>
                ))}
                
                {/* Custom Color Input */}
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 shadow-sm overflow-hidden hover:scale-110 active:scale-95 transition-transform">
                  <input
                    id="instructor-custom-color"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="absolute inset-0 h-12 w-12 -translate-x-2 -translate-y-2 cursor-pointer border-0 p-0"
                  />
                </div>
                <span className="text-xs text-slate-500 font-mono">{color}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              id="cancel-instructor-btn"
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              id="save-instructor-btn"
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 transition-colors"
            >
              Salvar Instrutor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
