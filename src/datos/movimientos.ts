import { Movimiento } from '@/tipos/movimientos';

const movimientosIniciales: Movimiento[] = [];

const claveAlmacenamiento = 'finanzas-pro-movimientos';

export function cargarMovimientos(): Movimiento[] {
  const guardados = localStorage.getItem(claveAlmacenamiento);
  if (!guardados) return movimientosIniciales;
  try {
    const datos: unknown = JSON.parse(guardados);
    return Array.isArray(datos) ? (datos as Movimiento[]) : movimientosIniciales;
  } catch {
    return movimientosIniciales;
  }
}

export function guardarMovimientos(movimientos: Movimiento[]): void {
  localStorage.setItem(claveAlmacenamiento, JSON.stringify(movimientos));
}

export function crearMovimiento(datos: Omit<Movimiento, 'id'>): Movimiento {
  const id = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return { ...datos, id };
}
