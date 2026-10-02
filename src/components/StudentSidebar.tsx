import React from 'react';
import {
  User,
  GraduationCap,
  ShoppingBag,
  CalendarDays,
  Clock,
  CheckCircle2,
  LifeBuoy,
  Award,
  FileCheck2,
  Bot,
} from 'lucide-react';

export type ModuloId =
  | 'informacion'
  | 'matriculas'
  | 'tienda'
  | 'eventos'
  | 'horarios'
  | 'asistencias'
  | 'mesa_ayuda'
  | 'calificaciones'
  | 'evaluacion_docente';

interface StudentSidebarProps {
  moduloActivo: ModuloId;
  onSeleccionarModulo: (modulo: ModuloId) => void;
  onAbrirChatbot: () => void;
}

export const StudentSidebar: React.FC<StudentSidebarProps> = ({
  moduloActivo,
  onSeleccionarModulo,
  onAbrirChatbot,
}) => {
  // Lista de los 9 botones exactos del menú wireframe a.jpg
  const menuItems: { id: ModuloId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'informacion', label: 'Información del estudiante', icon: User },
    { id: 'matriculas', label: 'Matrículas', icon: GraduationCap },
    { id: 'tienda', label: 'Tienda', icon: ShoppingBag },
    { id: 'eventos', label: 'Eventos universitarios', icon: CalendarDays },
    { id: 'horarios', label: 'Horarios del estudiante', icon: Clock },
    { id: 'asistencias', label: 'Asistencias', icon: CheckCircle2 },
    { id: 'mesa_ayuda', label: 'Mesa de ayuda', icon: LifeBuoy },
    { id: 'calificaciones', label: 'Calificaciones', icon: Award },
    { id: 'evaluacion_docente', label: 'Evaluación docente', icon: FileCheck2 },
  ];

  return (
    <aside className="w-full md:w-64 lg:w-72 shrink-0">
      {/* Contenedor del Menú con borde y color azul claro (wireframe a.jpg) */}
      <div className="bg-sky-50/80 border-2 border-sky-300 rounded-2xl p-2 sm:p-2.5 shadow-sm space-y-1.5">
        <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-sky-800 border-b border-sky-200 flex items-center justify-between">
          <span>Menú de Navegación</span>
          <span className="text-[10px] bg-sky-200/80 text-sky-900 px-1.5 py-0.5 rounded font-mono">9 Módulos</span>
        </div>

        <nav className="flex flex-col space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const esActivo = moduloActivo === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSeleccionarModulo(item.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center gap-3 ${
                  esActivo
                    ? 'bg-sky-600 text-white border-sky-700 shadow-xs translate-x-1'
                    : 'bg-white/90 text-sky-950 border-sky-200 hover:bg-sky-100 hover:border-sky-300 hover:text-sky-900'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                    esActivo ? 'bg-sky-700 text-white' : 'bg-sky-100 text-sky-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Botón Destacado del Asistente Virtual Universitario */}
        <div className="pt-2 border-t border-sky-200">
          <button
            onClick={onAbrirChatbot}
            className="w-full px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold text-xs shadow-xs flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-sky-200 group-hover:rotate-12 transition-transform" />
              <span>Asistente Académico</span>
            </div>
            <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded-full text-white font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
              En línea
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};
