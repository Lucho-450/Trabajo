import React, { useState } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  UserPlus,
  Building2,
  Sparkles,
} from 'lucide-react';
import { AcademicStore } from '../data/academicStore';
import { Perfil, Estudiante } from '../types/academic';

interface AuthLoginPortalProps {
  onLoginExitoso: (perfil: Perfil, estudiante?: Estudiante) => void;
}

export const AuthLoginPortal: React.FC<AuthLoginPortalProps> = ({ onLoginExitoso }) => {
  // Pestaña principal de rol: 'estudiante' | 'administrador'
  const [rolSeleccionado, setRolSeleccionado] = useState<'estudiante' | 'administrador'>('estudiante');

  // Sub-modo para estudiantes: 'login' | 'registro'
  const [modoEstudiante, setModoEstudiante] = useState<'login' | 'registro'>('login');

  // Estados de formulario de Login
  const [emailLogin, setEmailLogin] = useState('');
  const [passwordLogin, setPasswordLogin] = useState('');
  const [mostrarPasswordLogin, setMostrarPasswordLogin] = useState(false);

  // Estados de formulario de Registro de Estudiante
  const [regNombre, setRegNombre] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDni, setRegDni] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [regCarrera, setRegCarrera] = useState('car_01');
  const [mostrarRegPassword, setMostrarRegPassword] = useState(false);

  // Mensajes de error o éxito
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
  const [exitoMensaje, setExitoMensaje] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  // Manejar Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMensaje(null);
    setExitoMensaje(null);
    setCargando(true);

    setTimeout(() => {
      const res = AcademicStore.autenticarUsuario({
        email: emailLogin,
        password: passwordLogin,
        rolEsperado: rolSeleccionado,
      });

      setCargando(false);

      if (res.exito && res.perfil) {
        setExitoMensaje(res.mensaje);
        setTimeout(() => {
          onLoginExitoso(res.perfil!, res.estudiante);
        }, 400);
      } else {
        setErrorMensaje(res.mensaje);
      }
    }, 300);
  };

  // Manejar Registro de Estudiante
  const handleRegistroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMensaje(null);
    setExitoMensaje(null);

    if (regPassword !== regPasswordConfirm) {
      setErrorMensaje('Las contraseñas ingresadas no coinciden. Por favor verifícalas.');
      return;
    }

    if (regPassword.length < 4) {
      setErrorMensaje('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    setCargando(true);

    setTimeout(() => {
      const res = AcademicStore.registrarCuentaEstudiante({
        nombre_completo: regNombre,
        email: regEmail,
        password: regPassword,
        documento_identidad: regDni,
        carrera_id: regCarrera,
      });

      setCargando(false);

      if (res.exito && res.perfil) {
        setExitoMensaje(res.mensaje);
        setTimeout(() => {
          onLoginExitoso(res.perfil!, res.estudiante);
        }, 500);
      } else {
        setErrorMensaje(res.mensaje);
      }
    }, 400);
  };

  // Autocompletar cuentas de prueba
  const aplicarCuentaEjemplo = (email: string, pass: string, rol: 'estudiante' | 'administrador') => {
    setRolSeleccionado(rol);
    setModoEstudiante('login');
    setEmailLogin(email);
    setPasswordLogin(pass);
    setErrorMensaje(null);
    setExitoMensaje(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-sky-50 to-blue-100 flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-sky-200">
      {/* Contenedor Central */}
      <div className="w-full max-w-xl">
        {/* Cabecera Institucional con Logo */}
        <div className="text-center mb-6 space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-600/30 border-2 border-white">
            <GraduationCap className="w-9 h-9" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-sky-800 bg-sky-200/70 border border-sky-300 px-3 py-1 rounded-full">
              Sistema Integrado de Gestión Académica 2026-I
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-sky-950 mt-2 tracking-tight">
              Universidad Nacional de Tecnología
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-1">
              Portal institucional para estudiantes, docentes y autoridades universitarias.
            </p>
          </div>
        </div>

        {/* Tarjeta Principal de Autenticación */}
        <div className="bg-white/95 backdrop-blur-md border-2 border-sky-200 rounded-3xl shadow-xl p-6 sm:p-8 space-y-6">
          {/* Selector de Rol: Estudiante vs Administrador */}
          <div>
            <label className="block text-[11px] font-bold text-sky-900 uppercase tracking-wider mb-2 text-center">
              Selecciona tu tipo de acceso institucional:
            </label>
            <div className="grid grid-cols-2 gap-2 bg-sky-100/70 p-1.5 rounded-2xl border border-sky-300">
              <button
                type="button"
                onClick={() => {
                  setRolSeleccionado('estudiante');
                  setErrorMensaje(null);
                }}
                className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                  rolSeleccionado === 'estudiante'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-sky-900 hover:bg-white/60'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Estudiante</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRolSeleccionado('administrador');
                  setErrorMensaje(null);
                }}
                className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                  rolSeleccionado === 'administrador'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-sky-900 hover:bg-white/60'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Administrador</span>
              </button>
            </div>
          </div>

          {/* Sub-pestañas para Estudiantes (Iniciar Sesión vs Registrarse) */}
          {rolSeleccionado === 'estudiante' && (
            <div className="flex items-center justify-center gap-4 border-b border-sky-100 pb-2">
              <button
                type="button"
                onClick={() => {
                  setModoEstudiante('login');
                  setErrorMensaje(null);
                }}
                className={`text-xs sm:text-sm font-bold pb-1.5 transition-all border-b-2 ${
                  modoEstudiante === 'login'
                    ? 'border-sky-600 text-sky-950 font-black'
                    : 'border-transparent text-slate-500 hover:text-sky-800'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setModoEstudiante('registro');
                  setErrorMensaje(null);
                }}
                className={`text-xs sm:text-sm font-bold pb-1.5 transition-all border-b-2 flex items-center gap-1.5 ${
                  modoEstudiante === 'registro'
                    ? 'border-sky-600 text-sky-950 font-black'
                    : 'border-transparent text-slate-500 hover:text-sky-800'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5 text-sky-600" />
                <span>Registrar Nueva Cuenta</span>
              </button>
            </div>
          )}

          {/* Alertas de Error o Éxito */}
          {errorMensaje && (
            <div className="bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs font-bold p-3 rounded-2xl flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMensaje}</span>
            </div>
          )}

          {exitoMensaje && (
            <div className="bg-emerald-50 border-2 border-emerald-300 text-emerald-950 text-xs font-bold p-3 rounded-2xl flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{exitoMensaje}</span>
            </div>
          )}

          {/* ============================================================== */}
          {/* CASO 1: LOGIN DE ESTUDIANTE O ADMINISTRADOR                    */}
          {/* ============================================================== */}
          {(rolSeleccionado === 'administrador' || modoEstudiante === 'login') && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-sky-950">
                  Correo Electrónico {rolSeleccionado === 'administrador' ? 'Institucional' : ''}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-sky-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder={
                      rolSeleccionado === 'administrador'
                        ? 'luisfllosar@gmail.com'
                        : 'ej: juan.perez@unt.edu.pe'
                    }
                    value={emailLogin}
                    onChange={(e) => setEmailLogin(e.target.value)}
                    className="w-full bg-sky-50/70 border-2 border-sky-300 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-sky-950 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-sky-950">Contraseña</label>
                  <span className="text-[11px] text-slate-500">
                    {rolSeleccionado === 'administrador' ? 'Clave de acceso seguro' : 'Mínimo 4 caracteres'}
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-sky-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={mostrarPasswordLogin ? 'text' : 'password'}
                    required
                    placeholder={rolSeleccionado === 'administrador' ? 'boris450' : 'Tu contraseña'}
                    value={passwordLogin}
                    onChange={(e) => setPasswordLogin(e.target.value)}
                    className="w-full bg-sky-50/70 border-2 border-sky-300 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-sky-950 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPasswordLogin(!mostrarPasswordLogin)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-700"
                  >
                    {mostrarPasswordLogin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                <span>{cargando ? 'Verificando credenciales...' : 'Ingresar al Portal'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}

          {/* ============================================================== */}
          {/* CASO 2: REGISTRO DE NUEVA CUENTA DE ESTUDIANTE                 */}
          {/* ============================================================== */}
          {rolSeleccionado === 'estudiante' && modoEstudiante === 'registro' && (
            <form onSubmit={handleRegistroSubmit} className="space-y-3.5 animate-in fade-in">
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3 text-[11px] text-sky-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  Condiciones para nuevos estudiantes:
                </p>
                <p className="text-slate-600">
                  Todo nuevo alumno inicia formalmente en <strong>1° Semestre</strong> con una capacidad base de <strong>22 créditos</strong> y 0 cursos iniciales para que elijas tus asignaturas en el catálogo.
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-sky-950">Nombre Completo</label>
                <div className="relative">
                  <User className="w-4 h-4 text-sky-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Ej: David Alejandro Gómez Silva"
                    value={regNombre}
                    onChange={(e) => setRegNombre(e.target.value)}
                    className="w-full bg-sky-50/70 border-2 border-sky-300 rounded-xl pl-10 pr-3.5 py-2 text-xs sm:text-sm text-sky-950 focus:outline-none focus:border-sky-500 focus:bg-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-sky-950">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-sky-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="alumno@unt.edu.pe"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-sky-50/70 border-2 border-sky-300 rounded-xl pl-10 pr-3.5 py-2 text-xs sm:text-sm text-sky-950 focus:outline-none focus:border-sky-500 focus:bg-white font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-sky-950">Documento de Identidad (DNI)</label>
                  <input
                    type="text"
                    required
                    placeholder="8 dígitos (DNI)"
                    value={regDni}
                    onChange={(e) => setRegDni(e.target.value)}
                    className="w-full bg-sky-50/70 border-2 border-sky-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-sky-950 focus:outline-none focus:border-sky-500 focus:bg-white font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-sky-950">Carrera Profesional</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-sky-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={regCarrera}
                    onChange={(e) => setRegCarrera(e.target.value)}
                    className="w-full bg-sky-50/70 border-2 border-sky-300 rounded-xl pl-10 pr-3.5 py-2 text-xs sm:text-sm text-sky-950 font-bold focus:outline-none focus:border-sky-500 focus:bg-white"
                  >
                    <option value="car_01">Ingeniería de Sistemas e Informática (10 Semestres)</option>
                    <option value="car_02">Ingeniería Industrial (10 Semestres)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-sky-950">Contraseña</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-sky-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={mostrarRegPassword ? 'text' : 'password'}
                      required
                      placeholder="Crea una contraseña"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-sky-50/70 border-2 border-sky-300 rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm text-sky-950 focus:outline-none focus:border-sky-500 focus:bg-white font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarRegPassword(!mostrarRegPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-700"
                    >
                      {mostrarRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-sky-950">Confirmar Contraseña</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-sky-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={mostrarRegPassword ? 'text' : 'password'}
                      required
                      placeholder="Repite la contraseña"
                      value={regPasswordConfirm}
                      onChange={(e) => setRegPasswordConfirm(e.target.value)}
                      className="w-full bg-sky-50/70 border-2 border-sky-300 rounded-xl pl-10 pr-3.5 py-2 text-xs sm:text-sm text-sky-950 focus:outline-none focus:border-sky-500 focus:bg-white font-medium"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 group disabled:opacity-50 mt-2"
              >
                <span>{cargando ? 'Creando cuenta universitaria...' : 'Crear Cuenta e Ingresar al Sistema'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}

          {/* ============================================================== */}
          {/* CUENTAS DE ACCESO RÁPIDO Y EJEMPLOS OFICIALES                  */}
          {/* ============================================================== */}
          <div className="pt-4 border-t border-sky-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-900 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-sky-600" />
                {rolSeleccionado === 'administrador'
                  ? 'Cuentas de Administrador Pre-creadas:'
                  : 'Cuentas de Estudiantes Registrados:'}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">Clic para autocompletar</span>
            </div>

            {rolSeleccionado === 'administrador' ? (
              <div className="space-y-2">
                {/* Cuenta oficial de Administrador solicitada por el usuario */}
                <button
                  type="button"
                  onClick={() => aplicarCuentaEjemplo('luisfllosar@gmail.com', 'boris450', 'administrador')}
                  className="w-full text-left p-3 rounded-2xl bg-amber-50/90 border-2 border-amber-300 hover:border-amber-500 transition shadow-xs flex items-center justify-between group"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-amber-950">Ing. Luis Flores</span>
                      <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                        Administrador General
                      </span>
                    </div>
                    <p className="text-xs font-mono font-bold text-amber-900">luisfllosar@gmail.com</p>
                    <p className="text-[10px] text-slate-600">Contraseña: <strong className="font-mono text-slate-900">boris450</strong></p>
                  </div>
                  <span className="text-xs font-bold text-amber-800 bg-white border border-amber-300 px-2.5 py-1 rounded-lg shadow-2xs group-hover:bg-amber-600 group-hover:text-white transition">
                    Usar Cuenta
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => aplicarCuentaEjemplo('admin.academico@unt.edu.pe', 'admin123', 'administrador')}
                  className="w-full text-left p-2.5 rounded-xl bg-sky-50 border border-sky-200 hover:border-sky-400 transition flex items-center justify-between group"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-sky-950">Dra. Carmen Rosa Benavides</p>
                    <p className="text-[11px] font-mono text-sky-800">admin.academico@unt.edu.pe • Clave: admin123</p>
                  </div>
                  <span className="text-[11px] font-semibold text-sky-700 group-hover:underline">
                    Usar
                  </span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => aplicarCuentaEjemplo('juan.perez@unt.edu.pe', 'estudiante123', 'estudiante')}
                  className="text-left p-2.5 rounded-xl bg-sky-50 border border-sky-200 hover:border-sky-400 transition flex items-center justify-between group"
                >
                  <div>
                    <p className="text-xs font-bold text-sky-950">Juan Carlos Pérez</p>
                    <p className="text-[10px] font-mono text-slate-600">juan.perez@unt.edu.pe</p>
                    <p className="text-[10px] text-sky-800">Clave: <strong>estudiante123</strong></p>
                  </div>
                  <span className="text-[11px] font-semibold text-sky-700 group-hover:underline">
                    Usar
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => aplicarCuentaEjemplo('maria.torres@unt.edu.pe', 'estudiante123', 'estudiante')}
                  className="text-left p-2.5 rounded-xl bg-sky-50 border border-sky-200 hover:border-sky-400 transition flex items-center justify-between group"
                >
                  <div>
                    <p className="text-xs font-bold text-sky-950">María Elena Torres</p>
                    <p className="text-[10px] font-mono text-slate-600">maria.torres@unt.edu.pe</p>
                    <p className="text-[10px] text-sky-800">Clave: <strong>estudiante123</strong></p>
                  </div>
                  <span className="text-[11px] font-semibold text-sky-700 group-hover:underline">
                    Usar
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Institucional del Login */}
        <p className="text-center text-xs text-slate-500 mt-6">
          © 2026 Universidad Nacional de Tecnología • Sistema Seguro de Autenticación y Matrícula
        </p>
      </div>
    </div>
  );
};
