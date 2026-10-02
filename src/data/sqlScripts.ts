export const SCHEMA_SQL = `-- ============================================================================
-- FASE 1: SISTEMA DE GESTIÓN ACADÉMICA (SIS/LMS) - SUPABASE POSTGRESQL
-- ESQUEMA CENTRALIZADO DE BASE DE DATOS
-- ============================================================================

-- 1. Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Enumeraciones de estado y roles
CREATE TYPE rol_usuario AS ENUM ('estudiante', 'administrador', 'docente');
CREATE TYPE estado_estudiante AS ENUM ('ACTIVO', 'INACTIVO', 'EGRESADO', 'RESERVA');
CREATE TYPE tipo_curso AS ENUM ('OBLIGATORIO', 'ELECTIVO');
CREATE TYPE tipo_sesion AS ENUM ('TEORIA', 'PRACTICA', 'LABORATORIO');
CREATE TYPE estado_matricula AS ENUM ('REGISTRADO', 'EN_CURSO', 'APROBADO', 'DESAPROBADO', 'RETIRADO');
CREATE TYPE estado_pago AS ENUM ('PAGADO', 'PENDIENTE', 'VENCIDO');

-- ----------------------------------------------------------------------------
-- TABLA: perfiles (Extensión de auth.users de Supabase)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.perfiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    rol rol_usuario NOT NULL DEFAULT 'estudiante',
    nombre_completo VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    telefono VARCHAR(30),
    documento_identidad VARCHAR(20) UNIQUE NOT NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- TABLA: carreras
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.carreras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    facultad VARCHAR(200) NOT NULL,
    creditos_totales INT NOT NULL CHECK (creditos_totales > 0),
    duracion_semestres INT NOT NULL DEFAULT 10,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- TABLA: periodos_academicos
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.periodos_academicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(20) UNIQUE NOT NULL, -- e.g. '2026-I'
    nombre VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL CHECK (fecha_fin > fecha_inicio),
    es_activo BOOLEAN NOT NULL DEFAULT false,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- TABLA: estudiantes
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.estudiantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    perfil_id UUID UNIQUE NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
    codigo_estudiante VARCHAR(20) UNIQUE NOT NULL, -- e.g. '25-260481'
    carrera_id UUID NOT NULL REFERENCES public.carreras(id) ON DELETE RESTRICT,
    semestre_actual INT NOT NULL DEFAULT 1 CHECK (semestre_actual BETWEEN 1 AND 14),
    estado estado_estudiante NOT NULL DEFAULT 'ACTIVO',
    promedio_ponderado NUMERIC(4,2) DEFAULT 0.00 CHECK (promedio_ponderado BETWEEN 0 AND 20),
    creditos_aprobados INT NOT NULL DEFAULT 0,
    periodo_ingreso VARCHAR(20) NOT NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- TABLA: cursos
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cursos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    carrera_id UUID NOT NULL REFERENCES public.carreras(id) ON DELETE CASCADE,
    codigo VARCHAR(20) UNIQUE NOT NULL, -- e.g. 'SI-601'
    nombre VARCHAR(200) NOT NULL,
    creditos INT NOT NULL CHECK (creditos > 0),
    ciclo INT NOT NULL CHECK (ciclo BETWEEN 1 AND 10),
    tipo tipo_curso NOT NULL DEFAULT 'OBLIGATORIO',
    prerrequisitos TEXT[] DEFAULT '{}',
    descripcion TEXT,
    silabo_url TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- TABLA: secciones (Instancia de un curso en un periodo con docente asignado)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.secciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
    periodo_id UUID NOT NULL REFERENCES public.periodos_academicos(id) ON DELETE CASCADE,
    codigo_seccion VARCHAR(20) NOT NULL, -- e.g. 'SEC-A'
    docente_nombre VARCHAR(200) NOT NULL,
    docente_email VARCHAR(255),
    aula_default VARCHAR(100),
    cupo_maximo INT NOT NULL DEFAULT 35,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(curso_id, periodo_id, codigo_seccion)
);

-- ----------------------------------------------------------------------------
-- TABLA: horarios (Días, horas y aulas asignadas a cada sección)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.horarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seccion_id UUID NOT NULL REFERENCES public.secciones(id) ON DELETE CASCADE,
    dia_semana SMALLINT NOT NULL CHECK (dia_semana BETWEEN 1 AND 6), -- 1: Lun, 2: Mar... 6: Sab
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL CHECK (hora_fin > hora_inicio),
    aula VARCHAR(100) NOT NULL,
    pabellon VARCHAR(100) NOT NULL,
    tipo_sesion tipo_sesion NOT NULL DEFAULT 'TEORIA'
);

-- ----------------------------------------------------------------------------
-- TABLA: matriculas (Inscripción del alumno en secciones de un periodo)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.matriculas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estudiante_id UUID NOT NULL REFERENCES public.estudiantes(id) ON DELETE CASCADE,
    seccion_id UUID NOT NULL REFERENCES public.secciones(id) ON DELETE CASCADE,
    periodo_id UUID NOT NULL REFERENCES public.periodos_academicos(id) ON DELETE CASCADE,
    fecha_matricula DATE NOT NULL DEFAULT CURRENT_DATE,
    estado estado_matricula NOT NULL DEFAULT 'EN_CURSO',
    nota_parcial NUMERIC(4,2),
    nota_final NUMERIC(4,2),
    nota_promedio NUMERIC(4,2),
    asistencias_porcentaje NUMERIC(5,2) DEFAULT 100.00,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(estudiante_id, seccion_id, periodo_id)
);

-- ----------------------------------------------------------------------------
-- TABLA: historial_academico (Registro consolidado de ciclos concluidos)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.historial_academico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estudiante_id UUID NOT NULL REFERENCES public.estudiantes(id) ON DELETE CASCADE,
    curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE RESTRICT,
    periodo_id UUID NOT NULL REFERENCES public.periodos_academicos(id) ON DELETE RESTRICT,
    nota_final NUMERIC(4,2) NOT NULL CHECK (nota_final BETWEEN 0 AND 20),
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('APROBADO', 'DESAPROBADO', 'CONVALIDADO')),
    creditos INT NOT NULL,
    ciclo INT NOT NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- TABLA: pagos (Control financiero del estudiante)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pagos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estudiante_id UUID NOT NULL REFERENCES public.estudiantes(id) ON DELETE CASCADE,
    concepto VARCHAR(200) NOT NULL,
    monto NUMERIC(8,2) NOT NULL,
    moneda VARCHAR(5) DEFAULT 'PEN',
    fecha_vencimiento DATE NOT NULL,
    fecha_pago TIMESTAMP WITH TIME ZONE,
    estado estado_pago NOT NULL DEFAULT 'PENDIENTE',
    comprobante_numero VARCHAR(50),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- TABLA: eventos_universitarios
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.eventos_universitarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(255) NOT NULL,
    fecha DATE NOT NULL,
    hora VARCHAR(50) NOT NULL,
    lugar VARCHAR(255) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    descripcion TEXT,
    organizador VARCHAR(200),
    inscripcion_requerida BOOLEAN DEFAULT false,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices de alto rendimiento para consultas del Chatbot y portal
CREATE INDEX IF NOT EXISTS idx_estudiantes_perfil ON public.estudiantes(perfil_id);
CREATE INDEX IF NOT EXISTS idx_estudiantes_codigo ON public.estudiantes(codigo_estudiante);
CREATE INDEX IF NOT EXISTS idx_matriculas_estudiante ON public.matriculas(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_periodo ON public.matriculas(periodo_id);
CREATE INDEX IF NOT EXISTS idx_horarios_seccion ON public.horarios(seccion_id);
CREATE INDEX IF NOT EXISTS idx_historial_estudiante ON public.historial_academico(estudiante_id);
`;

export const RLS_SQL = `-- ============================================================================
-- POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY - RLS) EN SUPABASE
-- Principio de Menor Privilegio: Aislamiento estricto por auth.uid()
-- ============================================================================

-- 1. Habilitación de RLS en todas las tablas
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carreras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.periodos_academicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matriculas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historial_academico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos_universitarios ENABLE ROW LEVEL SECURITY;

-- 2. Función auxiliar segura para comprobar si el usuario es Administrador
CREATE OR REPLACE FUNCTION public.es_administrador()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.perfiles
    WHERE user_id = auth.uid()
      AND rol = 'administrador'
  );
$$;

-- ----------------------------------------------------------------------------
-- POLÍTICAS PARA: perfiles
-- ----------------------------------------------------------------------------
-- El usuario solo puede leer su propio perfil; el admin puede ver todos.
CREATE POLICY "perfiles_select_propio_o_admin"
ON public.perfiles FOR SELECT
USING (
    user_id = auth.uid() OR public.es_administrador()
);

CREATE POLICY "perfiles_update_propio"
ON public.perfiles FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- POLÍTICAS PARA: estudiantes
-- ----------------------------------------------------------------------------
-- Solo el estudiante dueño de su perfil o un admin puede consultar sus datos
CREATE POLICY "estudiantes_select_propio_o_admin"
ON public.estudiantes FOR SELECT
USING (
    perfil_id IN (SELECT id FROM public.perfiles WHERE user_id = auth.uid())
    OR public.es_administrador()
);

-- Solo administradores pueden insertar o actualizar estudiantes
CREATE POLICY "estudiantes_admin_all"
ON public.estudiantes FOR ALL
USING (public.es_administrador());

-- ----------------------------------------------------------------------------
-- POLÍTICAS PARA: matriculas
-- ----------------------------------------------------------------------------
CREATE POLICY "matriculas_select_propio_o_admin"
ON public.matriculas FOR SELECT
USING (
    estudiante_id IN (
        SELECT e.id FROM public.estudiantes e
        JOIN public.perfiles p ON p.id = e.perfil_id
        WHERE p.user_id = auth.uid()
    )
    OR public.es_administrador()
);

-- ----------------------------------------------------------------------------
-- POLÍTICAS PARA: horarios
-- ----------------------------------------------------------------------------
-- El estudiante solo puede ver horarios de las secciones en las que está matriculado
CREATE POLICY "horarios_select_matriculado_o_admin"
ON public.horarios FOR SELECT
USING (
    seccion_id IN (
        SELECT m.seccion_id FROM public.matriculas m
        JOIN public.estudiantes e ON e.id = m.estudiante_id
        JOIN public.perfiles p ON p.id = e.perfil_id
        WHERE p.user_id = auth.uid()
    )
    OR public.es_administrador()
);

-- ----------------------------------------------------------------------------
-- POLÍTICAS PARA: historial_academico
-- ----------------------------------------------------------------------------
CREATE POLICY "historial_select_propio_o_admin"
ON public.historial_academico FOR SELECT
USING (
    estudiante_id IN (
        SELECT e.id FROM public.estudiantes e
        JOIN public.perfiles p ON p.id = e.perfil_id
        WHERE p.user_id = auth.uid()
    )
    OR public.es_administrador()
);

-- ----------------------------------------------------------------------------
-- POLÍTICAS PARA: pagos
-- ----------------------------------------------------------------------------
CREATE POLICY "pagos_select_propio_o_admin"
ON public.pagos FOR SELECT
USING (
    estudiante_id IN (
        SELECT e.id FROM public.estudiantes e
        JOIN public.perfiles p ON p.id = e.perfil_id
        WHERE p.user_id = auth.uid()
    )
    OR public.es_administrador()
);

-- ----------------------------------------------------------------------------
-- POLÍTICAS PARA TABLAS PÚBLICAS / DE CATÁLOGO (Cursos, Carreras, Eventos)
-- Todos los usuarios autenticados pueden leer el catálogo
-- ----------------------------------------------------------------------------
CREATE POLICY "catalogo_carreras_select_autenticado" ON public.carreras FOR SELECT TO authenticated USING (true);
CREATE POLICY "catalogo_cursos_select_autenticado" ON public.cursos FOR SELECT TO authenticated USING (true);
CREATE POLICY "catalogo_periodos_select_autenticado" ON public.periodos_academicos FOR SELECT TO authenticated USING (true);
CREATE POLICY "catalogo_eventos_select_autenticado" ON public.eventos_universitarios FOR SELECT TO authenticated USING (true);
`;

export const RPC_FUNCTIONS_SQL = `-- ============================================================================
-- FUNCIONES ALMACENADAS RPC PARA EL CHATBOT DE IA Y PANEL ESTUDIANTIL
-- Se ejecutan con SECURITY DEFINER pero validando auth.uid() internamente
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. RPC: obtener_horario_estudiante_hoy
-- Pregunta del Chatbot: "¿A qué hora tengo clase hoy?"
-- Parámetros: p_dia_semana (1: Lun, 2: Mar, ..., 6: Sab). Si es NULL, toma el día actual.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.obtener_horario_estudiante_hoy(
    p_dia_semana INT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_dia INT := COALESCE(p_dia_semana, EXTRACT(ISODOW FROM CURRENT_DATE)::INT);
    v_resultado JSONB;
BEGIN
    -- Validar que el usuario esté autenticado
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado en Supabase';
    END IF;

    SELECT jsonb_build_object(
        'dia_solicitado', v_dia,
        'fecha_consulta', CURRENT_DATE,
        'total_clases', COUNT(h.id),
        'clases', COALESCE(jsonb_agg(
            jsonb_build_object(
                'curso_codigo', c.codigo,
                'curso_nombre', c.nombre,
                'seccion', s.codigo_seccion,
                'docente', s.docente_nombre,
                'hora_inicio', to_char(h.hora_inicio, 'HH24:MI'),
                'hora_fin', to_char(h.hora_fin, 'HH24:MI'),
                'aula', h.aula,
                'pabellon', h.pabellon,
                'tipo_sesion', h.tipo_sesion
            ) ORDER BY h.hora_inicio ASC
        ), '[]'::jsonb)
    ) INTO v_resultado
    FROM public.perfiles p
    JOIN public.estudiantes e ON e.perfil_id = p.id
    JOIN public.matriculas m ON m.estudiante_id = e.id AND m.estado = 'EN_CURSO'
    JOIN public.secciones s ON s.id = m.seccion_id
    JOIN public.cursos c ON c.id = s.curso_id
    JOIN public.horarios h ON h.seccion_id = s.id
    WHERE p.user_id = v_user_id
      AND h.dia_semana = v_dia;

    RETURN v_resultado;
END;
$$;

-- ----------------------------------------------------------------------------
-- 2. RPC: obtener_perfil_academico
-- Pregunta del Chatbot: "¿Cuál es mi código de estudiante o estado académico?"
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.obtener_perfil_academico()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_resultado JSONB;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado en Supabase';
    END IF;

    SELECT jsonb_build_object(
        'nombre_completo', p.nombre_completo,
        'email', p.email,
        'codigo_estudiante', e.codigo_estudiante,
        'carrera', car.nombre,
        'facultad', car.facultad,
        'semestre_actual', e.semestre_actual,
        'estado_academico', e.estado,
        'promedio_ponderado', e.promedio_ponderado,
        'creditos_aprobados', e.creditos_aprobados,
        'creditos_totales_carrera', car.creditos_totales,
        'avance_porcentaje', ROUND((e.creditos_aprobados::numeric / car.creditos_totales::numeric) * 100, 2)
    ) INTO v_resultado
    FROM public.perfiles p
    JOIN public.estudiantes e ON e.perfil_id = p.id
    JOIN public.carreras car ON car.id = e.carrera_id
    WHERE p.user_id = v_user_id;

    RETURN v_resultado;
END;
$$;

-- ----------------------------------------------------------------------------
-- 3. RPC: obtener_cursos_matriculados
-- Pregunta del Chatbot: "¿Qué cursos y secciones tengo matriculados este ciclo?"
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.obtener_cursos_matriculados(
    p_periodo_codigo TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_resultado JSONB;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado en Supabase';
    END IF;

    SELECT jsonb_build_object(
        'periodo', COALESCE(p_periodo_codigo, per.codigo),
        'total_asignaturas', COUNT(m.id),
        'cursos', COALESCE(jsonb_agg(
            jsonb_build_object(
                'matricula_id', m.id,
                'codigo_curso', c.codigo,
                'nombre_curso', c.nombre,
                'creditos', c.creditos,
                'seccion', s.codigo_seccion,
                'docente', s.docente_nombre,
                'docente_email', s.docente_email,
                'aula', s.aula_default,
                'estado_matricula', m.estado,
                'nota_parcial', m.nota_parcial,
                'asistencias_porcentaje', m.asistencias_porcentaje
            ) ORDER BY c.codigo ASC
        ), '[]'::jsonb)
    ) INTO v_resultado
    FROM public.perfiles p
    JOIN public.estudiantes e ON e.perfil_id = p.id
    JOIN public.matriculas m ON m.estudiante_id = e.id
    JOIN public.periodos_academicos per ON per.id = m.periodo_id
    JOIN public.secciones s ON s.id = m.seccion_id
    JOIN public.cursos c ON c.id = s.curso_id
    WHERE p.user_id = v_user_id
      AND (p_periodo_codigo IS NULL AND per.es_activo = true OR per.codigo = p_periodo_codigo)
    GROUP BY per.codigo;

    RETURN v_resultado;
END;
$$;

-- ----------------------------------------------------------------------------
-- 4. RPC: obtener_semaforo_curricular
-- Permite al estudiante y al chatbot ver materias aprobadas, en curso y pendientes
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.obtener_semaforo_curricular()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_resultado JSONB;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado';
    END IF;

    WITH estudiante_datos AS (
        SELECT e.id AS est_id, e.carrera_id, e.creditos_aprobados
        FROM public.perfiles p
        JOIN public.estudiantes e ON e.perfil_id = p.id
        WHERE p.user_id = v_user_id
    ),
    cursos_carrera AS (
        SELECT c.*
        FROM public.cursos c
        JOIN estudiante_datos ed ON ed.carrera_id = c.carrera_id
    ),
    cursos_aprobados AS (
        SELECT ha.curso_id, ha.nota_final
        FROM public.historial_academico ha
        JOIN estudiante_datos ed ON ed.est_id = ha.estudiante_id
        WHERE ha.estado = 'APROBADO'
    ),
    cursos_en_curso AS (
        SELECT s.curso_id, m.nota_parcial
        FROM public.matriculas m
        JOIN estudiante_datos ed ON ed.est_id = m.estudiante_id
        JOIN public.secciones s ON s.id = m.seccion_id
        WHERE m.estado = 'EN_CURSO'
    )
    SELECT jsonb_build_object(
        'creditos_aprobados', ed.creditos_aprobados,
        'cursos', jsonb_agg(
            jsonb_build_object(
                'codigo', cc.codigo,
                'nombre', cc.nombre,
                'ciclo', cc.ciclo,
                'creditos', cc.creditos,
                'estado_semaforo', CASE
                    WHEN ca.curso_id IS NOT NULL THEN 'APROBADO'
                    WHEN cec.curso_id IS NOT NULL THEN 'EN_CURSO'
                    ELSE 'PENDIENTE'
                END,
                'nota', COALESCE(ca.nota_final, cec.nota_parcial, NULL)
            ) ORDER BY cc.ciclo, cc.codigo
        )
    ) INTO v_resultado
    FROM estudiante_datos ed
    JOIN cursos_carrera cc ON true
    LEFT JOIN cursos_aprobados ca ON ca.curso_id = cc.id
    LEFT JOIN cursos_en_curso cec ON cec.curso_id = cc.id
    GROUP BY ed.creditos_aprobados;

    RETURN v_resultado;
END;
$$;
`;

export const ROADMAP_DATA = [
  {
    fase: 'Sprint 1',
    titulo: 'Infraestructura Supabase & Esquema PostgreSQL',
    duracion: '1 Semana',
    descripcion: 'Despliegue del DDL, relaciones, tablas maestras y catálogos institucionales.',
    entregables: [
      'Ejecución del script SQL en Supabase Studio (Extensiones, enums, 10 tablas).',
      'Configuración de Foreign Keys, índices B-Tree y restricciones Check.',
      'Carga de datos semilla (Semestre 2026-I, carreras, asignaturas, secciones).',
      'Configuración de variables de entorno SUPABASE_URL y SUPABASE_ANON_KEY.'
    ],
    estado: 'Completado'
  },
  {
    fase: 'Sprint 2',
    titulo: 'Seguridad Hardened: Row Level Security (RLS) & Auth',
    duracion: '1 Semana',
    descripcion: 'Aislamiento estricto de privacidad entre estudiantes y control de acceso basado en roles.',
    entregables: [
      'Habilitación de RLS en todas las tablas con políticas auth.uid().',
      'Función de seguridad es_administrador() para bypass administrativo.',
      'Trigger automático handle_new_user() en public.perfiles tras registro en auth.users.',
      'Pruebas de penetración simuladas verificando que el Estudiante A no acceda a datos del Estudiante B.'
    ],
    estado: 'Completado'
  },
  {
    fase: 'Sprint 3',
    titulo: 'Funciones RPC & Tool Calling para el Chatbot de IA',
    duracion: '1 Semana',
    descripcion: 'Construcción de las vías seguras de consulta directa en PostgreSQL y su esquema JSON Schema.',
    entregables: [
      'Creación de funciones PL/pgSQL: obtener_horario_estudiante_hoy, obtener_perfil_academico, obtener_cursos_matriculados, obtener_semaforo_curricular.',
      'Definición de Tools con Function Calling compatible con OpenAI / Gemini SDK.',
      'Validación de inyección de prompts: el LLM jamás recibe credenciales SQL directas ni ejecuta SELECT/INSERT en texto plano.',
      'Middleware en backend o edge function para validar auth token JWT antes de invocar la RPC.'
    ],
    estado: 'Completado'
  },
  {
    fase: 'Sprint 4',
    titulo: 'Frontend Base (Wireframe a.jpg) & Integración del Chatbot',
    duracion: '1 Semana',
    descripcion: 'Desarrollo de la interfaz de usuario en azul claro y conexión en tiempo real con Supabase.',
    entregables: [
      'Diseño fiel al wireframe: Cabecera con logo y nombre, badge de sesión, saludo con código 25-26....',
      'Menú lateral azul claro con los 9 módulos (Información, Matrículas, Horarios, etc.).',
      'Cuadrícula central 2x2: Cursos matriculados, Material, Eventos y Semáforo.',
      'Widget interactivo del Asistente Académico con feedback en tiempo real de llamadas RPC.',
      'Footer institucional integral y selector de perfil para validación de roles.'
    ],
    estado: 'En Producción'
  }
];
