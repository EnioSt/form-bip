-- ==============================================================================
-- BIP360 Sistemas - Script de Estrutura Completa do Supabase (PostgreSQL)
-- Projeto: Gestão de Onboarding SiTEF & BIP360
-- ==============================================================================

-- 1. Habilitar extensão para geração de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. Tabela: profiles (Extensão dos Usuários do Supabase Auth com RBAC)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'operator' CHECK (role IN ('admin', 'operator')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para profiles:
-- Usuários autenticados podem ver todos os operadores da equipe
CREATE POLICY "Profiles são visíveis para qualquer usuário autenticado" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (true);

-- Apenas admins podem atualizar perfis de outros usuários ou promover a admin
CREATE POLICY "Admins podem atualizar profiles" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- ==============================================================================
-- 3. Trigger automático para criar profile ao registrar no auth.users
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'operator')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 4. Tabela: cards (Lojas / Cards do Kanban)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id INTEGER UNIQUE, -- ID da API externa da franqueadora (ITF Gestor)
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'triagem' CHECK (status IN ('triagem', 'preenchido', 'implantacao', 'concluido')),
    unique_token TEXT NOT NULL UNIQUE,
    is_form_open BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true, -- Interruptor local no sistema (Ativo/Inativo)
    operator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    scheduled_date DATE, -- Data prevista para implantação (alimenta o calendário)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices de Performance
CREATE INDEX IF NOT EXISTS idx_cards_status ON public.cards(status);
CREATE INDEX IF NOT EXISTS idx_cards_external_id ON public.cards(external_id);
CREATE INDEX IF NOT EXISTS idx_cards_unique_token ON public.cards(unique_token);
CREATE INDEX IF NOT EXISTS idx_cards_operator_id ON public.cards(operator_id);
CREATE INDEX IF NOT EXISTS idx_cards_is_active ON public.cards(is_active);

-- Habilitar RLS
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- Políticas para cards:
-- Leitura pública para busca de token do formulário
CREATE POLICY "Leitura pública de cards pelo token" 
ON public.cards FOR SELECT 
USING (true);

-- Usuários autenticados podem inserir, atualizar e gerenciar cards
CREATE POLICY "Operadores e admins podem gerenciar cards" 
ON public.cards FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- ==============================================================================
-- 5. Tabela: form_data (Credenciamento SiTEF Preenchido pelo Franqueado)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.form_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id UUID NOT NULL UNIQUE REFERENCES public.cards(id) ON DELETE CASCADE,
    cnpj TEXT,
    razao_social TEXT,
    responsavel TEXT,
    telefone TEXT,
    email_unidade TEXT,
    endereco TEXT,
    cep TEXT,
    cidade TEXT,
    uf TEXT,
    numero_logico_adquirente TEXT,
    adquirente_banco TEXT, -- Adquirente / Banco informado
    qtd_pdvs_tef TEXT DEFAULT '1',
    qtd_totems_tef TEXT DEFAULT '0',
    foto_maquininha_ok BOOLEAN DEFAULT false,
    photo_url TEXT,
    pix_psp_banco TEXT,
    pix_vinculacao_fiserv_ok BOOLEAN DEFAULT false,
    pix_chave TEXT,
    pix_nao_se_aplica BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_form_data_card_id ON public.form_data(card_id);

-- Habilitar RLS
ALTER TABLE public.form_data ENABLE ROW LEVEL SECURITY;

-- Políticas para form_data:
-- Leitura pública para preenchimento de dados
CREATE POLICY "Permitir leitura pública ou autenticada de form_data" 
ON public.form_data FOR SELECT 
USING (true);

-- Clientes públicos podem inserir ou atualizar seu form_data via token do card
CREATE POLICY "Permitir preenchimento público ou autenticado de form_data" 
ON public.form_data FOR ALL 
USING (true)
WITH CHECK (true);

-- ==============================================================================
-- 6. Tabela: card_notes (Observações Internas Colaborativas com Auditoria)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.card_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    text VARCHAR(150) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_card_notes_card_id ON public.card_notes(card_id);

-- Habilitar RLS
ALTER TABLE public.card_notes ENABLE ROW LEVEL SECURITY;

-- Usuários autenticados podem ver notas
CREATE POLICY "Usuários autenticados podem ler notas" 
ON public.card_notes FOR SELECT 
TO authenticated 
USING (true);

-- Usuários autenticados podem criar notas
CREATE POLICY "Usuários autenticados podem criar notas" 
ON public.card_notes FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = author_id);

-- Apenas o autor da nota ou admins podem deletar uma nota
CREATE POLICY "Autores ou admins podem deletar notas" 
ON public.card_notes FOR DELETE 
TO authenticated 
USING (
    auth.uid() = author_id 
    OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- ==============================================================================
-- 7. Storage Bucket para Upload da Foto da Maquininha
-- ==============================================================================
-- Para rodar no Supabase Storage: crie um bucket chamado 'machine-photos' público
INSERT INTO storage.buckets (id, name, public) 
VALUES ('machine-photos', 'machine-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Política de Storage: Qualquer pessoa com link do form pode fazer upload
CREATE POLICY "Upload público de fotos das maquininhas"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'machine-photos');

-- Política de Storage: Leitura pública das fotos
CREATE POLICY "Leitura pública das fotos das maquininhas"
ON storage.objects FOR SELECT
USING (bucket_id = 'machine-photos');

-- ==============================================================================
-- 8. Visualização Otimizada para Métricas do Dashboard e TV
-- ==============================================================================
CREATE OR REPLACE VIEW public.vw_dashboard_summary AS
SELECT
    COUNT(*) FILTER (WHERE is_active = true) AS total_lojas_ativas,
    COUNT(*) FILTER (WHERE is_active = true AND status = 'concluido') AS total_concluidas,
    COUNT(*) FILTER (WHERE is_active = true AND status = 'implantacao') AS total_implantacao,
    COUNT(*) FILTER (WHERE is_active = true AND status = 'preenchido') AS total_preenchido,
    COUNT(*) FILTER (WHERE is_active = true AND status = 'triagem') AS total_triagem,
    COALESCE(SUM(NULLIF(fd.qtd_pdvs_tef, '')::INTEGER) FILTER (WHERE c.is_active = true), 0) AS total_pdvs,
    COALESCE(SUM(NULLIF(fd.qtd_totems_tef, '')::INTEGER) FILTER (WHERE c.is_active = true), 0) AS total_totems
FROM public.cards c
LEFT JOIN public.form_data fd ON fd.card_id = c.id;
