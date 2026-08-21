import { useCallback, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Cuenta, GastoRecurrente, MetaAhorro, Movimiento, Prestamo, Transferencia } from '@/tipos/movimientos';

type Toast = { tipo: 'exito' | 'error'; mensaje: string } | null;
type MovimientoEntrada = Omit<Movimiento, 'id' | 'cuenta'> & { cuenta_id: string; cuenta?: string; persona?: string };

function mostrarError(error: unknown) {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
}

function direccionParaBase(datos: MovimientoEntrada) {
  return datos.direccionPrestamo === 'prestado' ? 'me_deben' : 'yo_debo';
}

function cambioSaldo(tipo: Movimiento['tipo'], monto: number, direccion?: Movimiento['direccionPrestamo']) {
  if (tipo === 'ingreso') return monto;
  if (tipo === 'gasto') return -monto;
  return direccion === 'recibido' ? monto : -monto;
}

export function useFinanceStorage(user: User | null) {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [metas, setMetas] = useState<MetaAhorro[]>([]);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [recurrentes, setRecurrentes] = useState<GastoRecurrente[]>([]);
  const [transferencias, setTransferencias] = useState<Transferencia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [toast, setToast] = useState<Toast>(null);

  const notificar = useCallback((tipo: 'exito' | 'error', mensaje: string) => {
    setToast({ tipo, mensaje });
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  const cargarDatos = useCallback(async () => {
    if (!user) {
      setMovimientos([]);
      setCuentas([]);
      setMetas([]);
      setPrestamos([]);
      setRecurrentes([]);
      setTransferencias([]);
      setCargando(false);
      return;
    }

    setCargando(true);
    try {
      const [movimientosResult, cuentasResult, metasResult, prestamosResult, recurrentesResult, transferenciasResult] = await Promise.all([
        supabase.from('movimientos').select('*, cuentas(nombre)').eq('user_id', user.id).order('fecha', { ascending: false }),
        supabase.from('cuentas').select('*').eq('user_id', user.id).order('created_at'),
        supabase.from('metas').select('*').eq('user_id', user.id).order('created_at'),
        supabase.from('prestamos').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('gastos_recurrentes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('transferencias').select('*, origen:cuentas!transferencias_cuenta_origen_id_fkey(nombre), destino:cuentas!transferencias_cuenta_destino_id_fkey(nombre)').eq('user_id', user.id).order('fecha', { ascending: false }).limit(10),
      ]);
      if (movimientosResult.error) throw movimientosResult.error;
      if (cuentasResult.error) throw cuentasResult.error;
      if (metasResult.error) throw metasResult.error;
      if (prestamosResult.error) throw prestamosResult.error;
      if (recurrentesResult.error) throw recurrentesResult.error;
      if (transferenciasResult.error) throw transferenciasResult.error;

      const prestamosCargados = (prestamosResult.data ?? []) as Prestamo[];
      const porMovimiento = new Map(prestamosCargados.map((item) => [item.movimiento_id, item]));
      setMovimientos((movimientosResult.data ?? []).map((item) => {
        const prestamo = porMovimiento.get(item.id);
        return { ...item, concepto: item.concepto ?? '', cuenta: (item.cuentas as { nombre?: string } | null)?.nombre ?? '', cuenta_id: item.cuenta_id, direccionPrestamo: prestamo?.direccion === 'me_deben' ? 'prestado' : prestamo?.direccion === 'yo_debo' ? 'recibido' : undefined, persona: prestamo?.persona };
      }) as Movimiento[]);
      setCuentas((cuentasResult.data ?? []) as Cuenta[]);
      setMetas((metasResult.data ?? []) as MetaAhorro[]);
      setPrestamos(prestamosCargados);
      setRecurrentes((recurrentesResult.data ?? []) as GastoRecurrente[]);
      setTransferencias((transferenciasResult.data ?? []).map((item) => ({ ...item, cuenta_origen: (item.origen as { nombre?: string } | null)?.nombre, cuenta_destino: (item.destino as { nombre?: string } | null)?.nombre })) as Transferencia[]);
    } catch (error) {
      notificar('error', `No se pudieron cargar tus datos: ${mostrarError(error)}`);
    } finally {
      setCargando(false);
    }
  }, [notificar, user]);

  useEffect(() => { void cargarDatos(); }, [cargarDatos]);

  useEffect(() => {
    if (!user) return;
    const canal = supabase.channel(`finanzpro-${user.id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'movimientos', filter: `user_id=eq.${user.id}` }, () => void cargarDatos()).on('postgres_changes', { event: '*', schema: 'public', table: 'cuentas', filter: `user_id=eq.${user.id}` }, () => void cargarDatos()).on('postgres_changes', { event: '*', schema: 'public', table: 'prestamos', filter: `user_id=eq.${user.id}` }, () => void cargarDatos()).on('postgres_changes', { event: '*', schema: 'public', table: 'gastos_recurrentes', filter: `user_id=eq.${user.id}` }, () => void cargarDatos()).on('postgres_changes', { event: '*', schema: 'public', table: 'transferencias', filter: `user_id=eq.${user.id}` }, () => void cargarDatos()).subscribe();
    return () => { void supabase.removeChannel(canal); };
  }, [cargarDatos, user]);

  const agregarCuenta = useCallback(async (datos: Omit<Cuenta, 'id' | 'user_id'>) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('cuentas').insert({ ...datos, user_id: user.id });
      if (error) throw error;
      notificar('exito', 'Cuenta agregada correctamente.');
      await cargarDatos();
    } catch (error) { notificar('error', `No se pudo agregar la cuenta: ${mostrarError(error)}`); }
  }, [cargarDatos, notificar, user]);

  const actualizarSaldoCuenta = useCallback(async (cuentaId: string, variacion: number) => {
    const cuentaActual = cuentas.find((item) => item.id === cuentaId);
    if (!cuentaActual) throw new Error('La cuenta seleccionada no existe.');
    const { error } = await supabase.from('cuentas').update({ saldo: cuentaActual.saldo + variacion }).eq('id', cuentaId).eq('user_id', user?.id);
    if (error) throw error;
  }, [cuentas, user?.id]);

  const realizarTransferencia = useCallback(async (cuentaOrigenId: string, cuentaDestinoId: string, monto: number, concepto: string, fecha: string) => {
    if (!user) return;
    const origen = cuentas.find((cuenta) => cuenta.id === cuentaOrigenId);
    const destino = cuentas.find((cuenta) => cuenta.id === cuentaDestinoId);
    if (!origen || !destino) { notificar('error', 'Selecciona cuentas válidas.'); return; }
    if (origen.saldo < monto) { notificar('error', `Saldo insuficiente en ${origen.nombre}`); return; }
    try {
      const [origenResult, destinoResult, transferenciaResult] = await Promise.all([
        supabase.from('cuentas').update({ saldo: origen.saldo - monto }).eq('id', origen.id).eq('user_id', user.id),
        supabase.from('cuentas').update({ saldo: destino.saldo + monto }).eq('id', destino.id).eq('user_id', user.id),
        supabase.from('transferencias').insert({ user_id: user.id, cuenta_origen_id: origen.id, cuenta_destino_id: destino.id, monto, concepto: concepto || null, fecha }),
      ]);
      if (origenResult.error) throw origenResult.error;
      if (destinoResult.error) throw destinoResult.error;
      if (transferenciaResult.error) throw transferenciaResult.error;
      notificar('exito', `Transferencia realizada: ${monedaToast(monto)} de ${origen.nombre} a ${destino.nombre}`);
      await cargarDatos();
    } catch (error) { notificar('error', `No se pudo realizar la transferencia: ${mostrarError(error)}`); }
  }, [cargarDatos, cuentas, notificar, user]);

  const agregarMovimiento = useCallback(async (datos: MovimientoEntrada) => {
    if (!user) return;
    try {
      const { data: movimiento, error } = await supabase.from('movimientos').insert({ user_id: user.id, tipo: datos.tipo, monto: datos.monto, fecha: datos.fecha, categoria: datos.categoria, cuenta_id: datos.cuenta_id, concepto: datos.concepto }).select().single();
      if (error) throw error;
      await actualizarSaldoCuenta(datos.cuenta_id, cambioSaldo(datos.tipo, datos.monto, datos.direccionPrestamo));
      if (datos.tipo === 'prestamo') {
        const { error: prestamoError } = await supabase.from('prestamos').insert({ user_id: user.id, movimiento_id: movimiento.id, persona: datos.persona ?? datos.concepto, monto: datos.monto, direccion: direccionParaBase(datos), pagado: false });
        if (prestamoError) throw prestamoError;
      }
      notificar('exito', 'Movimiento guardado correctamente.');
      await cargarDatos();
    } catch (error) { notificar('error', `No se pudo guardar el movimiento: ${mostrarError(error)}`); }
  }, [actualizarSaldoCuenta, cargarDatos, notificar, user]);

  const editarMovimiento = useCallback(async (id: string, datos: MovimientoEntrada, anterior: Movimiento) => {
    if (!user) return;
    try {
      await actualizarSaldoCuenta(anterior.cuenta_id ?? '', -cambioSaldo(anterior.tipo, anterior.monto, anterior.direccionPrestamo));
      await actualizarSaldoCuenta(datos.cuenta_id, cambioSaldo(datos.tipo, datos.monto, datos.direccionPrestamo));
      const { error } = await supabase.from('movimientos').update({ tipo: datos.tipo, monto: datos.monto, fecha: datos.fecha, categoria: datos.categoria, cuenta_id: datos.cuenta_id, concepto: datos.concepto }).eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      if (anterior.tipo === 'prestamo') await supabase.from('prestamos').delete().eq('movimiento_id', id).eq('user_id', user.id);
      if (datos.tipo === 'prestamo') await supabase.from('prestamos').insert({ user_id: user.id, movimiento_id: id, persona: datos.persona ?? datos.concepto, monto: datos.monto, direccion: direccionParaBase(datos), pagado: false });
      notificar('exito', 'Movimiento actualizado correctamente.');
      await cargarDatos();
    } catch (error) { notificar('error', `No se pudo editar el movimiento: ${mostrarError(error)}`); }
  }, [actualizarSaldoCuenta, cargarDatos, notificar, user]);

  const eliminarMovimiento = useCallback(async (movimiento: Movimiento) => {
    if (!user) return;
    try {
      await actualizarSaldoCuenta(movimiento.cuenta_id ?? '', -cambioSaldo(movimiento.tipo, movimiento.monto, movimiento.direccionPrestamo));
      const { error } = await supabase.from('movimientos').delete().eq('id', movimiento.id).eq('user_id', user.id);
      if (error) throw error;
      notificar('exito', 'Movimiento eliminado.');
      await cargarDatos();
    } catch (error) { notificar('error', `No se pudo eliminar el movimiento: ${mostrarError(error)}`); }
  }, [actualizarSaldoCuenta, cargarDatos, notificar, user]);

  const agregarRecurrente = useCallback(async (datos: Omit<GastoRecurrente, 'id' | 'user_id'>) => {
    if (!user) return;
    try { const { error } = await supabase.from('gastos_recurrentes').insert({ ...datos, user_id: user.id }); if (error) throw error; notificar('exito', 'Gasto recurrente agregado.'); await cargarDatos(); } catch (error) { notificar('error', `No se pudo agregar: ${mostrarError(error)}`); }
  }, [cargarDatos, notificar, user]);

  const actualizarRecurrente = useCallback(async (id: string, datos: Partial<GastoRecurrente>) => {
    try { const { error } = await supabase.from('gastos_recurrentes').update(datos).eq('id', id).eq('user_id', user?.id); if (error) throw error; await cargarDatos(); } catch (error) { notificar('error', `No se pudo actualizar: ${mostrarError(error)}`); }
  }, [cargarDatos, notificar, user?.id]);

  const eliminarRecurrente = useCallback(async (id: string) => {
    try { const { error } = await supabase.from('gastos_recurrentes').delete().eq('id', id).eq('user_id', user?.id); if (error) throw error; notificar('exito', 'Gasto recurrente eliminado.'); await cargarDatos(); } catch (error) { notificar('error', `No se pudo eliminar: ${mostrarError(error)}`); }
  }, [cargarDatos, notificar, user?.id]);

  const agregarMeta = useCallback(async (datos: Omit<MetaAhorro, 'id' | 'user_id'>) => {
    if (!user) return;
    try { const { error } = await supabase.from('metas').insert({ ...datos, user_id: user.id }); if (error) throw error; notificar('exito', 'Meta creada correctamente.'); await cargarDatos(); } catch (error) { notificar('error', `No se pudo crear la meta: ${mostrarError(error)}`); }
  }, [cargarDatos, notificar, user]);

  const abonarMeta = useCallback(async (meta: MetaAhorro, cuentaId: string, monto: number) => {
    if (!user || monto <= 0) return;
    try {
      const cuentaActual = cuentas.find((item) => item.id === cuentaId);
      if (!cuentaActual || cuentaActual.saldo < monto) throw new Error('La cuenta no tiene saldo suficiente.');
      const { error: metaError } = await supabase.from('metas').update({ monto_actual: Math.min(meta.monto_objetivo, meta.monto_actual + monto) }).eq('id', meta.id).eq('user_id', user.id);
      if (metaError) throw metaError;
      await actualizarSaldoCuenta(cuentaId, -monto);
      notificar('exito', 'Abono realizado correctamente.');
      await cargarDatos();
    } catch (error) { notificar('error', `No se pudo abonar: ${mostrarError(error)}`); }
  }, [actualizarSaldoCuenta, cargarDatos, cuentas, notificar, user]);

  const eliminarMeta = useCallback(async (id: string) => {
    if (!user) return;
    try { const { error } = await supabase.from('metas').delete().eq('id', id).eq('user_id', user.id); if (error) throw error; notificar('exito', 'Meta eliminada.'); await cargarDatos(); } catch (error) { notificar('error', `No se pudo eliminar la meta: ${mostrarError(error)}`); }
  }, [cargarDatos, notificar, user]);

  const actualizarMeta = useCallback(async (id: string, datos: Partial<MetaAhorro>) => {
    if (!user) return;
    try { const { error } = await supabase.from('metas').update(datos).eq('id', id).eq('user_id', user.id); if (error) throw error; notificar('exito', 'Meta actualizada.'); await cargarDatos(); } catch (error) { notificar('error', `No se pudo actualizar la meta: ${mostrarError(error)}`); }
  }, [cargarDatos, notificar, user]);

  return { movimientos, cuentas, metas, prestamos, recurrentes, transferencias, cargando, toast, agregarMovimiento, editarMovimiento, eliminarMovimiento, agregarCuenta, actualizarSaldoCuenta, realizarTransferencia, agregarRecurrente, actualizarRecurrente, eliminarRecurrente, agregarMeta, actualizarMeta, abonarMeta, eliminarMeta, recargar: cargarDatos };
}

function monedaToast(valor: number) { return `S/${valor.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
