export type TipoMovimiento = 'gasto' | 'ingreso' | 'prestamo';
export type DireccionPrestamo = 'prestado' | 'recibido';
export type DireccionPrestamoSupabase = 'me_deben' | 'yo_debo';

export type Movimiento = {
  id: string;
  tipo: TipoMovimiento;
  monto: number;
  fecha: string;
  categoria: string;
  cuenta: string;
  cuenta_id?: string;
  concepto: string;
  direccionPrestamo?: DireccionPrestamo;
  persona?: string;
};

export type MetaAhorro = { id: string; user_id?: string; nombre: string; monto_objetivo: number; monto_actual: number };
export type TipoCuenta = 'efectivo' | 'yape' | 'plin' | 'sip' | 'banco';
export type Cuenta = { id: string; user_id?: string; nombre: string; tipo: TipoCuenta; saldo: number; color: string | null };
export type Prestamo = { id: string; user_id?: string; persona: string; monto: number; direccion: DireccionPrestamoSupabase; pagado: boolean; movimiento_id?: string };

export type ResumenFinanciero = {
  ingresos: number;
  gastos: number;
  prestamos: number;
  ahorro: number;
  proyectado: number;
  meDeben: number;
  yoDebo: number;
};
