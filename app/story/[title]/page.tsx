'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useParams, useRouter } from 'next/navigation'
import Cropper from 'react-easy-crop'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function StoryPage() {
  const params = useParams()
  const title = decodeURIComponent(params.title as string)
  const [characters, setCharacters] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const router = useRouter()

  async function load() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      if (prof) setProfile(prof)
    }
    const { data } = await supabase.from('characters').select('*').eq('story_title', title)
    if (data) {
      setCharacters(data)
      const cover = data.find(c => c.story_cover_url)?.story_cover_url
      if (cover) setCoverUrl(cover)
    }
  }

  useEffect(() => { load() }, [title])

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
    const ctx = canvas.getContext('2d')!
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

    return new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg'))
  }

  async function saveCover() {
    if (!profile) return
    const blob = await getCroppedImg()
    if (!blob) return
    const fileName = `${Date.now()}-cover.jpg`
    const { error } = await supabase.storage.from('character-images').upload(fileName, blob, { contentType: 'image/jpeg' })
    if (error) return
    const { data } = supabase.storage.from('character-images').getPublicUrl(fileName)
    await supabase.from('characters').update({ story_cover_url: data.publicUrl }).eq('story_title', title).eq('creator_id', profile.id)
    setCoverUrl(data.publicUrl)
    setImageSrc(null)
  }

  return (
    <div style={{ minHeight: '100vh', color: '#F2EDF5', padding: '1rem', paddingBottom: '90px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#A855F7', fontSize: '1.4rem', marginRight: '0.5rem' }}>←</button>
        <h1 style={{ color: '#A855F7', margin: 0 }}>{title}</h1>
      </div>

      {coverUrl && !imageSrc && <img src={coverUrl} alt="Cover" style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', borderRadius: '12px', marginBottom: '0.8rem' }} />}

      {imageSrc && (
        <div style={{ position: 'relative', width: '100%', height: '380px', marginBottom: '1rem' }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={16 / 9}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
      )}

      {profile && (
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ color: '#A855F7', fontSize: '0.85rem', marginRight: '1rem' }}>
            Change Cover
            <input type="file" accept="image/*" onChange={onFileChange} style={{ display: 'none' }} />
          </label>
          {imageSrc && (
            <button onClick={saveCover} style={{ background: '#9E092B', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '8px' }}>
              Save Crop
            </button>
          )}
        </div>
      )}

      <a href={`/story-chat/${encodeURIComponent(title)}`} style={{ display: 'inline-block', marginBottom: '1.2rem', background: '#9E092B', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '20px', textDecoration: 'none' }}>
        Start Story Chat
      </a>

      <h2 style={{ fontSize: '1.1rem', marginBottom: '0.8rem' }}>Characters</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '0.8rem' }}>
        {characters.map(char => (
          <a key={char.id} href={char.creator_id === profile?.id ? `/edit/${char.id}` : `/character/${char.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ background: 'rgba(21,18,25,0.55)', borderRadius: '14px', overflow: 'hidden' }}>
              {char.image_url && <img src={char.image_url} alt="" style={{ width: '100%', height: '280px', objectFit: 'cover', objectPosition: 'top' }} />}
              <div style={{ padding: '0.55rem' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{char.name}</div>
                {char.creator_id === profile?.id && <div style={{ fontSize: '0.7rem', color: '#A855F7' }}>Edit</div>}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
