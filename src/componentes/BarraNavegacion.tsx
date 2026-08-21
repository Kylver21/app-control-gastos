import { Bell, Download, LogOut, Menu, Plus, Wallet, X } from 'lucide-react';
import { useState } from 'react';

type Props = {
  onExportar: () => void;
  onNuevoMovimiento: () => void;
  onLogout: () => Promise<void>;
};

export function BarraNavegacion({ onExportar, onNuevoMovimiento, onLogout }: Props) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  function cerrarMenu() {
    setMenuAbierto(false);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#dddde8] bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-[68px] max-w-[1440px] items-center gap-4 px-4 sm:px-5 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#293ea9] text-white shadow-lg shadow-[#293ea9]/20">
            <Wallet size={21} />
          </div>
          <span className="text-xl font-bold tracking-[-1px] text-[#293ea9] sm:text-[25px]">FinanzPro</span>
        </div>

        <nav className="hidden items-center gap-8 text-[13px] font-semibold text-[#6f7080] md:flex">
          <a className="border-b-2 border-[#293ea9] py-6 text-[#293ea9]" href="#inicio">Dashboard</a>
          <a href="#movimientos" className="hover:text-[#293ea9]">Movimientos</a>
          <a href="#metas" className="hover:text-[#293ea9]">Metas</a>
          <a href="#recurrentes" className="hover:text-[#293ea9]">Recurrentes</a>
          <a href="#cuentas" className="hover:text-[#293ea9]">Cuentas</a>
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button onClick={onExportar} className="hidden h-10 items-center gap-2 rounded-lg border border-[#293ea9] px-4 text-xs font-bold text-[#293ea9] transition hover:bg-[#eef0ff] sm:flex">
            <Download size={15} /> Exportar
          </button>
          <button onClick={onNuevoMovimiento} className="hidden h-10 items-center gap-2 rounded-lg bg-[#293ea9] px-5 text-xs font-bold text-white shadow-md shadow-[#293ea9]/20 transition hover:bg-[#1e308e] sm:flex">
            <Plus size={16} /> Registrar movimiento
          </button>
          <button className="rounded-full p-2 text-[#555766] hover:bg-[#f0f0f6]" aria-label="Notificaciones">
            <Bell size={19} />
          </button>
          <div className="hidden h-9 w-9 place-items-center rounded-full bg-[#dfe7f4] text-sm font-bold text-[#293ea9] sm:grid">US</div>
          <button onClick={() => setMenuAbierto((abierto) => !abierto)} className="rounded-lg p-2 text-[#555766] md:hidden" aria-label={menuAbierto ? 'Cerrar menu' : 'Abrir menu'}>
            {menuAbierto ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {menuAbierto && (
        <div className="border-t border-[#e4e3eb] bg-white p-4 md:hidden">
          <div className="grid gap-3 text-sm font-semibold text-[#545665]">
            <a onClick={cerrarMenu} href="#inicio">Dashboard</a>
            <a onClick={cerrarMenu} href="#movimientos">Movimientos</a>
            <a onClick={cerrarMenu} href="#metas">Metas</a>
            <a onClick={cerrarMenu} href="#recurrentes">Recurrentes</a>
            <a onClick={cerrarMenu} href="#cuentas">Cuentas</a>
            <button onClick={onNuevoMovimiento} className="flex items-center gap-2 rounded-lg bg-[#293ea9] px-3 py-3 text-left text-white">
              <Plus size={16} /> Registrar movimiento
            </button>
            <button onClick={onExportar} className="flex items-center gap-2 rounded-lg border border-[#293ea9] px-3 py-3 text-left text-[#293ea9]">
              <Download size={16} /> Exportar movimientos
            </button>
            <button onClick={() => void onLogout()} className="flex items-center gap-2 rounded-lg border border-[#f7c2c8] px-3 py-3 text-left text-[#b3262d]">
              <LogOut size={16} /> Cerrar sesion
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
