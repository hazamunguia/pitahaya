-- PITAHAYA · datos de ejemplo (precios y textos editables después desde el panel).
-- Pégalo en Supabase → SQL Editor → New query → Run.

insert into public.services (slug, nombre, descripcion, duracion_min, precio_base, admite_diseno, orden) values
  ('mani', 'Manicure clásico', 'Limado, cutícula e hidratación con esmalte tradicional.', 45, 200, true, 1),
  ('gel', 'Manicure en gel', 'Color de larga duración con brillo espejo hasta por 3 semanas.', 60, 320, true, 2),
  ('acri', 'Uñas acrílicas', 'Extensión y forma a tu gusto, lista para lucir un diseño.', 120, 550, true, 3),
  ('pedi', 'Pedicure spa', 'Exfoliación, masaje y esmaltado para unos pies de revista.', 75, 380, true, 4),
  ('lift', 'Lifting de pestañas', 'Curvatura y definición natural que dura semanas.', 60, 450, false, 5),
  ('cejas', 'Cejas', 'Diseño y laminado para enmarcar tu mirada.', 45, 350, false, 6);

insert into public.designs (nombre, precio_extra, minutos_extra, orden) values
  ('Rosa liso', 0, 0, 1),
  ('Francés', 40, 0, 2),
  ('Degradado', 60, 0, 3),
  ('Mármol', 80, 0, 4),
  ('Glitter', 70, 0, 5),
  ('Minimal', 50, 0, 6),
  ('Ojo de gato', 90, 0, 7),
  ('Floral', 100, 0, 8);

insert into public.skin_tones (nombre, hex, subtono, orden) values
  ('Muy claro', '#f8dfd0', 'frío', 1),
  ('Claro', '#f0c9a8', 'neutro', 2),
  ('Medio claro', '#e3ad84', 'cálido', 3),
  ('Medio', '#c98a5e', 'cálido', 4),
  ('Medio oscuro', '#a56a43', 'neutro', 5),
  ('Oscuro', '#7a4a2e', 'cálido', 6),
  ('Muy oscuro', '#55311f', 'frío', 7);

insert into public.tone_colors (tone_id, nombre, hex, orden)
select t.id, c.nombre, c.hex, c.orden from public.skin_tones t join (values
  ('Muy claro', 'Rosa pastel', '#f4b6c9', 1),
  ('Muy claro', 'Durazno', '#f7c4a8', 2),
  ('Muy claro', 'Lavanda', '#cdb8ea', 3),
  ('Muy claro', 'Rojo cereza', '#c2185b', 4),
  ('Muy claro', 'Azul hielo', '#b9d7f2', 5),
  ('Claro', 'Coral', '#f2766b', 1),
  ('Claro', 'Nude rosado', '#e8b2a4', 2),
  ('Claro', 'Menta', '#b5e3cf', 3),
  ('Claro', 'Vino', '#8a1f45', 4),
  ('Claro', 'Lila', '#b79be0', 5),
  ('Medio claro', 'Terracota', '#c8643c', 1),
  ('Medio claro', 'Mostaza', '#e0b030', 2),
  ('Medio claro', 'Rosa mexicano', '#e91e8c', 3),
  ('Medio claro', 'Verde olivo', '#8a9a3b', 4),
  ('Medio claro', 'Nude canela', '#d9a384', 5),
  ('Medio', 'Fucsia', '#d81b7a', 1),
  ('Medio', 'Naranja', '#f08a24', 2),
  ('Medio', 'Turquesa', '#2bb3a6', 3),
  ('Medio', 'Dorado', '#d4a82f', 4),
  ('Medio', 'Rojo ladrillo', '#b3382c', 5),
  ('Medio oscuro', 'Lima', '#c9dc3a', 1),
  ('Medio oscuro', 'Coral intenso', '#ff6f61', 2),
  ('Medio oscuro', 'Violeta', '#7b3fa0', 3),
  ('Medio oscuro', 'Dorado', '#d4a82f', 4),
  ('Medio oscuro', 'Blanco perla', '#f2ece4', 5),
  ('Oscuro', 'Blanco', '#ffffff', 1),
  ('Oscuro', 'Amarillo limón', '#f4e04d', 2),
  ('Oscuro', 'Fucsia neón', '#ff2d95', 3),
  ('Oscuro', 'Azul eléctrico', '#2f6bff', 4),
  ('Oscuro', 'Naranja', '#ff8c1a', 5),
  ('Muy oscuro', 'Dorado', '#e0b341', 1),
  ('Muy oscuro', 'Rosa neón', '#ff4fa8', 2),
  ('Muy oscuro', 'Plata', '#cfd3d8', 3),
  ('Muy oscuro', 'Verde esmeralda', '#138a5f', 4),
  ('Muy oscuro', 'Blanco', '#ffffff', 5)
) as c(tono, nombre, hex, orden) on c.tono = t.nombre;
