import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "PrettyKitty’s Playground",
  description: "Where imagination runs wild, fantasies come alive, and every story has a little bite.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-obsidian text-ivory min-h-screen">
        <nav className="border-b border-silver/10 bg-midnight/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="font-serif text-xl text-crimson">PrettyKitty’s Playground</a>
            <div className="flex gap-6 text-sm">
              <a href="/discover" className="hover:text-violet">Discover</a>
              <a href="/create" className="hover:text-violet">Create</a>
              <a href="/library" className="hover:text-violet">Library</a>
              <a href="/login" className="hover:text-violet">Login</a>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}
