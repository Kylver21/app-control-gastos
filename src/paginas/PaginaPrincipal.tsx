import { CalendarDays, ChevronDown, MoreVertical, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { BarraNavegacion } from '@/componentes/BarraNavegacion';
import { FormularioMovimiento } from '@/componentes/FormularioMovimiento';
import { PanelConsejos } from '@/componentes/PanelConsejos';
import { PanelMetas } from '@/componentes/PanelMetas';
import { PanelPrestamos } from '@/componentes/PanelPrestamos';
import { SeccionFlujoCaja } from '@/componentes/SeccionFlujoCaja';
import { TablaMovimientos } from '@/componentes/TablaMovimientos';
import { TarjetasResumen } from '@/componentes/TarjetasResumen';
import { crearMovimiento } from '@/datos/movimientos';
import { useFinanceStorage } from '@/hooks/useFinanceStorage';
import { Movimiento, TipoMovimiento } from '@/tipos/movimientos';

export function PaginaPrincipal() {
  const { movimientos, historial, guardarMovimientos } = useFinanceStorage();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [movimientoEditando, setMovimientoEditando] = useState<Movimiento | undefined>();
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | TipoMovimiento>('todos');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [toast, setToast] = useState('');

  const resumen = useMemo(() => {
    const ingresos = movimientos.filter((item) => item.tipo === 'ingreso').reduce((total, item) => total + item.monto, 0);
    const gastos = movimientos.filter((item) => item.tipo === 'gasto').reduce((total, item) => total + item.monto, 0);
    const meDeben = movimientos.filter((item) => item.tipo === 'prestamo' && item.direccionPrestamo !== 'recibido').reduce((total, item) => total + item.monto, 0);
    const yoDebo = movimientos.filter((item) => item.tipo === 'prestamo' && item.direccionPrestamo === 'recibido').reduce((total, item) => total + item.monto, 0);
    return { ingresos, gastos, prestamos: meDeben, ahorro: ingresos - gastos, proyectado: ingresos - gastos - yoDebo, meDeben, yoDebo };
  }, [movimientos]);

  const movimientosFiltrados = useMemo(() => movimientos.filter((item) => {
    const texto = `${item.nota} ${item.categoria} ${item.cuenta}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase())
      && (filtroTipo === 'todos' || item.tipo === filtroTipo)
      && (!fechaDesde || item.fecha >= fechaDesde)
      && (!fechaHasta || item.fecha <= fechaHasta);
  }).sort((a, b) => b.fecha.localeCompare(a.fecha)), [movimientos, busqueda, filtroTipo, fechaDesde, fechaHasta]);

  function mostrarToast(mensaje: string) {
    setToast(mensaje);
    window.setTimeout(() => setToast(''), 3000);
  }

  function guardarMovimiento(datos: Omit<Movimiento, 'id'>) {
    const movimiento = movimientoEditando ? { ...datos, id: movimientoEditando.id } : crearMovimiento(datos);
    const nuevos = movimientoEditando ? movimientos.map((item) => item.id === movimiento.id ? movimiento : item) : [movimiento, ...movimientos];
    if (guardarMovimientos(nuevos)) {
      setModalAbierto(false);
      setMovimientoEditando(undefined);
      mostrarToast(movimientoEditando ? 'Movimiento actualizado' : 'Movimiento guardado');
    } else mostrarToast('No se pudo guardar. Revisa el almacenamiento del navegador.');
  }

  function eliminarMovimiento(movimiento: Movimiento) {
    if (!window.confirm(`¿Eliminar "${movimiento.nota}"?`)) return;
    if (guardarMovimientos(movimientos.filter((item) => item.id !== movimiento.id))) mostrarToast('Movimiento eliminado');
    else mostrarToast('No se pudo eliminar el movimiento');
  }

  function editarMovimiento(movimiento: Movimiento) {
    setMovimientoEditando(movimiento);
    setModalAbierto(true);
  }

  function exportarMovimientos() {
    const filas = [['Fecha', 'Tipo', 'Concepto', 'Categoría', 'Cuenta', 'Monto'], ...movimientosFiltrados.map((item) => [item.fecha, item.tipo, item.nota, item.categoria, item.cuenta, item.monto.toFixed(2)])];
    const contenido = filas.map((fila) => fila.map((celda) => `"${celda.replace(/"/g, '""')}"`).join(';')).join('\n');
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(new Blob([`\ufeff${contenido}`], { type: 'text/csv;charset=utf-8;' }));
    enlace.download = 'movimientos-financieros.csv';
    enlace.click();
    URL.revokeObjectURL(enlace.href);
  }

  return <div className="min-h-screen bg-[#f8f7fb] text-[#1d1d26]">
    <BarraNavegacion onExportar={exportarMovimientos} onNuevoMovimiento={() => { setMovimientoEditando(undefined); setModalAbierto(true); }} />
    <main id="inicio" className="mx-auto max-w-[1440px] space-y-5 px-5 py-7 lg:px-10 lg:py-9">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="mb-1 text-xs font-semibold uppercase tracking-[.12em] text-[#777887]">Resumen actualizado</p><h1 className="text-[28px] font-bold tracking-[-.7px]">Resumen general</h1><p className="mt-1 text-sm text-[#6f7080]">Tu salud financiera en una sola vista.</p></div><div className="flex items-center gap-2"><button className="flex items-center gap-2 rounded-lg border border-[#d5d4df] bg-white px-3 py-2 text-xs font-semibold text-[#555766]"><CalendarDays size={15} /> Esta quincena <ChevronDown size={14} /></button><button className="hidden rounded-lg p-2 text-[#777887] hover:bg-white sm:block" aria-label="Más opciones"><MoreVertical size={19} /></button></div></div>
      <TarjetasResumen resumen={resumen} />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]"><SeccionFlujoCaja resumen={resumen} /><PanelConsejos movimientos={movimientos} historial={historial} /></div>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]"><TablaMovimientos movimientos={movimientosFiltrados} busqueda={busqueda} filtroTipo={filtroTipo} fechaDesde={fechaDesde} fechaHasta={fechaHasta} onBusqueda={setBusqueda} onFiltro={setFiltroTipo} onFechaDesde={setFechaDesde} onFechaHasta={setFechaHasta} onExportar={exportarMovimientos} onEditar={editarMovimiento} onEliminar={eliminarMovimiento} /><div className="space-y-5"><PanelMetas /><PanelPrestamos meDeben={resumen.meDeben} yoDebo={resumen.yoDebo} /></div></div>
    </main>
    <button onClick={() => { setMovimientoEditando(undefined); setModalAbierto(true); }} className="fixed bottom-6 right-6 grid h-14 w-14 place-items-center rounded-full bg-[#293ea9] text-white shadow-xl shadow-[#293ea9]/30 transition hover:scale-105 sm:hidden" aria-label="Registrar movimiento"><Plus size={25} /></button>
    {modalAbierto && <FormularioMovimiento movimientoInicial={movimientoEditando} alCerrar={() => { setModalAbierto(false); setMovimientoEditando(undefined); }} alGuardar={guardarMovimiento} />}
    {toast && <div className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-[#1d1d26] px-4 py-3 text-sm font-semibold text-white shadow-xl" role="status">{toast}</div>}
  </div>;
}
