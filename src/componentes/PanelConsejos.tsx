import { AlertTriangle, Lightbulb, Sparkles } from 'lucide-react';
import { Movimiento } from '@/tipos/movimientos';
import { moneda } from '@/utilidades/formato';

export function PanelConsejos({ movimientos, historial }: { movimientos: Movimiento[]; historial: Record<string, number>[] }) {
  const gastos = movimientos.filter((item) => item.tipo === 'gasto');
  const porCategoria = gastos.reduce<Record<string, number>>((total, item) => ({ ...total, [item.categoria]: (total[item.categoria] ?? 0) + item.monto }), {});
  const [categoriaPrincipal, montoPrincipal] = Object.entries(porCategoria).sort((a, b) => b[1] - a[1])[0] ?? ['Sin gastos', 0];
  const promedioHistorico = historial.length ? historial.reduce((total, periodo) => total + (periodo[categoriaPrincipal] ?? 0), 0) / historial.length : 0;

  const comparacion = promedioHistorico && montoPrincipal > promedioHistorico ? `Está ${moneda(montoPrincipal - promedioHistorico)} por encima de tu promedio histórico.` : 'Está dentro de tu promedio histórico.';
  return <section className="rounded-xl bg-[#f2f1fb] p-5"><div className="mb-4 flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#e1e5ff] text-[#293ea9]"><Sparkles size={18} /></div><h2 className="text-lg font-bold">Asistente financiero</h2></div><div className="space-y-3"><div className="rounded-lg border border-[#f2d8a8] bg-[#fffaf0] p-4"><div className="flex gap-3"><AlertTriangle size={18} className="mt-0.5 shrink-0 text-[#af7415]" /><div><p className="text-xs font-bold">Categoría de mayor gasto: {categoriaPrincipal}</p><p className="mt-1 text-xs leading-5 text-[#656472]">Llevas {moneda(montoPrincipal)}. Tu promedio histórico es {moneda(promedioHistorico)}. {comparacion}</p></div></div></div><div className="rounded-lg border border-[#e0dfe9] bg-white p-4"><div className="flex gap-3"><Lightbulb size={18} className="mt-0.5 shrink-0 text-[#00805e]" /><div><p className="text-xs font-bold">Oportunidad de ahorro</p><p className="mt-1 text-xs leading-5 text-[#656472]">{gastos.length ? `Revisa ${categoriaPrincipal} y define un límite para el próximo período.` : 'Registra tus primeros gastos para recibir recomendaciones personalizadas.'}</p></div></div></div></div></section>;
}
