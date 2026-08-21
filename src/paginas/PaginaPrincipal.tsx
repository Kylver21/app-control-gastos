import { Session } from '@supabase/supabase-js';
import { CalendarDays, ChevronDown, MoreVertical, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { BarraNavegacion } from '@/componentes/BarraNavegacion';
import { FormularioMovimiento, DatosFormulario } from '@/componentes/FormularioMovimiento';
import { FormularioMeta } from '@/componentes/FormularioMeta';
import { FormularioRecurrente } from '@/componentes/FormularioRecurrente';
import { FormularioCuenta } from '@/componentes/FormularioCuenta';
import { FormularioAbono } from '@/componentes/FormularioAbono';
import { FormularioTransferencia } from '@/componentes/FormularioTransferencia';
import { GastosRecurrentes } from '@/componentes/GastosRecurrentes';
import { HistorialTransferencias } from '@/componentes/HistorialTransferencias';
import { PanelConsejos } from '@/componentes/PanelConsejos';
import { PanelMetas } from '@/componentes/PanelMetas';
import { PanelPrestamos } from '@/componentes/PanelPrestamos';
import { SeccionFlujoCaja } from '@/componentes/SeccionFlujoCaja';
import { TablaMovimientos } from '@/componentes/TablaMovimientos';
import { TarjetasCuentas } from '@/componentes/TarjetasCuentas';
import { TarjetasResumen } from '@/componentes/TarjetasResumen';
import { useFinanceStorage } from '@/hooks/useFinanceStorage';
import { Movimiento, TipoMovimiento } from '@/tipos/movimientos';

export function PaginaPrincipal({ session, onLogout }: { session: Session; onLogout: () => Promise<void> }) {
  const storage = useFinanceStorage(session.user);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [movimientoEditando, setMovimientoEditando] = useState<Movimiento | undefined>();
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | TipoMovimiento>('todos');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [metaFormAbierto, setMetaFormAbierto] = useState(false);
  const [metaEditando, setMetaEditando] = useState<import('@/tipos/movimientos').MetaAhorro | undefined>();
  const [recurrenteFormAbierto, setRecurrenteFormAbierto] = useState(false);
  const [recurrenteEditando, setRecurrenteEditando] = useState<import('@/tipos/movimientos').GastoRecurrente | undefined>();
  const [cuentaFormAbierto, setCuentaFormAbierto] = useState(false);
  const [metaAbonando, setMetaAbonando] = useState<import('@/tipos/movimientos').MetaAhorro | undefined>();
  const [transferenciaAbierta, setTransferenciaAbierta] = useState(false);
  const [cuentaOrigenTransferencia, setCuentaOrigenTransferencia] = useState<string | undefined>();

  const resumen = useMemo(() => {
    const ingresos = storage.movimientos.filter((item) => item.tipo === 'ingreso').reduce((total, item) => total + item.monto, 0);
    const gastos = storage.movimientos.filter((item) => item.tipo === 'gasto').reduce((total, item) => total + item.monto, 0);
    const meDeben = storage.prestamos.filter((item) => item.direccion === 'me_deben' && !item.pagado).reduce((total, item) => total + item.monto, 0);
    const yoDebo = storage.prestamos.filter((item) => item.direccion === 'yo_debo' && !item.pagado).reduce((total, item) => total + item.monto, 0);
    return { ingresos, gastos, prestamos: meDeben, ahorro: ingresos - gastos, proyectado: ingresos - gastos - yoDebo, meDeben, yoDebo };
  }, [storage.movimientos, storage.prestamos]);

  const movimientosFiltrados = useMemo(() => storage.movimientos.filter((item) => {
    const texto = `${item.concepto} ${item.categoria} ${item.cuenta}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase()) && (filtroTipo === 'todos' || item.tipo === filtroTipo) && (!fechaDesde || item.fecha >= fechaDesde) && (!fechaHasta || item.fecha <= fechaHasta);
  }).sort((a, b) => b.fecha.localeCompare(a.fecha)), [storage.movimientos, busqueda, filtroTipo, fechaDesde, fechaHasta]);

  async function guardarMovimiento(datos: DatosFormulario) {
    if (movimientoEditando) await storage.editarMovimiento(movimientoEditando.id, datos, movimientoEditando);
    else await storage.agregarMovimiento(datos);
    setModalAbierto(false);
    setMovimientoEditando(undefined);
  }

  async function agregarCuenta() {
    setCuentaFormAbierto(true);
  }

  function agregarMeta() { setMetaEditando(undefined); setMetaFormAbierto(true); }

  function abonarMeta(meta: import('@/tipos/movimientos').MetaAhorro) {
    setMetaAbonando(meta);
  }

  function editarMeta(meta: import('@/tipos/movimientos').MetaAhorro) { setMetaEditando(meta); setMetaFormAbierto(true); }

  function agregarRecurrente() { setRecurrenteEditando(undefined); setRecurrenteFormAbierto(true); }

  function exportarMovimientos() {
    const filas = [['Fecha', 'Tipo', 'Concepto', 'Categoría', 'Cuenta', 'Monto'], ...movimientosFiltrados.map((item) => [item.fecha, item.tipo, item.concepto, item.categoria, item.cuenta, item.monto.toFixed(2)])];
    const contenido = filas.map((fila) => fila.map((celda) => `"${celda.replace(/"/g, '""')}"`).join(';')).join('\n');
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(new Blob([`\ufeff${contenido}`], { type: 'text/csv;charset=utf-8;' }));
    enlace.download = 'movimientos-financieros.csv';
    enlace.click();
    URL.revokeObjectURL(enlace.href);
  }

  function abrirNuevoMovimiento() {
    setMovimientoEditando(undefined);
    setModalAbierto(true);
  }

  return <div className="min-h-screen bg-[#f8f7fb] text-[#1d1d26]">
    <BarraNavegacion onExportar={exportarMovimientos} onNuevoMovimiento={abrirNuevoMovimiento} onLogout={onLogout} />
    <main id="inicio" className="mx-auto max-w-[1440px] space-y-6 px-4 py-6 sm:px-5 lg:px-10 lg:py-9">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="mb-1 text-xs font-semibold uppercase tracking-[.12em] text-[#777887]">Resumen actualizado</p><h1 className="text-[28px] font-bold tracking-[-.7px]">Resumen general</h1><p className="mt-1 text-sm text-[#6f7080]">Tu salud financiera en una sola vista.</p></div><div className="flex items-center gap-2"><button className="flex items-center gap-2 rounded-lg border border-[#d5d4df] bg-white px-3 py-2 text-xs font-semibold text-[#555766]"><CalendarDays size={15} /> Esta quincena <ChevronDown size={14} /></button><button className="hidden rounded-lg p-2 text-[#777887] hover:bg-white sm:block" aria-label="Más opciones"><MoreVertical size={19} /></button></div></div>
      <TarjetasResumen resumen={resumen} />
      <TarjetasCuentas cuentas={storage.cuentas} onAgregar={agregarCuenta} onTransferir={(cuentaId) => { setCuentaOrigenTransferencia(cuentaId); setTransferenciaAbierta(true); }} />
      <GastosRecurrentes recurrentes={storage.recurrentes} onAgregar={agregarRecurrente} onEditar={(item) => { setRecurrenteEditando(item); setRecurrenteFormAbierto(true); }} onPausar={(item) => void storage.actualizarRecurrente(item.id, { activo: !item.activo })} onEliminar={(id) => void storage.eliminarRecurrente(id)} />
      <HistorialTransferencias transferencias={storage.transferencias} />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]"><SeccionFlujoCaja movimientos={storage.movimientos} cargando={storage.cargando} onNuevoMovimiento={abrirNuevoMovimiento} /><PanelConsejos movimientos={storage.movimientos} historial={[]} /></div>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]"><TablaMovimientos movimientos={movimientosFiltrados} busqueda={busqueda} filtroTipo={filtroTipo} fechaDesde={fechaDesde} fechaHasta={fechaHasta} onBusqueda={setBusqueda} onFiltro={setFiltroTipo} onFechaDesde={setFechaDesde} onFechaHasta={setFechaHasta} onExportar={exportarMovimientos} onEditar={(movimiento) => { setMovimientoEditando(movimiento); setModalAbierto(true); }} onEliminar={storage.eliminarMovimiento} /><div className="space-y-5"><PanelMetas metas={storage.metas} onAgregar={agregarMeta} onEditar={editarMeta} onAbonar={abonarMeta} onEliminar={(id) => void storage.eliminarMeta(id)} /><PanelPrestamos meDeben={resumen.meDeben} yoDebo={resumen.yoDebo} /></div></div>
    </main>
    <button onClick={abrirNuevoMovimiento} className="fixed bottom-6 right-6 grid h-14 w-14 place-items-center rounded-full bg-[#293ea9] text-white shadow-xl shadow-[#293ea9]/30 transition hover:scale-105 sm:hidden" aria-label="Registrar movimiento"><Plus size={25} /></button>
    {modalAbierto && <FormularioMovimiento movimientoInicial={movimientoEditando} alCerrar={() => { setModalAbierto(false); setMovimientoEditando(undefined); }} alGuardar={guardarMovimiento} cuentas={storage.cuentas} />}
    {metaFormAbierto && <FormularioMeta meta={metaEditando} cuentas={storage.cuentas} alCerrar={() => { setMetaFormAbierto(false); setMetaEditando(undefined); }} alGuardar={async (datos) => { if (metaEditando) await storage.actualizarMeta(metaEditando.id, datos); else await storage.agregarMeta(datos); setMetaFormAbierto(false); setMetaEditando(undefined); }} />}
    {recurrenteFormAbierto && <FormularioRecurrente recurrente={recurrenteEditando} cuentas={storage.cuentas} alCerrar={() => { setRecurrenteFormAbierto(false); setRecurrenteEditando(undefined); }} alGuardar={async (datos) => { if (recurrenteEditando) await storage.actualizarRecurrente(recurrenteEditando.id, datos); else await storage.agregarRecurrente(datos); setRecurrenteFormAbierto(false); setRecurrenteEditando(undefined); }} />}
    {cuentaFormAbierto && <FormularioCuenta alCerrar={() => setCuentaFormAbierto(false)} alGuardar={async (datos) => { await storage.agregarCuenta(datos); setCuentaFormAbierto(false); }} />}
    {metaAbonando && <FormularioAbono meta={metaAbonando} cuentas={storage.cuentas} alCerrar={() => setMetaAbonando(undefined)} alGuardar={async (cuentaId, monto) => { await storage.abonarMeta(metaAbonando, cuentaId, monto); setMetaAbonando(undefined); }} />}
    {transferenciaAbierta && <FormularioTransferencia cuentas={storage.cuentas} cuentaOrigenInicial={cuentaOrigenTransferencia} alCerrar={() => { setTransferenciaAbierta(false); setCuentaOrigenTransferencia(undefined); }} alTransferir={async (origen, destino, monto, concepto, fecha) => { await storage.realizarTransferencia(origen, destino, monto, concepto, fecha); setTransferenciaAbierta(false); setCuentaOrigenTransferencia(undefined); }} />}
    {storage.toast && <div className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-[#1d1d26] px-4 py-3 text-sm font-semibold text-white shadow-xl" role="status">{storage.toast.mensaje}</div>}
  </div>;
}
