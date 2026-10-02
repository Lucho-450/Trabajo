import React, { useState, useEffect } from 'react';
import { PERFILES_DB, ESTUDIANTES_DB } from './data/mockSupabaseDb';
import { AcademicStore } from './data/academicStore';
import { StudentHeader } from './components/StudentHeader';
import { StudentSidebar, ModuloId } from './components/StudentSidebar';
import { StudentDashboardCards } from './components/StudentDashboardCards';
import { StudentFooter } from './components/StudentFooter';
import { AcademicChatbotModal } from './components/AcademicChatbotModal';
import { ModuleModals, VistaModal } from './components/ModuleModals';
import { AuthLoginPortal } from './components/AuthLoginPortal';
import { Bot } from 'lucide-react';

export default function App() {
  // Estado de autenticación del usuario (requiere inicio de sesión antes de entrar)
  const [usuarioAutenticado, setUsuarioAutenticado] = useState<boolean>(() => {
    return Boolean(AcademicStore.obtenerSesionGuardada());
  });

  // Estado de usuario del estudiante o administrador activo
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return AcademicStore.obtenerSesionGuardada() || 'usr_est_01';
  });

  const [, setTick] = useState(0);

  useEffect(() => {
    return AcademicStore.suscribir(() => {
      setTick((t) => t + 1);
    });
  }, []);

  // Módulo seleccionado en el menú o tarjetas
  const [moduloActivo, setModuloActivo] = useState<ModuloId>('informacion');
  const [modalAbierto, setModalAbierto] = useState<VistaModal | null>(null);

  // Estado del Asistente Virtual Académico
  const [chatAbierto, setChatAbierto] = useState(false);

  // Obtener perfil y estudiante correspondiente al ID activo
  const perfilActivo =
    AcademicStore.obtenerPerfil(currentUserId) ||
    PERFILES_DB.find((p) => p.user_id === currentUserId) ||
    PERFILES_DB[0];

  const estudianteActivo =
    AcademicStore.obtenerEstudiantePorUserId(currentUserId) ||
    ESTUDIANTES_DB.find((e) => e.perfil_id === perfilActivo.id);

  const cambiarUsuario = (userId: string) => {
    setCurrentUserId(userId);
    AcademicStore.guardarSesionActiva(userId);
  };

  const handleCerrarSesion = () => {
    AcademicStore.cerrarSesion();
    setUsuarioAutenticado(false);
    setModalAbierto(null);
    setChatAbierto(false);
  };

  const handleLoginExitoso = (perfil: any) => {
    setCurrentUserId(perfil.user_id);
    AcademicStore.guardarSesionActiva(perfil.user_id);
    setUsuarioAutenticado(true);
  };

  const abrirModulo = (modulo: ModuloId) => {
    setModuloActivo(modulo);
    setModalAbierto(modulo);
  };

  const abrirConsultaChat = () => {
    setChatAbierto(true);
  };

  // 0. Si el usuario NO ha iniciado sesión, mostrar la pantalla de Login / Registro
  if (!usuarioAutenticado) {
    return <AuthLoginPortal onLoginExitoso={handleLoginExitoso} />;
  }

  return (
    <div className="min-h-screen bg-sky-50/40 text-slate-800 flex flex-col font-sans selection:bg-sky-200 selection:text-sky-900">
      {/* 1. HEADER (Fiel al Wireframe a.jpg: Logo, Nombre Universidad, Tipo de sesión: estudiante, Bienvenida con código) */}
      <StudentHeader
        perfil={perfilActivo}
        estudiante={estudianteActivo}
        rolActual={perfilActivo.rol}
        onCambiarUsuario={cambiarUsuario}
        onAbrirChat={() => setChatAbierto(true)}
        onCerrarSesion={handleCerrarSesion}
      />

      {/* 2. CONTENIDO PRINCIPAL: PORTAL DEL ESTUDIANTE (Wireframe a.jpg) */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row items-start gap-6 lg:gap-8">
            {/* SIDEBAR IZQUIERDA (Los 9 botones exactos de wireframe a.jpg en Azul Claro) */}
            <StudentSidebar
              moduloActivo={moduloActivo}
              onSeleccionarModulo={abrirModulo}
              onAbrirChatbot={() => setChatAbierto(true)}
            />

            {/* ÁREA CENTRAL (Las 4 tarjetas principales en cuadrícula 2x2 de wireframe a.jpg) */}
            <StudentDashboardCards
              estudiante={estudianteActivo}
              onAbrirCursos={() => setModalAbierto('matriculas')}
              onAbrirMaterial={() => setModalAbierto('material_cursos')}
              onAbrirEventos={() => setModalAbierto('eventos')}
              onAbrirSemaforo={() => setModalAbierto('semaforo')}
              onConsultarChat={abrirConsultaChat}
            />
          </div>
        </div>
      </main>

      {/* 3. FOOTER (Contenedor redondeado inferior con datos de contacto, enlaces y derechos según wireframe a.jpg) */}
      <StudentFooter />

      {/* 4. MODALES INTERACTIVOS PARA CADA UNO DE LOS 9 MÓDULOS Y 4 TARJETAS */}
      <ModuleModals
        vistaModal={modalAbierto}
        onCerrar={() => setModalAbierto(null)}
        perfil={perfilActivo}
        estudiante={estudianteActivo}
      />

      {/* 5. MODAL DEL ASISTENTE VIRTUAL ACADÉMICO */}
      <AcademicChatbotModal
        isOpen={chatAbierto}
        onClose={() => setChatAbierto(false)}
        perfil={perfilActivo}
        estudiante={estudianteActivo}
      />

      {/* Botón Flotante Permanente del Asistente Académico (Esquina Inferior Derecha) */}
      {!chatAbierto && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setChatAbierto(true)}
            className="group relative bg-gradient-to-r from-sky-600 via-sky-700 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white p-3.5 sm:px-4 sm:py-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center gap-2.5 border-2 border-white/60 hover:scale-105"
            title="Abrir Asistente Académico"
          >
            <div className="relative">
              <Bot className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-sky-700 animate-pulse"></span>
            </div>
            <div className="text-left hidden sm:block">
              <span className="block text-xs font-bold leading-tight">Asistente Virtual</span>
              <span className="block text-[10px] text-sky-200">Consultas en línea</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
