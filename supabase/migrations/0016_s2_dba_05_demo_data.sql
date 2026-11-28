-- S2-DBA-05 (Issue #86): Repeatable demo seed data for customer, product, and pricehist
BEGIN;

SELECT
  set_config('request.jwt.claim.email', 'lacusclyne@hope.com', true),
  set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000001","email":"lacusclyne@hope.com","role":"admin"}', true);

-- 1. Seed 15 demo customers across valid payterm values ('COD', '30D', '45D')
--    Includes 2 soft-deleted customers: D0014, D0015 (0 active sales)
INSERT INTO public.customer (custno, custname, address, payterm, is_blocked, is_deleted)
VALUES
  ('D0001', 'Apex Builders', 'Mandaluyong City', '30D', FALSE, FALSE),
  ('D0002', 'Bayanihan Hardware', 'Manila City', 'COD', FALSE, FALSE),
  ('D0003', 'Crestline Trading', 'Pasig City', '45D', FALSE, FALSE),
  ('D0004', 'Del Monte Agri', 'Quezon City', '30D', FALSE, FALSE),
  ('D0005', 'Emerald Depot', 'Taft Ave, Manila', '30D', FALSE, FALSE),
  ('D0006', 'Falcon Logistics', 'Makati City', '45D', FALSE, FALSE),
  ('D0007', 'Golden Harvest', 'Valenzuela City', 'COD', FALSE, FALSE),
  ('D0008', 'Harborview Supply', 'Pasay City', '45D', FALSE, FALSE),
  ('D0009', 'Ironwood Const.', 'Cubao, QC', '30D', FALSE, FALSE),
  ('D0010', 'Jade Commercial', 'Binondo, Manila', 'COD', FALSE, FALSE),
  ('D0011', 'Keystone Electric', 'Gil Puyat, Makati', '45D', FALSE, FALSE),
  ('D0012', 'Lumina Solutions', 'Commonwealth, QC', '30D', FALSE, FALSE),
  ('D0013', 'Metroline Merch.', 'Espana, Manila', '45D', FALSE, FALSE),
  ('D0014', 'Northern Star', 'Novaliches, QC', 'COD', FALSE, TRUE),
  ('D0015', 'Pacific Rim Supp.', 'Chino Roces, Makati', '30D', FALSE, TRUE)
ON CONFLICT (custno) DO UPDATE
SET
  custname = EXCLUDED.custname,
  address = EXCLUDED.address,
  payterm = EXCLUDED.payterm,
  is_blocked = EXCLUDED.is_blocked,
  is_deleted = EXCLUDED.is_deleted;

-- 2. Seed 15 demo products across valid unit types ('pc', 'ea')
--    Includes 2 soft-deleted products: P0014, P0015; P0013 has no price
INSERT INTO public.product (prodcode, description, unit, is_deleted)
VALUES
  ('P0001', 'Steel Bolt M12', 'pc', FALSE),
  ('P0002', 'Packing Tape 2in', 'ea', FALSE),
  ('P0003', 'Cement Bag 40kg', 'ea', FALSE),
  ('P0004', 'Fastener Kit', 'ea', FALSE),
  ('P0005', 'Caliper Toolset', 'ea', FALSE),
  ('P0006', 'PVC Conduit 1in', 'pc', FALSE),
  ('P0007', 'Stretch Film 500mm', 'ea', FALSE),
  ('P0008', 'Galvanized Wire', 'ea', FALSE),
  ('P0009', 'LED Panel 18W', 'pc', FALSE),
  ('P0010', 'Socket Wrench Set', 'ea', FALSE),
  ('P0011', 'Safety Gloves Pair', 'pc', FALSE),
  ('P0012', 'Thermal Paper Roll', 'ea', FALSE),
  ('P0013', 'Custom Valve Unit', 'pc', FALSE),
  ('P0014', 'Legacy Copper Fit', 'pc', TRUE),
  ('P0015', 'Discontinued Label', 'ea', TRUE)
ON CONFLICT (prodcode) DO UPDATE
SET
  description = EXCLUDED.description,
  unit = EXCLUDED.unit,
  is_deleted = EXCLUDED.is_deleted;

DELETE FROM public.pricehist
WHERE prodcode = 'P0013';

-- 3. Seed multi-date price histories matching PK (prodcode, effdate); P0013 has no price
INSERT INTO public.pricehist (prodcode, unitprice, effdate, is_deleted)
VALUES
  ('P0001', 12.00, (CURRENT_DATE - INTERVAL '60 days')::date, FALSE),
  ('P0001', 15.00, (CURRENT_DATE - INTERVAL '10 days')::date, FALSE),
  ('P0002', 42.00, (CURRENT_DATE - INTERVAL '45 days')::date, FALSE),
  ('P0002', 45.00, (CURRENT_DATE - INTERVAL '5 days')::date, FALSE),
  ('P0003', 230.00, (CURRENT_DATE - INTERVAL '30 days')::date, FALSE),
  ('P0003', 245.00, CURRENT_DATE, FALSE),
  ('P0004', 310.00, (CURRENT_DATE - INTERVAL '20 days')::date, FALSE),
  ('P0005', 850.00, (CURRENT_DATE - INTERVAL '40 days')::date, FALSE),
  ('P0005', 890.00, (CURRENT_DATE - INTERVAL '3 days')::date, FALSE),
  ('P0005', 950.00, (CURRENT_DATE + INTERVAL '14 days')::date, FALSE),
  ('P0006', 68.00, (CURRENT_DATE - INTERVAL '15 days')::date, FALSE),
  ('P0007', 175.00, (CURRENT_DATE - INTERVAL '7 days')::date, FALSE),
  ('P0008', 95.00, (CURRENT_DATE - INTERVAL '25 days')::date, FALSE),
  ('P0009', 1120.00, (CURRENT_DATE - INTERVAL '30 days')::date, FALSE),
  ('P0009', 1250.00, (CURRENT_DATE + INTERVAL '21 days')::date, FALSE),
  ('P0010', 640.00, (CURRENT_DATE - INTERVAL '12 days')::date, FALSE),
  ('P0010', 680.00, (CURRENT_DATE + INTERVAL '10 days')::date, FALSE),
  ('P0011', 55.00, (CURRENT_DATE - INTERVAL '8 days')::date, FALSE),
  ('P0011', 62.00, (CURRENT_DATE + INTERVAL '30 days')::date, FALSE),
  ('P0012', 38.00, (CURRENT_DATE - INTERVAL '18 days')::date, FALSE),
  ('P0012', 41.00, (CURRENT_DATE + INTERVAL '7 days')::date, FALSE),
  ('P0014', 80.00, (CURRENT_DATE - INTERVAL '90 days')::date, TRUE),
  ('P0015', 200.00, (CURRENT_DATE - INTERVAL '90 days')::date, TRUE)
ON CONFLICT (prodcode, effdate) DO UPDATE
SET
  unitprice = EXCLUDED.unitprice,
  is_deleted = EXCLUDED.is_deleted;

COMMIT;
