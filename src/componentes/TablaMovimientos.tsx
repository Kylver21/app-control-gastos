import { useEffect, useState } from 'react';
import { Download, MoreVertical, Search } from 'lucide-react';
import { Movimiento, TipoMovimiento } from '@/tipos/movimientos';
import { fechaVisible, moneda } from '@/utilidades/formato';

type Props = {
  movimientos: Movimiento[];
  busqueda: string;
  filtroTipo: 'todos' | TipoMovimiento;
  fechaDesde: string;
  fechaHasta: string;
  onBusqueda: (valor: string) => void;
  onFiltro: (valor: 'todos' | TipoMovimiento) => void;
  onFechaDesde: (valor: string) => void;
  onFechaHasta: (valor: string) => void;
  onExportar: () => void;
  onEditar: (movimiento: Movimiento) => void;
  onEliminar: (movimiento: Movimiento) => void;
};

export function TablaMovimientos({ movimientos, busqueda, filtroTipo, fechaDesde, fechaHasta, onBusqueda, onFiltro, onFechaDesde, onFechaHasta, onExportar, onEditar, onEliminar }: Props) {
  const paginas = Math.max(1, Math.ceil(movimientos.length / 10));
  const [pagina, setPagina] = useState(1);
  const paginaActual = Math.min(pagina, paginas);
  const visibles = movimientos.slice((paginaActual - 1) * 10, paginaActual * 10);

  useEffect(() => setPagina(1), [busqueda, filtroTipo, fechaDesde, fechaHasta]);

  return <section id="movimientos" className="overflow-hidden rounded-xl border border-[#dedde8] bg-white shadow-[0_2px_8px_rgba(29,29,38,.04)]">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ecebf1] p-5"><div><h2 className="text-lg font-bold">Movimientos recientes</h2><p className="mt-1 text-xs text-[#878795]">Consulta y organiza tus operaciones</p></div><button onClick={onExportar} className="flex items-center gap-2 text-xs font-bold text-[#293ea9] hover:underline"><Download size={14} /> Exportar</button></div>
    <div className="grid gap-3 border-b border-[#ecebf1] bg-[#fcfcfe] p-4 sm:grid-cols-2 lg:grid-cols-4"><div className="relative sm:col-span-2"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c8c99]" /><input value={busqueda} onChange={(event) => onBusqueda(event.target.value)} className="h-10 w-full rounded-lg border border-[#dddde7] bg-white pl-9 pr-3 text-xs outline-none focus:border-[#293ea9]" placeholder="Buscar movimiento..." /></div><select value={filtroTipo} onChange={(event) => onFiltro(event.target.value as 'todos' | TipoMovimiento)} className="h-10 rounded-lg border border-[#dddde7] bg-white px-3 text-xs text-[#555766] outline-none"><option value="todos">Todos los tipos</option><option value="ingreso">Ingresos</option><option value="gasto">Gastos</option><option value="prestamo">Préstamos</option></select><div className="flex gap-2"><input aria-label="Fecha desde" type="date" value={fechaDesde} onChange={(event) => onFechaDesde(event.target.value)} className="h-10 min-w-0 w-full rounded-lg border border-[#dddde7] px-2 text-xs" /><input aria-label="Fecha hasta" type="date" value={fechaHasta} onChange={(event) => onFechaHasta(event.target.value)} className="h-10 min-w-0 w-full rounded-lg border border-[#dddde7] px-2 text-xs" /></div></div>
    <div className="space-y-3 p-4 md:hidden">{visibles.map((movimiento) => <TarjetaMovimiento key={movimiento.id} movimiento={movimiento} onEditar={onEditar} onEliminar={onEliminar} />)}</div>
    <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-[#f7f6fb] text-[10px] font-bold uppercase tracking-wider text-[#777887]"><tr><th className="px-5 py-3">Fecha</th><th className="px-5 py-3">Concepto</th><th className="px-5 py-3">Categoría</th><th className="px-5 py-3 text-right">Monto (S/)</th><th className="px-5 py-3" /></tr></thead><tbody>{visibles.map((movimiento, indice) => <FilaMovimiento key={movimiento.id} movimiento={movimiento} indice={indice} onEditar={onEditar} onEliminar={onEliminar} />)}</tbody></table></div>
    {visibles.length === 0 && <p className="p-8 text-center text-sm text-[#81818e]">No hay movimientos con estos filtros.</p>}
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#ecebf1] px-5 py-4 text-xs text-[#81818e]"><span>{movimientos.length} movimientos encontrados</span><div className="flex items-center gap-2"><button disabled={paginaActual === 1} onClick={() => setPagina((actual) => actual - 1)} className="rounded-lg border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40">Anterior</button><span>Página {paginaActual} de {paginas}</span><button disabled={paginaActual === paginas} onClick={() => setPagina((actual) => actual + 1)} className="rounded-lg border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40">Siguiente</button></div></div>
  </section>;
}

function TarjetaMovimiento({ movimiento, onEditar, onEliminar }: { movimiento: Movimiento; onEditar: (movimiento: Movimiento) => void; onEliminar: (movimiento: Movimiento) => void }) {
  const positivo = movimiento.tipo === 'ingreso';
  return <article className="rounded-xl border border-[#e3e2eb] bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{movimiento.concepto}</p><p className="mt-1 text-xs text-[#858592]">{fechaVisible(movimiento.fecha)} · {movimiento.cuenta}</p></div><p className={`font-bold ${positivo ? 'text-[#007c59]' : 'text-[#30303a]'}`}>{positivo ? '+' : '-'}{moneda(movimiento.monto).replace('S/ ', '')}</p></div><div className="mt-3 flex items-center justify-between"><span className={`rounded-md px-2 py-1 text-[10px] font-bold ${positivo ? 'bg-[#e4faf1] text-[#007c59]' : movimiento.tipo === 'prestamo' ? 'bg-[#eef0ff] text-[#293ea9]' : 'bg-[#eeedf3] text-[#656574]'}`}>{movimiento.categoria}</span><div className="flex gap-2"><button onClick={() => onEditar(movimiento)} className="rounded-lg bg-[#eef0ff] px-3 py-2 text-xs font-semibold text-[#293ea9]">Editar</button><button onClick={() => onEliminar(movimiento)} className="rounded-lg bg-[#fff0f0] px-3 py-2 text-xs font-semibold text-[#b3262d]">Eliminar</button></div></div></article>;
}

function FilaMovimiento({ movimiento, indice, onEditar, onEliminar }: { movimiento: Movimiento; indice: number; onEditar: (movimiento: Movimiento) => void; onEliminar: (movimiento: Movimiento) => void }) {
  const positivo = movimiento.tipo === 'ingreso';
  const [menuAbierto, setMenuAbierto] = useState(false);
  return <tr className={`border-b border-[#ecebf1] last:border-0 ${indice % 2 ? 'bg-[#fcfcfe]' : 'bg-white'} hover:bg-[#f4f5ff]`}><td className="whitespace-nowrap px-5 py-4 text-xs text-[#81818e]">{fechaVisible(movimiento.fecha)}</td><td className="px-5 py-4"><p className="font-semibold">{movimiento.concepto}</p><p className="mt-1 text-[11px] text-[#858592]">{movimiento.cuenta}</p></td><td className="px-5 py-4"><span className={`rounded-md px-2 py-1 text-[10px] font-bold ${positivo ? 'bg-[#e4faf1] text-[#007c59]' : movimiento.tipo === 'prestamo' ? 'bg-[#eef0ff] text-[#293ea9]' : 'bg-[#eeedf3] text-[#656574]'}`}>{movimiento.categoria}</span></td><td className={`px-5 py-4 text-right font-semibold ${positivo ? 'text-[#007c59]' : 'text-[#30303a]'}`}>{positivo ? '+' : '-'}{moneda(movimiento.monto).replace('S/ ', '')}</td><td className="relative px-5 py-4 text-right"><button onClick={() => setMenuAbierto((abierto) => !abierto)} className="text-[#a1a1ad] hover:text-[#293ea9]" aria-label={`Más opciones para ${movimiento.concepto}`}><MoreVertical size={16} /></button>{menuAbierto && <div className="absolute right-4 top-12 z-10 w-28 rounded-lg border border-[#dedde8] bg-white p-1 text-left text-xs shadow-xl"><button onClick={() => { onEditar(movimiento); setMenuAbierto(false); }} className="block w-full rounded px-2 py-2 text-left hover:bg-[#f1f2ff]">Editar</button><button onClick={() => { onEliminar(movimiento); setMenuAbierto(false); }} className="block w-full rounded px-2 py-2 text-left text-[#c52c2f] hover:bg-[#fff0f0]">Eliminar</button></div>}</td></tr>;
}
