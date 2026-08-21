import { HandCoins } from 'lucide-react';
import { moneda } from '@/utilidades/formato';

export function PanelPrestamos({ meDeben, yoDebo }: { meDeben: number; yoDebo: number }) {
  return <section className="rounded-xl border border-[#dedde8] bg-white p-5 shadow-[0_2px_8px_rgba(29,29,38,.04)]"><h2 className="mb-5 flex items-center gap-2 text-lg font-bold"><HandCoins size={18} /> Préstamos familiares</h2><div className="grid grid-cols-2 gap-3"><div className="rounded-lg border border-[#e2e1eb] bg-[#f7f6fc] p-3"><p className="text-[10px] uppercase text-[#858592]">Me deben</p><p className="mt-2 font-bold text-[#007c59]">{moneda(meDeben)}</p><p className="mt-1 text-[10px] text-[#656472]">Por cobrar</p></div><div className="rounded-lg border border-[#e2e1eb] bg-[#f7f6fc] p-3"><p className="text-[10px] uppercase text-[#858592]">Yo debo</p><p className="mt-2 font-bold text-[#c52c2f]">{moneda(yoDebo)}</p><p className="mt-1 text-[10px] text-[#656472]">Por pagar</p></div></div></section>;
}
