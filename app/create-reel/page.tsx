'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CreateReel() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [seriesTitle, setSeriesTitle] = useState('')
  const [episode, setEpisode] = useState(1)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbFile, setThumbFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const router = useRouter()

  async function upload() {
    if (!videoFile) return setMessage('Please choose a video')
    setMessage(`File: ${videoFile.name} | Size: ${(videoFile.size / 1024 / 1024).toFixed(2)} MB | Type: ${videoFile.type}`)
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return router.push('/login')

    const videoName = `${Date.now()}-${videoFile.name.replace(/\s/g, '_')}`
    const { error: videoError, data } = await supabase.storage
      .from('character-images')
      .upload(videoName, videoFile, {
        contentType: videoFile.type || 'video/mp4',
        upsert: true
      })

    if (videoError) {
      return setMessage(`Upload failed: ${videoError.message}`)
    }

    const { data: videoUrl } = supabase.storage.from('character-images').getPublicUrl(videoName)

    let thumbUrl = null
    if (thumbFile) {
      const thumbName = `${Date.now()}-thumb-${thumbFile.name}`
      await supabase.storage.from('character-images').upload(thumbName, thumbFile)
      const { data: t } = supabase.storage.from('character-images').getPublicUrl(thumbName)
      thumbUrl = t.publicUrl
    }

    const { error } = await supabase.from('reels').insert({
      creator_id: session.user.id,
      title,
      description,
      series_title: seriesTitle || null,
      episode_number: episode,
      video_url: videoUrl.publicUrl,
      thumbnail_url: thumbUrl
    })

    if (error) setMessage(error.message)
    else {
      setMessage('Reel created!')
      setTimeout(() => router.push('/reels'), 1000)
    }
  }

  return (
    <div style={{ minHeight: '100vh', color: '#F2EDF5', padding: '1.5rem', paddingBottom: '90px' }}>
      <h1 style={{ color: '#A855F7' }}>Create Reel</h1>
      <input placeholder="Episode Title" value={title} onChange={e => setTitle(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem' }} />
      <input placeholder="Series Title (optional)" value={seriesTitle} onChange={e => setSeriesTitle(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem' }} />
      <input type="number" placeholder="Episode Number" value={episode} onChange={e => setEpisode(Number(e.target.value))}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem' }} />
      <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem', minHeight: '80px' }} />
      <label style={{ fontSize: '0.85rem', opacity: 0.8 }}>Video</label>
      <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files?.[0] || null)} style={{ margin: '0.5rem 0', color: '#F2EDF5' }} />
      <label style={{ fontSize: '0.85rem', opacity: 0.8 }}>Thumbnail (optional)</label>
      <input type="file" accept="image/*" onChange={e => setThumbFile(e.target.files?.[0] || null)} style={{ margin: '0.5rem 0', color: '#F2EDF5' }} />
      <button onClick={upload} style={{ width: '100%', padding: '0.75rem', background: '#9E092B', color: '#fff', border: 'none', borderRadius: '0.5rem', marginTop: '1rem' }}>
        Upload Reel
      </button>
      {message && <p style={{ marginTop: '1rem', color: '#A855F7', whiteSpace: 'pre-wrap' }}>{message}</p>}
    </div>
  )
}
