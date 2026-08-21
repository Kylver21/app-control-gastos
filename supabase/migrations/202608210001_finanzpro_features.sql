    alter table cuentas add column if not exists saldo_ahorrado numeric not null default 0;
    alter table metas add column if not exists fecha_limite date;
    alter table metas add column if not exists cuenta_id uuid references cuentas(id);

    create table if not exists gastos_recurrentes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    nombre text not null,
    monto numeric not null,
    frecuencia text not null check (frecuencia in ('mensual', 'quincenal', 'semanal')),
    dia_cobro integer,
    fecha_proximo_cobro date,
    categoria text,
    cuenta_id uuid references cuentas(id),
    activo boolean default true,
    created_at timestamptz default now()
    );

    alter table gastos_recurrentes add column if not exists fecha_proximo_cobro date;

    alter table gastos_recurrentes enable row level security;
    drop policy if exists users_own_recurrentes on gastos_recurrentes;
    create policy users_own_recurrentes on gastos_recurrentes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

    create table if not exists transferencias (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    cuenta_origen_id uuid references cuentas(id) not null,
    cuenta_destino_id uuid references cuentas(id) not null,
    monto numeric not null check (monto > 0),
    concepto text,
    fecha date not null default current_date,
    created_at timestamptz default now()
    );

    alter table transferencias enable row level security;
    drop policy if exists users_own_transferencias on transferencias;
    create policy users_own_transferencias on transferencias for all using (auth.uid() = user_id) with check (auth.uid() = user_id);