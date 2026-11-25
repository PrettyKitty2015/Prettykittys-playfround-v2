export const metadata = {
  title: "PrettyKitty’s Playground",
  description: "Where imagination runs wild",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#09090D', color: '#F2EDF5', margin: 0, fontFamily: 'sans-serif' }}>
        <nav style={{ padding: '1rem', borderBottom: '1px solid #333', marginBottom: '2rem' }}>
          <a href="/" style={{ color: '#9E092B', fontSize: '1.25rem', textDecoration: 'none' }}>
            PrettyKitty’s Playground
          </a>
        </nav>
        <main style={{ padding: '1rem' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
