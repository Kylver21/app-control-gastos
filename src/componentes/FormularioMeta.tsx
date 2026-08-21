import { FormEvent, useState } from 'react';
import { Flag, X } from 'lucide-react';
import { Cuenta, MetaAhorro } from '@/tipos/movimientos';

type Props = { meta?: MetaAhorro; cuentas: Cuenta[]; alCerrar: () => void; alGuardar: (datos: Omit<MetaAhorro, 'id' | 'user_id'>) => Promise<void> };

export function FormularioMeta({ meta, cuentas, alCerrar, alGuardar }: Props) {
  const [nombre, setNombre] = useState(meta?.nombre ?? '');
  const [objetivo, setObjetivo] = useState(String(meta?.monto_objetivo ?? ''));
  const [actual, setActual] = useState(String(meta?.monto_actual ?? '0'));
  const [fechaLimite, setFechaLimite] = useState(meta?.fecha_limite ?? '');
  const [cuentaId, setCuentaId] = useState(meta?.cuenta_id ?? cuentas[0]?.id ?? '');
  const [error, setError] = useState('');

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!nombre.trim() || Number(objetivo) <= 0 || Number(actual) < 0 || !cuentaId) {
      setError('Completa el nombre, objetivo, monto actual y cuenta.');
      return;
    }
    setError('');
    await alGuardar({ nombre: nombre.trim(), monto_objetivo: Number(objetivo), monto_actual: Number(actual), fecha_limite: fechaLimite || null, cuenta_id: cuentaId });
  }

  return <div className="animate-overlay-in fixed inset-0 z-50 flex items-end justify-center bg-[#1d1d26]/45 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" onClick={alCerrar}><div className="animate-modal-in w-full max-w-[560px] rounded-t-[22px] bg-white shadow-2xl sm:rounded-[22px]" onClick={(evento) => evento.stopPropagation()}><div className="flex items-center justify-between border-b border-[#e9e8f0] px-5 py-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef0ff] text-[#293ea9]"><Flag size={19} /></div><h2 className="text-lg font-bold">{meta ? 'Editar meta' : 'Crear meta de ahorro'}</h2></div><button onClick={alCerrar} className="grid h-10 w-10 place-items-center rounded-xl text-[#666775] hover:bg-[#f4f4f8]" aria-label="Cerrar"><X size={20} /></button></div><form onSubmit={enviar} className="space-y-4 p-5"><Campo etiqueta="Nombre"><input required value={nombre} onChange={(evento) => setNombre(evento.target.value)} className="campo" placeholder="Ej. Fondo de emergencia" /></Campo><div className="grid gap-4 sm:grid-cols-2"><Campo etiqueta="Monto objetivo"><input required type="number" min="0.01" step="0.01" value={objetivo} onChange={(evento) => setObjetivo(evento.target.value)} className="campo" /></Campo><Campo etiqueta="Monto actual"><input required type="number" min="0" step="0.01" value={actual} onChange={(evento) => setActual(evento.target.value)} className="campo" /></Campo></div><div className="grid gap-4 sm:grid-cols-2"><Campo etiqueta="Fecha límite"><input type="date" value={fechaLimite} onChange={(evento) => setFechaLimite(evento.target.value)} className="campo" /></Campo><Campo etiqueta="Cuenta de ahorro"><select required value={cuentaId} onChange={(evento) => setCuentaId(evento.target.value)} className="campo"><option value="">Selecciona cuenta</option>{cuentas.map((cuenta) => <option key={cuenta.id} value={cuenta.id}>{cuenta.nombre}</option>)}</select></Campo></div>{error && <p className="rounded-xl bg-[#fff0f0] px-3 py-2 text-sm text-[#b3262d]">{error}</p>}<div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end"><button type="button" onClick={alCerrar} className="h-11 rounded-xl border px-5 text-sm font-semibold">Cancelar</button><button type="submit" className="h-11 rounded-xl bg-[#293ea9] px-5 text-sm font-bold text-white">Guardar meta</button></div></form></div></div>;
}

function Campo({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#5c5c6b]">{etiqueta}</span>{children}</label>; }
