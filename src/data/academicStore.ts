import {
  Matricula,
  TicketMesaAyuda,
  Curso,
  Seccion,
  Horario,
  DiaSemana,
  EventoUniversitario,
  PagoItem,
  EvaluacionDocenteItem,
  Perfil,
  Estudiante,
  CuentaUsuario,
  AsistenciaItem,
} from '../types/academic';
import {
  CURSOS_DB,
  SECCIONES_DB,
  HORARIOS_DB,
  EVENTOS_DB,
  PAGOS_DB,
  PERFILES_DB,
  ESTUDIANTES_DB,
  CUENTAS_DB,
  ASISTENCIAS_DB,
} from './mockSupabaseDb';

// 1. Matrículas: Los estudiantes por defecto NO tienen cursos (array vacío)
let matriculasEstado: Matricula[] = [];

// 2. Catálogo dinámico de cursos, secciones y horarios creados por el administrador
let cursosEstado: Curso[] = JSON.parse(JSON.stringify(CURSOS_DB));
let seccionesEstado: Seccion[] = JSON.parse(JSON.stringify(SECCIONES_DB));
let horariosEstado: Horario[] = JSON.parse(JSON.stringify(HORARIOS_DB));

// 3. Mesa de ayuda
let ticketsEstado: TicketMesaAyuda[] = [];

// 4. Eventos e inscripciones dinámicas
let eventosEstado: EventoUniversitario[] = JSON.parse(JSON.stringify(EVENTOS_DB));
let inscripcionesEventosEstado: Record<string, string[]> = {}; // { [estudianteId]: [eventoId, ...] }

// 5. Tienda y Cuotas de pago (Monto total S/. 1,500 en cuotas)
let pagosEstado: PagoItem[] = JSON.parse(JSON.stringify(PAGOS_DB));

// 6. Evaluaciones docentes
let evaluacionesDocentesEstado: EvaluacionDocenteItem[] = [];

// 7. Perfiles (con avatar dinámico subido por el alumno)
let perfilesEstado: Perfil[] = JSON.parse(JSON.stringify(PERFILES_DB));

// 8. Estudiantes (dinámicos con registro nuevo)
let estudiantesEstado: Estudiante[] = JSON.parse(JSON.stringify(ESTUDIANTES_DB));

// 9. Cuentas de usuario y autenticación
let cuentasEstado: CuentaUsuario[] = JSON.parse(JSON.stringify(CUENTAS_DB));

// 10. Asistencias iniciales
let asistenciasEstado: AsistenciaItem[] = JSON.parse(JSON.stringify(ASISTENCIAS_DB));

type Listener = () => void;
const listeners = new Set<Listener>();

const notificarCambio = () => {
  listeners.forEach((listener) => listener());
};

export const AcademicStore = {
  // Suscripción reactiva para componentes React
  suscribir(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  // --------------------------------------------------------------------------
  // GESTIÓN DE CURSOS, SECCIONES Y HORARIOS (ADMINISTRADOR)
  // --------------------------------------------------------------------------
  obtenerCursos: (): Curso[] => cursosEstado,
  obtenerSecciones: (): Seccion[] => seccionesEstado,
  obtenerHorarios: (): Horario[] => horariosEstado,

  obtenerDocentesPreviamenteUsados: (): string[] => {
    const nombres = new Set<string>();
    seccionesEstado.forEach((s) => {
      if (s.docente_nombre && s.docente_nombre.trim()) {
        nombres.add(s.docente_nombre.trim());
      }
    });
    perfilesEstado.filter((p) => p.rol === 'docente').forEach((p) => {
      if (p.nombre_completo && p.nombre_completo.trim()) {
        nombres.add(p.nombre_completo.trim());
      }
    });
    return Array.from(nombres);
  },

  obtenerAulasPreviamenteUsadas: (): string[] => {
    const aulas = new Set<string>();
    horariosEstado.forEach((h) => {
      if (h.aula && h.aula.trim()) {
        aulas.add(h.aula.trim());
      }
    });
    return Array.from(aulas);
  },

  crearCursoConHorario: (datos: {
    codigo: string;
    nombre: string;
    creditos: number;
    ciclo: number;
    tipo: 'OBLIGATORIO' | 'ELECTIVO';
    descripcion?: string;
    codigo_seccion: string;
    docente_nombre: string;
    docente_email?: string;
    dia_semana: DiaSemana;
    hora_inicio: string;
    hora_fin: string;
    aula: string;
    pabellon: string;
    tipo_sesion: 'TEORIA' | 'PRACTICA' | 'LABORATORIO';
  }) => {
    const cursoId = 'cur_' + Date.now();
    const seccionId = 'sec_' + Date.now();
    const horarioId = 'hor_' + Date.now();

    const diasNombres: Record<number, string> = {
      1: 'Lunes',
      2: 'Martes',
      3: 'Miércoles',
      4: 'Jueves',
      5: 'Viernes',
      6: 'Sábado',
    };

    const nuevoCurso: Curso = {
      id: cursoId,
      codigo: datos.codigo.toUpperCase().trim(),
      nombre: datos.nombre.trim(),
      creditos: datos.creditos,
      ciclo: datos.ciclo,
      tipo: datos.tipo,
      prerrequisitos: [],
      descripcion: datos.descripcion || 'Asignatura creada por el Administrador Académico.',
    };

    const nuevaSeccion: Seccion = {
      id: seccionId,
      curso_id: cursoId,
      periodo_id: 'per_2026_1',
      codigo_seccion: datos.codigo_seccion.toUpperCase().trim(),
      docente_nombre: datos.docente_nombre.trim(),
      docente_email: datos.docente_email || 'docente@unt.edu.pe',
      aula_default: datos.aula.trim(),
      cupo_maximo: 35,
      matriculados: 0,
    };

    const nuevoHorario: Horario = {
      id: horarioId,
      seccion_id: seccionId,
      dia_semana: datos.dia_semana,
      dia_nombre: diasNombres[datos.dia_semana] || 'Lunes',
      hora_inicio: datos.hora_inicio,
      hora_fin: datos.hora_fin,
      aula: datos.aula.trim(),
      pabellon: datos.pabellon.trim(),
      tipo_sesion: datos.tipo_sesion,
    };

    cursosEstado = [nuevoCurso, ...cursosEstado];
    seccionesEstado = [nuevaSeccion, ...seccionesEstado];
    horariosEstado = [nuevoHorario, ...horariosEstado];

    notificarCambio();
    return { nuevoCurso, nuevaSeccion, nuevoHorario };
  },

  eliminarCurso: (cursoId: string) => {
    const seccionesIds = seccionesEstado.filter((s) => s.curso_id === cursoId).map((s) => s.id);
    cursosEstado = cursosEstado.filter((c) => c.id !== cursoId);
    seccionesEstado = seccionesEstado.filter((s) => s.curso_id !== cursoId);
    horariosEstado = horariosEstado.filter((h) => !seccionesIds.includes(h.seccion_id));
    matriculasEstado = matriculasEstado.filter((m) => !seccionesIds.includes(m.seccion_id));

    notificarCambio();
  },

  // --------------------------------------------------------------------------
  // MATRÍCULAS (Estudiantes eligen sus cursos)
  // --------------------------------------------------------------------------
  obtenerMatriculas: (): Matricula[] => matriculasEstado,

  obtenerMatriculasPorEstudiante: (estudianteId: string): Matricula[] => {
    return matriculasEstado.filter((m) => m.estudiante_id === estudianteId);
  },

  estaMatriculadoEnSeccion: (estudianteId: string, seccionId: string): boolean => {
    return matriculasEstado.some(
      (m) => m.estudiante_id === estudianteId && m.seccion_id === seccionId
    );
  },

  obtenerLimiteCreditosEstudiante: (estudianteId: string) => {
    // Buscar notas del estudiante
    const mats = matriculasEstado.filter((m) => m.estudiante_id === estudianteId);
    const matsConPromedio = mats.filter((m) => m.nota_promedio !== undefined);

    let promedioGeneral = 0;
    if (matsConPromedio.length > 0) {
      const suma = matsConPromedio.reduce((acc, m) => acc + (m.nota_promedio || 0), 0);
      promedioGeneral = Number((suma / matsConPromedio.length).toFixed(2));
    }

    // Regla: Inicia con 22 créditos. Si su promedio total es mayor a 14, puede llevar hasta 26 créditos.
    const calificaPara26 = promedioGeneral > 14.0;
    const maxCreditos = calificaPara26 ? 26 : 22;

    // Créditos actuales matriculados
    const seccionesIds = mats.map((m) => m.seccion_id);
    const cursosEstudiante = seccionesEstado
      .filter((s) => seccionesIds.includes(s.id))
      .map((s) => cursosEstado.find((c) => c.id === s.curso_id));
    const creditosActuales = cursosEstudiante.reduce((acc, c) => acc + (c?.creditos || 0), 0);

    return {
      maxCreditos,
      creditosActuales,
      promedioGeneral,
      calificaPara26,
      creditosDisponibles: Math.max(0, maxCreditos - creditosActuales),
    };
  },

  matricularCursoEstudiante: (estudianteId: string, seccionId: string): { success: boolean; error?: string } => {
    const existe = matriculasEstado.find(
      (m) => m.estudiante_id === estudianteId && m.seccion_id === seccionId
    );
    if (existe) return { success: false, error: 'Ya te encuentras matriculado en esta asignatura.' };

    const seccion = seccionesEstado.find((s) => s.id === seccionId);
    const curso = seccion ? cursosEstado.find((c) => c.id === seccion.curso_id) : undefined;
    const creditosCurso = curso?.creditos || 4;

    const infoCreditos = AcademicStore.obtenerLimiteCreditosEstudiante(estudianteId);
    if (infoCreditos.creditosActuales + creditosCurso > infoCreditos.maxCreditos) {
      return {
        success: false,
        error: `Excederías tu límite de créditos (${infoCreditos.creditosActuales} + ${creditosCurso} > ${infoCreditos.maxCreditos} créditos permitidos). ${
          !infoCreditos.calificaPara26
            ? 'Tu límite actual es de 22 créditos. Para acceder hasta 26 créditos, tu promedio de calificaciones debe ser mayor a 14.00.'
            : 'Has alcanzado el tope máximo institucional de 26 créditos.'
        }`,
      };
    }

    const nuevaMatricula: Matricula = {
      id: 'mat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      estudiante_id: estudianteId,
      seccion_id: seccionId,
      periodo_id: 'per_2026_1',
      fecha_matricula: new Date().toISOString().split('T')[0],
      estado: 'EN_CURSO',
      asistencias_porcentaje: 100,
    };

    seccionesEstado = seccionesEstado.map((s) =>
      s.id === seccionId ? { ...s, matriculados: s.matriculados + 1 } : s
    );

    matriculasEstado = [...matriculasEstado, nuevaMatricula];

    // Generar sesiones de asistencia iniciales para este curso si aún no existen para el alumno
    const tieneAsistencias = asistenciasEstado.some(
      (a) => (a.estudiante_id === estudianteId || !a.estudiante_id) && a.curso_nombre === curso?.nombre
    );

    if (!tieneAsistencias && curso && seccion) {
      const hoy = new Date();
      const fecha1 = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const fecha2 = hoy.toISOString().split('T')[0];

      const nuevasSesiones: AsistenciaItem[] = [
        {
          id: 'asist_' + Date.now() + '_1',
          estudiante_id: estudianteId,
          matricula_id: nuevaMatricula.id,
          curso_nombre: curso.nombre,
          fecha: fecha1,
          estado: 'PRESENTE',
          hora_registro: '08:00 AM',
          tema: `Semana 1: Introducción a ${curso.nombre}`,
          docente_nombre: seccion.docente_nombre,
        },
        {
          id: 'asist_' + Date.now() + '_2',
          estudiante_id: estudianteId,
          matricula_id: nuevaMatricula.id,
          curso_nombre: curso.nombre,
          fecha: fecha2,
          estado: 'PRESENTE',
          hora_registro: '08:05 AM',
          tema: `Semana 2: Aplicación práctica y fundamentos de ${curso.nombre}`,
          docente_nombre: seccion.docente_nombre,
        },
      ];

      asistenciasEstado = [...nuevasSesiones, ...asistenciasEstado];
    }

    notificarCambio();
    return { success: true };
  },

  cargarMallaBase22Creditos: (estudianteId: string) => {
    // Matricular en las primeras asignaturas hasta completar exactamente 22 créditos base
    const secciones = seccionesEstado.slice(0, 6);
    let matriculadosCount = 0;

    for (const sec of secciones) {
      const res = AcademicStore.matricularCursoEstudiante(estudianteId, sec.id);
      if (res.success) matriculadosCount++;
    }

    notificarCambio();
    return matriculadosCount;
  },

  desmatricularCursoEstudiante: (estudianteId: string, seccionId: string) => {
    matriculasEstado = matriculasEstado.filter(
      (m) => !(m.estudiante_id === estudianteId && m.seccion_id === seccionId)
    );

    seccionesEstado = seccionesEstado.map((s) =>
      s.id === seccionId ? { ...s, matriculados: Math.max(0, s.matriculados - 1) } : s
    );

    notificarCambio();
    return true;
  },

  // --------------------------------------------------------------------------
  // CALIFICACIONES (Permanente 1, Parcial, Permanente 2, Final)
  // --------------------------------------------------------------------------
  actualizarCalificaciones: (
    matriculaId: string,
    permanente1?: number,
    parcial?: number,
    permanente2?: number,
    final?: number
  ) => {
    matriculasEstado = matriculasEstado.map((m) => {
      if (m.id === matriculaId) {
        const notas = [permanente1, parcial, permanente2, final].filter((n) => n !== undefined) as number[];
        let promedio: number | undefined = undefined;
        if (notas.length > 0) {
          const suma = notas.reduce((acc, val) => acc + val, 0);
          promedio = Number((suma / notas.length).toFixed(2));
        }

        return {
          ...m,
          nota_permanente_1: permanente1,
          nota_parcial: parcial,
          nota_permanente_2: permanente2,
          nota_final: final,
          nota_promedio: promedio,
          estado:
            promedio !== undefined
              ? promedio >= 10.5
                ? 'APROBADO'
                : 'DESAPROBADO'
              : 'EN_CURSO',
        };
      }
      return m;
    });

    notificarCambio();
    return true;
  },

  limpiarCalificacionesEstudiante: (estudianteId: string) => {
    matriculasEstado = matriculasEstado.map((m) => {
      if (m.estudiante_id === estudianteId) {
        return {
          ...m,
          nota_permanente_1: undefined,
          nota_parcial: undefined,
          nota_permanente_2: undefined,
          nota_final: undefined,
          nota_promedio: undefined,
          estado: 'EN_CURSO',
        };
      }
      return m;
    });

    notificarCambio();
  },

  simularCalificacionesEstudiante: (estudianteId: string, tipo: 'SOBRESALIENTE' | 'REGULAR') => {
    // Si es SOBRESALIENTE: promedio > 14 (16.5) -> desbloquea 26 créditos
    // Si es REGULAR: promedio <= 14 (12.5) -> mantiene límite de 22 créditos
    const notasPreset =
      tipo === 'SOBRESALIENTE'
        ? { p1: 17, parc: 16, p2: 17, fin: 16, prom: 16.5 }
        : { p1: 12, parc: 13, p2: 12, fin: 13, prom: 12.5 };

    matriculasEstado = matriculasEstado.map((m) => {
      if (m.estudiante_id === estudianteId) {
        return {
          ...m,
          nota_permanente_1: notasPreset.p1,
          nota_parcial: notasPreset.parc,
          nota_permanente_2: notasPreset.p2,
          nota_final: notasPreset.fin,
          nota_promedio: notasPreset.prom,
          estado: notasPreset.prom >= 10.5 ? 'APROBADO' : 'DESAPROBADO',
        };
      }
      return m;
    });

    notificarCambio();
    return true;
  },

  // --------------------------------------------------------------------------
  // EVENTOS (Inscripción, desinscripción y creación por administrador)
  // --------------------------------------------------------------------------
  obtenerEventos: (): EventoUniversitario[] => eventosEstado,

  estaInscritoEnEvento: (estudianteId: string, eventoId: string): boolean => {
    const inscritos = inscripcionesEventosEstado[estudianteId] || [];
    return inscritos.includes(eventoId);
  },

  inscribirEstudianteEvento: (estudianteId: string, eventoId: string) => {
    const actuales = inscripcionesEventosEstado[estudianteId] || [];
    if (!actuales.includes(eventoId)) {
      inscripcionesEventosEstado = {
        ...inscripcionesEventosEstado,
        [estudianteId]: [...actuales, eventoId],
      };
      notificarCambio();
      return true;
    }
    return false;
  },

  desinscribirEstudianteEvento: (estudianteId: string, eventoId: string) => {
    const actuales = inscripcionesEventosEstado[estudianteId] || [];
    inscripcionesEventosEstado = {
      ...inscripcionesEventosEstado,
      [estudianteId]: actuales.filter((id) => id !== eventoId),
    };
    notificarCambio();
    return true;
  },

  crearEvento: (eventoData: Omit<EventoUniversitario, 'id'>) => {
    const nuevoEvento: EventoUniversitario = {
      id: 'ev_' + Date.now(),
      ...eventoData,
    };
    eventosEstado = [nuevoEvento, ...eventosEstado];
    notificarCambio();
    return nuevoEvento;
  },

  eliminarEvento: (eventoId: string) => {
    eventosEstado = eventosEstado.filter((ev) => ev.id !== eventoId);
    notificarCambio();
    return true;
  },

  // --------------------------------------------------------------------------
  // TIENDA & PAGOS (Cuotas sin pagar de S/. 1500, pasarela con tarjeta)
  // --------------------------------------------------------------------------
  obtenerPagosPorEstudiante: (estudianteId: string): PagoItem[] => {
    return pagosEstado.filter((p) => p.estudiante_id === estudianteId);
  },

  procesarPagoTarjeta: (
    pagoId: string,
    _datosTarjeta: {
      numero: string;
      titular: string;
      expiracion: string;
      cvv: string;
    }
  ) => {
    const recibo = 'REC-' + Math.floor(100000 + Math.random() * 900000);
    const fecha = new Date().toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    pagosEstado = pagosEstado.map((p) => {
      if (p.id === pagoId) {
        return {
          ...p,
          estado: 'PAGADO',
          fecha_pago: fecha,
          comprobante_numero: recibo,
        };
      }
      return p;
    });

    notificarCambio();
    return { success: true, comprobante: recibo, fecha };
  },

  // --------------------------------------------------------------------------
  // EVALUACIÓN DOCENTE (Formulario interactivo: 3 preguntas 1-5 + comentario)
  // --------------------------------------------------------------------------
  obtenerEvaluacionesPorEstudiante: (estudianteId: string): EvaluacionDocenteItem[] => {
    return evaluacionesDocentesEstado.filter((e) => e.estudiante_id === estudianteId);
  },

  docenteFueEvaluado: (estudianteId: string, cursoCodigo: string): boolean => {
    return evaluacionesDocentesEstado.some(
      (e) => e.estudiante_id === estudianteId && e.curso_codigo === cursoCodigo
    );
  },

  registrarEvaluacionDocente: (evaluacion: {
    estudiante_id: string;
    docente_nombre: string;
    curso_codigo: string;
    curso_nombre: string;
    pregunta_dominio: number;
    pregunta_puntualidad: number;
    pregunta_disponibilidad: number;
    comentario: string;
  }) => {
    const nuevaEvaluacion: EvaluacionDocenteItem = {
      id: 'eval_' + Date.now(),
      ...evaluacion,
      fecha_registro: new Date().toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    evaluacionesDocentesEstado = [nuevaEvaluacion, ...evaluacionesDocentesEstado];
    notificarCambio();
    return nuevaEvaluacion;
  },

  // --------------------------------------------------------------------------
  // MESA DE AYUDA (Estudiante crea, Admin responde)
  // --------------------------------------------------------------------------
  obtenerTickets: (): TicketMesaAyuda[] => ticketsEstado,

  obtenerTicketsPorEstudiante: (estudianteId: string): TicketMesaAyuda[] => {
    return ticketsEstado.filter((t) => t.estudiante_id === estudianteId);
  },

  crearTicket: (nuevoTicket: {
    estudiante_id: string;
    estudiante_nombre: string;
    codigo_estudiante: string;
    asunto: string;
    categoria: TicketMesaAyuda['categoria'];
    mensaje: string;
  }) => {
    const ticket: TicketMesaAyuda = {
      id: 'tck_' + Date.now(),
      ...nuevoTicket,
      fecha_creacion: new Date().toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      estado: 'PENDIENTE',
    };

    ticketsEstado = [ticket, ...ticketsEstado];
    notificarCambio();
    return ticket;
  },

  responderTicket: (
    ticketId: string,
    respuestaAdmin: string,
    nombreAdmin: string
  ) => {
    ticketsEstado = ticketsEstado.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          estado: 'RESUELTO',
          respuesta_admin: respuestaAdmin,
          respondido_por: nombreAdmin,
          fecha_respuesta: new Date().toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
      }
      return t;
    });

    notificarCambio();
    return true;
  },

  // --------------------------------------------------------------------------
  // PERFILES & FOTO DE ESTUDIANTE (Subida interactiva de foto)
  // --------------------------------------------------------------------------
  obtenerPerfil: (userId: string): Perfil | undefined => {
    return perfilesEstado.find((p) => p.user_id === userId);
  },

  obtenerTodosLosPerfiles: (): Perfil[] => perfilesEstado,

  obtenerTodosLosEstudiantes: (): Estudiante[] => estudiantesEstado,

  obtenerEstudiantePorPerfil: (perfilId: string): Estudiante | undefined => {
    return estudiantesEstado.find((e) => e.perfil_id === perfilId);
  },

  obtenerEstudiantePorUserId: (userId: string): Estudiante | undefined => {
    const perf = perfilesEstado.find((p) => p.user_id === userId);
    if (!perf) return undefined;
    return estudiantesEstado.find((e) => e.perfil_id === perf.id);
  },

  obtenerCuentas: (): CuentaUsuario[] => cuentasEstado,

  // --------------------------------------------------------------------------
  // AUTENTICACIÓN Y REGISTRO (Estudiantes y Administradores)
  // --------------------------------------------------------------------------
  autenticarUsuario: (credenciales: {
    email: string;
    password: string;
    rolEsperado?: 'estudiante' | 'administrador';
  }): {
    exito: boolean;
    mensaje: string;
    perfil?: Perfil;
    estudiante?: Estudiante;
  } => {
    const emailNorm = credenciales.email.trim().toLowerCase();
    const passNorm = credenciales.password.trim();

    const cuenta = cuentasEstado.find((c) => c.email.toLowerCase() === emailNorm);
    if (!cuenta) {
      return {
        exito: false,
        mensaje: 'El correo electrónico no se encuentra registrado en el sistema universitario.',
      };
    }

    if (cuenta.password !== passNorm) {
      return {
        exito: false,
        mensaje: 'La contraseña ingresada es incorrecta. Por favor verifica tus credenciales.',
      };
    }

    if (credenciales.rolEsperado && cuenta.rol !== credenciales.rolEsperado) {
      return {
        exito: false,
        mensaje: `Esta cuenta no tiene permisos de ${credenciales.rolEsperado}. Su rol asignado es: ${cuenta.rol}.`,
      };
    }

    const perfil =
      perfilesEstado.find((p) => p.user_id === cuenta.user_id) ||
      perfilesEstado.find((p) => p.id === cuenta.perfil_id);

    if (!perfil) {
      return {
        exito: false,
        mensaje: 'No se encontró el registro de perfil institucional asociado a esta cuenta.',
      };
    }

    const estudiante = estudiantesEstado.find((e) => e.perfil_id === perfil.id);

    try {
      localStorage.setItem('portal_unt_session_user_id', perfil.user_id);
    } catch (e) {}

    return {
      exito: true,
      mensaje: `¡Bienvenido(a), ${perfil.nombre_completo}!`,
      perfil,
      estudiante,
    };
  },

  registrarCuentaEstudiante: (datos: {
    nombre_completo: string;
    email: string;
    password: string;
    documento_identidad: string;
    carrera_id?: string;
    telefono?: string;
  }): {
    exito: boolean;
    mensaje: string;
    perfil?: Perfil;
    estudiante?: Estudiante;
  } => {
    const emailNorm = datos.email.trim().toLowerCase();
    if (cuentasEstado.some((c) => c.email.toLowerCase() === emailNorm)) {
      return {
        exito: false,
        mensaje: 'Ya existe una cuenta universitaria registrada con este correo electrónico.',
      };
    }

    const timestamp = Date.now();
    const userId = 'usr_est_' + timestamp;
    const perfilId = 'perf_' + timestamp;
    const estudianteId = 'est_' + timestamp;
    const randomCod = Math.floor(100000 + Math.random() * 900000);
    const codigoEstudiante = `26-${randomCod}`;

    const nuevoPerfil: Perfil = {
      id: perfilId,
      user_id: userId,
      email: emailNorm,
      rol: 'estudiante',
      nombre_completo: datos.nombre_completo.trim(),
      avatar_url: '',
      telefono: datos.telefono || '+51 9' + Math.floor(10000000 + Math.random() * 90000000),
      documento_identidad: datos.documento_identidad.trim() || String(Math.floor(70000000 + Math.random() * 9999999)),
      creado_en: new Date().toISOString(),
    };

    const nuevoEstudiante: Estudiante = {
      id: estudianteId,
      perfil_id: perfilId,
      codigo_estudiante: codigoEstudiante,
      carrera_id: datos.carrera_id || 'car_01',
      semestre_actual: 1, // Todo estudiante inicia en 1° semestre
      estado: 'ACTIVO',
      promedio_ponderado: 0.0,
      creditos_aprobados: 0,
      creditos_matriculados: 0,
      periodo_ingreso: '2026-I',
    };

    const nuevaCuenta: CuentaUsuario = {
      id: 'cue_' + timestamp,
      email: emailNorm,
      password: datos.password.trim(),
      rol: 'estudiante',
      perfil_id: perfilId,
      user_id: userId,
    };

    perfilesEstado = [...perfilesEstado, nuevoPerfil];
    estudiantesEstado = [...estudiantesEstado, nuevoEstudiante];
    cuentasEstado = [...cuentasEstado, nuevaCuenta];

    try {
      localStorage.setItem('portal_unt_session_user_id', userId);
    } catch (e) {}

    notificarCambio();

    return {
      exito: true,
      mensaje: `¡Cuenta creada exitosamente! Bienvenido al 1° Semestre con 22 créditos base, ${nuevoPerfil.nombre_completo}.`,
      perfil: nuevoPerfil,
      estudiante: nuevoEstudiante,
    };
  },

  guardarSesionActiva: (userId: string) => {
    try {
      localStorage.setItem('portal_unt_session_user_id', userId);
    } catch (e) {}
    notificarCambio();
  },

  obtenerSesionGuardada: (): string | null => {
    try {
      return localStorage.getItem('portal_unt_session_user_id');
    } catch (e) {
      return null;
    }
  },

  cerrarSesion: () => {
    try {
      localStorage.removeItem('portal_unt_session_user_id');
    } catch (e) {}
    notificarCambio();
  },

  actualizarAvatarPerfil: (userId: string, avatarUrl: string): boolean => {
    perfilesEstado = perfilesEstado.map((p) =>
      p.user_id === userId ? { ...p, avatar_url: avatarUrl } : p
    );
    notificarCambio();
    return true;
  },

  // --------------------------------------------------------------------------
  // ASISTENCIAS (Profesor marca si el alumno estuvo o no)
  // --------------------------------------------------------------------------
  obtenerAsistencias: (): AsistenciaItem[] => {
    return asistenciasEstado;
  },

  obtenerAsistenciasPorEstudiante: (estudianteId: string): AsistenciaItem[] => {
    return asistenciasEstado.filter(
      (a) => a.estudiante_id === estudianteId || (!a.estudiante_id && estudianteId === 'est_01')
    );
  },

  actualizarEstadoAsistencia: (asistenciaId: string, nuevoEstado: 'PRESENTE' | 'FALTA') => {
    let affectedCourse = '';
    let studentId = '';

    asistenciasEstado = asistenciasEstado.map((a) => {
      if (a.id === asistenciaId) {
        affectedCourse = a.curso_nombre;
        studentId = a.estudiante_id || 'est_01';
        return { ...a, estado: nuevoEstado };
      }
      return a;
    });

    // Sincronizar porcentaje de asistencia en la matrícula del alumno si aplica
    if (affectedCourse && studentId) {
      const sesionesCurso = asistenciasEstado.filter(
        (a) => (a.estudiante_id === studentId || !a.estudiante_id) && a.curso_nombre === affectedCourse
      );
      if (sesionesCurso.length > 0) {
        const presentes = sesionesCurso.filter((a) => a.estado === 'PRESENTE').length;
        const porcentaje = Math.round((presentes / sesionesCurso.length) * 100);

        matriculasEstado = matriculasEstado.map((m) => {
          const sec = seccionesEstado.find((s) => s.id === m.seccion_id);
          const cur = sec ? cursosEstado.find((c) => c.id === sec.curso_id) : undefined;
          if (m.estudiante_id === studentId && cur?.nombre === affectedCourse) {
            return { ...m, asistencias_porcentaje: porcentaje };
          }
          return m;
        });
      }
    }

    notificarCambio();
    return true;
  },

  alternarEstadoAsistencia: (asistenciaId: string) => {
    const item = asistenciasEstado.find((a) => a.id === asistenciaId);
    if (item) {
      const nuevoEstado = item.estado === 'PRESENTE' ? 'FALTA' : 'PRESENTE';
      return AcademicStore.actualizarEstadoAsistencia(asistenciaId, nuevoEstado);
    }
    return false;
  },

  marcarTodasAsistencias: (
    estudianteId: string,
    nuevoEstado: 'PRESENTE' | 'FALTA',
    cursoNombre?: string
  ) => {
    asistenciasEstado = asistenciasEstado.map((a) => {
      const matchStudent = a.estudiante_id === estudianteId || (!a.estudiante_id && estudianteId === 'est_01');
      const matchCourse = !cursoNombre || a.curso_nombre === cursoNombre;
      if (matchStudent && matchCourse) {
        return { ...a, estado: nuevoEstado };
      }
      return a;
    });

    // Actualizar porcentaje en matrículas
    const porcentaje = nuevoEstado === 'PRESENTE' ? 100 : 0;
    matriculasEstado = matriculasEstado.map((m) => {
      if (m.estudiante_id === estudianteId) {
        return { ...m, asistencias_porcentaje: porcentaje };
      }
      return m;
    });

    notificarCambio();
    return true;
  },

  agregarSesionAsistencia: (datos: {
    estudiante_id: string;
    curso_nombre: string;
    fecha: string;
    hora_registro: string;
    tema: string;
    estado: 'PRESENTE' | 'FALTA';
    docente_nombre: string;
  }) => {
    const nuevaSesion: AsistenciaItem = {
      id: 'asist_' + Date.now(),
      ...datos,
      matricula_id: 'mat_manual',
    };

    asistenciasEstado = [nuevaSesion, ...asistenciasEstado];
    notificarCambio();
    return nuevaSesion;
  },
};

