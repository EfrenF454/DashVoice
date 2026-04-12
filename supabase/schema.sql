-- ============================================================
-- App Gastos - Schema de Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- Habilitar la extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Tabla principal de gastos ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.gastos (
  id                   UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tarjeta              TEXT NOT NULL DEFAULT 'Efectivo',
  lugar                TEXT NOT NULL,
  concepto             TEXT NOT NULL,
  monto                DECIMAL(12, 2) NOT NULL CHECK (monto > 0),
  fecha                DATE NOT NULL,
  audio_transcripcion  TEXT,
  created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id              UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ── Índices para consultas rápidas ───────────────────────────
CREATE INDEX IF NOT EXISTS idx_gastos_fecha      ON public.gastos(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_gastos_user_id    ON public.gastos(user_id);
CREATE INDEX IF NOT EXISTS idx_gastos_tarjeta    ON public.gastos(tarjeta);
CREATE INDEX IF NOT EXISTS idx_gastos_concepto   ON public.gastos(concepto);
CREATE INDEX IF NOT EXISTS idx_gastos_user_fecha ON public.gastos(user_id, fecha DESC);

-- ── Trigger para updated_at ──────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER gastos_updated_at
  BEFORE UPDATE ON public.gastos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ── Row Level Security (RLS) ─────────────────────────────────
ALTER TABLE public.gastos ENABLE ROW LEVEL SECURITY;

-- Solo ver los propios gastos
CREATE POLICY "Usuarios ven sus gastos"
  ON public.gastos FOR SELECT
  USING (auth.uid() = user_id);

-- Solo insertar gastos propios
CREATE POLICY "Usuarios insertan sus gastos"
  ON public.gastos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Solo actualizar gastos propios
CREATE POLICY "Usuarios actualizan sus gastos"
  ON public.gastos FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Solo eliminar gastos propios
CREATE POLICY "Usuarios eliminan sus gastos"
  ON public.gastos FOR DELETE
  USING (auth.uid() = user_id);

-- ── Datos de ejemplo (opcional, para pruebas) ────────────────
-- INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
-- VALUES
--   ('NU',     'Pemex Insurgentes',   'Gasolina',       650.00, '2026-04-01', auth.uid()),
--   ('BBVA',   'Walmart',             'Supermercado',  1240.50, '2026-04-02', auth.uid()),
--   ('NU',     'Starbucks',           'Comida',          180.00, '2026-04-03', auth.uid()),
--   ('Efectivo','Mercado local',       'Comida',          95.00, '2026-04-04', auth.uid()),
--   ('Banamex', 'Netflix',            'Suscripciones',  219.00, '2026-04-05', auth.uid()),
--   ('BBVA',   'Farmacias del Ahorro', 'Farmacia',       340.00, '2026-04-06', auth.uid()),
--   ('NU',     'Amazon',              'Tecnología',     890.00, '2026-04-07', auth.uid()),
--   ('Efectivo','Gasolinera Shell',   'Gasolina',       580.00, '2026-04-08', auth.uid());
