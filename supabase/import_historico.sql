-- ============================================================
-- Importación de datos históricos - Control de Gastos.xlsx
-- Total de registros: 85
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- NOTA: Reemplaza <TU_USER_ID> con tu UUID de auth.users
-- ============================================================

DO $$
DECLARE
  v_user_id UUID := '89e0e51b-2e71-4719-ad64-d0848d35112b';  -- Reemplaza con tu UUID
BEGIN

  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NOMINA', 'RENTA', 'RENTA', 2360.00, '2026-04-07', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NOMINA', 'AFORE', 'AFORE', 100.00, '2026-04-06', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('AMEX', 'ALSUPER', 'SOUVENIRS', 200.40, '2026-04-04', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NU', 'OXXO', 'SOUVENIRS', 20.00, '2026-04-04', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('LikeU', 'ALSUPER', 'SOUVENIRS', 189.90, '2026-04-03', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('LikeU', 'ALSUPER', 'SOUVENIRS', 562.93, '2026-03-30', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NOMINA', 'AFORE', 'AFORE', 100.00, '2026-03-30', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NOMINA', 'CASETA', 'PEAJE', 147.00, '2026-03-29', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NOMINA', 'AUTOZONE', 'OTROS', 229.00, '2026-03-28', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NOMINA', 'DENTISTA', 'MEDICO', 600.00, '2026-03-28', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('MP', 'TELCEL', 'SERVICIOS', 20.00, '2026-03-28', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('LikeU', 'BERNARDI', 'RESTAURANTE', 212.00, '2026-03-27', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NOMINA', 'MP', 'NA', 50.00, '2026-03-27', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NOMINA', 'CASETA', 'PEAJE', 147.00, '2026-03-27', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NU', 'OXXO', 'SOUVENIRS', 23.90, '2026-03-26', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NU', 'OXXO', 'SOUVENIRS', 50.00, '2026-03-26', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NU', 'OXXO', 'SOUVENIRS', 87.00, '2026-03-26', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('MP', 'TELMEX', 'SERVICIOS', 389.00, '2026-03-26', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('AMEX', 'PENALIZACION', 'PAGOS', 475.60, '2026-03-25', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NOMINA', 'AFORE', 'AFORE', 100.00, '2026-03-23', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('LikeU', 'ALSUPER', 'SOUVENIRS', 419.00, '2026-03-22', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('LikeU', 'GUADALAJARA', 'SOUVENIRS', 47.00, '2026-03-22', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NOMINA', 'OXXO', 'SOUVENIRS', 48.50, '2026-03-21', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NU', 'OXXO', 'SOUVENIRS', 42.30, '2026-03-20', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('LikeU', 'DON BURRO', 'RESTAURANTE', 170.00, '2026-03-19', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('MP', 'CFE', 'SERVICIOS', 301.00, '2026-03-18', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NOMINA', 'AFORE', 'AFORE', 100.00, '2026-03-17', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('MP', 'MONTADOS', 'RESTAURANTE', 115.00, '2026-03-17', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('MP', 'ALSUPER', 'SOUVENIRS', 130.00, '2026-03-17', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('AMEX', 'ALSUPER', 'SOUVENIRS', 429.38, '2026-03-15', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('MP', 'ALSUPER', 'SOUVENIRS', 200.00, '2026-03-14', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NOMINA', 'MP', 'NA', 50.00, '2026-03-13', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('LikeU', 'CINE', 'OCIO', 461.00, '2026-03-11', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NU', 'TORTILLERIA', 'SOUVENIRS', 12.50, '2026-03-11', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NOMINA', 'OXXO', 'SOUVENIRS', 39.50, '2026-03-10', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('LikeU', 'GASOLINA', 'GASOLINA', 390.83, '2026-03-09', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NU', 'OXXO', 'SOUVENIRS', 27.50, '2026-03-09', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NU', 'TEMU', 'ONLINE', 740.35, '2026-03-09', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NOMINA', 'ALSUPER', 'SOUVENIRS', 93.80, '2026-03-09', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NOMINA', 'AFORE', 'AFORE', 100.00, '2026-03-09', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('MP', 'TELCEL', 'SERVICIOS', 200.00, '2026-03-08', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('MP', 'TELCEL', 'SERVICIOS', 200.00, '2026-03-08', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NU', 'DENTISTA', 'MEDICO', 600.00, '2026-03-07', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NU', 'OXXO', 'SOUVENIRS', 31.00, '2026-03-06', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('LikeU', 'ALSUPER', 'SOUVENIRS', 462.19, '2026-03-03', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NU', 'COLCHON', 'OTROS', 107.82, '2026-03-03', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NOMINA', 'OXXO', 'SOUVENIRS', 45.00, '2026-03-03', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NOMINA', 'OXXO', 'SOUVENIRS', 27.50, '2026-03-03', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('LikeU', 'WENDYS', 'RESTAURANTE', 185.00, '2026-03-02', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NU', 'TORTILLERIA', 'SOUVENIRS', 54.00, '2026-03-02', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NOMINA', 'AFORE', 'AFORE', 100.00, '2026-03-02', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('LikeU', 'MC DONALDS', 'RESTAURANTE', 129.00, '2026-03-01', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NOMINA', 'MP', 'NA', 50.00, '2026-02-27', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('LikeU', 'TROLL', 'RESTAURANTE', 680.00, '2026-02-26', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('MP', 'TELMEX', 'SERVICIOS', 389.00, '2026-02-26', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NOMINA', 'AXXA', 'SEGURO', 8026.49, '2026-02-24', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('LikeU', 'SIMILARES', 'SOUVENIRS', 20.25, '2026-02-23', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NU', 'AURRERA', 'SOUVENIRS', 158.20, '2026-02-23', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NOMINA', 'AFORE', 'AFORE', 100.00, '2026-02-23', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('MP', 'TELCEL', 'SERVICIOS', 20.00, '2026-02-23', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('AMEX', 'GASOLINA', 'GASOLINA', 798.96, '2026-02-21', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NOMINA', 'ARCHIS', 'RESTAURANTE', 110.00, '2026-02-20', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('MP', 'TELCEL', 'SERVICIOS', 20.00, '2026-02-17', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('LikeU', 'CENADURIA', 'RESTAURANTE', 310.00, '2026-02-15', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NU', 'AMAZON', 'ONLINE', 705.13, '2026-02-14', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NOMINA', 'MP', 'NA', 50.00, '2026-02-13', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('LikeU', 'YAMIYUMI', 'RESTAURANTE', 192.50, '2026-02-12', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NOMINA', 'MICA CEL', 'OTROS', 98.00, '2026-02-12', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NOMINA', 'AFORE', 'AFORE', 500.00, '2026-02-12', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NOMINA', 'BARBER', 'OTROS', 130.00, '2026-02-12', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('LikeU', 'GUADALAJARA', 'SOUVENIRS', 16.00, '2026-02-11', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('LikeU', 'GUADALAJARA', 'SOUVENIRS', 53.50, '2026-02-11', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NOMINA', 'PALETERÍA', 'SOUVENIRS', 110.00, '2026-02-11', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('LikeU', 'GUADALAJARA', 'SOUVENIRS', 49.50, '2026-02-09', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NU', 'OXXO', 'SOUVENIRS', 21.00, '2026-02-08', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NU', 'WALMART', 'SOUVENIRS', 130.00, '2026-02-08', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('LikeU', 'GUADALAJARA', 'SOUVENIRS', 54.50, '2026-02-06', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('LikeU', 'YAMIYUMI', 'RESTAURANTE', 462.00, '2026-02-06', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('MP', 'TELCEL', 'SERVICIOS', 200.00, '2026-02-06', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NU', 'OXXO', 'SOUVENIRS', 80.00, '2026-02-05', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NU', 'OXXO', 'SOUVENIRS', 22.50, '2026-02-05', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NOMINA', 'AFORE', 'AFORE', 500.00, '2026-02-05', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('LikeU', 'GUADALAJARA', 'SOUVENIRS', 33.00, '2026-02-04', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('NOMINA', 'DULCERÍA', 'SOUVENIRS', 150.24, '2026-02-02', v_user_id);
  INSERT INTO public.gastos (tarjeta, lugar, concepto, monto, fecha, user_id)
  VALUES ('MP', 'MERCADO LIBRE', 'ONLINE', 329.27, '2026-02-01', v_user_id);

END $$;
