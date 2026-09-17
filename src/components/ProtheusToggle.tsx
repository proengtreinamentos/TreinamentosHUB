/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Check, X } from 'lucide-react';

interface ProtheusToggleProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'default' | 'sm' | 'xs' | 'replica';
  showLabel?: boolean;
  className?: string;
  id?: string;
}

export default function ProtheusToggle({
  checked,
  onChange,
  disabled = false,
  size = 'default',
  showLabel = false,
  className = '',
  id,
}: ProtheusToggleProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  // Mini replica for calendar cards (compact toggle switch symbol without text)
  if (size === 'replica') {
    if (!checked) return null; // Only show on calendar when launched, as requested
    return (
      <div 
        className={`relative inline-flex items-center w-[22px] h-[13px] p-[1px] rounded-full bg-emerald-500 border border-emerald-600 shadow-2xs select-none flex-shrink-0 ${className}`}
        title="Lançado no Sistema Protheus"
      >
        <span className="absolute left-[3px] flex items-center justify-center text-white pointer-events-none">
          <Check className="h-2 w-2 stroke-[3.5] text-white drop-shadow-2xs" />
        </span>
        <span className="inline-block h-[9px] w-[9px] rounded-full bg-white shadow-xs ml-auto" />
      </div>
    );
  }

  // Sizes dimensions
  const dimensions = {
    default: {
      track: 'w-14 h-7 p-0.5',
      knob: 'h-6 w-6',
      translateOn: 'translate-x-7',
      translateOff: 'translate-x-0',
      iconSize: 'h-3.5 w-3.5',
      iconPaddingOn: 'left-2',
      iconPaddingOff: 'right-2',
    },
    sm: {
      track: 'w-11 h-6 p-0.5',
      knob: 'h-5 w-5',
      translateOn: 'translate-x-5',
      translateOff: 'translate-x-0',
      iconSize: 'h-3 w-3',
      iconPaddingOn: 'left-1.5',
      iconPaddingOff: 'right-1.5',
    },
    xs: {
      track: 'w-9 h-5 p-0.5',
      knob: 'h-4 w-4',
      translateOn: 'translate-x-4',
      translateOff: 'translate-x-0',
      iconSize: 'h-2.5 w-2.5',
      iconPaddingOn: 'left-1',
      iconPaddingOff: 'right-1',
    },
  }[size === 'default' ? 'default' : size === 'sm' ? 'sm' : 'xs'];

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleClick}
        className={`relative inline-flex flex-shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-inner ${
          dimensions.track
        } ${
          checked 
            ? 'bg-emerald-500 border border-emerald-600' 
            : 'bg-red-500 border border-red-600'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-95 active:scale-95'}`}
        title={checked ? 'Lançado no Protheus (Clique para desmarcar)' : 'Não lançado no Protheus (Clique para marcar como lançado)'}
      >
        {/* Checkmark icon on the left when ON */}
        {checked && (
          <span className={`absolute ${dimensions.iconPaddingOn} flex items-center justify-center text-white pointer-events-none transition-opacity duration-200`}>
            <Check className={`${dimensions.iconSize} stroke-[3.5] text-white drop-shadow-2xs`} />
          </span>
        )}

        {/* X icon on the right when OFF */}
        {!checked && (
          <span className={`absolute ${dimensions.iconPaddingOff} flex items-center justify-center text-white/90 pointer-events-none transition-opacity duration-200`}>
            <X className={`${dimensions.iconSize} stroke-[3] text-white/90`} />
          </span>
        )}

        {/* Sliding Knob (White Circle) */}
        <span
          className={`pointer-events-none inline-block rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
            dimensions.knob
          } ${checked ? dimensions.translateOn : dimensions.translateOff}`}
        />
      </button>

      {showLabel && (
        <span 
          onClick={handleClick}
          className={`text-xs font-bold cursor-pointer transition-colors ${
            checked ? 'text-emerald-700' : 'text-red-600'
          }`}
        >
          {checked ? 'Lançado no Protheus' : 'Pendente de Lançamento'}
        </span>
      )}
    </div>
  );
}
