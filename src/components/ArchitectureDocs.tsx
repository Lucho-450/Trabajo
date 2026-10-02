import React, { useState } from 'react';
import {
  Database,
  Shield,
  Bot,
  ListOrdered,
  Copy,
  Check,
  Code2,
  ExternalLink,
  ChevronRight,
  Server,
  Layers,
  Cpu,
  Lock,
} from 'lucide-react';
import {
  SCHEMA_SQL,
  RLS_SQL,
  RPC_FUNCTIONS_SQL,
  ROADMAP_DATA,
} from '../data/sqlScripts';

export const ArchitectureDocs: React.FC = () => {
  const [seccionActiva, setSeccionActiva] = useState<'esquema' | 'rls' | 'chatbot' | 'roadmap'>('esquema');
  const [copiado, setCopiado] = useState<string | null>(null);

  const copiarAlPortapapeles = (texto: string, clave: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(clave);
    setTimeout(() => setCopiado(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Banner Superior de Arquitectura */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-800 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 text-sky-100 border border-white/30 backdrop-blur-xs">
              Fase 1: Estructura Base, Supabase DB & Chatbot IA
            </span>
            <span className="text-xs text-sky-200">PostgreSQL + RLS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Documentación Técnica de Arquitectura Académica
          </h2>
          <p className="text-xs sm:text-sm text-sky-100 leading-relaxed">
            Diseño relacional escalable para 10 módulos universitarios con Supabase, aislamiento de datos estricto mediante Row Level Security (RLS) y Chatbot con Tool Calling conectado a funciones RPC.
          </p>
        </div>

        {/* Decorative Grid */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <Database className="w-80 h-80 -mr-16 text-white" />
        </div>
      </div>

      {/* Selector de Pestañas de las 4 Secciones Solicitadas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-sky-100/70 p-1.5 rounded-2xl border border-sky-300">
        <button
          onClick={() => setSeccionActiva('esquema')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
            seccionActiva === 'esquema'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-white/80 text-sky-900 hover:bg-sky-200/70'
          }`}
        >
          <Database className="w-4 h-4 shrink-0" />
          <span>1. Esquema BD Supabase</span>
        </button>

        <button
          onClick={() => setSeccionActiva('rls')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
            seccionActiva === 'rls'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-white/80 text-sky-900 hover:bg-sky-200/70'
          }`}
        >
          <Shield className="w-4 h-4 shrink-0" />
          <span>2. Políticas RLS</span>
        </button>

        <button
          onClick={() => setSeccionActiva('chatbot')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
            seccionActiva === 'chatbot'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-white/80 text-sky-900 hover:bg-sky-200/70'
          }`}
        >
          <Bot className="w-4 h-4 shrink-0" />
          <span>3. Arquitectura Chatbot</span>
        </button>

        <button
          onClick={() => setSeccionActiva('roadmap')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
            seccionActiva === 'roadmap'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-white/80 text-sky-900 hover:bg-sky-200/70'
          }`}
        >
          <ListOrdered className="w-4 h-4 shrink-0" />
          <span>4. Roadmap Fase 1</span>
        </button>
      </div>

      {/* SECCIÓN 1: ESQUEMA BD EN SUPABASE (POSTGRESQL) */}
      {seccionActiva === 'esquema' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white border-2 border-sky-300 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-sky-200">
              <div>
                <h3 className="text-lg font-bold text-sky-950 flex items-center gap-2">
                  <Database className="w-5 h-5 text-sky-600" />
                  1. Esquema Relacional en Supabase (PostgreSQL DDL)
                </h3>
                <p className="text-xs text-sky-800 mt-0.5">
                  Incluye las 10 tablas centrales: <code className="bg-sky-100 text-sky-900 px-1 py-0.5 rounded text-[11px] font-mono">perfiles</code>, <code className="bg-sky-100 text-sky-900 px-1 py-0.5 rounded text-[11px] font-mono">estudiantes</code>, <code className="bg-sky-100 text-sky-900 px-1 py-0.5 rounded text-[11px] font-mono">carreras</code>, <code className="bg-sky-100 text-sky-900 px-1 py-0.5 rounded text-[11px] font-mono">cursos</code>, <code className="bg-sky-100 text-sky-900 px-1 py-0.5 rounded text-[11px] font-mono">secciones</code>, <code className="bg-sky-100 text-sky-900 px-1 py-0.5 rounded text-[11px] font-mono">horarios</code>, <code className="bg-sky-100 text-sky-900 px-1 py-0.5 rounded text-[11px] font-mono">matriculas</code>, <code className="bg-sky-100 text-sky-900 px-1 py-0.5 rounded text-[11px] font-mono">historial_academico</code>, <code className="bg-sky-100 text-sky-900 px-1 py-0.5 rounded text-[11px] font-mono">pagos</code> y <code className="bg-sky-100 text-sky-900 px-1 py-0.5 rounded text-[11px] font-mono">eventos_universitarios</code>.
                </p>
              </div>

              <button
                onClick={() => copiarAlPortapapeles(SCHEMA_SQL, 'schema')}
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shrink-0 shadow-xs"
              >
                {copiado === 'schema' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>¡SQL Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar DDL de Tablas</span>
                  </>
                )}
              </button>
            </div>

            {/* Diagrama de Relaciones Entidad-Relación */}
            <div className="bg-sky-50/60 border border-sky-200 rounded-2xl p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-900 mb-3">
                Mapa de Relaciones Centralizado:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-sky-200">
                  <p className="font-bold text-sky-950">auth.users (Supabase)</p>
                  <p className="text-[11px] text-slate-500 mt-1">1:1 con <strong>public.perfiles</strong> mediante <code>user_id</code>.</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-sky-200">
                  <p className="font-bold text-sky-950">perfiles ➔ estudiantes</p>
                  <p className="text-[11px] text-slate-500 mt-1">1:1 donde <code>perfil_id</code> contiene código único y carrera.</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-sky-200">
                  <p className="font-bold text-sky-950">matriculas ➔ secciones</p>
                  <p className="text-[11px] text-slate-500 mt-1">N:1 con <code>seccion_id</code>, que a su vez vincula <strong>horarios</strong> y <strong>cursos</strong>.</p>
                </div>
              </div>
            </div>

            {/* Código SQL DDL */}
            <div className="relative rounded-2xl bg-slate-900 text-slate-100 p-4 font-mono text-xs overflow-x-auto max-h-[480px] shadow-inner">
              <pre className="text-sky-300">{SCHEMA_SQL}</pre>
            </div>

            {/* RPC Stored Procedures SQL */}
            <div className="pt-4 border-t border-sky-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-sky-950">
                    Funciones Almacenadas (RPC) Especializadas para el Chatbot
                  </h4>
                  <p className="text-xs text-slate-600">
                    Procedimientos PL/pgSQL ejecutados vía <code className="bg-sky-100 text-sky-900 px-1 py-0.5 rounded font-mono text-[10px]">supabase.rpc(...)</code> con <code className="bg-sky-100 text-sky-900 px-1 py-0.5 rounded font-mono text-[10px]">SECURITY DEFINER</code>.
                  </p>
                </div>
                <button
                  onClick={() => copiarAlPortapapeles(RPC_FUNCTIONS_SQL, 'rpc')}
                  className="bg-sky-100 hover:bg-sky-200 text-sky-900 border border-sky-300 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                >
                  {copiado === 'rpc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copiar Funciones RPC</span>
                </button>
              </div>

              <div className="relative rounded-2xl bg-slate-900 text-slate-100 p-4 font-mono text-xs overflow-x-auto max-h-[380px] shadow-inner">
                <pre className="text-emerald-300">{RPC_FUNCTIONS_SQL}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN 2: POLÍTICAS DE SEGURIDAD (RLS) */}
      {seccionActiva === 'rls' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white border-2 border-sky-300 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-sky-200">
              <div>
                <h3 className="text-lg font-bold text-sky-950 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-sky-600" />
                  2. Políticas de Seguridad (Row Level Security - RLS)
                </h3>
                <p className="text-xs text-sky-800 mt-0.5">
                  Blindaje criptográfico a nivel de fila en PostgreSQL para que cada estudiante consulte exclusivamente su propia información.
                </p>
              </div>

              <button
                onClick={() => copiarAlPortapapeles(RLS_SQL, 'rls')}
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shrink-0 shadow-xs"
              >
                {copiado === 'rls' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>¡Políticas Copiadas!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Políticas RLS</span>
                  </>
                )}
              </button>
            </div>

            {/* Explicación de los 3 Principios de Seguridad */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4">
                <div className="w-8 h-8 rounded-lg bg-sky-200 text-sky-800 flex items-center justify-center font-bold text-sm mb-2">
                  1
                </div>
                <h4 className="font-bold text-xs text-sky-950">Aislamiento por auth.uid()</h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  PostgreSQL verifica internamente el token JWT de la sesión. Ninguna cláusula WHERE del frontend puede saltarse la regla de fila.
                </p>
              </div>

              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4">
                <div className="w-8 h-8 rounded-lg bg-sky-200 text-sky-800 flex items-center justify-center font-bold text-sm mb-2">
                  2
                </div>
                <h4 className="font-bold text-xs text-sky-950">Bypass para Administradores</h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Mediante la función segura <code>public.es_administrador()</code>, los directores pueden supervisar todas las matrículas sin duplicar tablas.
                </p>
              </div>

              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4">
                <div className="w-8 h-8 rounded-lg bg-sky-200 text-sky-800 flex items-center justify-center font-bold text-sm mb-2">
                  3
                </div>
                <h4 className="font-bold text-xs text-sky-950">Protección del Chatbot</h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Las funciones RPC validan explícitamente <code>auth.uid()</code>, impidiendo ataques de suplantación si el usuario intenta inyectar IDs ajenos.
                </p>
              </div>
            </div>

            {/* Código SQL de RLS */}
            <div className="relative rounded-2xl bg-slate-900 text-slate-100 p-4 font-mono text-xs overflow-x-auto max-h-[480px] shadow-inner">
              <pre className="text-amber-300">{RLS_SQL}</pre>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN 3: ARQUITECTURA DEL CHATBOT DE IA */}
      {seccionActiva === 'chatbot' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white border-2 border-sky-300 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="pb-4 border-b border-sky-200">
              <h3 className="text-lg font-bold text-sky-950 flex items-center gap-2">
                <Bot className="w-5 h-5 text-sky-600" />
                3. Arquitectura del Chatbot de IA Académico (Function Calling & Supabase RAG)
              </h3>
              <p className="text-xs text-sky-800 mt-0.5">
                Flujo seguro de invocación de herramientas sin acceso a SQL directo en texto plano.
              </p>
            </div>

            {/* Diagrama de Flujo en Markdown / Visual */}
            <div className="bg-slate-950 rounded-2xl p-5 text-sky-200 font-mono text-xs leading-relaxed overflow-x-auto shadow-inner border border-sky-900">
              <p className="text-emerald-400 font-bold mb-2">// DIAGRAMA DE COMUNICACIÓN: CLIENTE ➔ IA MODEL ➔ SUPABASE POSTGRESQL</p>
              <pre className="text-sky-300 whitespace-pre">
{`┌────────────────────────────────────────────────────────────────────────┐
│ 1. CLIENTE (Panel Estudiante / Frontend React en Azul Claro)           │
│    El alumno envía: "¿A qué hora tengo clase hoy?"                     │
│    + Header con Authorization: Bearer <JWT de Supabase Auth>           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (HTTPS POST /api/chat)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 2. BACKEND / ORQUESTADOR DE IA (Gemini / Function Calling)             │
│    - Extrae el token JWT y obtiene auth.uid() verificado.              │
│    - Provee al LLM las herramientas disponibles (Tools Declaration):   │
│      * obtener_horario_estudiante_hoy(p_dia_semana)                    │
│      * obtener_perfil_academico()                                      │
│      * obtener_cursos_matriculados(p_periodo_codigo)                   │
│      * obtener_semaforo_curricular()                                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼ El modelo evalúa la intención y emite:
┌────────────────────────────────────────────────────────────────────────┐
│ 3. LLM FUNCTION CALL (Tool Call Selection)                             │
│    tool: "obtener_horario_estudiante_hoy"                              │
│    args: { "p_dia_semana": 3 }                                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼ Ejecuta vía Supabase Client con sesión activa:
┌────────────────────────────────────────────────────────────────────────┐
│ 4. SUPABASE POSTGRESQL (RPC Stored Procedure + RLS Activo)             │
│    SELECT * FROM public.obtener_horario_estudiante_hoy(3);             │
│    • Filtra internamente WHERE perfiles.user_id = auth.uid()           │
│    • Devuelve JSON estructurado con aulas, horarios y docentes         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼ Retorna JSON (12ms de latencia)
┌────────────────────────────────────────────────────────────────────────┐
│ 5. SÍNTESIS FINAL EN LENGUAJE NATURAL                                  │
│    El LLM redacta la respuesta contextualizada, empática y con badges. │
│    "Hola Juan, hoy Miércoles tienes 2 clases: Base de Datos a las...   │
└────────────────────────────────────────────────────────────────────────┘`}
              </pre>
            </div>

            {/* Puntos Clave de la Arquitectura */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-sky-950 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-sky-600" />
                  Blindaje contra Prompt Injection
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  El modelo <strong>NUNCA</strong> tiene permisos para ejecutar sentencias <code>DROP TABLE</code>, <code>INSERT</code> arbitrarios ni escribir SQL en crudo. Solo puede invocar las funciones RPC predefinidas y fuertemente tipadas en la base de datos.
                </p>
              </div>

              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-sky-950 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-sky-600" />
                  Rendimiento y Tiempo Real
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Gracias a los índices B-Tree en <code className="bg-white px-1 rounded font-mono text-[10px]">idx_matriculas_estudiante</code> y <code className="bg-white px-1 rounded font-mono text-[10px]">idx_horarios_seccion</code>, las RPCs se resuelven en menos de 15ms en Supabase PostgreSQL.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN 4: ROADMAP DE IMPLEMENTACIÓN FASE 1 */}
      {seccionActiva === 'roadmap' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white border-2 border-sky-300 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="pb-4 border-b border-sky-200">
              <h3 className="text-lg font-bold text-sky-950 flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-sky-600" />
                4. Roadmap de Implementación (Fase 1: Base del Sistema)
              </h3>
              <p className="text-xs text-sky-800 mt-0.5">
                Secuencia paso a paso para desplegar y verificar la arquitectura sin abrumar con los 10 módulos de golpe.
              </p>
            </div>

            <div className="space-y-4">
              {ROADMAP_DATA.map((sprint, idx) => (
                <div
                  key={idx}
                  className="bg-sky-50/50 border border-sky-200 rounded-2xl p-5 hover:border-sky-400 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-xl bg-sky-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-sky-950">{sprint.titulo}</h4>
                        <span className="text-[11px] text-sky-700 font-medium">{sprint.fase} • {sprint.duracion}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full w-fit">
                      ✓ {sprint.estado}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">{sprint.descripcion}</p>

                  <div className="pt-2 border-t border-sky-100">
                    <p className="text-[10px] font-bold text-sky-900 uppercase tracking-wider mb-1.5">
                      Entregables Verificables:
                    </p>
                    <ul className="text-xs text-slate-700 space-y-1">
                      {sprint.entregables.map((ent, eIdx) => (
                        <li key={eIdx} className="flex items-start gap-2">
                          <span className="text-sky-600 font-bold">•</span>
                          <span>{ent}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
