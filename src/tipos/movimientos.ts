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

export type MetaAhorro = { id: string; user_id?: string; nombre: string; monto_objetivo: number; monto_actual: number; fecha_limite?: string | null; cuenta_id?: string | null };
export type TipoCuenta = 'efectivo' | 'yape' | 'plin' | 'sip' | 'banco';
export type Cuenta = { id: string; user_id?: string; nombre: string; tipo: TipoCuenta; saldo: number; saldo_ahorrado?: number; color: string | null };
export type Prestamo = { id: string; user_id?: string; persona: string; monto: number; direccion: DireccionPrestamoSupabase; pagado: boolean; movimiento_id?: string };
export type FrecuenciaRecurrente = 'mensual' | 'quincenal' | 'semanal';
export type GastoRecurrente = { id: string; user_id?: string; nombre: string; monto: number; frecuencia: FrecuenciaRecurrente; dia_cobro?: number | null; fecha_proximo_cobro?: string | null; categoria?: string | null; cuenta_id?: string | null; activo: boolean };
export type Transferencia = { id: string; user_id?: string; cuenta_origen_id: string; cuenta_destino_id: string; monto: number; concepto?: string | null; fecha: string; cuenta_origen?: string; cuenta_destino?: string };

export type ResumenFinanciero = {
  ingresos: number;
  gastos: number;
  prestamos: number;
  ahorro: number;
  proyectado: number;
  meDeben: number;
  yoDebo: number;
};
