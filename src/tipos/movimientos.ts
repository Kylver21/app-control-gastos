export type TipoMovimiento = 'gasto' | 'ingreso' | 'prestamo';

export type Movimiento = {
  id: string;
  tipo: TipoMovimiento;
  monto: number;
  fecha: string;
  categoria: string;
  cuenta: string;
  nota: string;
};

export type ResumenFinanciero = {
  ingresos: number;
  gastos: number;
  prestamos: number;
  ahorro: number;
  proyectado: number;
};
