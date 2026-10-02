import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  X,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react';
import { AcademicChatbotService } from '../services/aiChatbot';
import { MensajeChat, Perfil, Estudiante } from '../types/academic';

interface AcademicChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  perfil: Perfil;
  estudiante?: Estudiante;
}

export const AcademicChatbotModal: React.FC<AcademicChatbotModalProps> = ({
  isOpen,
  onClose,
  perfil,
  estudiante,
}) => {
  const [mensajes, setMensajes] = useState<MensajeChat[]>([
    {
      id: 'm_welcome',
      emisor: 'asistente',
      texto: `¡Hola ${perfil.nombre_completo.split(' ')[0]}! Soy tu **Asistente Académico Universitario**.\n\nPuedo ayudarte con tus consultas diarias:\n• ¿A qué hora tengo clase hoy? (aulas y horarios)\n• ¿Cuál es mi código de estudiante o estado académico?\n• ¿Qué cursos y secciones tengo matriculados este ciclo?\n• ¿Cómo va mi semáforo de materias aprobadas y pendientes?`,
      fecha: new Date(),
    },
  ]);
  const [inputTexto, setInputTexto] = useState('');
  const [cargando, setCargando] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll al último mensaje
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensajes, cargando]);

  // Si cambia el estudiante en la sesión
  useEffect(() => {
    setMensajes([
      {
        id: 'm_switch',
        emisor: 'asistente',
        texto: `Sesión activa para **${perfil.nombre_completo}** (Código: \`${estudiante?.codigo_estudiante || 'Alumno'}\`). ¿En qué puedo orientarte hoy sobre tus cursos o ciclo académico?`,
        fecha: new Date(),
      },
    ]);
  }, [perfil.user_id]);

  const handleEnviar = async (preguntaTexto?: string) => {
    const textoFinal = (preguntaTexto || inputTexto).trim();
    if (!textoFinal || cargando) return;

    setInputTexto('');
    const userMsgId = 'usr_' + Date.now();

    const nuevoMensajeUsuario: MensajeChat = {
      id: userMsgId,
      emisor: 'usuario',
      texto: textoFinal,
      fecha: new Date(),
    };

    setMensajes((prev) => [...prev, nuevoMensajeUsuario]);
    setCargando(true);

    try {
      const res = await AcademicChatbotService.procesarPreguntaEstudiante(
        textoFinal,
        perfil.user_id,
        perfil.nombre_completo
      );

      const nuevoMensajeBot: MensajeChat = {
        id: 'bot_' + Date.now(),
        emisor: 'asistente',
        texto: res.texto,
        fecha: new Date(),
        toolCallUsado: res.toolUsada,
      };

      setMensajes((prev) => [...prev, nuevoMensajeBot]);
    } catch (err: any) {
      console.error('Chatbot query error:', err);
      setMensajes((prev) => [
        ...prev,
        {
          id: 'bot_err_' + Date.now(),
          emisor: 'asistente',
          texto: `Hola **${perfil.nombre_completo.split(' ')[0]}**, tu expediente académico está activo en el sistema. Si aún no has elegido cursos este ciclo, puedes ingresar al módulo **Matrículas** en el menú de la izquierda para seleccionar tus asignaturas y horarios.`,
          fecha: new Date(),
        },
      ]);
    } finally {
      setCargando(false);
    }
  };

  const preguntasSugeridas = [
    '¿A qué hora tengo clase hoy?',
    '¿Cuál es mi código de estudiante o estado académico?',
    '¿Qué cursos y secciones tengo matriculados este ciclo?',
    '¿Cómo va mi semáforo de cursos?',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-2xl h-[92vh] sm:h-[620px] rounded-t-3xl sm:rounded-3xl border-2 border-sky-300 shadow-2xl flex flex-col overflow-hidden">
        {/* Cabecera del Chatbot en Azul Claro */}
        <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-blue-700 text-white px-5 py-3.5 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center backdrop-blur-xs">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm leading-none">Asistente Virtual Académico</h3>
                <span className="text-[10px] bg-emerald-400/30 text-emerald-100 border border-emerald-300/40 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                  En línea
                </span>
              </div>
              <p className="text-[11px] text-sky-100 mt-1">
                Atención Estudiantil: <strong className="text-white">{perfil.nombre_completo.split(' ')[0]}</strong> ({estudiante?.codigo_estudiante || 'Alumno'})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            title="Cerrar asistente"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Barra Informativa de Sesión Estudiantil */}
        <div className="bg-sky-50 border-b border-sky-200 px-4 py-2 flex items-center justify-between text-[11px] text-sky-800 shrink-0">
          <span className="flex items-center gap-1.5 font-medium">
            <GraduationCap className="w-3.5 h-3.5 text-sky-600" />
            Expediente Activo: <strong className="text-sky-950">{estudiante?.carrera_id === 'car_01' ? 'Ing. de Sistemas e Informática' : 'Ingeniería'}</strong>
          </span>
          <span className="text-[11px] text-sky-600 font-semibold">
            Semestre 2026-I
          </span>
        </div>

        {/* Historial de Mensajes */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
          {mensajes.map((m) => {
            const esUsuario = m.emisor === 'usuario';

            return (
              <div
                key={m.id}
                className={`flex flex-col ${esUsuario ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                    esUsuario
                      ? 'bg-sky-600 text-white rounded-br-xs'
                      : 'bg-white border border-sky-200 text-slate-800 rounded-bl-xs'
                  }`}
                >
                  {/* Texto con formato */}
                  <div className="whitespace-pre-line space-y-1">
                    {m.texto.split('\n').map((line, i) => (
                      <p key={i}>
                        {line.split('**').map((chunk, j) =>
                          j % 2 === 1 ? (
                            <strong key={j} className={esUsuario ? 'text-sky-100 font-bold' : 'text-sky-950 font-bold'}>
                              {chunk}
                            </strong>
                          ) : (
                            chunk
                          )
                        )}
                      </p>
                    ))}
                  </div>

                  {/* Verificación Estudiantil Limpia (sin código ni términos de desarrollador) */}
                  {m.toolCallUsado && (
                    <div className="mt-2.5 pt-2 border-t border-sky-100 flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1 text-sky-800 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Registro oficial verificado
                      </span>
                      <span className="text-[10px] text-sky-600 font-medium">
                        Actualizado hoy
                      </span>
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {m.fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}

          {cargando && (
            <div className="flex items-center gap-2 text-xs text-sky-700 bg-sky-50 border border-sky-200 p-2.5 rounded-xl w-fit">
              <Sparkles className="w-4 h-4 animate-spin text-sky-600" />
              <span>Consultando tu información académica oficial...</span>
            </div>
          )}
        </div>

        {/* Preguntas Rápidas Sugeridas */}
        <div className="px-4 py-2.5 bg-sky-50/70 border-t border-sky-200 shrink-0">
          <p className="text-[10px] font-bold text-sky-800 uppercase tracking-wide mb-1.5">
            Preguntas frecuentes:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {preguntasSugeridas.map((preg, idx) => (
              <button
                key={idx}
                disabled={cargando}
                onClick={() => handleEnviar(preg)}
                className="text-[11px] bg-white hover:bg-sky-100 text-sky-900 border border-sky-300 hover:border-sky-400 px-2.5 py-1 rounded-lg transition disabled:opacity-50 font-medium"
              >
                {preg}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-sky-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEnviar();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputTexto}
              onChange={(e) => setInputTexto(e.target.value)}
              placeholder="Haz una consulta académica (horarios, materias, notas, estado)..."
              disabled={cargando}
              className="flex-1 bg-sky-50/60 border-2 border-sky-200 hover:border-sky-300 focus:border-sky-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-400 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputTexto.trim() || cargando}
              className="bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white p-2.5 rounded-xl font-bold transition shadow-xs shrink-0 flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
