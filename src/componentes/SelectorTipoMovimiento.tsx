import { ArrowDown, ArrowUp, HandCoins } from 'lucide-react';
import { DireccionPrestamo, TipoMovimiento } from '@/tipos/movimientos';

type Props = { tipo: TipoMovimiento; direccion: DireccionPrestamo; onTipo: (tipo: TipoMovimiento) => void; onDireccion: (direccion: DireccionPrestamo) => void };

export function SelectorTipoMovimiento({ tipo, direccion, onTipo, onDireccion }: Props) {
  return <>
    <fieldset>
      <legend className="mb-3 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#5c5c6b]">Tipo de movimiento</legend>
      <div className="grid grid-cols-3 gap-3">{([['gasto', 'Gasto', ArrowDown], ['ingreso', 'Ingreso', ArrowUp], ['prestamo', 'Préstamo', HandCoins]] as const).map(([valor, etiqueta, Icono]) => <button type="button" key={valor} aria-pressed={tipo === valor} onClick={() => onTipo(valor)} className={`min-h-[72px] rounded-2xl border-2 px-3 py-3 text-center transition-all duration-200 ${tipo === valor ? valor === 'gasto' ? 'border-[#c83235] bg-[#fff5f5] shadow-sm' : valor === 'ingreso' ? 'border-[#00805e] bg-[#f0fbf6] shadow-sm' : 'border-[#293ea9] bg-[#f3f4ff] shadow-sm' : 'border-[#e0dfe8] bg-white hover:border-[#b9b7c7]'}`}><Icono size={21} className={`mx-auto mb-2 ${valor === 'gasto' ? 'text-[#c83235]' : valor === 'ingreso' ? 'text-[#00805e]' : 'text-[#293ea9]'}`} /><span className="text-xs font-semibold text-[#2b2c36]">{etiqueta}</span></button>)}</div>
    </fieldset>
    {tipo === 'prestamo' && <fieldset><legend className="mb-3 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#5c5c6b]">Dirección del préstamo</legend><div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => onDireccion('prestado')} className={`rounded-xl border-2 px-3 py-3 text-sm font-semibold ${direccion === 'prestado' ? 'border-[#293ea9] bg-[#eef0ff] text-[#293ea9]' : 'border-[#e0dfe8] text-[#777887]'}`}>Yo presto</button><button type="button" onClick={() => onDireccion('recibido')} className={`rounded-xl border-2 px-3 py-3 text-sm font-semibold ${direccion === 'recibido' ? 'border-[#293ea9] bg-[#eef0ff] text-[#293ea9]' : 'border-[#e0dfe8] text-[#777887]'}`}>Yo recibo</button></div></fieldset>}
  </>;
}
