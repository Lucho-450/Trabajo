export type RolUsuario = 'estudiante' | 'administrador' | 'docente';

export interface Perfil {
  id: string;
  user_id: string;
  email: string;
  rol: RolUsuario;
  nombre_completo: string;
  avatar_url: string;
  telefono?: string;
  documento_identidad: string;
  creado_en: string;
}

export interface CuentaUsuario {
  id: string;
  email: string;
  password: string;
  rol: RolUsuario;
  perfil_id: string;
  user_id: string;
}

export type EstadoEstudiante = 'ACTIVO' | 'INACTIVO' | 'EGRESADO' | 'RESERVA';

export interface Carrera {
  id: string;
  codigo: string;
  nombre: string;
  facultad: string;
  creditos_totales: number;
  duracion_semestres: number;
}

export interface Estudiante {
  id: string;
  perfil_id: string;
  codigo_estudiante: string; // e.g. "25-260481"
  carrera_id: string;
  carrera?: Carrera;
  semestre_actual: number; // e.g. 1
  estado: EstadoEstudiante;
  promedio_ponderado: number;
  creditos_aprobados: number;
  creditos_matriculados: number;
  periodo_ingreso: string;
  perfil?: Perfil;
}

export interface PeriodoAcademico {
  id: string;
  codigo: string; // e.g. "2026-I"
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  es_activo: boolean;
}

export interface Curso {
  id: string;
  codigo: string; // e.g. "CC-301"
  nombre: string;
  creditos: number;
  ciclo: number;
  tipo: 'OBLIGATORIO' | 'ELECTIVO';
  prerrequisitos: string[];
  descripcion: string;
  silabo_url?: string;
}

export interface Seccion {
  id: string;
  curso_id: string;
  curso?: Curso;
  periodo_id: string;
  codigo_seccion: string; // e.g. "SEC-01"
  docente_nombre: string;
  docente_email: string;
  aula_default: string;
  cupo_maximo: number;
  matriculados: number;
}

export type DiaSemana = 1 | 2 | 3 | 4 | 5 | 6; // 1: Lunes, 2: Martes, etc.

export interface Horario {
  id: string;
  seccion_id: string;
  seccion?: Seccion;
  dia_semana: DiaSemana;
  dia_nombre: string;
  hora_inicio: string; // "08:00"
  hora_fin: string; // "10:15"
  aula: string;
  pabellon: string;
  tipo_sesion: 'TEORIA' | 'PRACTICA' | 'LABORATORIO';
}

export type EstadoMatricula = 'REGISTRADO' | 'EN_CURSO' | 'APROBADO' | 'DESAPROBADO' | 'RETIRADO';

export interface Matricula {
  id: string;
  estudiante_id: string;
  seccion_id: string;
  seccion?: Seccion;
  periodo_id: string;
  periodo?: PeriodoAcademico;
  fecha_matricula: string;
  estado: EstadoMatricula;
  nota_permanente_1?: number;
  nota_parcial?: number;
  nota_permanente_2?: number;
  nota_final?: number;
  nota_promedio?: number;
  asistencias_porcentaje?: number;
}

export interface HistorialAcademico {
  id: string;
  estudiante_id: string;
  curso_id: string;
  curso?: Curso;
  periodo_id: string;
  periodo_codigo: string;
  nota_final: number;
  estado: 'APROBADO' | 'DESAPROBADO' | 'CONVALIDADO';
  creditos: number;
  ciclo: number;
}

export interface EventoUniversitario {
  id: string;
  titulo: string;
  fecha: string;
  hora: string;
  lugar: string;
  categoria: 'ACADEMICO' | 'CULTURAL' | 'DEPORTIVO' | 'FERIA' | 'CONFERENCIA';
  descripcion: string;
  organizador: string;
  inscripcion_requerida: boolean;
}

export interface AsistenciaItem {
  id: string;
  estudiante_id?: string;
  matricula_id: string;
  curso_nombre: string;
  fecha: string;
  estado: 'PRESENTE' | 'TARDANZA' | 'FALTA' | 'JUSTIFICADA';
  hora_registro: string;
  tema: string;
  docente_nombre?: string;
}

export interface PagoItem {
  id: string;
  estudiante_id: string;
  concepto: string;
  monto: number;
  moneda: string;
  fecha_vencimiento: string;
  fecha_pago?: string;
  estado: 'PAGADO' | 'PENDIENTE' | 'VENCIDO';
  comprobante_numero?: string;
}

export interface TicketMesaAyuda {
  id: string;
  estudiante_id: string;
  estudiante_nombre: string;
  codigo_estudiante: string;
  asunto: string;
  categoria: 'MATRICULA' | 'CALIFICACIONES' | 'PAGOS' | 'ASISTENCIA' | 'TRAMITE' | 'OTRO';
  mensaje: string;
  fecha_creacion: string;
  estado: 'PENDIENTE' | 'EN_REVISION' | 'RESUELTO';
  respuesta_admin?: string;
  respondido_por?: string;
  fecha_respuesta?: string;
}

export interface EvaluacionDocenteItem {
  id: string;
  estudiante_id: string;
  docente_nombre: string;
  curso_codigo: string;
  curso_nombre: string;
  pregunta_dominio: number; // 1 to 5
  pregunta_puntualidad: number; // 1 to 5
  pregunta_disponibilidad: number; // 1 to 5
  comentario: string;
  fecha_registro: string;
}

export interface MensajeChat {
  id: string;
  emisor: 'usuario' | 'asistente' | 'sistema';
  texto: string;
  fecha: Date;
  toolCallUsado?: {
    nombreRpc: string;
    parametros: Record<string, any>;
    resultado: any;
    latenciaMs: number;
    sqlSnippet?: string;
  };
}
