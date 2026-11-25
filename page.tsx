export default function Home() {
  return (
    <div className="relative">
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-midnight to-obsidian" />
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-crimson via-violet to-amethyst bg-clip-text text-transparent">
            PrettyKitty’s Playground
          </h1>
          <p className="text-xl md:text-2xl text-silver mb-8 max-w-2xl mx-auto">
            Where imagination runs wild, fantasies come alive, and every story has a little bite.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/create" className="btn-primary text-lg px-8 py-3">Start Creating</a>
            <a href="/discover" className="btn-secondary text-lg px-8 py-3">Explore Characters</a>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="font-serif text-3xl text-center mb-12">Featured Characters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-panel p-5 hover:border-violet/40 transition">
              <div className="aspect-[3/4] bg-midnight rounded-lg mb-4 flex items-center justify-center text-silver">
                Character Art
              </div>
              <h3 className="font-serif text-xl mb-1">Character Name</h3>
              <p className="text-sm text-silver mb-3">by Creator</p>
              <div className="flex gap-2">
                <span className="text-xs bg-crimson/20 text-crimson px-2 py-1 rounded">Dark Romance</span>
                <span className="text-xs bg-amethyst/20 text-violet px-2 py-1 rounded">Fantasy</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
