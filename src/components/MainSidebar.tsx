import React, { useState } from 'react';
import { 
  Users, 
  MapPin, 
  ListTodo, 
  Sparkles, 
  X, 
  ChevronRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export type TabType = 'interativo' | 'treinamentos' | 'instrutores' | 'locais';

interface MainSidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isSupabaseConfigured: boolean;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onSyncRequested?: () => Promise<void>;
}

export default function MainSidebar({
  activeTab,
  setActiveTab,
  isSupabaseConfigured,
  isMobileOpen,
  setIsMobileOpen,
  onSyncRequested,
}: MainSidebarProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = async () => {
    if (!onSyncRequested) return;
    setIsSyncing(true);
    try {
      await onSyncRequested();
    } finally {
      setIsSyncing(false);
    }
  };

  const navItems: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string }[] = [
    {
      id: 'interativo',
      label: 'Calendário Interativo',
      icon: Sparkles,
    },
    {
      id: 'treinamentos',
      label: 'Lista de Treinamentos',
      icon: ListTodo,
    },
    {
      id: 'instrutores',
      label: 'Instrutores',
      icon: Users,
    },
    {
      id: 'locais',
      label: 'Locais de Treinamento',
      icon: MapPin,
    },
  ];

  const handleSelect = (tab: TabType) => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Main Left Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 bottom-0 z-50 w-72 bg-[#001130] text-slate-100 flex flex-col border-r border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex flex-col gap-1 min-w-0">
            {/* Clean PROENG Text Title */}
            <div className="flex items-center">
              <span className="text-2xl sm:text-3xl font-black italic tracking-tighter text-white drop-shadow-sm">
                PRO<span className="text-red-600">ENG</span>
              </span>
            </div>

            <div>
              <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-300 leading-snug">
                GESTÃO DE TREINAMENTOS
              </h2>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Menu Header */}
        <div className="px-5 pt-5 pb-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Menu Principal
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`tab-${item.id}`}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-black transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-950/50 border-l-4 border-white'
                    : 'text-slate-300 hover:bg-[#081f4a] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-slate-800/80 text-slate-300 group-hover:bg-blue-600 group-hover:text-white'
                  }`}>
                    <Icon className="h-4 w-4 stroke-[2.2]" />
                  </div>
                  <span className="truncate tracking-wide">
                    {item.label}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {item.badge && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                      isActive 
                        ? 'bg-white text-red-700' 
                        : 'bg-red-600 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className={`h-3.5 w-3.5 transition-transform ${
                    isActive ? 'text-white opacity-100 translate-x-0.5' : 'text-slate-500 opacity-0 group-hover:opacity-100'
                  }`} />
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer Database Status & Sync */}
        <div className="p-4 border-t border-slate-800/80 bg-[#000a1f]/80 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Status da Conexão
            </span>
            {isSupabaseConfigured ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Nuvem (Supabase)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                Local (Offline)
              </span>
            )}
          </div>

          {/* Sync Button */}
          {onSyncRequested && (
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800/80 hover:bg-blue-600 active:bg-blue-700 text-slate-200 hover:text-white rounded-xl text-xs font-black transition-all cursor-pointer border border-slate-700 hover:border-blue-500 shadow-sm disabled:opacity-50"
              title="Sincronizar todos os treinamentos, instrutores e locais entre teste e produção no Supabase"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-blue-400' : 'text-slate-400'}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar com Nuvem'}</span>
            </button>
          )}

          <div className="flex items-center gap-2 pt-2 border-t border-slate-800/50 text-[10px] font-medium text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
            <span className="truncate">PROENG Treinamentos © 2026</span>
          </div>
        </div>

      </aside>
    </>
  );
}
