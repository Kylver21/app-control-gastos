export type TipoMovimiento = 'gasto' | 'ingreso' | 'prestamo';
export type DireccionPrestamo = 'prestado' | 'recibido';

export type Movimiento = {
  id: string;
  tipo: TipoMovimiento;
  monto: number;
  fecha: string;
  categoria: string;
  cuenta: string;
  nota: string;
  direccionPrestamo?: DireccionPrestamo;
};

export type MetaAhorro = { id: string; nombre: string; actual: number; objetivo: number };
export type Prestamo = { id: string; persona: string; monto: number; direccion: DireccionPrestamo; pagado: number };

export type ResumenFinanciero = {
  ingresos: number;
  gastos: number;
  prestamos: number;
  ahorro: number;
  proyectado: number;
  meDeben: number;
  yoDebo: number;
};
