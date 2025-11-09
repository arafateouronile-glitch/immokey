-- ImmoKey - Module Gestion Hôtelière (Hôtels, Auberges, Apparthotels)
-- Schéma de base de données pour la gestion des établissements d'hébergement

-- Table: Hospitality Establishments (Établissements hôteliers)
CREATE TABLE IF NOT EXISTS hospitality_establishments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Type d'établissement
    establishment_type TEXT NOT NULL CHECK (establishment_type IN ('hotel', 'auberge', 'apparthotel', 'residence', 'gite', 'autre')),
    
    -- Informations générales
    name TEXT NOT NULL, -- Nom de l'établissement
    description TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    neighborhood TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Contact
    phone TEXT NOT NULL,
    email TEXT,
    website TEXT,
    
    -- Équipements et services
    amenities TEXT[] DEFAULT ARRAY[]::TEXT[], -- WiFi, piscine, restaurant, parking, etc.
    
    -- Informations administratives
    registration_number TEXT, -- Numéro d'enregistrement
    license_number TEXT, -- Numéro de licence
    tax_id TEXT, -- Numéro fiscal
    
    -- Photos
    cover_image_url TEXT, -- Photo principale
    photo_urls TEXT[] DEFAULT ARRAY[]::TEXT[], -- Galerie de photos
    
    -- Horaires
    check_in_time TIME DEFAULT '14:00:00',
    check_out_time TIME DEFAULT '12:00:00',
    
    -- Statut
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'archived')) DEFAULT 'active',
    
    -- Métadonnées
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: Rooms/Units (Chambres/Unités)
CREATE TABLE IF NOT EXISTS hospitality_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID NOT NULL REFERENCES hospitality_establishments(id) ON DELETE CASCADE,
    
    -- Informations de la chambre
    room_number TEXT NOT NULL, -- Numéro ou nom de la chambre
    room_type TEXT NOT NULL, -- 'single', 'double', 'twin', 'suite', 'apartment', etc.
    name TEXT, -- Nom de la chambre (ex: "Suite Deluxe")
    description TEXT,
    
    -- Capacité
    max_guests INTEGER NOT NULL CHECK (max_guests > 0) DEFAULT 2,
    beds INTEGER DEFAULT 1, -- Nombre de lits
    bed_type TEXT, -- 'single', 'double', 'queen', 'king'
    
    -- Caractéristiques
    surface_area DECIMAL(10, 2), -- Surface en m²
    floor INTEGER, -- Étage
    amenities TEXT[] DEFAULT ARRAY[]::TEXT[], -- TV, minibar, balcon, vue mer, etc.
    
    -- Photos
    photo_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Tarif de base
    base_price_per_night DECIMAL(12, 2) NOT NULL, -- Prix de base par nuit
    currency TEXT DEFAULT 'FCFA',
    
    -- Statut
    status TEXT NOT NULL CHECK (status IN ('active', 'maintenance', 'inactive')) DEFAULT 'active',
    
    -- Métadonnées
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contrainte: numéro de chambre unique par établissement
    UNIQUE(establishment_id, room_number)
);

-- Table: Booking Reservations (Réservations)
CREATE TABLE IF NOT EXISTS hospitality_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID NOT NULL REFERENCES hospitality_establishments(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES hospitality_rooms(id) ON DELETE RESTRICT,
    
    -- Informations du client
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    guest_phone TEXT NOT NULL,
    guest_id_type TEXT, -- Type de pièce d'identité
    guest_id_number TEXT,
    guest_country TEXT,
    
    -- Période de séjour
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    nights INTEGER NOT NULL, -- Nombre de nuits (calculé)
    
    -- Tarification
    price_per_night DECIMAL(12, 2) NOT NULL, -- Prix par nuit (peut varier selon les dates)
    subtotal DECIMAL(12, 2) NOT NULL, -- Sous-total (price_per_night * nights)
    taxes DECIMAL(12, 2) DEFAULT 0, -- Taxes
    fees DECIMAL(12, 2) DEFAULT 0, -- Frais supplémentaires
    discount DECIMAL(12, 2) DEFAULT 0, -- Réduction
    total_amount DECIMAL(12, 2) NOT NULL, -- Total (subtotal + taxes + fees - discount)
    currency TEXT DEFAULT 'FCFA',
    
    -- Statut de la réservation
    status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show')) DEFAULT 'pending',
    
    -- Paiement
    payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')) DEFAULT 'pending',
    payment_method TEXT, -- 'cash', 'card', 'bank_transfer', 'mobile_money'
    deposit_amount DECIMAL(12, 2) DEFAULT 0, -- Acompte
    deposit_paid_at TIMESTAMP WITH TIME ZONE,
    balance_paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Dates importantes
    confirmed_at TIMESTAMP WITH TIME ZONE,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    checked_out_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    
    -- Notes et remarques
    guest_requests TEXT, -- Demandes spéciales du client
    internal_notes TEXT, -- Notes internes
    
    -- Référence
    booking_reference TEXT UNIQUE, -- Référence unique (ex: HKG-2025-001)
    
    -- Source de réservation
    booking_source TEXT, -- 'direct', 'booking.com', 'airbnb', 'phone', 'walk_in', etc.
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contrainte: dates valides
    CONSTRAINT valid_dates CHECK (check_out_date > check_in_date)
);

-- Table: Room Availability (Disponibilité des chambres)
-- Utilisé pour bloquer des périodes (maintenance, réservations, etc.)
CREATE TABLE IF NOT EXISTS hospitality_room_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES hospitality_rooms(id) ON DELETE CASCADE,
    
    -- Période
    date_from DATE NOT NULL,
    date_to DATE NOT NULL, -- Date de fin (incluse)
    
    -- Type de blocage
    availability_type TEXT NOT NULL CHECK (availability_type IN ('available', 'booked', 'maintenance', 'blocked')) DEFAULT 'available',
    
    -- Référence
    booking_id UUID REFERENCES hospitality_bookings(id) ON DELETE CASCADE, -- Si lié à une réservation
    
    -- Raison
    reason TEXT, -- Raison du blocage
    
    -- Statut
    status TEXT NOT NULL CHECK (status IN ('active', 'cancelled')) DEFAULT 'active',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contrainte: dates valides
    CONSTRAINT valid_date_range CHECK (date_to >= date_from)
);

-- Table: Pricing Rules (Règles de tarification)
-- Pour gérer les tarifs variables (saison, week-end, événements, etc.)
CREATE TABLE IF NOT EXISTS hospitality_pricing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID REFERENCES hospitality_establishments(id) ON DELETE CASCADE,
    room_id UUID REFERENCES hospitality_rooms(id) ON DELETE CASCADE, -- Si spécifique à une chambre
    
    -- Nom de la règle
    name TEXT NOT NULL, -- Ex: "Haute saison", "Week-end", "Événement spécial"
    
    -- Période d'application
    date_from DATE,
    date_to DATE,
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Dimanche, 6 = Samedi
    
    -- Modification du prix
    price_modifier_type TEXT NOT NULL CHECK (price_modifier_type IN ('fixed', 'percentage', 'multiplier')) DEFAULT 'percentage',
    price_modifier_value DECIMAL(10, 2) NOT NULL, -- Montant fixe, pourcentage (ex: 20 = +20%), ou multiplicateur (ex: 1.5 = +50%)
    
    -- Conditions
    min_nights INTEGER, -- Nombre minimum de nuits
    max_nights INTEGER, -- Nombre maximum de nuits
    advance_booking_days INTEGER, -- Réservation X jours à l'avance
    
    -- Priorité (plus haut = prioritaire)
    priority INTEGER DEFAULT 0,
    
    -- Statut
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contrainte: au moins une période ou un jour de la semaine
    CONSTRAINT valid_rule CHECK (
        (date_from IS NOT NULL AND date_to IS NOT NULL) OR 
        day_of_week IS NOT NULL
    )
);

-- Indexes pour performance
CREATE INDEX IF NOT EXISTS idx_hospitality_establishments_user_id ON hospitality_establishments(user_id);
CREATE INDEX IF NOT EXISTS idx_hospitality_establishments_type ON hospitality_establishments(establishment_type);
CREATE INDEX IF NOT EXISTS idx_hospitality_establishments_status ON hospitality_establishments(status);
CREATE INDEX IF NOT EXISTS idx_hospitality_establishments_city ON hospitality_establishments(city);

CREATE INDEX IF NOT EXISTS idx_hospitality_rooms_establishment_id ON hospitality_rooms(establishment_id);
CREATE INDEX IF NOT EXISTS idx_hospitality_rooms_status ON hospitality_rooms(status);
CREATE INDEX IF NOT EXISTS idx_hospitality_rooms_type ON hospitality_rooms(room_type);

CREATE INDEX IF NOT EXISTS idx_hospitality_bookings_establishment_id ON hospitality_bookings(establishment_id);
CREATE INDEX IF NOT EXISTS idx_hospitality_bookings_room_id ON hospitality_bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_hospitality_bookings_check_in_date ON hospitality_bookings(check_in_date);
CREATE INDEX IF NOT EXISTS idx_hospitality_bookings_check_out_date ON hospitality_bookings(check_out_date);
CREATE INDEX IF NOT EXISTS idx_hospitality_bookings_status ON hospitality_bookings(status);
CREATE INDEX IF NOT EXISTS idx_hospitality_bookings_payment_status ON hospitality_bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_hospitality_bookings_booking_reference ON hospitality_bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_hospitality_bookings_guest_email ON hospitality_bookings(guest_email);

CREATE INDEX IF NOT EXISTS idx_hospitality_room_availability_room_id ON hospitality_room_availability(room_id);
CREATE INDEX IF NOT EXISTS idx_hospitality_room_availability_date_from ON hospitality_room_availability(date_from);
CREATE INDEX IF NOT EXISTS idx_hospitality_room_availability_date_to ON hospitality_room_availability(date_to);
CREATE INDEX IF NOT EXISTS idx_hospitality_room_availability_type ON hospitality_room_availability(availability_type);
CREATE INDEX IF NOT EXISTS idx_hospitality_room_availability_booking_id ON hospitality_room_availability(booking_id);

CREATE INDEX IF NOT EXISTS idx_hospitality_pricing_rules_establishment_id ON hospitality_pricing_rules(establishment_id);
CREATE INDEX IF NOT EXISTS idx_hospitality_pricing_rules_room_id ON hospitality_pricing_rules(room_id);
CREATE INDEX IF NOT EXISTS idx_hospitality_pricing_rules_date_from ON hospitality_pricing_rules(date_from);
CREATE INDEX IF NOT EXISTS idx_hospitality_pricing_rules_date_to ON hospitality_pricing_rules(date_to);
CREATE INDEX IF NOT EXISTS idx_hospitality_pricing_rules_status ON hospitality_pricing_rules(status);

-- Triggers pour updated_at
CREATE TRIGGER update_hospitality_establishments_updated_at
    BEFORE UPDATE ON hospitality_establishments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hospitality_rooms_updated_at
    BEFORE UPDATE ON hospitality_rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hospitality_bookings_updated_at
    BEFORE UPDATE ON hospitality_bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hospitality_room_availability_updated_at
    BEFORE UPDATE ON hospitality_room_availability
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hospitality_pricing_rules_updated_at
    BEFORE UPDATE ON hospitality_pricing_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour calculer automatiquement le nombre de nuits
CREATE OR REPLACE FUNCTION calculate_booking_nights()
RETURNS TRIGGER AS $$
BEGIN
    NEW.nights = (NEW.check_out_date - NEW.check_in_date)::INTEGER;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_nights_before_insert_update
    BEFORE INSERT OR UPDATE OF check_in_date, check_out_date ON hospitality_bookings
    FOR EACH ROW
    EXECUTE FUNCTION calculate_booking_nights();

-- Trigger pour générer automatiquement la référence de réservation
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TRIGGER AS $$
DECLARE
    prefix TEXT;
    year_val INTEGER;
    sequence_num INTEGER;
BEGIN
    IF NEW.booking_reference IS NULL THEN
        -- Préfixe basé sur le type d'établissement
        SELECT CASE 
            WHEN establishment_type = 'hotel' THEN 'HTL'
            WHEN establishment_type = 'auberge' THEN 'AUB'
            WHEN establishment_type = 'apparthotel' THEN 'APH'
            ELSE 'HOS'
        END INTO prefix
        FROM hospitality_establishments
        WHERE id = NEW.establishment_id;
        
        year_val := EXTRACT(YEAR FROM NOW())::INTEGER;
        
        -- Trouver le prochain numéro de séquence pour cette année
        SELECT COALESCE(MAX(
            CAST(SUBSTRING(booking_reference FROM '([0-9]+)$') AS INTEGER)
        ), 0) + 1 INTO sequence_num
        FROM hospitality_bookings
        WHERE booking_reference LIKE prefix || '-' || year_val || '-%';
        
        NEW.booking_reference := prefix || '-' || year_val || '-' || LPAD(sequence_num::TEXT, 3, '0');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_booking_reference_before_insert
    BEFORE INSERT ON hospitality_bookings
    FOR EACH ROW
    EXECUTE FUNCTION generate_booking_reference();

-- Row Level Security (RLS)
ALTER TABLE hospitality_establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitality_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitality_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitality_room_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitality_pricing_rules ENABLE ROW LEVEL SECURITY;

-- Policies: Hospitality Establishments
CREATE POLICY "Users can view own establishments" ON hospitality_establishments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own establishments" ON hospitality_establishments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own establishments" ON hospitality_establishments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own establishments" ON hospitality_establishments
    FOR DELETE USING (auth.uid() = user_id);

-- Policies: Rooms (propriétaires peuvent gérer les chambres de leurs établissements)
CREATE POLICY "Owners can view rooms of their establishments" ON hospitality_rooms
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM hospitality_establishments
            WHERE hospitality_establishments.id = hospitality_rooms.establishment_id
            AND hospitality_establishments.user_id = auth.uid()
        )
    );

CREATE POLICY "Owners can manage rooms of their establishments" ON hospitality_rooms
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM hospitality_establishments
            WHERE hospitality_establishments.id = hospitality_rooms.establishment_id
            AND hospitality_establishments.user_id = auth.uid()
        )
    );

-- Policies: Bookings (même logique)
CREATE POLICY "Owners can view bookings of their establishments" ON hospitality_bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM hospitality_establishments
            WHERE hospitality_establishments.id = hospitality_bookings.establishment_id
            AND hospitality_establishments.user_id = auth.uid()
        )
    );

CREATE POLICY "Owners can manage bookings of their establishments" ON hospitality_bookings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM hospitality_establishments
            WHERE hospitality_establishments.id = hospitality_bookings.establishment_id
            AND hospitality_establishments.user_id = auth.uid()
        )
    );

-- Policies: Room Availability (même logique)
CREATE POLICY "Owners can view availability of their rooms" ON hospitality_room_availability
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM hospitality_rooms
            JOIN hospitality_establishments ON hospitality_establishments.id = hospitality_rooms.establishment_id
            WHERE hospitality_rooms.id = hospitality_room_availability.room_id
            AND hospitality_establishments.user_id = auth.uid()
        )
    );

CREATE POLICY "Owners can manage availability of their rooms" ON hospitality_room_availability
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM hospitality_rooms
            JOIN hospitality_establishments ON hospitality_establishments.id = hospitality_rooms.establishment_id
            WHERE hospitality_rooms.id = hospitality_room_availability.room_id
            AND hospitality_establishments.user_id = auth.uid()
        )
    );

-- Policies: Pricing Rules (même logique)
CREATE POLICY "Owners can view pricing rules of their establishments" ON hospitality_pricing_rules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM hospitality_establishments
            WHERE (hospitality_pricing_rules.establishment_id IS NOT NULL 
                AND hospitality_establishments.id = hospitality_pricing_rules.establishment_id
                AND hospitality_establishments.user_id = auth.uid())
            OR EXISTS (
                SELECT 1 FROM hospitality_rooms
                JOIN hospitality_establishments ON hospitality_establishments.id = hospitality_rooms.establishment_id
                WHERE hospitality_rooms.id = hospitality_pricing_rules.room_id
                AND hospitality_establishments.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Owners can manage pricing rules of their establishments" ON hospitality_pricing_rules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM hospitality_establishments
            WHERE (hospitality_pricing_rules.establishment_id IS NOT NULL 
                AND hospitality_establishments.id = hospitality_pricing_rules.establishment_id
                AND hospitality_establishments.user_id = auth.uid())
            OR EXISTS (
                SELECT 1 FROM hospitality_rooms
                JOIN hospitality_establishments ON hospitality_establishments.id = hospitality_rooms.establishment_id
                WHERE hospitality_rooms.id = hospitality_pricing_rules.room_id
                AND hospitality_establishments.user_id = auth.uid()
            )
        )
    );






