alter table prestamos add column if not exists fecha date default current_date;
alter table prestamos add column if not exists cuenta_id uuid references cuentas(id);
alter table gastos_recurrentes add column if not exists tipo text not null default 'gasto';
alter table gastos_recurrentes drop constraint if exists gastos_recurrentes_tipo_check;
alter table gastos_recurrentes add constraint gastos_recurrentes_tipo_check check (tipo in ('gasto', 'ingreso'));