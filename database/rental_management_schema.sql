-- ImmoKey - Module Gestion Locative
-- Schéma de base de données pour la gestion locative

-- Table: Managed Properties (Biens en gestion)
CREATE TABLE IF NOT EXISTS managed_properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL, -- Lien vers annonce (optionnel)
    
    -- Informations du bien
    name TEXT NOT NULL, -- Ex: "Appt Tokoin - 2ch"
    address TEXT NOT NULL,
    property_type TEXT NOT NULL,
    rooms INTEGER,
    surface_area DECIMAL(10, 2),
    
    -- Informations financières
    monthly_rent DECIMAL(12, 2) NOT NULL, -- Loyer mensuel
    charges DECIMAL(12, 2) DEFAULT 0, -- Charges mensuelles
    deposit DECIMAL(12, 2) DEFAULT 0, -- Caution demandée
    
    -- Statut
    status TEXT NOT NULL CHECK (status IN ('vacant', 'occupied', 'archived')) DEFAULT 'vacant',
    
    -- Métadonnées
    acquisition_date DATE,
    photo_url TEXT,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: Tenants (Locataires)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    managed_property_id UUID NOT NULL REFERENCES managed_properties(id) ON DELETE CASCADE,
    
    -- Informations personnelles
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    id_type TEXT, -- Type de pièce d'identité (CNI, Passeport, etc.)
    id_number TEXT,
    photo_url TEXT,
    
    -- Informations de location
    lease_start_date DATE NOT NULL,
    lease_end_date DATE, -- Optionnel (bail à durée indéterminée)
    monthly_rent DECIMAL(12, 2) NOT NULL,
    due_day INTEGER CHECK (due_day >= 1 AND due_day <= 31) DEFAULT 1, -- Jour d'échéance (1-31)
    
    -- Paiement initial
    deposit_paid DECIMAL(12, 2) DEFAULT 0,
    first_rent_paid BOOLEAN DEFAULT FALSE,
    
    -- Espace locataire
    tenant_space_enabled BOOLEAN DEFAULT TRUE,
    tenant_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Lien compte utilisateur si activé
    
    -- Statut
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'terminated')) DEFAULT 'active',
    
    -- Métadonnées
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: Payment Due Dates (Échéances)
CREATE TABLE IF NOT EXISTS payment_due_dates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    managed_property_id UUID NOT NULL REFERENCES managed_properties(id) ON DELETE CASCADE,
    
    -- Période
    period_month INTEGER NOT NULL CHECK (period_month >= 1 AND period_month <= 12),
    period_year INTEGER NOT NULL,
    
    -- Montants
    rent_amount DECIMAL(12, 2) NOT NULL,
    charges_amount DECIMAL(12, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL, -- rent_amount + charges_amount
    
    -- Échéance
    due_date DATE NOT NULL,
    
    -- Statut
    status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')) DEFAULT 'pending',
    
    -- Avis d'échéance
    notice_sent_at TIMESTAMP WITH TIME ZONE,
    notice_reference TEXT, -- Référence avis (ex: AE-2025-001)
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contrainte: une échéance unique par période et locataire
    CONSTRAINT unique_period_tenant UNIQUE (tenant_id, period_month, period_year)
);

-- Table: Payments (Paiements)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    managed_property_id UUID NOT NULL REFERENCES managed_properties(id) ON DELETE CASCADE,
    due_date_id UUID REFERENCES payment_due_dates(id) ON DELETE SET NULL,
    
    -- Période concernée
    period_month INTEGER NOT NULL,
    period_year INTEGER NOT NULL,
    
    -- Paiement
    amount DECIMAL(12, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'mobile_money', 'check', 'other')),
    transaction_reference TEXT, -- Numéro transaction (mobile money, etc.)
    
    -- Documents
    receipt_url TEXT, -- URL quittance générée
    receipt_reference TEXT, -- Référence quittance (ex: QL-2025-001)
    
    -- Métadonnées
    notes TEXT,
    recorded_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL, -- Qui a enregistré
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: Payment Reminders (Relances)
CREATE TABLE IF NOT EXISTS payment_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    due_date_id UUID REFERENCES payment_due_dates(id) ON DELETE CASCADE,
    
    -- Type de relance
    reminder_type TEXT NOT NULL CHECK (reminder_type IN ('manual', 'auto_3_days', 'auto_7_days', 'auto_15_days')),
    reminder_level INTEGER DEFAULT 1, -- 1, 2, 3 (première, deuxième, troisième)
    
    -- Message
    message TEXT NOT NULL,
    
    -- Envoi
    sent_via TEXT[] DEFAULT ARRAY[]::TEXT[], -- ['email', 'whatsapp', 'sms']
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Métadonnées
    sent_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: Documents (Documents de gestion)
CREATE TABLE IF NOT EXISTS rental_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    managed_property_id UUID REFERENCES managed_properties(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Document
    name TEXT NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN (
        'contract', 'entry_inventory', 'exit_inventory', 'tenant_id', 
        'receipt', 'invoice', 'correspondence', 'other'
    )),
    file_url TEXT NOT NULL,
    file_size INTEGER, -- Taille en bytes
    mime_type TEXT, -- 'application/pdf', 'image/jpeg', etc.
    
    -- Métadonnées
    description TEXT,
    uploaded_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    
    -- Partage
    shared_with_tenant BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: Messages (Messagerie propriétaire-locataire)
CREATE TABLE IF NOT EXISTS rental_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    managed_property_id UUID NOT NULL REFERENCES managed_properties(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Message
    sender_type TEXT NOT NULL CHECK (sender_type IN ('owner', 'tenant')),
    sender_id UUID NOT NULL, -- user_id du sender
    message TEXT NOT NULL,
    
    -- Fichiers joints
    attachments TEXT[] DEFAULT ARRAY[]::TEXT[], -- URLs des fichiers
    
    -- Statut
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes pour performance
CREATE INDEX IF NOT EXISTS idx_managed_properties_user_id ON managed_properties(user_id);
CREATE INDEX IF NOT EXISTS idx_managed_properties_status ON managed_properties(status);
CREATE INDEX IF NOT EXISTS idx_tenants_property_id ON tenants(managed_property_id);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);

-- Index unique partiel: un seul locataire actif par bien
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenants_unique_active 
    ON tenants(managed_property_id) 
    WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_payment_due_dates_tenant_id ON payment_due_dates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payment_due_dates_status ON payment_due_dates(status);
CREATE INDEX IF NOT EXISTS idx_payment_due_dates_period ON payment_due_dates(period_year, period_month);
CREATE INDEX IF NOT EXISTS idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_period ON payments(period_year, period_month);
CREATE INDEX IF NOT EXISTS idx_rental_documents_property_id ON rental_documents(managed_property_id);
CREATE INDEX IF NOT EXISTS idx_rental_documents_tenant_id ON rental_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rental_messages_property_id ON rental_messages(managed_property_id);
CREATE INDEX IF NOT EXISTS idx_rental_messages_tenant_id ON rental_messages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rental_messages_read ON rental_messages(read);

-- Triggers pour updated_at
CREATE TRIGGER update_managed_properties_updated_at
    BEFORE UPDATE ON managed_properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_due_dates_updated_at
    BEFORE UPDATE ON payment_due_dates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rental_documents_updated_at
    BEFORE UPDATE ON rental_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE managed_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_due_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_messages ENABLE ROW LEVEL SECURITY;

-- Policies: Managed Properties
CREATE POLICY "Users can view own managed properties" ON managed_properties
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own managed properties" ON managed_properties
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own managed properties" ON managed_properties
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own managed properties" ON managed_properties
    FOR DELETE USING (auth.uid() = user_id);

-- Policies: Tenants (propriétaires peuvent voir leurs locataires)
CREATE POLICY "Owners can view tenants of their properties" ON tenants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM managed_properties
            WHERE managed_properties.id = tenants.managed_property_id
            AND managed_properties.user_id = auth.uid()
        )
    );

-- Policies: Tenants (locataires peuvent voir leur propre fiche si espace activé)
CREATE POLICY "Tenants can view own tenant record" ON tenants
    FOR SELECT USING (auth.uid() = tenant_user_id);

CREATE POLICY "Owners can manage tenants of their properties" ON tenants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM managed_properties
            WHERE managed_properties.id = tenants.managed_property_id
            AND managed_properties.user_id = auth.uid()
        )
    );

-- Policies: Payment Due Dates (même logique que tenants)
CREATE POLICY "Owners can view due dates of their properties" ON payment_due_dates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM managed_properties
            WHERE managed_properties.id = payment_due_dates.managed_property_id
            AND managed_properties.user_id = auth.uid()
        )
    );

CREATE POLICY "Tenants can view own due dates" ON payment_due_dates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tenants
            WHERE tenants.id = payment_due_dates.tenant_id
            AND tenants.tenant_user_id = auth.uid()
        )
    );

CREATE POLICY "Owners can manage due dates of their properties" ON payment_due_dates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM managed_properties
            WHERE managed_properties.id = payment_due_dates.managed_property_id
            AND managed_properties.user_id = auth.uid()
        )
    );

-- Policies: Payments (même logique)
CREATE POLICY "Owners can view payments of their properties" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM managed_properties
            WHERE managed_properties.id = payments.managed_property_id
            AND managed_properties.user_id = auth.uid()
        )
    );

CREATE POLICY "Tenants can view own payments" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tenants
            WHERE tenants.id = payments.tenant_id
            AND tenants.tenant_user_id = auth.uid()
        )
    );

CREATE POLICY "Owners can manage payments of their properties" ON payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM managed_properties
            WHERE managed_properties.id = payments.managed_property_id
            AND managed_properties.user_id = auth.uid()
        )
    );

-- Policies: Documents (même logique)
CREATE POLICY "Owners can view documents of their properties" ON rental_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM managed_properties
            WHERE managed_properties.id = rental_documents.managed_property_id
            AND managed_properties.user_id = auth.uid()
        )
    );

CREATE POLICY "Tenants can view shared documents" ON rental_documents
    FOR SELECT USING (
        shared_with_tenant = TRUE AND
        EXISTS (
            SELECT 1 FROM tenants
            WHERE tenants.id = rental_documents.tenant_id
            AND tenants.tenant_user_id = auth.uid()
        )
    );

CREATE POLICY "Owners can manage documents of their properties" ON rental_documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM managed_properties
            WHERE managed_properties.id = rental_documents.managed_property_id
            AND managed_properties.user_id = auth.uid()
        )
    );

-- Policies: Messages (propriétaires et locataires peuvent voir leurs conversations)
CREATE POLICY "Users can view rental messages" ON rental_messages
    FOR SELECT USING (
        (sender_id = auth.uid()) OR
        (EXISTS (
            SELECT 1 FROM tenants
            WHERE tenants.id = rental_messages.tenant_id
            AND (
                tenants.tenant_user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM managed_properties
                    WHERE managed_properties.id = rental_messages.managed_property_id
                    AND managed_properties.user_id = auth.uid()
                )
            )
        ))
    );

CREATE POLICY "Users can create rental messages" ON rental_messages
    FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update own messages" ON rental_messages
    FOR UPDATE USING (sender_id = auth.uid());
