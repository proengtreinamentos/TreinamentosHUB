/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Location, LocationType } from '../types';
import { X, Building2, MapPin, Laptop } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (location: Omit<Location, 'id'> & { id?: string }) => void;
  location?: Location | null;
}

export default function LocationModal({ isOpen, onClose, onSave, location }: LocationModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<LocationType>('sala');
  const [capacity, setCapacity] = useState<number | ''>('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (location) {
      setName(location.name);
      setType(location.type);
      setCapacity(location.capacity ?? '');
      setDetails(location.details || '');
    } else {
      setName('');
      setType('sala');
      setCapacity('');
      setDetails('');
    }
    setError('');
  }, [location, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome do local é obrigatório.');
      return;
    }

    onSave({
      id: location?.id,
      name: name.trim(),
      type,
      capacity: capacity === '' ? undefined : Number(capacity),
      details: details.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div 
        id="location-modal-container"
        className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">
            {location ? 'Editar Local' : 'Cadastrar Novo Local'}
          </h3>
          <button 
            id="close-location-modal-btn"
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
            {/* Nome do Local */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nome do Local <span className="text-rose-500">*</span>
              </label>
              <input
                id="location-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Sala de Treinamento A, Prédio Comercial..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                required
              />
            </div>

            {/* Tipo de Local (Seletor Visual) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo de Local <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {/* Sala de Reunião/Interna */}
                <button
                  id="loc-type-sala-btn"
                  type="button"
                  onClick={() => setType('sala')}
                  className={`flex flex-col items-center justify-center rounded-lg border p-3 text-center transition-all cursor-pointer ${
                    type === 'sala'
                      ? 'border-blue-500 bg-blue-50/50 text-blue-600 font-medium'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="mb-1.5 h-5 w-5" />
                  <span className="text-xs">Sala / Interno</span>
                </button>

                {/* Externo */}
                <button
                  id="loc-type-externo-btn"
                  type="button"
                  onClick={() => setType('externo')}
                  className={`flex flex-col items-center justify-center rounded-lg border p-3 text-center transition-all cursor-pointer ${
                    type === 'externo'
                      ? 'border-blue-500 bg-blue-50/50 text-blue-600 font-medium'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <MapPin className="mb-1.5 h-5 w-5" />
                  <span className="text-xs">Externo / Cliente</span>
                </button>

                {/* Interno / Online */}
                <button
                  id="loc-type-interno-btn"
                  type="button"
                  onClick={() => setType('interno')}
                  className={`flex flex-col items-center justify-center rounded-lg border p-3 text-center transition-all cursor-pointer ${
                    type === 'interno'
                      ? 'border-blue-500 bg-blue-50/50 text-blue-600 font-medium'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Laptop className="mb-1.5 h-5 w-5" />
                  <span className="text-xs">Online / Outros</span>
                </button>
              </div>
            </div>

            {/* Capacidade (Apenas habilitado se for Sala de Reunião/Interno) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Capacidade de Pessoas (Opcional)
              </label>
              <input
                id="location-capacity-input"
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Ex: 30"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            {/* Detalhes / Endereço */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Endereço ou Informações de Acesso
              </label>
              <textarea
                id="location-details-textarea"
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Ex: Sala 102, Bloco B ou Endereço Completo do Cliente..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              id="cancel-location-btn"
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              id="save-location-btn"
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 transition-colors"
            >
              Salvar Local
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
