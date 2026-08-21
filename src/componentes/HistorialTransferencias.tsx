import { ArrowRight } from 'lucide-react';
import { Transferencia } from '@/tipos/movimientos';
import { moneda } from '@/utilidades/formato';

export function HistorialTransferencias({ transferencias }: { transferencias: Transferencia[] }) {
  return <section className="rounded-2xl border border-[#dedde8] bg-white p-5 shadow-[0_2px_8px_rgba(29,29,38,.04)]"><h2 className="mb-4 text-lg font-bold">Historial de transferencias</h2><div className="space-y-2">{transferencias.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-xl border border-[#ecebf2] p-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#eef0ff] text-[#293ea9]"><ArrowRight size={16} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{item.cuenta_origen ?? 'Origen'} → {item.cuenta_destino ?? 'Destino'}</p><p className="truncate text-xs text-[#858592]">{item.concepto || 'Sin concepto'} · {item.fecha}</p></div><strong className="text-sm text-[#293ea9]">{moneda(item.monto)}</strong></div>)}{transferencias.length === 0 && <p className="py-5 text-center text-sm text-[#858592]">Aún no hay transferencias.</p>}</div></section>;
}
