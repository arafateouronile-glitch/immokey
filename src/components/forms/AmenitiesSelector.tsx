import { useState } from 'react'
import { Check } from 'lucide-react'

export interface Amenity {
  id: string
  label: string
  icon?: string
}

const AVAILABLE_AMENITIES: Amenity[] = [
  { id: 'parking', label: 'Parking' },
  { id: 'gardien', label: 'Gardien' },
  { id: 'climatisation', label: 'Climatisation' },
  { id: 'chauffage', label: 'Chauffage' },
  { id: 'ascenseur', label: 'Ascenseur' },
  { id: 'balcon', label: 'Balcon' },
  { id: 'terrasse', label: 'Terrasse' },
  { id: 'jardin', label: 'Jardin' },
  { id: 'piscine', label: 'Piscine' },
  { id: 'eau_courante', label: 'Eau courante' },
  { id: 'electricite', label: 'Électricité' },
  { id: 'internet', label: 'Internet/WiFi' },
  { id: 'meuble', label: 'Meublé' },
  { id: 'securite', label: 'Système de sécurité' },
  { id: 'generateur', label: 'Générateur' },
]

interface AmenitiesSelectorProps {
  selectedAmenities: string[]
  onAmenitiesChange: (amenities: string[]) => void
  error?: string
}

export default function AmenitiesSelector({
  selectedAmenities,
  onAmenitiesChange,
  error,
}: AmenitiesSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredAmenities = AVAILABLE_AMENITIES.filter((amenity) =>
    amenity.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleAmenity = (amenityId: string) => {
    if (selectedAmenities.includes(amenityId)) {
      onAmenitiesChange(selectedAmenities.filter((id) => id !== amenityId))
    } else {
      onAmenitiesChange([...selectedAmenities, amenityId])
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Équipements
      </label>

      {/* Recherche */}
      <input
        type="text"
        placeholder="Rechercher un équipement..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="input-field mb-4"
      />

      {/* Liste des équipements */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredAmenities.map((amenity) => {
          const isSelected = selectedAmenities.includes(amenity.id)
          return (
            <button
              key={amenity.id}
              type="button"
              onClick={() => toggleAmenity(amenity.id)}
              className={`
                p-3 rounded-lg border-2 transition-all text-left
                ${
                  isSelected
                    ? 'border-primary-600 bg-primary-50 text-primary-900'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{amenity.label}</span>
                {isSelected && (
                  <Check size={18} className="text-primary-600 flex-shrink-0 ml-2" />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {filteredAmenities.length === 0 && (
        <p className="text-sm text-gray-500 mt-2">
          Aucun équipement trouvé pour "{searchQuery}"
        </p>
      )}

      {selectedAmenities.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">
            {selectedAmenities.length} équipement{selectedAmenities.length > 1 ? 's' : ''}{' '}
            sélectionné{selectedAmenities.length > 1 ? 's' : ''}
          </p>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}





