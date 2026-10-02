import React from 'react';
import { Perfil, Estudiante, RolUsuario } from '../types/academic';
import { GraduationCap, ChevronDown, UserCheck, LogOut } from 'lucide-react';
import { AcademicStore } from '../data/academicStore';

interface StudentHeaderProps {
  perfil: Perfil;
  estudiante?: Estudiante;
  rolActual: RolUsuario;
  onCambiarUsuario: (userId: string) => void;
  onAbrirChat: () => void;
  onCerrarSesion: () => void;
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({
  perfil,
  estudiante,
  rolActual,
  onCambiarUsuario,
  onAbrirChat,
  onCerrarSesion,
}) => {
  return (
    <header className="w-full bg-white border-b border-sky-200/80 shadow-xs">
      {/* Top Banner con Logo y Nombre de la Universidad (Fiel al Wireframe a.jpg) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          {/* Box 1: LOGO */}
          <div className="flex items-center justify-center bg-sky-100/80 border-2 border-sky-300 text-sky-800 rounded-xl px-4 py-2.5 shadow-xs shrink-0 min-w-[130px] h-[58px] transition hover:bg-sky-100">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="text-left leading-tight">
                <span className="block text-xs font-semibold tracking-wider uppercase text-sky-900">UNTI</span>
                <span className="block text-[10px] text-sky-700 font-medium">Campus Virtual</span>
              </div>
            </div>
          </div>

          {/* Box 2: NOMBRE DE LA UNIVERSIDAD (Rectángulo grande redondeado como wireframe a.jpg) */}
          <div className="w-full flex-1 bg-gradient-to-r from-sky-100/90 via-sky-50 to-blue-50 border-2 border-sky-300 rounded-2xl px-6 py-3 flex items-center justify-between shadow-xs">
            <div className="text-left">
              <h1 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-sky-950 uppercase">
                UNIVERSIDAD NACIONAL DE TECNOLOGÍA E INNOVACIÓN
              </h1>
              <p className="text-xs text-sky-700 font-medium hidden sm:block">
                Portal del Estudiante • Periodo Académico Activo 2026-I
              </p>
            </div>
          </div>
        </div>

        {/* Sub-fila: "Tipo de sesión" y Botón "Cerrar Sesión" */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-2 border-t border-sky-100">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Sesión activa: <strong className="text-sky-950 capitalize">{perfil.rol}</strong> ({perfil.email})</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-sky-50 border-2 border-sky-300 rounded-xl px-3 py-1.5 shadow-xs flex items-center gap-2">
              <UserCheck className="w-3.5 h-3.5 text-sky-700" />
              <label className="text-xs font-semibold text-sky-900 whitespace-nowrap hidden sm:inline">
                Cambiar perfil:
              </label>
              <div className="relative">
                <select
                  value={perfil.user_id}
                  onChange={(e) => onCambiarUsuario(e.target.value)}
                  className="bg-white border border-sky-300 hover:border-sky-400 text-sky-900 text-xs font-bold rounded-lg px-2.5 py-1 pr-7 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400 uppercase tracking-wide appearance-none max-w-[210px] truncate"
                >
                  {AcademicStore.obtenerTodosLosPerfiles().map((p) => (
                    <option key={p.user_id} value={p.user_id}>
                      {p.rol === 'administrador' ? '🛡️ Admin: ' : p.rol === 'docente' ? '👨‍🏫 Docente: ' : '🎓 Alumno: '}
                      {p.nombre_completo.split(' ')[0]} ({p.rol})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-sky-700 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <button
              type="button"
              onClick={onCerrarSesion}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border-2 border-rose-300 font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              title="Cerrar sesión y volver al portal de acceso"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Encabezado Principal de Bienvenida (según wireframe a.jpg) */}
        <div className="mt-4 bg-sky-50/70 border-2 border-sky-200 rounded-2xl p-5 text-center shadow-xs">
          <h2 className="text-xl sm:text-2xl font-bold text-sky-950 tracking-tight">
            Bienvenido "{perfil.nombre_completo}"
          </h2>
          {estudiante ? (
            <p className="mt-1.5 text-sm sm:text-base font-semibold text-sky-800">
              Codigo del estudiante: <span className="font-mono bg-white px-3 py-1 rounded-lg border-2 border-sky-300 text-sky-950 shadow-xs">" {estudiante.codigo_estudiante} "</span>
              <span className="ml-3 text-xs text-sky-700 font-semibold inline-flex items-center gap-2 flex-wrap justify-center mt-2 sm:mt-0">
                <span className="bg-sky-100 text-sky-900 px-2.5 py-0.5 rounded-full border border-sky-300 font-bold">
                  {estudiante.semestre_actual}° Semestre
                </span>
                {(() => {
                  const creds = AcademicStore.obtenerLimiteCreditosEstudiante(estudiante.id);
                  return (
                    <span className={`px-2.5 py-0.5 rounded-full border font-bold ${
                      creds.calificaPara26
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    }`}>
                      {creds.calificaPara26
                        ? `⭐ 26 Créditos Disponibles (Promedio: ${creds.promedioGeneral.toFixed(1)} > 14)`
                        : `22 Créditos Base Permitidos (Promedio: ${creds.promedioGeneral.toFixed(1)} ≤ 14)`}
                    </span>
                  );
                })()}
              </span>
            </p>
          ) : rolActual === 'docente' ? (
            <p className="mt-1.5 text-sm font-semibold text-sky-900">
              Panel del Docente / Profesor • <span className="text-xs text-sky-700 font-normal">Control y registro de asistencia diaria y carga de evaluaciones</span>
            </p>
          ) : (
            <p className="mt-1.5 text-sm font-semibold text-blue-900">
              Panel Administrativo de Control • <span className="text-xs text-blue-700 font-normal">Permisos de edición de actas de calificaciones y resolución de mesa de ayuda</span>
            </p>
          )}
        </div>
      </div>
    </header>
  );
};
