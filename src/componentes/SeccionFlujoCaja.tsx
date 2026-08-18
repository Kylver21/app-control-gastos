import { MoreVertical } from 'lucide-react';
import { ResumenFinanciero } from '@/tipos/movimientos';
import { GraficoFlujo } from './GraficoFlujo';
export function SeccionFlujoCaja({ resumen }: { resumen: Pick<ResumenFinanciero, 'ingresos'> }) { return <section className="rounded-xl border border-[#dedde8] bg-white p-5 shadow-[0_2px_8px_rgba(29,29,38,.04)]"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-bold">Flujo de caja: Ingresos vs. gastos</h2><p className="mt-1 text-xs text-[#878795]">Comparativa de las últimas dos semanas</p></div><button className="rounded-lg p-2 hover:bg-[#f4f4f8]" aria-label="Más opciones"><MoreVertical size={19} /></button></div><GraficoFlujo resumen={resumen} /></section>; }
