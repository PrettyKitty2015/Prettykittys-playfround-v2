import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NightBite',
  description: 'Where imagination runs wild',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#09090D' }}>
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: -1,
            opacity: 0.45
          }}
        >
          <source src="https://apbydthwsxupxsqdumzl.supabase.co/storage/v1/object/public/character-images/im8fw.mp4" type="video/mp4" />
        </video>
        <div style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </div>
      </body>
    </html>
  )
}
