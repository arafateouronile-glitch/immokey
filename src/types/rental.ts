// Types pour le module de gestion locative

export interface ManagedProperty {
  id: string
  user_id: string
  listing_id?: string
  
  // Informations du bien
  name: string
  address: string
  property_type: string
  rooms?: number
  surface_area?: number
  
  // Informations financières
  monthly_rent: number
  charges: number
  deposit: number
  
  // Statut
  status: 'vacant' | 'occupied' | 'archived'
  
  // Métadonnées
  acquisition_date?: string
  photo_url?: string
  notes?: string
  
  created_at: string
  updated_at: string
  
  // Relations (optionnelles)
  current_tenant?: Tenant
  tenant_count?: number
}

export interface Tenant {
  id: string
  managed_property_id: string
  
  // Informations personnelles
  full_name: string
  email: string
  phone: string
  id_type?: string
  id_number?: string
  photo_url?: string
  
  // Informations de location
  lease_start_date: string
  lease_end_date?: string
  monthly_rent: number
  due_day: number
  
  // Paiement initial
  deposit_paid: number
  first_rent_paid: boolean
  
  // Espace locataire
  tenant_space_enabled: boolean
  tenant_user_id?: string
  
  // Statut
  status: 'active' | 'inactive' | 'terminated'
  
  // Métadonnées
  notes?: string
  
  created_at: string
  updated_at: string
  
  // Relations (optionnelles)
  managed_property?: ManagedProperty
  current_due_dates?: PaymentDueDate[]
}

export interface PaymentDueDate {
  id: string
  tenant_id: string
  managed_property_id: string
  
  // Période
  period_month: number
  period_year: number
  
  // Montants
  rent_amount: number
  charges_amount: number
  total_amount: number
  
  // Échéance
  due_date: string
  
  // Statut
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  
  // Avis d'échéance
  notice_sent_at?: string
  notice_reference?: string
  
  created_at: string
  updated_at: string
  
  // Relations (optionnelles)
  tenant?: Tenant
  payments?: Payment[]
}

export interface Payment {
  id: string
  tenant_id: string
  managed_property_id: string
  due_date_id?: string
  
  // Période concernée
  period_month: number
  period_year: number
  
  // Paiement
  amount: number
  payment_date: string
  payment_method: 'cash' | 'bank_transfer' | 'mobile_money' | 'check' | 'other'
  transaction_reference?: string
  
  // Documents
  receipt_url?: string
  receipt_reference?: string
  
  // Métadonnées
  notes?: string
  recorded_by?: string
  
  created_at: string
  updated_at: string
  
  // Relations (optionnelles)
  tenant?: Tenant
  due_date?: PaymentDueDate
}

export interface PaymentReminder {
  id: string
  tenant_id: string
  due_date_id?: string
  
  // Type de relance
  reminder_type: 'manual' | 'auto_3_days' | 'auto_7_days' | 'auto_15_days'
  reminder_level: number
  
  // Message
  message: string
  
  // Envoi
  sent_via: string[]
  sent_at: string
  
  // Métadonnées
  sent_by?: string
  
  created_at: string
}

export interface RentalDocument {
  id: string
  managed_property_id?: string
  tenant_id?: string
  
  // Document
  name: string
  document_type: 'contract' | 'entry_inventory' | 'exit_inventory' | 'tenant_id' | 'receipt' | 'invoice' | 'correspondence' | 'other'
  file_url: string
  file_size?: number
  mime_type?: string
  
  // Métadonnées
  description?: string
  uploaded_by?: string
  
  // Partage
  shared_with_tenant: boolean
  
  created_at: string
  updated_at: string
}

export interface RentalMessage {
  id: string
  managed_property_id: string
  tenant_id: string
  
  // Message
  sender_type: 'owner' | 'tenant'
  sender_id: string
  message: string
  
  // Fichiers joints
  attachments: string[]
  
  // Statut
  read: boolean
  read_at?: string
  
  created_at: string
}

// Types pour les formulaires
export interface CreateManagedPropertyData {
  listing_id?: string
  name: string
  address: string
  property_type: string
  rooms?: number
  surface_area?: number
  monthly_rent: number
  charges?: number
  deposit?: number
  acquisition_date?: string
  photo_url?: string
  notes?: string
}

export interface CreateTenantData {
  managed_property_id: string
  full_name: string
  email: string
  phone: string
  id_type?: string
  id_number?: string
  photo_url?: string
  lease_start_date: string
  lease_end_date?: string
  monthly_rent: number
  due_day: number
  deposit_paid?: number
  first_rent_paid?: boolean
  tenant_space_enabled?: boolean
  notes?: string
}

export interface CreatePaymentDueDateData {
  tenant_id: string
  managed_property_id: string
  period_month: number
  period_year: number
  rent_amount: number
  charges_amount?: number
  due_date: string
}

export interface CreatePaymentData {
  tenant_id: string
  managed_property_id: string
  due_date_id?: string
  period_month: number
  period_year: number
  amount: number
  payment_date: string
  payment_method: 'cash' | 'bank_transfer' | 'mobile_money' | 'check' | 'other'
  transaction_reference?: string
  notes?: string
  send_receipt?: boolean
}

// Types pour les statistiques du dashboard
export interface RentalDashboardStats {
  total_properties: number
  occupied_properties: number
  vacant_properties: number
  total_tenants: number
  expected_rent_this_month: number
  collected_rent_this_month: number
  overdue_count: number
  occupancy_rate: number
  collection_rate: number
}





