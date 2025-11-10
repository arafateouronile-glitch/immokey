import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type {
  HospitalityRoom,
  CreateRoomData,
} from '@/types/hospitality'

/**
 * Récupérer toutes les chambres d'un établissement
 */
export async function getRooms(establishmentId: string): Promise<HospitalityRoom[]> {
  if (!isSupabaseConfigured) {
    return []
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')

  const normalizeImageUrl = (value: string) => {
    if (!value || typeof value !== 'string') {
      return value
    }

    if (value.startsWith('http')) {
      return value
    }

    if (!supabaseUrl) {
      return value
    }

    const cleanedPath = value.replace(/^public\//, '').replace(/^storage\/v1\/object\/public\//, '')
    return `${supabaseUrl}/storage/v1/object/public/${cleanedPath}`
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Vous devez être connecté')
    }

    // Vérifier que l'établissement appartient à l'utilisateur
    const { data: establishment, error: checkError } = await supabase
      .from('hospitality_establishments')
      .select('id')
      .eq('id', establishmentId)
      .eq('user_id', user.id)
      .single()

    if (checkError) throw checkError
    if (!establishment) {
      throw new Error('Établissement non trouvé ou non autorisé')
    }

    const { data, error } = await supabase
      .from('hospitality_rooms')
      .select('*')
      .eq('establishment_id', establishmentId)
      .neq('status', 'inactive')
      .order('room_number', { ascending: true })

    if (error) throw error

    const normalizeArray = (value: any) => {
      if (Array.isArray(value)) {
        return value
      }
      if (value === null || value === undefined) {
        return []
      }
      return [value]
    }

    return (data || []).map((room: any) => ({
      ...room,
      amenities: normalizeArray(room.amenities),
      photo_urls: normalizeArray(room.photo_urls).map((url: string) => normalizeImageUrl(url)),
    })) as HospitalityRoom[]
  } catch (error: any) {
    console.error('Error fetching rooms:', error)
    throw error
  }
}

/**
 * Récupérer une chambre par ID
 */
export async function getRoom(id: string): Promise<HospitalityRoom> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase non configuré')
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Vous devez être connecté')
    }

    const { data, error } = await supabase
      .from('hospitality_rooms')
      .select('*, hospitality_establishments!inner(user_id)')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) throw new Error('Chambre non trouvée')

    // Vérifier que l'établissement appartient à l'utilisateur
    const establishment = data.hospitality_establishments as any
    if (establishment.user_id !== user.id) {
      throw new Error('Vous n\'êtes pas autorisé à voir cette chambre')
    }

    // Retirer l'établissement des données retournées
    const { hospitality_establishments, ...roomData } = data
    return roomData
  } catch (error: any) {
    console.error('Error fetching room:', error)
    throw error
  }
}

/**
 * Créer une nouvelle chambre
 */
export async function createRoom(
  data: CreateRoomData
): Promise<HospitalityRoom> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase non configuré')
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Vous devez être connecté')
    }

    // Vérifier que l'établissement appartient à l'utilisateur
    const { data: establishment, error: checkError } = await supabase
      .from('hospitality_establishments')
      .select('id')
      .eq('id', data.establishment_id)
      .eq('user_id', user.id)
      .single()

    if (checkError) throw checkError
    if (!establishment) {
      throw new Error('Établissement non trouvé ou non autorisé')
    }

    const { data: room, error } = await supabase
      .from('hospitality_rooms')
      .insert({
        ...data,
        status: 'active',
        photo_urls: data.photo_urls || [],
        amenities: data.amenities || [],
        currency: data.currency || 'FCFA',
      })
      .select()
      .single()

    if (error) throw error
    return room
  } catch (error: any) {
    console.error('Error creating room:', error)
    throw error
  }
}

/**
 * Mettre à jour une chambre
 */
export async function updateRoom(
  id: string,
  updates: Partial<CreateRoomData>
): Promise<HospitalityRoom> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase non configuré')
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Vous devez être connecté')
    }

    // Vérifier que la chambre appartient à l'utilisateur
    const { data: existing, error: checkError } = await supabase
      .from('hospitality_rooms')
      .select('establishment_id, hospitality_establishments!inner(user_id)')
      .eq('id', id)
      .single()

    if (checkError) throw checkError
    if (!existing) throw new Error('Chambre non trouvée')

    const establishment = (existing as any).hospitality_establishments
    if (establishment.user_id !== user.id) {
      throw new Error('Vous n\'êtes pas autorisé à modifier cette chambre')
    }

    const { data, error } = await supabase
      .from('hospitality_rooms')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error: any) {
    console.error('Error updating room:', error)
    throw error
  }
}

/**
 * Supprimer/désactiver une chambre
 */
export async function deleteRoom(id: string): Promise<void> {
  await updateRoom(id, { status: 'inactive' } as any)
}

/**
 * Récupérer les statistiques des chambres d'un établissement
 */
export async function getRoomsStats(establishmentId: string) {
  if (!isSupabaseConfigured) {
    return {
      total: 0,
      active: 0,
      maintenance: 0,
      inactive: 0,
    }
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Vous devez être connecté')
    }

    const { data, error } = await supabase
      .from('hospitality_rooms')
      .select('status')
      .eq('establishment_id', establishmentId)

    if (error) throw error

    const stats = {
      total: data?.length || 0,
      active: data?.filter((r) => r.status === 'active').length || 0,
      maintenance: data?.filter((r) => r.status === 'maintenance').length || 0,
      inactive: data?.filter((r) => r.status === 'inactive').length || 0,
    }

    return stats
  } catch (error: any) {
    console.error('Error fetching rooms stats:', error)
    return {
      total: 0,
      active: 0,
      maintenance: 0,
      inactive: 0,
    }
  }
}






