import React from 'react';
import { BookOpen, FolderGit2, CalendarClock, TrafficCone, ArrowRight, Sparkles } from 'lucide-react';
import { Estudiante } from '../types/academic';
import { AcademicStore } from '../data/academicStore';

interface StudentDashboardCardsProps {
  estudiante?: Estudiante;
  onAbrirCursos: () => void;
  onAbrirMaterial: () => void;
  onAbrirEventos: () => void;
  onAbrirSemaforo: () => void;
  onConsultarChat: (pregunta: string) => void;
}

export const StudentDashboardCards: React.FC<StudentDashboardCardsProps> = ({
  estudiante,
  onAbrirCursos,
  onAbrirMaterial,
  onAbrirEventos,
  onAbrirSemaforo,
  onConsultarChat,
}) => {
  return (
    <div className="flex-1 space-y-5">
      {/* Indicador de Ayuda Rápida con IA */}
      <div className="bg-sky-100/70 border border-sky-300 rounded-xl p-3.5 sm:p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 text-sky-950">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-sky-900">
              ¿Dudas sobre tus asignaturas, aulas o ciclo 2026-I?
            </p>
            <p className="text-[11px] text-sky-700">
              Tu asistente virtual está disponible para consultar horarios, docentes, notas y aulas en tiempo real.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto shrink-0 pt-1 lg:pt-0">
          <button
            onClick={() => onConsultarChat('¿A qué hora tengo clase hoy?')}
            className="flex-1 sm:flex-none text-[11px] font-semibold bg-white border border-sky-300 hover:bg-sky-50 text-sky-800 px-3 py-1.5 rounded-lg transition text-center shadow-xs"
          >
            "¿A qué hora tengo clase hoy?"
          </button>
          <button
            onClick={() => onConsultarChat('¿Qué cursos y secciones tengo matriculados este ciclo?')}
            className="flex-1 sm:flex-none text-[11px] font-semibold bg-white border border-sky-300 hover:bg-sky-50 text-sky-800 px-3 py-1.5 rounded-lg transition text-center shadow-xs whitespace-nowrap"
          >
            "Ver mis cursos"
          </button>
        </div>
      </div>

      {/* Grid 2x2 Fiel al Wireframe a.jpg */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
        {/* CARD 1: Ver cursos matriculados */}
        <button
          onClick={onAbrirCursos}
          className="group relative text-left bg-gradient-to-br from-white to-sky-50/70 border-2 border-sky-300 hover:border-sky-500 rounded-2xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[170px]"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-sky-100 border border-sky-300 text-sky-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-sky-700 bg-sky-100/90 border border-sky-200 px-2 py-0.5 rounded-full">
              {estudiante ? `${AcademicStore.obtenerMatriculasPorEstudiante(estudiante.id).length} Matriculados` : 'Periodo 2026-I'}
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-lg sm:text-xl font-bold text-sky-950 group-hover:text-sky-700 transition-colors">
              Ver cursos matriculados
            </h3>
            <p className="text-xs text-sky-700 mt-1">
              {estudiante && AcademicStore.obtenerMatriculasPorEstudiante(estudiante.id).length === 0
                ? 'Por defecto no tienes cursos. Haz clic para elegir del catálogo de asignaturas creadas.'
                : 'Revisa y gestiona tu selección de asignaturas, docentes y horarios oficiales.'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-sky-100 flex items-center justify-between text-xs font-semibold text-sky-800">
            <span>{estudiante && AcademicStore.obtenerMatriculasPorEstudiante(estudiante.id).length === 0 ? 'Elegir mis cursos ahora' : 'Acceder a la lista oficial'}</span>
            <ArrowRight className="w-4 h-4 text-sky-600 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* CARD 2: Accede al material de tus cursos */}
        <button
          onClick={onAbrirMaterial}
          className="group relative text-left bg-gradient-to-br from-white to-sky-50/70 border-2 border-sky-300 hover:border-sky-500 rounded-2xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[170px]"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-sky-100 border border-sky-300 text-sky-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-sky-700 bg-sky-100/90 border border-sky-200 px-2 py-0.5 rounded-full">
              LMS Cloud
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-lg sm:text-xl font-bold text-sky-950 group-hover:text-sky-700 transition-colors">
              Accede al material de tus cursos
            </h3>
            <p className="text-xs text-sky-700 mt-1">
              Sílabos oficiales, diapositivas, guías de laboratorio y repositorios de código.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-sky-100 flex items-center justify-between text-xs font-semibold text-sky-800">
            <span>Explorar repositorio didáctico</span>
            <ArrowRight className="w-4 h-4 text-sky-600 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* CARD 3: Ver eventos proximos */}
        <button
          onClick={onAbrirEventos}
          className="group relative text-left bg-gradient-to-br from-white to-sky-50/70 border-2 border-sky-300 hover:border-sky-500 rounded-2xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[170px]"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-sky-100 border border-sky-300 text-sky-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CalendarClock className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-sky-700 bg-sky-100/90 border border-sky-200 px-2 py-0.5 rounded-full">
              3 Próximos
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-lg sm:text-xl font-bold text-sky-950 group-hover:text-sky-700 transition-colors">
              Ver eventos proximos
            </h3>
            <p className="text-xs text-sky-700 mt-1">
              Hackathons de IA, congresos internacionales, conferencias magistrales y talleres.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-sky-100 flex items-center justify-between text-xs font-semibold text-sky-800">
            <span>Ver agenda universitaria</span>
            <ArrowRight className="w-4 h-4 text-sky-600 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* CARD 4: Semaforo del estudiante (cursos aprobados, y pendientes) */}
        <button
          onClick={onAbrirSemaforo}
          className="group relative text-left bg-gradient-to-br from-white to-sky-50/70 border-2 border-sky-300 hover:border-sky-500 rounded-2xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[170px]"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-sky-100 border border-sky-300 text-sky-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrafficCone className="w-6 h-6" />
            </div>
            {estudiante && (() => {
              const creds = AcademicStore.obtenerLimiteCreditosEstudiante(estudiante.id);
              return (
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  creds.calificaPara26
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-sky-100 text-sky-900 border-sky-200'
                }`}>
                  {creds.maxCreditos} Créditos Max
                </span>
              );
            })()}
          </div>

          <div className="mt-4">
            <h3 className="text-lg sm:text-xl font-bold text-sky-950 group-hover:text-sky-700 transition-colors">
              Semaforo del estudiante
            </h3>
            <p className="text-xs text-sky-700 mt-1">
              (cursos aprobados, y pendientes) • Base 22 créditos permitidos (hasta 26 con promedio &gt; 14).
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-sky-100 flex items-center justify-between text-xs font-semibold text-sky-800">
            <span>Revisar avance curricular</span>
            <ArrowRight className="w-4 h-4 text-sky-600 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>
    </div>
  );
};
