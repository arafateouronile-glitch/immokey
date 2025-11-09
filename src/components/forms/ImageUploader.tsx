import { useState } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { uploadImages, deleteImage } from '@/services/imageService'
import toast from 'react-hot-toast'

interface ImageUploaderProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  bucket?: string
}

export default function ImageUploader({
  images,
  onImagesChange,
  maxImages = 5,
  bucket = 'listings'
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (files.length + images.length > maxImages) {
      toast.error(`Vous ne pouvez ajouter que ${maxImages} images maximum`)
      return
    }

    setUploading(true)
    try {
      const urls = await uploadImages(files, bucket)
      onImagesChange([...images, ...urls])
      toast.success('Images ajoutées avec succès')
    } catch (error) {
      console.error('Error uploading images:', error)
      toast.error('Erreur lors de l\'ajout des images')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = async (index: number) => {
    const imageUrl = images[index]
    try {
      await deleteImage(imageUrl, bucket)
      const newImages = images.filter((_, i) => i !== index)
      onImagesChange(newImages)
      toast.success('Image supprimée')
    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((url, index) => (
          <div key={index} className="relative group aspect-square">
            <img
              src={url}
              alt={`Image ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(index)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        
        {images.length < maxImages && (
          <label className="aspect-square border-2 border-dashed border-neutral-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
            {uploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-neutral-400 mb-2" />
                <span className="text-sm text-neutral-500">Ajouter des images</span>
              </>
            )}
          </label>
        )}
      </div>
      
      <p className="text-sm text-neutral-500">
        {images.length} / {maxImages} images
      </p>
    </div>
  )
}
