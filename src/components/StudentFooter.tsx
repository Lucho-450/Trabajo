import React from 'react';
import { Mail, Phone, MapPin, Globe, Shield, ExternalLink, Heart } from 'lucide-react';

export const StudentFooter: React.FC = () => {
  return (
    <footer className="mt-8 max-w-7xl mx-auto px-4 sm:px-6 pb-8">
      {/* Contenedor grande redondeado azul claro (Fiel al wireframe a.jpg) */}
      <div className="bg-gradient-to-b from-sky-50 via-sky-100/60 to-sky-100/90 border-2 border-sky-300 rounded-3xl p-6 sm:p-8 shadow-xs text-sky-950">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8 pb-6 border-b border-sky-200/80">
          {/* Col 1: Universidad e Identidad */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm uppercase tracking-wider text-sky-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
              UNTI Campus Central
            </h4>
            <p className="text-xs text-sky-800 leading-relaxed">
              Universidad Nacional de Tecnología e Innovación. Plataforma académica nativa en la nube respaldada por arquitectura Supabase PostgreSQL.
            </p>
            <div className="text-[11px] text-sky-700 space-y-1">
              <p className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                Av. Universitaria 4500, Pabellón Tecnológico
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                Central Telefónica: (01) 489-0000 Anexo 204
              </p>
              <p className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                soporte.academico@unt.edu.pe
              </p>
            </div>
          </div>

          {/* Col 2: Enlaces de Navegación Rápida */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-sm uppercase tracking-wider text-sky-900">
              Enlaces de Navegación
            </h4>
            <ul className="text-xs text-sky-800 space-y-1.5">
              <li>
                <a href="#matricula" className="hover:text-sky-600 hover:underline flex items-center gap-1">
                  • Calendario Académico 2026
                </a>
              </li>
              <li>
                <a href="#biblioteca" className="hover:text-sky-600 hover:underline flex items-center gap-1">
                  • Repositorio Institucional & Tesis
                </a>
              </li>
              <li>
                <a href="#mesa" className="hover:text-sky-600 hover:underline flex items-center gap-1">
                  • Mesa de Ayuda Virtual 24/7
                </a>
              </li>
              <li>
                <a href="#bienestar" className="hover:text-sky-600 hover:underline flex items-center gap-1">
                  • Bienestar Universitario & Salud
                </a>
              </li>
              <li>
                <a href="#becas" className="hover:text-sky-600 hover:underline flex items-center gap-1">
                  • Becas y Subvenciones de Investigación
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Información Legal y Normatividad */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-sm uppercase tracking-wider text-sky-900">
              Información Legal
            </h4>
            <ul className="text-xs text-sky-800 space-y-1.5">
              <li>
                <a href="#privacidad" className="hover:text-sky-600 hover:underline flex items-center gap-1">
                  • Política de Privacidad y RLS
                </a>
              </li>
              <li>
                <a href="#estatuto" className="hover:text-sky-600 hover:underline flex items-center gap-1">
                  • Reglamento General del Estudiante
                </a>
              </li>
              <li>
                <a href="#etica" className="hover:text-sky-600 hover:underline flex items-center gap-1">
                  • Código de Integridad Académica
                </a>
              </li>
              <li>
                <a href="#transparencia" className="hover:text-sky-600 hover:underline flex items-center gap-1">
                  • Portal de Transparencia Estándar
                </a>
              </li>
              <li>
                <a href="#defensoria" className="hover:text-sky-600 hover:underline flex items-center gap-1">
                  • Defensoría Universitaria
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Redes Sociales y Estado de la Infraestructura */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm uppercase tracking-wider text-sky-900">
              Redes & Certificación
            </h4>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-white border border-sky-300 text-sky-700 flex items-center justify-center text-xs font-bold hover:bg-sky-50 transition cursor-pointer">
                FB
              </span>
              <span className="w-8 h-8 rounded-lg bg-white border border-sky-300 text-sky-700 flex items-center justify-center text-xs font-bold hover:bg-sky-50 transition cursor-pointer">
                IG
              </span>
              <span className="w-8 h-8 rounded-lg bg-white border border-sky-300 text-sky-700 flex items-center justify-center text-xs font-bold hover:bg-sky-50 transition cursor-pointer">
                LI
              </span>
              <span className="w-8 h-8 rounded-lg bg-white border border-sky-300 text-sky-700 flex items-center justify-center text-xs font-bold hover:bg-sky-50 transition cursor-pointer">
                YT
              </span>
            </div>
            <div className="p-2.5 bg-white/80 border border-sky-200 rounded-xl text-[11px] text-sky-800">
              <p className="font-bold text-sky-900 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                Seguridad Criptográfica Activa
              </p>
              <p className="text-[10px] text-sky-600 mt-0.5">
                Row Level Security activo en tablas sensibles.
              </p>
            </div>
          </div>
        </div>

        {/* Fila Inferior de Derechos de Autor (wireframe a.jpg) */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-sky-700 gap-2">
          <p>© {new Date().getFullYear()} Universidad Nacional de Tecnología e Innovación. Todos los derechos reservados.</p>
          <div className="flex items-center gap-3 text-[11px]">
            <span>Fase 1: Estructura Base, Supabase DB & Chatbot IA</span>
            <span>•</span>
            <span className="text-sky-900 font-semibold">v1.2.0-cloud</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
