import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: "PrettyKitty’s Playground",
  description: "Where imagination runs wild, fantasies come alive, and every story has a little bite.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-obsidian text-ivory">
        <nav className="border-b border-silver/10 bg-midnight/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-crimson to-amethyst flex items-center justify-center text-xs font-bold">
                  PK
                </div>
                <span className="font-serif text-xl tracking-wide">PrettyKitty’s Playground</span>
              </div>
              <div className="hidden md:flex gap-8 text-sm">
                <a href="/" className="hover:text-violet transition">Home</a>
                <a href="/discover" className="hover:text-violet transition">Discover</a>
                <a href="/create" className="hover:text-violet transition">Create</a>
                <a href="/story" className="hover:text-violet transition">Story</a>
                <a href="/library" className="hover:text-violet transition">Library</a>
                <a href="/persona" className="hover:text-violet transition">Persona</a>
                <a href="/chat" className="hover:text-violet transition">Chats</a>
              </div>
              <div className="flex gap-3">
                <a href="/login" className="btn-secondary text-sm px-4 py-1.5">Sign In</a>
                <a href="/register" className="btn-primary text-sm px-4 py-1.5">Join</a>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="border-t border-silver/10 mt-20 py-8 text-center text-silver text-sm">
          PrettyKitty’s Playground — Where imagination runs wild, fantasies come alive, and every story has a little bite.
        </footer>
      </body>
    </html>
  );
}
