import { FormEvent, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, HandCoins, Plus, X } from 'lucide-react';
import { Movimiento, TipoMovimiento } from '@/tipos/movimientos';

type Props = {
  alCerrar: () => void;
  alGuardar: (datos: Omit<Movimiento, 'id'>) => void;
};

const categorias: Record<TipoMovimiento, string[]> = {
  gasto: ['Alimentación', 'Transporte', 'Vivienda', 'Entretenimiento', 'Cuidado personal', 'Gastos hormiga'],
  ingreso: ['Ingreso fijo', 'Ingreso extra', 'Reembolso'],
  prestamo: ['Préstamo familiar', 'Préstamo personal'],
};

const cuentas = ['Cuenta principal', 'Tarjeta terminada en 42', 'Billetera digital', 'Efectivo', 'Ahorro'];

export function FormularioMovimiento({ alCerrar, alGuardar }: Props) {
  const [tipo, setTipo] = useState<TipoMovimiento>('gasto');
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [categoria, setCategoria] = useState('');
  const [cuenta, setCuenta] = useState('');
  const [nota, setNota] = useState('');
  const [error, setError] = useState('');

  const categoriasActivas = useMemo(() => categorias[tipo], [tipo]);

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!monto || Number(monto) <= 0 || !categoria || !cuenta || !nota.trim()) {
      setError('Completa el monto, categoría, cuenta y concepto para guardar.');
      return;
    }

    alGuardar({
      tipo,
      monto: Number(monto),
      fecha,
      categoria,
      cuenta,
      nota: nota.trim(),
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1d1d26]/45 p-3 backdrop-blur-sm sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={alCerrar}
    >
      <div
        className="w-full max-w-[680px] overflow-hidden rounded-[22px] bg-white shadow-[0_30px_80px_rgba(29,29,38,0.25)] ring-1 ring-[#e6e5ee]"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#e9e8f0] px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#293ea9] text-white shadow-lg shadow-[#293ea9]/25">
              <Plus size={20} />
            </div>
            <h2 className="text-base font-bold text-[#1d1d26] sm:text-lg">Registrar nuevo movimiento</h2>
          </div>

          <button
            type="button"
            onClick={alCerrar}
            className="grid h-10 w-10 place-items-center rounded-xl text-[#666775] transition hover:bg-[#f4f4f8] hover:text-[#1d1d26]"
            aria-label="Cerrar formulario"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[calc(92vh-88px)] overflow-y-auto p-4 sm:p-6">
          <form onSubmit={enviar} className="space-y-5">
            <fieldset>
              <legend className="mb-3 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#5c5c6b]">
                Tipo de movimiento
              </legend>

              <div className="grid grid-cols-3 gap-3">
                {([
                  ['gasto', 'Gasto', ArrowDown],
                  ['ingreso', 'Ingreso', ArrowUp],
                  ['prestamo', 'Préstamo', HandCoins],
                ] as const).map(([valor, etiqueta, Icono]) => (
                  <button
                    type="button"
                    key={valor}
                    aria-pressed={tipo === valor}
                    onClick={() => {
                      setTipo(valor);
                      setCategoria('');
                    }}
                    className={`min-h-[72px] rounded-2xl border-2 px-3 py-3 text-center transition-all duration-200 ${
                      tipo === valor
                        ? valor === 'gasto'
                          ? 'border-[#c83235] bg-[#fff5f5] shadow-sm'
                          : valor === 'ingreso'
                            ? 'border-[#00805e] bg-[#f0fbf6] shadow-sm'
                            : 'border-[#293ea9] bg-[#f3f4ff] shadow-sm'
                        : 'border-[#e0dfe8] bg-white hover:border-[#b9b7c7]'
                    }`}
                  >
                    <Icono
                      size={21}
                      className={`mx-auto mb-2 ${
                        valor === 'gasto'
                          ? 'text-[#c83235]'
                          : valor === 'ingreso'
                            ? 'text-[#00805e]'
                            : 'text-[#293ea9]'
                      }`}
                    />
                    <span className="text-xs font-semibold text-[#2b2c36]">{etiqueta}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
              <Campo etiqueta="Monto">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#777887]">S/</span>
                  <input
                    required
                    value={monto}
                    onChange={(evento) => setMonto(evento.target.value)}
                    type="number"
                    min="0.01"
                    step="0.01"
                    inputMode="decimal"
                    placeholder="0.00"
                    className="campo pl-10 pr-3"
                  />
                </div>
                <p className="mt-1 text-[11px] text-[#8a8b97]">Ingresa el valor numérico exacto.</p>
              </Campo>

              <Campo etiqueta="Fecha">
                <input
                  required
                  value={fecha}
                  onChange={(evento) => setFecha(evento.target.value)}
                  type="date"
                  className="campo"
                />
              </Campo>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Campo etiqueta="Categoría">
                <select
                  required
                  value={categoria}
                  onChange={(evento) => setCategoria(evento.target.value)}
                  className="campo appearance-none pr-10"
                >
                  <option value="">Selecciona una categoría</option>
                  {categoriasActivas.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Campo>

              <Campo etiqueta="Cuenta de origen">
                <select
                  required
                  value={cuenta}
                  onChange={(evento) => setCuenta(evento.target.value)}
                  className="campo appearance-none pr-10"
                >
                  <option value="">Selecciona cuenta</option>
                  {cuentas.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Campo>
            </div>

            <Campo etiqueta="Concepto">
              <textarea
                required
                rows={3}
                value={nota}
                onChange={(evento) => setNota(evento.target.value)}
                placeholder="Ej. Supermercado, nómina, préstamo a Carlos..."
                className="campo min-h-[96px] resize-none py-3"
              />
            </Campo>

            {error && (
              <p className="rounded-xl border border-[#f7c2c8] bg-[#fff1f2] px-3 py-2 text-sm text-[#b3262d]">
                {error}
              </p>
            )}

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={alCerrar}
                className="h-12 rounded-xl border border-[#d9d9e4] bg-white px-5 text-sm font-semibold text-[#4b4d5b] transition hover:bg-[#f5f5fa]"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="h-12 rounded-xl bg-[#293ea9] px-5 text-sm font-semibold text-white shadow-lg shadow-[#293ea9]/25 transition hover:bg-[#233794]"
              >
                Guardar movimiento
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Campo({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#5c5c6b]">
        {etiqueta}
      </span>
      {children}
    </label>
  );
}

