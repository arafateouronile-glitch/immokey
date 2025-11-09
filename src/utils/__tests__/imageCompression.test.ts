import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  compressImage,
  compressImages,
  shouldCompress,
  validateImageFile,
} from '../imageCompression'

// Mock FileReader
class MockFileReader {
  result: string | null = null
  onload: ((e: any) => void) | null = null
  onerror: (() => void) | null = null

  readAsDataURL() {
    // Simuler un résultat après un court délai
    setTimeout(() => {
      if (this.onload) {
        this.onload({ target: { result: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==' } })
      }
    }, 0)
  }
}

// Mock Image
class MockImage {
  width = 3000
  height = 2000
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  src = ''

  constructor() {
    // Simuler le chargement après un court délai
    setTimeout(() => {
      if (this.onload) {
        this.onload()
      }
    }, 0)
  }
}

// Mock canvas
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: vi.fn(() => ({
    drawImage: vi.fn(),
  })),
  toBlob: vi.fn((callback: (blob: Blob | null) => void) => {
    // Simuler un blob
    const blob = new Blob(['image data'], { type: 'image/jpeg' })
    callback(blob)
  }),
}

// Mock document.createElement pour canvas
const originalCreateElement = document.createElement.bind(document)
document.createElement = vi.fn((tagName: string) => {
  if (tagName === 'canvas') {
    return mockCanvas as any
  }
  return originalCreateElement(tagName)
})

describe('imageCompression', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.FileReader = MockFileReader as any
    global.Image = MockImage as any
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  describe('validateImageFile', () => {
    it('should validate valid image file', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      Object.defineProperty(file, 'size', { value: 500000 }) // 500KB

      const result = validateImageFile(file)

      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject invalid MIME type', () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      Object.defineProperty(file, 'size', { value: 500000 })

      const result = validateImageFile(file)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('non supporté')
    })

    it('should reject files that are too large', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 }) // 11MB

      const result = validateImageFile(file)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('trop grande')
    })

    it('should reject files that are too small', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      Object.defineProperty(file, 'size', { value: 500 }) // < 1KB

      const result = validateImageFile(file)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('trop petit')
    })

    it('should accept various image formats', () => {
      const formats = [
        { type: 'image/jpeg', name: 'test.jpg' },
        { type: 'image/png', name: 'test.png' },
        { type: 'image/webp', name: 'test.webp' },
        { type: 'image/gif', name: 'test.gif' },
      ]

      formats.forEach(({ type, name }) => {
        const file = new File(['test'], name, { type })
        Object.defineProperty(file, 'size', { value: 500000 })
        expect(validateImageFile(file).valid).toBe(true)
      })
    })
  })

  describe('shouldCompress', () => {
    it('should return true for files exceeding max size', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      Object.defineProperty(file, 'size', { value: 2 * 1024 * 1024 }) // 2MB

      expect(shouldCompress(file, 1)).toBe(true)
    })

    it('should return false for files under max size', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      Object.defineProperty(file, 'size', { value: 500 * 1024 }) // 500KB

      expect(shouldCompress(file, 1)).toBe(false)
    })

    it('should use custom max size', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      Object.defineProperty(file, 'size', { value: 1.5 * 1024 * 1024 }) // 1.5MB

      expect(shouldCompress(file, 2)).toBe(false)
      expect(shouldCompress(file, 1)).toBe(true)
    })
  })

  describe('compressImage', () => {
    // Note: Les tests de compression nécessitent un environnement DOM complet
    // et sont mieux testés avec des tests E2E ou d'intégration
    // On teste ici uniquement que la fonction gère les erreurs correctement
    
    it('should handle FileReader errors gracefully', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      Object.defineProperty(file, 'size', { value: 500000 })

      // Mock FileReader to trigger error
      const mockReader = new MockFileReader()
      mockReader.readAsDataURL = function () {
        setTimeout(() => {
          if (this.onerror) {
            this.onerror()
          }
        }, 10)
      }
      global.FileReader = vi.fn(() => mockReader) as any

      await expect(compressImage(file)).rejects.toThrow()
    })
  })

  describe('compressImages', () => {
    it('should return original file if compression fails', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      Object.defineProperty(file, 'size', { value: 500000 })

      // Mock compression to fail by mocking compressImage
      const imageCompressionModule = await import('../imageCompression')
      const compressImageSpy = vi.spyOn(imageCompressionModule, 'compressImage')
        .mockRejectedValueOnce(new Error('Compression failed'))

      const results = await compressImages([file])

      expect(results).toHaveLength(1)
      expect(results[0]).toBeInstanceOf(File)
      expect(results[0].name).toBe(file.name)
      // File should be returned as fallback when compression fails
      
      compressImageSpy.mockRestore()
    })

    it('should handle mixed success and failure', async () => {
      const files = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
      ]
      files.forEach((file) => {
        Object.defineProperty(file, 'size', { value: 500000 })
      })

      // Create a compressed file mock
      const compressedFile = new File(['compressed'], 'test1.jpg', { type: 'image/jpeg' })

      // Mock first to succeed, second to fail
      const imageCompressionModule = await import('../imageCompression')
      const compressImageSpy = vi.spyOn(imageCompressionModule, 'compressImage')
        .mockResolvedValueOnce(compressedFile) // First succeeds
        .mockRejectedValueOnce(new Error('Failed')) // Second fails

      const results = await compressImages(files)

      expect(results).toHaveLength(2)
      // First should be the compressed file (mocked)
      expect(results[0]).toBeInstanceOf(File)
      expect(results[0].name).toBe('test1.jpg')
      // Second should be original file (fallback on error)
      expect(results[1]).toBeInstanceOf(File)
      expect(results[1].name).toBe('test2.jpg')

      compressImageSpy.mockRestore()
    })
  })
})

