import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  GraduationCap,
  ShoppingBag,
  CalendarDays,
  Clock,
  CheckCircle2,
  LifeBuoy,
  Award,
  FileCheck2,
  BookOpen,
  TrafficCone,
  Download,
  ExternalLink,
  PlusCircle,
  Send,
  AlertCircle,
  Save,
  RotateCcw,
  Check,
  UserCheck,
  Trash2,
  CreditCard,
  Star,
  ShieldCheck,
  Lock,
  Camera,
} from 'lucide-react';
import {
  Perfil,
  Estudiante,
  Matricula,
  TicketMesaAyuda,
  DiaSemana,
  EventoUniversitario,
  PagoItem,
} from '../types/academic';
import {
  ASISTENCIAS_DB,
} from '../data/mockSupabaseDb';
import { AcademicStore } from '../data/academicStore';

export type VistaModal =
  | 'informacion'
  | 'matriculas'
  | 'tienda'
  | 'eventos'
  | 'horarios'
  | 'asistencias'
  | 'mesa_ayuda'
  | 'calificaciones'
  | 'evaluacion_docente'
  | 'material_cursos'
  | 'semaforo';

interface ModuleModalsProps {
  vistaModal: VistaModal | null;
  onCerrar: () => void;
  perfil: Perfil;
  estudiante?: Estudiante;
}

export const ModuleModals: React.FC<ModuleModalsProps> = ({
  vistaModal,
  onCerrar,
  perfil,
  estudiante,
}) => {
  // Estado reactivo sincronizado con AcademicStore
  const [, setTick] = useState(0);

  // Estados para Calificaciones (Administrador / Docente)
  const [adminEstudianteSeleccionadoId, setAdminEstudianteSeleccionadoId] = useState<string>('est_01');
  const [calificacionesForm, setCalificacionesForm] = useState<Record<string, {
    permanente1?: number;
    parcial?: number;
    permanente2?: number;
    final?: number;
  }>>({});
  const [mensajeGuardadoCalificaciones, setMensajeGuardadoCalificaciones] = useState(false);
  const [mensajeErrorMatricula, setMensajeErrorMatricula] = useState<string | null>(null);
  const [mensajeAsistenciaDocente, setMensajeAsistenciaDocente] = useState<string | null>(null);

  // Estados para Asistencia (Profesor marca si el alumno estuvo o no)
  const [asistEstudianteSeleccionadoId, setAsistEstudianteSeleccionadoId] = useState<string>('est_01');
  const [asistFiltroCurso, setAsistFiltroCurso] = useState<string>('');
  const [modoProfesorAsistencia, setModoProfesorAsistencia] = useState<boolean>(
    perfil.rol === 'docente' || perfil.rol === 'administrador'
  );
  const [modoProfesorCalificaciones, setModoProfesorCalificaciones] = useState<boolean>(
    perfil.rol === 'docente' || perfil.rol === 'administrador'
  );
  const [mostrarFormNuevaSesion, setMostrarFormNuevaSesion] = useState(false);
  const [nuevaSesionCurso, setNuevaSesionCurso] = useState('');
  const [nuevaSesionTema, setNuevaSesionTema] = useState('');
  const [nuevaSesionFecha, setNuevaSesionFecha] = useState(new Date().toISOString().split('T')[0]);
  const [nuevaSesionHora, setNuevaSesionHora] = useState('08:00 AM');
  const [nuevaSesionEstado, setNuevaSesionEstado] = useState<'PRESENTE' | 'FALTA'>('PRESENTE');

  // Estados para Mesa de Ayuda (Estudiante)
  const [modoCrearTicket, setModoCrearTicket] = useState(false);
  const [asuntoTicket, setAsuntoTicket] = useState('');
  const [categoriaTicket, setCategoriaTicket] = useState<TicketMesaAyuda['categoria']>('CALIFICACIONES');
  const [mensajeTicket, setMensajeTicket] = useState('');
  const [mensajeExitoTicket, setMensajeExitoTicket] = useState(false);

  // Estados para Mesa de Ayuda (Administrador)
  const [respuestasAdmin, setRespuestasAdmin] = useState<Record<string, string>>({});

  // Estados para Creación de Curso y Horario (Administrador)
  const [modoCrearCurso, setModoCrearCurso] = useState(false);
  const [cursoCodigo, setCursoCodigo] = useState('');
  const [cursoNombre, setCursoNombre] = useState('');
  const [cursoCreditos, setCursoCreditos] = useState<number>(4);
  const [cursoCiclo, setCursoCiclo] = useState<number>(1);
  const [cursoTipo, setCursoTipo] = useState<'OBLIGATORIO' | 'ELECTIVO'>('OBLIGATORIO');
  const [cursoDocente, setCursoDocente] = useState('');
  const [cursoSeccion, setCursoSeccion] = useState('SEC-A');
  const [cursoAula, setCursoAula] = useState('');
  const [cursoPabellon, setCursoPabellon] = useState('Pabellón B');
  const [cursoDia, setCursoDia] = useState<DiaSemana>(1);
  const [cursoHoraInicio, setCursoHoraInicio] = useState('08:00');
  const [cursoHoraFin, setCursoHoraFin] = useState('10:15');
  const [cursoTipoSesion, setCursoTipoSesion] = useState<'TEORIA' | 'PRACTICA' | 'LABORATORIO'>('TEORIA');
  const [mensajeExitoCurso, setMensajeExitoCurso] = useState(false);

  // Estados para Eventos (Admin crear)
  const [modoCrearEvento, setModoCrearEvento] = useState(false);
  const [evTitulo, setEvTitulo] = useState('');
  const [evCategoria, setEvCategoria] = useState<EventoUniversitario['categoria']>('ACADEMICO');
  const [evFecha, setEvFecha] = useState('2026-04-15');
  const [evHora, setEvHora] = useState('10:00 - 12:30');
  const [evLugar, setEvLugar] = useState('Auditorio Central Pabellón A');
  const [evOrganizador, setEvOrganizador] = useState('Dirección de Asuntos Académicos');
  const [evDescripcion, setEvDescripcion] = useState('');
  const [mensajeEventoFeedback, setMensajeEventoFeedback] = useState<string | null>(null);

  // Estados para Tienda / Pasarela de Pagos
  const [cuotaAPagar, setCuotaAPagar] = useState<PagoItem | null>(null);
  const [tarjetaNumero, setTarjetaNumero] = useState('');
  const [tarjetaTitular, setTarjetaTitular] = useState(perfil.nombre_completo);
  const [tarjetaExpiracion, setTarjetaExpiracion] = useState('12/28');
  const [tarjetaCvv, setTarjetaCvv] = useState('784');
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [mensajeExitoPago, setMensajeExitoPago] = useState<string | null>(null);

  // Estados para Evaluación Docente
  const [docenteCursoEval, setDocenteCursoEval] = useState<string>('');
  const [evalPreg1, setEvalPreg1] = useState<number>(5);
  const [evalPreg2, setEvalPreg2] = useState<number>(5);
  const [evalPreg3, setEvalPreg3] = useState<number>(5);
  const [evalComentario, setEvalComentario] = useState<string>('');
  const [mensajeExitoEvaluacion, setMensajeExitoEvaluacion] = useState(false);

  // Suscribirse a cambios en AcademicStore
  useEffect(() => {
    const desuscribir = AcademicStore.suscribir(() => {
      setTick((t) => t + 1);
    });
    return desuscribir;
  }, []);

  // Inicializar formulario de notas cuando el admin o docente selecciona un estudiante
  useEffect(() => {
    const mats = AcademicStore.obtenerMatriculasPorEstudiante(adminEstudianteSeleccionadoId);
    const formInicial: Record<string, { permanente1?: number; parcial?: number; permanente2?: number; final?: number }> = {};
    mats.forEach((m) => {
      formInicial[m.id] = {
        permanente1: m.nota_permanente_1,
        parcial: m.nota_parcial,
        permanente2: m.nota_permanente_2,
        final: m.nota_final,
      };
    });
    setCalificacionesForm(formInicial);
  }, [adminEstudianteSeleccionadoId, vistaModal]);

  if (!vistaModal) return null;

  const esAdmin = perfil.rol === 'administrador';
  const esDocente = perfil.rol === 'docente';
  const esAutoridad = esAdmin || esDocente;

  // Datos dinámicos del Store
  const todosLosCursos = AcademicStore.obtenerCursos();
  const todasLasSecciones = AcademicStore.obtenerSecciones();
  const todosLosHorarios = AcademicStore.obtenerHorarios();
  const todosLosEventos = AcademicStore.obtenerEventos();
  const docentesPreviamenteUsados = AcademicStore.obtenerDocentesPreviamenteUsados();
  const aulasPreviamenteUsadas = AcademicStore.obtenerAulasPreviamenteUsadas();

  // Matrículas del estudiante activo
  const estudianteActualId = estudiante ? estudiante.id : adminEstudianteSeleccionadoId;
  const matriculasAlumno = AcademicStore.obtenerMatriculasPorEstudiante(estudianteActualId);

  // Información de límite de créditos (22 créditos base, 26 si promedio > 14)
  const infoCreditos = estudiante
    ? AcademicStore.obtenerLimiteCreditosEstudiante(estudiante.id)
    : AcademicStore.obtenerLimiteCreditosEstudiante(adminEstudianteSeleccionadoId);

  // Cursos en los que el alumno está matriculado
  const seccionesMatriculadasIds = matriculasAlumno.map((m) => m.seccion_id);
  const cursosMatriculados = todasLasSecciones
    .filter((s) => seccionesMatriculadasIds.includes(s.id))
    .map((s) => ({
      seccion: s,
      curso: todosLosCursos.find((c) => c.id === s.curso_id),
      matricula: matriculasAlumno.find((m) => m.seccion_id === s.id),
      horarios: todosLosHorarios.filter((h) => h.seccion_id === s.id),
    }));

  const totalCreditosMatriculados = cursosMatriculados.reduce(
    (acc, item) => acc + (item.curso?.creditos || 0),
    0
  );

  // Horarios de los cursos elegidos
  const horariosAlumno = todosLosHorarios.filter((h) =>
    seccionesMatriculadasIds.includes(h.seccion_id)
  );

  // Calificaciones que tienen al menos una nota registrada
  const matriculasConNota = matriculasAlumno.filter(
    (m) =>
      m.nota_permanente_1 !== undefined ||
      m.nota_parcial !== undefined ||
      m.nota_permanente_2 !== undefined ||
      m.nota_final !== undefined
  );

  // Tickets de mesa de ayuda
  const todosLosTickets = AcademicStore.obtenerTickets();
  const ticketsEstudiante = estudiante ? AcademicStore.obtenerTicketsPorEstudiante(estudiante.id) : [];

  // Pagos del estudiante activo (Total S/. 1,500 en cuotas)
  const pagosEstudiante = AcademicStore.obtenerPagosPorEstudiante(estudianteActualId);
  const totalPagado = pagosEstudiante
    .filter((p) => p.estado === 'PAGADO')
    .reduce((acc, p) => acc + p.monto, 0);
  const totalDeuda = pagosEstudiante
    .filter((p) => p.estado === 'PENDIENTE')
    .reduce((acc, p) => acc + p.monto, 0);

  // Handlers para creación de curso por Admin
  const handleCrearCursoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cursoCodigo.trim() || !cursoNombre.trim() || !cursoDocente.trim() || !cursoAula.trim()) return;

    AcademicStore.crearCursoConHorario({
      codigo: cursoCodigo,
      nombre: cursoNombre,
      creditos: Number(cursoCreditos),
      ciclo: Number(cursoCiclo),
      tipo: cursoTipo,
      codigo_seccion: cursoSeccion,
      docente_nombre: cursoDocente,
      aula: cursoAula,
      pabellon: cursoPabellon,
      dia_semana: cursoDia,
      hora_inicio: cursoHoraInicio,
      hora_fin: cursoHoraFin,
      tipo_sesion: cursoTipoSesion,
    });

    setCursoCodigo('');
    setCursoNombre('');
    setCursoDocente('');
    setCursoAula('');
    setModoCrearCurso(false);
    setMensajeExitoCurso(true);
    setTimeout(() => setMensajeExitoCurso(false), 3500);
  };

  // Handlers para matricularse / retirarse (Estudiante con control de límite de 22 o 26 créditos)
  const handleToggleMatricula = (seccionId: string) => {
    if (!estudiante) return;
    const yaMatriculado = AcademicStore.estaMatriculadoEnSeccion(estudiante.id, seccionId);

    if (yaMatriculado) {
      AcademicStore.desmatricularCursoEstudiante(estudiante.id, seccionId);
      setMensajeErrorMatricula(null);
    } else {
      const res = AcademicStore.matricularCursoEstudiante(estudiante.id, seccionId);
      if (!res.success) {
        setMensajeErrorMatricula(res.error || 'No se pudo registrar la matrícula.');
        setTimeout(() => setMensajeErrorMatricula(null), 5500);
      } else {
        setMensajeErrorMatricula(null);
      }
    }
  };

  // Handlers para eventos
  const handleToggleInscripcionEvento = (eventoId: string) => {
    if (!estudiante) return;
    const estaInscrito = AcademicStore.estaInscritoEnEvento(estudiante.id, eventoId);

    if (estaInscrito) {
      AcademicStore.desinscribirEstudianteEvento(estudiante.id, eventoId);
      setMensajeEventoFeedback('Has cancelado tu inscripción en el evento.');
    } else {
      AcademicStore.inscribirEstudianteEvento(estudiante.id, eventoId);
      setMensajeEventoFeedback('¡Has sido inscrito exitosamente al evento!');
    }
    setTimeout(() => setMensajeEventoFeedback(null), 3000);
  };

  const handleCrearEventoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evTitulo.trim() || !evLugar.trim()) return;

    AcademicStore.crearEvento({
      titulo: evTitulo.trim(),
      categoria: evCategoria,
      fecha: evFecha,
      hora: evHora,
      lugar: evLugar.trim(),
      organizador: evOrganizador.trim(),
      descripcion: evDescripcion.trim() || 'Evento oficial de la Universidad Nacional de Trujillo.',
      inscripcion_requerida: true,
    });

    setEvTitulo('');
    setEvDescripcion('');
    setModoCrearEvento(false);
    setMensajeEventoFeedback('¡Nuevo evento universitario publicado en el portal!');
    setTimeout(() => setMensajeEventoFeedback(null), 3500);
  };

  // Handlers para Pagos con Tarjeta
  const handleConfirmarPagoTarjeta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuotaAPagar) return;

    setProcesandoPago(true);
    setTimeout(() => {
      const res = AcademicStore.procesarPagoTarjeta(cuotaAPagar.id, {
        numero: tarjetaNumero,
        titular: tarjetaTitular,
        expiracion: tarjetaExpiracion,
        cvv: tarjetaCvv,
      });

      setProcesandoPago(false);
      setMensajeExitoPago(
        `¡Pago procesado con éxito por S/. ${cuotaAPagar.monto.toFixed(2)}! Comprobante emitido: ${res.comprobante}.`
      );
      setCuotaAPagar(null);
      setTimeout(() => setMensajeExitoPago(null), 4000);
    }, 600);
  };

  // Handlers para Evaluación Docente
  const handleEnviarEvaluacionDocente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docenteCursoEval) return;

    const curso = todosLosCursos.find((c) => c.codigo === docenteCursoEval);
    const sec = todasLasSecciones.find((s) => s.curso_id === curso?.id);

    AcademicStore.registrarEvaluacionDocente({
      estudiante_id: estudiante?.id || 'est_01',
      docente_nombre: sec?.docente_nombre || 'Docente de Cátedra',
      curso_codigo: docenteCursoEval,
      curso_nombre: curso?.nombre || 'Asignatura',
      pregunta_dominio: evalPreg1,
      pregunta_puntualidad: evalPreg2,
      pregunta_disponibilidad: evalPreg3,
      comentario: evalComentario.trim(),
    });

    setMensajeExitoEvaluacion(true);
    setEvalComentario('');
    setTimeout(() => setMensajeExitoEvaluacion(false), 3500);
  };

  // Handlers de Calificaciones (Admin / Docente)
  const handleGuardarCalificacionesAdmin = () => {
    Object.entries(calificacionesForm).forEach(([matId, notas]) => {
      AcademicStore.actualizarCalificaciones(
        matId,
        notas.permanente1,
        notas.parcial,
        notas.permanente2,
        notas.final
      );
    });
    setMensajeGuardadoCalificaciones(true);
    setTimeout(() => setMensajeGuardadoCalificaciones(false), 3000);
  };

  const handleLimpiarCalificaciones = () => {
    AcademicStore.limpiarCalificacionesEstudiante(adminEstudianteSeleccionadoId);
    setCalificacionesForm({});
    setMensajeGuardadoCalificaciones(true);
    setTimeout(() => setMensajeGuardadoCalificaciones(false), 3000);
  };

  // Handlers de Tickets
  const handleCrearTicketEstudiante = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asuntoTicket.trim() || !mensajeTicket.trim()) return;

    AcademicStore.crearTicket({
      estudiante_id: estudiante?.id || 'est_01',
      estudiante_nombre: perfil.nombre_completo,
      codigo_estudiante: estudiante?.codigo_estudiante || '25-260481',
      asunto: asuntoTicket.trim(),
      categoria: categoriaTicket,
      mensaje: mensajeTicket.trim(),
    });

    setAsuntoTicket('');
    setMensajeTicket('');
    setModoCrearTicket(false);
    setMensajeExitoTicket(true);
    setTimeout(() => setMensajeExitoTicket(false), 3500);
  };

  const handleResponderTicketAdmin = (ticketId: string) => {
    const respuesta = respuestasAdmin[ticketId]?.trim();
    if (!respuesta) return;

    AcademicStore.responderTicket(ticketId, respuesta, perfil.nombre_completo);
    setRespuestasAdmin((prev) => ({ ...prev, [ticketId]: '' }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl border-2 border-sky-300 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header en Azul Claro */}
        <div className="bg-gradient-to-r from-sky-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
              {vistaModal === 'informacion' && <User className="w-5 h-5" />}
              {vistaModal === 'matriculas' && <GraduationCap className="w-5 h-5" />}
              {vistaModal === 'tienda' && <ShoppingBag className="w-5 h-5" />}
              {vistaModal === 'eventos' && <CalendarDays className="w-5 h-5" />}
              {vistaModal === 'horarios' && <Clock className="w-5 h-5" />}
              {vistaModal === 'asistencias' && <CheckCircle2 className="w-5 h-5" />}
              {vistaModal === 'mesa_ayuda' && <LifeBuoy className="w-5 h-5" />}
              {vistaModal === 'calificaciones' && <Award className="w-5 h-5" />}
              {vistaModal === 'evaluacion_docente' && <FileCheck2 className="w-5 h-5" />}
              {vistaModal === 'material_cursos' && <BookOpen className="w-5 h-5" />}
              {vistaModal === 'semaforo' && <TrafficCone className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg capitalize">
                {vistaModal === 'informacion' && 'Información del Estudiante'}
                {vistaModal === 'matriculas' && (esAdmin ? 'Gestión y Creación de Cursos y Horarios' : 'Matrículas & Selección de Asignaturas')}
                {vistaModal === 'tienda' && 'Tienda Universitaria & Pago de Pensiones'}
                {vistaModal === 'eventos' && (esAdmin ? 'Gestión y Publicación de Eventos' : 'Eventos Universitarios & Talleres')}
                {vistaModal === 'horarios' && 'Horarios del Estudiante'}
                {vistaModal === 'asistencias' && 'Control de Asistencias'}
                {vistaModal === 'mesa_ayuda' && (esAdmin ? 'Mesa de Ayuda (Panel de Administrador)' : 'Mesa de Ayuda')}
                {vistaModal === 'calificaciones' && (esAdmin ? 'Carga de Calificaciones (Panel de Administrador)' : 'Calificaciones Oficiales')}
                {vistaModal === 'evaluacion_docente' && 'Evaluación del Rendimiento Docente'}
                {vistaModal === 'material_cursos' && 'Material de tus Cursos & Sílabos'}
                {vistaModal === 'semaforo' && 'Semáforo Curricular de Avance'}
              </h3>
              <p className="text-xs text-sky-100">
                {esAdmin ? 'Panel de Control Administrativo' : 'Periodo Académico Activo 2026-I • Semestre 1'}
              </p>
            </div>
          </div>

          <button
            onClick={onCerrar}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-sky-50/20 text-slate-800">

          {/* ================================================================= */}
          {/* MÓDULO: TIENDA & PAGO DE PENSIONES (Total S/. 1,500 en cuotas) */}
          {/* ================================================================= */}
          {vistaModal === 'tienda' && (
            <div className="space-y-4">
              {/* Tarjeta de Resumen Financiero */}
              <div className="bg-white border-2 border-sky-300 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full">
                    Pensión del 1° Semestre Académico
                  </span>
                  <h4 className="text-lg font-black text-sky-950 mt-1">
                    Costo Total del Semestre: S/. 1,500.00
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Monto fraccionado en 5 cuotas mensuales de S/. 300.00 cada una.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl text-center">
                    <span className="block text-[10px] font-bold text-emerald-800 uppercase">Pagado</span>
                    <span className="text-base font-black text-emerald-700">S/. {totalPagado.toFixed(2)}</span>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl text-center">
                    <span className="block text-[10px] font-bold text-amber-800 uppercase">Por Pagar</span>
                    <span className="text-base font-black text-amber-700">S/. {totalDeuda.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {mensajeExitoPago && (
                <div className="bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-bold px-4 py-3 rounded-2xl flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                  <span>{mensajeExitoPago}</span>
                </div>
              )}

              {/* MODAL PASARELA DE PAGO CON TARJETA */}
              {cuotaAPagar && (
                <div className="bg-white border-2 border-sky-500 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-sky-100">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-sky-600" />
                      <h5 className="font-bold text-sm text-sky-950">
                        Pasarela de Pago Seguro • {cuotaAPagar.concepto}
                      </h5>
                    </div>
                    <button
                      onClick={() => setCuotaAPagar(null)}
                      className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                    >
                      Cancelar
                    </button>
                  </div>

                  <form onSubmit={handleConfirmarPagoTarjeta} className="space-y-4">
                    <div className="bg-sky-50/70 p-3 rounded-2xl border border-sky-200 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-sky-950">{cuotaAPagar.concepto}</p>
                        <p className="text-[11px] text-slate-500">Vencimiento oficial: {cuotaAPagar.fecha_vencimiento}</p>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] text-slate-500 uppercase font-bold">Total a debitar</span>
                        <span className="text-xl font-black text-sky-900">S/. {cuotaAPagar.monto.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                          Número de Tarjeta (Débito o Crédito)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            placeholder="4557 8291 0048 2910"
                            maxLength={19}
                            value={tarjetaNumero}
                            onChange={(e) => {
                              const v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                              const matches = v.match(/\d{4,16}/g);
                              const match = (matches && matches[0]) || '';
                              const parts = [];
                              for (let i = 0, len = match.length; i < len; i += 4) {
                                parts.push(match.substring(i, i + 4));
                              }
                              setTarjetaNumero(parts.length ? parts.join(' ') : v);
                            }}
                            className="w-full bg-white border border-sky-300 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                          <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                            Titular de la Tarjeta
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="JUAN CARLOS PEREZ GOMEZ"
                            value={tarjetaTitular}
                            onChange={(e) => setTarjetaTitular(e.target.value.toUpperCase())}
                            className="w-full bg-white border border-sky-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                            Expiración
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="MM/AA"
                            maxLength={5}
                            value={tarjetaExpiracion}
                            onChange={(e) => setTarjetaExpiracion(e.target.value)}
                            className="w-full bg-white border border-sky-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                        </div>
                      </div>

                      <div className="w-32">
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                          Código CVV
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="•••"
                          maxLength={4}
                          value={tarjetaCvv}
                          onChange={(e) => setTarjetaCvv(e.target.value.replace(/[^0-9]/g, ''))}
                          className="w-full bg-white border border-sky-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-sky-100">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" /> Transacción encriptada TLS 256-bit
                      </span>
                      <button
                        type="submit"
                        disabled={procesandoPago}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2"
                      >
                        {procesandoPago ? 'Procesando pago...' : `Pagar S/. ${cuotaAPagar.monto.toFixed(2)}`}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* LISTA DE CUOTAS */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-sky-900">
                  Cuotas de Pensión del Semestre 1 ({pagosEstudiante.length} Cuotas de S/. 300.00)
                </h5>

                <div className="space-y-2.5">
                  {pagosEstudiante.map((p) => {
                    const estaPagado = p.estado === 'PAGADO';

                    return (
                      <div
                        key={p.id}
                        className={`rounded-2xl p-4 border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          estaPagado
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-white border-sky-200 shadow-xs'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-sm text-slate-900">{p.concepto}</h5>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                estaPagado
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : 'bg-amber-100 text-amber-800 border-amber-300'
                              }`}
                            >
                              ● {estaPagado ? 'PAGADO ✓' : 'SIN PAGAR (PENDIENTE)'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Vencimiento: <strong>{p.fecha_vencimiento}</strong>
                            {p.comprobante_numero && (
                              <span className="ml-2 font-mono text-emerald-700">
                                • Recibo: {p.comprobante_numero} ({p.fecha_pago})
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                          <span className="text-base font-black text-sky-950">
                            S/. {p.monto.toFixed(2)}
                          </span>

                          {!estaPagado ? (
                            <button
                              onClick={() => {
                                setCuotaAPagar(p);
                                if (!tarjetaNumero) setTarjetaNumero('4557 8291 0048 2910');
                              }}
                              className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              Pagar Cuota
                            </button>
                          ) : (
                            <span className="text-xs font-bold text-emerald-700 bg-white border border-emerald-300 px-3 py-1 rounded-xl">
                              ✓ Al Día
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* MÓDULO: EVENTOS UNIVERSITARIOS (Inscribir, desinscribir y crear admin) */}
          {/* ================================================================= */}
          {vistaModal === 'eventos' && (
            <div className="space-y-4">
              <div className="bg-sky-100/70 border border-sky-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-sky-950 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-sky-700" />
                    Eventos, Seminarios & Ferias Universitarias
                  </h4>
                  <p className="text-xs text-sky-800 mt-0.5">
                    {esAdmin
                      ? 'Como administrador puedes crear nuevos eventos para la comunidad universitaria.'
                      : 'Participa en las actividades académicas y extracurriculares de la UNTI.'}
                  </p>
                </div>

                {esAdmin && !modoCrearEvento && (
                  <button
                    onClick={() => setModoCrearEvento(true)}
                    className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 shrink-0"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Crear Nuevo Evento
                  </button>
                )}
              </div>

              {mensajeEventoFeedback && (
                <div className="bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>{mensajeEventoFeedback}</span>
                </div>
              )}

              {/* FORMULARIO DE CREACIÓN DE EVENTO (ADMIN) */}
              {esAdmin && modoCrearEvento && (
                <form
                  onSubmit={handleCrearEventoSubmit}
                  className="bg-white border-2 border-sky-300 rounded-2xl p-5 shadow-xs space-y-3.5 animate-in fade-in"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-sky-100">
                    <h5 className="font-bold text-sm text-sky-950 flex items-center gap-1.5">
                      <PlusCircle className="w-4 h-4 text-sky-600" />
                      Publicar Nuevo Evento Universitario
                    </h5>
                    <button
                      type="button"
                      onClick={() => setModoCrearEvento(false)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Título del Evento
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Conferencia Internacional de Inteligencia Artificial"
                        value={evTitulo}
                        onChange={(e) => setEvTitulo(e.target.value)}
                        className="w-full bg-sky-50 border border-sky-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Categoría
                      </label>
                      <select
                        value={evCategoria}
                        onChange={(e) => setEvCategoria(e.target.value as any)}
                        className="w-full bg-sky-50 border border-sky-300 rounded-xl px-2 py-1.5 text-xs text-slate-900 focus:bg-white font-medium"
                      >
                        <option value="ACADEMICO">Académico</option>
                        <option value="CONFERENCIA">Conferencia</option>
                        <option value="CULTURAL">Cultural</option>
                        <option value="DEPORTIVO">Deportivo</option>
                        <option value="FERIA">Feria</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Fecha
                      </label>
                      <input
                        type="date"
                        required
                        value={evFecha}
                        onChange={(e) => setEvFecha(e.target.value)}
                        className="w-full bg-sky-50 border border-sky-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Horario
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="10:00 - 13:00"
                        value={evHora}
                        onChange={(e) => setEvHora(e.target.value)}
                        className="w-full bg-sky-50 border border-sky-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Lugar / Auditorio
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Auditorio Central"
                        value={evLugar}
                        onChange={(e) => setEvLugar(e.target.value)}
                        className="w-full bg-sky-50 border border-sky-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Descripción del Evento
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Detalles sobre ponentes, temario o requisitos de asistencia..."
                      value={evDescripcion}
                      onChange={(e) => setEvDescripcion(e.target.value)}
                      className="w-full bg-sky-50 border border-sky-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-sky-100">
                    <button
                      type="button"
                      onClick={() => setModoCrearEvento(false)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs"
                    >
                      Publicar Evento Oficial
                    </button>
                  </div>
                </form>
              )}

              {/* LISTADO DE EVENTOS */}
              <div className="space-y-3">
                {todosLosEventos.map((ev) => {
                  const estaInscrito = estudiante
                    ? AcademicStore.estaInscritoEnEvento(estudiante.id, ev.id)
                    : false;

                  return (
                    <div
                      key={ev.id}
                      className={`border-2 rounded-2xl p-4.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                        estaInscrito ? 'bg-sky-50/70 border-sky-400' : 'bg-white border-sky-200'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            {ev.categoria}
                          </span>
                          {estaInscrito && (
                            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600" /> Has sido inscrito
                            </span>
                          )}
                        </div>

                        <h5 className="font-bold text-sm sm:text-base text-sky-950">{ev.titulo}</h5>
                        <p className="text-xs text-slate-600">{ev.descripcion}</p>
                        <p className="text-[11px] text-slate-500">
                          📍 {ev.lugar} • ⏰ {ev.hora} • 🗓️ {ev.fecha}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {esAdmin ? (
                          <button
                            onClick={() => AcademicStore.eliminarEvento(ev.id)}
                            className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 p-2 hover:bg-rose-50 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4" /> Eliminar
                          </button>
                        ) : estaInscrito ? (
                          <button
                            onClick={() => handleToggleInscripcionEvento(ev.id)}
                            className="bg-white border-2 border-rose-300 hover:bg-rose-50 text-rose-700 font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-xs"
                          >
                            Desinscribirme
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleInscripcionEvento(ev.id)}
                            className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs"
                          >
                            Inscribirme
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* MÓDULO: EVALUACIÓN DOCENTE (Forms 3 preguntas 1-5 + comentarios) */}
          {/* ================================================================= */}
          {vistaModal === 'evaluacion_docente' && (
            <div className="space-y-4">
              <div className="bg-sky-100/70 border border-sky-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-sky-950 flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-sky-700" />
                    Encuesta de Rendimiento y Calidad Docente
                  </h4>
                  <p className="text-xs text-sky-800 mt-0.5">
                    Tu opinión es confidencial y permite mejorar la calidad académica en cada asignatura.
                  </p>
                </div>
                <span className="text-xs font-bold text-sky-900 bg-white px-3 py-1 rounded-xl border border-sky-300">
                  Escala: 1 (Deficiente) al 5 (Excelente)
                </span>
              </div>

              {mensajeExitoEvaluacion && (
                <div className="bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-bold px-4 py-3 rounded-2xl flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                  <span>¡Tu evaluación docente fue registrada exitosamente! Muchas gracias por tus aportes.</span>
                </div>
              )}

              {/* FORMULARIO DE EVALUACIÓN */}
              <form
                onSubmit={handleEnviarEvaluacionDocente}
                className="bg-white border-2 border-sky-300 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5"
              >
                {/* Selector de Docente y Asignatura */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-sky-900 uppercase">
                    1. Selecciona la Asignatura y Docente a Evaluar:
                  </label>
                  <select
                    required
                    value={docenteCursoEval}
                    onChange={(e) => setDocenteCursoEval(e.target.value)}
                    className="w-full bg-sky-50 border border-sky-300 text-slate-900 text-xs font-bold rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="">-- Elige un curso y docente --</option>
                    {todosLosCursos.map((c) => {
                      const sec = todasLasSecciones.find((s) => s.curso_id === c.id);
                      return (
                        <option key={c.id} value={c.codigo}>
                          {c.codigo} - {c.nombre} • Docente: {sec?.docente_nombre || 'Docente de cátedra'}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Las 3 Preguntas de Calificación del 1 al 5 */}
                <div className="space-y-4 pt-2 border-t border-sky-100">
                  {/* Pregunta 1 */}
                  <div className="bg-sky-50/60 p-3.5 rounded-2xl border border-sky-200 space-y-2">
                    <p className="text-xs font-bold text-sky-950">
                      Pregunta 1: Dominio del tema y claridad pedagógica
                    </p>
                    <p className="text-[11px] text-slate-600">
                      ¿El docente demuestra dominio del contenido y explica los temas con metodología clara?
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setEvalPreg1(val)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 border ${
                            evalPreg1 === val
                              ? 'bg-sky-600 text-white border-sky-700 shadow-xs'
                              : 'bg-white text-slate-700 border-sky-200 hover:bg-sky-100'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${evalPreg1 === val ? 'fill-amber-300 text-amber-300' : 'text-slate-400'}`} />
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pregunta 2 */}
                  <div className="bg-sky-50/60 p-3.5 rounded-2xl border border-sky-200 space-y-2">
                    <p className="text-xs font-bold text-sky-950">
                      Pregunta 2: Puntualidad y cumplimiento del sílabo
                    </p>
                    <p className="text-[11px] text-slate-600">
                      ¿El docente inicia sus sesiones a tiempo y avanza conforme a los temas y semanas programadas?
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setEvalPreg2(val)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 border ${
                            evalPreg2 === val
                              ? 'bg-sky-600 text-white border-sky-700 shadow-xs'
                              : 'bg-white text-slate-700 border-sky-200 hover:bg-sky-100'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${evalPreg2 === val ? 'fill-amber-300 text-amber-300' : 'text-slate-400'}`} />
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pregunta 3 */}
                  <div className="bg-sky-50/60 p-3.5 rounded-2xl border border-sky-200 space-y-2">
                    <p className="text-xs font-bold text-sky-950">
                      Pregunta 3: Disponibilidad para consultas y retroalimentación
                    </p>
                    <p className="text-[11px] text-slate-600">
                      ¿El docente responde dudas académicas con respeto, retroalimenta tareas y apoya el aprendizaje?
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setEvalPreg3(val)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 border ${
                            evalPreg3 === val
                              ? 'bg-sky-600 text-white border-sky-700 shadow-xs'
                              : 'bg-white text-slate-700 border-sky-200 hover:bg-sky-100'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${evalPreg3 === val ? 'fill-amber-300 text-amber-300' : 'text-slate-400'}`} />
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Comentarios del Alumno */}
                <div className="space-y-1.5 pt-2 border-t border-sky-100">
                  <label className="block text-xs font-bold text-sky-900 uppercase">
                    Comentarios u Observaciones sobre el Rendimiento del Profesor:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Escribe sugerencias de mejora, aspectos destacados o comentarios sobre las clases y metodología del profesor..."
                    value={evalComentario}
                    onChange={(e) => setEvalComentario(e.target.value)}
                    className="w-full bg-sky-50 border border-sky-300 rounded-xl p-3 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={!docenteCursoEval}
                    className="bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Enviar Evaluación Docente
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================================================================= */}
          {/* MÓDULO: MATRÍCULAS & CREACIÓN DE CURSOS (Admin crea, Estudiante elige) */}
          {/* ================================================================= */}
          {vistaModal === 'matriculas' && (
            <div className="space-y-4">
              {/* CASO A: VISTA DEL ADMINISTRADOR (CREAR CURSOS Y ASIGNAR HORARIOS) */}
              {esAdmin ? (
                <div className="space-y-4">
                  <div className="bg-sky-100/70 border border-sky-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-sky-950 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-sky-700" />
                        Catálogo de Asignaturas & Programación de Horarios
                      </h4>
                      <p className="text-xs text-sky-800 mt-0.5">
                        Como administrador puedes registrar nuevos cursos, asignarles docentes, aulas y horarios semanales.
                      </p>
                    </div>

                    {!modoCrearCurso && (
                      <button
                        onClick={() => setModoCrearCurso(true)}
                        className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Crear Nuevo Curso y Horario
                      </button>
                    )}
                  </div>

                  {mensajeExitoCurso && (
                    <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 animate-in fade-in">
                      <Check className="w-4 h-4 text-emerald-700" />
                      <span>¡Asignatura y horario asignados exitosamente al catálogo institucional! Los estudiantes ya pueden elegirla.</span>
                    </div>
                  )}

                  {/* FORMULARIO DE CREACIÓN DE CURSO Y HORARIO */}
                  {modoCrearCurso && (
                    <form
                      onSubmit={handleCrearCursoSubmit}
                      className="bg-white border-2 border-sky-300 rounded-2xl p-5 shadow-xs space-y-4 animate-in fade-in"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-sky-100">
                        <h5 className="font-bold text-sm text-sky-950 flex items-center gap-1.5">
                          <PlusCircle className="w-4 h-4 text-sky-600" />
                          Crear Asignatura y Programar Horario Oficial
                        </h5>
                        <button
                          type="button"
                          onClick={() => setModoCrearCurso(false)}
                          className="text-xs text-slate-400 hover:text-slate-600"
                        >
                          Cancelar
                        </button>
                      </div>

                      {/* 1. Datos de la Asignatura */}
                      <div className="space-y-2">
                        <p className="text-[11px] font-bold text-sky-900 uppercase tracking-wider">
                          1. Información del Curso:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600">CÓDIGO (Ej: SI-101)</label>
                            <input
                              type="text"
                              required
                              placeholder="SI-101"
                              value={cursoCodigo}
                              onChange={(e) => setCursoCodigo(e.target.value)}
                              className="w-full bg-sky-50 border border-sky-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 uppercase font-mono font-bold focus:bg-white"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-slate-600">NOMBRE DE LA ASIGNATURA</label>
                            <input
                              type="text"
                              required
                              placeholder="Ej: Introducción a la Ingeniería de Sistemas"
                              value={cursoNombre}
                              onChange={(e) => setCursoNombre(e.target.value)}
                              className="w-full bg-sky-50 border border-sky-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600">CRÉDITOS</label>
                            <input
                              type="number"
                              min="1"
                              max="6"
                              required
                              value={cursoCreditos}
                              onChange={(e) => setCursoCreditos(Number(e.target.value))}
                              className="w-full bg-sky-50 border border-sky-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600">CICLO</label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              required
                              value={cursoCiclo}
                              onChange={(e) => setCursoCiclo(Number(e.target.value))}
                              className="w-full bg-sky-50 border border-sky-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600">TIPO</label>
                            <select
                              value={cursoTipo}
                              onChange={(e) => setCursoTipo(e.target.value as any)}
                              className="w-full bg-sky-50 border border-sky-300 rounded-xl px-2 py-1.5 text-xs text-slate-900 focus:bg-white font-medium"
                            >
                              <option value="OBLIGATORIO">Obligatorio</option>
                              <option value="ELECTIVO">Electivo</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* 2. Sección y Docente */}
                      <div className="space-y-2 pt-2 border-t border-sky-100">
                        <p className="text-[11px] font-bold text-sky-900 uppercase tracking-wider">
                          2. Sección y Docente Responsable:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="block text-[10px] font-bold text-slate-600 uppercase">Nombre del Docente</label>
                              {docentesPreviamenteUsados.length > 0 && (
                                <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                                  {docentesPreviamenteUsados.length} Registrados
                                </span>
                              )}
                            </div>

                            {/* Menú desplegable con profesores previamente utilizados */}
                            {docentesPreviamenteUsados.length > 0 && (
                              <div>
                                <select
                                  onChange={(e) => {
                                    if (e.target.value) setCursoDocente(e.target.value);
                                  }}
                                  defaultValue=""
                                  className="w-full bg-white border-2 border-sky-300 text-sky-950 font-bold text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-sky-500 shadow-xs"
                                >
                                  <option value="">📋 Seleccionar profesor ya utilizado...</option>
                                  {docentesPreviamenteUsados.map((d) => (
                                    <option key={d} value={d}>
                                      👨‍🏫 {d}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            <input
                              type="text"
                              list="docentes-lista-sugerida"
                              required
                              placeholder="Ej: Dr. Manuel Benítez Vargas (o escribir uno nuevo)"
                              value={cursoDocente}
                              onChange={(e) => setCursoDocente(e.target.value)}
                              className="w-full bg-sky-50 border border-sky-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white font-medium"
                            />
                            <datalist id="docentes-lista-sugerida">
                              {docentesPreviamenteUsados.map((d) => (
                                <option key={d} value={d} />
                              ))}
                            </datalist>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-slate-600 uppercase">Sección</label>
                            <input
                              type="text"
                              required
                              placeholder="SEC-A"
                              value={cursoSeccion}
                              onChange={(e) => setCursoSeccion(e.target.value)}
                              className="w-full bg-sky-50 border border-sky-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 uppercase font-bold focus:bg-white"
                            />
                            <p className="text-[10px] text-slate-500">Ejemplo: SEC-A, SEC-B o GRUPO-1</p>
                          </div>
                        </div>
                      </div>

                      {/* 3. Programación de Horario */}
                      <div className="space-y-2 pt-2 border-t border-sky-100">
                        <p className="text-[11px] font-bold text-sky-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-sky-600" />
                          3. Asignación de Horario y Aula:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase">Día de la Semana</label>
                            <select
                              value={cursoDia}
                              onChange={(e) => setCursoDia(Number(e.target.value) as DiaSemana)}
                              className="w-full bg-sky-50 border border-sky-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white font-medium"
                            >
                              <option value={1}>Lunes</option>
                              <option value={2}>Martes</option>
                              <option value={3}>Miércoles</option>
                              <option value={4}>Jueves</option>
                              <option value={5}>Viernes</option>
                              <option value={6}>Sábado</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase">Hora Inicio</label>
                            <input
                              type="time"
                              required
                              value={cursoHoraInicio}
                              onChange={(e) => setCursoHoraInicio(e.target.value)}
                              className="w-full bg-sky-50 border border-sky-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase">Hora Fin</label>
                            <input
                              type="time"
                              required
                              value={cursoHoraFin}
                              onChange={(e) => setCursoHoraFin(e.target.value)}
                              className="w-full bg-sky-50 border border-sky-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="block text-[10px] font-bold text-slate-600 uppercase">Aula / Laboratorio</label>
                              {aulasPreviamenteUsadas.length > 0 && (
                                <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                                  {aulasPreviamenteUsadas.length} Registradas
                                </span>
                              )}
                            </div>

                            {/* Menú desplegable con aulas previamente utilizadas */}
                            {aulasPreviamenteUsadas.length > 0 && (
                              <div>
                                <select
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      setCursoAula(e.target.value);
                                      if (e.target.value.includes('Pabellón A')) setCursoPabellon('Pabellón A');
                                      else if (e.target.value.includes('Pabellón B')) setCursoPabellon('Pabellón B');
                                      else if (e.target.value.includes('Pabellón C')) setCursoPabellon('Pabellón C');
                                    }
                                  }}
                                  defaultValue=""
                                  className="w-full bg-white border-2 border-sky-300 text-sky-950 font-bold text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-sky-500 shadow-xs"
                                >
                                  <option value="">🏛️ Seleccionar aula o laboratorio ya utilizado...</option>
                                  {aulasPreviamenteUsadas.map((a) => (
                                    <option key={a} value={a}>
                                      📍 {a}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            <input
                              type="text"
                              list="aulas-lista-sugerida"
                              required
                              placeholder="Ej: Pabellón A - Lab Cómputo Especializado 3 (o escribe una nueva)"
                              value={cursoAula}
                              onChange={(e) => setCursoAula(e.target.value)}
                              className="w-full bg-sky-50 border border-sky-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white font-medium"
                            />
                            <datalist id="aulas-lista-sugerida">
                              {aulasPreviamenteUsadas.map((a) => (
                                <option key={a} value={a} />
                              ))}
                            </datalist>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-slate-600 uppercase">Tipo de Sesión</label>
                            <select
                              value={cursoTipoSesion}
                              onChange={(e) => setCursoTipoSesion(e.target.value as any)}
                              className="w-full bg-sky-50 border border-sky-300 rounded-xl px-2 py-1.5 text-xs text-slate-900 focus:bg-white font-medium"
                            >
                              <option value="TEORIA">Teoría</option>
                              <option value="LABORATORIO">Laboratorio</option>
                              <option value="PRACTICA">Práctica</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-sky-100">
                        <button
                          type="button"
                          onClick={() => setModoCrearCurso(false)}
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          Crear Asignatura y Asignar Horario
                        </button>
                      </div>
                    </form>
                  )}

                  {/* LISTADO DE CURSOS Y HORARIOS EN EL CATÁLOGO */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-sky-900">
                      Asignaturas Vigentes en el Catálogo ({todosLosCursos.length} Cursos Registrados)
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {todosLosCursos.map((c) => {
                        const sec = todasLasSecciones.find((s) => s.curso_id === c.id);
                        const horariosCurso = sec ? todosLosHorarios.filter((h) => h.seccion_id === sec.id) : [];

                        return (
                          <div
                            key={c.id}
                            className="bg-white border-2 border-sky-200 rounded-2xl p-4 shadow-xs space-y-2.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                                {c.codigo}
                              </span>
                              <span className="text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
                                {sec?.matriculados || 0} alumnos matriculados
                              </span>
                            </div>

                            <h5 className="font-bold text-sm text-sky-950">{c.nombre}</h5>

                            <div className="text-xs text-slate-600 space-y-1">
                              <p>Docente: <strong>{sec?.docente_nombre}</strong> (Sección {sec?.codigo_seccion})</p>
                              <p>Créditos: <strong>{c.creditos}</strong> • Ciclo: <strong>{c.ciclo}° Semestre</strong></p>
                            </div>

                            {/* Horario asignado */}
                            {horariosCurso.length > 0 && (
                              <div className="p-2 rounded-xl bg-sky-50 border border-sky-100 text-[11px] text-sky-900 space-y-0.5">
                                <p className="font-bold text-[10px] text-sky-800 uppercase flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-sky-600" /> Horario Asignado:
                                </p>
                                {horariosCurso.map((h) => (
                                  <p key={h.id}>
                                    • {h.dia_nombre} {h.hora_inicio} - {h.hora_fin} ({h.aula}) [{h.tipo_sesion}]
                                  </p>
                                ))}
                              </div>
                            )}

                            <div className="pt-2 flex justify-end border-t border-sky-100">
                              <button
                                onClick={() => AcademicStore.eliminarCurso(c.id)}
                                className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Eliminar Asignatura
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* CASO B: VISTA DEL ESTUDIANTE (Por defecto NO tiene cursos; elige del catálogo) */
                <div className="space-y-4">
                  {/* Resumen del estudiante */}
                  <div className="bg-sky-100/70 border-2 border-sky-300 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          infoCreditos.calificaPara26
                            ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                            : 'bg-sky-100 text-sky-800 border-sky-300'
                        }`}>
                          {infoCreditos.calificaPara26
                            ? '⭐ Promedio > 14: Límite Ampliado a 26 Créditos'
                            : 'Límite Inicial: 22 Créditos Base'}
                        </span>
                        {infoCreditos.promedioGeneral > 0 ? (
                          <span className="text-[11px] font-bold text-sky-900 bg-white px-2 py-0.5 rounded-md border border-sky-200">
                            Promedio Ponderado: {infoCreditos.promedioGeneral.toFixed(2)} / 20.00
                          </span>
                        ) : (
                          <span className="text-[11px] text-sky-700 italic">
                            (Sin notas registradas aún • Promedio 0.00)
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm sm:text-base font-black text-sky-950 flex items-center gap-2 mt-1.5">
                        <GraduationCap className="w-5 h-5 text-sky-700" />
                        Matrícula en Línea (Periodo 2026-I • 1° Ciclo)
                      </h4>
                      <p className="text-xs text-sky-800 mt-1 max-w-xl">
                        Todo estudiante inicia en 1° semestre con un límite de <strong>22 créditos</strong>. Si tu promedio total de calificaciones es <strong>mayor a 14.00 puntos</strong>, puedes llevar hasta <strong>26 créditos</strong>.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      <div className="bg-white border-2 border-sky-300 px-3.5 py-2 rounded-xl text-center shadow-xs">
                        <span className="block text-[10px] text-slate-500 font-bold uppercase">Cursos Elegidos</span>
                        <span className="text-base font-black text-sky-900">{matriculasAlumno.length}</span>
                      </div>
                      <div className={`px-3.5 py-2 rounded-xl text-center shadow-xs border-2 ${
                        infoCreditos.creditosActuales >= infoCreditos.maxCreditos
                          ? 'bg-amber-50 border-amber-300 text-amber-950'
                          : 'bg-white border-sky-300 text-sky-900'
                      }`}>
                        <span className="block text-[10px] font-bold uppercase text-slate-500">Créditos</span>
                        <span className="text-base font-black">
                          {infoCreditos.creditosActuales} / {infoCreditos.maxCreditos}
                        </span>
                      </div>
                      {matriculasAlumno.length === 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (estudiante) {
                              AcademicStore.cargarMallaBase22Creditos(estudiante.id);
                            }
                          }}
                          className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5"
                          title="Cargar automáticamente los 22 créditos base del 1° semestre"
                        >
                          <span>⚡ Cargar 22 Créditos Base</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {mensajeErrorMatricula && (
                    <div className="bg-rose-100 border-2 border-rose-300 text-rose-950 text-xs font-bold px-4 py-3 rounded-2xl flex items-center gap-2 animate-in fade-in">
                      <AlertCircle className="w-5 h-5 text-rose-700 shrink-0" />
                      <span>{mensajeErrorMatricula}</span>
                    </div>
                  )}

                  {/* Catálogo de Cursos Creados para Elegir */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-sky-900">
                      Asignaturas Disponibles en el Catálogo ({todosLosCursos.length} Asignaturas Creadas)
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {todosLosCursos.map((c) => {
                        const sec = todasLasSecciones.find((s) => s.curso_id === c.id);
                        const horariosCurso = sec ? todosLosHorarios.filter((h) => h.seccion_id === sec.id) : [];
                        const yaMatriculado = sec && estudiante ? AcademicStore.estaMatriculadoEnSeccion(estudiante.id, sec.id) : false;

                        return (
                          <div
                            key={c.id}
                            className={`rounded-2xl p-4.5 border-2 transition-all duration-200 flex flex-col justify-between ${
                              yaMatriculado
                                ? 'bg-sky-50/80 border-sky-500 shadow-xs'
                                : 'bg-white border-sky-200 hover:border-sky-300 shadow-xs'
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                                  {c.codigo}
                                </span>
                                {yaMatriculado ? (
                                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                    <Check className="w-3 h-3 text-emerald-600" /> Matriculado
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                    Disponible ({sec?.cupo_maximo ? sec.cupo_maximo - sec.matriculados : 35} vacantes)
                                  </span>
                                )}
                              </div>

                              <h5 className="font-bold text-sm text-sky-950">{c.nombre}</h5>

                              <div className="text-xs text-slate-600 space-y-0.5">
                                <p>Docente: <strong>{sec?.docente_nombre}</strong> (Sección {sec?.codigo_seccion})</p>
                                <p>Créditos: <strong>{c.creditos}</strong> • Ciclo: <strong>{c.ciclo}° Semestre</strong></p>
                              </div>

                              {/* Horario asignado por el admin */}
                              {horariosCurso.length > 0 && (
                                <div className="p-2.5 rounded-xl bg-white border border-sky-200 text-xs text-sky-900 space-y-1">
                                  <p className="font-bold text-[10px] text-sky-800 uppercase flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-sky-600" /> Horario Oficial:
                                  </p>
                                  {horariosCurso.map((h) => (
                                    <p key={h.id} className="text-[11px]">
                                      • <strong>{h.dia_nombre}:</strong> {h.hora_inicio} - {h.hora_fin} ({h.aula}) [{h.tipo_sesion}]
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Botón de Matricularme / Retirar */}
                            <div className="mt-4 pt-3 border-t border-sky-100 flex items-center justify-between">
                              {yaMatriculado ? (
                                <>
                                  <span className="text-xs font-semibold text-emerald-800">
                                    Asignatura en tu carga académica
                                  </span>
                                  <button
                                    onClick={() => sec && handleToggleMatricula(sec.id)}
                                    className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline"
                                  >
                                    Retirar asignatura
                                  </button>
                                </>
                              ) : (
                                <>
                                  <span className="text-xs text-slate-500">¿Deseas llevar este curso?</span>
                                  <button
                                    onClick={() => sec && handleToggleMatricula(sec.id)}
                                    className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-1"
                                  >
                                    + Matricularme
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* MÓDULO: CALIFICACIONES (Vacío inicialmente; solo admin llena) */}
          {/* ================================================================= */}
          {/* ================================================================= */}
          {/* MÓDULO: CALIFICACIONES (Permanente 1, Parcial, Permanente 2, Final) */}
          {/* ================================================================= */}
          {vistaModal === 'calificaciones' && (() => {
            const puedeGestionarNotas = esAutoridad || modoProfesorCalificaciones;

            return (
              <div className="space-y-4">
                {/* Selector de Modo: Estudiante vs Docente/Profesor */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sky-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-sky-900">Vista activa:</span>
                    <div className="flex items-center gap-1.5 bg-sky-100/80 p-1 rounded-xl border border-sky-300">
                      <button
                        type="button"
                        onClick={() => setModoProfesorCalificaciones(false)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                          !modoProfesorCalificaciones
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'text-sky-900 hover:bg-white/60'
                        }`}
                      >
                        Boleta del Estudiante
                      </button>
                      <button
                        type="button"
                        onClick={() => setModoProfesorCalificaciones(true)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                          modoProfesorCalificaciones
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'text-sky-900 hover:bg-white/60'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Modo Docente (Ingreso de Notas)
                      </button>
                    </div>
                  </div>

                  {/* Banner de Créditos según Promedio */}
                  <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                    infoCreditos.calificaPara26
                      ? 'bg-amber-50 text-amber-950 border-amber-300'
                      : 'bg-sky-50 text-sky-900 border-sky-300'
                  }`}>
                    <span>
                      {infoCreditos.calificaPara26
                        ? `⭐ Promedio: ${infoCreditos.promedioGeneral.toFixed(2)} (> 14) → Capacidad: 26 Créditos`
                        : `Límite Base: 22 Créditos (Promedio: ${infoCreditos.promedioGeneral.toFixed(2)} ≤ 14)`}
                    </span>
                  </div>
                </div>

                {!puedeGestionarNotas ? (
                  /* VISTA DE LA BOLETA DEL ESTUDIANTE */
                  matriculasAlumno.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-sky-300 rounded-3xl p-8 sm:p-10 text-center space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto shadow-xs">
                        <GraduationCap className="w-8 h-8" />
                      </div>
                      <div className="max-w-md mx-auto space-y-1.5">
                        <h4 className="text-base sm:text-lg font-bold text-sky-950">
                          Aún no estás matriculado en ninguna asignatura
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Todo estudiante inicia en 1° semestre con <strong>22 créditos</strong> permitidos. Selecciona tus asignaturas en el módulo de <strong>Matrículas</strong> para ver tus calificaciones.
                        </p>
                      </div>
                      <div className="pt-2 flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (estudiante) {
                              AcademicStore.cargarMallaBase22Creditos(estudiante.id);
                            }
                          }}
                          className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition"
                        >
                          ⚡ Cargar 22 Créditos Base Sugeridos
                        </button>
                      </div>
                    </div>
                  ) : matriculasConNota.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-sky-300 rounded-3xl p-8 sm:p-10 text-center space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto shadow-xs">
                        <Award className="w-8 h-8" />
                      </div>
                      <div className="max-w-md mx-auto space-y-1.5">
                        <h4 className="text-base sm:text-lg font-bold text-sky-950">
                          Sin calificaciones registradas para el ciclo 2026-I
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Tienes {matriculasAlumno.length} asignaturas matriculadas ({totalCreditosMatriculados} créditos). El docente de cátedra o administrador registrará las evaluaciones: <strong>Permanente 1, Parcial, Permanente 2 y Final</strong>.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setModoProfesorCalificaciones(true)}
                        className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Abrir Modo Docente para Ingresar o Probar Notas</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Banner de Límite de Créditos según Calificación */}
                      <div className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        infoCreditos.calificaPara26
                          ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                          : 'bg-sky-50 border-sky-300 text-sky-950'
                      }`}>
                        <div>
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            infoCreditos.calificaPara26
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-sky-200 text-sky-900'
                          }`}>
                            {infoCreditos.calificaPara26 ? '⭐ RENDIMIENTO DESTACADO' : 'ESTUDIANTE REGULAR'}
                          </span>
                          <h5 className="font-black text-sm mt-1">
                            Promedio General Ponderado: {infoCreditos.promedioGeneral.toFixed(2)} / 20.00
                          </h5>
                          <p className="text-xs text-slate-700 mt-0.5">
                            {infoCreditos.calificaPara26
                              ? '¡Tu promedio es mayor a 14.00 puntos! Tienes autorización institucional para matricularte en hasta 26 créditos.'
                              : 'Inicias con 22 créditos. Para ampliar tu límite a 26 créditos, tu promedio de calificaciones debe ser mayor a 14.00 puntos.'}
                          </p>
                        </div>
                        <div className="shrink-0 bg-white border-2 border-sky-300 px-4 py-2 rounded-xl text-center shadow-xs">
                          <span className="block text-[10px] text-slate-500 font-bold uppercase">Límite Permitido</span>
                          <span className="text-lg font-black text-sky-900">
                            {infoCreditos.maxCreditos} Créditos
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-sky-900">
                            Boleta Oficial de Asignaturas y Evaluaciones (2026-I)
                          </h4>
                          <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300">
                            ✓ Actas Oficiales Validadas
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {matriculasConNota.map((m) => {
                            const sec = todasLasSecciones.find((s) => s.id === m.seccion_id);
                            const cur = sec ? todosLosCursos.find((c) => c.id === sec.curso_id) : undefined;
                            const esAprobado = (m.nota_promedio ?? 0) >= 10.5;

                            return (
                              <div
                                key={m.id}
                                className="bg-white border-2 border-sky-200 rounded-2xl p-4 shadow-xs space-y-3"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-xs font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                                      {cur?.codigo}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-medium">
                                      {cur?.creditos} créditos
                                    </span>
                                  </div>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                      esAprobado
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                        : 'bg-rose-50 text-rose-700 border-rose-300'
                                    }`}
                                  >
                                    {esAprobado ? 'APROBADO' : 'DESAPROBADO'}
                                  </span>
                                </div>

                                <h5 className="font-bold text-sm text-sky-950">{cur?.nombre}</h5>

                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-sky-100 text-center">
                                  <div className="bg-sky-50/70 p-1.5 rounded-lg border border-sky-100">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Perm. 1</p>
                                    <p className="text-sm font-black text-sky-900">
                                      {m.nota_permanente_1 !== undefined ? m.nota_permanente_1.toFixed(1) : '-'}
                                    </p>
                                  </div>
                                  <div className="bg-sky-50/70 p-1.5 rounded-lg border border-sky-100">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Parcial</p>
                                    <p className="text-sm font-black text-sky-900">
                                      {m.nota_parcial !== undefined ? m.nota_parcial.toFixed(1) : '-'}
                                    </p>
                                  </div>
                                  <div className="bg-sky-50/70 p-1.5 rounded-lg border border-sky-100">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Perm. 2</p>
                                    <p className="text-sm font-black text-sky-900">
                                      {m.nota_permanente_2 !== undefined ? m.nota_permanente_2.toFixed(1) : '-'}
                                    </p>
                                  </div>
                                  <div className="bg-sky-50/70 p-1.5 rounded-lg border border-sky-100">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Final</p>
                                    <p className="text-sm font-black text-sky-900">
                                      {m.nota_final !== undefined ? m.nota_final.toFixed(1) : '-'}
                                    </p>
                                  </div>
                                  <div className="bg-sky-100/90 p-1.5 rounded-lg border border-sky-300 col-span-2 sm:col-span-1">
                                    <p className="text-[10px] text-sky-800 uppercase font-black">Promedio</p>
                                    <p className="text-sm font-black text-sky-950">
                                      {m.nota_promedio !== undefined ? m.nota_promedio.toFixed(1) : '-'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  /* VISTA DEL DOCENTE / PROFESOR PARA LLENAR NOTAS */
                  <div className="space-y-4">
                    <div className="bg-sky-100/70 border-2 border-sky-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-sky-950 flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-sky-700" />
                          Panel del Docente: Carga de Evaluaciones
                        </h4>
                        <p className="text-xs text-sky-800 mt-0.5">
                          Ingresa las 4 notas oficiales: <strong>Permanente 1, Parcial, Permanente 2 y Final</strong>.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-sky-900 whitespace-nowrap">Estudiante:</label>
                        <select
                          value={adminEstudianteSeleccionadoId}
                          onChange={(e) => setAdminEstudianteSeleccionadoId(e.target.value)}
                          className="bg-white border-2 border-sky-300 text-sky-950 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-sky-500"
                        >
                          <option value="est_01">Juan Carlos Pérez Gómez (25-260481)</option>
                          <option value="est_02">María Elena Torres (25-261192)</option>
                        </select>
                      </div>
                    </div>

                    {/* Barra de Acciones Rápidas y Simulación */}
                    <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 shadow-xs">
                      <span className="text-xs font-bold text-sky-900">
                        Simuladores de regla de créditos (22 vs 26):
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            AcademicStore.simularCalificacionesEstudiante(adminEstudianteSeleccionadoId, 'SOBRESALIENTE');
                            const mats = AcademicStore.obtenerMatriculasPorEstudiante(adminEstudianteSeleccionadoId);
                            const updatedForm: any = {};
                            mats.forEach((m) => {
                              updatedForm[m.id] = {
                                permanente1: m.nota_permanente_1,
                                parcial: m.nota_parcial,
                                permanente2: m.nota_permanente_2,
                                final: m.nota_final,
                              };
                            });
                            setCalificacionesForm(updatedForm);
                            setMensajeGuardadoCalificaciones(true);
                            setTimeout(() => setMensajeGuardadoCalificaciones(false), 3000);
                          }}
                          className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition shadow-xs"
                          title="Asignar notas promedio 16.5 (> 14) para desbloquear hasta 26 créditos"
                        >
                          ⭐ Cargar Promedio &gt; 14 (Desbloquear 26 Créditos)
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            AcademicStore.simularCalificacionesEstudiante(adminEstudianteSeleccionadoId, 'REGULAR');
                            const mats = AcademicStore.obtenerMatriculasPorEstudiante(adminEstudianteSeleccionadoId);
                            const updatedForm: any = {};
                            mats.forEach((m) => {
                              updatedForm[m.id] = {
                                permanente1: m.nota_permanente_1,
                                parcial: m.nota_parcial,
                                permanente2: m.nota_permanente_2,
                                final: m.nota_final,
                              };
                            });
                            setCalificacionesForm(updatedForm);
                            setMensajeGuardadoCalificaciones(true);
                            setTimeout(() => setMensajeGuardadoCalificaciones(false), 3000);
                          }}
                          className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition shadow-xs"
                          title="Asignar notas promedio 12.5 (<= 14) para mantener límite de 22 créditos"
                        >
                          📝 Cargar Promedio ≤ 14 (Límite 22 Créditos)
                        </button>
                      </div>
                    </div>

                    {mensajeGuardadoCalificaciones && (
                      <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 animate-in fade-in">
                        <Check className="w-4 h-4 text-emerald-700" />
                        <span>¡Calificaciones guardadas exitosamente! El promedio ponderado y límite de créditos se han recalculado.</span>
                      </div>
                    )}

                    {matriculasAlumno.length === 0 ? (
                      <div className="bg-white border-2 border-dashed border-sky-300 rounded-2xl p-8 text-center space-y-3">
                        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                        <h5 className="font-bold text-sm text-slate-800">Este estudiante aún no tiene asignaturas matriculadas</h5>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                          Como todo estudiante inicia en 1° semestre con 0 cursos, puedes asignarle las materias base con 22 créditos para calificarlo.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            AcademicStore.cargarMallaBase22Creditos(adminEstudianteSeleccionadoId);
                          }}
                          className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition"
                        >
                          ⚡ Cargar 22 Créditos Base al Alumno
                        </button>
                      </div>
                    ) : (
                      <div className="bg-white border-2 border-sky-200 rounded-2xl overflow-hidden shadow-xs">
                        <div className="p-3 bg-sky-100/60 border-b border-sky-200 text-xs font-bold text-sky-900 flex justify-between items-center">
                          <span>Asignaturas Matriculadas por el Alumno ({matriculasAlumno.length})</span>
                          <span className="text-[11px] font-normal text-sky-700">Rango de notas: 0.0 a 20.0 (Aprobatorio: ≥ 10.5)</span>
                        </div>

                        <div className="divide-y divide-sky-100">
                          {matriculasAlumno.map((m) => {
                            const sec = todasLasSecciones.find((s) => s.id === m.seccion_id);
                            const cur = sec ? todosLosCursos.find((c) => c.id === sec.curso_id) : undefined;
                            const notasCurso = calificacionesForm[m.id] || {};

                            return (
                              <div
                                key={m.id}
                                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-sky-50/40 transition"
                              >
                                <div className="flex-1">
                                  <span className="font-mono text-xs font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                                    {cur?.codigo}
                                  </span>
                                  <h5 className="font-bold text-sm text-slate-900 mt-1">{cur?.nombre}</h5>
                                  <p className="text-[11px] text-slate-500">Docente: {sec?.docente_nombre} • Créditos: {cur?.creditos}</p>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-center">
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase">
                                      Perm. 1
                                    </label>
                                    <input
                                      type="number"
                                      min="0"
                                      max="20"
                                      step="0.5"
                                      placeholder="0-20"
                                      value={notasCurso.permanente1 ?? ''}
                                      onChange={(e) => {
                                        const val = e.target.value === '' ? undefined : Number(e.target.value);
                                        setCalificacionesForm((prev) => ({
                                          ...prev,
                                          [m.id]: { ...prev[m.id], permanente1: val },
                                        }));
                                      }}
                                      className="w-20 bg-sky-50 border border-sky-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 text-center focus:bg-white focus:outline-none"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase">
                                      Parcial
                                    </label>
                                    <input
                                      type="number"
                                      min="0"
                                      max="20"
                                      step="0.5"
                                      placeholder="0-20"
                                      value={notasCurso.parcial ?? ''}
                                      onChange={(e) => {
                                        const val = e.target.value === '' ? undefined : Number(e.target.value);
                                        setCalificacionesForm((prev) => ({
                                          ...prev,
                                          [m.id]: { ...prev[m.id], parcial: val },
                                        }));
                                      }}
                                      className="w-20 bg-sky-50 border border-sky-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 text-center focus:bg-white focus:outline-none"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase">
                                      Perm. 2
                                    </label>
                                    <input
                                      type="number"
                                      min="0"
                                      max="20"
                                      step="0.5"
                                      placeholder="0-20"
                                      value={notasCurso.permanente2 ?? ''}
                                      onChange={(e) => {
                                        const val = e.target.value === '' ? undefined : Number(e.target.value);
                                        setCalificacionesForm((prev) => ({
                                          ...prev,
                                          [m.id]: { ...prev[m.id], permanente2: val },
                                        }));
                                      }}
                                      className="w-20 bg-sky-50 border border-sky-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 text-center focus:bg-white focus:outline-none"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase">
                                      Final
                                    </label>
                                    <input
                                      type="number"
                                      min="0"
                                      max="20"
                                      step="0.5"
                                      placeholder="0-20"
                                      value={notasCurso.final ?? ''}
                                      onChange={(e) => {
                                        const val = e.target.value === '' ? undefined : Number(e.target.value);
                                        setCalificacionesForm((prev) => ({
                                          ...prev,
                                          [m.id]: { ...prev[m.id], final: val },
                                        }));
                                      }}
                                      className="w-20 bg-sky-50 border border-sky-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 text-center focus:bg-white focus:outline-none"
                                    />
                                  </div>

                                  <div className="text-center bg-sky-50/90 p-1.5 rounded-xl border border-sky-200">
                                    <span className="block text-[10px] font-bold text-sky-800 uppercase">
                                      Promedio
                                    </span>
                                    <span className="text-sm font-black text-sky-950">
                                      {(() => {
                                        const arr = [
                                          notasCurso.permanente1,
                                          notasCurso.parcial,
                                          notasCurso.permanente2,
                                          notasCurso.final,
                                        ].filter((x) => x !== undefined) as number[];
                                        if (arr.length === 0) return '-';
                                        const s = arr.reduce((a, b) => a + b, 0);
                                        return (s / arr.length).toFixed(1);
                                      })()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {matriculasAlumno.length > 0 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleLimpiarCalificaciones}
                          className="text-xs text-rose-700 hover:text-rose-900 font-bold flex items-center gap-1.5 transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Limpiar / Vaciar todas las calificaciones
                        </button>

                        <button
                          type="button"
                          onClick={handleGuardarCalificacionesAdmin}
                          className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition"
                        >
                          <Save className="w-4 h-4" />
                          Guardar Calificaciones Oficiales
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ================================================================= */}
          {/* MÓDULO: HORARIOS DEL ESTUDIANTE (Solo muestra los cursos elegidos) */}
          {/* ================================================================= */}
          {vistaModal === 'horarios' && (
            <div className="space-y-4">
              {matriculasAlumno.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-sky-300 rounded-3xl p-8 sm:p-10 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto shadow-xs">
                    <Clock className="w-8 h-8" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1.5">
                    <h4 className="text-base sm:text-lg font-bold text-sky-950">
                      Sin horarios programados para el ciclo 2026-I
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Por defecto los estudiantes inician en 1° semestre sin cursos asignados. Ingresa al módulo de <strong>Matrículas</strong> para elegir tus asignaturas y ver tu cronograma de clases.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-slate-600">
                    Cronograma semanal correspondiente a tus {matriculasAlumno.length} asignaturas elegidas.
                  </p>
                  <div className="overflow-x-auto bg-white border border-sky-200 rounded-2xl shadow-xs">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-sky-100/70 text-sky-900 border-b border-sky-200 uppercase font-bold text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Día</th>
                          <th className="py-2.5 px-3">Horas</th>
                          <th className="py-2.5 px-3">Asignatura</th>
                          <th className="py-2.5 px-3">Aula</th>
                          <th className="py-2.5 px-3">Tipo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sky-100">
                        {horariosAlumno.map((h) => {
                          const sec = todasLasSecciones.find((s) => s.id === h.seccion_id);
                          const cur = sec ? todosLosCursos.find((c) => c.id === sec.curso_id) : undefined;
                          return (
                            <tr key={h.id} className="hover:bg-sky-50/50">
                              <td className="py-2.5 px-3 font-bold text-sky-900">{h.dia_nombre}</td>
                              <td className="py-2.5 px-3 font-mono font-medium">{h.hora_inicio} - {h.hora_fin}</td>
                              <td className="py-2.5 px-3 font-semibold text-slate-900">
                                {cur?.nombre} <span className="text-[10px] text-slate-500">({cur?.codigo})</span>
                              </td>
                              <td className="py-2.5 px-3 font-medium text-slate-700">{h.aula}</td>
                              <td className="py-2.5 px-3">
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">
                                  {h.tipo_sesion}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* MÓDULO: MESA DE AYUDA */}
          {/* ================================================================= */}
          {vistaModal === 'mesa_ayuda' && (
            <div className="space-y-4">
              {!esAdmin ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-sky-900">
                        Tus Requerimientos & Tickets de Ayuda
                      </h4>
                      <p className="text-xs text-slate-600">
                        Atención personalizada por la oficina académica central de la UNTI.
                      </p>
                    </div>

                    {!modoCrearTicket && (
                      <button
                        onClick={() => setModoCrearTicket(true)}
                        className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition shadow-xs"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Crear Nuevo Ticket
                      </button>
                    )}
                  </div>

                  {mensajeExitoTicket && (
                    <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 animate-in fade-in">
                      <Check className="w-4 h-4 text-emerald-700" />
                      <span>¡Tu requerimiento fue enviado exitosamente al Administrador Académico!</span>
                    </div>
                  )}

                  {modoCrearTicket && (
                    <form
                      onSubmit={handleCrearTicketEstudiante}
                      className="bg-white border-2 border-sky-300 rounded-2xl p-5 shadow-xs space-y-3.5 animate-in fade-in"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-sky-100">
                        <h5 className="font-bold text-sm text-sky-950">
                          Registrar Nuevo Requerimiento en Mesa de Ayuda
                        </h5>
                        <button
                          type="button"
                          onClick={() => setModoCrearTicket(false)}
                          className="text-xs text-slate-400 hover:text-slate-600"
                        >
                          Cancelar
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-sky-900 uppercase">
                            Asunto del requerimiento:
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ej: Consulta sobre matrícula de asignatura"
                            value={asuntoTicket}
                            onChange={(e) => setAsuntoTicket(e.target.value)}
                            className="w-full bg-sky-50 border border-sky-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-sky-900 uppercase">
                            Categoría:
                          </label>
                          <select
                            value={categoriaTicket}
                            onChange={(e) => setCategoriaTicket(e.target.value as any)}
                            className="w-full bg-sky-50 border border-sky-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white font-medium"
                          >
                            <option value="MATRICULA">Matrícula & Selección de Cursos</option>
                            <option value="CALIFICACIONES">Calificaciones & Exámenes</option>
                            <option value="PAGOS">Pensiones & Finanzas</option>
                            <option value="ASISTENCIA">Justificación de Asistencia</option>
                            <option value="TRAMITE">Constancias & Documentos</option>
                            <option value="OTRO">Consulta General</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-sky-900 uppercase">
                          Detalle del requerimiento:
                        </label>
                        <textarea
                          required
                          rows={3}
                          placeholder="Describe claramente tu consulta académica..."
                          value={mensajeTicket}
                          onChange={(e) => setMensajeTicket(e.target.value)}
                          className="w-full bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-slate-800 focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setModoCrearTicket(false)}
                          className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" /> Enviar Requerimiento
                        </button>
                      </div>
                    </form>
                  )}

                  {ticketsEstudiante.length === 0 && !modoCrearTicket ? (
                    <div className="bg-white border-2 border-dashed border-sky-300 rounded-3xl p-8 sm:p-10 text-center space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto shadow-xs">
                        <LifeBuoy className="w-8 h-8" />
                      </div>
                      <div className="max-w-md mx-auto space-y-1.5">
                        <h4 className="text-base sm:text-lg font-bold text-sky-950">
                          Bandeja de Mesa de Ayuda vacía
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Aún no has registrado ningún ticket. Si tienes dudas sobre tus cursos o trámites, crea un requerimiento.
                        </p>
                      </div>
                      <button
                        onClick={() => setModoCrearTicket(true)}
                        className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition"
                      >
                        Crear Primer Ticket
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {ticketsEstudiante.map((t) => (
                        <div
                          key={t.id}
                          className="bg-white border-2 border-sky-200 rounded-2xl p-4 shadow-xs space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 px-2 py-0.5 rounded">
                              {t.categoria}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                t.estado === 'RESUELTO'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : 'bg-amber-100 text-amber-800 border-amber-300'
                              }`}
                            >
                              ● {t.estado === 'RESUELTO' ? 'RESUELTO' : 'PENDIENTE DE ATENCIÓN'}
                            </span>
                          </div>

                          <h5 className="font-bold text-sm text-sky-950">{t.asunto}</h5>
                          <p className="text-xs text-slate-700 bg-sky-50/50 p-2.5 rounded-xl border border-sky-100">
                            {t.mensaje}
                          </p>
                          <p className="text-[10px] text-slate-400">Enviado: {t.fecha_creacion}</p>

                          {t.estado === 'RESUELTO' && t.respuesta_admin && (
                            <div className="mt-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                              <p className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Respuesta Oficial ({t.respondido_por || 'Administrador'}):
                              </p>
                              <p className="text-xs text-slate-800">{t.respuesta_admin}</p>
                              <p className="text-[10px] text-emerald-700">Atendido el: {t.fecha_respuesta}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* VISTA DEL ADMIN PARA RESPONDER TICKETS */
                <div className="space-y-4">
                  <div className="bg-sky-100/70 border border-sky-300 rounded-2xl p-4">
                    <h4 className="text-sm font-bold text-sky-950 flex items-center gap-2">
                      <LifeBuoy className="w-4 h-4 text-sky-700" />
                      Bandeja Administrativa de Requerimientos Estudiantiles
                    </h4>
                    <p className="text-xs text-sky-800 mt-0.5">
                      Revisa y responde las solicitudes de los alumnos.
                    </p>
                  </div>

                  {todosLosTickets.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-sky-300 rounded-3xl p-8 text-center space-y-3">
                      <LifeBuoy className="w-10 h-10 text-sky-500 mx-auto" />
                      <h4 className="text-sm font-bold text-sky-950">No hay tickets registrados por ningún estudiante</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Cambia a Estudiante en la cabecera para enviar un ticket de prueba.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {todosLosTickets.map((t) => (
                        <div
                          key={t.id}
                          className="bg-white border-2 border-sky-200 rounded-2xl p-4 shadow-xs space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-sky-100">
                            <div>
                              <span className="font-bold text-xs text-sky-950">{t.estudiante_nombre}</span>
                              <span className="text-xs text-slate-500 ml-2 font-mono">({t.codigo_estudiante})</span>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                t.estado === 'RESUELTO'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : 'bg-amber-100 text-amber-800 border-amber-300'
                              }`}
                            >
                              ● {t.estado}
                            </span>
                          </div>

                          <div>
                            <h5 className="font-bold text-sm text-slate-900">{t.asunto}</h5>
                            <p className="text-xs text-slate-700 bg-sky-50/50 p-2.5 rounded-xl border border-sky-100 mt-1">
                              {t.mensaje}
                            </p>
                          </div>

                          {t.estado === 'PENDIENTE' ? (
                            <div className="pt-2 border-t border-sky-100 space-y-2">
                              <textarea
                                rows={2}
                                placeholder="Escribe la respuesta oficial..."
                                value={respuestasAdmin[t.id] || ''}
                                onChange={(e) =>
                                  setRespuestasAdmin((prev) => ({
                                    ...prev,
                                    [t.id]: e.target.value,
                                  }))
                                }
                                className="w-full bg-sky-50 border border-sky-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white"
                              />
                              <div className="flex justify-end">
                                <button
                                  onClick={() => handleResponderTicketAdmin(t.id)}
                                  disabled={!respuestasAdmin[t.id]?.trim()}
                                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Resolver y Enviar Respuesta al Estudiante
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-0.5 text-xs text-slate-800">
                              <p className="font-bold text-emerald-900 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Resuelto por {t.respondido_por}:
                              </p>
                              <p className="mt-1">{t.respuesta_admin}</p>
                              <p className="text-[10px] text-emerald-700 mt-1">Fecha: {t.fecha_respuesta}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 1. INFORMACION */}
          {vistaModal === 'informacion' && (
            <div className="space-y-4">
              <div className="bg-white border-2 border-sky-300 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-center gap-5">
                {/* Contenedor de Foto del Estudiante */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  {perfil.avatar_url ? (
                    <div className="relative group">
                      <img
                        src={perfil.avatar_url}
                        alt={perfil.nombre_completo}
                        className="w-24 h-24 rounded-2xl object-cover border-2 border-sky-400 shadow-md"
                      />
                      <button
                        onClick={() => AcademicStore.actualizarAvatarPerfil(perfil.user_id, '')}
                        title="Eliminar foto"
                        className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full p-1 shadow-xs hover:bg-rose-700 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-sky-100 border-2 border-dashed border-sky-300 flex flex-col items-center justify-center text-sky-600 shadow-xs">
                      <User className="w-10 h-10 text-sky-400" />
                      <span className="text-[10px] font-bold text-sky-700 mt-1">Sin foto</span>
                    </div>
                  )}

                  <label
                    htmlFor="upload-avatar-file"
                    className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5 transition"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{perfil.avatar_url ? 'Cambiar foto' : 'Subir mi foto'}</span>
                    <input
                      id="upload-avatar-file"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const res = event.target?.result as string;
                            if (res) {
                              AcademicStore.actualizarAvatarPerfil(perfil.user_id, res);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>

                <div className="space-y-1.5 text-center sm:text-left flex-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full">
                      Perfil Oficial: {perfil.rol}
                    </span>
                    <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300">
                      ● Matrícula Activa 2026-I
                    </span>
                  </div>
                  <h4 className="text-lg font-black text-sky-950 mt-1">{perfil.nombre_completo}</h4>
                  <p className="text-xs text-slate-600">Código Universitario: <strong className="font-mono text-sky-900 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">{estudiante?.codigo_estudiante || 'N/A'}</strong></p>
                  <p className="text-xs text-slate-600">Correo Electrónico Institucional: <strong>{perfil.email}</strong></p>
                  <p className="text-xs text-slate-600">Documento Nacional de Identidad (DNI): <strong>{perfil.documento_identidad}</strong></p>
                  <p className="text-[11px] text-slate-500 italic mt-0.5">Puedes subir tu foto oficial con el botón superior para tu carné universitario.</p>
                </div>
              </div>

              {estudiante && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white border border-sky-200 p-3.5 rounded-xl text-center shadow-xs">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Semestre Actual</p>
                    <p className="text-xl font-black text-sky-900 mt-1">{estudiante.semestre_actual}° Ciclo</p>
                  </div>
                  <div className="bg-white border border-sky-200 p-3.5 rounded-xl text-center shadow-xs">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Cursos Elegidos</p>
                    <p className="text-xl font-black text-sky-900 mt-1">{matriculasAlumno.length}</p>
                  </div>
                  <div className="bg-white border border-sky-200 p-3.5 rounded-xl text-center shadow-xs">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Créditos Elegidos</p>
                    <p className="text-xl font-black text-sky-900 mt-1">{totalCreditosMatriculados}</p>
                  </div>
                  <div className="bg-white border border-sky-200 p-3.5 rounded-xl text-center shadow-xs">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Condición</p>
                    <p className="text-base font-black text-emerald-700 mt-1">{estudiante.estado}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. MATERIAL DE CURSOS */}
          {vistaModal === 'material_cursos' && (
            <div className="space-y-3">
              {cursosMatriculados.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-sky-300 rounded-3xl p-8 text-center space-y-3">
                  <BookOpen className="w-10 h-10 text-sky-500 mx-auto" />
                  <h4 className="text-sm font-bold text-sky-950">No hay asignaturas matriculadas</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Matricúlate primero en tus cursos en el módulo de <strong>Matrículas</strong> para acceder a los sílabos y guías de clase.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {cursosMatriculados.map((item) => (
                    <div key={item.seccion.id} className="bg-white border border-sky-200 rounded-xl p-4 shadow-xs space-y-2">
                      <span className="font-mono text-xs font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">{item.curso?.codigo}</span>
                      <h5 className="font-bold text-xs sm:text-sm text-slate-900">{item.curso?.nombre}</h5>
                      <p className="text-xs text-slate-500">Docente: {item.seccion.docente_nombre}</p>
                      <div className="pt-2 flex items-center gap-2">
                        <button className="text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition">
                          <Download className="w-3.5 h-3.5" /> Descargar Sílabo
                        </button>
                        <button className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition">
                          <ExternalLink className="w-3.5 h-3.5" /> Guías LMS
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 5. SEMAFORO */}
          {vistaModal === 'semaforo' && (
            <div className="space-y-4">
              <div className="bg-white border border-sky-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Aprobados Históricos
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <span className="w-3 h-3 rounded-full bg-sky-500"></span> En Curso ({matriculasAlumno.length} elegidos)
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <span className="w-3 h-3 rounded-full bg-amber-400"></span> Pendientes
                  </div>
                </div>
                <span className="text-xs font-bold text-sky-900 bg-sky-100 px-3 py-1 rounded-full">
                  Avance Curricular UNTI • 1° Semestre
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {todosLosCursos.map((c) => {
                  const sec = todasLasSecciones.find((s) => s.curso_id === c.id);
                  const estaMat = sec && estudiante ? AcademicStore.estaMatriculadoEnSeccion(estudiante.id, sec.id) : false;

                  return (
                    <div key={c.id} className="bg-white border-2 border-sky-300 rounded-xl p-3.5 shadow-xs relative">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-sky-800">{c.codigo}</span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            estaMat ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          ● {estaMat ? 'En curso 2026-I' : 'No matriculado'}
                        </span>
                      </div>
                      <h5 className="font-bold text-xs sm:text-sm text-slate-900 mt-2">{c.nombre}</h5>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Ciclo {c.ciclo}° Semestre • {c.creditos} Créditos
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 8. ASISTENCIAS */}
          {vistaModal === 'asistencias' && (() => {
            const puedeMarcarAsistencia = esAutoridad || modoProfesorAsistencia;
            const targetEstudianteId = puedeMarcarAsistencia
              ? asistEstudianteSeleccionadoId
              : estudiante?.id || 'est_01';

            // Obtener asistencias del estudiante seleccionado
            const todasAsistencias = AcademicStore.obtenerAsistenciasPorEstudiante(targetEstudianteId);
            const asistenciasFiltradas = asistFiltroCurso
              ? todasAsistencias.filter((a) => a.curso_nombre === asistFiltroCurso)
              : todasAsistencias;

            const totalSesiones = asistenciasFiltradas.length;
            const totalPresentes = asistenciasFiltradas.filter((a) => a.estado === 'PRESENTE').length;
            const totalFaltas = asistenciasFiltradas.filter((a) => a.estado === 'FALTA').length;
            const porcentaje = totalSesiones > 0 ? ((totalPresentes / totalSesiones) * 100).toFixed(1) : '100.0';

            // Lista de cursos disponibles para el filtro y para nueva sesión
            const cursosEstudiante = Array.from(new Set(todasAsistencias.map((a) => a.curso_nombre)));

            const handleGuardarNuevaSesion = (e: React.FormEvent) => {
              e.preventDefault();
              const cursoElegido = nuevaSesionCurso || cursosEstudiante[0] || todosLosCursos[0]?.nombre || 'Asignatura';
              const sec = todasLasSecciones.find((s) => {
                const cur = todosLosCursos.find((c) => c.nombre === cursoElegido);
                return cur && s.curso_id === cur.id;
              });

              AcademicStore.agregarSesionAsistencia({
                estudiante_id: targetEstudianteId,
                curso_nombre: cursoElegido,
                fecha: nuevaSesionFecha,
                hora_registro: nuevaSesionHora,
                tema: nuevaSesionTema.trim() || `Sesión de clase oficial: ${cursoElegido}`,
                estado: nuevaSesionEstado,
                docente_nombre: sec?.docente_nombre || perfil.nombre_completo || 'Dr. Manuel Benítez Vargas',
              });

              setMostrarFormNuevaSesion(false);
              setNuevaSesionTema('');
              setMensajeAsistenciaDocente(
                `¡Sesión registrada exitosamente! El alumno fue marcado como: ${
                  nuevaSesionEstado === 'PRESENTE' ? 'SÍ ESTUVO' : 'NO ESTUVO (FALTA)'
                }.`
              );
              setTimeout(() => setMensajeAsistenciaDocente(null), 3500);
            };

            return (
              <div className="space-y-4">
                {/* Selector de Modo: Estudiante vs Docente/Profesor */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sky-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-sky-900">Vista activa:</span>
                    <div className="flex items-center gap-1.5 bg-sky-100/80 p-1 rounded-xl border border-sky-300">
                      <button
                        type="button"
                        onClick={() => setModoProfesorAsistencia(false)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                          !modoProfesorAsistencia
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'text-sky-900 hover:bg-white/60'
                        }`}
                      >
                        Registro del Estudiante
                      </button>
                      <button
                        type="button"
                        onClick={() => setModoProfesorAsistencia(true)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                          modoProfesorAsistencia
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'text-sky-900 hover:bg-white/60'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Modo Profesor (Marcar Asistencia)
                      </button>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-sky-800">
                    {puedeMarcarAsistencia
                      ? '👨‍🏫 Panel de Control de Cátedra Activo'
                      : '🎓 Consulta Personal de Asistencia del Alumno'}
                  </span>
                </div>

                {/* Resumen de Asistencia */}
                <div className="bg-white border-2 border-sky-300 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      Number(porcentaje) >= 70
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300'
                    }`}>
                      {puedeMarcarAsistencia ? 'Toma de Asistencia por el Profesor' : 'Control Oficial de Asistencia'}
                    </span>
                    <h4 className="text-lg font-black text-sky-950 mt-1">
                      Porcentaje de Asistencia: {porcentaje}%
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {puedeMarcarAsistencia
                        ? 'Como profesor puedes marcar en cada sesión si el alumno estuvo o no presente en clase.'
                        : 'Registro oficial de asistencia validado por tus profesores de cátedra.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl text-center shadow-xs">
                      <span className="block text-[10px] font-bold text-emerald-800 uppercase">Estuvo Presente</span>
                      <span className="text-base font-black text-emerald-700">{totalPresentes} / {totalSesiones}</span>
                    </div>
                    <div className="bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-xl text-center shadow-xs">
                      <span className="block text-[10px] font-bold text-rose-800 uppercase">No Estuvo (Falta)</span>
                      <span className="text-base font-black text-rose-700">{totalFaltas}</span>
                    </div>
                  </div>
                </div>

                {mensajeAsistenciaDocente && (
                  <div className="bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 animate-in fade-in">
                    <Check className="w-4 h-4 text-emerald-700" />
                    <span>{mensajeAsistenciaDocente}</span>
                  </div>
                )}

                {/* Barra de Controles del Profesor (Estudiante a marcar, filtro de curso y acciones rápidas) */}
                {puedeMarcarAsistencia && (
                  <div className="bg-sky-50 border-2 border-sky-300 rounded-2xl p-4 space-y-3 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sky-200">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-sky-900 whitespace-nowrap">Estudiante:</label>
                          <select
                            value={asistEstudianteSeleccionadoId}
                            onChange={(e) => setAsistEstudianteSeleccionadoId(e.target.value)}
                            className="bg-white border-2 border-sky-300 text-sky-950 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-sky-500"
                          >
                            <option value="est_01">Juan Carlos Pérez Gómez (25-260481)</option>
                            <option value="est_02">María Elena Torres (25-261192)</option>
                          </select>
                        </div>

                        {cursosEstudiante.length > 0 && (
                          <div className="flex items-center gap-2">
                            <label className="text-xs font-bold text-sky-900 whitespace-nowrap">Asignatura:</label>
                            <select
                              value={asistFiltroCurso}
                              onChange={(e) => setAsistFiltroCurso(e.target.value)}
                              className="bg-white border-2 border-sky-300 text-sky-950 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-sky-500 max-w-xs truncate"
                            >
                              <option value="">Todas las asignaturas</option>
                              {cursosEstudiante.map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setMostrarFormNuevaSesion(!mostrarFormNuevaSesion)}
                        className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs shrink-0"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>{mostrarFormNuevaSesion ? 'Cancelar' : '+ Registrar Nueva Sesión'}</span>
                      </button>
                    </div>

                    {/* Formulario para Registrar Nueva Sesión de Asistencia */}
                    {mostrarFormNuevaSesion && (
                      <form onSubmit={handleGuardarNuevaSesion} className="bg-white border-2 border-sky-300 rounded-xl p-4 space-y-3 animate-in fade-in">
                        <div className="flex items-center justify-between pb-2 border-b border-sky-100">
                          <h5 className="font-bold text-xs text-sky-950 uppercase tracking-wide flex items-center gap-1.5">
                            <CalendarDays className="w-4 h-4 text-sky-600" /> Nueva Sesión de Clase para Tomar Asistencia
                          </h5>
                          <span className="text-[11px] text-slate-500">Docente a cargo: {perfil.nombre_completo}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-600 uppercase">Asignatura:</label>
                            <select
                              value={nuevaSesionCurso || cursosEstudiante[0] || todosLosCursos[0]?.nombre}
                              onChange={(e) => setNuevaSesionCurso(e.target.value)}
                              className="w-full bg-sky-50 border border-sky-300 rounded-lg p-2 text-xs font-bold text-slate-800"
                            >
                              {(cursosEstudiante.length > 0 ? cursosEstudiante : todosLosCursos.map((c) => c.nombre)).map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-600 uppercase">Fecha:</label>
                            <input
                              type="date"
                              required
                              value={nuevaSesionFecha}
                              onChange={(e) => setNuevaSesionFecha(e.target.value)}
                              className="w-full bg-sky-50 border border-sky-300 rounded-lg p-2 text-xs font-bold text-slate-800"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-600 uppercase">Hora de Registro:</label>
                            <input
                              type="text"
                              required
                              value={nuevaSesionHora}
                              onChange={(e) => setNuevaSesionHora(e.target.value)}
                              placeholder="08:00 AM"
                              className="w-full bg-sky-50 border border-sky-300 rounded-lg p-2 text-xs font-bold text-slate-800"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-600 uppercase">Tema o Contenido de la Sesión:</label>
                          <input
                            type="text"
                            required
                            placeholder="Ej: Semana 3: Pruebas unitarias, arquitecturas en capas y CI/CD..."
                            value={nuevaSesionTema}
                            onChange={(e) => setNuevaSesionTema(e.target.value)}
                            className="w-full bg-sky-50 border border-sky-300 rounded-lg p-2 text-xs font-medium text-slate-800"
                          />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-sky-100">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-700">¿El alumno estuvo en esta clase?</span>
                            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-300">
                              <button
                                type="button"
                                onClick={() => setNuevaSesionEstado('PRESENTE')}
                                className={`text-xs font-bold px-3 py-1 rounded-lg transition ${
                                  nuevaSesionEstado === 'PRESENTE'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-slate-700 hover:bg-white'
                                }`}
                              >
                                ✓ SÍ ESTUVO
                              </button>
                              <button
                                type="button"
                                onClick={() => setNuevaSesionEstado('FALTA')}
                                className={`text-xs font-bold px-3 py-1 rounded-lg transition ${
                                  nuevaSesionEstado === 'FALTA'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'text-slate-700 hover:bg-white'
                                }`}
                              >
                                ✗ NO ESTUVO (FALTA)
                              </button>
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1"
                          >
                            <Save className="w-3.5 h-3.5" /> Guardar Sesión de Asistencia
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Acciones Rápidas del Profesor */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <span className="text-xs font-bold text-sky-900">
                        Marcar todas las sesiones filtradas:
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            AcademicStore.marcarTodasAsistencias(targetEstudianteId, 'PRESENTE', asistFiltroCurso || undefined);
                            setMensajeAsistenciaDocente('Se marcaron todas las sesiones como: EL ALUMNO SÍ ESTUVO (PRESENTE).');
                            setTimeout(() => setMensajeAsistenciaDocente(null), 3000);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition shadow-xs flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Marcar a todos: Estuvo presente
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            AcademicStore.marcarTodasAsistencias(targetEstudianteId, 'FALTA', asistFiltroCurso || undefined);
                            setMensajeAsistenciaDocente('Se marcaron todas las sesiones como: EL ALUMNO NO ESTUVO (FALTA).');
                            setTimeout(() => setMensajeAsistenciaDocente(null), 3000);
                          }}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition shadow-xs flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> Marcar a todos: No estuvo (Falta)
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Listado de Sesiones de Asistencia */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-sky-900">
                      Historial de Asistencias ({totalSesiones} Sesiones Programadas)
                    </h5>
                    {puedeMarcarAsistencia && (
                      <span className="text-[11px] text-sky-700 font-semibold">
                        Haz clic en <strong>"Estuvo"</strong> o <strong>"No estuvo"</strong> para cambiar el estado inmediatamente.
                      </span>
                    )}
                  </div>

                  {totalSesiones === 0 ? (
                    <div className="bg-white border-2 border-dashed border-sky-300 rounded-2xl p-8 text-center space-y-2">
                      <Clock className="w-8 h-8 text-sky-500 mx-auto" />
                      <h5 className="font-bold text-sm text-slate-800">No hay sesiones de asistencia para este filtro</h5>
                      <p className="text-xs text-slate-500">
                        Puedes registrar una nueva sesión con el botón superior para tomar asistencia a este alumno.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-sky-100 bg-white border-2 border-sky-200 rounded-2xl overflow-hidden shadow-xs">
                      {asistenciasFiltradas.map((a) => {
                        const estuvoPresente = a.estado === 'PRESENTE';

                        return (
                          <div
                            key={a.id}
                            className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-sky-50/50 transition"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <h5 className="font-bold text-xs sm:text-sm text-slate-900">{a.curso_nombre}</h5>
                                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                  {a.fecha}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600">{a.tema}</p>
                              {a.docente_nombre && (
                                <p className="text-[10px] text-slate-400">Docente: {a.docente_nombre}</p>
                              )}
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                              <span className="text-[11px] text-slate-500 font-mono">
                                {a.hora_registro}
                              </span>

                              {puedeMarcarAsistencia ? (
                                /* Botones interactivos para que el Profesor marque si el alumno estuvo o no */
                                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-300 shadow-xs">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      AcademicStore.actualizarEstadoAsistencia(a.id, 'PRESENTE');
                                      setMensajeAsistenciaDocente(`Sesión del ${a.fecha} marcada: EL ALUMNO SÍ ESTUVO (PRESENTE).`);
                                      setTimeout(() => setMensajeAsistenciaDocente(null), 2500);
                                    }}
                                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                                      estuvoPresente
                                        ? 'bg-emerald-600 text-white shadow-xs scale-102'
                                        : 'text-slate-600 hover:bg-white hover:text-emerald-700'
                                    }`}
                                    title="Marcar que el alumno sí asistió a clase"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>SÍ ESTUVO</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      AcademicStore.actualizarEstadoAsistencia(a.id, 'FALTA');
                                      setMensajeAsistenciaDocente(`Sesión del ${a.fecha} marcada: EL ALUMNO NO ESTUVO (FALTA).`);
                                      setTimeout(() => setMensajeAsistenciaDocente(null), 2500);
                                    }}
                                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                                      !estuvoPresente
                                        ? 'bg-rose-600 text-white shadow-xs scale-102'
                                        : 'text-slate-600 hover:bg-white hover:text-rose-700'
                                    }`}
                                    title="Marcar que el alumno faltó (no estuvo en clase)"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span>NO ESTUVO</span>
                                  </button>
                                </div>
                              ) : (
                                /* Badge informativo para el Estudiante */
                                <span
                                  className={`text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1 border shadow-xs ${
                                    estuvoPresente
                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                      : 'bg-rose-100 text-rose-800 border-rose-300'
                                  }`}
                                >
                                  {estuvoPresente ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-600" /> SÍ ESTUVO (PRESENTE)
                                    </>
                                  ) : (
                                    <>
                                      <X className="w-3.5 h-3.5 text-rose-600" /> NO ESTUVO (FALTA)
                                    </>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
