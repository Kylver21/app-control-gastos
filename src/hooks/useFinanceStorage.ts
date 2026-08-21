import { useCallback, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Cuenta, MetaAhorro, Movimiento, Prestamo } from '@/tipos/movimientos';

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
      setCargando(false);
      return;
    }

    setCargando(true);
    try {
      const [movimientosResult, cuentasResult, metasResult, prestamosResult] = await Promise.all([
        supabase.from('movimientos').select('*, cuentas(nombre)').eq('user_id', user.id).order('fecha', { ascending: false }),
        supabase.from('cuentas').select('*').eq('user_id', user.id).order('created_at'),
        supabase.from('metas').select('*').eq('user_id', user.id).order('created_at'),
        supabase.from('prestamos').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);
      if (movimientosResult.error) throw movimientosResult.error;
      if (cuentasResult.error) throw cuentasResult.error;
      if (metasResult.error) throw metasResult.error;
      if (prestamosResult.error) throw prestamosResult.error;

      const prestamosCargados = (prestamosResult.data ?? []) as Prestamo[];
      const porMovimiento = new Map(prestamosCargados.map((item) => [item.movimiento_id, item]));
      setMovimientos((movimientosResult.data ?? []).map((item) => {
        const prestamo = porMovimiento.get(item.id);
        return { ...item, concepto: item.concepto ?? '', cuenta: (item.cuentas as { nombre?: string } | null)?.nombre ?? '', cuenta_id: item.cuenta_id, direccionPrestamo: prestamo?.direccion === 'me_deben' ? 'prestado' : prestamo?.direccion === 'yo_debo' ? 'recibido' : undefined, persona: prestamo?.persona };
      }) as Movimiento[]);
      setCuentas((cuentasResult.data ?? []) as Cuenta[]);
      setMetas((metasResult.data ?? []) as MetaAhorro[]);
      setPrestamos(prestamosCargados);
    } catch (error) {
      notificar('error', `No se pudieron cargar tus datos: ${mostrarError(error)}`);
    } finally {
      setCargando(false);
    }
  }, [notificar, user]);

  useEffect(() => { void cargarDatos(); }, [cargarDatos]);

  useEffect(() => {
    if (!user) return;
    const canal = supabase.channel(`finanzpro-${user.id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'movimientos', filter: `user_id=eq.${user.id}` }, () => void cargarDatos()).on('postgres_changes', { event: '*', schema: 'public', table: 'cuentas', filter: `user_id=eq.${user.id}` }, () => void cargarDatos()).on('postgres_changes', { event: '*', schema: 'public', table: 'prestamos', filter: `user_id=eq.${user.id}` }, () => void cargarDatos()).subscribe();
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

  return { movimientos, cuentas, metas, prestamos, cargando, toast, agregarMovimiento, editarMovimiento, eliminarMovimiento, agregarCuenta, actualizarSaldoCuenta, recargar: cargarDatos };
}
