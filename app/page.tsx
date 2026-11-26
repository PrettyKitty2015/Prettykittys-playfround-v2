'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [profile, setProfile] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      if (prof) setProfile(prof)
    }
    load()
  }, [router])

  return (
    <div style={{ minHeight: '100vh', background: '#09090D', color: '#F2EDF5', padding: '1rem', paddingBottom: '90px' }}>
      <h1 style={{ textAlign: 'center', color: '#A855F7' }}>NightBite</h1>
      <p style={{ textAlign: 'center' }}>Welcome{profile?.username ? `, ${profile.username}` : ''}</p>
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <a href="/create" style={{ color: '#A855F7', margin: '0 1rem' }}>Create</a>
        <a href="/reels" style={{ color: '#A855F7', margin: '0 1rem' }}>Reels</a>
        <a href="/profile" style={{ color: '#A855F7', margin: '0 1rem' }}>Profile</a>
      </div>
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#111116', display: 'flex', justifyContent: 'space-around', padding: '0.8rem 0' }}>
        <a href="/" style={{ color: '#A855F7' }}>Home</a>
        <a href="/create" style={{ color: '#F2EDF5' }}>Create</a>
        <a href="/reels" style={{ color: '#F2EDF5' }}>Reels</a>
        <a href="/chats" style={{ color: '#F2EDF5' }}>Chats</a>
        <a href="/profile" style={{ color: '#F2EDF5' }}>Profile</a>
      </div>
    </div>
  )
}
