import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NightBite',
  description: 'Where imagination runs wild',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#09090D', color: '#F2EDF5', minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  )
}
