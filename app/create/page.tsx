'use client'
import { useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Cropper from 'react-easy-crop'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CreateCharacter() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [personality, setPersonality] = useState('')
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader()
      reader.addEventListener('load', () => setImageSrc(reader.result as string))
      reader.readAsDataURL(e.target.files[0])
    }
  }

  async function getCroppedImg() {
    if (!imageSrc || !croppedAreaPixels) return null
    const image = new Image()
    image.src = imageSrc
    await new Promise(resolve => image.onload = resolve)

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    canvas.width = croppedAreaPixels.width
    canvas.height = croppedAreaPixels.height

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    )

    return new Promise<Blob | null>(resolve => {
      canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.9)
    })
  }

  async function saveCharacter() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return setMessage('Please log in first')

    let imageUrl = null
    const croppedBlob = await getCroppedImg()

    if (croppedBlob) {
      const fileName = `${user.id}-${Date.now()}.jpg`
      const { error: uploadError } = await supabase.storage
        .from('character-images')
        .upload(fileName, croppedBlob)

      if (uploadError) return setMessage(uploadError.message)

      const { data } = supabase.storage.from('character-images').getPublicUrl(fileName)
      imageUrl = data.publicUrl
    }

    const { error } = await supabase.from('characters').insert({
      name,
      description,
      personality,
      creator_id: user.id,
      image_url: imageUrl
    })

    if (error) setMessage(error.message)
    else {
      setMessage('Character created!')
      setTimeout(() => router.push('/'), 1500)
    }
  }

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '1rem' }}>
      <h1 style={{ color: '#9E092B' }}>Create Character</h1>
      <input placeholder="Character Name" value={name} onChange={e => setName(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem' }} />
      <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem', minHeight: '80px' }} />
      <textarea placeholder="Personality" value={personality} onChange={e => setPersonality(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem', minHeight: '80px' }} />

      <input type="file" accept="image/*" onChange={onFileChange} style={{ margin: '1rem 0', color: '#F2EDF5' }} />

      {imageSrc && (
        <div style={{ position: 'relative', width: '100%', height: '300px', margin: '1rem 0' }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={3 / 4}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
      )}

      <button onClick={saveCharacter}
        style={{ width: '100%', padding: '0.75rem', background: '#9E092B', color: '#fff', border: 'none', borderRadius: '0.5rem', marginTop: '1rem' }}>
        Save Character
      </button>
      {message && <p style={{ marginTop: '1rem', color: '#A855F7' }}>{message}</p>}
    </div>
  )
}
