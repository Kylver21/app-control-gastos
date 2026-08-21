import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Movimiento } from '@/tipos/movimientos';
import { moneda } from '@/utilidades/formato';

type Rango = '14dias' | 'quincena' | 'mes' | 'tres-meses' | 'ano';
type PuntoFlujo = { clave: string; etiqueta: string; ingresos: number; gastos: number; balance: number };

type Props = { movimientos: Movimiento[]; cargando?: boolean; onNuevoMovimiento: () => void };

const formatterMoneda = (valor: number) => moneda(valor);

function fechaLocal(fecha: Date) {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function inicioRango(rango: Rango, ahora: Date) {
  const inicio = new Date(ahora);
  if (rango === '14dias') inicio.setDate(inicio.getDate() - 13);
  if (rango === 'mes') inicio.setMonth(inicio.getMonth() - 1);
  if (rango === 'tres-meses') inicio.setMonth(inicio.getMonth() - 3);
  if (rango === 'ano') inicio.setMonth(0, 1);
  if (rango === 'quincena') inicio.setDate(ahora.getDate() <= 15 ? 1 : 16);
  return inicio;
}

function etiquetaDia(clave: string) {
  return new Date(`${clave}T12:00:00`).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }).replace('.', '');
}

function obtenerClaveSemana(fecha: Date) {
  const inicio = new Date(fecha);
  const dia = inicio.getDay() || 7;
  inicio.setDate(inicio.getDate() - dia + 1);
  return fechaLocal(inicio);
}

function agruparMovimientos(movimientos: Movimiento[], rango: Rango): PuntoFlujo[] {
  const ahora = new Date();
  const inicio = inicioRango(rango, ahora);
  const fin = fechaLocal(ahora);
  const agruparPorMes = rango === 'ano';
  const agruparPorSemana = rango === 'tres-meses';
  const claves: string[] = [];
  const cursor = new Date(inicio);

  while (fechaLocal(cursor) <= fin) {
    const clave = agruparPorMes
      ? `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`
      : agruparPorSemana
        ? obtenerClaveSemana(cursor)
        : fechaLocal(cursor);
    if (!claves.includes(clave)) claves.push(clave);
    if (agruparPorMes) cursor.setMonth(cursor.getMonth() + 1, 1);
    else cursor.setDate(cursor.getDate() + 1);
  }

  const acumulados = new Map<string, { ingresos: number; gastos: number }>();
  claves.forEach((clave) => acumulados.set(clave, { ingresos: 0, gastos: 0 }));

  movimientos.forEach((movimiento) => {
    if (movimiento.tipo === 'prestamo') return;
    const fecha = new Date(`${movimiento.fecha}T12:00:00`);
    if (fecha < inicio || movimiento.fecha > fin) return;
    const clave = agruparPorMes
      ? `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
      : agruparPorSemana
        ? obtenerClaveSemana(fecha)
        : movimiento.fecha;
    const acumulado = acumulados.get(clave);
    if (!acumulado) return;
    acumulado[movimiento.tipo === 'ingreso' ? 'ingresos' : 'gastos'] += movimiento.monto;
  });

  return claves.map((clave) => {
    const valores = acumulados.get(clave) ?? { ingresos: 0, gastos: 0 };
    const fecha = new Date(`${clave}${agruparPorMes ? '-01' : 'T12:00:00'}`);
    const etiqueta = agruparPorMes
      ? fecha.toLocaleDateString('es-PE', { month: 'short' }).replace('.', '')
      : agruparPorSemana
        ? `Sem. ${fecha.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }).replace('.', '')}`
        : etiquetaDia(clave);
    return { clave, etiqueta, ...valores, balance: valores.ingresos - valores.gastos };
  });
}

function TooltipFlujo({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey?: string; value?: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const ingresos = payload.find((item) => item.dataKey === 'ingresos')?.value ?? 0;
  const gastos = payload.find((item) => item.dataKey === 'gastos')?.value ?? 0;
  const balance = payload.find((item) => item.dataKey === 'balance')?.value ?? 0;
  return <div className="rounded-xl border border-[#dedde8] bg-white p-3 text-xs shadow-xl"><p className="mb-2 font-bold text-[#30313c]">{label}</p><p className="text-[#059669]">Ingresos: {formatterMoneda(ingresos)}</p><p className="text-[#ef4444]">Gastos: {formatterMoneda(gastos)}</p><p className={`mt-1 border-t pt-1 font-semibold ${balance >= 0 ? 'text-[#293ea9]' : 'text-[#c52c2f]'}`}>Balance: {formatterMoneda(balance)}</p></div>;
}

export function GraficoFlujo({ movimientos, cargando = false, onNuevoMovimiento }: Props) {
  const [rango, setRango] = useState<Rango>('14dias');
  const [esMobile, setEsMobile] = useState(false);
  const datos = useMemo(() => agruparMovimientos(movimientos, rango), [movimientos, rango]);
  const hayMovimientos = datos.some((punto) => punto.ingresos > 0 || punto.gastos > 0);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const actualizar = () => setEsMobile(media.matches);
    actualizar();
    media.addEventListener('change', actualizar);
    return () => media.removeEventListener('change', actualizar);
  }, []);

  return <div>
    <div className="mb-4 flex justify-end"><label className="sr-only" htmlFor="rango-flujo">Rango del gráfico</label><select id="rango-flujo" value={rango} onChange={(event) => setRango(event.target.value as Rango)} className="h-9 rounded-lg border border-[#dddde7] bg-white px-3 text-xs font-semibold text-[#555766] outline-none focus:border-[#293ea9]"><option value="14dias">Últimos 14 días</option><option value="quincena">Esta quincena</option><option value="mes">Último mes</option><option value="tres-meses">Últimos 3 meses</option><option value="ano">Este año</option></select></div>
    {cargando ? <div className="h-[280px] animate-pulse rounded-xl bg-[#f1f1f7]" aria-label="Cargando gráfico" /> : !hayMovimientos ? <div className="grid min-h-[280px] place-items-center rounded-xl bg-[#fafaff] px-6 text-center"><div><p className="text-sm text-[#777887]">Sin movimientos en este período. Registra tu primer movimiento para ver el gráfico.</p><button onClick={onNuevoMovimiento} className="mt-4 rounded-lg bg-[#293ea9] px-4 py-2 text-xs font-bold text-white shadow-md shadow-[#293ea9]/20">Registrar movimiento</button></div></div> : <div className="h-[280px] w-full animate-chart-in"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={datos} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}><CartesianGrid stroke="#e8e7ee" vertical={false} /><XAxis dataKey="etiqueta" tick={{ fontSize: 10, fill: '#92929f' }} interval={esMobile ? 2 : 0} tickLine={false} axisLine={{ stroke: '#d7d6e0' }} /><YAxis yAxisId="montos" tick={{ fontSize: 10, fill: '#92929f' }} tickFormatter={(value) => `${Math.round(value / 1000)}k`} tickLine={false} axisLine={false} /><YAxis yAxisId="balance" orientation="right" hide domain={['auto', 'auto']} /><Tooltip content={<TooltipFlujo />} /><Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} /><Bar yAxisId="montos" dataKey="ingresos" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} animationDuration={700} /><Bar yAxisId="montos" dataKey="gastos" name="Gastos" fill="#f87171" radius={[4, 4, 0, 0]} animationDuration={700} /><Line yAxisId="balance" type="monotone" dataKey="balance" name="Balance neto" stroke="#293ea9" strokeWidth={2.5} dot={false} animationDuration={900} /></ComposedChart></ResponsiveContainer></div>}
  </div>;
}
