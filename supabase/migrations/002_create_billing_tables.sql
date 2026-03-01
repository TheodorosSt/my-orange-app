-- ===================================
-- ORANGE Platform — Billing Schema
-- ===================================

-- Billing customers (Stripe mapping)
CREATE TABLE IF NOT EXISTS public.billing_customers (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.billing_customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own billing" ON public.billing_customers FOR SELECT USING (auth.uid() = user_id);

-- Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE NOT NULL,
    plan TEXT NOT NULL DEFAULT 'starter',
    status TEXT NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Usage records
CREATE TABLE IF NOT EXISTS public.usage_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    service TEXT NOT NULL,
    unit TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    month TEXT NOT NULL, -- "2026-03"
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, service, month)
);

CREATE INDEX idx_usage_user_month ON public.usage_records(user_id, month);

ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own usage" ON public.usage_records FOR SELECT USING (auth.uid() = user_id);

-- Collaboration sessions
CREATE TABLE IF NOT EXISTS public.collaboration_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id TEXT NOT NULL,
    channel TEXT NOT NULL,
    participants TEXT[] DEFAULT '{}',
    service TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    locked_by UUID REFERENCES auth.users(id),
    lock_operation TEXT,
    locked_at TIMESTAMPTZ,
    document_state JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_collab_document ON public.collaboration_sessions(document_id);
CREATE INDEX idx_collab_active ON public.collaboration_sessions(is_active);

ALTER TABLE public.collaboration_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can access collab" ON public.collaboration_sessions FOR ALL USING (auth.role() = 'authenticated');

-- Activity log
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    action TEXT NOT NULL,
    service TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_document ON public.activity_log(document_id, created_at DESC);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view activity" ON public.activity_log FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can log activity" ON public.activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);