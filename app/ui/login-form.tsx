'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormState, useFormStatus } from 'react-dom';
import { authenticate, registerUser } from '@/app/lib/actions';
import {
  AtSymbolIcon,
  KeyIcon,
  UserIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  SparklesIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';

export default function LoginForm() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Estado del formulario de login (NextAuth authenticate)
  const [loginError, dispatchLogin] = useFormState(authenticate, undefined);

  // Estado del formulario de registro
  const [registerRole, setRegisterRole] = useState<'guest' | 'host'>('guest');
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRegisterError('');
    setIsRegistering(true);

    const formData = new FormData(e.currentTarget);
    formData.append('role', registerRole);

    const res = await registerUser(formData);
    setIsRegistering(false);

    if (res.error) {
      setRegisterError(res.error);
    } else if (res.success) {
      setRegisterSuccess(true);
      setTimeout(() => {
        setRegisterSuccess(false);
        setActiveTab('login');
      }, 2500);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      
      {/* Contenedor Principal Glassmorphic */}
      <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-900/10 space-y-6 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Pestañas Login / Registro */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/60 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`py-2.5 rounded-xl transition-all ${
              activeTab === 'login'
                ? 'bg-white text-slate-900 shadow-md shadow-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`py-2.5 rounded-xl transition-all ${
              activeTab === 'register'
                ? 'bg-white text-slate-900 shadow-md shadow-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* =================================================== */}
        {/* FORMULARIO DE INICIAR SESIÓN */}
        {/* =================================================== */}
        {activeTab === 'login' && (
          <form action={dispatchLogin} className="space-y-4 animate-in fade-in duration-200">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Bienvenido de nuevo</h2>
              <p className="text-xs text-slate-500">Ingresa tus credenciales para acceder a tu cuenta.</p>
            </div>

            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-semibold animate-in fade-in">
                <ExclamationCircleIcon className="w-5 h-5 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="login-email">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    placeholder="ejemplo@ecobooking.com"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                  <AtSymbolIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="login-password">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                  <KeyIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            <LoginSubmitButton />
          </form>
        )}

        {/* =================================================== */}
        {/* FORMULARIO DE REGISTRO */}
        {/* =================================================== */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4 animate-in fade-in duration-200">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Únete a EcoBooking</h2>
              <p className="text-xs text-slate-500">Crea tu cuenta para reservar o publicar alojamientos.</p>
            </div>

            {registerSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold animate-in fade-in">
                <CheckCircleIcon className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <p>¡Cuenta creada exitosamente!</p>
                  <p className="text-[11px] font-normal text-emerald-700 mt-0.5">Redirigiendo al inicio de sesión...</p>
                </div>
              </div>
            )}

            {registerError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-semibold animate-in fade-in">
                <ExclamationCircleIcon className="w-5 h-5 shrink-0" />
                <span>{registerError}</span>
              </div>
            )}

            {/* Selector de Rol */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Tipo de Cuenta</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRegisterRole('guest')}
                  className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                    registerRole === 'guest'
                      ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/80'
                  }`}
                >
                  <UserGroupIcon className={`w-5 h-5 ${registerRole === 'guest' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">Huésped</span>
                  <span className="text-[10px] text-slate-500">Reservar viajes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRegisterRole('host')}
                  className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                    registerRole === 'host'
                      ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/80'
                  }`}
                >
                  <BuildingOffice2Icon className={`w-5 h-5 ${registerRole === 'host' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">Anfitrión</span>
                  <span className="text-[10px] text-slate-500">Publicar propiedades</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="register-name">
                  Nombre Completo
                </label>
                <div className="relative">
                  <input
                    id="register-name"
                    type="text"
                    name="name"
                    placeholder="Juan Pérez"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                  <UserIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="register-email">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <input
                    id="register-email"
                    type="email"
                    name="email"
                    placeholder="juan@ejemplo.com"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                  <AtSymbolIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="register-password">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="register-password"
                    type="password"
                    name="password"
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                  <KeyIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isRegistering}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-[1px] active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isRegistering ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creando cuenta...</span>
                </>
              ) : (
                <>
                  <span>Registrarme como {registerRole === 'host' ? 'Anfitrión' : 'Huésped'}</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

function LoginSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-[1px] active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Ingresando...</span>
        </>
      ) : (
        <>
          <span>Ingresar a mi cuenta</span>
          <ArrowRightIcon className="w-4 h-4" />
        </>
      )}
    </button>
  );
}
