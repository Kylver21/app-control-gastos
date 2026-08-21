import { useCallback, useState } from 'react';
import { Movimiento, Prestamo, MetaAhorro } from '@/tipos/movimientos';

const claves = {
  movimientos: 'finanzas-pro-movimientos',
  metas: 'finanzas-pro-metas',
  prestamos: 'finanzas-pro-prestamos',
  historial: 'finanzas-pro-historial-gastos',
};

function leer<T>(clave: string, valorInicial: T): T {
  try {
    const guardado = localStorage.getItem(clave);
    if (!guardado) return valorInicial;
    const valor: unknown = JSON.parse(guardado);
    return valor as T;
  } catch {
    return valorInicial;
  }
}

function escribir<T>(clave: string, valor: T): boolean {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch {
    return false;
  }
}

export function useFinanceStorage() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>(() => leer(claves.movimientos, []));
  const [metas, setMetas] = useState<MetaAhorro[]>(() => leer(claves.metas, []));
  const [prestamos, setPrestamos] = useState<Prestamo[]>(() => leer(claves.prestamos, []));
  const [historial, setHistorial] = useState<Record<string, number>[]>(() => leer(claves.historial, []));

  const guardarMovimientos = useCallback((nuevos: Movimiento[]) => {
    const guardado = escribir(claves.movimientos, nuevos);
    if (guardado) {
      setMovimientos(nuevos);
      const gastosPorCategoria = nuevos.filter((item) => item.tipo === 'gasto').reduce<Record<string, number>>((total, item) => ({ ...total, [item.categoria]: (total[item.categoria] ?? 0) + item.monto }), {});
      const nuevoHistorial = [...historial.slice(-11), gastosPorCategoria];
      if (escribir(claves.historial, nuevoHistorial)) setHistorial(nuevoHistorial);
    }
    return guardado;
  }, [historial]);

  const guardarMetas = useCallback((nuevas: MetaAhorro[]) => {
    const guardado = escribir(claves.metas, nuevas);
    if (guardado) setMetas(nuevas);
    return guardado;
  }, []);

  const guardarPrestamos = useCallback((nuevos: Prestamo[]) => {
    const guardado = escribir(claves.prestamos, nuevos);
    if (guardado) setPrestamos(nuevos);
    return guardado;
  }, []);

  return { movimientos, metas, prestamos, historial, guardarMovimientos, guardarMetas, guardarPrestamos };
}
