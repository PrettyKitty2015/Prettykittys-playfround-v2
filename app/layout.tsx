import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "PrettyKitty’s Playground",
  description: "Where imagination runs wild",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", background: '#09090D' }}>
        {children}
      </body>
    </html>
  )
}
