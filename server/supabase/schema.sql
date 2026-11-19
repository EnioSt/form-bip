-- =====================================================================
-- BipForm: estrutura do banco no Supabase
-- Como usar: Supabase → SQL Editor → New query → cole este arquivo → Run.
-- Pode rodar de novo sem problema (só cria o que ainda não existe).
--
-- Segurança: todas as tabelas ficam com RLS ligado e SEM políticas.
-- Resultado: ninguém acessa pela chave pública (anon/publishable).
-- Só o nosso servidor, com a chave secreta, lê e grava.
-- =====================================================================

-- ---------- Usuários do sistema ----------
create table if not exists public.users (
  id            text primary key,
  name          text not null check (char_length(name) between 1 and 100),
  email         text not null check (char_length(email) <= 160),
  password_hash text not null,
  role          text not null default 'operator' check (role in ('admin', 'operator')),
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);
create unique index if not exists users_email_unique on public.users (lower(email));

-- ---------- Cards (uma loja = um card) ----------
create table if not exists public.cards (
  id                 text primary key,
  external_id        integer,                        -- código da franquia na API do ITF Gestor
  title              text not null check (char_length(title) <= 200),
  status             text not null default 'triagem'
                     check (status in ('triagem', 'preenchido', 'implantacao', 'concluido')),
  unique_token       text not null unique,           -- token do link público do formulário
  is_form_open       boolean not null default true,
  is_active          boolean not null default true,
  inactive_reason    text check (inactive_reason in ('manual', 'franchise_api')),
  inactivated_at     timestamptz,
  operator_id        text references public.users (id) on delete set null,
  scheduled_date     date,
  title_history      jsonb not null default '[]'::jsonb,
  pending_photo_file text,                           -- foto enviada, aguardando o envio do formulário
  created_by         text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create unique index if not exists cards_external_id_unique on public.cards (external_id) where external_id is not null;
create index if not exists cards_operator_idx on public.cards (operator_id);

-- ---------- Dados do formulário (um por card) ----------
create table if not exists public.form_data (
  card_id                  text primary key references public.cards (id) on delete cascade,
  cnpj                     text,
  razao_social             text,
  responsavel              text,
  telefone                 text,
  email_unidade            text,
  endereco                 text,
  cep                      text,
  cidade                   text,
  uf                       text,
  adquirente_banco         text,
  adquirente_outro_nome    text,
  numero_logico_adquirente text,
  qtd_pdvs_tef             text,
  qtd_totems_tef           text,
  foto_maquininha_ok       boolean not null default false,
  photo_file               text,                     -- nome do arquivo no Storage (bucket "photos")
  pix_psp_banco            text,
  pix_vinculacao_fiserv_ok boolean not null default false,
  pix_chave                text,
  pix_nao_se_aplica        boolean not null default false,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz
);

-- ---------- Observações internas dos cards ----------
create table if not exists public.card_notes (
  id          text primary key,
  card_id     text not null references public.cards (id) on delete cascade,
  text        text not null check (char_length(text) <= 150),
  author_id   text references public.users (id) on delete set null,
  author_name text,
  created_at  timestamptz not null default now()
);
create index if not exists card_notes_card_idx on public.card_notes (card_id, created_at);

-- ---------- Adquirentes cadastradas pelos operadores ----------
create table if not exists public.acquirers (
  name       text primary key check (char_length(name) between 2 and 60),
  created_at timestamptz not null default now()
);

-- ---------- updated_at automático ----------
-- Qualquer mudança no card, no formulário ou nas observações atualiza cards.updated_at.
-- O Kanban usa isso para só baixar a lista de novo quando algo mudou (economiza tráfego).
create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

create or replace function public.touch_parent_card() returns trigger
language plpgsql set search_path = '' as $$
begin
  update public.cards set updated_at = now() where id = coalesce(new.card_id, old.card_id);
  return null;
end $$;

drop trigger if exists cards_updated_at on public.cards;
create trigger cards_updated_at before update on public.cards
  for each row execute function public.set_updated_at();

drop trigger if exists form_data_touch_card on public.form_data;
create trigger form_data_touch_card after insert or update or delete on public.form_data
  for each row execute function public.touch_parent_card();

drop trigger if exists card_notes_touch_card on public.card_notes;
create trigger card_notes_touch_card after insert or update or delete on public.card_notes
  for each row execute function public.touch_parent_card();

-- "Versão" da lista de cards: muda sempre que algo é criado, alterado ou excluído
create or replace function public.cards_version() returns text
language sql stable set search_path = '' as $$
  select coalesce(max(updated_at)::text, '') || '|' || count(*)::text from public.cards;
$$;

-- ---------- Segurança: RLS ligado, sem políticas, sem acesso público ----------
alter table public.users      enable row level security;
alter table public.cards      enable row level security;
alter table public.form_data  enable row level security;
alter table public.card_notes enable row level security;
alter table public.acquirers  enable row level security;

revoke all on public.users, public.cards, public.form_data, public.card_notes, public.acquirers from anon, authenticated;
revoke execute on function public.cards_version() from public, anon, authenticated;
grant execute on function public.cards_version() to service_role;

-- ---------- Fotos da maquininha (Storage) ----------
-- Bucket PRIVADO: as fotos só abrem por links temporários gerados pelo servidor.
-- Limite de 2 MB e só imagens (o servidor também confere o tipo real do arquivo).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', false, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
