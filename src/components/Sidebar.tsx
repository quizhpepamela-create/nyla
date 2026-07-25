import React from 'react';
import { LayoutDashboard, Briefcase, Mail, User, Settings, HelpCircle, LogOut, Plus, GraduationCap } from 'lucide-react';
import { ViewState } from '../types';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  onOpenNewProject?: () => void;
}

export default function Sidebar({ currentView, setView, onOpenNewProject }: SidebarProps) {
  const { logout, user } = useAuth();
  const isEntrepreneur = user?.role === 'ENTREPRENEUR';

  const handleLogout = async () => {
    await logout();
    setView('landing');
  };
  const menuItems = [
    { id: 'dashboard' as ViewState, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'proyectos' as ViewState, label: isEntrepreneur ? 'Mis Proyectos' : 'Proyectos', icon: Briefcase },
    ...(isEntrepreneur ? [{ id: 'talento' as ViewState, label: 'Talento', icon: GraduationCap }] : []),
    { id: 'mensajes' as ViewState, label: 'Mensajes', icon: Mail },
    { id: 'perfil' as ViewState, label: 'Perfil', icon: User },
    { id: 'configuracion' as ViewState, label: 'Configuración', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        id="side-navbar"
        className="fixed left-0 top-0 h-screen flex flex-col p-4 border-r border-editorial-border bg-editorial-bg w-64 z-40 hidden md:flex transition-all duration-300"
      >
        <div className="mb-10 px-4 pt-4">
          <h1 className="text-2xl font-serif font-black text-editorial-text tracking-tighter">NYLA.</h1>
          <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-editorial-muted mt-1">Academic Talent Hub</p>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 active:translate-x-1 cursor-pointer ${
                  isActive 
                    ? 'bg-editorial-text text-editorial-bg font-bold shadow-sm' 
                    : 'text-editorial-muted hover:bg-editorial-light/60 hover:text-editorial-text'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-editorial-bg' : 'text-editorial-muted'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-editorial-border space-y-2">
          {isEntrepreneur && (
            <button
              onClick={onOpenNewProject}
              className="w-full flex items-center justify-center gap-2 bg-editorial-text text-editorial-bg py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-[0.15em] hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Proyecto</span>
            </button>
          )}

          <button 
            onClick={() => setView('configuracion')}
            className="w-full flex items-center gap-3 px-4 py-3 text-editorial-muted hover:bg-editorial-light/60 hover:text-editorial-text rounded-xl transition-all text-sm font-semibold cursor-pointer"
          >
            <HelpCircle className="w-5 h-5 text-editorial-muted" />
            <span>Ayuda</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-editorial-muted hover:bg-red-50 hover:text-red-700 rounded-xl transition-all text-sm font-semibold cursor-pointer"
          >
            <LogOut className="w-5 h-5 text-editorial-muted" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav 
        id="mobile-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 bg-editorial-bg border-t border-editorial-border flex justify-around items-center py-3 z-50 shadow-md"
      >
        {menuItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex flex-col items-center gap-1 transition-all duration-200 cursor-pointer ${
                isActive ? 'text-editorial-text' : 'text-editorial-muted/70'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
              <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
