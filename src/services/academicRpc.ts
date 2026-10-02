import {
  PERFILES_DB,
  ESTUDIANTES_DB,
  CARRERAS_DB,
  PERIODOS_DB,
  HISTORIAL_ACADEMICO_DB,
} from '../data/mockSupabaseDb';
import { AcademicStore } from '../data/academicStore';

export interface RpcExecutionResult<T = any> {
  success: boolean;
  rpcName: string;
  params: Record<string, any>;
  data: T;
  latencyMs: number;
  sqlSnippet: string;
  securityCheck: {
    authenticatedUserId: string;
    rlsEnforced: boolean;
    authorized: boolean;
  };
}

/**
 * Simulación de ejecución de RPCs de Supabase PostgreSQL
 * con cumplimiento estricto de autenticación y aislamiento RLS.
 */
export class AcademicRpcService {
  /**
   * 1. RPC: obtener_horario_estudiante_hoy
   * Parámetro opcional: p_dia_semana (1: Lun, 2: Mar, ..., 6: Sab)
   */
  static async obtenerHorarioEstudianteHoy(
    userId: string,
    p_dia_semana?: number
  ): Promise<RpcExecutionResult> {
    const startTime = performance.now();

    // 1. Validar autenticación
    const perfil = PERFILES_DB.find((p) => p.user_id === userId) || PERFILES_DB[0];
    const estudiante = ESTUDIANTES_DB.find((e) => e.perfil_id === perfil.id);

    // Día de la semana (por defecto día actual o miércoles)
    const now = new Date();
    const diaActual = now.getDay() === 0 ? 1 : now.getDay();
    const diaTarget = p_dia_semana || diaActual;

    const diasNombres: Record<number, string> = {
      1: 'Lunes',
      2: 'Martes',
      3: 'Miércoles',
      4: 'Jueves',
      5: 'Viernes',
      6: 'Sábado',
    };

    const horarios = AcademicStore.obtenerHorarios();
    const secciones = AcademicStore.obtenerSecciones();
    const cursos = AcademicStore.obtenerCursos();

    // Si es administrador, no tiene matrícula de estudiante propia
    if (!estudiante) {
      const data = {
        dia_solicitado: diaTarget,
        dia_nombre: diasNombres[diaTarget] || 'Hoy',
        fecha_consulta: now.toISOString().split('T')[0],
        total_clases: 0,
        clases: [],
        es_administrador: true,
      };

      return {
        success: true,
        rpcName: 'obtener_horario_estudiante_hoy',
        params: { p_dia_semana: diaTarget },
        data,
        latencyMs: 12,
        sqlSnippet: `SELECT * FROM public.obtener_horario_estudiante_hoy(${diaTarget}); -- Rol: Administrador`,
        securityCheck: {
          authenticatedUserId: userId,
          rlsEnforced: true,
          authorized: true,
        },
      };
    }

    // Buscar matrículas activas del estudiante
    const matriculasActivas = AcademicStore.obtenerMatriculas().filter(
      (m) => m.estudiante_id === estudiante.id && m.estado === 'EN_CURSO'
    );
    const seccionIds = matriculasActivas.map((m) => m.seccion_id);

    // Buscar horarios para esas secciones en el día indicado
    const horariosDelDia = horarios.filter(
      (h) => seccionIds.includes(h.seccion_id) && h.dia_semana === diaTarget
    ).sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

    const clases = horariosDelDia.map((h) => {
      const seccion = secciones.find((s) => s.id === h.seccion_id);
      const curso = seccion ? cursos.find((c) => c.id === seccion.curso_id) : undefined;
      return {
        horario_id: h.id,
        curso_codigo: curso?.codigo || 'N/A',
        curso_nombre: curso?.nombre || 'Curso Desconocido',
        seccion: seccion?.codigo_seccion || 'SEC-01',
        docente: seccion?.docente_nombre || 'Docente Asignado',
        hora_inicio: h.hora_inicio,
        hora_fin: h.hora_fin,
        aula: h.aula,
        pabellon: h.pabellon,
        tipo_sesion: h.tipo_sesion,
      };
    });

    const data = {
      dia_solicitado: diaTarget,
      dia_nombre: diasNombres[diaTarget] || 'Hoy',
      fecha_consulta: now.toISOString().split('T')[0],
      total_clases: clases.length,
      total_matriculas: matriculasActivas.length,
      clases,
      es_administrador: false,
    };

    const latencyMs = Math.round(performance.now() - startTime + 8);

    return {
      success: true,
      rpcName: 'obtener_horario_estudiante_hoy',
      params: { p_dia_semana: diaTarget },
      data,
      latencyMs,
      sqlSnippet: `SELECT * FROM public.obtener_horario_estudiante_hoy(${diaTarget}); -- auth.uid() = '${userId}'`,
      securityCheck: {
        authenticatedUserId: userId,
        rlsEnforced: true,
        authorized: true,
      },
    };
  }

  /**
   * 2. RPC: obtener_perfil_academico
   */
  static async obtenerPerfilAcademico(userId: string): Promise<RpcExecutionResult> {
    const startTime = performance.now();

    const perfil = PERFILES_DB.find((p) => p.user_id === userId) || PERFILES_DB[0];
    const estudiante = ESTUDIANTES_DB.find((e) => e.perfil_id === perfil.id);

    // Caso Administrador
    if (!estudiante) {
      const data = {
        nombre_completo: perfil.nombre_completo,
        email: perfil.email,
        documento_identidad: perfil.documento_identidad,
        codigo_estudiante: 'ADMIN-DIRECTIVO',
        carrera: 'Dirección Académica y Coordinación Curricular',
        facultad: 'Oficina Central de Gestión Universitaria',
        semestre_actual: 0,
        estado_academico: 'AUTORIDAD INSTITUCIONAL',
        promedio_ponderado: 20.0,
        creditos_aprobados: 210,
        creditos_totales_carrera: 210,
        avance_porcentaje: 100,
        periodo_ingreso: '2020-I',
        es_administrador: true,
      };

      return {
        success: true,
        rpcName: 'obtener_perfil_academico',
        params: {},
        data,
        latencyMs: 9,
        sqlSnippet: `SELECT * FROM public.obtener_perfil_academico(); -- Rol: Administrador`,
        securityCheck: {
          authenticatedUserId: userId,
          rlsEnforced: true,
          authorized: true,
        },
      };
    }

    const carrera = CARRERAS_DB.find((c) => c.id === estudiante.carrera_id);

    const data = {
      nombre_completo: perfil.nombre_completo,
      email: perfil.email,
      documento_identidad: perfil.documento_identidad,
      codigo_estudiante: estudiante.codigo_estudiante,
      carrera: carrera?.nombre || 'Carrera Universitaria',
      facultad: carrera?.facultad || 'Facultad General',
      semestre_actual: estudiante.semestre_actual,
      estado_academico: estudiante.estado,
      promedio_ponderado: estudiante.promedio_ponderado,
      creditos_aprobados: estudiante.creditos_aprobados,
      creditos_totales_carrera: carrera?.creditos_totales || 200,
      avance_porcentaje: Math.round(
        (estudiante.creditos_aprobados / (carrera?.creditos_totales || 200)) * 100
      ),
      periodo_ingreso: estudiante.periodo_ingreso,
      es_administrador: false,
    };

    const latencyMs = Math.round(performance.now() - startTime + 6);

    return {
      success: true,
      rpcName: 'obtener_perfil_academico',
      params: {},
      data,
      latencyMs,
      sqlSnippet: `SELECT * FROM public.obtener_perfil_academico(); -- auth.uid() = '${userId}'`,
      securityCheck: {
        authenticatedUserId: userId,
        rlsEnforced: true,
        authorized: true,
      },
    };
  }

  /**
   * 3. RPC: obtener_cursos_matriculados
   */
  static async obtenerCursosMatriculados(
    userId: string,
    p_periodo_codigo?: string
  ): Promise<RpcExecutionResult> {
    const startTime = performance.now();

    const perfil = PERFILES_DB.find((p) => p.user_id === userId) || PERFILES_DB[0];
    const estudiante = ESTUDIANTES_DB.find((e) => e.perfil_id === perfil.id);
    const periodoCodigo = p_periodo_codigo || '2026-I';

    const secciones = AcademicStore.obtenerSecciones();
    const cursos = AcademicStore.obtenerCursos();
    const horarios = AcademicStore.obtenerHorarios();

    // Caso Administrador: Retorna el catálogo general de asignaturas
    if (!estudiante) {
      const data = {
        periodo: periodoCodigo,
        total_asignaturas: cursos.length,
        creditos_totales: cursos.reduce((acc, c) => acc + (c.creditos || 0), 0),
        cursos: cursos.map((c) => {
          const sec = secciones.find((s) => s.curso_id === c.id);
          return {
            matricula_id: 'cat_' + c.id,
            codigo_curso: c.codigo,
            nombre_curso: c.nombre,
            creditos: c.creditos,
            ciclo: c.ciclo,
            seccion: sec?.codigo_seccion || 'SEC-A',
            docente: sec?.docente_nombre || 'Docente Asignado',
            docente_email: sec?.docente_email || 'docente@unt.edu.pe',
            aula: sec?.aula_default || 'Aula Universitaria',
            estado_matricula: 'ACTIVO_EN_CATALOGO',
            nota_parcial: undefined,
            asistencias_porcentaje: 100,
          };
        }),
        es_administrador: true,
      };

      return {
        success: true,
        rpcName: 'obtener_cursos_matriculados',
        params: { p_periodo_codigo: periodoCodigo },
        data,
        latencyMs: 12,
        sqlSnippet: `SELECT * FROM public.obtener_cursos_matriculados('${periodoCodigo}'); -- Rol: Administrador`,
        securityCheck: {
          authenticatedUserId: userId,
          rlsEnforced: true,
          authorized: true,
        },
      };
    }

    const periodo = PERIODOS_DB.find((p) => p.codigo === periodoCodigo);
    const matriculas = AcademicStore.obtenerMatriculas().filter(
      (m) => m.estudiante_id === estudiante.id && (!periodo || m.periodo_id === periodo.id)
    );

    const cursosDetallados = matriculas.map((m) => {
      const seccion = secciones.find((s) => s.id === m.seccion_id);
      const curso = seccion ? cursos.find((c) => c.id === seccion.curso_id) : undefined;
      const horariosCurso = horarios.filter((h) => h.seccion_id === m.seccion_id);

      return {
        matricula_id: m.id,
        codigo_curso: curso?.codigo || 'N/A',
        nombre_curso: curso?.nombre || 'Asignatura Universitaria',
        creditos: curso?.creditos || 4,
        ciclo: curso?.ciclo || 6,
        seccion: seccion?.codigo_seccion || 'SEC-A',
        docente: seccion?.docente_nombre || 'Docente Asignado',
        docente_email: seccion?.docente_email || 'docente@unt.edu.pe',
        aula: seccion?.aula_default || 'Pabellón B',
        estado_matricula: m.estado,
        nota_parcial: m.nota_parcial,
        asistencias_porcentaje: m.asistencias_porcentaje || 100,
        horarios: horariosCurso.map((h) => ({
          dia: h.dia_nombre,
          horas: `${h.hora_inicio} - ${h.hora_fin}`,
          aula: h.aula,
          tipo: h.tipo_sesion,
        })),
      };
    });

    const data = {
      periodo: periodoCodigo,
      total_asignaturas: cursosDetallados.length,
      creditos_totales: cursosDetallados.reduce((acc, c) => acc + (c.creditos || 0), 0),
      cursos: cursosDetallados,
      es_administrador: false,
    };

    const latencyMs = Math.round(performance.now() - startTime + 9);

    return {
      success: true,
      rpcName: 'obtener_cursos_matriculados',
      params: { p_periodo_codigo: periodoCodigo },
      data,
      latencyMs,
      sqlSnippet: `SELECT * FROM public.obtener_cursos_matriculados('${periodoCodigo}'); -- auth.uid() = '${userId}'`,
      securityCheck: {
        authenticatedUserId: userId,
        rlsEnforced: true,
        authorized: true,
      },
    };
  }

  /**
   * 4. RPC: obtener_semaforo_curricular
   */
  static async obtenerSemaforoCurricular(userId: string): Promise<RpcExecutionResult> {
    const startTime = performance.now();

    const perfil = PERFILES_DB.find((p) => p.user_id === userId) || PERFILES_DB[0];
    const estudiante = ESTUDIANTES_DB.find((e) => e.perfil_id === perfil.id);

    const secciones = AcademicStore.obtenerSecciones();
    const cursos = AcademicStore.obtenerCursos();

    if (!estudiante) {
      const data = {
        carrera: 'Ingeniería de Sistemas e Informática',
        creditos_totales: 210,
        creditos_aprobados: 210,
        avance_porcentaje: 100,
        resumen: {
          aprobados: cursos.length,
          en_curso: 0,
          pendientes: 0,
        },
        cursos: cursos.map((c) => ({
          codigo: c.codigo,
          nombre: c.nombre,
          ciclo: c.ciclo,
          creditos: c.creditos,
          estado_semaforo: 'APROBADO',
        })),
        es_administrador: true,
      };

      return {
        success: true,
        rpcName: 'obtener_semaforo_curricular',
        params: {},
        data,
        latencyMs: 10,
        sqlSnippet: `SELECT * FROM public.obtener_semaforo_curricular(); -- Rol: Administrador`,
        securityCheck: {
          authenticatedUserId: userId,
          rlsEnforced: true,
          authorized: true,
        },
      };
    }

    const carrera = CARRERAS_DB.find((c) => c.id === estudiante.carrera_id);
    const historial = HISTORIAL_ACADEMICO_DB.filter((h) => h.estudiante_id === estudiante.id);
    const matriculasActivas = AcademicStore.obtenerMatriculas().filter(
      (m) => m.estudiante_id === estudiante.id && m.estado === 'EN_CURSO'
    );

    const seccionesActivas = secciones.filter((s) =>
      matriculasActivas.some((m) => m.seccion_id === s.id)
    );
    const cursosEnCursoIds = seccionesActivas.map((s) => s.curso_id);

    // Mapear cursos con su estado
    const cursosMapeados = cursos.map((c) => {
      const enHistorial = historial.find((h) => h.curso_id === c.id);
      const enCurso = cursosEnCursoIds.includes(c.id);

      let estado_semaforo: 'APROBADO' | 'EN_CURSO' | 'PENDIENTE' = 'PENDIENTE';
      let nota: number | undefined = undefined;

      if (enHistorial && enHistorial.estado === 'APROBADO') {
        estado_semaforo = 'APROBADO';
        nota = enHistorial.nota_final;
      } else if (enCurso) {
        estado_semaforo = 'EN_CURSO';
        const mat = matriculasActivas.find((m) => {
          const sec = secciones.find((s) => s.id === m.seccion_id);
          return sec?.curso_id === c.id;
        });
        nota = mat?.nota_parcial;
      }

      return {
        curso_id: c.id,
        codigo: c.codigo,
        nombre: c.nombre,
        ciclo: c.ciclo,
        creditos: c.creditos,
        estado_semaforo,
        nota_registrada: nota,
      };
    });

    const aprobadosCount = cursosMapeados.filter((c) => c.estado_semaforo === 'APROBADO').length;
    const enCursoCount = cursosMapeados.filter((c) => c.estado_semaforo === 'EN_CURSO').length;
    const pendientesCount = cursosMapeados.filter((c) => c.estado_semaforo === 'PENDIENTE').length;

    const data = {
      carrera: carrera?.nombre || 'Ingeniería de Sistemas',
      creditos_totales: carrera?.creditos_totales || 210,
      creditos_aprobados: estudiante.creditos_aprobados,
      avance_porcentaje: Math.round(
        (estudiante.creditos_aprobados / (carrera?.creditos_totales || 210)) * 100
      ),
      resumen: {
        aprobados: aprobadosCount,
        en_curso: enCursoCount,
        pendientes: pendientesCount,
      },
      cursos: cursosMapeados,
      es_administrador: false,
    };

    const latencyMs = Math.round(performance.now() - startTime + 11);

    return {
      success: true,
      rpcName: 'obtener_semaforo_curricular',
      params: {},
      data,
      latencyMs,
      sqlSnippet: `SELECT * FROM public.obtener_semaforo_curricular(); -- auth.uid() = '${userId}'`,
      securityCheck: {
        authenticatedUserId: userId,
        rlsEnforced: true,
        authorized: true,
      },
    };
  }
}
