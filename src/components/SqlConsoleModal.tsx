import React, { useState } from 'react';
import {
  Terminal,
  Play,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Database,
  Lock,
  Zap,
} from 'lucide-react';
import { AcademicRpcService, RpcExecutionResult } from '../services/academicRpc';

interface SqlConsoleModalProps {
  currentUserId: string;
}

export const SqlConsoleModal: React.FC<SqlConsoleModalProps> = ({ currentUserId }) => {
  const [querySeleccionada, setQuerySeleccionada] = useState<string>('horario_hoy');
  const [diaSemana, setDiaSemana] = useState<number>(3); // Miercoles
  const [ejecutando, setEjecutando] = useState(false);
  const [resultado, setResultado] = useState<RpcExecutionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const ejecutarRpc = async () => {
    setEjecutando(true);
    setErrorMsg(null);
    setResultado(null);

    try {
      let res: RpcExecutionResult;

      if (querySeleccionada === 'horario_hoy') {
        res = await AcademicRpcService.obtenerHorarioEstudianteHoy(currentUserId, diaSemana);
      } else if (querySeleccionada === 'perfil') {
        res = await AcademicRpcService.obtenerPerfilAcademico(currentUserId);
      } else if (querySeleccionada === 'cursos') {
        res = await AcademicRpcService.obtenerCursosMatriculados(currentUserId, '2026-I');
      } else if (querySeleccionada === 'semaforo') {
        res = await AcademicRpcService.obtenerSemaforoCurricular(currentUserId);
      } else {
        // Intento de violación de RLS simulado con usuario no existente
        res = await AcademicRpcService.obtenerPerfilAcademico('usr_hacker_anonimo');
      }

      setResultado(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al ejecutar la función RPC');
    } finally {
      setEjecutando(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="bg-white border-2 border-sky-300 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-sky-200">
          <div>
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-sky-600" />
              <h3 className="text-lg font-bold text-sky-950">
                Consola Interactiva de Funciones RPC en Supabase PostgreSQL
              </h3>
            </div>
            <p className="text-xs text-sky-800 mt-1">
              Prueba en vivo las funciones almacenadas que consume el Asistente de IA con aislamiento estricto por <code className="bg-sky-100 text-sky-900 px-1 py-0.5 rounded font-mono text-[10px]">auth.uid() = '{currentUserId}'</code>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-emerald-600" /> PostgreSQL Engine Activo
            </span>
          </div>
        </div>

        {/* Panel de Configuración de la Consulta */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-sky-900 uppercase tracking-wider">
              Seleccionar Función RPC:
            </label>
            <select
              value={querySeleccionada}
              onChange={(e) => setQuerySeleccionada(e.target.value)}
              className="w-full bg-sky-50 border-2 border-sky-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500"
            >
              <option value="horario_hoy">public.obtener_horario_estudiante_hoy()</option>
              <option value="perfil">public.obtener_perfil_academico()</option>
              <option value="cursos">public.obtener_cursos_matriculados()</option>
              <option value="semaforo">public.obtener_semaforo_curricular()</option>
              <option value="rls_violacion">Simular Violación de RLS (Usuario no auth)</option>
            </select>
          </div>

          {querySeleccionada === 'horario_hoy' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-sky-900 uppercase tracking-wider">
                Parámetro p_dia_semana:
              </label>
              <select
                value={diaSemana}
                onChange={(e) => setDiaSemana(Number(e.target.value))}
                className="w-full bg-sky-50 border-2 border-sky-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500"
              >
                <option value={1}>1: Lunes</option>
                <option value={2}>2: Martes</option>
                <option value={3}>3: Miércoles</option>
                <option value={4}>4: Jueves</option>
                <option value={5}>5: Viernes</option>
                <option value={6}>6: Sábado</option>
              </select>
            </div>
          )}

          <div className="flex items-end">
            <button
              onClick={ejecutarRpc}
              disabled={ejecutando}
              className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{ejecutando ? 'Ejecutando en Supabase...' : 'Ejecutar Función RPC'}</span>
            </button>
          </div>
        </div>

        {/* Salida de la Consola */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Terminal Output (JSON Payload & RLS Audit):</span>
            {resultado && (
              <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                HTTP 200 OK • Latencia: {resultado.latencyMs}ms
              </span>
            )}
          </div>

          <div className="bg-slate-950 text-slate-100 rounded-2xl p-4 font-mono text-xs overflow-x-auto min-h-[220px] max-h-[400px] shadow-inner border border-slate-800 space-y-2">
            {errorMsg ? (
              <div className="text-rose-400 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> [SECURITY ALERT - RLS PREVENTED ACCESS]
                </p>
                <p className="text-slate-300">{errorMsg}</p>
                <p className="text-slate-500 text-[10px] mt-2">
                  La política de PostgreSQL bloqueó la lectura porque auth.uid() no coincide con el perfil solicitado.
                </p>
              </div>
            ) : resultado ? (
              <div>
                <p className="text-emerald-400 font-bold mb-1">// SQL Ejecutado en PostgreSQL:</p>
                <p className="text-sky-300 mb-3">{resultado.sqlSnippet}</p>
                <p className="text-emerald-400 font-bold mb-1">// JSON Retornado por la función:</p>
                <pre className="text-slate-300">{JSON.stringify(resultado.data, null, 2)}</pre>
              </div>
            ) : (
              <p className="text-slate-500 italic">
                Presiona "Ejecutar Función RPC" para enviar la petición a Supabase PostgreSQL y verificar la respuesta y las políticas RLS.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
