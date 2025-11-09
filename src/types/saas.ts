export interface Organization {
  id: string
  name: string
  slug: string
  owner_id: string
  plan: 'free' | 'starter' | 'professional' | 'enterprise'
  created_at: string
  updated_at: string
}

export interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  created_at: string
  updated_at: string
}

export interface OrganizationInvitation {
  id: string
  organization_id: string
  email: string
  role: 'admin' | 'member'
  token: string
  status: 'pending' | 'accepted' | 'expired'
  created_at: string
  expires_at: string
}

export interface CreateOrganizationData {
  name: string
  slug: string
  plan?: 'free' | 'starter' | 'professional' | 'enterprise'
}

export interface UpdateOrganizationData {
  name?: string
  slug?: string
  plan?: 'free' | 'starter' | 'professional' | 'enterprise'
}

export interface InviteMemberData {
  organization_id: string
  email: string
  role: 'admin' | 'member'
}
