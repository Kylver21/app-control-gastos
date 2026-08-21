import { FormEvent, useState } from 'react';
import { ArrowRight, Eye, EyeOff, Wallet } from 'lucide-react';

type Props = { onLogin: (email: string, password: string) => Promise<boolean>; onRegistro: (email: string, password: string) => Promise<boolean>; error: string };

export function PantallaAuth({ onLogin, onRegistro, error }: Props) {
  const [modoRegistro, setModoRegistro] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setMensaje('');
    setCargando(true);
    const correcto = modoRegistro ? await onRegistro(email, password) : await onLogin(email, password);
    setCargando(false);
    if (correcto && modoRegistro) setMensaje('Cuenta creada. Revisa tu correo si la confirmación está activa.');
  }

  return <main className="grid min-h-screen place-items-center bg-[#f8f7fb] px-4 py-8"><section className="w-full max-w-md rounded-3xl border border-[#dedde8] bg-white p-6 shadow-[0_20px_60px_rgba(29,29,38,.1)] sm:p-8"><div className="mb-8 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#293ea9] text-white shadow-lg shadow-[#293ea9]/25"><Wallet size={26} /></div><h1 className="mt-4 text-2xl font-bold text-[#1d1d26]">FinanzPro</h1><p className="mt-1 text-sm text-[#777887]">Tu control financiero, siempre contigo.</p></div><h2 className="text-xl font-bold">{modoRegistro ? 'Crear cuenta' : 'Iniciar sesión'}</h2><p className="mt-1 text-sm text-[#777887]">{modoRegistro ? 'Empieza a guardar tus finanzas en la nube.' : 'Accede a tu dashboard personal.'}</p><form onSubmit={enviar} className="mt-6 space-y-4"><label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#5c5c6b]">Correo electrónico</span><input required type="email" value={email} onChange={(evento) => setEmail(evento.target.value)} className="campo" placeholder="tu@email.com" /></label><label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#5c5c6b]">Contraseña</span><div className="relative"><input required minLength={6} type={mostrarPassword ? 'text' : 'password'} value={password} onChange={(evento) => setPassword(evento.target.value)} className="campo pr-12" placeholder="Mínimo 6 caracteres" /><button type="button" onClick={() => setMostrarPassword((visible) => !visible)} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-[#777887]" aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{mostrarPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>{(error || mensaje) && <p className={`rounded-xl px-3 py-2 text-sm ${error ? 'bg-[#fff0f0] text-[#b3262d]' : 'bg-[#e5fbf1] text-[#007c59]'}`}>{error || mensaje}</p>}<button disabled={cargando} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#293ea9] text-sm font-bold text-white shadow-lg shadow-[#293ea9]/25 disabled:cursor-wait disabled:opacity-60">{cargando ? 'Procesando...' : modoRegistro ? 'Crear cuenta' : 'Entrar'} {!cargando && <ArrowRight size={17} />}</button></form><button type="button" onClick={() => { setModoRegistro((modo) => !modo); setMensaje(''); }} className="mt-6 w-full text-center text-sm font-semibold text-[#293ea9]">{modoRegistro ? 'Ya tengo una cuenta' : 'Crear una cuenta nueva'}</button></section></main>;
}
