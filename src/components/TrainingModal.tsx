/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Training, Instructor, Location, TrainingStatus } from '../types';
import { X, Calendar, Clock, User, MapPin, AlignLeft, Info } from 'lucide-react';

interface TrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (training: Omit<Training, 'id'> & { id?: string }) => void;
  training?: Training | null;
  instructors: Instructor[];
  locations: Location[];
  defaultDate?: string; // Format: YYYY-MM-DD
}

export default function TrainingModal({
  isOpen,
  onClose,
  onSave,
  training,
  instructors,
  locations,
  defaultDate,
}: TrainingModalProps) {
  const [title, setTitle] = useState('');
  const [instructorId, setInstructorId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<TrainingStatus>('confirmado');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (training) {
      setTitle(training.title);
      setInstructorId(training.instructorId);
      setLocationId(training.locationId);
      setStartDate(training.startDate);
      setEndDate(training.endDate);
      setStatus(training.status);
      setDescription(training.description || '');
    } else {
      setTitle('');
      setInstructorId(instructors[0]?.id || '');
      setLocationId(locations[0]?.id || '');
      
      const targetDate = defaultDate || new Date().toISOString().split('T')[0];
      setStartDate(`${targetDate}T08:00`);
      setEndDate(`${targetDate}T12:00`);
      
      setStatus('confirmado');
      setDescription('');
    }
    setError('');
  }, [training, isOpen, defaultDate, instructors, locations]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('O título do treinamento é obrigatório.');
      return;
    }
    if (!instructorId) {
      setError('É necessário selecionar um instrutor.');
      return;
    }
    if (!locationId) {
      setError('É necessário selecionar um local.');
      return;
    }
    if (!startDate) {
      setError('A data e hora de início são obrigatórias.');
      return;
    }
    if (!endDate) {
      setError('A data e hora de término são obrigatórias.');
      return;
    }

    const startMs = new Date(startDate).getTime();
    const endMs = new Date(endDate).getTime();

    if (endMs <= startMs) {
      setError('A data/hora de término deve ser posterior ao início do treinamento.');
      return;
    }

    onSave({
      id: training?.id,
      title: title.trim(),
      instructorId,
      locationId,
      startDate,
      endDate,
      status,
      description: description.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div 
        id="training-modal-container"
        className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">
            {training ? 'Editar Treinamento' : 'Agendar Novo Treinamento'}
          </h3>
          <button 
            id="close-training-modal-btn"
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
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Título do Treinamento <span className="text-rose-500">*</span>
              </label>
              <input
                id="training-title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Integração - Natura, NR 35 Trabalho em Altura..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                required
              />
            </div>

            {/* Grid Instrutor e Local */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Instrutor */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <User className="h-4 w-4 text-slate-400" />
                  Instrutor Responsável <span className="text-rose-500">*</span>
                </label>
                {instructors.length === 0 ? (
                  <div className="text-xs text-rose-500 mt-1">Nenhum instrutor cadastrado. Cadastre um instrutor primeiro!</div>
                ) : (
                  <select
                    id="training-instructor-select"
                    value={instructorId}
                    onChange={(e) => setInstructorId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                    required
                  >
                    {instructors.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name} ({inst.specialty})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Local */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  Local do Treinamento <span className="text-rose-500">*</span>
                </label>
                {locations.length === 0 ? (
                  <div className="text-xs text-rose-500 mt-1">Nenhum local cadastrado. Cadastre um local primeiro!</div>
                ) : (
                  <select
                    id="training-location-select"
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                    required
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} {loc.capacity ? `(Capac: ${loc.capacity})` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Grid Datas */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Início */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  Início <span className="text-rose-500">*</span>
                </label>
                <input
                  id="training-start-date"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  required
                />
              </div>

              {/* Fim */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="h-4 w-4 text-slate-400" />
                  Término <span className="text-rose-500">*</span>
                </label>
                <input
                  id="training-end-date"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  required
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                <Info className="h-4 w-4 text-slate-400" />
                Status do Treinamento
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  id="status-confirmado-btn"
                  type="button"
                  onClick={() => setStatus('confirmado')}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                    status === 'confirmado'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Confirmado
                </button>
                <button
                  id="status-aguardando-btn"
                  type="button"
                  onClick={() => setStatus('aguardando')}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                    status === 'aguardando'
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Aguardando
                </button>
                <button
                  id="status-cancelado-btn"
                  type="button"
                  onClick={() => setStatus('cancelado')}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                    status === 'cancelado'
                      ? 'border-slate-400 bg-slate-50 text-slate-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  Cancelado
                </button>
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                <AlignLeft className="h-4 w-4 text-slate-400" />
                Descrição / Observações (Opcional)
              </label>
              <textarea
                id="training-description-textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalhes sobre a ementa do treinamento, pré-requisitos dos participantes, materiais de apoio necessários..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              id="cancel-training-btn"
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              id="save-training-btn"
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 transition-colors"
            >
              Confirmar Treinamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
