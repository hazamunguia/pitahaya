-- PITAHAYA Beauty Studio · esquema inicial
-- Pégalo completo en Supabase → SQL Editor → New query → Run.

create extension if not exists btree_gist;

-- ---------- Perfiles (1 a 1 con auth.users) ----------
create type user_role as enum ('owner', 'client');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'client',
  nombre text not null default '',
  celular text not null unique check (celular ~ '^[0-9]{10}$'),
  debe_cambiar_password boolean not null default false,
  creado_en timestamptz not null default now()
);

-- Crea el perfil al registrarse. El celular y el nombre viajan en user_metadata.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nombre, celular)
  values (new.id, coalesce(new.raw_user_meta_data->>'nombre', ''), new.raw_user_meta_data->>'celular');
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'owner');
$$;

create or replace function public.my_role() returns user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ---------- Catálogos ----------
create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, nombre text not null, descripcion text,
  duracion_min int not null, precio_base numeric(10,2) not null,
  admite_diseno boolean not null default false,
  visible boolean not null default true, orden int not null default 0
);

create table public.designs (
  id uuid primary key default gen_random_uuid(),
  nombre text not null, precio_extra numeric(10,2) not null default 0, minutos_extra int not null default 0,
  imagen_url text, etiquetas text[] not null default '{}',
  visible boolean not null default true, orden int not null default 0
);

create table public.courtesies (
  id uuid primary key default gen_random_uuid(),
  nombre text not null, opciones text[] not null default '{}',
  icono text, disponible boolean not null default true, orden int not null default 0
);

-- ---------- Ficha de belleza ----------
create table public.skin_tones (
  id uuid primary key default gen_random_uuid(),
  nombre text not null, hex text not null,
  subtono text not null check (subtono in ('frío','neutro','cálido')), orden int not null default 0
);
create table public.tone_colors (
  id uuid primary key default gen_random_uuid(),
  tone_id uuid not null references public.skin_tones(id) on delete cascade,
  nombre text not null, hex text not null, orden int not null default 0
);
create table public.beauty_profiles (
  client_id uuid primary key references public.profiles(id) on delete cascade,
  tone_id uuid references public.skin_tones(id),
  forma text, largo text, notas text,
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references public.profiles(id)
);
create table public.nail_measurements (
  client_id uuid not null references public.profiles(id) on delete cascade,
  mano char(1) not null check (mano in ('L','R')),
  dedo smallint not null check (dedo between 1 and 5), -- 1 pulgar … 5 meñique
  medida_mm numeric(4,1) not null check (medida_mm > 0),
  medido_en timestamptz not null default now(),
  primary key (client_id, mano, dedo)
);

-- ---------- Citas ----------
create type appt_status as enum ('pending','confirmed','done','cancelled','quote');
create sequence public.folio_seq start 1;

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  folio text unique not null default ('PIT-' || lpad(nextval('public.folio_seq')::text, 4, '0')),
  client_id uuid not null references public.profiles(id),
  service_id uuid not null references public.services(id),
  design_id uuid references public.designs(id),
  inicia_en timestamptz not null, termina_en timestamptz not null,
  estado appt_status not null default 'pending',
  precio_base numeric(10,2) not null default 0, precio_diseno numeric(10,2) not null default 0,
  descuento_pct int not null default 0, total numeric(10,2) not null default 0,
  nota_clienta text, nota_interna text,
  origen text not null default 'web' check (origen in ('web','manual')),
  motivo_cancelacion text, creado_en timestamptz not null default now(),
  check (termina_en > inicia_en)
);
-- Evita dos citas activas que se empalmen.
alter table public.appointments add constraint no_empalme exclude using gist
  (tstzrange(inicia_en, termina_en) with &&) where (estado in ('pending','confirmed','quote'));

create table public.appointment_courtesies (
  appointment_id uuid references public.appointments(id) on delete cascade,
  courtesy_id uuid references public.courtesies(id),
  primary key (appointment_id, courtesy_id)
);
-- Máximo 2 cortesías por cita.
create or replace function public.max_two_courtesies() returns trigger language plpgsql as $$
begin
  if (select count(*) from public.appointment_courtesies where appointment_id = new.appointment_id) >= 2 then
    raise exception 'Máximo 2 cortesías por cita';
  end if;
  return new;
end $$;
create trigger trg_max_two before insert on public.appointment_courtesies
for each row execute function public.max_two_courtesies();

create table public.custom_designs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id),
  appointment_id uuid references public.appointments(id) on delete set null,
  imagen_url text not null, nota_clienta text,
  estado text not null default 'pending' check (estado in ('pending','quoted','accepted','rejected')),
  precio_cotizado numeric(10,2), minutos_extra int, mensaje text, cotizado_en timestamptz,
  creado_en timestamptz not null default now()
);

create table public.status_history (
  id bigint generated always as identity primary key,
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  de appt_status, a appt_status not null, por uuid references public.profiles(id), en timestamptz not null default now()
);

-- ---------- Programa de charms ----------
create table public.loyalty_steps (
  visita smallint primary key check (visita between 1 and 10),
  tipo text not null check (tipo in ('charm','desc','premio')),
  descuento_pct smallint, texto text not null
);
create table public.loyalty_events (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id),
  appointment_id uuid references public.appointments(id),
  visita_n smallint not null, tipo text not null,
  entregado boolean not null default false, entregado_en timestamptz
);

-- ---------- Configuración y avisos ----------
create table public.settings (clave text primary key, valor jsonb not null);
create table public.availability_rules (
  dia_semana smallint primary key check (dia_semana between 0 and 6),
  abierto boolean not null default true, desde time, hasta time
);
create table public.blocked_slots (
  id uuid primary key default gen_random_uuid(),
  inicia_en timestamptz not null, termina_en timestamptz not null, motivo text, repite_semanal boolean not null default false
);
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text unique not null, p256dh text not null, auth text not null, user_agent text,
  creado_en timestamptz not null default now()
);
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  titulo text not null, cuerpo text, url text, leida boolean not null default false, creado_en timestamptz not null default now()
);

-- ---------- Seguridad (RLS) ----------
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.designs enable row level security;
alter table public.courtesies enable row level security;
alter table public.skin_tones enable row level security;
alter table public.tone_colors enable row level security;
alter table public.beauty_profiles enable row level security;
alter table public.nail_measurements enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_courtesies enable row level security;
alter table public.custom_designs enable row level security;
alter table public.status_history enable row level security;
alter table public.loyalty_steps enable row level security;
alter table public.loyalty_events enable row level security;
alter table public.settings enable row level security;
alter table public.availability_rules enable row level security;
alter table public.blocked_slots enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.notifications enable row level security;

-- Catálogos: lectura pública, escritura solo la dueña.
do $$ declare t text; begin
  foreach t in array array['services','designs','courtesies','skin_tones','tone_colors','loyalty_steps','availability_rules'] loop
    execute format('create policy "%1$s lectura" on public.%1$s for select using (true)', t);
    execute format('create policy "%1$s dueña" on public.%1$s for all using (public.is_owner()) with check (public.is_owner())', t);
  end loop;
end $$;

-- Perfil: cada quien ve el suyo; la dueña ve y edita todos.
create policy "perfil propio" on public.profiles for select using (id = auth.uid() or public.is_owner());
create policy "perfil editar propio" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid() and role = public.my_role());
create policy "perfil dueña" on public.profiles for all using (public.is_owner()) with check (public.is_owner());

-- Ficha de belleza: la clienta solo lee la suya; la dueña edita.
create policy "ficha propia" on public.beauty_profiles for select using (client_id = auth.uid());
create policy "ficha dueña" on public.beauty_profiles for all using (public.is_owner()) with check (public.is_owner());
create policy "medidas propias" on public.nail_measurements for select using (client_id = auth.uid());
create policy "medidas dueña" on public.nail_measurements for all using (public.is_owner()) with check (public.is_owner());

-- Citas: la clienta solo ve las suyas; la dueña todo.
create policy "citas propias" on public.appointments for select using (client_id = auth.uid());
-- Crear, reagendar y cancelar se hacen desde el servidor (calcula precios y valida horarios).
create policy "citas dueña" on public.appointments for all using (public.is_owner()) with check (public.is_owner());

create policy "cortesias de mi cita" on public.appointment_courtesies for all
  using (exists (select 1 from public.appointments a where a.id = appointment_id and (a.client_id = auth.uid() or public.is_owner())))
  with check (exists (select 1 from public.appointments a where a.id = appointment_id and (a.client_id = auth.uid() or public.is_owner())));

create policy "mis diseños" on public.custom_designs for select using (client_id = auth.uid() or public.is_owner());
create policy "diseños dueña" on public.custom_designs for all using (public.is_owner()) with check (public.is_owner());
create policy "historial propio" on public.status_history for select using (public.is_owner() or exists (select 1 from public.appointments a where a.id = appointment_id and a.client_id = auth.uid()));
create policy "charms propios" on public.loyalty_events for select using (client_id = auth.uid());
create policy "charms dueña" on public.loyalty_events for all using (public.is_owner()) with check (public.is_owner());
create policy "ajustes dueña" on public.settings for all using (public.is_owner()) with check (public.is_owner());
create policy "bloqueos dueña" on public.blocked_slots for all using (public.is_owner()) with check (public.is_owner());
create policy "push propio" on public.push_subscriptions for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "avisos propios" on public.notifications for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- Datos iniciales ----------
insert into public.courtesies (nombre, opciones, icono, orden) values
  ('Café', '{Americano,"Con leche"}', 'coffee', 1),
  ('Agua de sabor', '{Jamaica,"Limón con chía",Horchata}', 'glass', 2),
  ('Té', '{Manzanilla,Hierbabuena,"Frutos rojos"}', 'leaf', 3),
  ('Una cosita o qué?', '{Copita}', 'cheers', 4);

insert into public.loyalty_steps (visita, tipo, descuento_pct, texto) values
  (1,'charm',null,'Llavero + charm 1'), (2,'desc',10,'10% de descuento'), (3,'charm',null,'Charm 2'),
  (4,'desc',15,'15% de descuento'), (5,'charm',null,'Charm 3'), (6,'desc',20,'20% de descuento'),
  (7,'charm',null,'Charm 4'), (8,'desc',25,'25% de descuento'),
  (9,'charm',null,'Charm 5 · manicura o pedicura gratis'), (10,'premio',null,'Uñas completas gratis · manos o pies');

insert into public.availability_rules (dia_semana, abierto, desde, hasta) values
  (0,false,null,null),(1,true,'10:00','18:00'),(2,true,'10:00','18:00'),(3,true,'10:00','18:00'),
  (4,true,'10:00','18:00'),(5,true,'10:00','18:00'),(6,true,'10:00','16:00');
